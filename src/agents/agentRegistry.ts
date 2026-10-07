import { AgentDefinition } from './agentTypes';
export { runInventoryAgent } from './inventoryAgent';
export { runAnalyticsAgent, runChurnAnalyticsAgent } from './analyticsAgent';
export { runFinanceAgent } from './financeAgent';
export { runMarketingAgent } from './marketingAgent';
export { runSupportAgent } from './supportAgent';
export { runHRAgent } from './hrAgent';
export { runCoordinatorWorkflow, runCustomerChurnWorkflow, runUnifiedOrchestrationWorkflow } from './coordinatorAgent';

export const registeredAgents: AgentDefinition[] = [
  {
    id: 'inventory',
    name: 'Inventory Agent',
    description: 'Monitors stock quantities, reorder points, and stockout risk scores.',
    status: 'Attention Required',
    capabilities: ['stock_analysis', 'reorder_detection', 'inventory_risk'],
  },
  {
    id: 'analytics',
    name: 'Analytics Agent',
    description: 'Evaluates demand trends, time-series forecasts, and risk confidence scores.',
    status: 'Active',
    capabilities: ['demand_forecasting', 'trend_analysis', 'risk_modeling'],
  },
  {
    id: 'finance',
    name: 'Finance Agent',
    description: 'Verifies purchasing capacity, working capital, and budget availability.',
    status: 'Active',
    capabilities: ['cash_flow_verification', 'budget_allocation', 'po_financial_check'],
  },
  {
    id: 'marketing',
    name: 'Marketing Agent',
    description: 'Analyzes customer purchase recency, order frequency, and RFM engagement.',
    status: 'Active',
    capabilities: ['rfm_analysis', 'engagement_tracking', 'churn_signals'],
  },
  {
    id: 'support',
    name: 'Support Agent',
    description: 'Monitors open customer support tickets, priority levels, and sentiment.',
    status: 'Active',
    capabilities: ['ticket_triage', 'sentiment_analysis', 'support_history'],
  },
  {
    id: 'coordinator',
    name: 'YuktiOS Coordinator',
    description: 'Synthesizes multi-agent consensus and structures actionable recommendations.',
    status: 'Active',
    capabilities: ['workflow_orchestration', 'consensus_synthesis', 'recommendation_generation'],
  },
];
