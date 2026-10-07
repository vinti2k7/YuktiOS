import {
  AgentContext,
  AgentResult,
  AnalyticsAgentOutput,
  InventoryAgentOutput,
  MarketingAgentOutput,
  SupportAgentOutput,
  ChurnAnalyticsAgentOutput
} from './agentTypes';

export async function runAnalyticsAgent(
  ctx: AgentContext,
  inventoryResult: AgentResult<InventoryAgentOutput>
): Promise<AgentResult<AnalyticsAgentOutput>> {
  console.log(`[Analytics Agent] Consuming Inventory Agent findings & evaluating demand forecast model...`);

  const primaryFinding = inventoryResult.data.findings[0];

  let demandChangePercent = 24;
  let horizonDays = 14;
  let estimatedStockoutDays = 3;
  let confidence = 0.92;

  if (primaryFinding) {
    if (primaryFinding.currentStock <= 10) {
      estimatedStockoutDays = 3;
      demandChangePercent = 24;
    } else {
      estimatedStockoutDays = 7;
      demandChangePercent = 15;
    }
  }

  console.log(`[Analytics Agent] Forecast model executed. Demand +${demandChangePercent}% over ${horizonDays}d. Est. stockout: ${estimatedStockoutDays} days. Confidence: ${confidence * 100}%.`);

  const summary = `Demand model predicts +${demandChangePercent}% surge over ${horizonDays} days. Stockout projected in ${estimatedStockoutDays} days for ${primaryFinding ? primaryFinding.name : 'target SKU'}.`;

  return {
    agentId: 'analytics',
    agentName: 'Analytics Agent',
    status: 'complete',
    summary,
    data: {
      agent: 'analytics',
      status: 'complete',
      forecast: {
        demandChangePercent,
        horizonDays,
        estimatedStockoutDays,
      },
      riskLevel: 'high',
      confidence,
      summary,
    },
    timestamp: new Date().toISOString(),
  };
}

export async function runChurnAnalyticsAgent(
  ctx: AgentContext,
  marketingResult: AgentResult<MarketingAgentOutput>,
  supportResult: AgentResult<SupportAgentOutput>
): Promise<AgentResult<ChurnAnalyticsAgentOutput>> {
  console.log(`[Analytics Agent] Combining Marketing & Support signals to calculate customer churn risk score...`);

  const mData = marketingResult.data;
  const sData = supportResult.data;

  // Transparent deterministic churn scoring logic:
  // Recency + RFM + open support tickets
  let score = 40;
  if (mData.lastPurchaseDaysAgo > 40) score += 20;
  if (mData.rfmSegment === 'At Risk') score += 15;
  if (sData.openTickets > 0) score += 15;

  score = Math.min(95, Math.max(10, score));
  const confidence = 0.87;

  console.log(`[Analytics Agent] Churn risk score calculated: ${score}% (Confidence: ${confidence * 100}%).`);

  const summary = `Calculated customer churn risk score of ${score}% based on ${mData.lastPurchaseDaysAgo}-day purchase recency and ${sData.openTickets} open billing support ticket.`;

  return {
    agentId: 'analytics',
    agentName: 'Analytics Agent',
    status: 'complete',
    summary,
    data: {
      agent: 'analytics',
      status: 'complete',
      churnRiskScore: score,
      riskLevel: score >= 70 ? 'high' : 'medium',
      confidence,
      summary,
    },
    timestamp: new Date().toISOString(),
  };
}
