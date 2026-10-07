import React, { useState, useEffect } from 'react';
import { 
  subscribeWorkflowState, 
  triggerCrossAgentWorkflow, 
  WorkflowState, 
  getActiveWorkflowState 
} from '../services/AgentEventOrchestrator';
import { SystemState } from '../types';
import { RecommendationModal } from './RecommendationModal';
import { 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  ShieldAlert, 
  Filter, 
  Boxes, 
  IndianRupee, 
  Users, 
  Megaphone, 
  Headphones, 
  Zap, 
  Play, 
  ChevronRight,
  Workflow,
  ArrowDown,
  Loader2,
  Cpu,
  X
} from 'lucide-react';

interface AICommandCenterProps {
  state: SystemState;
  onNavigateTab: (tab: any) => void;
  onReorderStock: (productId: string) => void;
  onOpenAskAIWithQuery?: (query: string) => void;
}

export const AICommandCenter: React.FC<AICommandCenterProps> = ({
  state,
  onNavigateTab,
  onReorderStock,
  onOpenAskAIWithQuery,
}) => {
  const [isRecModalOpen, setIsRecModalOpen] = useState(false);
  const [activeWorkflowType, setActiveWorkflowType] = useState<'inventory' | 'customer_churn'>('inventory');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [isInventoryExecuted, setIsInventoryExecuted] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Cross-Agent Event Workflow State
  const [liveWorkflow, setLiveWorkflow] = useState<WorkflowState>(getActiveWorkflowState());
  const [isSimulatingWorkflow, setIsSimulatingWorkflow] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeWorkflowState((latestState) => {
      setLiveWorkflow(latestState);
    });
    return () => unsubscribe();
  }, []);

  const handleRunEventPipeline = async (failFinance = false) => {
    setIsSimulatingWorkflow(true);
    await triggerCrossAgentWorkflow(state, failFinance);
    setIsSimulatingWorkflow(false);
  };

  const openAnomalies = state.anomalyAlerts.filter((a) => a.status === 'open');

  const agentsTelemetry = [
    {
      name: 'Finance Agent',
      domain: 'Invoicing & Cash Flow',
      tab: 'finance',
      icon: IndianRupee,
      status: 'Active',
      statusColor: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40',
      statusDot: 'bg-emerald-500',
      currentTask: 'Monitoring receivables & GST compliance',
      tasksCompleted: `${state.invoices.length} Invoices`,
      lastActive: '2m ago',
    },
    {
      name: 'Inventory Agent',
      domain: 'Stock & Demand Forecasting',
      tab: 'inventory',
      icon: Boxes,
      status: isInventoryExecuted ? 'Active' : 'Attention Needed',
      statusColor: isInventoryExecuted ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' : 'bg-amber-950/40 text-amber-300 border-amber-800/40',
      statusDot: isInventoryExecuted ? 'bg-emerald-500' : 'bg-amber-500',
      currentTask: isInventoryExecuted ? 'Restock order executed' : 'Monitoring stock velocity',
      tasksCompleted: `${state.products.length} SKUs Audited`,
      lastActive: '1m ago',
    },
    {
      name: 'HR Agent',
      domain: 'Attendance & Statutory Payroll',
      tab: 'hr',
      icon: Users,
      status: 'Active',
      statusColor: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40',
      statusDot: 'bg-emerald-500',
      currentTask: 'EPF (12%) / ESI (0.75%) calculation',
      tasksCompleted: `${state.employees.length} Staff Synced`,
      lastActive: '4m ago',
    },
    {
      name: 'Marketing Agent',
      domain: 'RFM Clustering & Outreach',
      tab: 'marketing',
      icon: Megaphone,
      status: 'Active',
      statusColor: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40',
      statusDot: 'bg-emerald-500',
      currentTask: 'RFM Segment retention scoring',
      tasksCompleted: `${state.campaigns.length} Campaigns`,
      lastActive: '3m ago',
    },
    {
      name: 'Support Agent',
      domain: 'RAG Knowledge Base & Triage',
      tab: 'support',
      icon: Headphones,
      status: 'Active',
      statusColor: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40',
      statusDot: 'bg-emerald-500',
      currentTask: 'FAQ vector store query retrieval',
      tasksCompleted: `${state.supportTickets.length} Tickets`,
      lastActive: 'Just now',
    },
    {
      name: 'Analytics Agent',
      domain: 'Central Orchestration Bus',
      tab: 'analytics',
      icon: Activity,
      status: 'Active',
      statusColor: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40',
      statusDot: 'bg-emerald-500',
      currentTask: 'Cross-agent anomaly detection',
      tasksCompleted: `${openAnomalies.length} Alerts Logged`,
      lastActive: 'Just now',
    },
  ];

  const otherWorkflows = [
    {
      title: 'Customer Churn Analysis',
      agents: ['Marketing', 'Support', 'Analytics', 'Coordinator'],
      description: 'RFM segmentation & retention discount strategy',
    },
    {
      title: 'Inventory Optimization',
      agents: ['Inventory', 'Analytics', 'Finance', 'Coordinator'],
      description: 'Dynamic reorder point calculation & safety stock balancing',
    },
    {
      title: 'Invoice & Collections',
      agents: ['Finance', 'Support', 'Analytics', 'Coordinator'],
      description: 'Automated payment reminders & cash surplus allocation',
    },
    {
      title: 'Payroll Processing',
      agents: ['HR', 'Finance', 'Coordinator'],
      description: 'EPF/ESI compliance verification & disbursement batch',
    },
  ];

  const filteredEvents = state.eventLogs.filter((evt) => {
    if (eventFilter === 'all') return true;
    return evt.agentSource.toLowerCase() === eventFilter.toLowerCase();
  });

  const handleExecuteWorkflowAction = async () => {
    await onReorderStock('prod_003');
    setIsInventoryExecuted(true);

    const newLog = {
      id: `log_${Date.now()}`,
      timestamp: 'Just now',
      agentSource: 'Orchestrator' as const,
      eventType: 'PURCHASE_ORDER_CREATED',
      description: 'Multi-agent consensus created purchase order for 100 units of SKU-SENS-IP67.',
    };
    state.eventLogs.unshift(newLog);

    setToastMessage('Purchase Order PO-2026-100 created successfully.');
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-950/70 border border-emerald-800/70 text-emerald-200 px-4 py-3 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-white">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-emerald-900/50 rounded text-emerald-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-indigo-400 bg-indigo-950/40 border border-indigo-800/50 px-2 py-0.5 rounded">
              Command Center
            </span>
            <span className="text-xs text-slate-400">Central Multi-Agent Orchestration Layer</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1.5">Operations & Agent Telemetry</h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            Monitor real-time status across all six domain agents, trigger multi-agent consensus workflows, and review live audit logs.
          </p>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0 text-xs">
          <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-center">
            <span className="text-[10px] text-slate-500 block uppercase">Agent Status</span>
            <span className="text-emerald-400 font-semibold text-xs flex items-center justify-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              6 Online
            </span>
          </div>
          <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-center">
            <span className="text-[10px] text-slate-500 block uppercase">Active Tasks</span>
            <span className="text-slate-200 font-semibold text-xs mt-0.5 block">2 Running</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-center">
            <span className="text-[10px] text-slate-500 block uppercase">Pending Action</span>
            <span className="text-amber-400 font-semibold text-xs mt-0.5 block">
              {isInventoryExecuted ? '0 Pending' : '1 Pending'}
            </span>
          </div>
          <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-center">
            <span className="text-[10px] text-slate-500 block uppercase">System Health</span>
            <span className="text-emerald-400 font-semibold text-xs mt-0.5 block">92 / 100</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: DOMAIN AGENTS TELEMETRY */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            Domain Agents Telemetry
          </h3>
          <span className="text-xs text-slate-400 hidden sm:inline">Click any agent to open its dedicated workspace</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {agentsTelemetry.map((agent) => {
            const Icon = agent.icon;
            return (
              <div
                key={agent.name}
                onClick={() => onNavigateTab(agent.tab)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-indigo-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded border flex items-center gap-1 ${agent.statusColor}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${agent.statusDot}`} />
                      {agent.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white mt-2.5">
                    {agent.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{agent.domain}</p>

                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 mt-2.5 text-xs">
                    <span className="text-[10px] text-slate-500 block">Current Focus:</span>
                    <p className="text-slate-300 truncate mt-0.5">{agent.currentTask}</p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-300 font-medium">{agent.tasksCompleted}</span>
                    <span className="text-[10px] text-slate-500 block">{agent.lastActive}</span>
                  </div>
                  <span className="text-xs font-medium text-indigo-400 flex items-center gap-1">
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: MULTI-AGENT DECISION WORKFLOW PIPELINE */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-purple-400 bg-purple-950/40 border border-purple-800/50 px-2 py-0.5 rounded flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                Orchestration Runtime
              </span>
            </div>
            <h3 className="text-base font-semibold text-white mt-1 flex items-center gap-2">
              <Workflow className="w-4 h-4 text-indigo-400" />
              Multi-Agent Decision Workflow
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Autonomous consensus loop: Stock Audit → Demand Forecast → Cash Flow Check → Coordinator Recommendation
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 px-2.5 py-1 rounded-lg">
              92% Confidence
            </span>
            <span className="text-xs font-medium bg-purple-950/40 text-purple-300 border border-purple-800/40 px-2.5 py-1 rounded-lg">
              Consensus Reached
            </span>
          </div>
        </div>

        {/* WORKFLOW PIPELINE CARD */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Workflow 01</span>
              <h4 className="text-sm font-semibold text-white">{liveWorkflow.name}</h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRunEventPipeline(false)}
                disabled={isSimulatingWorkflow}
                className="py-1 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition disabled:opacity-50 flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Run Pipeline</span>
              </button>

              <button
                onClick={() => handleRunEventPipeline(true)}
                disabled={isSimulatingWorkflow}
                className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition disabled:opacity-50 flex items-center gap-1"
              >
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                <span>Simulate Failure</span>
              </button>

              <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                liveWorkflow.status === 'completed'
                  ? 'bg-purple-950/40 text-purple-300 border-purple-800/40'
                  : liveWorkflow.status === 'failed'
                  ? 'bg-rose-950/40 text-rose-300 border-rose-800/40'
                  : 'bg-indigo-950/40 text-indigo-300 border-indigo-800/40'
              }`}>
                {liveWorkflow.status === 'completed'
                  ? 'Consensus Reached'
                  : liveWorkflow.status === 'failed'
                  ? 'Workflow Failed'
                  : 'Running...'}
              </span>
            </div>
          </div>

          {/* Failure Error Banner */}
          {liveWorkflow.status === 'failed' && (
            <div className="bg-rose-950/40 border border-rose-800/50 p-3 rounded-lg flex items-center justify-between text-xs text-rose-300">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{liveWorkflow.failureReason || 'Unable to reach consensus: Finance Agent failed to verify available budget.'}</span>
              </div>
              <button
                onClick={() => handleRunEventPipeline(false)}
                className="py-1 px-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* Node Pipeline Grid */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
            {liveWorkflow.steps.map((step, idx) => {
              const Icon = step.agent.includes('Inventory')
                ? Boxes
                : step.agent.includes('Analytics')
                ? Activity
                : step.agent.includes('Finance')
                ? IndianRupee
                : Cpu;

              const isStepComplete = step.status === 'completed';
              const isStepRunning = step.status === 'running';
              const isStepFailed = step.status === 'failed';

              return (
                <React.Fragment key={step.agent}>
                  <div
                    className={`flex-1 p-3 rounded-xl border transition ${
                      isStepFailed
                        ? 'border-rose-800/60 bg-rose-950/20 text-rose-200'
                        : isStepRunning
                        ? 'border-indigo-600/60 bg-indigo-950/30 text-indigo-200'
                        : isStepComplete
                        ? 'border-slate-800 bg-slate-900 text-slate-200'
                        : 'border-slate-800/60 bg-slate-900/40 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        Step {idx + 1}
                      </span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                        isStepFailed
                          ? 'bg-rose-950/40 text-rose-300 border-rose-800/40'
                          : isStepComplete
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                          : isStepRunning
                          ? 'bg-indigo-950/40 text-indigo-300 border-indigo-800/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {isStepFailed ? (
                          <ShieldAlert className="w-3 h-3 text-rose-400" />
                        ) : isStepComplete ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : isStepRunning ? (
                          <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
                        ) : null}
                        {isStepFailed
                          ? 'Failed'
                          : isStepComplete
                          ? 'Done'
                          : isStepRunning
                          ? 'Running'
                          : 'Pending'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <Icon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <h5 className="text-xs font-semibold text-white truncate">
                        {step.agent}
                      </h5>
                    </div>

                    <p className="text-[11px] text-slate-300 font-medium mt-1 leading-tight">
                      {step.task}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                      {step.result || (isStepRunning ? 'Analyzing telemetry...' : 'Awaiting event signal')}
                    </p>
                  </div>

                  {idx < liveWorkflow.steps.length - 1 && (
                    <div className="flex items-center justify-center text-slate-600 my-0.5 lg:my-0 shrink-0">
                      <ArrowRight className="w-4 h-4 hidden lg:block" />
                      <ArrowDown className="w-4 h-4 lg:hidden" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}

            {/* FINAL ACTION NODE */}
            <div className="flex-1 p-3 rounded-xl border border-slate-800 bg-slate-900 text-white flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[10px] font-mono text-indigo-400 font-medium uppercase">
                    Decision Action
                  </span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    liveWorkflow.status === 'completed'
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                      : 'bg-amber-950/40 text-amber-300 border border-amber-800/40'
                  }`}>
                    {liveWorkflow.status === 'completed' ? 'Ready' : 'Blocked'}
                  </span>
                </div>

                <h5 className="text-xs font-semibold text-white">Purchase Order: 100 units</h5>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">Industrial Sensor Enclosure IP67 • ₹85,000</p>
              </div>

              {liveWorkflow.status === 'completed' ? (
                <button
                  onClick={() => {
                    setActiveWorkflowType('inventory');
                    setIsRecModalOpen(true);
                  }}
                  className="mt-2.5 w-full py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1 transition"
                >
                  <span>Review & Execute</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              ) : (
                <div className="mt-2.5 w-full py-1 px-2 rounded bg-slate-800 text-slate-400 text-xs text-center">
                  Awaiting Pipeline
                </div>
              )}
            </div>
          </div>
        </div>

        {/* OTHER WORKFLOW CONFIGURATIONS */}
        <div className="pt-3 border-t border-slate-800">
          <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2.5">
            Configured Multi-Agent Workflows
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {otherWorkflows.map((wf) => (
              <div
                key={wf.title}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 text-xs flex flex-col justify-between"
              >
                <div>
                  <h5 className="font-semibold text-white text-xs">{wf.title}</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">{wf.description}</p>

                  <div className="flex items-center flex-wrap gap-1 pt-2 text-[10px] font-mono text-slate-500">
                    {wf.agents.map((ag, i) => (
                      <React.Fragment key={ag}>
                        <span className="bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800">
                          {ag}
                        </span>
                        {i < wf.agents.length - 1 && <span>→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {wf.title === 'Customer Churn Analysis' && (
                  <button
                    onClick={() => {
                      setActiveWorkflowType('customer_churn');
                      setIsRecModalOpen(true);
                    }}
                    className="mt-2.5 w-full py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center justify-center gap-1 transition"
                  >
                    <span>Analyze Churn</span>
                    <ArrowRight className="w-3 h-3 text-cyan-400" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SECTION 3: LIVE AGENT ACTIVITY STREAM & QUICK ACTIONS SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Live Agent Activity (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Live Agent Activity Stream
              </h3>
              <p className="text-xs text-slate-400">Append-only audit trail of multi-agent operations</p>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 px-2.5 py-1 focus:outline-none"
              >
                <option value="all">All Agents</option>
                <option value="finance">Finance</option>
                <option value="inventory">Inventory</option>
                <option value="hr">HR</option>
                <option value="marketing">Marketing</option>
                <option value="support">Support</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-0.5">
            {filteredEvents.map((evt) => {
              const agentColors: Record<string, string> = {
                Finance: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40',
                Inventory: 'bg-amber-950/40 text-amber-300 border-amber-800/40',
                HR: 'bg-purple-950/40 text-purple-300 border-purple-800/40',
                Marketing: 'bg-cyan-950/40 text-cyan-300 border-cyan-800/40',
                Support: 'bg-rose-950/40 text-rose-300 border-rose-800/40',
                Orchestrator: 'bg-indigo-950/40 text-indigo-300 border-indigo-800/40',
              };

              return (
                <div
                  key={evt.id}
                  className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border shrink-0 mt-0.5 ${
                        agentColors[evt.agentSource] || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {evt.agentSource}
                    </span>
                    <div>
                      <span className="font-semibold text-white">{evt.eventType}: </span>
                      <span className="text-slate-300">{evt.description}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 shrink-0">
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </span>
                    <span>•</span>
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{evt.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions Panel (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
              <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
              Quick Workspace Links
            </h3>
            <p className="text-xs text-slate-400 mb-3.5">Direct shortcuts to domain views</p>

            <div className="space-y-2">
              <button
                onClick={() => onNavigateTab('analytics')}
                className="w-full p-2.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-200 text-xs font-medium flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-indigo-400" />
                  System Blueprint & Roadmaps
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => onNavigateTab('inventory')}
                className="w-full p-2.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-200 text-xs font-medium flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2">
                  <Boxes className="w-3.5 h-3.5 text-amber-400" />
                  Inventory Stock & Reorder
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => onNavigateTab('finance')}
                className="w-full p-2.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-200 text-xs font-medium flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                  Finance & Invoicing
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => onNavigateTab('marketing')}
                className="w-full p-2.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-200 text-xs font-medium flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2">
                  <Megaphone className="w-3.5 h-3.5 text-cyan-400" />
                  Marketing & Customer RFM
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => onNavigateTab('support')}
                className="w-full p-2.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-200 text-xs font-medium flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2">
                  <Headphones className="w-3.5 h-3.5 text-rose-400" />
                  Support Tickets & FAQs
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 font-mono text-center">
            YuktiOS Multi-Agent Runtime v2.4
          </div>
        </div>

      </div>

      {/* RECOMMENDATION DETAIL MODAL */}
      <RecommendationModal
        isOpen={isRecModalOpen}
        onClose={() => setIsRecModalOpen(false)}
        onExecuteAction={handleExecuteWorkflowAction}
        workflowType={activeWorkflowType}
        onAskYuktiOS={(query) => {
          if (onOpenAskAIWithQuery) {
            onOpenAskAIWithQuery(query || 'Explain recommendation');
          }
        }}
      />
    </div>
  );
};
