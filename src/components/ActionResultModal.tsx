import React from 'react';
import { X, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { ActionResult } from '../types/actionTypes';

interface ActionResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  result: ActionResult | null;
  onRetry?: () => void;
  onViewDetails?: () => void;
}

export const ActionResultModal: React.FC<ActionResultModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  result,
  onRetry,
  onViewDetails,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md text-slate-100 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Loading State */}
        {isLoading && (
          <div className="p-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-center text-indigo-400 mx-auto">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Executing Action...</h3>
              <p className="text-xs text-slate-400 mt-0.5">Multi-Agent Runtime processing transaction</p>
            </div>
          </div>
        )}

        {/* Result State (Success or Failure) */}
        {!isLoading && result && (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <div className="flex items-center space-x-2.5">
                <div className={`p-1.5 rounded-lg text-white ${
                  result.status === 'executed'
                    ? 'bg-emerald-600'
                    : 'bg-rose-600'
                }`}>
                  {result.status === 'executed' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {result.status === 'executed' ? 'Action Executed' : 'Action Failed'}
                  </h3>
                  <p className="text-xs text-slate-400">{result.title}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-3.5 text-xs">
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2">
                <p className="text-slate-200 text-xs leading-relaxed">
                  {result.summary}
                </p>

                {result.metadata && (
                  <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px] font-mono">
                    {result.metadata.poId && (
                      <div>
                        <span className="text-slate-500 block">PO ID:</span>
                        <span className="text-indigo-300 font-semibold">{result.metadata.poId}</span>
                      </div>
                    )}
                    {result.metadata.qty && (
                      <div>
                        <span className="text-slate-500 block">Quantity:</span>
                        <span className="text-white font-semibold">{result.metadata.qty} units</span>
                      </div>
                    )}
                    {result.metadata.amount && (
                      <div>
                        <span className="text-slate-500 block">Amount:</span>
                        <span className="text-emerald-400 font-semibold">₹{result.metadata.amount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {result.metadata.invoiceNumber && (
                      <div>
                        <span className="text-slate-500 block">Invoice:</span>
                        <span className="text-indigo-300 font-semibold">{result.metadata.invoiceNumber}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-end space-x-2.5">
              {result.status === 'failed' && onRetry && (
                <button
                  onClick={onRetry}
                  className="py-1.5 px-3.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition"
                >
                  Retry Action
                </button>
              )}

              {onViewDetails && (
                <button
                  onClick={onViewDetails}
                  className="py-1.5 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
                >
                  View in Workspace
                </button>
              )}

              <button
                onClick={onClose}
                className="py-1.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
