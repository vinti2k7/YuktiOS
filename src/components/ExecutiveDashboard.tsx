import React, { useState } from 'react';
import { SystemState } from '../types';
import { RecommendationModal } from './RecommendationModal';
import { 
  IndianRupee, 
  TrendingUp, 
  Boxes, 
  Users, 
  Megaphone, 
  Headphones, 
  ShieldAlert, 
  Activity, 
  Sparkles, 
  Clock, 
  ArrowRight,
  Filter,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ShieldCheck,
  BrainCircuit,
  ArrowUpRight
} from 'lucide-react';

interface ExecutiveDashboardProps {
  state: SystemState;
  onNavigateTab: (tab: any) => void;
  onReorderStock: (productId: string) => void;
  onOpenAskAIWithQuery?: (query: string) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  state,
  onNavigateTab,
  onReorderStock,
  onOpenAskAIWithQuery,
}) => {
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [isRecModalOpen, setIsRecModalOpen] = useState<boolean>(false);

  // Business metrics calculations
  const totalRevenue = state.invoices.reduce((acc, inv) => acc + (inv.status === 'paid' ? inv.total : 0), 0);
  const pendingReceivables = state.invoices.reduce((acc, inv) => acc + (inv.status !== 'paid' ? inv.total : 0), 0);
  const totalExpenses = state.expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const projectedCashFlow = state.cashFlowForecast.length > 0 
    ? state.cashFlowForecast[state.cashFlowForecast.length - 1].netCash 
    : totalRevenue - totalExpenses;

  const highRiskProducts = state.products.filter((p) => p.stockoutRiskScore >= 70);
  const atRiskCustomers = state.customers.filter((c) => c.rfmSegment === 'At Risk' || c.churnRiskScore > 60);
  const openAnomalies = state.anomalyAlerts.filter((a) => a.status === 'open');

  const filteredEvents = state.eventLogs.filter((evt) => {
    if (eventFilter === 'all') return true;
    return evt.agentSource.toLowerCase() === eventFilter.toLowerCase();
  });

  const agentCards = [
    {
      name: 'Finance Agent',
      domain: 'Invoicing & GST',
      tab: 'finance',
      icon: IndianRupee,
      currentTask: 'Monitoring receivables & cash flow',
      stat: `${state.invoices.length} Invoices`,
      substat: `₹${(pendingReceivables / 100000).toFixed(2)}L Due`,
    },
    {
      name: 'Inventory Agent',
      domain: 'Stock & Demand',
      tab: 'inventory',
      icon: Boxes,
      currentTask: highRiskProducts.length > 0 ? `${highRiskProducts.length} SKU stockout risk` : 'Stock levels balanced',
      stat: `${state.products.length} Products`,
      substat: `${highRiskProducts.length} At-Risk`,
    },
    {
      name: 'HR & Payroll Agent',
      domain: 'Payroll & EPF/ESI',
      tab: 'hr',
      icon: Users,
      currentTask: 'Statutory compliance synchronized',
      stat: `${state.employees.length} Staff`,
      substat: 'Compliant',
    },
    {
      name: 'Marketing Agent',
      domain: 'RFM & Retention',
      tab: 'marketing',
      icon: Megaphone,
      currentTask: `${atRiskCustomers.length} accounts flagged for win-back`,
      stat: `${state.campaigns.length} Campaigns`,
      substat: `${atRiskCustomers.length} At-Risk`,
    },
    {
      name: 'Support Agent',
      domain: 'Tickets & RAG Knowledge',
      tab: 'support',
      icon: Headphones,
      currentTask: `${state.supportTickets.filter(t => t.status === 'open').length} open support tickets`,
      stat: `${state.supportTickets.length} Tickets`,
      substat: 'Vector KB active',
    },
    {
      name: 'Central Orchestration',
      domain: 'Cross-Agent Consensus',
      tab: 'blueprint',
      icon: Activity,
      currentTask: 'Autonomous decision loops active',
      stat: `${openAnomalies.length} Alerts`,
      substat: 'Consensus 92%',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. TOP SUMMARY & PRIORITY ACTION BANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* System Overview (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Operations Health
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                92 / 100 • Normal
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-base font-semibold text-white tracking-tight">All systems operational</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                6 domain agents are actively processing transactions, monitoring stock velocity, and evaluating cash surplus.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Telemetry live
            </span>
            <button
              onClick={() => onNavigateTab('blueprint')}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-medium transition"
            >
              <span>View telemetry</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Actionable Recommendation (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Recommended Action
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Confidence 92%
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3.5 mt-2">
              <h4 className="text-sm font-semibold text-white">
                Reorder {highRiskProducts[0]?.name || 'Industrial Sensor Enclosure IP67'} (100 units)
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Stock balance is currently {highRiskProducts[0]?.stockQuantity || 8} units. Forecasting model predicts demand surge. Finance Agent verified ₹85,000 cash surplus.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Stockout estimated in 3 days
            </span>
            
            <button
              onClick={() => setIsRecModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
            >
              <span>Review & Execute</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* 2. KEY PERFORMANCE FIGURES (5 CLEAN TILES) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* KPI 1: Revenue Today */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Revenue Today</span>
            <IndianRupee className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold text-white font-mono">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" />
              +12.4% vs last week
            </p>
          </div>
        </div>

        {/* KPI 2: Expenses Today */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Expenses Today</span>
            <FileText className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold text-white font-mono">
              ₹{totalExpenses.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {state.expenses.length} vouchers recorded
            </p>
          </div>
        </div>

        {/* KPI 3: Cash Flow */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>30-Day Cash Surplus</span>
            <Activity className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold text-white font-mono">
              ₹{projectedCashFlow.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-indigo-400 mt-0.5 font-medium">
              Projected Positive
            </p>
          </div>
        </div>

        {/* KPI 4: Pending Invoices */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Receivables Due</span>
            <Clock className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold text-white font-mono">
              ₹{(pendingReceivables / 1000).toFixed(0)}k
            </p>
            <p className="text-[11px] text-amber-400 mt-0.5">
              {state.invoices.filter(i => i.status !== 'paid').length} pending invoices
            </p>
          </div>
        </div>

        {/* KPI 5: Active Accounts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Customer Accounts</span>
            <Users className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold text-white font-mono">
              {state.customers.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {atRiskCustomers.length} at-risk segment
            </p>
          </div>
        </div>

      </div>

      {/* 3. ALERTS & RECENT ACTIVITY SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Actionable Alerts (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Operational Alerts
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {openAnomalies.length} active
            </span>
          </div>

          <div className="space-y-2.5">
            {openAnomalies.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 bg-slate-950 rounded-lg border border-slate-800">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
                No unresolved alerts.
              </div>
            ) : (
              openAnomalies.map((a) => (
                <div
                  key={a.id}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-rose-300">
                      [{a.agentSource}] {a.title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{a.timestamp}</span>
                  </div>

                  <p className="text-slate-300 text-xs leading-relaxed">{a.message}</p>
                  
                  <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 truncate max-w-[200px]">{a.recommendedAction}</span>
                    {a.agentSource === 'Inventory' ? (
                      <button
                        onClick={() => setIsRecModalOpen(true)}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-medium transition"
                      >
                        Restock
                      </button>
                    ) : (
                      <button
                        onClick={() => onNavigateTab(a.agentSource.toLowerCase())}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition"
                      >
                        Inspect
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Multi-Agent Activity (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Live Activity Stream</h3>
              <p className="text-xs text-slate-400">Append-only audit trail of multi-agent events</p>
            </div>

            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 px-2 py-1 focus:outline-none cursor-pointer"
                aria-label="Filter events by agent"
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

          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 no-scrollbar">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-slate-950 border border-slate-800/80 rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 shrink-0">
                    {evt.agentSource}
                  </span>
                  <p className="text-slate-300 truncate">
                    <strong className="text-white font-medium">{evt.eventType}: </strong>
                    {evt.description}
                  </p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                  {evt.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. DOMAIN AGENTS DIRECTORY (6 SIMPLE CARDS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Autonomous Domain Workspaces</h3>
          <span className="text-xs text-slate-400">Click any agent to open specialized tools</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {agentCards.map((agent) => {
            const Icon = agent.icon;
            return (
              <div
                key={agent.name}
                onClick={() => onNavigateTab(agent.tab)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 cursor-pointer transition flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300 group-hover:text-indigo-400 transition">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition">
                        {agent.name}
                      </h4>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active" />
                  </div>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-1">
                    {agent.currentTask}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-slate-300">{agent.stat}</span>
                  <span className="text-slate-500 flex items-center gap-1 group-hover:text-slate-300 transition">
                    Open <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendation Modal */}
      <RecommendationModal
        isOpen={isRecModalOpen}
        onClose={() => setIsRecModalOpen(false)}
        onExecuteAction={() => onReorderStock('prod_003')}
        onAskYuktiOS={(query) => {
          if (onOpenAskAIWithQuery) {
            onOpenAskAIWithQuery(query || 'Explain inventory recommendation for High-Torque Servo Motor');
          }
        }}
      />

    </div>
  );
};

