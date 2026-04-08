import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Clock, PlayCircle, StopCircle, DollarSign, ShoppingBag, Activity, RefreshCcw } from 'lucide-react';

function duration(start, end) {
  const ms = new Date(end || Date.now()) - new Date(start);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

const inputClass = "w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

export default function Shifts() {
  const [activeShift, setActiveShift] = useState(null);
  const [shifts, setShifts]           = useState([]);
  const [openingCash, setOpeningCash] = useState('');
  const [closingCash, setClosingCash] = useState('');
  const [notes, setNotes]             = useState('');
  const [loading, setLoading]         = useState(true);
  const [shiftStats, setShiftStats]   = useState(null);
  const [acting, setActing]           = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [activeRes, historyRes] = await Promise.all([
        api.get('/shifts/active').catch(() => ({ data: null })),
        api.get('/shifts').catch(() => ({ data: [] })),
      ]);
      setActiveShift(activeRes.data || null);
      setShifts(historyRes.data || []);
      if (activeRes.data?.id) {
        const statsRes = await api.get(`/shifts/${activeRes.data.id}/stats`).catch(() => ({ data: null }));
        setShiftStats(statsRes.data);
      } else {
        setShiftStats(null);
      }
    } catch { toast.error('Failed to load shifts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const startShift = async () => {
    if (!openingCash) return toast.error('Enter opening cash amount');
    setActing(true);
    try {
      await api.post('/shifts/start', { openingCash: parseFloat(openingCash), notes });
      toast.success('Shift started');
      setOpeningCash(''); setNotes(''); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to start shift'); }
    finally { setActing(false); }
  };

  const endShift = async () => {
    if (!closingCash) return toast.error('Enter closing cash amount');
    if (!window.confirm('End this shift? This cannot be undone.')) return;
    setActing(true);
    try {
      await api.post(`/shifts/${activeShift.id}/end`, { closingCash: parseFloat(closingCash), notes });
      toast.success('Shift ended');
      setClosingCash(''); setNotes(''); setActiveShift(null); setShiftStats(null); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to end shift'); }
    finally { setActing(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Shift Management</h2>
          <p className="text-sm text-gray-500">Track cashier sessions and reconcile cash</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
          <RefreshCcw size={15} className="dark:text-white" />
        </button>
      </div>

      {/* What is a shift — info banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl px-5 py-3 text-sm text-blue-700 dark:text-blue-300">
        A shift tracks a cashier's work session — record opening cash, process sales, then close with a cash count to see if the drawer balances.
      </div>

      {/* Active shift or start form */}
      {activeShift ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-emerald-400 dark:border-emerald-600 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-black text-emerald-700 dark:text-emerald-400 text-sm">Active Shift</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Started {new Date(activeShift.startTime).toLocaleTimeString()} · {duration(activeShift.startTime, null)} ago
            </span>
          </div>

          {shiftStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Sales', value: shiftStats.totalSales || 0, Icon: ShoppingBag, color: 'text-blue-600' },
                { label: 'Revenue', value: `GH₵${parseFloat(shiftStats.totalRevenue || 0).toFixed(2)}`, Icon: Activity, color: 'text-emerald-600' },
                { label: 'Opening Cash', value: `GH₵${parseFloat(activeShift.openingCash || 0).toFixed(2)}`, Icon: DollarSign, color: 'text-gray-600 dark:text-gray-300' },
                { label: 'Expected Cash', value: `GH₵${(parseFloat(activeShift.openingCash || 0) + parseFloat(shiftStats.cashRevenue || 0)).toFixed(2)}`, Icon: DollarSign, color: 'text-purple-600' },
              ].map(({ label, value, Icon, color }) => (
                <div key={label} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon size={13} className={color} />
                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                  </div>
                  <p className={`text-base font-black ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">Closing Cash (GH₵) *</label>
              <input type="number" step="0.01" min="0" className={inputClass}
                placeholder="Count your cash drawer..."
                value={closingCash} onChange={e => setClosingCash(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">Notes</label>
              <input className={inputClass} placeholder="Optional notes..."
                value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <div className="flex items-end">
              <button onClick={endShift} disabled={acting}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-sm transition whitespace-nowrap">
                <StopCircle size={15} /> End Shift
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 dark:text-white text-sm mb-4 flex items-center gap-2">
            <PlayCircle size={16} className="text-emerald-500" /> Start New Shift
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">Opening Cash (GH₵) *</label>
              <input type="number" step="0.01" min="0" className={inputClass}
                placeholder="Count your opening cash..."
                value={openingCash} onChange={e => setOpeningCash(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">Notes</label>
              <input className={inputClass} placeholder="Optional notes..."
                value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <div className="flex items-end">
              <button onClick={startShift} disabled={acting}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-sm transition whitespace-nowrap">
                <PlayCircle size={15} /> Start Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shift history */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b dark:border-gray-700 flex items-center gap-2">
          <Clock size={15} className="text-blue-600" />
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Shift History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase text-xs">
              <tr>
                {['Cashier', 'Start', 'End', 'Duration', 'Opening', 'Closing', 'Variance', 'Sales', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : shifts.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No shifts recorded yet</td></tr>
              ) : shifts.map(s => {
                const variance = s.endTime
                  ? parseFloat(s.closingCash || 0) - parseFloat(s.expectedCash || s.openingCash || 0)
                  : null;
                return (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    <td className="px-4 py-3 font-semibold dark:text-white whitespace-nowrap">{s.cashier?.fullName}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">{new Date(s.startTime).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">{s.endTime ? new Date(s.endTime).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{duration(s.startTime, s.endTime)}</td>
                    <td className="px-4 py-3 dark:text-white text-xs">GH₵{parseFloat(s.openingCash || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 dark:text-white text-xs">{s.closingCash ? `GH₵${parseFloat(s.closingCash).toFixed(2)}` : '—'}</td>
                    <td className="px-4 py-3 text-xs">
                      {variance !== null && (
                        <span className={`font-black ${variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {variance >= 0 ? '+' : ''}GH₵{variance.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 dark:text-white text-xs">{s.totalSales || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                        s.endTime
                          ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
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
    </div>
  );
}
