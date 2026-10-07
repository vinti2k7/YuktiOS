import React, { useState } from 'react';
import { SupportTicket, FAQItem } from '../types';
import { 
  Headphones, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Bot, 
  BookOpen, 
  Download, 
  Check, 
  Inbox
} from 'lucide-react';

interface SupportAgentViewProps {
  tickets: SupportTicket[];
  faqs: FAQItem[];
  onResolveTicket: (ticketId: string, replyText: string) => void;
}

export const SupportAgentView: React.FC<SupportAgentViewProps> = ({
  tickets,
  faqs,
  onResolveTicket,
}) => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'rag_kb'>('tickets');
  const [ticketSearch, setTicketSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [aiDraftReply, setAiDraftReply] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Filtered Tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = 
      t.ticketNumber.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.customerName.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.subject.toLowerCase().includes(ticketSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === 'all' || t.priority.toLowerCase() === priorityFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || filteredTickets[0] || tickets[0];

  const handleGenerateAIReply = async () => {
    if (!selectedTicket) return;
    setIsGenerating(true);

    try {
      const res = await fetch('/api/gemini/support-auto-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: selectedTicket.customerName,
          subject: selectedTicket.subject,
          message: selectedTicket.message,
        }),
      });
      const data = await res.json();
      setAiDraftReply(data.reply || selectedTicket.aiSuggestedReply || 'Thank you for reaching out!');
    } catch (err) {
      console.error('Support AI error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendResolution = () => {
    if (!selectedTicket) return;
    onResolveTicket(selectedTicket.id, aiDraftReply || selectedTicket.aiSuggestedReply || 'Resolved');
    setAiDraftReply('');
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  const handleExportTicketsCSV = () => {
    const headers = ['Ticket ID', 'Customer Name', 'Email', 'Subject', 'Category', 'Priority', 'Status', 'Message'];
    const rows = tickets.map((t) => [
      `"${t.ticketNumber}"`,
      `"${t.customerName}"`,
      `"${t.customerEmail}"`,
      `"${t.subject}"`,
      `"${t.category}"`,
      `"${t.priority}"`,
      `"${t.status}"`,
      `"${t.message.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `YuktiOS_Support_Tickets_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-rose-400 bg-rose-950/40 border border-rose-800/50 px-2 py-0.5 rounded">
              Customer Support Agent
            </span>
            <span className="text-xs text-slate-400">RAG Knowledge Base & Auto-Reply Engine</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1.5">Support Triage & Knowledge Base</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automates ticket triage, retrieves answers from indexed FAQ knowledge base, and drafts contextual replies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportTicketsCSV}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            title="Download Support Tickets as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <p className="text-slate-300 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              WhatsApp Bridge: <span className="font-mono text-slate-400">+91 800 YUKTI OS</span>
            </p>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="border-b border-slate-800 flex space-x-1 text-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-3.5 py-2 font-medium transition border-b-2 whitespace-nowrap ${
            activeTab === 'tickets'
              ? 'border-rose-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Ticket Triage Board ({tickets.length})
        </button>
        <button
          onClick={() => setActiveTab('rag_kb')}
          className={`px-3.5 py-2 font-medium transition border-b-2 whitespace-nowrap ${
            activeTab === 'rag_kb'
              ? 'border-rose-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Knowledge Base & FAQs ({faqs.length})
        </button>
      </div>

      {/* Tickets Triage Tab */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Ticket List (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-white">Incoming Tickets</h3>
              <span className="text-xs text-slate-400 font-mono">{filteredTickets.length} shown</span>
            </div>

            {/* Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search ticket, name, or subject..."
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-slate-600"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="resolved">Resolved</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-slate-600"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {filteredTickets.length === 0 ? (
              <div className="text-center py-10 border border-slate-800 rounded-xl bg-slate-950/50">
                <Inbox className="w-7 h-7 text-slate-600 mx-auto mb-1.5" />
                <p className="text-xs font-medium text-slate-300">No tickets found</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-0.5">
                {filteredTickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTicketId(t.id);
                      setAiDraftReply(t.aiSuggestedReply || '');
                    }}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                      selectedTicket?.id === t.id
                        ? 'bg-slate-800/80 border-slate-600 text-white'
                        : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                      <span>{t.ticketNumber}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-medium uppercase text-[10px] ${
                          t.priority === 'high' ? 'bg-rose-950/50 text-rose-300 border border-rose-800/50' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>
                    <h4 className="font-medium text-white mt-1 text-xs leading-snug">{t.subject}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{t.customerName}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">{t.category}</span>
                      <span
                        className={`font-medium px-2 py-0.5 rounded ${
                          t.status === 'resolved' 
                            ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40' 
                            : 'bg-amber-950/40 text-amber-300 border border-amber-800/40'
                        }`}
                      >
                        {t.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ticket Detail & AI Auto Reply (7 cols) */}
          <div className="lg:col-span-7">
            {selectedTicket ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3.5 gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">{selectedTicket.ticketNumber}</span>
                    <h3 className="text-base font-semibold text-white">{selectedTicket.subject}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">From: {selectedTicket.customerName} ({selectedTicket.customerEmail})</p>
                  </div>

                  <button
                    onClick={handleGenerateAIReply}
                    disabled={isGenerating}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isGenerating ? 'Querying...' : 'Generate Auto-Reply'}</span>
                  </button>
                </div>

                {/* Message Content */}
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-xs text-slate-200 space-y-1">
                  <p className="text-slate-400 text-[10px] font-mono">Original Customer Query:</p>
                  <p className="leading-relaxed font-sans text-slate-200">{selectedTicket.message}</p>
                </div>

                {/* Suggested Reply */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-rose-400" /> AI Suggested Reply Draft:
                    </label>
                    <span className="text-[10px] text-slate-500">Editable before sending</span>
                  </div>
                  <textarea
                    rows={4}
                    value={aiDraftReply || selectedTicket.aiSuggestedReply || ''}
                    onChange={(e) => setAiDraftReply(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-slate-600 leading-relaxed font-sans"
                    placeholder="Type or edit resolution reply..."
                  />
                </div>

                {copiedNotification && (
                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/40 rounded-lg text-emerald-300 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Resolution dispatched and ticket marked as resolved.</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="text-xs text-slate-400">
                    Status: <span className="font-semibold text-white uppercase">{selectedTicket.status}</span>
                  </div>

                  {selectedTicket.status !== 'resolved' ? (
                    <button
                      onClick={handleSendResolution}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Send Resolution</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1 bg-emerald-950/40 text-emerald-400 text-xs font-medium rounded-lg border border-emerald-800/40 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Resolved
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-2">
                <Headphones className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-medium text-slate-300">Select a ticket to view details</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* RAG Knowledge Base Tab */}
      {activeTab === 'rag_kb' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-rose-400" />
                Knowledge Base & FAQ Vector Index
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Semantic search index used for auto-reply generation</p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search FAQs & KB vectors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
              />
            </div>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="text-center py-10 border border-slate-800 rounded-xl bg-slate-950/50">
              <BookOpen className="w-7 h-7 text-slate-600 mx-auto mb-1.5" />
              <p className="text-xs font-medium text-slate-300">No knowledge base items match "{searchQuery}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFaqs.map((faq) => (
                <div key={faq.id} className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-2 text-xs transition">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-rose-300 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">{faq.category}</span>
                    <span className="text-[10px] font-mono text-slate-500">ID: {faq.id}</span>
                  </div>
                  <h4 className="font-semibold text-white text-sm">{faq.question}</h4>
                  <p className="text-slate-300 leading-relaxed bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
