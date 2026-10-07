import React, { useState } from 'react';
import { Customer, Campaign } from '../types';
import { 
  Sparkles, 
  Send, 
  ArrowRight, 
  CheckCircle2, 
  MessageSquare,
  Copy,
  Check,
  Search
} from 'lucide-react';

interface MarketingAgentViewProps {
  customers: Customer[];
  campaigns: Campaign[];
  onCreateCampaign: (campaign: Partial<Campaign>) => void;
}

export const MarketingAgentView: React.FC<MarketingAgentViewProps> = ({
  customers,
  campaigns,
  onCreateCampaign,
}) => {
  const [activeTab, setActiveTab] = useState<'rfm' | 'ai_copy' | 'campaigns'>('rfm');
  
  // RFM Tab Filter State
  const [rfmSegmentFilter, setRfmSegmentFilter] = useState<string>('all');
  const [customerSearch, setCustomerSearch] = useState('');

  // AI Campaign Copy Generator State
  const [selectedSegment, setSelectedSegment] = useState('At Risk');
  const [selectedProduct, setSelectedProduct] = useState('Precision CNC Brackets & Motors');
  const [campaignTitle, setCampaignTitle] = useState('Monsoon Restock Retention Offer');
  const [channel, setChannel] = useState<'WhatsApp' | 'Email' | 'SMS'>('WhatsApp');
  const [aiGeneratedCopy, setAiGeneratedCopy] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [campaignSuccessToast, setCampaignSuccessToast] = useState<string | null>(null);

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.company.toLowerCase().includes(customerSearch.toLowerCase());
    const matchesSegment =
      rfmSegmentFilter === 'all' || c.rfmSegment.toLowerCase() === rfmSegmentFilter.toLowerCase();
    return matchesSearch && matchesSegment;
  });

  const handleGenerateAICopy = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/gemini/generate-marketing-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segment: selectedSegment,
          product: selectedProduct,
          goal: `Re-engage ${selectedSegment} customers with a limited time offer`,
        }),
      });
      const data = await res.json();
      setAiGeneratedCopy(data.copy || `Exclusive ${selectedSegment} Offer: Special restock pricing on ${selectedProduct}. Reply YES to claim 10% instant voucher!`);
    } catch (err) {
      console.error('AI Copy error:', err);
      setAiGeneratedCopy(`Special Offer for ${selectedSegment} Clients: Get an exclusive 10% restock discount on ${selectedProduct} valid until end of week. Reply YES to confirm!`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!aiGeneratedCopy) return;
    try {
      await navigator.clipboard.writeText(aiGeneratedCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (e) {
      console.warn('Clipboard write error');
    }
  };

  const handleLaunchCampaign = () => {
    if (!aiGeneratedCopy) return;

    const reach = customers.filter(c => c.rfmSegment === selectedSegment).length * 15 || 35;

    onCreateCampaign({
      title: campaignTitle,
      channel,
      targetSegment: selectedSegment,
      copyText: aiGeneratedCopy,
      status: 'sent',
      estimatedReach: reach,
    });

    setCampaignSuccessToast(`Campaign "${campaignTitle}" dispatched to ${reach} contacts via ${channel}!`);
    setTimeout(() => setCampaignSuccessToast(null), 5000);

    setAiGeneratedCopy('');
    setActiveTab('campaigns');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-cyan-400 bg-cyan-950/40 border border-cyan-800/50 px-2 py-0.5 rounded">
              Marketing Agent
            </span>
            <span className="text-xs text-slate-400">RFM Customer Segmentation & Targeted Campaigns</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1.5">Customer Segmentation & Outreach</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Segment customer accounts by Recency, Frequency, and Monetary value to trigger personalized retention campaigns.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('ai_copy')}
          className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate Campaign Copy</span>
        </button>
      </div>

      {/* Success Toast */}
      {campaignSuccessToast && (
        <div className="p-3 bg-emerald-950/50 border border-emerald-800/50 rounded-lg text-xs text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{campaignSuccessToast}</span>
          </div>
          <button onClick={() => setCampaignSuccessToast(null)} className="text-emerald-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="border-b border-slate-800 flex space-x-1 text-xs">
        <button
          onClick={() => setActiveTab('rfm')}
          className={`px-3.5 py-2 font-medium transition border-b-2 ${
            activeTab === 'rfm'
              ? 'border-cyan-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          RFM Customer Segments ({customers.length})
        </button>
        <button
          onClick={() => setActiveTab('ai_copy')}
          className={`px-3.5 py-2 font-medium transition border-b-2 ${
            activeTab === 'ai_copy'
              ? 'border-cyan-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Campaign Copy Generator
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-3.5 py-2 font-medium transition border-b-2 ${
            activeTab === 'campaigns'
              ? 'border-cyan-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Dispatched Campaigns ({campaigns.length})
        </button>
      </div>

      {/* RFM Segments Tab */}
      {activeTab === 'rfm' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Recency, Frequency & Monetary (RFM) Matrix</h3>
              <p className="text-xs text-slate-400">Recalculated automatically upon every sales invoice</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search customer or company..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
                />
              </div>

              <select
                value={rfmSegmentFilter}
                onChange={(e) => setRfmSegmentFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-slate-600"
              >
                <option value="all">All Segments</option>
                <option value="champions">Champions</option>
                <option value="loyal customers">Loyal Customers</option>
                <option value="at risk">At Risk</option>
                <option value="need attention">Need Attention</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredCustomers.length === 0 ? (
              <div className="col-span-3 text-center py-10 text-slate-500 text-xs">
                No customer accounts found matching your filter criteria.
              </div>
            ) : (
              filteredCustomers.map((c) => {
                const isAtRisk = c.rfmSegment === 'At Risk' || c.churnRiskScore > 50;
                return (
                  <div
                    key={c.id}
                    className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 flex flex-col justify-between transition"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-white">{c.name}</h4>
                          <p className="text-xs text-slate-400">{c.company}</p>
                        </div>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                            c.rfmSegment === 'Champions'
                              ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                              : c.rfmSegment === 'At Risk'
                              ? 'bg-amber-950/40 text-amber-300 border border-amber-800/40'
                              : 'bg-indigo-950/40 text-indigo-300 border border-indigo-800/40'
                          }`}
                        >
                          {c.rfmSegment}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800 mt-3">
                        <div>
                          <span className="text-slate-500 block text-[11px]">Total Spent</span>
                          <span className="font-mono font-medium text-emerald-400">₹{c.totalSpent.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Orders</span>
                          <span className="font-mono font-medium text-slate-200">{c.orderCount}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Last Active</span>
                          <span className="font-mono text-slate-300">{c.lastPurchaseDaysAgo}d ago</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Churn Risk</span>
                          <span className={`font-mono font-medium ${isAtRisk ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {c.churnRiskScore}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {isAtRisk ? (
                      <button
                        onClick={() => {
                          setSelectedSegment('At Risk');
                          setActiveTab('ai_copy');
                        }}
                        className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Target Retention Offer</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedSegment(c.rfmSegment);
                          setActiveTab('ai_copy');
                        }}
                        className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition"
                      >
                        <span>Draft Segment Campaign</span>
                        <ArrowRight className="w-3 h-3 text-cyan-400" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* AI Copy Generator Tab */}
      {activeTab === 'ai_copy' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Campaign Copy Generator
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Generates tailored promotional copy for WhatsApp Business, Email, or SMS
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Campaign Title:</label>
                <input
                  type="text"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-slate-600"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Target RFM Segment:</label>
                <select
                  value={selectedSegment}
                  onChange={(e) => setSelectedSegment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-slate-600"
                >
                  <option value="At Risk">At Risk Customers</option>
                  <option value="Champions">Champions (High Value)</option>
                  <option value="Loyal Customers">Loyal Customers</option>
                  <option value="Need Attention">Need Attention</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Featured Product / Service:</label>
                <input
                  type="text"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-slate-600"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Dispatch Channel:</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-slate-600"
                >
                  <option value="WhatsApp">WhatsApp Business</option>
                  <option value="Email">Email Digest</option>
                  <option value="SMS">SMS Gateway</option>
                </select>
              </div>

              <button
                onClick={handleGenerateAICopy}
                disabled={isGenerating}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGenerating ? 'Drafting copy...' : 'Generate Copy via AI'}</span>
              </button>
            </div>

            {/* Preview Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-cyan-400 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> {channel} Message Preview
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">Target: {selectedSegment}</span>
                    {aiGeneratedCopy && (
                      <button
                        onClick={handleCopyToClipboard}
                        className="text-[11px] text-slate-300 hover:text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1"
                        title="Copy to Clipboard"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                </div>

                <label className="text-[11px] text-slate-400 block">
                  {aiGeneratedCopy ? 'Editable Message Draft:' : 'Draft Preview:'}
                </label>

                <textarea
                  rows={6}
                  value={aiGeneratedCopy}
                  onChange={(e) => setAiGeneratedCopy(e.target.value)}
                  placeholder="Click 'Generate Copy via AI' or write your custom message here..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-200 font-sans leading-relaxed focus:outline-none focus:border-slate-600"
                />
              </div>

              {aiGeneratedCopy && (
                <button
                  onClick={handleLaunchCampaign}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Campaign to {selectedSegment} Customers</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Campaign History Tab */}
      {activeTab === 'campaigns' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Dispatched Marketing Campaigns</h3>
            <span className="text-xs text-slate-400">{campaigns.length} Total Campaigns</span>
          </div>

          <div className="space-y-3">
            {campaigns.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                No marketing campaigns dispatched yet. Use the 'Campaign Copy Generator' tab to create your first campaign.
              </div>
            ) : (
              campaigns.map((camp) => (
                <div key={camp.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white text-sm">{camp.title}</h4>
                    <span className="bg-cyan-950/40 text-cyan-300 border border-cyan-800/40 px-2 py-0.5 rounded text-[10px] font-medium">
                      {camp.channel} • {camp.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800 leading-relaxed font-sans">
                    "{camp.copyText}"
                  </p>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1 font-mono">
                    <span>Target: {camp.targetSegment}</span>
                    <span>Reach: {camp.estimatedReach} Contacts</span>
                    <span>Date: {camp.createdDate}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
