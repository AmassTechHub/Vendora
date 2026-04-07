import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, History } from 'lucide-react';

const empty = { name: '', phone: '', email: '', address: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [history, setHistory] = useState(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    const { data } = await api.get('/customers');
    setCustomers(data);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/customers/${editing}`, form);
      else await api.post('/customers', form);
      toast.success('Customer saved');
      setForm(empty); setEditing(null); setShowForm(false); load();
    } catch { toast.error('Failed to save customer'); }
  };

  const viewHistory = async (id) => {
    const { data } = await api.get(`/customers/${id}/purchases`);
    setHistory(data);
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Customers</h2>
        <button onClick={() => { setForm(empty); setEditing(null); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Plus size={18} /> Add Customer
        </button>
      </div>

      <input className="border rounded-lg px-4 py-2 w-full max-w-sm"
        placeholder="Search by name or phone..." value={search}
        onChange={(e) => setSearch(e.target.value)} />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              {['ID', 'Name', 'Phone', 'Email', 'Loyalty Points', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(c => (
              <tr key={c.id}>
                <td className="px-4 py-3 text-gray-500">{c.id}</td>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3">{c.phone}</td>
                <td className="px-4 py-3">{c.email}</td>
                <td className="px-4 py-3">
                  <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium">
                    {c.loyaltyPoints} pts
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => { setForm(c); setEditing(c.id); setShowForm(true); }}
                    className="text-blue-600 hover:text-blue-800"><Pencil size={16} /></button>
                  <button onClick={() => viewHistory(c.id)} className="text-gray-600 hover:text-gray-800"><History size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-4">{editing ? 'Edit Customer' : 'Add Customer'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {[['name', 'Name', true], ['phone', 'Phone', false], ['email', 'Email', false], ['address', 'Address', false]].map(([key, label, req]) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-600">{label}</label>
                  <input required={req} className="w-full border rounded-lg px-3 py-2 mt-1"
                    value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold">Save</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-200 py-2 rounded-lg font-semibold">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {history && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Purchase History</h3>
              <button onClick={() => setHistory(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            {history.length === 0 ? <p className="text-gray-500 text-center py-4">No purchases yet</p> : (
              <div className="space-y-3">
                {history.map(sale => (
                  <div key={sale.id} className="border rounded-lg p-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Sale #{sale.id}</span>
                      <span className="font-bold text-green-600">GH₵{sale.totalAmount}</span>
                    </div>
                    <p className="text-sm text-gray-500">{new Date(sale.createdAt).toLocaleString()}</p>
                    <p className="text-sm">{sale.paymentMethod}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
