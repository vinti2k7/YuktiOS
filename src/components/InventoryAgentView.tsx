import React, { useState } from 'react';
import { Product, StockLedgerEntry, Supplier } from '../types';
import { 
  AlertTriangle, 
  RefreshCw, 
  Truck, 
  TrendingUp, 
  Search, 
  Download, 
  Phone, 
  Copy, 
  Check, 
  Package, 
  Layers 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface InventoryAgentViewProps {
  products: Product[];
  stockLedger: StockLedgerEntry[];
  suppliers: Supplier[];
  onReorderStock: (productId: string) => void;
}

export const InventoryAgentView: React.FC<InventoryAgentViewProps> = ({
  products,
  stockLedger,
  suppliers,
  onReorderStock,
}) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'demand' | 'ledger' | 'suppliers'>('stock');
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'normal'>('all');
  
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState('all');
  
  const [supplierSearch, setSupplierSearch] = useState('');
  const [copiedSupplierId, setCopiedSupplierId] = useState<string | null>(null);

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const highRiskItems = products.filter((p) => p.stockoutRiskScore >= 70);

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
      p.sku.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesRisk = 
      riskFilter === 'all' 
        ? true 
        : riskFilter === 'high' 
        ? p.stockoutRiskScore >= 70 
        : p.stockoutRiskScore < 70;
    return matchesSearch && matchesCategory && matchesRisk;
  });

  // Filtered Ledger
  const filteredLedger = stockLedger.filter((led) => {
    const matchesSearch = 
      led.productName.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      led.performedBy.toLowerCase().includes(ledgerSearch.toLowerCase());
    const matchesType = ledgerTypeFilter === 'all' || led.changeType.toLowerCase() === ledgerTypeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  // Filtered Suppliers
  const filteredSuppliers = suppliers.filter((s) => {
    return (
      s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(supplierSearch.toLowerCase()) ||
      s.phone.includes(supplierSearch)
    );
  });

  // CSV Exports
  const handleExportProductsCSV = () => {
    const headers = ['SKU', 'Product Name', 'Category', 'Stock Quantity', 'Reorder Point', 'Optimal Order Qty', 'Unit Cost (INR)', 'Risk Score (%)', '30d Forecast Demand'];
    const rows = products.map((p) => [
      `"${p.sku}"`,
      `"${p.name}"`,
      `"${p.category}"`,
      p.stockQuantity,
      p.reorderPoint,
      p.optimalOrderQty,
      p.costPrice,
      p.stockoutRiskScore,
      p.forecastDemand30d,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `YuktiOS_Inventory_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportLedgerCSV = () => {
    const headers = ['ID', 'Timestamp', 'Product Name', 'Change Type', 'Quantity Change', 'Performed By'];
    const rows = stockLedger.map((l) => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.productName}"`,
      `"${l.changeType}"`,
      l.quantity,
      `"${l.performedBy}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `YuktiOS_Stock_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPhone = (supplierId: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedSupplierId(supplierId);
    setTimeout(() => setCopiedSupplierId(null), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-amber-400 bg-amber-950/40 border border-amber-800/50 px-2 py-0.5 rounded">
              Inventory Agent
            </span>
            <span className="text-xs text-slate-400">Demand Forecasting & Reorder Automation</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1.5">Stock Management & Ledger</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time stock ledger, stockout risk calculations, and optimal purchase order recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {highRiskItems.length > 0 && (
            <div className="bg-amber-950/30 border border-amber-800/40 px-3 py-2 rounded-lg flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-200">{highRiskItems.length} SKUs Low Stock</p>
                <p className="text-[10px] text-amber-400/80">Action recommended</p>
              </div>
            </div>
          )}

          <button
            onClick={handleExportProductsCSV}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            title="Download Inventory Stock Roster as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="border-b border-slate-800 flex space-x-1 text-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-3.5 py-2 font-medium transition border-b-2 whitespace-nowrap ${
            activeTab === 'stock'
              ? 'border-amber-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Stock Items ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('demand')}
          className={`px-3.5 py-2 font-medium transition border-b-2 whitespace-nowrap ${
            activeTab === 'demand'
              ? 'border-amber-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          30-Day Demand Forecast
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-3.5 py-2 font-medium transition border-b-2 whitespace-nowrap ${
            activeTab === 'ledger'
              ? 'border-amber-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Audit Ledger ({stockLedger.length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-3.5 py-2 font-medium transition border-b-2 whitespace-nowrap ${
            activeTab === 'suppliers'
              ? 'border-amber-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Suppliers ({suppliers.length})
        </button>
      </div>

      {/* Stock Tab */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Product Inventory</h3>
              <p className="text-xs text-slate-400">Risk score computed from current balance, reorder point, and run rate</p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search product or SKU..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-slate-600"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-slate-600"
              >
                <option value="all">All Risk Levels</option>
                <option value="high">High Risk (≥ 70%)</option>
                <option value="normal">Normal Risk (&lt; 70%)</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 border border-slate-800 rounded-xl bg-slate-900">
              <Package className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300">No products match your filter criteria</p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting the search query or reset category and risk filters.</p>
              <button
                onClick={() => {
                  setProductSearch('');
                  setCategoryFilter('all');
                  setRiskFilter('all');
                }}
                className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map((p) => {
                const isHighRisk = p.stockoutRiskScore >= 70;
                return (
                  <div
                    key={p.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between space-y-3 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {p.sku}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                            isHighRisk
                              ? 'bg-amber-950/50 text-amber-300 border border-amber-800/60'
                              : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                          }`}
                        >
                          Risk: {p.stockoutRiskScore}%
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-white mt-2.5">{p.name}</h4>
                      <p className="text-xs text-slate-400">{p.category}</p>

                      {/* Stock meter */}
                      <div className="mt-3 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Stock Balance:</span>
                          <span className="font-mono font-medium text-white">
                            {p.stockQuantity} / {p.reorderPoint * 2} units
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isHighRisk ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, (p.stockQuantity / (p.reorderPoint * 2)) * 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-800/80 text-xs">
                        <div>
                          <span className="text-slate-500">Reorder Point:</span>{' '}
                          <span className="font-mono text-slate-300">{p.reorderPoint}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Optimal Order:</span>{' '}
                          <span className="font-mono text-indigo-400 font-semibold">{p.optimalOrderQty} units</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Cost: <strong className="text-slate-200">₹{p.costPrice.toLocaleString('en-IN')}</strong></span>
                      <button
                        onClick={() => onReorderStock(p.id)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reorder {p.optimalOrderQty} Units</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Demand Forecast Chart Tab */}
      {activeTab === 'demand' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                30-Day Demand Velocity & Forecast
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Predicted sales units required to prevent stockout across active SKUs
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={products}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="stockQuantity" name="Current Stock" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="forecastDemand30d" name="30d Forecast Demand" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Ledger Audit Tab */}
      {activeTab === 'ledger' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Stock Ledger Audit</h3>
              <p className="text-xs text-slate-400">Append-only log of all inventory receipts and deductions</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search ledger..."
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
                />
              </div>

              <select
                value={ledgerTypeFilter}
                onChange={(e) => setLedgerTypeFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-slate-600"
              >
                <option value="all">All Types</option>
                <option value="sale">Sale</option>
                <option value="restock">Restock</option>
                <option value="adjustment">Adjustment</option>
              </select>

              <button
                onClick={handleExportLedgerCSV}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Export Ledger</span>
              </button>
            </div>
          </div>

          {filteredLedger.length === 0 ? (
            <div className="text-center py-10 border border-slate-800 rounded-xl bg-slate-950/50">
              <Layers className="w-7 h-7 text-slate-600 mx-auto mb-1.5" />
              <p className="text-xs font-medium text-slate-300">No ledger entries match this query</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-right">Qty Change</th>
                    <th className="py-2.5 px-3">Performed By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLedger.map((led) => (
                    <tr key={led.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{led.timestamp}</td>
                      <td className="py-2.5 px-3 font-medium text-white">{led.productName}</td>
                      <td className="py-2.5 px-3">
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                          {led.changeType.toUpperCase()}
                        </span>
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono font-medium ${
                          led.quantity < 0 ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {led.quantity > 0 ? `+${led.quantity}` : led.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{led.performedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Supplier Network</h3>
              <p className="text-xs text-slate-400">Verified vendors with agreed rate contracts and lead times</p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search suppliers..."
                value={supplierSearch}
                onChange={(e) => setSupplierSearch(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
              />
            </div>
          </div>

          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-10 border border-slate-800 rounded-xl bg-slate-950/50">
              <Truck className="w-7 h-7 text-slate-600 mx-auto mb-1.5" />
              <p className="text-xs font-medium text-slate-300">No suppliers found matching "{supplierSearch}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredSuppliers.map((sup) => (
                <div key={sup.id} className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-2.5 transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white">{sup.name}</h4>
                      <span className="text-amber-300 text-xs font-mono bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                        ★ {sup.rating}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Contact: {sup.contactPerson}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{sup.phone}</p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Lead Time:</span>
                      <span className="font-mono text-indigo-400 font-medium">{sup.leadTimeDays} Days</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyPhone(sup.id, sup.phone)}
                        className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition"
                      >
                        {copiedSupplierId === sup.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Copy Phone</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`tel:${sup.phone}`}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs flex items-center justify-center transition"
                        title={`Call ${sup.name}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
