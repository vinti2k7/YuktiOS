import React, { useState } from 'react';
import { SystemState } from '../types';
import { RecommendationModal } from './RecommendationModal';
import { 
  Layers, 
  ArrowRight, 
  Activity, 
  Terminal,
  Sparkles
} from 'lucide-react';

import { NavTab } from './Navigation';

interface AnalyticsBlueprintViewProps {
  state: SystemState;
  onOpenAskAIWithQuery?: (query: string) => void;
  onReorderStock?: (productId: string) => void;
  onNavigateTab?: (tab: NavTab) => void;
}

export const AnalyticsBlueprintView: React.FC<AnalyticsBlueprintViewProps> = ({
  state,
  onOpenAskAIWithQuery,
  onReorderStock,
  onNavigateTab,
}) => {
  const [isRecModalOpen, setIsRecModalOpen] = useState(false);

  const activeOperations = [
    { agent: 'Inventory Agent', task: 'Analyzing stock levels & demand forecast', status: 'Running', color: 'text-amber-400' },
    { agent: 'Finance Agent', task: 'Monitoring receivables & cash flow forecast', status: 'Running', color: 'text-emerald-400' },
    { agent: 'Marketing Agent', task: 'Monitoring campaign performance & RFM clusters', status: 'Running', color: 'text-cyan-400' },
    { agent: 'HR Agent', task: 'Auditing EPF/ESI statutory payroll compliance', status: 'Running', color: 'text-purple-400' },
    { agent: 'Support Agent', task: 'Vector DB RAG FAQ search & ticket triage', status: 'Running', color: 'text-rose-400' },
    { agent: 'Analytics Agent', task: 'Cross-agent anomaly detection & orchestration', status: 'Running', color: 'text-indigo-400' },
  ];

  const agentInterfaceCode = `// Shared Agent Contract Interface (TypeScript)
export interface YuktiAgentContract<TInput, TOutput> {
  agentName: string;
  domain: 'Finance' | 'Inventory' | 'HR' | 'Marketing' | 'Support' | 'Analytics';
  
  ingest(eventData: TInput): Promise<void>;
  process(state: SystemState): Promise<AgentExecutionLog>;
  predict(historicalData: any[]): Promise<PredictionSummary>;
  recommend(predictions: PredictionSummary): Promise<ActionableRecommendation[]>;
  emitEvent(eventType: string, payload: Record<string, any>): void;
}`;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-indigo-400 bg-indigo-950/40 border border-indigo-800/50 px-2 py-0.5 rounded">
              Architecture Blueprint
            </span>
            <span className="text-xs text-slate-400">YuktiOS Multi-Agent Runtime & Interface Contracts</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1.5">System Architecture & Intelligence Blueprint</h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            Real-time telemetry and decision matrix governing 6 domain agents operating on a shared event bus.
          </p>
        </div>

        {/* Top Status */}
        <div className="bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-lg text-xs font-mono space-y-0.5 shrink-0">
          <span className="text-emerald-400 font-medium block">● 6 Agents Online</span>
          <span className="text-slate-300 font-medium block">● 2 Tasks Running</span>
          <span className="text-amber-400 font-medium block">● 1 Action Required</span>
        </div>
      </div>

      {/* ACTIVE OPERATIONS & RECOMMENDATION SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Active Operations List (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Active Agent Operations
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
              Real-time Loop
            </span>
          </div>

          <div className="space-y-2">
            {activeOperations.map((op) => (
              <div
                key={op.agent}
                className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <span className={`font-semibold font-mono text-[11px] ${op.color}`}>{op.agent}</span>
                  <span className="text-slate-300">{op.task}</span>
                </div>

                <span className="text-[10px] font-mono text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations Highlight (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Pending Recommendation
              </h3>
              <span className="text-[10px] font-mono bg-amber-950/40 text-amber-300 border border-amber-800/40 px-2 py-0.5 rounded">
                Action Required
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
              <span className="text-[10px] text-indigo-400 uppercase font-mono block">Demand & Stock Intelligence</span>
              <h4 className="text-sm font-semibold text-white">Increase inventory of High-Torque Servo Motor 24V by 15%</h4>
              <p className="text-xs text-slate-400">
                +24% predicted demand spike in 14 days. Current stock (14 units) will deplete in 3 days.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Confidence: 92%</span>
            <button
              onClick={() => setIsRecModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <span>Review Recommendation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* 4-Layer System Architecture Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3.5">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          YuktiOS Four-Layer Technical Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-indigo-300">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              1. Interaction Layer
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              React + Vite Dashboard, Role-Based Access Control, WhatsApp Gateway Bridge, AI Copilot.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              2. Agent Services Layer
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              6 Domain Services: Finance, Inventory, HR, Marketing, Support, Business Analytics.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              3. Orchestration Layer
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Central Event Bus, Multi-Agent Consensus Engine, Gemini NL Orchestrator.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              4. Central Data Layer
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              PostgreSQL / JSON Store, Append-Only Event Audit Ledger, pgvector Knowledge Base.
            </p>
          </div>

        </div>
      </div>

      {/* Shared Agent Contract Specification */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          Uniform Agent Interface Contract Specification
        </h3>
        <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto no-scrollbar">
          {agentInterfaceCode}
        </pre>
      </div>

      {/* Recommendation Modal */}
      <RecommendationModal
        isOpen={isRecModalOpen}
        onClose={() => setIsRecModalOpen(false)}
        onExecuteAction={() => {
          if (onReorderStock) {
            onReorderStock('prod_003');
          }
        }}
        onAskYuktiOS={(query) => {
          if (onOpenAskAIWithQuery) {
            onOpenAskAIWithQuery(query || 'Explain inventory recommendation for High-Torque Servo Motor');
          }
        }}
      />

    </div>
  );
};
