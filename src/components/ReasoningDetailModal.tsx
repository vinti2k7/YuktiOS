import React from 'react';
import { X, CheckCircle2, ArrowRight, ShieldCheck, Cpu, ArrowDown } from 'lucide-react';
import { AgentResultRowData } from './AgentResultRow';

export interface ReasoningModalData {
  userQuery: string;
  cardTitle: string;
  agents: AgentResultRowData[];
  consensusExplanation: string;
  recommendation: string;
  confidence: number;
  actionAvailable: boolean;
  actionType?: 'inventory' | 'customer_risk' | 'cash_flow' | 'payroll' | 'support' | 'daily_focus' | 'generic';
}

interface ReasoningDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReasoningModalData | null;
  onExecuteAction?: (type?: string) => void;
}

export const ReasoningDetailModal: React.FC<ReasoningDetailModalProps> = ({
  isOpen,
  onClose,
  data,
  onExecuteAction,
}) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-indigo-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Multi-Agent Decision Reasoning</h3>
                <span className="text-[10px] font-mono bg-indigo-950/40 text-indigo-300 border border-indigo-800/40 px-2 py-0.5 rounded">
                  {data.confidence}% Consensus
                </span>
              </div>
              <p className="text-xs text-slate-400">Transparent executive trace of agent analysis and consensus</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Trace */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* STEP 1: USER REQUEST */}
          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono font-medium text-slate-400 uppercase">
              <span>Step 01 — User Request</span>
              <span className="text-indigo-400">Input Received</span>
            </div>
            <p className="text-xs font-semibold text-white pt-0.5">"{data.userQuery}"</p>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
          </div>

          {/* STEP 2: AGENTS CONSULTED & FINDINGS */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[10px] font-mono font-medium text-slate-400 uppercase">
              <span>Step 02 — Domain Findings ({data.agents.length} Agents)</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            </div>

            <div className="space-y-2">
              {data.agents.map((ag, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="font-mono text-xs font-semibold text-indigo-300">{ag.agent}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                      ✓ {ag.status || 'Complete'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">Task: {String(ag.task || '')}</p>

                  {ag.dataInput && ag.dataInput.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      {ag.dataInput.map((d, dIdx) => (
                        <span key={dIdx} className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                          <span className="text-slate-400">{String(d?.label || '')}: </span>
                          <span className="text-white font-medium">
                            {typeof d?.value === 'object' && d?.value !== null ? JSON.stringify(d.value) : String(d?.value ?? '')}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}

                  {ag.findings && ag.findings.length > 0 && (
                    <ul className="text-[11px] space-y-0.5 bg-slate-900 p-2 rounded-lg border border-slate-800 text-slate-300">
                      {ag.findings.map((f: any, fIdx: number) => {
                        const text = typeof f === 'string'
                          ? f
                          : typeof f === 'object' && f !== null
                          ? (f.name ? `${f.name}: Stock ${f.currentStock ?? ''}, Reorder at ${f.reorderPoint ?? ''}` : f.summary || f.description || JSON.stringify(f))
                          : String(f ?? '');

                        return (
                          <li key={fIdx} className="flex items-start gap-1.5">
                            <span className="text-indigo-400 font-bold">•</span>
                            <span>{text}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
          </div>

          {/* STEP 3: CROSS-AGENT CONSENSUS */}
          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono font-medium text-indigo-400 uppercase">
              <span>Step 03 — Cross-Agent Consensus</span>
              <span>YuktiOS Coordinator</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {String(data.consensusExplanation || "YuktiOS Coordinator verified signal alignment across specialized agents to eliminate operational risk.")}
            </p>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
          </div>

          {/* STEP 4: FINAL RECOMMENDATION & ACTION */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-[10px] font-mono font-medium text-amber-300 uppercase">
              <span>Step 04 — Final Recommendation</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                {data.confidence}% Confidence
              </span>
            </div>

            <h4 className="text-xs font-semibold text-white">
              {typeof data.recommendation === 'string'
                ? data.recommendation
                : (data.recommendation as any)?.title || (data.recommendation as any)?.description || JSON.stringify(data.recommendation)}
            </h4>

            {data.actionAvailable && onExecuteAction && (
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    onClose();
                    onExecuteAction(data.actionType);
                  }}
                  className="py-1.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <span>Execute Action</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-mono">
            YuktiOS Multi-Agent Reasoning Trace
          </span>
          <button
            onClick={onClose}
            className="py-1 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
