import { AgentContext, AgentResult, MarketingAgentOutput } from './agentTypes';

export async function runMarketingAgent(ctx: AgentContext): Promise<AgentResult<MarketingAgentOutput>> {
  console.log(`[Marketing Agent] Analyzing customer RFM engagement signals...`);

  const { systemState, targetCustomerId } = ctx;
  const customers = systemState.customers;

  let customer = customers.find(c => c.id === targetCustomerId);
  if (!customer) {
    // Pick the highest churn risk customer
    customer = [...customers].sort((a, b) => b.churnRiskScore - a.churnRiskScore)[0];
  }

  if (!customer) {
    return {
      agentId: 'marketing',
      agentName: 'Marketing Agent',
      status: 'error',
      summary: 'No customer data available for analysis.',
      data: {
        agent: 'marketing',
        status: 'error',
        customerId: '',
        customerName: 'Unknown',
        engagementLevel: 'low',
        rfmSegment: 'Unknown',
        lastPurchaseDaysAgo: 0,
        signals: ['No customer record found'],
        summary: 'No customer data available.',
      },
      timestamp: new Date().toISOString(),
    };
  }

  const signals: string[] = [];
  let engagementLevel: 'low' | 'medium' | 'high' = 'high';

  if (customer.lastPurchaseDaysAgo > 30) {
    signals.push(`Inactivity: ${customer.lastPurchaseDaysAgo} days since last order`);
    engagementLevel = 'low';
  }

  if (customer.rfmSegment === 'At Risk' || customer.rfmSegment === 'Need Attention' || customer.rfmSegment === 'Lost') {
    signals.push(`RFM Segment classified as ${customer.rfmSegment}`);
    engagementLevel = 'low';
  }

  if (customer.orderCount < 5) {
    signals.push(`Low order frequency: ${customer.orderCount} total orders`);
  }

  console.log(`[Marketing Agent] Analyzed customer ${customer.name} (${customer.company}). Engagement: ${engagementLevel.toUpperCase()}. Signals: ${signals.length}.`);

  const summary = `Analyzed ${customer.name} (${customer.company}). RFM Segment: ${customer.rfmSegment}. Recency: ${customer.lastPurchaseDaysAgo} days.`;

  return {
    agentId: 'marketing',
    agentName: 'Marketing Agent',
    status: 'complete',
    summary,
    data: {
      agent: 'marketing',
      status: 'complete',
      customerId: customer.id,
      customerName: customer.name,
      engagementLevel,
      rfmSegment: customer.rfmSegment,
      lastPurchaseDaysAgo: customer.lastPurchaseDaysAgo,
      signals,
      summary,
    },
    timestamp: new Date().toISOString(),
  };
}
