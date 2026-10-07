import React, { useState, useEffect } from 'react';
import { SystemState, UserRole, Invoice, Expense, Campaign } from './types';
import { initialSystemState } from './data/mockData';
import Sidebar from './components/sidebar/Sidebar';
import { Header } from './components/Header';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { FinanceAgentView } from './components/FinanceAgentView';
import { InventoryAgentView } from './components/InventoryAgentView';
import { HRAgentView } from './components/HRAgentView';
import { MarketingAgentView } from './components/MarketingAgentView';
import { SupportAgentView } from './components/SupportAgentView';
import { AICommandCenter } from './components/AICommandCenter';
import { AnalyticsBlueprintView } from './components/AnalyticsBlueprintView';
import { AskYuktiOSDrawer } from './components/AskYuktiOSDrawer';
import { QuickSaleModal } from './components/QuickSaleModal';
import { ActionConfirmationModal } from './components/ActionConfirmationModal';
import { ActionResultModal } from './components/ActionResultModal';
import { ExecutableActionType, ActionPayload, ActionResult } from './types/actionTypes';
import { executeBusinessAction, checkDuplicateAction } from './services/ActionExecutor';
import { NavTab } from './components/Navigation';
import { AgentEventBus, AgentEvent } from './services/AgentEventBus';
import { AuthModal } from './components/AuthModal';
import { PublicUserInfo } from './types/authTypes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HelpCenterView } from './components/HelpCenterView';

