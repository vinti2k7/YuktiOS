import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck
} from 'lucide-react';
import { SystemState } from '../types';
import { NavTab } from './Navigation';
import { AgentResultRow, AgentResultRowData } from './AgentResultRow';
import { ReasoningDetailModal, ReasoningModalData } from './ReasoningDetailModal';
import { ExecutableActionType, ActionPayload } from '../types/actionTypes';
import { getActiveWorkflowState } from '../services/AgentEventOrchestrator';

interface AskYuktiOSDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  state?: SystemState;
  onNavigateTab?: (tab: NavTab) => void;
  onExecutePurchaseOrder?: () => void;
  onExecuteChurnRetention?: () => void;
  onTriggerAction?: (type: ExecutableActionType, payload: ActionPayload) => void;
}

interface StructuredCopilotResponse {
  type: 'inventory' | 'cash_flow' | 'customer_risk' | 'daily_focus' | 'generic';
  text: string;
  cardTitle: string;
  explanation?: string;
  metrics: { label: string; value: string; highlight?: string }[];
  priorities?: { num: string; title: string; item: string; detail: string; highlight?: string }[];
  agents: AgentResultRowData[];
  recommendation: string;
  confidence?: number;
  isOfflineFallback?: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'yuktios';
  text: string;
  structuredResponse?: StructuredCopilotResponse;
  timestamp: string;
}

