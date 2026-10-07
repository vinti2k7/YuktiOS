import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, ShieldCheck, Cpu, ArrowRight, MessageSquare } from 'lucide-react';
import { ExecutableActionType, ActionPayload } from '../types/actionTypes';

interface ActionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: ExecutableActionType;
  payload: ActionPayload;
  isDuplicateWarning?: boolean;
  onConfirm: (payload: ActionPayload, forceExecute: boolean) => void;
}

export const ActionConfirmationModal: React.FC<ActionConfirmationModalProps> = ({
  isOpen,
  onClose,
  actionType,
  payload,
  isDuplicateWarning = false,
  onConfirm,
}) => {
  const [editedResponse, setEditedResponse] = useState(payload.suggestedResponse || '');

  useEffect(() => {
    setEditedResponse(payload.suggestedResponse || '');
  }, [payload]);

  if (!isOpen) return null;

  const handleConfirmExecute = () => {
    const updatedPayload = { ...payload };
    if (actionType === 'RESPOND_TO_SUPPORT_TICKET') {
      updatedPayload.suggestedResponse = editedResponse;
    }
    onConfirm(updatedPayload, isDuplicateWarning);
  };

  const getActionTitle = () => {
    switch (actionType) {
      case 'CREATE_PURCHASE_ORDER': return 'Create Purchase Order';
      case 'SEND_PAYMENT_REMINDER': return 'Send Payment Reminder';
      case 'RUN_PAYROLL': return 'Run Monthly Payroll';
      case 'CREATE_MARKETING_CAMPAIGN': return 'Launch Marketing Campaign';
      case 'RESPOND_TO_SUPPORT_TICKET': return 'Respond to Support Ticket';
      case 'GENERATE_ANALYTICS_REPORT': return 'Generate Analytics Report';
      case 'GENERATE_INVOICE': return 'Generate Customer Invoice';
      default: return 'Confirm Action';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-indigo-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">{getActionTitle()}</h3>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
                  Simulation Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">Review multi-agent recommendation parameters before execution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Duplicate Warning Banner */}
        {isDuplicateWarning && (
          <div className="bg-amber-950/40 border-b border-amber-800/40 p-3 px-4 flex items-center space-x-2.5 text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-semibold block">Potential Duplicate Action</span>
              <span className="text-[11px] text-amber-400/80">A similar action was executed recently. You may proceed if intended.</span>
            </div>
          </div>
        )}

        {/* Body Content Details */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">

          {/* 1. PURCHASE ORDER DETAILS */}
          {actionType === 'CREATE_PURCHASE_ORDER' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block">Product</span>
                  <span className="text-xs font-semibold text-white">{payload.productName || 'Industrial Sensor Enclosure IP67'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Recommended Quantity</span>
                  <span className="text-xs font-semibold text-indigo-300">{payload.quantity || 100} units</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Estimated Budget</span>
                  <span className="text-xs font-semibold text-emerald-400">₹{(payload.totalAmount || 85000).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Supplier</span>
                  <span className="text-xs font-semibold text-slate-300">{payload.supplierName || 'Apex Industrial Components'}</span>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase font-mono block">Execution Reason</span>
                <p className="text-slate-300 leading-relaxed">
                  {payload.reason || 'High stockout risk detected (8 units remaining) + forecasted demand spike (+24% surge). Finance Agent verified ₹85,000 available surplus.'}
                </p>
              </div>
            </div>
          )}

          {/* 2. PAYMENT REMINDER DETAILS */}
          {actionType === 'SEND_PAYMENT_REMINDER' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block">Invoice Number</span>
                  <span className="text-xs font-semibold text-white">{payload.invoiceNumber || 'INV-2026-091'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Customer</span>
                  <span className="text-xs font-semibold text-indigo-300">{payload.customerName || 'Matrix Automation Corp'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Overdue Amount</span>
                  <span className="text-xs font-semibold text-rose-400">₹{(payload.totalAmount || 188800).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Channel</span>
                  <span className="text-xs font-semibold text-emerald-400">Automated WhatsApp + Email</span>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase font-mono block">Action Details</span>
                <p className="text-slate-300 leading-relaxed">
                  Finance Agent will dispatch an automated payment verification follow-up notice with NEFT/UPI payment details.
                </p>
              </div>
            </div>
          )}

          {/* 3. PAYROLL DETAILS */}
          {actionType === 'RUN_PAYROLL' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block">Payroll Period</span>
                  <span className="text-xs font-semibold text-white">{payload.payrollPeriod || 'August 2026'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Active Employees</span>
                  <span className="text-xs font-semibold text-indigo-300">{payload.employeeCount || 12} Staff</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Total Monthly Disbursement</span>
                  <span className="text-xs font-semibold text-emerald-400">₹{(payload.payrollAmount || 520000).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Statutory Deductions</span>
                  <span className="text-xs font-semibold text-purple-300">EPF (12%) • ESI (0.75%)</span>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase font-mono block">Compliance Status</span>
                <p className="text-slate-300 leading-relaxed">
                  HR Agent and Finance Agent confirmed 100% EPF/ESI statutory match. Payout pre-approved for bank disbursement.
                </p>
              </div>
            </div>
          )}

          {/* 4. MARKETING CAMPAIGN DETAILS */}
          {actionType === 'CREATE_MARKETING_CAMPAIGN' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block">Campaign Name</span>
                  <span className="text-xs font-semibold text-white">{payload.campaignName || 'At-Risk Retention Offer'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Target Audience</span>
                  <span className="text-xs font-semibold text-rose-300">{payload.targetSegment || 'At Risk Accounts'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Recommended Offer</span>
                  <span className="text-xs font-semibold text-amber-300">{payload.recommendedOffer || '12% WhatsApp Discount Voucher'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Est. Re-engagement</span>
                  <span className="text-xs font-semibold text-emerald-400">82% Win-Back Score</span>
                </div>
              </div>
            </div>
          )}

          {/* 5. SUPPORT TICKET RESPONSE DETAILS */}
          {actionType === 'RESPOND_TO_SUPPORT_TICKET' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block">Ticket ID</span>
                  <span className="text-xs font-semibold text-white">{payload.ticketId || 'TICK-402'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Customer</span>
                  <span className="text-xs font-semibold text-indigo-300">{payload.supportCustomer || 'Matrix Automation Corp'}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  Edit Suggested Response:
                </label>
                <textarea
                  value={editedResponse}
                  onChange={(e) => setEditedResponse(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 leading-relaxed font-sans"
                />
              </div>
            </div>
          )}

          {/* 6. ANALYTICS REPORT DETAILS */}
          {actionType === 'GENERATE_ANALYTICS_REPORT' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block">Report Name</span>
                  <span className="text-xs font-semibold text-white">{payload.reportType || 'Executive Operations Report'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Data Range</span>
                  <span className="text-xs font-semibold text-indigo-300">{payload.dataRange || 'Last 30 Days'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Agents & Confidence Footer info */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-slate-400 text-[11px]">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Agents: <strong className="text-slate-300">Inventory • Finance • Analytics</strong></span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{payload.confidence || 92}% Confidence</span>
            </div>
          </div>

        </div>

        {/* Modal Footer Buttons */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-end space-x-2.5">
          <button
            onClick={onClose}
            className="py-1.5 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmExecute}
            className="py-1.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1.5"
          >
            <span>{isDuplicateWarning ? 'Force Execution' : 'Confirm & Execute'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
