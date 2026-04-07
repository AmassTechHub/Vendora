import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Clock, PlayCircle, StopCircle, DollarSign, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Shifts() {
  const { user } = useAuth();
  const [activeShift, setActiveShift] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [openingCash, setOpeningCash] = useState('');
  const [closingCash, setClosingCash] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [shiftStats, setShiftStats] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [activeRes, historyRes] = await Promise.all([
        api.get('/shifts/active').catch(() => ({ data: null })),
        api.get('/shifts')
      ]);
      setActiveShift(activeRes.data);
      setShifts(historyRes.data || []);
      if (activeRes.data) {
        const statsRes = await api.get(`/shifts/${activeRes.data.id}/stats`).catch(() => ({ data: null }));
        setShiftStats(statsRes.data);
      }
    } catch { toast.error('Failed to load shifts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const startShift = async () => {
    if (!openingCash) { toast.error('Enter opening cash amount'); return; }
    try {
      await api.post('/shifts/start', { openingCash: parseFloat(openingCash), notes });
      toast.success('Shift started');
      setOpeningCash(''); setNotes(''); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to start shift'); }
  };

  const endShift = async () => {
    if (!closingCash) { toast.error('Enter closing cash amount'); return; }
    if (!confirm('End this shift? This cannot be undone.')) return;
    try {
      await api.post(`/shifts/${activeShift.id}/end`, { closingCash: parseFloat(closingCash), notes });
      toast.success('Shift ended');
      setClosingCash(''); setNotes(''); setActiveShift(null); setShiftStats(null); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to end shift'); }
  };

  const duration = (start, end) => {
    const ms = new Date(end || Date.now()) - new Date(start);
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Shift Management</h2>
        <p className="text-sm text-gray-500">Track cashier shifts and reconcile cash</p>
      </div>

      {/* Active shift */}
      {activeShift ? (
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <h3 className="font-bold text-green-800 dark:text-green-300">Active Shift</h3>
            <span className="text-sm text-green-600 dark:text-green-400">
              Started {new Date(activeShift.startTime).toLocaleTimeString()} · {duration(activeShift.startTime, null)} ago
            </span>
          </div>

          {shiftStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Sales', value: shiftStats.totalSales || 0, icon: ShoppingBag, color: 'text-blue-600' },
                { label: 'Revenue', value: `GH₵${parseFloat(shiftStats.totalRevenue || 0).toFixed(2)}`, icon: DollarSign, color: 'text-green-600' },
                { label: 'Opening Cash', value: `GH₵${parseFloat(activeShift.openingCash || 0).toFixed(2)}`, icon: DollarSign, color: 'text-gray-600' },
                { label: 'Expected Cash', value: `GH₵${(parseFloat(activeShift.openingCash || 0) + parseFloat(shiftStats.cashRevenue || 0)).toFixed(2)}`, icon: DollarSign, color: 'text-purple-600' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className={`text-lg font-bold ${color} dark:text-white`}>{value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Closing Cash (GH₵) *</label>
              <input type="number" step="0.01" min="0"
                className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Count your cash drawer..."
                value={closingCash} onChange={e => setClosingCash(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
              <input className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Any notes for this shift..."
                value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <div className="flex items-end">
              <button onClick={endShift}
                className="bg-red-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-700 flex items-center gap-2 whitespace-nowrap">
                <StopCircle size={16} /> End Shift
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-5">
          <h3 className="font-semibold text-gray-700 dark:text-white mb-3 flex items-center gap-2">
            <PlayCircle size={18} className="text-green-500" /> Start New Shift
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Opening Cash (GH₵) *</label>
              <input type="number" step="0.01" min="0"
                className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Count your opening cash..."
                value={openingCash} onChange={e => setOpeningCash(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Notes</label>
              <input className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Optional notes..."
                value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <div className="flex items-end">
              <button onClick={startShift}
                className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700 flex items-center gap-2 whitespace-nowrap">
                <PlayCircle size={16} /> Start Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shift history */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b dark:border-gray-700">
          <h3 className="font-semibold text-gray-700 dark:text-white flex items-center gap-2">
            <Clock size={16} /> Shift History
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 uppercase text-xs">
            <tr>
              {['Cashier', 'Start', 'End', 'Duration', 'Opening', 'Closing', 'Variance', 'Sales', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={9} className="px-4 py-6 text-center text-gray-400">Loading...</td></tr>
            ) : shifts.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-6 text-center text-gray-400">No shifts recorded yet</td></tr>
            ) : shifts.map(s => {
              const variance = s.endTime
                ? parseFloat(s.closingCash || 0) - parseFloat(s.expectedCash || s.openingCash || 0)
                : null;
              return (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 font-medium dark:text-white">{s.cashier?.fullName}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(s.startTime).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{s.endTime ? new Date(s.endTime).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{s.endTime ? duration(s.startTime, s.endTime) : duration(s.startTime, null)}</td>
                  <td className="px-4 py-3 dark:text-white">GH₵{parseFloat(s.openingCash || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 dark:text-white">{s.closingCash ? `GH₵${parseFloat(s.closingCash).toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-3">
                    {variance !== null && (
                      <span className={`font-semibold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {variance >= 0 ? '+' : ''}GH₵{variance.toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 dark:text-white">{s.totalSales || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.endTime ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {s.endTime ? 'Closed' : 'Active'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
