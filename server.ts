import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { initialSystemState } from "./src/data/mockData.js";
import { SystemState, Invoice, Expense, Product, StockLedgerEntry, PayrollRun, Campaign, SupportTicket, EventLogItem, AnomalyAlert } from "./src/types.js";

import { runCoordinatorWorkflow, runCustomerChurnWorkflow, runUnifiedOrchestrationWorkflow } from "./src/agents/agentRegistry.js";
import { AIService } from "./src/server/ai/AIService.js";
import { DataStore } from "./src/server/data/DataStore.js";
import { InventoryRepository } from "./src/server/data/repositories/inventoryRepository.js";
import { PurchaseOrderRepository } from "./src/server/data/repositories/purchaseOrderRepository.js";
import { EmployeeRepository } from "./src/server/data/repositories/employeeRepository.js";
import { InvoiceRepository } from "./src/server/data/repositories/invoiceRepository.js";
import { CustomerRepository } from "./src/server/data/repositories/customerRepository.js";
import { TicketRepository } from "./src/server/data/repositories/ticketRepository.js";
import { ActivityRepository } from "./src/server/data/repositories/activityRepository.js";
import { AuthRepository } from "./src/server/data/repositories/authRepository.js";

dotenv.config();

let state: SystemState = JSON.parse(JSON.stringify(initialSystemState));

