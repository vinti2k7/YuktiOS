import React, { useState } from 'react';
import { Customer, Product } from '../types';
import { X, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';

interface QuickSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  customers: Customer[];
  onSaleExecuted: () => void;
}

export const QuickSaleModal: React.FC<QuickSaleModalProps> = ({
  isOpen,
  onClose,
  products,
  customers,
  onSaleExecuted,
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]?.id || '');
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(10);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  React.useEffect(() => {
    if (isOpen) {
      if (!selectedCustomer && customers.length > 0) {
        setSelectedCustomer(customers[0].id);
      }
      if (!selectedProduct && products.length > 0) {
        setSelectedProduct(products[0].id);
      }
      setExecutionResult(null);
    }
  }, [isOpen, customers, products]);

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === selectedProduct) || products[0];
  const currentCustomer = customers.find((c) => c.id === selectedCustomer) || customers[0];

  const subtotal = (currentProduct?.unitPrice || 0) * quantity;
  const gstAmount = Math.round(subtotal * 0.18);
  const total = subtotal + gstAmount;

  const handleExecutePOS = async () => {
    setIsExecuting(true);
    setExecutionResult(null);

    const custId = selectedCustomer || customers[0]?.id;
    const prodId = selectedProduct || products[0]?.id;

    try {
      const res = await fetch('/api/pos/sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: custId,
          productId: prodId,
          quantity,
          unitPrice: currentProduct?.unitPrice,
        }),
      });

      const data = await res.json();
      setExecutionResult(data);
      onSaleExecuted();
    } catch (err) {
      console.error('POS Sale error:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-xl bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-950/40 border border-emerald-800/40 rounded-lg text-emerald-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Record POS Sale Transaction
              </h3>
              <p className="text-xs text-slate-400">
                Executes transaction & cascades updates to Finance, Inventory, and Marketing agents
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          
          {/* Customer & Product Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Select Customer:
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-slate-600"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.rfmSegment})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Select Product:
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-slate-600"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stock: {p.stockQuantity})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity & Pricing Summary */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Order Quantity:</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max={currentProduct?.stockQuantity || 100}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-center text-white focus:outline-none font-mono"
                />
                <span className="text-slate-400 text-xs">units</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Unit Price:</span>
                <span className="font-mono text-slate-200">₹{currentProduct?.unitPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST (18% Standard):</span>
                <span className="font-mono text-slate-200">₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-white pt-1 border-t border-slate-800">
                <span>Total Invoice:</span>
                <span className="font-mono text-emerald-400">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Success Banner */}
          {executionResult && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-xs text-emerald-200 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Multi-Agent Cascade Successfully Triggered</span>
              </div>
              <p className="text-slate-300">
                Invoice {executionResult.invoice?.invoiceNumber} generated. Stock updated to {executionResult.product?.stockQuantity} units.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition"
          >
            {executionResult ? 'Close' : 'Cancel'}
          </button>
          
          <button
            onClick={handleExecutePOS}
            disabled={isExecuting}
            id="btn-confirm-pos-sale"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-semibold transition"
          >
            <span>{isExecuting ? 'Processing...' : 'Execute Sale & Update Agents'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
