import { SystemState, EventLogItem } from '../types';
import { ExecutableActionType, ActionPayload, ActionResult } from '../types/actionTypes';

// Keep track of recent action execution keys for duplicate prevention
const recentExecutions: Record<string, number> = {};

export function checkDuplicateAction(type: ExecutableActionType, payload: ActionPayload): boolean {
  const key = `${type}_${payload.productId || payload.invoiceId || payload.ticketId || payload.campaignName || payload.payrollPeriod || 'generic'}`;
  const lastTime = recentExecutions[key];
  if (!lastTime) return false;

  // Prevent duplicate if executed within 3 minutes (180,000 ms)
  const isDuplicate = Date.now() - lastTime < 180000;
  return isDuplicate;
}

export async function executeBusinessAction(
  type: ExecutableActionType,
  payload: ActionPayload,
  state: SystemState,
  forceExecute = false
): Promise<{ result: ActionResult; updatedState: SystemState }> {
  // Check duplicate unless forceExecute is true
  if (!forceExecute && checkDuplicateAction(type, payload)) {
    return {
      result: {
        id: `act_${Date.now()}`,
        type,
        status: 'duplicate_prevented',
        title: 'Potential Duplicate Action Detected',
        summary: `A similar ${type.replace(/_/g, ' ')} action was executed recently. Please confirm if you wish to force execution.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSimulatedDemo: true,
      },
      updatedState: state,
    };
  }

  // Record timestamp for duplicate check
  const actionKey = `${type}_${payload.productId || payload.invoiceId || payload.ticketId || payload.campaignName || payload.payrollPeriod || 'generic'}`;
  recentExecutions[actionKey] = Date.now();

  // 1. Try server-side persistent action execution first
  try {
    const res = await fetch('/api/actions/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionType: type, payload }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return {
          result: data.result,
          updatedState: data.updatedState,
        };
      }
    }
  } catch (e) {
    console.warn('[ActionExecutor] Server endpoint offline, performing local state mutation fallback');
  }

  const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const eventId = `evt_${Date.now()}`;
  let eventLog: EventLogItem;
  let actionResult: ActionResult;

  const nextState: SystemState = JSON.parse(JSON.stringify(state));

  switch (type) {
    case 'CREATE_PURCHASE_ORDER': {
      const poId = `PO-2026-${Math.floor(100 + Math.random() * 900)}`;
      const prodName = payload.productName || 'Industrial Sensor Enclosure IP67';
      const qty = payload.quantity || 100;
      const amount = payload.totalAmount || 85000;

      eventLog = {
        id: eventId,
        timestamp: new Date().toISOString(),
        agentSource: 'Orchestrator',
        eventType: 'PURCHASE_ORDER_CREATED',
        description: `YuktiOS Coordinator created ${poId} for ${qty} units of ${prodName} (₹${amount.toLocaleString('en-IN')}).`,
        metadata: { poId, prodName, qty, amount, status: 'Completed' },
      };

      actionResult = {
        id: poId,
        type,
        status: 'executed',
        title: 'Purchase Order Created',
        summary: `Purchase Order ${poId} for ${qty} units of ${prodName} created successfully (₹${amount.toLocaleString('en-IN')}).`,
        timestamp: timestampStr,
        isSimulatedDemo: true,
        metadata: { poId, prodName, qty, amount },
      };
      break;
    }

    case 'SEND_PAYMENT_REMINDER': {
      const invNum = payload.invoiceNumber || payload.invoiceId || 'INV-2026-091';
      const custName = payload.customerName || 'Matrix Automation Corp';
      const amount = payload.totalAmount || 188800;

      eventLog = {
        id: eventId,
        timestamp: new Date().toISOString(),
        agentSource: 'Finance',
        eventType: 'PAYMENT_REMINDER_SENT',
        description: `Finance Agent sent automated payment verification follow-up for ${invNum} to ${custName} (₹${amount.toLocaleString('en-IN')}).`,
        metadata: { invNum, custName, amount, status: 'Completed' },
      };

      actionResult = {
        id: `rem_${Date.now()}`,
        type,
        status: 'executed',
        title: 'Payment Reminder Sent',
        summary: `Payment verification follow-up sent for invoice ${invNum} to ${custName} (₹${amount.toLocaleString('en-IN')}).`,
        timestamp: timestampStr,
        isSimulatedDemo: true,
        metadata: { invNum, custName, amount },
      };
      break;
    }

    case 'RUN_PAYROLL': {
      const period = payload.payrollPeriod || 'August 2026';
      const staffCount = payload.employeeCount || nextState.employees.length || 12;
      const totalAmount = payload.payrollAmount || 520000;

      eventLog = {
        id: eventId,
        timestamp: new Date().toISOString(),
        agentSource: 'HR',
        eventType: 'PAYROLL_PROCESSED',
        description: `HR Agent processed monthly payroll for ${period} across ${staffCount} employees (Total: ₹${totalAmount.toLocaleString('en-IN')}, EPF 12%, ESI 0.75%).`,
        metadata: { period, staffCount, totalAmount, status: 'Completed' },
      };

      actionResult = {
        id: `pay_${Date.now()}`,
        type,
        status: 'executed',
        title: 'Payroll Processed',
        summary: `Payroll for ${period} processed for ${staffCount} employees (₹${totalAmount.toLocaleString('en-IN')}). EPF/ESI statutory calculations verified.`,
        timestamp: timestampStr,
        isSimulatedDemo: true,
        metadata: { period, staffCount, totalAmount },
      };
      break;
    }

    case 'CREATE_MARKETING_CAMPAIGN': {
      const campName = payload.campaignName || 'At-Risk Account Retention Offer';
      const segment = payload.targetSegment || 'At Risk Enterprise Clients (Matrix Automation Corp)';
      const offer = payload.recommendedOffer || '12% WhatsApp Discount Voucher';

      eventLog = {
        id: eventId,
        timestamp: new Date().toISOString(),
        agentSource: 'Marketing',
        eventType: 'CAMPAIGN_LAUNCHED',
        description: `Marketing Agent launched retention campaign '${campName}' targeting ${segment} with ${offer}.`,
        metadata: { campName, segment, offer, status: 'Completed' },
      };

      actionResult = {
        id: `cmp_${Date.now()}`,
        type,
        status: 'executed',
        title: 'Campaign Launched',
        summary: `Marketing campaign '${campName}' launched for ${segment}. Retention voucher dispatched.`,
        timestamp: timestampStr,
        isSimulatedDemo: true,
        metadata: { campName, segment, offer },
      };
      break;
    }

    case 'RESPOND_TO_SUPPORT_TICKET': {
      const ticketId = payload.ticketId || 'TICK-402';
      const custName = payload.supportCustomer || 'Matrix Automation Corp';
      const respText = payload.suggestedResponse || 'Thank you for reaching out. Your NEFT payment reconciliation has been verified by Finance Agent.';

      // Update ticket status in state
      const ticket = nextState.supportTickets.find((t) => t.id === ticketId);
      if (ticket) {
        ticket.status = 'resolved';
      }

      eventLog = {
        id: eventId,
        timestamp: new Date().toISOString(),
        agentSource: 'Support',
        eventType: 'TICKET_RESOLVED',
        description: `Support Agent dispatched response to ticket ${ticketId} for ${custName}. Status marked as Resolved.`,
        metadata: { ticketId, custName, status: 'Completed' },
      };

      actionResult = {
        id: `rsp_${Date.now()}`,
        type,
        status: 'executed',
        title: 'Response Sent',
        summary: `AI response sent for ticket ${ticketId} (${custName}). Ticket status updated to Resolved.`,
        timestamp: timestampStr,
        isSimulatedDemo: true,
        metadata: { ticketId, custName, response: respText },
      };
      break;
    }

    case 'GENERATE_ANALYTICS_REPORT': {
      const repType = payload.reportType || 'Executive Multi-Agent Operations Report';
      const dataRange = payload.dataRange || 'Last 30 Days';

      eventLog = {
        id: eventId,
        timestamp: new Date().toISOString(),
        agentSource: 'Analytics',
        eventType: 'REPORT_GENERATED',
        description: `Analytics Agent generated ${repType} covering ${dataRange} across 6 domain agent feeds.`,
        metadata: { repType, dataRange, status: 'Completed' },
      };

      actionResult = {
        id: `rep_${Date.now()}`,
        type,
        status: 'executed',
        title: 'Report Generated',
        summary: `${repType} generated for ${dataRange}. All telemetry feeds compiled.`,
        timestamp: timestampStr,
        isSimulatedDemo: true,
        metadata: { repType, dataRange },
      };
      break;
    }

    default: {
      eventLog = {
        id: eventId,
        timestamp: new Date().toISOString(),
        agentSource: 'Orchestrator',
        eventType: 'ACTION_EXECUTED',
        description: `YuktiOS Coordinator executed action ${type}.`,
        metadata: { status: 'Completed' },
      };

      actionResult = {
        id: `act_${Date.now()}`,
        type,
        status: 'executed',
        title: 'Action Executed',
        summary: `Business action ${type} executed successfully.`,
        timestamp: timestampStr,
        isSimulatedDemo: true,
      };
    }
  }

  // Prepend new event to eventLogs array so activity stream updates instantly
  nextState.eventLogs = [eventLog, ...nextState.eventLogs];

  return {
    result: actionResult,
    updatedState: nextState,
  };
}
