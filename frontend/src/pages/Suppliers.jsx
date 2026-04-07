import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Phone, Mail, Building2 } from 'lucide-react';

const empty = { name: '', contactPerson: '', phone: '', email: '', address: '', notes: '' };

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/suppliers');
      setSuppliers(data);
    } catch { toast.error('Failed to load suppliers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/suppliers/${editing}`, form);
        toast.success('Supplier updated');
      } else {
        await api.post('/suppliers', form);
        toast.success('Supplier added');
      }
      setForm(empty); setEditing(null); setShowForm(false); load();
    } catch { toast.error('Failed to save supplier'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this supplier?')) return;
    try {
      await api.delete(`/suppliers/${id}`);
      toast.success('Deleted'); load();
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = suppliers.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.contactPerson?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Suppliers</h2>
          <p className="text-sm text-gray-500">Manage your product suppliers and vendors</p>
        </div>
        <button onClick={() => { setForm(empty); setEditing(null); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 text-sm font-semibold">
          <Plus size={16} /> Add Supplier
        </button>
      </div>

      <input className="border rounded-lg px-4 py-2 w-full max-w-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
        placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)} />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Building2 size={48} className="mx-auto mb-3 opacity-30" />
          <p>No suppliers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => (
            <div key={s.id} className="bg-white dark:bg-gray-800 rounded-xl border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Building2 size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white text-sm">{s.name}</h3>
                    {s.contactPerson && <p className="text-xs text-gray-500">{s.contactPerson}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setForm(s); setEditing(s.id); setShowForm(true); }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(s.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                {s.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Phone size={12} /> {s.phone}
                  </div>
                )}
                {s.email && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Mail size={12} /> {s.email}
                  </div>
                )}
                {s.address && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{s.address}</p>
                )}
              </div>
              {s.notes && (
                <p className="text-xs text-gray-400 mt-2 border-t dark:border-gray-700 pt-2">{s.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-4 dark:text-white">{editing ? 'Edit Supplier' : 'Add Supplier'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {[
                ['name', 'Company Name *', true],
                ['contactPerson', 'Contact Person', false],
                ['phone', 'Phone', false],
                ['email', 'Email', false],
                ['address', 'Address', false],
              ].map(([key, label, required]) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</label>
                  <input required={required}
                    className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                    value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Notes</label>
                <textarea rows={2} className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm resize-none"
                  value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">Save</button>
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
