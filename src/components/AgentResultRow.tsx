import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Cpu, Activity, ShieldCheck } from 'lucide-react';

export interface AgentResultRowData {
  agent: string;
  task: string;
  status: string;
  findings?: string[];
  dataInput?: { label: string; value: string }[];
  recommendation?: string;
  confidence?: number;
  timestamp?: string;
}

interface AgentResultRowProps {
  data: AgentResultRowData;
}

export const AgentResultRow: React.FC<AgentResultRowProps> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const confidenceValue = data.confidence || 92;

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden transition-all duration-200 hover:border-indigo-500/40">
      {/* Clickable Header Row */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-2.5 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-300 truncate">{data.agent}</span>
              <span className="text-[10px] text-slate-400 font-medium truncate">• {data.task}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            {data.status || 'Complete'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expandable Content Panel */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-800/80 bg-slate-950/60 space-y-2.5 text-[11px] animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Data Considered */}
          {data.dataInput && data.dataInput.length > 0 && (
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Data & Metrics Considered:
              </span>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                {data.dataInput.map((item, idx) => (
                  <div key={idx} className="text-[10px]">
                    <span className="text-slate-400 block text-[9px]">{String(item?.label || '')}</span>
                    <span className="text-white font-bold">
                      {typeof item?.value === 'object' && item?.value !== null ? JSON.stringify(item.value) : String(item?.value ?? '')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Findings */}
          {data.findings && data.findings.length > 0 && (
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Key Agent Findings:
              </span>
              <ul className="space-y-1 bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-slate-200">
                {data.findings.map((f: any, i: number) => {
                  const findingText = typeof f === 'string'
                    ? f
                    : typeof f === 'object' && f !== null
                    ? (f.name ? `${f.name}: Stock ${f.currentStock ?? ''}, Reorder at ${f.reorderPoint ?? ''}` : f.summary || f.description || JSON.stringify(f))
                    : String(f ?? '');

                  return (
                    <li key={i} className="flex items-start gap-1.5 text-[10px]">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{findingText}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Agent Recommendation */}
          {data.recommendation && (
            <div className="bg-indigo-950/40 border border-indigo-500/30 p-2 rounded-lg">
              <span className="text-[9px] font-bold text-indigo-300 uppercase block mb-0.5">
                Agent Recommendation:
              </span>
              <span className="text-white font-semibold">
                {typeof data.recommendation === 'string'
                  ? data.recommendation
                  : (data.recommendation as any)?.title || (data.recommendation as any)?.description || JSON.stringify(data.recommendation)}
              </span>
            </div>
          )}

          {/* Footer: Confidence & Timestamp */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] font-mono">
            <div className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Confidence:</span>
              <span className="text-emerald-300 font-bold">{confidenceValue}%</span>
            </div>
            {data.timestamp && (
              <span className="text-slate-500">{data.timestamp}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
