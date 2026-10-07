import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  BrainCircuit,
  Loader2,
  Check
} from 'lucide-react';

interface RecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteAction: () => Promise<void> | void;
  onAskYuktiOS: (question?: string) => void;
  workflowType?: 'inventory' | 'customer_churn';
}

export const RecommendationModal: React.FC<RecommendationModalProps> = ({
  isOpen,
  onClose,
  onExecuteAction,
  onAskYuktiOS,
  workflowType = 'inventory',
}) => {
  const [modalStage, setModalStage] = useState<'details' | 'confirm' | 'executing' | 'completed'>('details');
  const [executionStep, setExecutionStep] = useState<number>(0);
  const [backendData, setBackendData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setModalStage('details');
      setExecutionStep(0);
      const endpoint = workflowType === 'customer_churn'
        ? '/api/ai/workflows/customer-churn'
        : '/api/ai/workflows/inventory-risk';

      const body = workflowType === 'customer_churn'
        ? { customerId: 'cust_003' }
        : { productId: 'prod_003' };

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
        .then((res) => res.json())
        .then((data) => setBackendData(data))
        .catch((err) => console.warn('Workflow API fallback:', err));
    }
  }, [isOpen, workflowType]);

  if (!isOpen) return null;

  const isChurn = workflowType === 'customer_churn';

  const reasoningSteps = isChurn
    ? [
        {
          agent: 'Marketing Agent',
          action: 'Analyzed 48-day order recency & RFM segment',
          status: 'Complete',
          color: 'text-cyan-400 border-cyan-800/50 bg-cyan-950/40',
        },
        {
          agent: 'Support Agent',
          action: 'Analyzed 1 open high-priority billing ticket',
          status: 'Complete',
          color: 'text-rose-400 border-rose-800/50 bg-rose-950/40',
        },
        {
          agent: 'Analytics Agent',
          action: 'Calculated 78% churn probability score',
          status: 'Complete',
          color: 'text-indigo-400 border-indigo-800/50 bg-indigo-950/40',
        },
        {
          agent: 'YuktiOS Coordinator',
          action: 'Generated retention campaign recommendation',
          status: 'Complete',
          color: 'text-purple-400 border-purple-800/50 bg-purple-950/40',
        },
      ]
    : [
        {
          agent: 'Inventory Agent',
          action: 'Analyzed stock levels & identified reorder risk',
          status: 'Complete',
          color: 'text-amber-400 border-amber-800/50 bg-amber-950/40',
        },
        {
          agent: 'Analytics Agent',
          action: 'Forecasted +24% demand spike via Prophet model',
          status: 'Complete',
          color: 'text-indigo-400 border-indigo-800/50 bg-indigo-950/40',
        },
        {
          agent: 'Finance Agent',
          action: 'Verified available cash flow & budget allocation',
          status: 'Complete',
          color: 'text-emerald-400 border-emerald-800/50 bg-emerald-950/40',
        },
        {
          agent: 'YuktiOS Coordinator',
          action: 'Generated optimal Purchase Order recommendation',
          status: 'Complete',
          color: 'text-purple-400 border-purple-800/50 bg-purple-950/40',
        },
      ];

  const executionStepsList = isChurn
    ? [
        { agent: 'Marketing Agent', text: 'Preparing 12% WhatsApp retention discount copy...' },
        { agent: 'Support Agent', text: 'Flagging ticket TICK-402 for priority resolution...' },
        { agent: 'YuktiOS Coordinator', text: 'Executing workflow & emitting event log...' },
      ]
    : [
        { agent: 'Inventory Agent', text: 'Preparing purchase order PO-2026-100...' },
        { agent: 'Finance Agent', text: 'Validating purchase budget (₹85,000)...' },
        { agent: 'YuktiOS Coordinator', text: 'Executing workflow & emitting event log...' },
      ];

  const handleStartExecute = () => {
    setModalStage('confirm');
  };

  const handleConfirmExecute = async () => {
    setModalStage('executing');
    setExecutionStep(1);

    setTimeout(() => {
      setExecutionStep(2);
    }, 700);

    setTimeout(() => {
      setExecutionStep(3);
    }, 1400);

    setTimeout(async () => {
      setModalStage('completed');
      await onExecuteAction();
    }, 2100);
  };

  const handleResetAndClose = () => {
    setModalStage('details');
    setExecutionStep(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={handleResetAndClose}
      />

      {/* Modal Window */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* TOP HEADER */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 shrink-0 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-indigo-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  {isChurn ? 'Customer Churn Intelligence' : 'AI Recommendation Detail'}
                </h3>
                <span className="text-[10px] font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded">
                  {isChurn ? '87% Confidence' : '92% Confidence'}
                </span>
              </div>
              <p className="text-xs text-slate-400">Observe → Analyze → Recommend → Act</p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MIDDLE SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* STAGE 1: DETAILS VIEW */}
          {modalStage === 'details' && (
            <>
              {/* Primary Recommendation Banner */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5 font-medium text-indigo-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    {isChurn ? 'Customer Retention Workflow' : 'Primary Action Trigger'}
                  </span>
                  <span>{isChurn ? 'CLIENT: Matrix Automation' : 'SKU: SKU-SENS-IP67'}</span>
                </div>
                <h4 className="text-base font-semibold text-white">
                  {isChurn
                    ? 'High Churn Risk: Matrix Automation Corp (78% Churn Risk)'
                    : 'Increase inventory of Industrial Sensor Enclosure IP67 by 15%'}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isChurn
                    ? 'Matrix Automation Corp has shown no order activity for 48 days and currently has 1 open high-priority billing ticket. Retention campaign recommended.'
                    : 'Prophet demand forecasting model predicts a 24% demand spike in 14 days. Current stock (8 units) will deplete below reorder point in 3 days.'}
                </p>
              </div>

              {/* Evidence Grid */}
              <div>
                <h5 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Key Evidence Signals
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {isChurn ? (
                    <>
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                        <span className="text-[10px] text-slate-500 block">Recency</span>
                        <span className="text-xs font-semibold text-rose-400 font-mono">48 Days Idle</span>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                        <span className="text-[10px] text-slate-500 block">Open Tickets</span>
                        <span className="text-xs font-semibold text-amber-400 font-mono">1 Billing</span>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                        <span className="text-[10px] text-slate-500 block">RFM Segment</span>
                        <span className="text-xs font-semibold text-rose-400 font-mono">At Risk</span>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                        <span className="text-[10px] text-slate-500 block">Lifetime Spend</span>
                        <span className="text-xs font-semibold text-indigo-400 font-mono">₹3,10,000</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                        <span className="text-[10px] text-slate-500 block">Demand Forecast</span>
                        <span className="text-xs font-semibold text-emerald-400 font-mono">+24% Spike</span>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                        <span className="text-[10px] text-slate-500 block">Current Stock</span>
                        <span className="text-xs font-semibold text-amber-400 font-mono">8 Units</span>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                        <span className="text-[10px] text-slate-500 block">Est. Stockout</span>
                        <span className="text-xs font-semibold text-rose-400 font-mono">In 3 Days</span>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                        <span className="text-[10px] text-slate-500 block">Demand Trend</span>
                        <span className="text-xs font-semibold text-indigo-400 font-mono">Increasing</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Agent Reasoning Workflow Timeline */}
              <div>
                <h5 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Multi-Agent Consensus Flow</span>
                  <span className="text-[10px] text-slate-500 font-mono">Consensus Verified</span>
                </h5>

                <div className="space-y-2">
                  {reasoningSteps.map((step) => (
                    <div
                      key={step.agent}
                      className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border shrink-0 ${step.color}`}>
                          {step.agent}
                        </span>
                        <span className="text-slate-200 truncate">{step.action}</span>
                      </div>

                      <div className="flex items-center space-x-1 text-[10px] text-emerald-400 shrink-0 ml-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{step.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RECOMMENDED ACTION CARD */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                    Recommended Action
                  </span>
                  <span className="text-[10px] font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded">
                    Ready for Execution
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-white">
                    {isChurn ? 'Dispatch Retention Campaign & Flag Support Ticket' : 'Create Purchase Order for 100 units'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isChurn ? 'Matrix Automation Corp (12% WhatsApp Discount offer)' : 'Industrial Sensor Enclosure IP67'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">{isChurn ? 'Target Channel' : 'Quantity'}</span>
                    <span className="text-emerald-400 font-semibold text-xs">{isChurn ? 'WhatsApp & Email' : '100 units'}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">{isChurn ? 'Offer' : 'Budget'}</span>
                    <span className="text-white font-semibold text-xs">{isChurn ? '12% Loyalty Discount' : '₹85,000'}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STAGE 2: CONFIRMATION */}
          {modalStage === 'confirm' && (
            <div className="py-4 space-y-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>

              <div>
                <h4 className="text-base font-semibold text-white">
                  {isChurn ? 'Execute Customer Retention Action?' : 'Confirm Purchase Order Execution'}
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                  {isChurn
                    ? 'YuktiOS will dispatch the 12% retention discount campaign to Matrix Automation Corp and update the ticket status.'
                    : 'YuktiOS will create a purchase order for 100 units of SKU-SENS-IP67 with vendor Apex Industrial Components.'}
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 max-w-md mx-auto text-left text-xs space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target:</span>
                  <span className="text-white font-medium">{isChurn ? 'Matrix Automation Corp' : 'Industrial Sensor Enclosure IP67'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Quantity / Offer:</span>
                  <span className="text-emerald-400 font-medium">{isChurn ? '12% Loyalty Discount' : '100 units'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cost / Budget:</span>
                  <span className="text-white font-medium">{isChurn ? 'TICK-402 Priority' : '₹85,000'}</span>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 3: EXECUTING WORKFLOW ANIMATION */}
          {modalStage === 'executing' && (
            <div className="py-6 space-y-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-indigo-400 flex items-center justify-center mx-auto">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white">Executing Multi-Agent Workflow...</h4>
                <p className="text-xs text-slate-400 mt-0.5">Coordinating domain services and recording ledger entries</p>
              </div>

              <div className="space-y-2 max-w-md mx-auto text-left">
                {executionStepsList.map((step, idx) => {
                  const isDone = executionStep > idx;
                  const isCurrent = executionStep === idx + 1;
                  return (
                    <div
                      key={step.agent}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition ${
                        isDone
                          ? 'bg-slate-950 border-emerald-800/40 text-slate-200'
                          : isCurrent
                          ? 'bg-indigo-950/40 border-indigo-800/50 text-indigo-200'
                          : 'bg-slate-950/40 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] text-indigo-400">[{step.agent}]</span>
                        <span>{step.text}</span>
                      </div>
                      {isDone && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      {isCurrent && <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STAGE 4: COMPLETED STATE */}
          {modalStage === 'completed' && (
            <div className="py-6 space-y-3.5 text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-base font-semibold text-white">Action Executed Successfully</h4>
                <p className="text-xs text-emerald-400 font-mono mt-0.5">
                  {isChurn
                    ? 'Retention Campaign Dispatched & Ticket Updated'
                    : 'Purchase Order PO-2026-100 Created'}
                </p>
              </div>

              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {isChurn
                  ? 'Retention offer sent to Matrix Automation Corp. Executive Dashboard and activity log updated.'
                  : 'Purchase Order PO-2026-100 created successfully. Executive Dashboard and Inventory Ledger updated.'}
              </p>
            </div>
          )}

        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0 flex items-center justify-between gap-3">
          {modalStage === 'details' && (
            <>
              <button
                onClick={() => {
                  handleResetAndClose();
                  onAskYuktiOS(isChurn ? 'Explain customer churn analysis for Matrix Automation' : 'Explain inventory recommendation for Industrial Sensor Enclosure');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Ask AI Copilot</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleResetAndClose}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
                >
                  Dismiss
                </button>

                <button
                  onClick={handleStartExecute}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <span>Execute Action</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}

          {modalStage === 'confirm' && (
            <div className="flex items-center justify-end space-x-2.5 w-full">
              <button
                onClick={() => setModalStage('details')}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
              >
                Back
              </button>
              <button
                onClick={handleConfirmExecute}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
              >
                Confirm & Execute
              </button>
            </div>
          )}

          {modalStage === 'completed' && (
            <div className="flex items-center justify-end w-full">
              <button
                onClick={handleResetAndClose}
                className="px-5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
