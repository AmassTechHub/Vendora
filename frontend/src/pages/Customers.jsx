import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, History, Search, Users, X, Star } from 'lucide-react';

const empty = { name: '', phone: '', email: '', address: '' };
const inputClass = "w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white focus:bg-white transition";
const labelClass = "block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide";

export default function Customers() {
  const [customers, setCustomers]     = useState([]);
  const [form, setForm]               = useState(empty);
  const [editing, setEditing]         = useState(null);
  const [showForm, setShowForm]       = useState(false);
  const [history, setHistory]         = useState(null);
  const [historyCustomer, setHistoryCustomer] = useState(null);
  const [search, setSearch]           = useState('');
  const [loading, setLoading]         = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/customers');
      setCustomers(data);
    } catch { toast.error('Failed to load customers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/customers/${editing}`, form);
        toast.success('Customer updated');
      } else {
        await api.post('/customers', form);
        toast.success('Customer added');
      }
      setForm(empty); setEditing(null); setShowForm(false); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save customer'); }
  };

  const viewHistory = async (customer) => {
    try {
      const { data } = await api.get(`/customers/${customer.id}/sales`);
      setHistory(data);
      setHistoryCustomer(customer);
    } catch { toast.error('Failed to load purchase history'); }
  };

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Customers</h2>
          <p className="text-sm text-gray-500">{customers.length} registered customers</p>
        </div>
        <button onClick={() => { setForm(empty); setEditing(null); setShowForm(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-semibold text-sm transition shadow-sm">
          <Plus size={15} /> Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
          placeholder="Search by name, phone or email..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No customers found</p>
            <button onClick={() => setShowForm(true)} className="mt-2 text-blue-600 text-sm hover:underline">Add first customer →</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase text-xs">
                <tr>
                  {['Name', 'Phone', 'Email', 'Loyalty', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    <td className="px-4 py-3 font-semibold dark:text-white">{c.name}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{c.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{c.email || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        <Star size={10} /> {c.loyaltyPoints || 0} pts
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setForm({ name: c.name, phone: c.phone || '', email: c.email || '', address: c.address || '' }); setEditing(c.id); setShowForm(true); }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => viewHistory(c)}
                          className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                          <History size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border dark:border-gray-700">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black dark:text-white">{editing ? 'Edit Customer' : 'Add Customer'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input required className={inputClass} placeholder="John Doe"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input className={inputClass} placeholder="0244123456"
                  value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" className={inputClass} placeholder="customer@email.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <input className={inputClass} placeholder="Customer address"
                  value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold text-sm transition">
                  {editing ? 'Update' : 'Add Customer'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-white py-2.5 rounded-xl font-semibold text-sm transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase History Modal */}
      {history && historyCustomer && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl border dark:border-gray-700 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div>
                <h3 className="text-lg font-black dark:text-white">Purchase History</h3>
                <p className="text-sm text-gray-500">{historyCustomer.name}</p>
              </div>
              <button onClick={() => { setHistory(null); setHistoryCustomer(null); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"><X size={18} /></button>
            </div>
            <div className="overflow-auto flex-1">
              {history.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No purchases yet</div>
              ) : (
                <div className="space-y-2">
                  {history.map(sale => (
                    <div key={sale.id} className="border dark:border-gray-700 rounded-xl p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-sm dark:text-white">Sale #{sale.id}</p>
                          <p className="text-xs text-gray-500">{new Date(sale.createdAt).toLocaleString()}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{sale.paymentMethod} · {sale.items?.length || 0} items</p>
                        </div>
                        <span className="font-black text-emerald-600">GH₵{parseFloat(sale.totalAmount).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
