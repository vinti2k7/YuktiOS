import React, { useState } from 'react';
import { Invoice, Expense, CashFlowDataPoint } from '../types';
import { 
  IndianRupee, 
  FileText, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  TrendingUp, 
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Search,
  Filter,
  X
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface FinanceAgentViewProps {
  invoices: Invoice[];
  expenses: Expense[];
  cashFlowForecast: CashFlowDataPoint[];
  onAddInvoice: (invoice: Partial<Invoice>) => void;
  onAddExpense: (expense: Partial<Expense>) => void;
}

export const FinanceAgentView: React.FC<FinanceAgentViewProps> = ({
  invoices,
  expenses,
  cashFlowForecast,
  onAddInvoice,
  onAddExpense,
}) => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'expenses' | 'cashflow' | 'gst'>('invoices');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Search and Filter States
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('all');
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>('all');

  // New Invoice Form state
  const [customerName, setCustomerName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemPrice, setItemPrice] = useState(10000);

  // New Expense Form state
  const [expVendor, setExpVendor] = useState('');
  const [expAmount, setExpAmount] = useState(5000);
  const [expCategory, setExpCategory] = useState<Expense['category']>('Raw Materials');

  const totalInvoiced = invoices.reduce((acc, i) => acc + i.total, 0);
  const paidInvoiced = invoices.filter((i) => i.status === 'paid').reduce((acc, i) => acc + i.total, 0);
  const pendingInvoiced = invoices.filter((i) => i.status !== 'paid').reduce((acc, i) => acc + i.total, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const outputGstCollected = invoices.reduce((acc, i) => acc + i.gstAmount, 0);

  // Filtered Invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(invoiceSearch.toLowerCase());
    const matchesStatus =
      invoiceStatusFilter === 'all' || inv.status.toLowerCase() === invoiceStatusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Filtered Expenses
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.vendor.toLowerCase().includes(expenseSearch.toLowerCase()) ||
      exp.category.toLowerCase().includes(expenseSearch.toLowerCase());
    const matchesCategory =
      expenseCategoryFilter === 'all' || exp.category.toLowerCase() === expenseCategoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // CSV Export Handlers
  const handleExportInvoicesCSV = () => {
    const headers = ['Invoice Number', 'Customer Name', 'Date', 'Due Date', 'Subtotal', 'GST Amount', 'Total', 'Status'];
    const rows = filteredInvoices.map((i) => [
      i.invoiceNumber,
      `"${i.customerName}"`,
      i.date,
      i.dueDate,
      i.subtotal,
      i.gstAmount,
      i.total,
      i.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `YuktiOS_Invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExpensesCSV = () => {
    const headers = ['Date', 'Vendor', 'Category', 'Amount', 'Status'];
    const rows = filteredExpenses.map((e) => [
      e.date,
      `"${e.vendor}"`,
      `"${e.category}"`,
      e.amount,
      e.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `YuktiOS_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !itemDesc) return;

    const subtotal = itemQty * itemPrice;
    const gstAmount = Math.round(subtotal * 0.18);
    const total = subtotal + gstAmount;

    onAddInvoice({
      invoiceNumber: `INV-2026-${String(invoices.length + 95).padStart(3, '0')}`,
      customerName,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      items: [{ description: itemDesc, quantity: itemQty, unitPrice: itemPrice, amount: subtotal }],
      subtotal,
      gstAmount,
      total,
      status: 'pending',
      autoGenerated: true,
    });

    setCustomerName('');
    setItemDesc('');
    setShowInvoiceModal(false);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expVendor) return;

    onAddExpense({
      category: expCategory,
      amount: Number(expAmount),
      vendor: expVendor,
      date: new Date().toISOString().split('T')[0],
      status: 'approved',
    });

    setExpVendor('');
    setShowExpenseModal(false);
  };

  return (
    <div className="space-y-5 pb-12">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Finance
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">GSTIN: 36AAACA1234B1ZP</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Financial Operations & Cash Flow</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            GST-compliant invoicing, expense recording, and real-time cash surplus forecasting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExpenseModal(true)}
            id="btn-log-expense"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Expense</span>
          </button>

          <button
            onClick={() => setShowInvoiceModal(true)}
            id="btn-create-invoice"
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-xs text-slate-400 font-medium">Total Invoiced</span>
          <p className="text-lg font-bold text-white mt-1 font-mono">₹{totalInvoiced.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-emerald-400 mt-0.5">Collected: ₹{paidInvoiced.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-xs text-slate-400 font-medium">Pending Receivables</span>
          <p className="text-lg font-bold text-amber-400 mt-1 font-mono">₹{pendingInvoiced.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{invoices.filter(i => i.status !== 'paid').length} invoices pending</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-xs text-slate-400 font-medium">Recorded Expenses</span>
          <p className="text-lg font-bold text-slate-200 mt-1 font-mono">₹{totalExpenses.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{expenses.length} vouchers</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-xs text-slate-400 font-medium">Output GST (18%)</span>
          <p className="text-lg font-bold text-indigo-400 mt-1 font-mono">₹{outputGstCollected.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Tax liability</p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="border-b border-slate-800 flex space-x-1 text-xs">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-3 py-1.5 font-medium rounded-t-lg transition-colors ${
            activeTab === 'invoices'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Invoices ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-3 py-1.5 font-medium rounded-t-lg transition-colors ${
            activeTab === 'expenses'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Expenses ({expenses.length})
        </button>
        <button
          onClick={() => setActiveTab('cashflow')}
          className={`px-3 py-1.5 font-medium rounded-t-lg transition-colors ${
            activeTab === 'cashflow'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Cash Flow Forecast
        </button>
        <button
          onClick={() => setActiveTab('gst')}
          className={`px-3 py-1.5 font-medium rounded-t-lg transition-colors ${
            activeTab === 'gst'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          GST Reconciliation
        </button>
      </div>

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">GST Invoices Ledger</h3>
              <span className="text-xs text-slate-400">Auto-generated with 18% GST rules</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search invoice or customer..."
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={invoiceStatusFilter}
                onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>

              {/* Export CSV Button */}
              <button
                onClick={handleExportInvoicesCSV}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
                title="Export Filtered Invoices to CSV"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Invoice #</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Date / Due</th>
                  <th className="py-3 px-3 text-right">Subtotal</th>
                  <th className="py-3 px-3 text-right">18% GST</th>
                  <th className="py-3 px-3 text-right">Total</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No invoices found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-mono font-bold text-slate-200">{inv.invoiceNumber}</td>
                      <td className="py-3 px-3 font-medium text-white">{inv.customerName}</td>
                      <td className="py-3 px-3 text-slate-400">{inv.date} (Due: {inv.dueDate})</td>
                      <td className="py-3 px-3 text-right font-mono">₹{inv.subtotal.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-right font-mono text-indigo-400">₹{inv.gstAmount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">₹{inv.total.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            inv.status === 'paid'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : inv.status === 'overdue'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {inv.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Expense Capture & Categorization</h3>
              <span className="text-xs text-slate-400">Categorized by Finance Agent</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search vendor or category..."
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <select
                value={expenseCategoryFilter}
                onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="raw materials">Raw Materials</option>
                <option value="salaries">Salaries</option>
                <option value="utilities">Utilities</option>
                <option value="marketing">Marketing</option>
                <option value="logistics">Logistics</option>
                <option value="software">Software</option>
                <option value="rent">Rent</option>
              </select>

              <button
                onClick={handleExportExpensesCSV}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
                title="Export Filtered Expenses to CSV"
              >
                <Download className="w-3.5 h-3.5 text-rose-400" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Vendor / Recipient</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No expenses found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 text-slate-400 font-mono">{exp.date}</td>
                      <td className="py-3 px-3 font-medium text-white">{exp.vendor}</td>
                      <td className="py-3 px-3">
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] border border-slate-700">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-rose-400">₹{exp.amount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/30">
                          {exp.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cash Flow Forecast Tab */}
      {activeTab === 'cashflow' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Cash Flow Forecasting Model
              </h3>
              <p className="text-xs text-slate-400">
                Time-series predictive model (Inflow vs Outflow vs Projected Net Cash)
              </p>
            </div>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-full font-mono">
              Aug - Oct Projected
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowForecast}>
                <defs>
                  <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(val: any) => [`₹${val.toLocaleString('en-IN')}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="inflow" name="Cash Inflow (₹)" stroke="#10b981" fillOpacity={1} fill="url(#colorInflow)" />
                <Area type="monotone" dataKey="outflow" name="Cash Outflow (₹)" stroke="#f43f5e" fillOpacity={1} fill="url(#colorOutflow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Statutory GST & P&L Tab */}
      {activeTab === 'gst' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              GST Compliance Summary (GSTR-1 & GSTR-3B)
            </h3>
            <div className="bg-slate-950 p-4 rounded-xl space-y-2 text-xs border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">GSTIN Registered Tenant:</span>
                <span className="font-mono text-white">36AAACA1234B1ZP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Output GST Collected (18%):</span>
                <span className="font-mono text-emerald-400 font-bold">₹{outputGstCollected.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Input Tax Credit (Est. 18% on Raw Mat):</span>
                <span className="font-mono text-indigo-400">₹{(outputGstCollected * 0.4).toFixed(0)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-white">
                <span>Net Tax Liability Payable:</span>
                <span className="font-mono text-amber-400">₹{(outputGstCollected * 0.6).toFixed(0)}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Simplified P&L Statement (July 2026)
            </h3>
            <div className="bg-slate-950 p-4 rounded-xl space-y-2 text-xs border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Gross Sales Revenue:</span>
                <span className="font-mono text-emerald-400 font-bold">₹{totalInvoiced.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>Less: Total Operating Expenses:</span>
                <span className="font-mono">- ₹{totalExpenses.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-base text-white">
                <span>Net Operating Margin:</span>
                <span className="font-mono text-emerald-400">
                  ₹{(totalInvoiced - totalExpenses).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create Auto GST Invoice</h3>
              <button onClick={() => setShowInvoiceModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Customer Name:</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Acme Tech Solutions"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Item Description:</label>
                <input
                  type="text"
                  required
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  placeholder="e.g. Servo Motor Assembly"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    value={itemQty}
                    onChange={(e) => setItemQty(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Unit Price (₹):</label>
                  <input
                    type="number"
                    min="100"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>₹{(itemQty * itemPrice).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-indigo-400">
                  <span>18% GST:</span>
                  <span>₹{Math.round(itemQty * itemPrice * 0.18).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-400 pt-1 border-t border-slate-800">
                  <span>Total Due:</span>
                  <span>₹{Math.round(itemQty * itemPrice * 1.18).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Log Expense Entry</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Vendor / Recipient:</label>
                <input
                  type="text"
                  required
                  value={expVendor}
                  onChange={(e) => setExpVendor(e.target.value)}
                  placeholder="e.g. State Power Distribution Corp"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Expense Category:</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="Raw Materials">Raw Materials</option>
                  <option value="Salaries">Salaries</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Software">Software</option>
                  <option value="Rent">Rent</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Amount (₹):</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={expAmount}
                  onChange={(e) => setExpAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                >
                  Save Expense Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
