import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Search, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

const REASONS = ['Defective product', 'Wrong item', 'Customer changed mind', 'Overcharged', 'Other'];

export default function Refunds() {
  const [saleId, setSaleId] = useState('');
  const [sale, setSale] = useState(null);
  const [searching, setSearching] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const [reason, setReason] = useState(REASONS[0]);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [refunds, setRefunds] = useState([]);
  const [loadingRefunds, setLoadingRefunds] = useState(true);

  const loadRefunds = async () => {
    setLoadingRefunds(true);
    try {
      const { data } = await api.get('/refunds');
      setRefunds(data);
    } catch { /* silent */ }
    finally { setLoadingRefunds(false); }
  };

  useEffect(() => { loadRefunds(); }, []);

  const searchSale = async () => {
    if (!saleId.trim()) return;
    setSearching(true);
    try {
      const { data } = await api.get(`/sales/${saleId}`);
      setSale(data);
      setSelectedItems({});
    } catch { toast.error('Sale not found'); setSale(null); }
    finally { setSearching(false); }
  };

  const toggleItem = (itemId, maxQty) => {
    setSelectedItems(prev => {
      if (prev[itemId]) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: maxQty };
    });
  };

  const setItemQty = (itemId, qty, maxQty) => {
    const v = Math.min(Math.max(1, parseInt(qty) || 1), maxQty);
    setSelectedItems(prev => ({ ...prev, [itemId]: v }));
  };

  const refundTotal = sale
    ? Object.entries(selectedItems).reduce((sum, [itemId, qty]) => {
        const item = sale.items?.find(i => i.id === parseInt(itemId));
        return sum + (item ? parseFloat(item.unitPrice) * qty : 0);
      }, 0)
    : 0;

  const handleRefund = async () => {
    if (Object.keys(selectedItems).length === 0) {
      toast.error('Select at least one item to refund');
      return;
    }
    setProcessing(true);
    try {
      await api.post('/refunds', {
        saleId: sale.id,
        items: Object.entries(selectedItems).map(([itemId, qty]) => ({
          saleItemId: parseInt(itemId),
          quantity: qty
        })),
        reason,
        notes
      });
      toast.success('Refund processed successfully');
      setSale(null); setSaleId(''); setSelectedItems({}); setNotes('');
      loadRefunds();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to process refund');
    } finally { setProcessing(false); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Returns & Refunds</h2>
        <p className="text-sm text-gray-500">Process customer returns and issue refunds</p>
      </div>

      {/* Search sale */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-5">
        <h3 className="font-semibold text-gray-700 dark:text-white mb-3">Find Sale to Refund</h3>
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter Sale ID (e.g. 42)"
            value={saleId}
            onChange={e => setSaleId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchSale()}
          />
          <button onClick={searchSale} disabled={searching}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60">
            <Search size={15} /> {searching ? 'Searching...' : 'Find'}
          </button>
        </div>
      </div>

      {/* Sale details + item selection */}
      {sale && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white">Sale #{sale.id}</h3>
              <p className="text-sm text-gray-500">{new Date(sale.createdAt).toLocaleString()} · {sale.cashier?.fullName}</p>
              {sale.customer && <p className="text-sm text-gray-500">Customer: {sale.customer.name}</p>}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Original Total</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">GH₵{parseFloat(sale.totalAmount).toFixed(2)}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Select items to return:</p>
            <div className="space-y-2">
              {(sale.items || []).map(item => {
                const selected = selectedItems[item.id] !== undefined;
                return (
                  <div key={item.id}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => toggleItem(item.id, item.quantity)}>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                        {selected && <CheckCircle size={12} className="text-white" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm dark:text-white">{item.product?.name}</p>
                        <p className="text-xs text-gray-500">GH₵{parseFloat(item.unitPrice).toFixed(2)} × {item.quantity}</p>
                      </div>
                    </div>
                    {selected && (
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <span className="text-xs text-gray-500">Qty:</span>
                        <input type="number" min={1} max={item.quantity}
                          className="w-16 border rounded px-2 py-1 text-sm text-center dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          value={selectedItems[item.id]}
                          onChange={e => setItemQty(item.id, e.target.value, item.quantity)} />
                        <span className="text-xs font-semibold text-blue-600">
                          GH₵{(parseFloat(item.unitPrice) * selectedItems[item.id]).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Reason *</label>
              <select className="w-full border rounded-lg px-3 py-2 mt-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={reason} onChange={e => setReason(e.target.value)}>
                {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Notes</label>
              <input className="w-full border rounded-lg px-3 py-2 mt-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Optional notes..."
                value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>

          {Object.keys(selectedItems).length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">Refund Amount</p>
                <p className="text-2xl font-black text-orange-700 dark:text-orange-400">GH₵{refundTotal.toFixed(2)}</p>
              </div>
              <button onClick={handleRefund} disabled={processing}
                className="bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-orange-700 flex items-center gap-2 disabled:opacity-60">
                <RotateCcw size={16} /> {processing ? 'Processing...' : 'Process Refund'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Refund history */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b dark:border-gray-700">
          <h3 className="font-semibold text-gray-700 dark:text-white">Refund History</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 uppercase text-xs">
            <tr>
              {['ID', 'Sale #', 'Amount', 'Reason', 'Processed By', 'Date'].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {loadingRefunds ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Loading...</td></tr>
            ) : refunds.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No refunds processed yet</td></tr>
            ) : refunds.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3 text-gray-500 font-mono">#{r.id}</td>
                <td className="px-4 py-3 dark:text-white">#{r.saleId}</td>
                <td className="px-4 py-3 font-bold text-orange-600">GH₵{parseFloat(r.refundAmount).toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.reason}</td>
                <td className="px-4 py-3 dark:text-white">{r.processedBy?.fullName}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
