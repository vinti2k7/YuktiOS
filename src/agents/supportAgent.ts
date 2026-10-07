import { AgentContext, AgentResult, SupportAgentOutput, MarketingAgentOutput } from './agentTypes';

export async function runSupportAgent(
  ctx: AgentContext,
  marketingResult: AgentResult<MarketingAgentOutput>
): Promise<AgentResult<SupportAgentOutput>> {
  console.log(`[Support Agent] Analyzing support ticket history for target customer...`);

  const { systemState } = ctx;
  const customerId = marketingResult.data.customerId;
  const customerName = marketingResult.data.customerName;

  const tickets = systemState.supportTickets.filter(
    t => t.customerName.toLowerCase().includes(customerName.toLowerCase()) || customerName.toLowerCase().includes(t.customerName.toLowerCase())
  );

  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress');
  const highPriorityOpen = openTickets.filter(t => t.priority === 'high' || t.priority === 'urgent');

  let supportRisk: 'high' | 'medium' | 'low' = 'low';
  if (highPriorityOpen.length > 0 || openTickets.length >= 2) {
    supportRisk = 'high';
  } else if (openTickets.length > 0) {
    supportRisk = 'medium';
  }

  console.log(`[Support Agent] Found ${tickets.length} total ticket(s) for ${customerName} (${openTickets.length} open). Support risk: ${supportRisk.toUpperCase()}.`);

  const summary = `Found ${tickets.length} support ticket(s) for ${customerName}. ${openTickets.length} open ticket(s) requiring follow-up. Support risk: ${supportRisk.toUpperCase()}.`;

  return {
    agentId: 'support',
    agentName: 'Support Agent',
    status: 'complete',
    summary,
    data: {
      agent: 'support',
      status: 'complete',
      customerId,
      supportRisk,
      openTickets: openTickets.length,
      recentTickets: tickets.map(t => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        category: t.category,
        priority: t.priority,
        status: t.status,
      })),
      summary,
    },
    timestamp: new Date().toISOString(),
  };
}
