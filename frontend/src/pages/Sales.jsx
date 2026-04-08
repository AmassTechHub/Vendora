import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { ReceiptText, X, Filter } from 'lucide-react';

const PAY_COLORS = {
  CASH:         'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  MOBILE_MONEY: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CARD:         'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};
const STATUS_COLORS = {
  SUCCESS:      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  NOT_REQUIRED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  PENDING:      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  FAILED:       'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function Sales() {
  const [sales, setSales]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom]       = useState('');
  const [to, setTo]           = useState('');
  const [selected, setSelected] = useState(null);

  const load = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await api.get('/sales', { params });
      setSales(data);
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to load sales'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const totalRevenue = useMemo(() => sales.reduce((s, x) => s + parseFloat(x.totalAmount || 0), 0), [sales]);

  const applyFilter = () => {
    if (!from || !to) { toast.error('Select both dates'); return; }
    load({ from, to });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Sales History</h2>
          <p className="text-sm text-gray-500">All transactions and payment records</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Showing revenue</p>
          <p className="text-xl font-black text-emerald-600">GH₵{totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3 flex flex-wrap gap-2 items-center shadow-sm">
        <Filter size={14} className="text-gray-400 shrink-0" />
        <input type="date"
          className="border dark:border-gray-600 rounded-xl px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          value={from} onChange={e => setFrom(e.target.value)} />
        <span className="text-gray-400 text-sm">to</span>
        <input type="date"
          className="border dark:border-gray-600 rounded-xl px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          value={to} onChange={e => setTo(e.target.value)} />
        <button onClick={applyFilter} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">Apply</button>
        <button onClick={() => { setFrom(''); setTo(''); load(); }}
          className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-white px-4 py-2 rounded-xl text-sm font-semibold transition">Reset</button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase text-xs">
              <tr>
                {['ID', 'Cashier', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400">Loading...</td></tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <ReceiptText size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-gray-400">No sales found</p>
                  </td>
                </tr>
              ) : sales.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                  <td className="px-4 py-3 font-mono text-gray-500 dark:text-gray-400 text-xs">#{s.id}</td>
                  <td className="px-4 py-3 font-medium dark:text-white">{s.cashier?.fullName}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.customer?.name || <span className="text-gray-400 italic">Walk-in</span>}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.items?.length || 0}</td>
                  <td className="px-4 py-3 font-black text-emerald-600">GH₵{parseFloat(s.totalAmount).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${PAY_COLORS[s.paymentMethod] || 'bg-gray-100 text-gray-600'}`}>
                      {s.paymentMethod === 'MOBILE_MONEY' ? 'Mobile' : s.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${STATUS_COLORS[s.paymentStatus] || 'bg-gray-100 text-gray-500'}`}>
                      {s.paymentStatus || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">{new Date(s.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(s)}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-semibold">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-auto shadow-2xl border dark:border-gray-700">
            <div className="flex items-center justify-between p-5 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <div>
                <h3 className="font-black text-gray-900 dark:text-white">Receipt #{selected.id}</h3>
                <p className="text-xs text-gray-500">{new Date(selected.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-gray-400">Cashier</p><p className="font-semibold dark:text-white">{selected.cashier?.fullName}</p></div>
                <div><p className="text-xs text-gray-400">Customer</p><p className="font-semibold dark:text-white">{selected.customer?.name || 'Walk-in'}</p></div>
                <div><p className="text-xs text-gray-400">Payment</p>
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${PAY_COLORS[selected.paymentMethod] || ''}`}>{selected.paymentMethod}</span>
                </div>
                <div><p className="text-xs text-gray-400">Status</p>
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${STATUS_COLORS[selected.paymentStatus] || ''}`}>{selected.paymentStatus || 'N/A'}</span>
                </div>
              </div>
              <div className="border dark:border-gray-700 rounded-xl overflow-hidden">
                {(selected.items || []).map(item => (
                  <div key={item.id} className="flex justify-between items-center px-4 py-3 border-b dark:border-gray-700 last:border-0">
                    <div>
                      <p className="font-medium text-sm dark:text-white">{item.product?.name}</p>
                      <p className="text-xs text-gray-400">{item.quantity} × GH₵{parseFloat(item.unitPrice).toFixed(2)}</p>
                    </div>
                    <p className="font-bold text-sm dark:text-white">GH₵{parseFloat(item.subtotal).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5 text-sm border-t dark:border-gray-700 pt-3">
                <div className="flex justify-between text-gray-500 dark:text-gray-400"><span>Subtotal</span><span>GH₵{parseFloat(selected.subtotal).toFixed(2)}</span></div>
                {parseFloat(selected.discount || 0) > 0 && (
                  <div className="flex justify-between text-gray-500 dark:text-gray-400"><span>Discount</span><span>−GH₵{parseFloat(selected.discount).toFixed(2)}</span></div>
                )}
                <div className="flex justify-between font-black text-base dark:text-white"><span>Total</span><span>GH₵{parseFloat(selected.totalAmount).toFixed(2)}</span></div>
                {selected.paymentReference && (
                  <div className="flex justify-between text-xs text-gray-400"><span>Ref</span><span className="font-mono">{selected.paymentReference}</span></div>
                )}
              </div>
              <button onClick={() => window.print()}
                className="w-full bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 text-white py-2.5 rounded-xl text-sm font-semibold transition">
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
