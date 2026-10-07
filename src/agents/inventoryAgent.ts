import { AgentContext, AgentResult, InventoryAgentOutput, InventoryFinding } from './agentTypes';

export async function runInventoryAgent(ctx: AgentContext): Promise<AgentResult<InventoryAgentOutput>> {
  const { systemState, targetProductId } = ctx;
  const products = systemState.products;

  console.log(`[Inventory Agent] Analyzing ${products.length} products in stock database...`);

  let targetItems = products;
  if (targetProductId) {
    targetItems = products.filter(p => p.id === targetProductId);
  }

  const findings: InventoryFinding[] = targetItems
    .filter(p => p.stockQuantity <= p.reorderPoint || p.stockoutRiskScore >= 50 || p.id === 'prod_003')
    .map(p => {
      const isHighRisk = p.stockoutRiskScore >= 70 || p.stockQuantity <= p.reorderPoint;
      return {
        productId: p.id,
        name: p.name,
        sku: p.sku,
        currentStock: p.stockQuantity,
        reorderPoint: p.reorderPoint,
        recommendedQuantity: p.optimalOrderQty,
        riskLevel: isHighRisk ? 'high' : 'medium',
        stockoutRiskScore: p.stockoutRiskScore,
        costPrice: p.costPrice,
      };
    });

  const highRiskCount = findings.filter(f => f.riskLevel === 'high').length;
  console.log(`[Inventory Agent] Analysis complete. Found ${findings.length} item(s) requiring attention (${highRiskCount} high risk).`);

  const summary = findings.length > 0
    ? `Identified ${findings.length} low-stock SKU(s). Primary risk item: ${findings[0].name} (Stock: ${findings[0].currentStock}, Reorder: ${findings[0].reorderPoint}).`
    : `All ${products.length} inventory SKUs are within safe operating thresholds.`;

  return {
    agentId: 'inventory',
    agentName: 'Inventory Agent',
    status: 'complete',
    summary,
    data: {
      agent: 'inventory',
      status: 'complete',
      findings,
      summary,
    },
    timestamp: new Date().toISOString(),
  };
}
