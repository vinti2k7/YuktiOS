export type AIExecutionMode = 'live' | 'demo';

export type AgentName =
  | 'Inventory Agent'
  | 'Finance Agent'
  | 'HR Agent'
  | 'Marketing Agent'
  | 'Support Agent'
  | 'Analytics Agent'
  | 'YuktiOS Coordinator';

export interface StructuredInsight {
  title: string;
  value: string;
  description: string;
  severity: 'healthy' | 'warning' | 'critical' | 'neutral';
}

export interface AgentConsultation {
  agent: AgentName | string;
  task: string;
  contribution: string;
  status: 'complete' | 'completed' | 'running' | 'failed';
  findings: string[];
  recommendation?: string;
  confidence?: number;
}

export interface AskYuktiOSAIResponse {
  answer: string;
  insights: StructuredInsight[];
  agentsConsulted: AgentConsultation[];
  recommendation: {
    title: string;
    description: string;
    confidence: number;
  };
  actionAvailable: boolean;
  actionType: 'inventory' | 'customer_risk' | 'cash_flow' | 'payroll' | 'support' | 'daily_focus' | 'generic';
  aiMode: AIExecutionMode;
  reasoningFactors?: string[];
}

export interface QueryRoutingResult {
  targetAgents: AgentName[];
  workflowName: string;
}
