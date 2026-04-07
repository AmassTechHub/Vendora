import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Badge from '../components/Badge';

const paymentColor = { CASH: 'green', MOBILE_MONEY: 'blue', CARD: 'purple' };

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selected, setSelected] = useState(null);

  const load = async (params = {}) => {
    try {
      setLoading(true);
      const { data } = await api.get('/sales', { params });
      setSales(data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalRevenue = useMemo(
    () => sales.reduce((sum, s) => sum + parseFloat(s.totalAmount || 0), 0),
    [sales]
  );

  const applyFilter = () => {
    if (!from || !to) {
      toast.error('Select both from and to dates');
      return;
    }
    load({ from, to });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sales History</h2>
          <p className="text-sm text-gray-500">Track transactions and payment status</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total shown revenue</p>
          <p className="text-xl font-bold text-green-700">GH₵{totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-3 flex flex-col md:flex-row gap-2 md:items-center">
        <input type="date" className="border rounded-lg px-3 py-2 text-sm" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" className="border rounded-lg px-3 py-2 text-sm" value={to} onChange={(e) => setTo(e.target.value)} />
        <button onClick={applyFilter} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">Apply</button>
        <button onClick={() => { setFrom(''); setTo(''); load(); }} className="bg-gray-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300">Reset</button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              {['ID', 'Cashier', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Receipt'].map((h) => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {!loading && sales.length === 0 && (
              <tr><td className="px-4 py-6 text-gray-500" colSpan={9}>No sales found.</td></tr>
            )}
            {sales.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 font-mono text-gray-500">#{s.id}</td>
                <td className="px-4 py-3">{s.cashier?.fullName}</td>
                <td className="px-4 py-3">{s.customer?.name || 'Walk-in'}</td>
                <td className="px-4 py-3">{s.items?.length || 0}</td>
                <td className="px-4 py-3 font-semibold">GH₵{parseFloat(s.totalAmount).toFixed(2)}</td>
                <td className="px-4 py-3"><Badge label={s.paymentMethod || 'UNKNOWN'} color={paymentColor[s.paymentMethod] || 'gray'} /></td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    s.paymentStatus === 'SUCCESS' || s.paymentStatus === 'NOT_REQUIRED'
                      ? 'bg-green-100 text-green-700'
                      : s.paymentStatus === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                  }`}>
                    {s.paymentStatus || 'N/A'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(s.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setSelected(s)} className="text-blue-600 hover:text-blue-800">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-xl max-h-[80vh] overflow-auto p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold">Receipt #{selected.id}</h3>
                <p className="text-xs text-gray-500">{new Date(selected.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-700">Close</button>
            </div>

            <div className="space-y-2 text-sm">
              {(selected.items || []).map((item) => (
                <div key={item.id} className="flex justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{item.product?.name}</p>
                    <p className="text-xs text-gray-500">{item.quantity} x GH₵{parseFloat(item.unitPrice).toFixed(2)}</p>
                  </div>
                  <p className="font-semibold">GH₵{parseFloat(item.subtotal).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 text-sm space-y-1 border-t pt-3">
              <div className="flex justify-between"><span>Subtotal</span><span>GH₵{parseFloat(selected.subtotal).toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Discount</span><span>GH₵{parseFloat(selected.discount || 0).toFixed(2)}</span></div>
              <div className="flex justify-between font-bold"><span>Total</span><span>GH₵{parseFloat(selected.totalAmount).toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Payment</span><span>{selected.paymentMethod}</span></div>
              <div className="flex justify-between"><span>Payment Status</span><span>{selected.paymentStatus || 'N/A'}</span></div>
              {selected.paymentReference && (
                <div className="flex justify-between"><span>Reference</span><span className="font-mono text-xs">{selected.paymentReference}</span></div>
              )}
            </div>
            <button onClick={() => window.print()} className="mt-4 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800">Print</button>
          </div>
        </div>
      )}
    </div>
  );
}
