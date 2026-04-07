import { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, TrendingDown, Filter } from 'lucide-react';

const CATEGORIES = ['Rent', 'Utilities', 'Salaries', 'Supplies', 'Maintenance', 'Marketing', 'Transport', 'Other'];
const empty = { description: '', amount: '', category: 'Other', date: new Date().toISOString().split('T')[0], notes: '' };

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterCat) params.category = filterCat;
      if (from) params.from = from;
      if (to) params.to = to;
      const { data } = await api.get('/expenses', { params });
      setExpenses(data);
    } catch { toast.error('Failed to load expenses'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/expenses', { ...form, amount: parseFloat(form.amount) });
      toast.success('Expense recorded');
      setForm(empty); setShowForm(false); load();
    } catch { toast.error('Failed to save expense'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success('Deleted'); load();
    } catch { toast.error('Failed to delete'); }
  };

  const total = useMemo(() => expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0), [expenses]);

  const byCategory = useMemo(() => {
    const map = {};
    expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + parseFloat(e.amount || 0); });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Expenses</h2>
          <p className="text-sm text-gray-500">Track operational costs and overheads</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 text-sm font-semibold">
          <Plus size={16} /> Record Expense
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 col-span-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Expenses</p>
          <p className="text-3xl font-black text-red-600 mt-1">GH₵{total.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">{expenses.length} records</p>
        </div>
        {byCategory.slice(0, 2).map(([cat, amt]) => (
          <div key={cat} className="bg-white dark:bg-gray-800 rounded-xl border p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide truncate">{cat}</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white mt-1">GH₵{amt.toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-3 flex flex-wrap gap-2 items-center">
        <Filter size={14} className="text-gray-400" />
        <select className="border rounded-lg px-3 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="date" className="border rounded-lg px-3 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          value={from} onChange={e => setFrom(e.target.value)} />
        <input type="date" className="border rounded-lg px-3 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          value={to} onChange={e => setTo(e.target.value)} />
        <button onClick={load} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-700">Apply</button>
        <button onClick={() => { setFilterCat(''); setFrom(''); setTo(''); setTimeout(load, 0); }}
          className="bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-300 dark:text-white">Reset</button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 uppercase text-xs">
            <tr>
              {['Date', 'Description', 'Category', 'Amount', 'Notes', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : expenses.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No expenses recorded yet</td></tr>
            ) : expenses.map(e => (
              <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{e.date}</td>
                <td className="px-4 py-3 font-medium dark:text-white">{e.description}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    {e.category}
                  </span>
                </td>
                <td className="px-4 py-3 font-bold text-red-600">GH₵{parseFloat(e.amount).toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-[200px] truncate">{e.notes || '—'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(e.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
              <TrendingDown size={18} className="text-red-500" /> Record Expense
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Description *</label>
                <input required className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g. Monthly rent payment"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount (GH₵) *</label>
                  <input required type="number" step="0.01" min="0"
                    className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Date *</label>
                  <input required type="date"
                    className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Category</label>
                <select className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Notes</label>
                <textarea rows={2} className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                  placeholder="Optional notes..."
                  value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700">Save</button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 dark:text-white py-2 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
