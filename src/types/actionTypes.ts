export type ExecutableActionType =
  | 'CREATE_PURCHASE_ORDER'
  | 'SEND_PAYMENT_REMINDER'
  | 'GENERATE_INVOICE'
  | 'RUN_PAYROLL'
  | 'CREATE_MARKETING_CAMPAIGN'
  | 'RESPOND_TO_SUPPORT_TICKET'
  | 'GENERATE_ANALYTICS_REPORT';

export interface ActionPayload {
  // Inventory
  productId?: string;
  productName?: string;
  quantity?: number;
  unitCost?: number;
  totalAmount?: number;
  supplierName?: string;

  // Finance
  invoiceId?: string;
  invoiceNumber?: string;
  customerName?: string;

  // HR
  payrollPeriod?: string;
  employeeCount?: number;
  payrollAmount?: number;
  epfRate?: number;
  esiRate?: number;

  // Marketing
  campaignName?: string;
  targetSegment?: string;
  recommendedOffer?: string;
  estimatedAudience?: number;

  // Support
  ticketId?: string;
  supportCustomer?: string;
  supportIssue?: string;
  suggestedResponse?: string;

  // Analytics
  reportType?: string;
  dataRange?: string;

  // Generic
  reason?: string;
  agentsInvolved?: string[];
  confidence?: number;
}

export interface ActionResult {
  id: string;
  type: ExecutableActionType;
  status: 'created' | 'executed' | 'failed' | 'duplicate_prevented';
  title: string;
  summary: string;
  timestamp: string;
  isSimulatedDemo: boolean;
  metadata?: Record<string, any>;
  errorReason?: string;
}
