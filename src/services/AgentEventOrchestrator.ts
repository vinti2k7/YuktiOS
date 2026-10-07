import { AgentEventBus, AgentEvent } from './AgentEventBus';
import { SystemState } from '../types';

export interface WorkflowStep {
  agent: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  task: string;
  startedAt?: string;
  completedAt?: string;
  result?: string;
}

export interface WorkflowState {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  steps: WorkflowStep[];
  finalRecommendation?: string;
  confidence?: number;
  failureReason?: string;
}

// Global active workflow state
let activeInventoryWorkflow: WorkflowState = {
  id: 'wf_inv_default',
  name: 'Inventory Stockout Prevention',
  status: 'completed',
  startedAt: new Date(Date.now() - 300000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  completedAt: new Date(Date.now() - 240000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  steps: [
    {
      agent: 'Inventory Agent',
      task: 'Stockout Risk Detection',
      status: 'completed',
      startedAt: '09:41:02 AM',
      completedAt: '09:41:03 AM',
      result: 'Low stock detected (8 units remaining, reorder threshold 25).',
    },
    {
      agent: 'Analytics Agent',
      task: 'Demand Forecasting',
      status: 'completed',
      startedAt: '09:41:04 AM',
      completedAt: '09:41:05 AM',
      result: 'Prophet time-series model predicts +24% surge in 14 days.',
    },
    {
      agent: 'Finance Agent',
      task: 'Budget Verification',
      status: 'completed',
      startedAt: '09:41:06 AM',
      completedAt: '09:41:07 AM',
      result: 'Verified ₹85,000 budget available out of ₹5,40,000 surplus.',
    },
    {
      agent: 'YuktiOS Coordinator',
      task: 'Consensus Synthesis',
      status: 'completed',
      startedAt: '09:41:08 AM',
      completedAt: '09:41:10 AM',
      result: 'Consensus reached. Recommended Purchase Order for 100 units.',
    },
  ],
  finalRecommendation: 'Create Purchase Order for 100 units of Industrial Sensor Enclosure IP67',
  confidence: 94,
};

type WorkflowChangeListener = (state: WorkflowState) => void;
const workflowListeners: WorkflowChangeListener[] = [];

export function getActiveWorkflowState(): WorkflowState {
  return activeInventoryWorkflow;
}

export function subscribeWorkflowState(listener: WorkflowChangeListener): () => void {
  workflowListeners.push(listener);
  listener(activeInventoryWorkflow);
  return () => {
    const idx = workflowListeners.indexOf(listener);
    if (idx !== -1) workflowListeners.splice(idx, 1);
  };
}

function notifyWorkflowListeners() {
  workflowListeners.forEach((l) => l(activeInventoryWorkflow));
}

/**
 * Execute automated cross-agent workflow
 */
export async function triggerCrossAgentWorkflow(
  systemState: SystemState,
  simulateFinanceFailure = false
): Promise<WorkflowState> {
  const workflowId = `wf_inv_${Date.now()}`;
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  activeInventoryWorkflow = {
    id: workflowId,
    name: 'Inventory Stockout Prevention',
    status: 'running',
    startedAt: now,
    steps: [
      { agent: 'Inventory Agent', task: 'Stockout Risk Detection', status: 'running', startedAt: now },
      { agent: 'Analytics Agent', task: 'Demand Forecasting', status: 'pending' },
      { agent: 'Finance Agent', task: 'Budget Verification', status: 'pending' },
      { agent: 'YuktiOS Coordinator', task: 'Consensus Synthesis', status: 'pending' },
    ],
  };
  notifyWorkflowListeners();

  // STEP 1: Inventory Agent detects stockout
  await new Promise((r) => setTimeout(r, 600));
  const lowProd = systemState.products.find((p) => p.stockQuantity <= p.reorderPoint) || {
    name: 'Industrial Sensor Enclosure IP67',
    stockQuantity: 8,
    reorderPoint: 25,
  };

  AgentEventBus.emit({
    id: `evt_inv_${Date.now()}`,
    type: 'INVENTORY_STOCKOUT_RISK',
    sourceAgent: 'Inventory Agent',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    payload: {
      product: lowProd.name,
      currentStock: lowProd.stockQuantity,
      reorderPoint: lowProd.reorderPoint,
      forecastDemand: 65,
    },
  });

  activeInventoryWorkflow.steps[0] = {
    agent: 'Inventory Agent',
    task: 'Stockout Risk Detection',
    status: 'completed',
    startedAt: now,
    completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    result: `Stockout risk detected for ${lowProd.name} (${lowProd.stockQuantity} units remaining).`,
  };
  activeInventoryWorkflow.steps[1].status = 'running';
  activeInventoryWorkflow.steps[1].startedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  notifyWorkflowListeners();

  // STEP 2: Analytics Agent forecasts demand
  await new Promise((r) => setTimeout(r, 700));
  AgentEventBus.emit({
    id: `evt_ana_${Date.now()}`,
    type: 'DEMAND_FORECAST_UPDATED',
    sourceAgent: 'Analytics Agent',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    payload: {
      product: lowProd.name,
      demandIncrease: 24,
      forecastPeriod: 14,
    },
  });

  activeInventoryWorkflow.steps[1] = {
    agent: 'Analytics Agent',
    task: 'Demand Forecasting',
    status: 'completed',
    startedAt: activeInventoryWorkflow.steps[1].startedAt,
    completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    result: 'Prophet time-series model predicts +24% demand surge over next 14 days.',
  };
  activeInventoryWorkflow.steps[2].status = 'running';
  activeInventoryWorkflow.steps[2].startedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  notifyWorkflowListeners();

  // STEP 3: Finance Agent budget check (handles simulated failure)
  await new Promise((r) => setTimeout(r, 700));

  if (simulateFinanceFailure) {
    AgentEventBus.emit({
      id: `evt_fin_${Date.now()}`,
      type: 'BUDGET_VERIFICATION_FAILED',
      sourceAgent: 'Finance Agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      payload: {
        product: lowProd.name,
        requiredBudget: 85000,
        availableCash: 40000,
      },
    });

    activeInventoryWorkflow.steps[2] = {
      agent: 'Finance Agent',
      task: 'Budget Verification',
      status: 'failed',
      startedAt: activeInventoryWorkflow.steps[2].startedAt,
      completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      result: 'Failed: Budget verification constrained (₹85,000 required vs ₹40,000 available).',
    };

    activeInventoryWorkflow.steps[3] = {
      agent: 'YuktiOS Coordinator',
      task: 'Consensus Synthesis',
      status: 'failed',
      result: 'Unable to reach consensus because Finance Agent failed to verify available budget.',
    };

    activeInventoryWorkflow.status = 'failed';
    activeInventoryWorkflow.failureReason = 'Unable to reach consensus because Finance Agent failed to verify available budget.';
    activeInventoryWorkflow.completedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    notifyWorkflowListeners();
    return activeInventoryWorkflow;
  }

  // Normal Finance Success
  AgentEventBus.emit({
    id: `evt_fin_${Date.now()}`,
    type: 'BUDGET_VERIFIED',
    sourceAgent: 'Finance Agent',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    payload: {
      product: lowProd.name,
      approvedAmount: 85000,
      cashSurplus: 540000,
    },
  });

  activeInventoryWorkflow.steps[2] = {
    agent: 'Finance Agent',
    task: 'Budget Verification',
    status: 'completed',
    startedAt: activeInventoryWorkflow.steps[2].startedAt,
    completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    result: 'Verified ₹85,000 budget pre-approved out of ₹5,40,000 surplus.',
  };
  activeInventoryWorkflow.steps[3].status = 'running';
  activeInventoryWorkflow.steps[3].startedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  notifyWorkflowListeners();

  // STEP 4: YuktiOS Coordinator Consensus Synthesis
  await new Promise((r) => setTimeout(r, 700));
  AgentEventBus.emit({
    id: `evt_coord_${Date.now()}`,
    type: 'CONSENSUS_REACHED',
    sourceAgent: 'YuktiOS Coordinator',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    payload: {
      recommendation: `Create Purchase Order for 100 units of ${lowProd.name}`,
      confidence: 94,
    },
  });

  activeInventoryWorkflow.steps[3] = {
    agent: 'YuktiOS Coordinator',
    task: 'Consensus Synthesis',
    status: 'completed',
    startedAt: activeInventoryWorkflow.steps[3].startedAt,
    completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    result: 'Consensus reached across 3 domain agents (94% confidence).',
  };

  activeInventoryWorkflow.status = 'completed';
  activeInventoryWorkflow.completedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  activeInventoryWorkflow.finalRecommendation = `Create Purchase Order for 100 units of ${lowProd.name}`;
  activeInventoryWorkflow.confidence = 94;

  notifyWorkflowListeners();
  return activeInventoryWorkflow;
}