export const AskYuktiOSDrawer: React.FC<AskYuktiOSDrawerProps> = ({
  isOpen,
  onClose,
  initialQuery,
  state,
  onNavigateTab,
  onExecutePurchaseOrder,
  onExecuteChurnRetention,
  onTriggerAction,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'yuktios',
      text: "Greetings! I am **YuktiOS Central Orchestrator**. I monitor live telemetry from all 6 domain agents. How can I assist your business today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reasoning Modal State
  const [reasoningData, setReasoningData] = useState<ReasoningModalData | null>(null);
  const [isReasoningOpen, setIsReasoningOpen] = useState(false);
  const [aiModeStatus, setAiModeStatus] = useState<'live' | 'demo'>('demo');

  useEffect(() => {
    if (isOpen && initialQuery) {
      handleSend(initialQuery);
    }
  }, [isOpen, initialQuery]);

  const quickPrompts = [
    "What's happening?",
    "Will we run out of critical inventory?",
    "How is my cash flow?",
    "Which customers are at risk?",
    "What should I focus on today?",
  ];

  // Dynamic helper pulling real data metrics from SystemState prop
  const getCopilotStructuredResponse = (query: string): StructuredCopilotResponse => {
    const qLower = query.toLowerCase();

    const lowStockProd = state?.products?.find((p) => p.stockQuantity <= p.reorderPoint) || state?.products?.[2] || {
      name: 'Industrial Sensor Enclosure IP67',
      stockQuantity: 8,
      reorderPoint: 15,
      forecastDemand30d: 65,
    };

    const overdueInvoices = state?.invoices?.filter((i) => i.status === 'overdue' || i.status === 'pending') || [];
    const pendingAmountTotal = overdueInvoices.reduce((a, i) => a + i.total, 0) || 439550;
    const pendingInvoicesCount = overdueInvoices.length || 2;

    const atRiskCustomer = state?.customers?.find((c) => c.rfmSegment === 'At Risk') || {
      name: 'Matrix Automation Corp',
      company: 'Matrix Auto Ltd',
      rfmSegment: 'At Risk',
    };

    const openTicket = state?.supportTickets?.find((t) => t.status === 'open') || {
      id: 'TICK-402',
      subject: 'Billing discrepancy',
    };

    const cashSurplus = state?.financialSummary?.cashFlowSurplus || 540000;
    const revenueToday = state?.financialSummary?.revenueToday || 236000;
    const expensesToday = state?.financialSummary?.expensesToday || 577700;

    // 0. WHAT'S HAPPENING / WORKFLOW STATUS QUERY
    if (qLower.includes('happening') || qLower.includes('active workflow') || qLower.includes('current workflow')) {
      const activeWf = getActiveWorkflowState();
      const stepSummary = activeWf.steps.map(s => `${s.agent}: ${s.result || s.task}`).join(' ');

      return {
        type: 'daily_focus',
        text: `Active Workflow: ${activeWf.name}. ${stepSummary}`,
        cardTitle: "LIVE WORKFLOW PROGRESS",
        explanation: activeWf.finalRecommendation || "YuktiOS Coordinator is synthesizing multi-agent event signals.",
        metrics: [
          { label: "Workflow Name", value: activeWf.name, highlight: "text-white font-bold" },
          { label: "Status", value: activeWf.status.toUpperCase(), highlight: activeWf.status === 'completed' ? 'text-emerald-400 font-bold' : activeWf.status === 'failed' ? 'text-rose-400 font-bold' : 'text-indigo-400 font-bold' },
          { label: "Started At", value: activeWf.startedAt, highlight: "text-indigo-300 font-bold" },
          { label: "Confidence", value: `${activeWf.confidence || 94}%`, highlight: "text-emerald-400 font-bold" },
        ],
        agents: activeWf.steps.map(s => ({
          agent: s.agent,
          task: s.task,
          status: s.status === 'completed' ? 'Complete' : s.status === 'failed' ? 'Failed' : s.status === 'running' ? 'Running' : 'Pending',
          findings: s.result ? [s.result] : [s.task],
          confidence: 94,
        })),
        recommendation: activeWf.finalRecommendation || "Proceed with purchase order issuance.",
        confidence: activeWf.confidence || 94,
        isOfflineFallback: true,
      };
    }

    // 1. INVENTORY STOCKOUT QUERY
    if (qLower.includes('inventory') || qLower.includes('stockout') || qLower.includes('critical') || qLower.includes('reorder')) {
      return {
        type: 'inventory',
        text: `Yes. I found a high stockout risk for ${lowStockProd.name}.`,
        cardTitle: "INVENTORY STOCKOUT ANALYSIS",
        explanation: `Inventory Agent detected low stock level (${lowStockProd.stockQuantity} units) while Analytics Agent forecasted a +24% demand spike.`,
        metrics: [
          { label: "Product", value: lowStockProd.name, highlight: "text-white font-bold" },
          { label: "Current Stock", value: `${lowStockProd.stockQuantity} units`, highlight: "text-amber-400 font-bold" },
          { label: "Forecasted Demand", value: `${lowStockProd.forecastDemand30d || 65} units`, highlight: "text-indigo-400 font-bold" },
          { label: "Estimated Stockout", value: "3 days", highlight: "text-rose-400 font-bold" },
          { label: "Demand Forecast", value: "+24%", highlight: "text-emerald-400 font-bold" },
          { label: "Confidence", value: "92%", highlight: "text-emerald-400 font-bold" },
        ],
        agents: [
          {
            agent: "Inventory Agent",
            task: "Stockout risk detection",
            status: "Complete",
            dataInput: [
              { label: "Current Stock", value: `${lowStockProd.stockQuantity} units` },
              { label: "Reorder Point", value: `${lowStockProd.reorderPoint} units` },
            ],
            findings: [
              `Low stock detected for ${lowStockProd.name}`,
              `Stock level is ${lowStockProd.stockQuantity} units (reorder threshold: ${lowStockProd.reorderPoint})`,
            ],
            recommendation: "Issue purchase order for 100 units immediately",
            confidence: 95,
          },
          {
            agent: "Analytics Agent",
            task: "Demand forecast (+24%)",
            dataInput: [
              { label: "30-Day Forecast", value: `${lowStockProd.forecastDemand30d || 65} units` },
              { label: "Growth Surge", value: "+24% over 14 days" },
            ],
            findings: [
              "Time-series Prophet model indicates 24% demand surge",
              "Stock depletion velocity predicts zero stock in 3 days",
            ],
            recommendation: "Increase order buffer by 15% to avoid stockout loss",
            confidence: 92,
            status: "Complete",
          },
          {
            agent: "Finance Agent",
            task: "Budget verification (₹85,000)",
            dataInput: [
              { label: "PO Cost", value: "₹85,000" },
              { label: "Cash Surplus", value: `₹${(cashSurplus / 1000).toFixed(0)},000` },
            ],
            findings: [
              `Verified available cash surplus of ₹${(cashSurplus / 1000).toFixed(0)},000`,
              "Purchase order cost ₹85,000 is fully pre-approved",
            ],
            recommendation: "Approve expenditure for PO issuance",
            confidence: 96,
            status: "Complete",
          },
          {
            agent: "YuktiOS Coordinator",
            task: "Final recommendation synthesis",
            findings: [
              "Consensus reached across Inventory, Analytics, and Finance agents",
            ],
            recommendation: "Create Purchase Order for 100 units of Industrial Sensor Enclosure IP67",
            confidence: 94,
            status: "Consensus",
          },
        ],
        recommendation: "Create Purchase Order for 100 units",
        confidence: 94,
        isOfflineFallback: true,
      };
    }

    // 2. CASH FLOW QUERY
    if (qLower.includes('cash') || qLower.includes('flow') || qLower.includes('revenue') || qLower.includes('finance')) {
      return {
        type: 'cash_flow',
        text: "Finance Agent analyzed current receivables, expenses and projected cash position.",
        cardTitle: "FINANCE INSIGHT",
        explanation: "Finance Agent & Analytics Agent completed financial trend analysis over live ledger data.",
        metrics: [
          { label: "Cash Flow Status", value: "Healthy", highlight: "text-emerald-400 font-bold" },
          { label: "Current Cash Flow", value: `₹${(cashSurplus / 1000).toFixed(0)},000`, highlight: "text-white font-bold" },
          { label: "Revenue Today", value: `₹${(revenueToday / 1000).toFixed(0)},000`, highlight: "text-emerald-400 font-bold" },
          { label: "Expenses Today", value: `₹${(expensesToday / 1000).toFixed(0)},000`, highlight: "text-amber-400 font-bold" },
          { label: "Pending Invoices", value: `${pendingInvoicesCount}`, highlight: "text-indigo-400 font-bold" },
          { label: "Pending Amount", value: `₹${(pendingAmountTotal / 1000).toFixed(0)},000`, highlight: "text-rose-400 font-bold" },
        ],
        agents: [
          {
            agent: "Finance Agent",
            task: "Cash-flow analysis",
            dataInput: [
              { label: "Cash Surplus", value: `₹${(cashSurplus / 1000).toFixed(0)},000` },
              { label: "Overdue Invoices", value: `${pendingInvoicesCount}` },
            ],
            findings: [
              `Current cash surplus is healthy at ₹${(cashSurplus / 1000).toFixed(0)},000`,
              `${pendingInvoicesCount} invoices totaling ₹${(pendingAmountTotal / 1000).toFixed(0)},000 are pending payment`,
            ],
            recommendation: `Follow up on overdue invoices totaling ₹${(pendingAmountTotal / 1000).toFixed(0)},000`,
            confidence: 95,
            status: "Complete",
          },
          {
            agent: "Analytics Agent",
            task: "Financial trend analysis",
            findings: [
              "30-day working capital forecast indicates stable liquidity",
              "Receivables collection will increase cash surplus by +81%",
            ],
            recommendation: "Maintain automated invoice reminder schedule",
            confidence: 90,
            status: "Complete",
          },
          {
            agent: "YuktiOS Coordinator",
            task: "Business impact synthesis",
            findings: [
              "Finance and Analytics agents confirm liquidity stability",
            ],
            recommendation: `Follow up on ${pendingInvoicesCount} pending invoices to preserve liquidity`,
            confidence: 92,
            status: "Complete",
          },
        ],
        recommendation: `Follow up on ${pendingInvoicesCount} pending invoices totaling ₹${(pendingAmountTotal / 1000).toFixed(0)},000 to maintain healthy liquidity.`,
        confidence: 92,
        isOfflineFallback: true,
      };
    }

    // 3. CUSTOMER CHURN QUERY
    if (qLower.includes('customer') || qLower.includes('churn') || qLower.includes('at risk') || qLower.includes('client')) {
      return {
        type: 'customer_risk',
        text: `Marketing Agent & Support Agent identified 1 high-risk enterprise account: ${atRiskCustomer.name}.`,
        cardTitle: "CUSTOMER RISK ANALYSIS",
        explanation: `Cross-referencing RFM order recency with support tickets identified ${atRiskCustomer.name} as at-risk.`,
        metrics: [
          { label: "At-Risk Customer", value: atRiskCustomer.name, highlight: "text-white font-bold" },
          { label: "Segment", value: atRiskCustomer.rfmSegment, highlight: "text-rose-400 font-bold" },
          { label: "Churn Risk Score", value: "78%", highlight: "text-rose-400 font-bold" },
          { label: "Order Recency", value: "48 days idle", highlight: "text-amber-400 font-bold" },
          { label: "Open Support Tickets", value: `1 (${openTicket.id})`, highlight: "text-amber-400 font-bold" },
        ],
        agents: [
          {
            agent: "Marketing Agent",
            task: "RFM customer segmentation",
            dataInput: [
              { label: "Customer", value: atRiskCustomer.name },
              { label: "Order Recency", value: "48 days idle" },
            ],
            findings: [
              `${atRiskCustomer.name} classified in 'At Risk' RFM segment`,
              "Order frequency dropped by 65% over past 60 days",
            ],
            recommendation: "Dispatch 12% WhatsApp Retention Offer immediately",
            confidence: 91,
            status: "Complete",
          },
          {
            agent: "Support Agent",
            task: "Support ticket signals",
            dataInput: [
              { label: "Open Tickets", value: openTicket.id },
              { label: "Issue Category", value: openTicket.subject },
            ],
            findings: [
              `Unresolved ticket ${openTicket.id} creating customer friction`,
            ],
            recommendation: "Escalate billing ticket to Account Executive",
            confidence: 88,
            status: "Complete",
          },
          {
            agent: "Analytics Agent",
            task: "Churn probability modeling",
            findings: [
              "Combined RFM + Support signals yield 78% churn probability",
            ],
            recommendation: "Execute proactive retention offer within 24 hours",
            confidence: 89,
            status: "Complete",
          },
        ],
        recommendation: "Prioritize at-risk customers with targeted retention communication.",
        confidence: 90,
        isOfflineFallback: true,
      };
    }

    // 4. DAILY FOCUS QUERY
    return {
      type: 'daily_focus',
      text: "YuktiOS Coordinator synthesized the most important business issues in priority order for today:",
      cardTitle: "TODAY'S PRIORITIES",
      explanation: "Synthesized multi-agent telemetry across Inventory, Finance, Support, and Statutory Payroll.",
      metrics: [],
      priorities: [
        {
          num: "01",
          title: "Critical Inventory",
          item: lowStockProd.name,
          detail: `${lowStockProd.stockQuantity} units remaining • High stockout risk in 3 days`,
          highlight: "border-amber-500/40 text-amber-300",
        },
        {
          num: "02",
          title: "Receivables",
          item: `₹${(pendingAmountTotal / 1000).toFixed(0)},000 Pending`,
          detail: `${pendingInvoicesCount} invoices outstanding`,
          highlight: "border-indigo-500/40 text-indigo-300",
        },
        {
          num: "03",
          title: "Customer Risk",
          item: atRiskCustomer.name,
          detail: "78% churn probability • 48 days order inactivity",
          highlight: "border-rose-500/40 text-rose-300",
        },
      ],
      agents: [
        {
          agent: "Inventory Agent",
          task: "Stockout detection",
          findings: [`Low stock on ${lowStockProd.name}`],
          recommendation: "Reorder 100 units",
          confidence: 95,
          status: "Complete",
        },
        {
          agent: "Finance Agent",
          task: "Receivables audit",
          findings: [`₹${(pendingAmountTotal / 1000).toFixed(0)},000 in overdue invoices`],
          recommendation: "Follow up on client invoices",
          confidence: 92,
          status: "Complete",
        },
        {
          agent: "Marketing Agent",
          task: "RFM churn scoring",
          findings: [`${atRiskCustomer.name} at risk`],
          recommendation: "Launch 12% retention discount",
          confidence: 89,
          status: "Complete",
        },
        {
          agent: "YuktiOS Coordinator",
          task: "Executive prioritization",
          findings: ["Multi-agent telemetry synchronized"],
          recommendation: "Focus on inventory stockout prevention first, followed by receivables and customer retention.",
          confidence: 94,
          status: "Consensus",
        },
      ],
      recommendation: "Resolve the critical inventory risk first, followed by receivables and customer retention.",
      confidence: 94,
      isOfflineFallback: true,
    };
  };

  const handleSend = async (customQuery?: string) => {
    const query = customQuery || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customQuery) setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });

      let structured: StructuredCopilotResponse;

      if (res.ok) {
        const data = await res.json();
        if (data.aiMode === 'live') {
          setAiModeStatus('live');
        } else {
          setAiModeStatus('demo');
        }

        structured = {
          type: (data.actionType as any) || 'daily_focus',
          text: String(data.answer || "YuktiOS Coordinator analyzed live operations."),
          cardTitle: String(data.cardTitle || "EXECUTIVE AI CONSENSUS"),
          explanation: String(data.recommendation?.description || data.explanation || "YuktiOS Coordinator synthesized agent telemetry."),
          metrics: Array.isArray(data.insights)
            ? data.insights.map((i: any) => ({
                label: String(i.title || ''),
                value: typeof i.value === 'object' && i.value !== null ? JSON.stringify(i.value) : String(i.value ?? ''),
                highlight: i.severity === 'critical' ? 'text-rose-400 font-bold' : i.severity === 'warning' ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold',
              }))
            : [],
          agents: Array.isArray(data.agentsConsulted)
            ? data.agentsConsulted.map((a: any) => ({
                agent: String(a.agent || 'Agent'),
                task: String(a.task || a.contribution || 'Telemetry Audit'),
                dataInput: Array.isArray(a.dataInput) ? a.dataInput : [],
                findings: Array.isArray(a.findings)
                  ? a.findings.map((f: any) =>
                      typeof f === 'string'
                        ? f
                        : typeof f === 'object' && f !== null
                        ? (f.name ? `${f.name}: Stock ${f.currentStock ?? ''}, Reorder at ${f.reorderPoint ?? ''}` : f.summary || f.description || JSON.stringify(f))
                        : String(f ?? '')
                    )
                  : [String(a.contribution || 'Verified domain parameters')],
                recommendation: typeof a.recommendation === 'string' ? a.recommendation : (a.recommendation as any)?.title || (a.recommendation as any)?.description || undefined,
                confidence: Number(a.confidence) || 92,
                status: String(a.status || 'Complete'),
              }))
            : [],
          recommendation: typeof data.recommendation === 'string'
            ? data.recommendation
            : data.recommendation?.title || data.recommendation?.description || "System operating normally.",
          confidence: Number(data.recommendation?.confidence) || Number(data.confidence) || 92,
          isOfflineFallback: data.aiMode !== 'live',
        };
      } else {
        setAiModeStatus('demo');
        structured = getCopilotStructuredResponse(query);
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'yuktios',
        text: structured.text,
        structuredResponse: structured,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.warn("Using local business intelligence fallback:", err);
      const structured = getCopilotStructuredResponse(query);
      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'yuktios',
        text: structured.text,
        structuredResponse: structured,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const openReasoningModal = (msg: ChatMessage) => {
    if (!msg.structuredResponse) return;
    const resp = msg.structuredResponse;

    setReasoningData({
      userQuery: msg.text || "Business Inquiry",
      cardTitle: resp.cardTitle,
      agents: resp.agents,
      consensusExplanation: resp.explanation || "YuktiOS Coordinator verified signal alignment across specialized agents to eliminate operational risk.",
      recommendation: resp.recommendation,
      confidence: resp.confidence || 92,
      actionAvailable: true,
      actionType: resp.type,
    });
    setIsReasoningOpen(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative z-10 w-full max-w-lg bg-slate-900 border-l border-slate-800 text-slate-100 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
          
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-indigo-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white">Ask Assistant</h2>
                  <span className={`text-[10px] font-mono border px-2 py-0.5 rounded flex items-center gap-1 ${
                    aiModeStatus === 'live'
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${aiModeStatus === 'live' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                    {aiModeStatus === 'live' ? 'Live AI' : 'Deterministic Mode'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Multi-agent business intelligence assistant</p>
              </div>
            </div>
            <button
              onClick={onClose}
              id="btn-close-drawer"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Suggested Prompts Chips */}
          <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800">
            <p className="text-[11px] font-medium text-slate-400 mb-1.5 flex items-center gap-1">
              Suggested queries:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="text-[11px] bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-800 text-left disabled:opacity-50 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'yuktios' && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-3 ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none shadow-sm'
                  }`}
                >
                  <div>{m.text}</div>

                  {/* Structured Multi-Agent Insight Card */}
                  {m.structuredResponse && (
                    <div className="bg-slate-950/80 border border-indigo-500/30 rounded-xl p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase">
                          {String(m.structuredResponse.cardTitle || 'EXECUTIVE AI CONSENSUS')}
                        </span>
                        <span className={`text-[9px] font-mono border px-1.5 py-0.5 rounded ${
                          m.structuredResponse.isOfflineFallback
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {m.structuredResponse.isOfflineFallback ? 'Using local business intelligence' : 'Live API Synced'}
                        </span>
                      </div>

                      {/* Metrics Grid */}
                      {Array.isArray(m.structuredResponse.metrics) && m.structuredResponse.metrics.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          {m.structuredResponse.metrics.map((met, idx) => (
                            <div key={idx} className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                              <span className="text-[9px] text-slate-400 block">{String(met.label || '')}</span>
                              <span className={met.highlight || 'text-white font-bold'}>{String(met.value ?? '')}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Today's Priorities List (if present) */}
                      {Array.isArray(m.structuredResponse.priorities) && m.structuredResponse.priorities.length > 0 && (
                        <div className="space-y-2 text-[11px]">
                          {m.structuredResponse.priorities.map((p, idx) => (
                            <div key={idx} className={`p-2.5 rounded-lg border bg-slate-900/80 ${p.highlight || ''}`}>
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-[10px]">{String(p.num || '')} — {String(p.title || '')}</span>
                                <span className="text-white font-bold">{String(p.item ?? '')}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">{String(p.detail ?? '')}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Interactive Agents Consulted Section */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Agents Consulted (Click to Expand):
                          </span>
                          <span className="text-[9px] font-mono text-indigo-400">
                            {Array.isArray(m.structuredResponse.agents) ? m.structuredResponse.agents.length : 0} Agents
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {Array.isArray(m.structuredResponse.agents) && m.structuredResponse.agents.map((ag, idx) => (
                            <AgentResultRow key={idx} data={ag} />
                          ))}
                        </div>
                      </div>

                      {/* Recommendation & Action Buttons */}
                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <div className="text-[11px]">
                          <span className="font-bold text-indigo-300">YuktiOS Recommendation: </span>
                          <span className="text-white font-semibold">
                            {typeof m.structuredResponse.recommendation === 'string'
                              ? m.structuredResponse.recommendation
                              : (m.structuredResponse.recommendation as any)?.title || (m.structuredResponse.recommendation as any)?.description || String(m.structuredResponse.recommendation || '')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          {/* VIEW REASONING BUTTON */}
                          <button
                            onClick={() => openReasoningModal(m)}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 transition"
                          >
                            View Reasoning
                          </button>

                          {/* EXECUTE ACTION BUTTON */}
                          {m.structuredResponse.type === 'inventory' && (
                            <button
                              onClick={() => {
                                onClose();
                                if (onTriggerAction) {
                                  onTriggerAction('CREATE_PURCHASE_ORDER', {
                                    productName: 'Industrial Sensor Enclosure IP67',
                                    quantity: 100,
                                    totalAmount: 85000,
                                    supplierName: 'Apex Industrial Components',
                                    reason: 'Low stock (8 units) + forecasted demand spike (+24%).',
                                  });
                                } else if (onExecutePurchaseOrder) {
                                  onExecutePurchaseOrder();
                                }
                              }}
                              className="flex-1 py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition flex items-center justify-center gap-1"
                            >
                              <span>Execute Action</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          {m.structuredResponse.type === 'customer_risk' && (
                            <button
                              onClick={() => {
                                onClose();
                                if (onTriggerAction) {
                                  onTriggerAction('CREATE_MARKETING_CAMPAIGN', {
                                    campaignName: 'At-Risk Account Retention Offer',
                                    targetSegment: 'At Risk Enterprise Clients (Matrix Automation Corp)',
                                    recommendedOffer: '12% WhatsApp Discount Voucher',
                                  });
                                } else if (onExecuteChurnRetention) {
                                  onExecuteChurnRetention();
                                }
                              }}
                              className="flex-1 py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition flex items-center justify-center gap-1"
                            >
                              <span>Launch Offer</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          {m.structuredResponse.type === 'payroll' && (
                            <button
                              onClick={() => {
                                onClose();
                                if (onTriggerAction) {
                                  onTriggerAction('RUN_PAYROLL', {
                                    payrollPeriod: 'August 2026',
                                    employeeCount: state?.employees?.length || 12,
                                    payrollAmount: 520000,
                                  });
                                } else if (onNavigateTab) {
                                  onNavigateTab('hr');
                                }
                              }}
                              className="flex-1 py-1.5 px-2.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-[11px] font-bold border border-indigo-500/40 transition flex items-center justify-center gap-1"
                            >
                              <span>Run Payroll</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          {m.structuredResponse.type === 'support' && (
                            <button
                              onClick={() => {
                                onClose();
                                if (onTriggerAction) {
                                  onTriggerAction('RESPOND_TO_SUPPORT_TICKET', {
                                    ticketId: 'TICK-402',
                                    supportCustomer: 'Matrix Automation Corp',
                                    supportIssue: 'NEFT Payment Verification',
                                    suggestedResponse: 'Thank you for contacting support. Your NEFT payment reconciliation has been verified by Finance Agent.',
                                  });
                                } else if (onNavigateTab) {
                                  onNavigateTab('support');
                                }
                              }}
                              className="flex-1 py-1.5 px-2.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-[11px] font-bold border border-purple-500/40 transition flex items-center justify-center gap-1"
                            >
                              <span>Respond Ticket</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          {m.structuredResponse.type === 'cash_flow' && (
                            <button
                              onClick={() => {
                                onClose();
                                if (onTriggerAction) {
                                  onTriggerAction('SEND_PAYMENT_REMINDER', {
                                    invoiceNumber: 'INV-2026-091',
                                    customerName: 'Matrix Automation Corp',
                                    totalAmount: 188800,
                                  });
                                } else if (onNavigateTab) {
                                  onNavigateTab('finance');
                                }
                              }}
                              className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 text-[11px] font-bold border border-emerald-500/40 transition flex items-center justify-center gap-1"
                            >
                              <span>Send Reminder</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          {m.structuredResponse.type === 'daily_focus' && (
                            <button
                              onClick={() => {
                                onClose();
                                if (onTriggerAction) {
                                  onTriggerAction('GENERATE_ANALYTICS_REPORT', {
                                    reportType: 'Executive Business Operations Report',
                                    dataRange: 'Last 30 Days',
                                  });
                                } else if (onNavigateTab) {
                                  onNavigateTab('blueprint');
                                }
                              }}
                              className="flex-1 py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-md transition flex items-center justify-center gap-1"
                            >
                              <span>Generate Report</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    className={`text-[10px] text-right font-mono ${
                      m.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>

                {m.sender === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 items-center text-slate-400 text-xs p-2.5 bg-slate-800/40 rounded-xl border border-slate-800 font-mono">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                <span>YuktiOS is coordinating agents...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-4 border-t border-slate-800 bg-slate-900">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask YuktiOS anything about your business..."
                disabled={isLoading}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                id="input-ask-yuktios"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                id="btn-submit-yuktios-query"
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-xl transition-all shadow-md shadow-indigo-950/50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[10px] text-slate-500 mt-2 text-center">
              Powered by YuktiOS Multi-Agent Runtime & Real-Time Agent Event Log
            </p>
          </div>

        </div>
      </div>

      {/* Decision Reasoning Trace Modal */}
      <ReasoningDetailModal
        isOpen={isReasoningOpen}
        onClose={() => setIsReasoningOpen(false)}
        data={reasoningData}
        onExecuteAction={(type) => {
          if (type === 'inventory' && onExecutePurchaseOrder) {
            onExecutePurchaseOrder();
          } else if (type === 'customer_risk' && onExecuteChurnRetention) {
            onExecuteChurnRetention();
          } else if (type === 'cash_flow' && onNavigateTab) {
            onNavigateTab('finance');
          } else if (type === 'hr' && onNavigateTab) {
            onNavigateTab('hr');
          } else if (type === 'support' && onNavigateTab) {
            onNavigateTab('support');
          } else if (onNavigateTab) {
            onNavigateTab('blueprint');
          }
        }}
      />
    </>
  );
};