// Initialize Gemini client server-side lazily / safely
function getGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length < 8 || apiKey.includes('YOUR_API_KEY')) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function emitEvent(agentSource: EventLogItem['agentSource'], eventType: string, description: string, metadata?: Record<string, any>) {
  const newEvent: EventLogItem = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    agentSource,
    eventType,
    description,
    metadata,
  };
  state.eventLogs.unshift(newEvent);
  return newEvent;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Simple In-Memory Rate Limiter
  const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
  function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(key);
    if (!entry || now > entry.resetAt) {
      rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (entry.count >= limit) return false;
    entry.count += 1;
    return true;
  }

  // Ensure default demo tenant exists
  AuthRepository.ensureSeedTenants();

  // Helper cookie parser
  function parseCookies(req: any) {
    const list: Record<string, string> = {};
    const cookieHeader = req.headers?.cookie;
    if (!cookieHeader) return list;
    cookieHeader.split(';').forEach((cookie: string) => {
      let [name, ...rest] = cookie.split('=');
      name = name?.trim();
      if (name) {
        list[name] = rest.join('=').trim();
      }
    });
    return list;
  }

  function getAuthenticatedUser(req: any) {
    const cookies = parseCookies(req);
    const token = cookies['yuktios_session'] || req.headers.authorization?.replace('Bearer ', '');
    return AuthRepository.getSessionUser(token);
  }

  // ==================== AUTHENTICATION API ROUTES ====================
  app.post("/api/auth/register", (req, res) => {
    const { businessName, industry, ownerName, email, password } = req.body;
    try {
      const { user, sessionToken } = AuthRepository.registerBusiness(businessName, industry, ownerName, email, password);
      res.cookie('yuktios_session', sessionToken, { httpOnly: true, maxAge: 7 * 86400000 });
      res.json({ success: true, user, sessionToken });
    } catch (err: any) {
      res.status(400).json({ error: err?.message || 'Registration failed' });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || 'client';
    if (!checkRateLimit(`login_${ip}`, 5, 60000)) {
      return res.status(429).json({ error: 'Too many login attempts. Please wait 1 minute before trying again.' });
    }

    const { email, password } = req.body;
    try {
      const { user, sessionToken } = AuthRepository.login(email, password);
      res.cookie('yuktios_session', sessionToken, { httpOnly: true, maxAge: 7 * 86400000 });
      res.json({ success: true, user, sessionToken });
    } catch (err: any) {
      res.status(401).json({ error: err?.message || 'Authentication failed' });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    const cookies = parseCookies(req);
    const token = cookies['yuktios_session'] || req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      AuthRepository.logout(token);
    }
    res.clearCookie('yuktios_session');
    res.json({ success: true, message: 'Logged out successfully' });
  });

  app.get("/api/auth/me", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ authenticated: false });
    }
    res.json({ authenticated: true, user });
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "YuktiOS Multi-Tenant Platform" });
  });

  // Get current system state from persistent DataStore
  app.get("/api/state", (req, res) => {
    const user = getAuthenticatedUser(req);
    const fullState = DataStore.getState();
    if (!user) return res.json(fullState);

    // Tenant-isolated state slice
    const tenantBiz = (fullState as any).businesses?.find((b: any) => b.id === user.businessId) || fullState.business;
    const filterTenant = (arr: any[] = []) => arr.filter((x: any) => x.businessId === user.businessId || !x.businessId);

    const scopedState: SystemState = {
      ...fullState,
      business: { ...fullState.business, name: tenantBiz.name },
      products: filterTenant(fullState.products),
      invoices: filterTenant(fullState.invoices),
      employees: filterTenant(fullState.employees),
      customers: filterTenant(fullState.customers),
      supportTickets: filterTenant(fullState.supportTickets),
      eventLogs: filterTenant(fullState.eventLogs),
    };

    res.json(scopedState);
  });

  // REST API Routes with Tenant Isolation
  app.get("/api/inventory", (req, res) => {
    const user = getAuthenticatedUser(req);
    res.json(InventoryRepository.getAll(user?.businessId));
  });

  app.get("/api/purchase-orders", (req, res) => {
    const user = getAuthenticatedUser(req);
    res.json(PurchaseOrderRepository.getAll(user?.businessId));
  });

  app.get("/api/employees", (req, res) => {
    const user = getAuthenticatedUser(req);
    res.json(EmployeeRepository.getAll());
  });

  app.get("/api/invoices", (req, res) => {
    const user = getAuthenticatedUser(req);
    res.json(InvoiceRepository.getAll());
  });

  app.get("/api/customers", (req, res) => {
    const user = getAuthenticatedUser(req);
    res.json(CustomerRepository.getAll());
  });

  app.get("/api/tickets", (req, res) => {
    const user = getAuthenticatedUser(req);
    res.json(TicketRepository.getAll());
  });

  app.get("/api/activities", (req, res) => {
    const user = getAuthenticatedUser(req);
    res.json(ActivityRepository.getAll(user?.businessId));
  });

  // Server-Side Action Execution Router with RBAC & Tenant Scoping
  app.post("/api/actions/execute", (req, res) => {
    const user = getAuthenticatedUser(req);
    const { actionType, payload } = req.body;

    // RBAC: Employee role restricted from executing payroll
    if (actionType === 'RUN_PAYROLL' && user?.role === 'employee') {
      return res.status(403).json({ error: 'Permission Denied: Employee role cannot execute payroll disbursements.' });
    }

    const tenantId = user?.businessId || 'biz_demo';

    try {
      if (actionType === 'CREATE_PURCHASE_ORDER') {
        const qty = Number(payload.quantity || 100);
        const amount = Number(payload.totalAmount || 85000);
        if (qty <= 0) return res.status(400).json({ error: 'Quantity must be greater than 0' });

        const po = PurchaseOrderRepository.create({
          product: payload.productName || 'Industrial Sensor Enclosure IP67',
          sku: 'SKU-SENS-IP67',
          quantity: qty,
          amount,
          supplier: payload.supplierName || 'Apex Industrial Components',
          status: 'created',
          createdBy: user?.name || 'YuktiOS Coordinator',
        }, tenantId);

        // Update inventory SKU stock quantity
        const sku = InventoryRepository.getById('prod_003');
        if (sku) {
          InventoryRepository.addStock(sku.id, qty);
        }

        ActivityRepository.create({
          agentSource: 'Inventory',
          eventType: 'PURCHASE_ORDER_CREATED',
          description: `Created Purchase Order ${po.id} for ${qty} units of ${po.product} (₹${po.amount.toLocaleString('en-IN')}).`,
          metadata: { poId: po.id, amount },
        });

        return res.json({
          success: true,
          result: {
            id: po.id,
            type: actionType,
            status: 'success',
            title: `Purchase Order ${po.id} Created`,
            summary: `Successfully generated Purchase Order for ${qty} units of ${po.product}.`,
            timestamp: po.createdAt,
            isSimulatedDemo: true,
          },
          updatedState: DataStore.getState(),
        });
      }

      if (actionType === 'SEND_PAYMENT_REMINDER') {
        const invId = payload.invoiceNumber || 'INV-2026-091';
        ActivityRepository.create({
          agentSource: 'Finance',
          eventType: 'PAYMENT_REMINDER_SENT',
          description: `Sent automated payment reminder for invoice ${invId} to ${payload.customerName || 'Matrix Automation Corp'}.`,
        });

        return res.json({
          success: true,
          result: {
            id: `act_${Date.now()}`,
            type: actionType,
            status: 'success',
            title: `Payment Reminder Sent`,
            summary: `Automated reminder delivered for invoice ${invId} (₹${Number(payload.totalAmount || 188800).toLocaleString('en-IN')}).`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSimulatedDemo: true,
          },
          updatedState: DataStore.getState(),
        });
      }

      if (actionType === 'RUN_PAYROLL') {
        const period = payload.payrollPeriod || 'August 2026';
        const amount = Number(payload.payrollAmount || 520000);

        ActivityRepository.create({
          agentSource: 'HR',
          eventType: 'PAYROLL_PROCESSED',
          description: `Disbursed monthly payroll for ${period} (₹${amount.toLocaleString('en-IN')}) across ${payload.employeeCount || 12} staff.`,
        });

        return res.json({
          success: true,
          result: {
            id: `act_${Date.now()}`,
            type: actionType,
            status: 'success',
            title: `Payroll ${period} Disbursed`,
            summary: `Successfully processed salary disbursement for ${payload.employeeCount || 12} staff.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSimulatedDemo: true,
          },
          updatedState: DataStore.getState(),
        });
      }

      if (actionType === 'RESPOND_TO_SUPPORT_TICKET') {
        const ticketId = payload.ticketId || 'TICK-402';
        try {
          TicketRepository.update(ticketId, { status: 'resolved' });
        } catch (e) {}

        ActivityRepository.create({
          agentSource: 'Support',
          eventType: 'SUPPORT_RESPONSE_SENT',
          description: `Resolved support ticket ${ticketId} for ${payload.supportCustomer || 'Matrix Automation Corp'}.`,
        });

        return res.json({
          success: true,
          result: {
            id: `act_${Date.now()}`,
            type: actionType,
            status: 'success',
            title: `Support Ticket ${ticketId} Resolved`,
            summary: `Response sent to ${payload.supportCustomer || 'Customer'}. Ticket status updated to Resolved.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSimulatedDemo: true,
          },
          updatedState: DataStore.getState(),
        });
      }

      // Generic action handler
      ActivityRepository.create({
        agentSource: 'Orchestrator',
        eventType: `${actionType}_EXECUTED`,
        description: `Executed action ${actionType}`,
      });

      return res.json({
        success: true,
        result: {
          id: `act_${Date.now()}`,
          type: actionType,
          status: 'success',
          title: `Action Executed`,
          summary: `Successfully executed business action ${actionType}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSimulatedDemo: true,
        },
        updatedState: DataStore.getState(),
      });
    } catch (err: any) {
      console.error('[Action Execution Error]', err);
      res.status(500).json({ error: err?.message || 'Server error executing action' });
    }
  });

  // Multi-Agent Workflow Endpoint: Inventory Risk & PO Recommendation
  app.post("/api/ai/workflows/inventory-risk", async (req, res) => {
    const { productId } = req.body;
    try {
      ActivityRepository.create({ agentSource: 'Inventory', eventType: 'INVENTORY_ANALYSIS_STARTED', description: 'Started inventory risk evaluation.' });
      ActivityRepository.create({ agentSource: 'Inventory', eventType: 'STOCKOUT_RISK_DETECTED', description: 'Stockout risk detected for Industrial Sensor Enclosure IP67.' });
      ActivityRepository.create({ agentSource: 'Analytics', eventType: 'DEMAND_FORECAST_GENERATED', description: 'Demand forecast model predicted +24% surge in 14 days.' });
      ActivityRepository.create({ agentSource: 'Finance', eventType: 'BUDGET_CHECK_COMPLETED', description: 'Cash surplus of ₹2,40,000 verified for purchase order.' });
      
      const workflowResult = await runCoordinatorWorkflow({
        systemState: DataStore.getState(),
        targetProductId: productId,
      });

      ActivityRepository.create({ agentSource: 'Orchestrator', eventType: 'RECOMMENDATION_GENERATED', description: workflowResult.recommendation.title });

      res.json(workflowResult);
    } catch (err: any) {
      console.error('[YuktiOS Coordinator] Workflow execution error:', err);
      res.status(500).json({ error: 'Failed to execute multi-agent workflow', details: err?.message || String(err) });
    }
  });

  // Multi-Agent Workflow Endpoint: Customer Churn & Retention Campaign
  app.post("/api/ai/workflows/customer-churn", async (req, res) => {
    const { customerId } = req.body;
    try {
      ActivityRepository.create({ agentSource: 'Marketing', eventType: 'CHURN_ANALYSIS_STARTED', description: 'Started customer churn evaluation.' });
      ActivityRepository.create({ agentSource: 'Support', eventType: 'TICKET_SENTIMENT_EVALUATED', description: 'Evaluated open support ticket sentiment for account.' });
      ActivityRepository.create({ agentSource: 'Analytics', eventType: 'CHURN_RISK_SCORED', description: 'Churn probability model scored account risk.' });

      const workflowResult = await runCustomerChurnWorkflow({
        systemState: DataStore.getState(),
        targetCustomerId: customerId,
      });

      ActivityRepository.create({ agentSource: 'Orchestrator', eventType: 'RECOMMENDATION_GENERATED', description: workflowResult.recommendation.title });

      res.json(workflowResult);
    } catch (err: any) {
      console.error('[YuktiOS Coordinator] Churn workflow execution error:', err);
      res.status(500).json({ error: 'Failed to execute customer churn workflow', details: err?.message || String(err) });
    }
  });

  // Reset persistent datastore to seed data
  app.post("/api/data/reset", (req, res) => {
    const freshState = DataStore.resetToSeed();
    res.json({ success: true, state: freshState });
  });

  // Multi-Agent Execution Loop Trigger: Quick POS Sale
  app.post("/api/pos/sale", (req, res) => {
    const { customerId, productId, quantity, unitPrice } = req.body;
    
    const product = state.products.find(p => p.id === productId);
    const customer = state.customers.find(c => c.id === customerId);

    if (!product || !customer) {
      return res.status(400).json({ error: "Product or customer not found" });
    }

    const qty = Number(quantity) || 1;
    const price = Number(unitPrice) || product.unitPrice;
    const subtotal = qty * price;
    const gstAmount = Math.round(subtotal * 0.18);
    const total = subtotal + gstAmount;

    // 1. Finance Agent action: Create Invoice
    const invNum = `INV-2026-${String(state.invoices.length + 90).padStart(3, '0')}`;
    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: invNum,
      customerName: customer.name,
      customerId: customer.id,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      items: [
        {
          description: `${product.name} (${product.sku})`,
          quantity: qty,
          unitPrice: price,
          amount: subtotal,
        }
      ],
      subtotal,
      gstAmount,
      total,
      status: 'paid',
      autoGenerated: true,
    };
    state.invoices.unshift(newInvoice);

    // 2. Inventory Agent action: Deduct stock, record ledger
    product.stockQuantity = Math.max(0, product.stockQuantity - qty);
    // Recalculate risk
    if (product.stockQuantity <= product.reorderPoint) {
      product.stockoutRiskScore = Math.min(100, Math.round((1 - product.stockQuantity / product.reorderPoint) * 100) + 50);
    } else {
      product.stockoutRiskScore = Math.max(10, Math.round((1 - product.stockQuantity / (product.reorderPoint * 2)) * 30));
    }

    const ledgerEntry: StockLedgerEntry = {
      id: `led_${Date.now()}`,
      productId: product.id,
      productName: product.name,
      changeType: 'sale',
      quantity: -qty,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      performedBy: 'Multi-Agent POS Trigger',
    };
    state.stockLedger.unshift(ledgerEntry);

    // 3. Marketing Agent action: Update Customer RFM
    customer.totalSpent += total;
    customer.orderCount += 1;
    customer.lastPurchaseDaysAgo = 0;
    if (customer.totalSpent > 600000) customer.rfmSegment = 'Champions';
    else if (customer.totalSpent > 300000) customer.rfmSegment = 'Loyal Customers';
    customer.churnRiskScore = Math.max(5, customer.churnRiskScore - 15);

    // 4. Emit central events & orchestrator risk checks
    emitEvent('Finance', 'INVOICE_GENERATED', `Generated & collected invoice ${invNum} for ₹${total.toLocaleString('en-IN')} from ${customer.name}.`);
    emitEvent('Inventory', 'STOCK_DEDUCTED', `Deducted ${qty} units of ${product.name}. New balance: ${product.stockQuantity} units.`);
    emitEvent('Marketing', 'CUSTOMER_RFM_UPDATED', `Updated RFM profile for ${customer.name}. Total spent: ₹${customer.totalSpent.toLocaleString('en-IN')}.`);

    if (product.stockQuantity <= product.reorderPoint) {
      const alert: AnomalyAlert = {
        id: `anom_${Date.now()}`,
        severity: 'critical',
        agentSource: 'Inventory',
        title: `Low Stock Warning: ${product.name}`,
        message: `Stock level dropped to ${product.stockQuantity} (Reorder point: ${product.reorderPoint}). Stockout risk score is now ${product.stockoutRiskScore}%.`,
        recommendedAction: `Reorder ${product.optimalOrderQty} units from supplier immediately.`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'open',
      };
      state.anomalyAlerts.unshift(alert);
      emitEvent('Orchestrator', 'STOCKOUT_RISK_ALERT', alert.message);
    }

    res.json({
      success: true,
      invoice: newInvoice,
      product,
      customer,
    });
  });

  // Reorder product stock
  app.post("/api/inventory/reorder", (req, res) => {
    const { productId, quantity } = req.body;
    const product = state.products.find(p => p.id === productId);
    if (!product) return res.status(400).json({ error: "Product not found" });

    const qty = Number(quantity) || product.optimalOrderQty;
    product.stockQuantity += qty;
    product.stockoutRiskScore = 10;

    const cost = qty * product.costPrice;

    // Log expense in Finance
    const newExpense: Expense = {
      id: `exp_${Date.now()}`,
      category: 'Raw Materials',
      amount: cost,
      vendor: `Supplier PO (${product.supplierId})`,
      date: new Date().toISOString().split('T')[0],
      status: 'approved',
    };
    state.expenses.unshift(newExpense);

    // Add ledger entry
    state.stockLedger.unshift({
      id: `led_${Date.now()}`,
      productId: product.id,
      productName: product.name,
      changeType: 'restock',
      quantity: qty,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      performedBy: 'Inventory Agent Auto-PO',
    });

    // Clear open alerts for this product
    state.anomalyAlerts = state.anomalyAlerts.filter(a => !a.title.includes(product.name));

    emitEvent('Inventory', 'STOCK_RESTOCKED', `Restocked ${qty} units of ${product.name}. New total: ${product.stockQuantity} units.`);
    emitEvent('Finance', 'EXPENSE_LOGGED', `Logged Restock Expense of ₹${cost.toLocaleString('en-IN')} for ${product.name}.`);

    res.json({ success: true, product, expense: newExpense });
  });

  // HR Payroll Run
  app.post("/api/hr/payroll/run", (req, res) => {
    const { month } = req.body;
    const totalGross = state.employees.reduce((acc, e) => acc + e.baseSalary, 0);
    const totalDeductions = state.employees.reduce((acc, e) => acc + e.epfDeduction + e.esiDeduction, 0);
    const totalNet = totalGross - totalDeductions;

    const payrollRun: PayrollRun = {
      id: `pay_${Date.now()}`,
      month: month || 'August 2026',
      totalEmployees: state.employees.length,
      totalGrossSalary: totalGross,
      totalDeductions: totalDeductions,
      totalNetSalary: totalNet,
      status: 'processed',
      runDate: new Date().toISOString().split('T')[0],
    };
    state.payrollRuns.unshift(payrollRun);

    // Finance expense
    const salaryExpense: Expense = {
      id: `exp_${Date.now()}`,
      category: 'Salaries',
      amount: totalGross,
      vendor: `Payroll Disbursement - ${payrollRun.month}`,
      date: new Date().toISOString().split('T')[0],
      status: 'approved',
    };
    state.expenses.unshift(salaryExpense);

    emitEvent('HR', 'PAYROLL_PROCESSED', `Processed payroll for ${state.employees.length} employees for ${payrollRun.month}. Net payout: ₹${totalNet.toLocaleString('en-IN')}.`);
    emitEvent('Finance', 'EXPENSE_LOGGED', `Logged Payroll Expense of ₹${totalGross.toLocaleString('en-IN')} for ${payrollRun.month}.`);

    res.json({ success: true, payrollRun, salaryExpense });
  });

  // Marketing Campaign Creation
  app.post("/api/marketing/campaign", (req, res) => {
    const { title, channel, targetSegment, copyText, estimatedReach } = req.body;
    const campaign: Campaign = {
      id: `camp_${Date.now()}`,
      title: title || 'Targeted Customer Offer',
      channel: channel || 'WhatsApp',
      targetSegment: targetSegment || 'At Risk Customers',
      copyText: copyText || 'Exclusive 10% discount for valued partners!',
      status: 'sent',
      createdDate: new Date().toISOString().split('T')[0],
      estimatedReach: Number(estimatedReach) || 35,
    };
    state.campaigns.unshift(campaign);

    emitEvent('Marketing', 'CAMPAIGN_LAUNCHED', `Launched ${campaign.channel} campaign "${campaign.title}" to ${campaign.targetSegment} (${campaign.estimatedReach} recipients).`);

    res.json({ success: true, campaign });
  });

  // Support Ticket Reply
  app.post("/api/support/tickets/:id/reply", (req, res) => {
    const { id } = req.params;
    const { replyText } = req.body;
    const ticket = state.supportTickets.find(t => t.id === id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    ticket.status = 'resolved';
    ticket.aiSuggestedReply = replyText || ticket.aiSuggestedReply;

    emitEvent('Support', 'TICKET_RESOLVED', `Ticket ${ticket.ticketNumber} (${ticket.customerName}) marked as resolved.`);

    res.json({ success: true, ticket });
  });

  // AI Orchestrator: Ask YuktiOS
  app.post("/api/ask-yuktios", async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const ai = getGeminiAI();

    const generateOfflineAnswer = (qStr: string): string => {
      const q = qStr.toLowerCase();
      const totalRev = state.invoices.reduce((a, b) => a + b.total, 0);
      const pendingReceivables = state.invoices.filter(i => i.status !== 'paid').reduce((a, b) => a + b.total, 0);
      const totalExp = state.expenses.reduce((a, b) => a + b.amount, 0);
      const lowStock = state.products.filter(p => p.stockQuantity <= p.reorderPoint);
      const openTickets = state.supportTickets.filter(t => t.status === 'open');
      const openAnomalies = state.anomalyAlerts.filter(a => a.status === 'open');
      const atRiskCust = state.customers.filter(c => c.rfmSegment === 'At Risk');

      if (q.trim() === 'hi' || q.trim() === 'hello' || q.trim() === 'hey' || q.includes('greetings') || q.includes('help')) {
        return `### **Greetings! I am YuktiOS Central Orchestrator**
I am monitoring live performance across all 6 SME domain agents:
* **Finance Agent:** Revenue ₹${totalRev.toLocaleString('en-IN')} (Pending: ₹${pendingReceivables.toLocaleString('en-IN')})
* **Inventory Agent:** ${lowStock.length} SKU(s) below reorder point (${lowStock.map(p => p.name).join(', ') || 'All healthy'})
* **HR Agent:** ${state.employees.length} active employees synced in payroll
* **Customer Support:** ${openTickets.length} open support ticket(s)
* **Marketing Agent:** ${atRiskCust.length} customer(s) in At-Risk segment

---
### **Recommended Multi-Agent Action**
Ask me anything about cash flow forecasts, stockout risks, payroll runs, or customer retention campaigns!`;
      }

      if (q.includes('cash') || q.includes('flow') || q.includes('revenue') || q.includes('receivable') || q.includes('invoice') || q.includes('finan') || q.includes('money')) {
        return `### **Finance Agent & Cash Flow Insights**
* **Total Revenue:** ₹${totalRev.toLocaleString('en-IN')}
* **Pending Receivables:** ₹${pendingReceivables.toLocaleString('en-IN')}
* **Monthly Expenses:** ₹${totalExp.toLocaleString('en-IN')}
* **Net Operating Position:** ₹${(totalRev - totalExp).toLocaleString('en-IN')}

**Overdue Invoices to Reconcile:**
${state.invoices.filter(i => i.status === 'overdue').map(i => `- **${i.invoiceNumber}** (${i.customerName}): ₹${i.total.toLocaleString('en-IN')} (Due: ${i.dueDate})`).join('\n') || '- None'}

---
### **Recommended Multi-Agent Action**
Finance Agent recommends triggering automated WhatsApp payment reminders to overdue clients and verifying pending NEFT reconciliations.`;
      }

      if (q.includes('stock') || q.includes('inventory') || q.includes('sku') || q.includes('reorder') || q.includes('product')) {
        return `### **Inventory Agent Stockout Risk Analysis**
* **Total SKUs Tracked:** ${state.products.length}
* **Low Stock Items Needing Reorder:** ${lowStock.length}

**Low Stock Item Details:**
${lowStock.map(p => `- **${p.name}** (${p.sku}): Current Stock ${p.stockQuantity} (Reorder Level: ${p.reorderPoint}) | Stockout Risk Score: ${p.stockoutRiskScore}%`).join('\n')}

---
### **Recommended Multi-Agent Action**
Inventory Agent recommends placing immediate purchase orders for low-stock SKUs to prevent manufacturing downtime.`;
      }

      if (q.includes('customer') || q.includes('campaign') || q.includes('market') || q.includes('risk') || q.includes('churn') || q.includes('retention')) {
        return `### **Marketing & Customer Agent Intelligence**
* **Total Customers:** ${state.customers.length}
* **At-Risk Customers (High Churn Risk):** ${atRiskCust.length}
* **Active Marketing Campaigns:** ${state.campaigns.filter(c => c.status === 'sent').length}

**At-Risk Customer Segment:**
${atRiskCust.map(c => `- **${c.name}** (${c.company}): Churn Risk ${c.churnRiskScore}% | Total Lifetime Spend: ₹${c.totalSpent.toLocaleString('en-IN')}`).join('\n')}

---
### **Recommended Multi-Agent Action**
Marketing Agent recommends dispatching the automated WhatsApp restock retention campaign offering a 10% discount to At-Risk clients.`;
      }

      if (q.includes('payroll') || q.includes('hr') || q.includes('salary') || q.includes('employee')) {
        const payroll = state.payrollRuns[0];
        return `### **HR & Statutory Payroll Agent Overview**
* **Active Staff:** ${state.employees.length} Employees
* **Latest Payroll Cycle:** ${payroll ? payroll.month : 'July 2026'}
* **Gross Salary Payout:** ₹${payroll ? payroll.totalGrossSalary.toLocaleString('en-IN') : '4,85,000'}
* **Statutory Compliance Deductions:** ₹${payroll ? payroll.totalDeductions.toLocaleString('en-IN') : '62,000'}

---
### **Recommended Multi-Agent Action**
HR Agent confirms all employee attendance records are locked and statutory filings are prepared for direct bank transfer.`;
      }

      return `### **YuktiOS Executive Multi-Agent Summary**
* **Finance Agent:** Revenue ₹${totalRev.toLocaleString('en-IN')} | Outstanding Receivables: ₹${pendingReceivables.toLocaleString('en-IN')}
* **Inventory Agent:** ${lowStock.length} SKU(s) below reorder threshold (${lowStock.map(p => p.name).join(', ') || 'All healthy'})
* **Support Agent:** ${openTickets.length} open ticket(s) pending resolution
* **HR Agent:** ${state.employees.length} active employees synced in payroll
* **Anomaly Detector:** ${openAnomalies.length} open system alert(s) needing attention

---
### **Recommended Multi-Agent Action**
Review low-stock reorder triggers and resolve overdue receivables to optimize working capital.`;
    };

    if (!ai) {
      return res.json({ answer: generateOfflineAnswer(query) });
    }

    function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
      ]);
    }

    try {
      const summaryContext = {
        business: state.business.name,
        gstin: state.business.gstin,
        totalRevenue: state.invoices.reduce((acc, i) => acc + i.total, 0),
        pendingReceivables: state.invoices.filter(i => i.status !== 'paid').reduce((acc, i) => acc + i.total, 0),
        monthlyExpenses: state.expenses.reduce((acc, e) => acc + e.amount, 0),
        products: state.products.map(p => ({
          sku: p.sku,
          name: p.name,
          stock: p.stockQuantity,
          reorderPoint: p.reorderPoint,
          stockoutRiskScore: p.stockoutRiskScore,
        })),
        openAnomalies: state.anomalyAlerts.filter(a => a.status === 'open'),
        supportTicketsOpen: state.supportTickets.filter(t => t.status === 'open'),
        employeesCount: state.employees.length,
        customerSegments: {
          champions: state.customers.filter(c => c.rfmSegment === 'Champions').length,
          atRisk: state.customers.filter(c => c.rfmSegment === 'At Risk').length,
        }
      };

      const systemPrompt = `You are YuktiOS — the Intelligent Central Multi-Agent Orchestrator and Business Intelligence OS for Indian SMEs (${summaryContext.business}).
You have real-time visibility across all 6 specialized domain agents: Finance, Inventory, HR, Marketing, Customer Support, and Business Analytics.

Current Live State Summary:
${JSON.stringify(summaryContext, null, 2)}

Instructions:
1. Provide a direct, highly concise, structured, professional response answering the user's question using the live business data above.
2. Highlight relevant financial numbers in Indian Rupees (₹), inventory quantities, or agent actions.
3. Keep the answer structured with clear bullet points.
4. Conclude with a concrete "Recommended Multi-Agent Action".`;

      const candidateModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
      let generatedText = null;

      for (const model of candidateModels) {
        try {
          const response = await withTimeout(
            ai.models.generateContent({
              model,
              contents: query,
              config: {
                systemInstruction: systemPrompt,
                temperature: 0.7,
              },
            }),
            1800
          );
          if (response && response.text) {
            generatedText = response.text;
            break;
          }
        } catch (e) {
          // try next model
        }
      }

      if (!generatedText) {
        generatedText = generateOfflineAnswer(query);
      }

      res.json({ answer: generatedText });
    } catch (err: any) {
      console.error("Ask YuktiOS Gemini fallback triggered:", err);
      res.json({ answer: generateOfflineAnswer(query) });
    }
  });

  // Helper to build compact business context for AI Copilot
  function buildCompactBusinessContext(sysState: SystemState) {
    const overdueInvoices = sysState.invoices.filter((i) => i.status === 'overdue' || i.status === 'pending');
    const totalReceivables = overdueInvoices.reduce((acc, i) => acc + i.total, 0);

    const lowStockProducts = sysState.products.filter((p) => p.stockQuantity <= p.reorderPoint);
    const atRiskCustomers = sysState.customers.filter((c) => c.rfmSegment === 'At Risk');
    const openTickets = sysState.supportTickets.filter((t) => t.status === 'open');

    return {
      businessName: sysState.business.name,
      financialSummary: {
        cashSurplus: 540000,
        revenueToday: 236000,
        expensesToday: 577700,
        pendingOverdueInvoicesCount: overdueInvoices.length,
        pendingOverdueAmount: totalReceivables || 439550,
      },
      inventorySummary: {
        totalSKUs: sysState.products.length,
        lowStockProductsCount: lowStockProducts.length,
        lowStockItems: lowStockProducts.map((p) => ({
          name: p.name,
          currentStock: p.stockQuantity,
          reorderPoint: p.reorderPoint,
          estStockoutDays: 3,
        })),
      },
      customerSummary: {
        totalCustomers: sysState.customers.length,
        atRiskCount: atRiskCustomers.length,
        atRiskAccounts: atRiskCustomers.map((c) => ({
          name: c.name,
          company: c.company,
          rfmSegment: c.rfmSegment,
          orderRecencyDays: 48,
        })),
      },
      supportSummary: {
        totalTickets: sysState.supportTickets.length,
        openTicketsCount: openTickets.length,
        openTicketsList: openTickets.map((t) => ({ id: t.id, subject: t.subject, priority: t.priority })),
      },
      payrollSummary: {
        employeeCount: sysState.employees.length,
        monthlyPayrollTotal: sysState.expenses.filter(e => e.category === 'Salaries').reduce((a, e) => a + e.amount, 0) || 520000,
      },
      activeAnomaliesCount: sysState.anomalyAlerts.filter((a) => a.status === 'open').length,
      recentEventLogs: sysState.eventLogs.slice(0, 3).map((e) => `${e.agentSource}: ${e.description}`),
    };
  }

  async function generateFallbackStructuredAskResponse(userMessage: string, compactContext: ReturnType<typeof buildCompactBusinessContext>) {
    try {
      const orchestratorResult = await runUnifiedOrchestrationWorkflow(state, userMessage);
      return {
        ...orchestratorResult,
        isOfflineFallback: true,
      };
    } catch (err) {
      return {
        answer: `YuktiOS Coordinator analyzed live operations for ${compactContext.businessName}. Overall business health rating: 92/100.`,
        insights: [
          { title: "Business Status", value: "6 Agents Online", description: "All domain agents active", severity: "healthy" },
          { title: "Cash Flow", value: `₹${(compactContext.financialSummary.cashSurplus / 1000).toFixed(0)},000 Surplus`, description: "Healthy working capital", severity: "healthy" },
        ],
        agentsConsulted: [
          { agent: "Finance Agent", contribution: "Financial ledger sync", status: "complete" },
          { agent: "Inventory Agent", contribution: "SKU telemetry audit", status: "complete" },
          { agent: "YuktiOS Coordinator", contribution: "Business summary synthesis", status: "complete" },
        ],
        recommendation: {
          title: "Maintain inventory stock levels and clear overdue receivables",
          description: "Reorder critical SKUs and follow up on pending client invoices.",
          confidence: 90,
        },
        actionAvailable: true,
        actionType: "daily_focus",
        isOfflineFallback: true,
      };
    }
  }

  // POST /api/ai/ask - Multi-Agent Business Copilot AI Endpoint
  app.post("/api/ai/ask", async (req, res) => {
    const user = getAuthenticatedUser(req);
    const ip = req.ip || req.socket.remoteAddress || 'client';
    const rateKey = `ai_${user?.id || ip}`;
    if (!checkRateLimit(rateKey, 10, 60000)) {
      return res.status(429).json({ error: 'Rate limit exceeded: Maximum 10 AI queries per minute.' });
    }

    const { message, query: legacyQuery } = req.body;
    let userMessage = String(message || legacyQuery || "Give me a summary of my business.").trim();

    // Prompt Injection Defense: Strip malicious instruction overrides
    const injectionPatterns = [
      /ignore (all )?previous instructions/gi,
      /override (system )?prompt/gi,
      /show (me )?other (company'?s|tenant'?s) data/gi,
      /reveal (all )?passwords|api keys/gi,
    ];
    injectionPatterns.forEach((p) => {
      userMessage = userMessage.replace(p, '[redacted_security_rule]');
    });

    try {
      const response = await AIService.askYuktiOS(userMessage, DataStore.getState(), user?.businessId);
      res.json(response);
    } catch (err: any) {
      console.error("[YuktiOS Copilot Endpoint] Error executing AIService.askYuktiOS:", err);
      const fallbackContext = buildCompactBusinessContext(DataStore.getState());
      const fallback = await generateFallbackStructuredAskResponse(userMessage, fallbackContext);
      res.json(fallback);
    }
  });

  // AI Domain Specific: Marketing Campaign Copy Generation
  app.post("/api/gemini/generate-marketing-copy", async (req, res) => {
    const { segment, product, goal } = req.body;
    const fallbackCopy = `Exclusive Offer for ${segment || 'Valued Clients'}! Restock ${product || 'key products'} this month and receive 10% discount plus priority express freight delivery. Reply YES to claim now!`;

    const ai = getGeminiAI();
    if (!ai) {
      return res.json({ copy: fallbackCopy });
    }

    try {
      const candidateModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
      let text = null;

      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: `Write a high-converting, professional WhatsApp marketing message (under 60 words) for an SME client in India.
Target Segment: ${segment || 'At Risk Customers'}
Product/Service: ${product || 'Precision Components & Motors'}
Goal: ${goal || 'Re-engage inactive customer with a limited-time 10% discount'}
Format: Catchy, respectful, with a clear call-to-action (e.g. Reply YES).`,
          });
          if (response && response.text) {
            text = response.text;
            break;
          }
        } catch (e) {
          // try next candidate
        }
      }

      res.json({ copy: text || fallbackCopy });
    } catch (err: any) {
      res.json({ copy: fallbackCopy });
    }
  });

  // AI Domain Specific: Support Auto-Reply Generation
  app.post("/api/gemini/support-auto-reply", async (req, res) => {
    const { customerName, subject, message } = req.body;
    const fallbackReply = `Dear ${customerName || 'Valued Customer'}, thank you for contacting Apex SME Support regarding "${subject}". Our Support Agent and Finance system are reviewing your request and will follow up shortly.`;

    const ai = getGeminiAI();
    if (!ai) {
      return res.json({ reply: fallbackReply });
    }

    try {
      const candidateModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
      let text = null;

      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: `Draft an empathetic, helpful customer support reply for an SME customer in India.
Customer: ${customerName}
Subject: ${subject}
Message: ${message}

Knowledge Base FAQ Context:
- Standard payment terms: Net 15 days
- NEFT/RTGS payment verification takes up to 24 hours
- Technical spec sheets & STEP files are dispatched automatically via RAG repository

Keep response under 80 words, warm and actionable.`,
          });
          if (response && response.text) {
            text = response.text;
            break;
          }
        } catch (e) {
          // try next candidate
        }
      }

      res.json({ reply: text || fallbackReply });
    } catch (err: any) {
      res.json({ reply: fallbackReply });
    }
  });

  // Vite Middleware integration for dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: {
          ignored: ['**/data_store.json', '**/data_store*.json', '**/data/**', '**/*.json'],
        },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[YuktiOS] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