export default function App() {
  const [state, setState] = useState<SystemState>(initialSystemState);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('owner');
  const [isAskAIOpen, setIsAskAIOpen] = useState<boolean>(false);
  const [askAIInitialQuery, setAskAIInitialQuery] = useState<string>('');
  const [isQuickSaleOpen, setIsQuickSaleOpen] = useState<boolean>(false);

  // Action Execution State
  const [activeActionType, setActiveActionType] = useState<ExecutableActionType>('CREATE_PURCHASE_ORDER');
  const [actionPayload, setActionPayload] = useState<ActionPayload>({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDuplicateWarning, setIsDuplicateWarning] = useState(false);

  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState<ActionResult | null>(null);

  // Auth State
  const [currentUser, setCurrentUser] = useState<PublicUserInfo | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          setCurrentRole(data.user.role || 'owner');
        }
      }
    } catch (e) {
      console.warn('Auth check offline');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      await fetchLiveState();
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch live state from backend API on mount
  const fetchLiveState = async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
    } catch (err) {
      console.warn('Backend API offline, using local memory state');
    }
  };

  useEffect(() => {
    fetchLiveState();

    const handleBusEvent = (evt: AgentEvent) => {
      setState((prev) => ({
        ...prev,
        eventLogs: [
          {
            id: evt.id,
            timestamp: evt.timestamp,
            agentSource: evt.sourceAgent as any,
            eventType: evt.type,
            description: `${evt.type}: ${evt.payload?.product || evt.payload?.recommendation || JSON.stringify(evt.payload)}`,
          },
          ...prev.eventLogs,
        ],
      }));
    };

    AgentEventBus.subscribe('*', handleBusEvent);
    return () => {
      AgentEventBus.unsubscribe('*', handleBusEvent);
    };
  }, []);

  const handleOpenAskAIWithQuery = (query?: string) => {
    if (query) {
      setAskAIInitialQuery(query);
    } else {
      setAskAIInitialQuery('');
    }
    setIsAskAIOpen(true);
  };

  const handleTriggerAction = (type: ExecutableActionType, payload: ActionPayload) => {
    setActiveActionType(type);
    setActionPayload(payload);
    const isDup = checkDuplicateAction(type, payload);
    setIsDuplicateWarning(isDup);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmActionExecution = async (payload: ActionPayload, forceExecute: boolean) => {
    setIsConfirmModalOpen(false);
    setIsResultModalOpen(true);
    setIsActionLoading(true);

    try {
      // Small simulated latency (600ms) for executive loading feedback
      await new Promise((r) => setTimeout(r, 600));

      const { result, updatedState } = await executeBusinessAction(activeActionType, payload, state, forceExecute);
      setState(updatedState);
      setActionResult(result);
    } catch (err) {
      setActionResult({
        id: `err_${Date.now()}`,
        type: activeActionType,
        status: 'failed',
        title: 'Action Execution Failed',
        summary: 'Action failed due to network error or validation constraints.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSimulatedDemo: true,
        errorReason: (err as Error).message || 'Server error',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handlers for state updates
  const handleAddInvoice = (newInvoiceData: Partial<Invoice>) => {
    const inv: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: newInvoiceData.invoiceNumber || `INV-2026-${String(state.invoices.length + 95).padStart(3, '0')}`,
      customerName: newInvoiceData.customerName || 'Standard Client',
      customerId: 'cust_001',
      date: newInvoiceData.date || new Date().toISOString().split('T')[0],
      dueDate: newInvoiceData.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      items: newInvoiceData.items || [],
      subtotal: newInvoiceData.subtotal || 10000,
      gstAmount: newInvoiceData.gstAmount || 1800,
      total: newInvoiceData.total || 11800,
      status: 'pending',
      autoGenerated: true,
    };

    setState((prev) => ({
      ...prev,
      invoices: [inv, ...prev.invoices],
      eventLogs: [
        {
          id: `evt_${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          agentSource: 'Finance',
          eventType: 'INVOICE_GENERATED',
          description: `Auto GST Invoice ${inv.invoiceNumber} created for ${inv.customerName} (₹${inv.total.toLocaleString('en-IN')}).`,
        },
        ...prev.eventLogs,
      ],
    }));
  };

  const handleAddExpense = (newExpData: Partial<Expense>) => {
    const exp: Expense = {
      id: `exp_${Date.now()}`,
      category: newExpData.category || 'Raw Materials',
      amount: newExpData.amount || 5000,
      vendor: newExpData.vendor || 'Supplier',
      date: newExpData.date || new Date().toISOString().split('T')[0],
      status: 'approved',
    };

    setState((prev) => ({
      ...prev,
      expenses: [exp, ...prev.expenses],
      eventLogs: [
        {
          id: `evt_${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          agentSource: 'Finance',
          eventType: 'EXPENSE_LOGGED',
          description: `Logged ${exp.category} expense of ₹${exp.amount.toLocaleString('en-IN')} to ${exp.vendor}.`,
        },
        ...prev.eventLogs,
      ],
    }));
  };

  const handleReorderStock = async (productId: string) => {
    try {
      const res = await fetch('/api/inventory/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        await fetchLiveState();
        return;
      }
    } catch (e) {
      console.error(e);
    }

    // Local fallback
    setState((prev) => {
      const updatedProducts = prev.products.map((p) => {
        if (p.id === productId) {
          return { ...p, stockQuantity: p.stockQuantity + p.optimalOrderQty, stockoutRiskScore: 10 };
        }
        return p;
      });
      return {
        ...prev,
        products: updatedProducts,
        anomalyAlerts: prev.anomalyAlerts.filter((a) => !a.title.includes('Sensor Enclosures')),
      };
    });
  };

  const handleRunPayroll = async (month: string) => {
    try {
      const res = await fetch('/api/hr/payroll/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month }),
      });
      if (res.ok) {
        await fetchLiveState();
        return;
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCampaign = async (newCampData: Partial<Campaign>) => {
    try {
      const res = await fetch('/api/marketing/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCampData),
      });
      if (res.ok) {
        await fetchLiveState();
        return;
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolveTicket = async (ticketId: string, replyText: string) => {
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyText }),
      });
      if (res.ok) {
        await fetchLiveState();
        return;
      }
    } catch (e) {
      console.error(e);
    }
  };

  const unresolvedAnomalies = state.anomalyAlerts.filter((a) => a.status === 'open').length;

  return (
    <div className="flex min-h-screen yukti-bg text-slate-100 font-sans">

      {/* Full-Height Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        unresolvedAnomaliesCount={unresolvedAnomalies}
        onOpenAskAI={() => handleOpenAskAIWithQuery()}
      />

      {/* Main Workspace Area */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Top Header */}
        <Header
          businessName={currentUser?.businessName || state.business.name}
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          onOpenQuickSale={() => setIsQuickSaleOpen(true)}
          onOpenAskAI={() => handleOpenAskAIWithQuery()}
          unresolvedAnomaliesCount={unresolvedAnomalies}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          onOpenHelp={() => setActiveTab('help')}
        />

        {/* Active View Container */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <ErrorBoundary fallbackTitle="View Rendering Error">
            {activeTab === 'dashboard' && (
              <ExecutiveDashboard
                state={state}
                onNavigateTab={setActiveTab}
                onReorderStock={handleReorderStock}
                onOpenAskAIWithQuery={handleOpenAskAIWithQuery}
              />
            )}

            {activeTab === 'finance' && (
              <FinanceAgentView
                invoices={state.invoices}
                expenses={state.expenses}
                cashFlowForecast={state.cashFlowForecast}
                onAddInvoice={handleAddInvoice}
                onAddExpense={handleAddExpense}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryAgentView
                products={state.products}
                stockLedger={state.stockLedger}
                suppliers={state.suppliers}
                onReorderStock={handleReorderStock}
              />
            )}

            {activeTab === 'hr' && (
              <HRAgentView
                employees={state.employees}
                attendance={state.attendance}
                payrollRuns={state.payrollRuns}
                onRunPayroll={handleRunPayroll}
              />
            )}

            {activeTab === 'marketing' && (
              <MarketingAgentView
                customers={state.customers}
                campaigns={state.campaigns}
                onCreateCampaign={handleCreateCampaign}
              />
            )}

            {activeTab === 'support' && (
              <SupportAgentView
                tickets={state.supportTickets}
                faqs={state.faqs}
                onResolveTicket={handleResolveTicket}
              />
            )}

            {activeTab === 'blueprint' && (
              <AICommandCenter
                state={state}
                onNavigateTab={setActiveTab}
                onReorderStock={handleReorderStock}
                onOpenAskAIWithQuery={handleOpenAskAIWithQuery}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsBlueprintView
                state={state}
                onOpenAskAIWithQuery={handleOpenAskAIWithQuery}
                onReorderStock={handleReorderStock}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'help' && (
              <HelpCenterView
                state={state}
                onNavigateTab={setActiveTab}
                onOpenAskAI={handleOpenAskAIWithQuery}
              />
            )}
          </ErrorBoundary>
        </main>

      </div>

      {/* Modals and Drawers */}
      <ErrorBoundary fallbackTitle="AskYuktiOS Drawer Error">
        <AskYuktiOSDrawer
          isOpen={isAskAIOpen}
          onClose={() => setIsAskAIOpen(false)}
          initialQuery={askAIInitialQuery}
          state={state}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onTriggerAction={handleTriggerAction}
          onExecutePurchaseOrder={() => {
            handleTriggerAction('CREATE_PURCHASE_ORDER', {
              productName: 'Industrial Sensor Enclosure IP67',
              quantity: 100,
              totalAmount: 85000,
              supplierName: 'Apex Industrial Components',
            });
          }}
          onExecuteChurnRetention={() => {
            handleTriggerAction('CREATE_MARKETING_CAMPAIGN', {
              campaignName: 'At-Risk Account Retention Offer',
              targetSegment: 'At Risk Enterprise Clients (Matrix Automation Corp)',
              recommendedOffer: '12% WhatsApp Discount Voucher',
            });
          }}
        />
      </ErrorBoundary>

      <QuickSaleModal
        isOpen={isQuickSaleOpen}
        onClose={() => setIsQuickSaleOpen(false)}
        products={state.products}
        customers={state.customers}
        onSaleExecuted={() => {
          fetchLiveState();
        }}
      />

      {/* Executable AI Actions Confirmation Modal */}
      <ActionConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        actionType={activeActionType}
        payload={actionPayload}
        isDuplicateWarning={isDuplicateWarning}
        onConfirm={handleConfirmActionExecution}
      />

      {/* Executable AI Actions Result Modal */}
      <ActionResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        isLoading={isActionLoading}
        result={actionResult}
        onRetry={() => {
          if (actionPayload) {
            handleConfirmActionExecution(actionPayload, true);
          }
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setCurrentRole(user.role || 'owner');
          fetchLiveState();
        }}
      />

    </div>
  );
}
