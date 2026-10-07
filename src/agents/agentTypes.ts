import { SystemState, Customer, SupportTicket, EventLogItem } from '../types';

export interface AgentContext {
  systemState: SystemState;
  targetProductId?: string;
  targetCustomerId?: string;
}

export interface AgentResult<T = any> {
  agentId: string;
  agentName: string;
  status: 'complete' | 'error' | 'skipped';
  summary: string;
  data: T;
  timestamp: string;
}

export interface InventoryFinding {
  productId: string;
  name: string;
  sku: string;
  currentStock: number;
  reorderPoint: number;
  recommendedQuantity: number;
  riskLevel: 'high' | 'medium' | 'low';
  stockoutRiskScore: number;
  costPrice: number;
}

export interface InventoryAgentOutput {
  agent: 'inventory';
  status: 'complete' | 'error';
  findings: InventoryFinding[];
  summary: string;
}

export interface AnalyticsAgentOutput {
  agent: 'analytics';
  status: 'complete' | 'error';
  forecast: {
    demandChangePercent: number;
    horizonDays: number;
    estimatedStockoutDays: number;
  };
  riskLevel: 'high' | 'medium' | 'low';
  confidence: number;
  summary: string;
}

export interface FinanceAgentOutput {
  agent: 'finance';
  status: 'complete' | 'error';
  estimatedCost: number;
  cashSurplus: number;
  budgetAvailable: boolean;
  risk: 'low' | 'medium' | 'high';
  approvalRecommendation: string;
  summary: string;
}

export interface WorkflowOutput {
  workflowId: string;
  status: 'complete' | 'error';
  targetProduct: {
    id: string;
    name: string;
    sku: string;
  };
  agents: {
    id: string;
    name: string;
    status: string;
    summary: string;
  }[];
  recommendation: {
    title: string;
    reason: string;
  };
  confidence: number;
  evidence: {
    demandForecast: string;
    currentStock: number;
    reorderPoint: number;
    stockoutDays: number;
  };
  recommendedAction: {
    type: string;
    productName: string;
    quantity: number;
    estimatedValue: number;
    supplier: string;
  };
  timestamp: string;
}

export interface MarketingAgentOutput {
  agent: 'marketing';
  status: 'complete' | 'error';
  customerId: string;
  customerName: string;
  engagementLevel: 'low' | 'medium' | 'high';
  rfmSegment: string;
  lastPurchaseDaysAgo: number;
  signals: string[];
  summary: string;
}

export interface SupportAgentOutput {
  agent: 'support';
  status: 'complete' | 'error';
  customerId: string;
  supportRisk: 'high' | 'medium' | 'low';
  openTickets: number;
  recentTickets: { id: string; ticketNumber: string; category: string; priority: string; status: string }[];
  summary: string;
}

export interface ChurnAnalyticsAgentOutput {
  agent: 'analytics';
  status: 'complete' | 'error';
  churnRiskScore: number;
  riskLevel: 'high' | 'medium' | 'low';
  confidence: number;
  summary: string;
}

export interface ChurnWorkflowOutput {
  workflowId: string;
  status: 'complete' | 'error';
  customerId: string;
  customerName: string;
  company: string;
  churnRiskScore: number;
  confidence: number;
  evidence: {
    recency: string;
    openTicketsCount: number;
    rfmSegment: string;
    lifetimeValue: string;
  };
  agents: {
    id: string;
    name: string;
    status: string;
    summary: string;
  }[];
  recommendation: {
    title: string;
    reason: string;
  };
  recommendedActions: string[];
  timestamp: string;
}

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Processing' | 'Idle' | 'Attention Required';
  capabilities: string[];
}

export interface UnifiedAgentResult {
  agentId: 'finance' | 'inventory' | 'hr' | 'marketing' | 'support' | 'analytics' | 'coordinator';
  agentName: string;
  status: 'complete' | 'failed' | 'in_progress';
  task: string;
  findings: string[];
  recommendation: string;
  confidence: number;
  actionAvailable: boolean;
  actionType?: 'inventory' | 'customer_risk' | 'cash_flow' | 'payroll' | 'support' | 'daily_focus' | 'generic';
  actionPayload?: Record<string, any>;
}

export interface CoordinatorWorkflowResult {
  workflowId: string;
  query: string;
  status: 'complete' | 'error';
  answer: string;
  insights: {
    title: string;
    value: string;
    description: string;
    severity: 'healthy' | 'warning' | 'critical' | 'neutral';
  }[];
  agentsConsulted: {
    agent: string;
    contribution: string;
    status: string;
  }[];
  recommendation: {
    title: string;
    description: string;
    confidence: number;
  };
  actionAvailable: boolean;
  actionType: 'inventory' | 'customer_risk' | 'cash_flow' | 'payroll' | 'support' | 'daily_focus' | 'generic';
  timestamp: string;
}
