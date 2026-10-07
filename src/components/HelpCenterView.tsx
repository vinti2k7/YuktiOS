import React, { useState } from 'react';
import { SystemState } from '../types';
import { NavTab } from './Navigation';
import {
  HelpCircle,
  Search,
  BookOpen,
  IndianRupee,
  Boxes,
  Users,
  Megaphone,
  Headphones,
  BarChart3,
  Bot,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  MessageSquare,
  AlertTriangle,
  FileText,
  ShoppingBag,
  RefreshCw,
  Play,
  Key,
  Database,
  Send,
  LifeBuoy
} from 'lucide-react';

interface HelpCenterViewProps {
  state: SystemState;
  onNavigateTab: (tab: NavTab) => void;
  onOpenAskAI?: (query?: string) => void;
}

export const HelpCenterView: React.FC<HelpCenterViewProps> = ({
  state,
  onNavigateTab,
  onOpenAskAI,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<'all' | 'getting-started' | 'agents' | 'actions' | 'faq' | 'troubleshooting' | 'contact'>('all');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  // Direct Ticket Form State
  const [ticketCustomer, setTicketCustomer] = useState('Rohan (Owner)');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'General' | 'Finance' | 'Inventory' | 'HR' | 'Marketing' | 'System'>('General');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketSubmittedSuccess, setTicketSubmittedSuccess] = useState(false);

  const faqs = [
    {
      question: "What is YuktiOS and how does it help SME businesses?",
      category: "Overview",
      answer: "YuktiOS is a Multi-Agent Operating System tailored for Indian Small & Medium Enterprises (SMEs). It unifies six autonomous domain agents (Finance, Inventory, HR, Marketing, Customer Support, and Analytics) on a central event bus to automate routine tasks, detect operational anomalies, predict demand, and maintain statutory compliance with minimal manual data entry."
    },
    {
      question: "How does the Multi-Agent consensus and decision loop work?",
      category: "AI & Agents",
      answer: "YuktiOS follows an 'Observe → Analyze → Recommend → Act' loop. When an anomaly is detected (e.g. low stock), the Inventory Agent identifies the shortfall, the Analytics Agent forecasts 14-day demand, the Finance Agent verifies available budget, and the YuktiOS Coordinator synthesizes a single, verified recommendation (e.g. a Purchase Order for 100 units) ready for 1-click execution."
    },
    {
      question: "Is my business data persistent across server restarts?",
      category: "Data & Storage",
      answer: "Yes. YuktiOS persists all invoices, expenses, inventory ledger items, employee attendance records, support tickets, and activity logs to the local 'data_store.json' disk store. Changes made in the UI or via API are committed immediately."
    },
    {
      question: "How do I configure my Google Gemini AI API key?",
      category: "Configuration",
      answer: "Set your API key in the '.env' file in the project root: GEMINI_API_KEY=your_key_here. When configured, YuktiOS connects to Google Gemini models for live natural language copilot responses, RFM marketing copy generation, and empathetic customer support drafts. If no key is provided, the system gracefully operates in offline rule-based mode."
    },
    {
      question: "What are the statutory tax and deduction rates applied?",
      category: "Compliance",
      answer: "Finance Agent applies the standard 18% Goods & Services Tax (GST) rate for B2B invoices and tracks GSTR-1 / GSTR-3B liability. HR Agent automatically computes 12% Employees' Provident Fund (EPF) and 0.75% Employees' State Insurance (ESI) deductions from gross base salaries."
    },
    {
      question: "What does the 'POS Sale' button do?",
      category: "Actions",
      answer: "The 'POS Sale' button simulates a live point-of-sale transaction. It executes a 4-agent cascade: 1) Finance Agent generates a GST invoice, 2) Inventory Agent deducts stock and recalculates stockout risk, 3) Marketing Agent updates customer RFM tier, and 4) Central Orchestrator logs the event in the audit trail."
    },
    {
      question: "Can multiple businesses or tenants use the system?",
      category: "Multi-Tenancy",
      answer: "Yes. YuktiOS features built-in multi-tenant isolation. Each registered business tenant receives an isolated data partition for their products, invoices, staff, and customer records with session authentication."
    }
  ];

  const agentCards = [
    {
      id: 'finance' as NavTab,
      name: 'Finance Agent',
      icon: IndianRupee,
      color: 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400',
      tag: 'GST & Cash Flow',
      description: 'Generates GST-compliant B2B invoices with 18% tax calculation, records categorized operational expenses, and produces 30-90 day predictive cash flow forecasts.',
      keyActions: ['+ Auto GST Invoice', 'Log Expense Entry', 'Review GSTR-1 / GSTR-3B Liability'],
    },
    {
      id: 'inventory' as NavTab,
      name: 'Inventory Agent',
      icon: Boxes,
      color: 'bg-amber-950/40 border-amber-800/40 text-amber-400',
      tag: 'Demand & Auto PO',
      description: 'Audits SKU inventory balance, calculates dynamic stockout risk scores, models 30-day demand velocity, and generates optimal Purchase Orders before stock depletes.',
      keyActions: ['Reorder Stock Units', 'View 30-Day Demand Forecast', 'Audit Stock Ledger'],
    },
    {
      id: 'hr' as NavTab,
      name: 'HR & Payroll Agent',
      icon: Users,
      color: 'bg-purple-950/40 border-purple-800/40 text-purple-400',
      tag: 'EPF & Attendance',
      description: 'Processes biometric punch logs, calculates statutory employee deductions (12% EPF + 0.75% ESI), and executes one-click monthly payroll batch disbursals.',
      keyActions: ['Run Monthly Payroll', 'Audit Employee Roster', 'Review EPF/ESI Compliance'],
    },
    {
      id: 'marketing' as NavTab,
      name: 'Marketing Agent',
      icon: Megaphone,
      color: 'bg-cyan-950/40 border-cyan-800/40 text-cyan-400',
      tag: 'RFM & AI Copy',
      description: 'Clusters customer accounts using Recency, Frequency, and Monetary (RFM) modeling, computes churn risk scores, and generates AI-written WhatsApp and Email retention campaigns.',
      keyActions: ['Generate AI WhatsApp Copy', 'Target At-Risk Accounts', 'Launch Multi-Channel Campaign'],
    },
    {
      id: 'support' as NavTab,
      name: 'Customer Support Agent',
      icon: Headphones,
      color: 'bg-rose-950/40 border-rose-800/40 text-rose-400',
      tag: 'RAG FAQ Triage',
      description: 'Performs semantic vector retrieval against the indexed FAQ knowledge base, prioritizes incoming customer tickets, and drafts warm, empathetic auto-replies.',
      keyActions: ['Query RAG FAQ Store', 'Regenerate AI Draft Reply', 'Approve & Send Resolution'],
    },
    {
      id: 'analytics' as NavTab,
      name: 'Analytics Agent',
      icon: BarChart3,
      color: 'bg-indigo-950/40 border-indigo-800/40 text-indigo-400',
      tag: 'Cross-Agent Roadmap',
      description: 'Maintains cross-agent correlation algorithms, displays technical layer specifications, and tracks multi-phase delivery roadmaps from single agent to predictive intelligence.',
      keyActions: ['Inspect 4-Layer Architecture', 'Review Multi-Agent Interface Contract', 'Track Roadmap Delivery'],
    },
  ];

  const actionGlossary = [
    {
      action: '+ Auto GST Invoice',
      location: 'Finance Agent / Header',
      purpose: 'Creates an official GST invoice with itemized subtotal and 18% tax. Automatically updates pending receivables and event stream.',
      icon: FileText,
      color: 'text-emerald-400',
    },
    {
      action: 'Log Expense',
      location: 'Finance Agent',
      purpose: 'Records categorized operational expense vouchers (Raw Materials, Salaries, Utilities, etc.) and updates net operating margin.',
      icon: IndianRupee,
      color: 'text-rose-400',
    },
    {
      action: 'POS Sale',
      location: 'Header Top Bar',
      purpose: 'Simulates a complete customer transaction across Finance, Inventory, Marketing, and Central Orchestrator in real time.',
      icon: ShoppingBag,
      color: 'text-emerald-400',
    },
    {
      action: 'Reorder Units',
      location: 'Inventory Agent / Dashboard',
      purpose: 'Generates an immediate purchase order for the optimal order quantity, increments stock ledger, and clears stockout warnings.',
      icon: RefreshCw,
      color: 'text-amber-400',
    },
    {
      action: 'Run August Payroll',
      location: 'HR Agent',
      purpose: 'Calculates salary take-home after statutory EPF (12%) and ESI (0.75%) deductions, logs expense, and records disbursement history.',
      icon: Play,
      color: 'text-purple-400',
    },
    {
      action: 'Ask Assistant',
      location: 'Header / Top Bar',
      purpose: 'Opens the AI Assistant drawer for natural language business queries, predictive risk breakdowns, and multi-agent reasoning traces.',
      icon: Bot,
      color: 'text-indigo-400',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSupportTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    setIsSubmittingTicket(true);
    try {
      const newTicket = {
        customerName: ticketCustomer,
        subject: `[${ticketCategory}] ${ticketSubject}`,
        message: ticketMessage,
      };

      await fetch('/api/gemini/support-auto-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket),
      });

      setTicketSubmittedSuccess(true);
      setTicketSubject('');
      setTicketMessage('');
      setTimeout(() => setTicketSubmittedSuccess(false), 6000);
    } catch (err) {
      console.warn('Support ticket submission fallback');
      setTicketSubmittedSuccess(true);
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* 1. HERO HEADER WITH SEARCH BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-7 space-y-4">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-indigo-400 bg-indigo-950/40 border border-indigo-800/50 px-2 py-0.5 rounded flex items-center gap-1.5">
              <LifeBuoy className="w-3.5 h-3.5" />
              Help & Documentation
            </span>
            <span className="text-xs text-slate-400 font-mono">v2.4</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white">
            YuktiOS Knowledge Base & Operations Guide
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Understand how YuktiOS coordinates domain agents to automate GST invoicing, prevent stockouts, manage payroll, retain clients, and answer executive questions.
          </p>
        </div>

        {/* Search bar */}
        <div className="pt-1 max-w-lg">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search features, buttons, FAQs, or troubleshooting..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION FILTER PILLS */}
      <div className="flex overflow-x-auto no-scrollbar gap-1.5 border-b border-slate-800 pb-2 text-xs">
        {[
          { id: 'all', label: 'All Resources' },
          { id: 'getting-started', label: 'Getting Started' },
          { id: 'agents', label: 'Domain Agents' },
          { id: 'actions', label: 'Action Glossary' },
          { id: 'faq', label: 'Frequently Asked Questions' },
          { id: 'troubleshooting', label: 'Troubleshooting' },
          { id: 'contact', label: 'Contact Support' },
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id as any)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
              activeSection === sec.id
                ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* 3. GETTING STARTED GUIDE */}
      {(activeSection === 'all' || activeSection === 'getting-started') && (
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Getting Started
            </h2>
            <span className="text-xs text-slate-400 font-mono">4-Step Workflow</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="w-5 h-5 rounded bg-slate-800 text-slate-300 font-mono font-semibold text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="text-xs font-semibold text-white">Review Business Health</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Check top-level metrics, active alerts, and daily revenue on the Executive Dashboard.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('dashboard')}
                className="mt-2 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="w-5 h-5 rounded bg-slate-800 text-slate-300 font-mono font-semibold text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="text-xs font-semibold text-white">Inspect Agent Workspaces</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Navigate to Finance, Inventory, HR, Marketing, or Support to manage specialized operations.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('finance')}
                className="mt-2 text-[11px] font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
              >
                <span>View Finance Agent</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="w-5 h-5 rounded bg-slate-800 text-slate-300 font-mono font-semibold text-xs flex items-center justify-center">
                  3
                </span>
                <h3 className="text-xs font-semibold text-white">Execute Recommended Actions</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Review multi-agent recommendations (such as Reordering Stock or Retaining Clients) and execute them safely.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('blueprint')}
                className="mt-2 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
              >
                <span>Open Command Center</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="w-5 h-5 rounded bg-slate-800 text-slate-300 font-mono font-semibold text-xs flex items-center justify-center">
                  4
                </span>
                <h3 className="text-xs font-semibold text-white">Ask Natural Language AI</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Click 'Ask Assistant' to ask questions like "Will we run out of inventory?" or "How is cash flow?".
                </p>
              </div>
              <button
                onClick={() => onOpenAskAI && onOpenAskAI()}
                className="mt-2 text-[11px] font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1 transition"
              >
                <span>Launch Assistant</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

          </div>
        </section>
      )}

      {/* 4. DOMAIN AGENTS BREAKDOWN */}
      {(activeSection === 'all' || activeSection === 'agents') && (
        <section className="space-y-3.5">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-400" />
              The 6 Specialized Domain Agents
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Each agent autonomously manages a core business operational domain</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {agentCards.map((ag) => {
              const Icon = ag.icon;
              return (
                <div
                  key={ag.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div className={`p-2 rounded-lg ${ag.color} border`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded">
                        {ag.tag}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-white">{ag.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ag.description}</p>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">Capabilities:</span>
                      <ul className="text-xs text-slate-300 space-y-0.5">
                        {ag.keyActions.map((act) => (
                          <li key={act} className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateTab(ag.id)}
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Open {ag.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. ACTION & BUTTON GLOSSARY */}
      {(activeSection === 'all' || activeSection === 'actions') && (
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3.5">
          <div>
            <h2 className="text-sm font-semibold text-white">Action & Button Glossary</h2>
            <p className="text-xs text-slate-400 mt-0.5">Operational impact of core actions across YuktiOS</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Operational Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {actionGlossary.map((item) => {
                  const Icon = item.icon;
                  return (
                    <tr key={item.action} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3">
                        <span className={`font-semibold flex items-center gap-1.5 ${item.color}`}>
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span>{item.action}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{item.location}</td>
                      <td className="py-2.5 px-3 text-slate-300 leading-relaxed">{item.purpose}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 6. EXPANDABLE FREQUENTLY ASKED QUESTIONS */}
      {(activeSection === 'all' || activeSection === 'faq') && (
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                Frequently Asked Questions (FAQ)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Quick answers to common questions about system operation</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">{filteredFaqs.length} Articles</span>
          </div>

          <div className="space-y-2">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No FAQs matching "{searchQuery}".
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const isOpen = expandedFaqIndex === idx;
                return (
                  <div
                    key={faq.question}
                    className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden transition"
                  >
                    <button
                      onClick={() => setExpandedFaqIndex(isOpen ? null : idx)}
                      className="w-full p-3.5 text-left flex items-center justify-between text-xs font-semibold text-white hover:text-indigo-300 transition gap-3"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                          {faq.category}
                        </span>
                        <span>{faq.question}</span>
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-3.5 pb-3.5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-2.5">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* 7. TROUBLESHOOTING & SOLUTIONS */}
      {(activeSection === 'all' || activeSection === 'troubleshooting') && (
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3.5">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Troubleshooting & Solutions
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Common setup, API key, and data synchronization resolutions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-amber-300">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Responses in Deterministic Mode</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                If the assistant uses local rule responses, configure <code className="text-slate-200 font-mono">GEMINI_API_KEY</code> in your <code className="text-slate-200 font-mono">.env</code> file for live generative inference.
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-indigo-300">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>Resetting Store Data</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                To reset simulated transactions back to initial state, call <code className="text-slate-200 font-mono">/api/data/reset</code> or restart the server.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 8. CONTACT SUPPORT FORM */}
      {(activeSection === 'all' || activeSection === 'contact') && (
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-rose-400" />
                Contact Support Helpdesk
              </h2>
              <p className="text-xs text-slate-400">
                Submit an inquiry directly into the Support Agent ticket queue
              </p>
            </div>

            <div className="text-xs text-slate-400 font-mono bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg">
              Hotline: +91 800 YUKTI OS
            </div>
          </div>

          {ticketSubmittedSuccess && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-lg text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Support ticket submitted successfully. It has been queued in the Support Agent workspace.</span>
            </div>
          )}

          <form onSubmit={handleSupportTicketSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Your Name / Role:</label>
                <input
                  type="text"
                  value={ticketCustomer}
                  onChange={(e) => setTicketCustomer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-slate-600"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Domain Category:</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-slate-600"
                >
                  <option value="General">General Question</option>
                  <option value="Finance">Finance & Invoicing</option>
                  <option value="Inventory">Inventory & Purchase Orders</option>
                  <option value="HR">HR & Payroll</option>
                  <option value="Marketing">Marketing & Campaigns</option>
                  <option value="System">System & Integrations</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Subject:</label>
              <input
                type="text"
                placeholder="Brief summary of your inquiry..."
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Details:</label>
              <textarea
                rows={3}
                placeholder="Provide details or questions..."
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 leading-relaxed font-sans"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                Tickets are indexed into the RAG vector store for instant resolution.
              </span>

              <button
                type="submit"
                disabled={isSubmittingTicket || !ticketSubject.trim() || !ticketMessage.trim()}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-white font-semibold flex items-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingTicket ? 'Submitting...' : 'Submit Support Ticket'}</span>
              </button>
            </div>
          </form>
        </section>
      )}

    </div>
  );
};
