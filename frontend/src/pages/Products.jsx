import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, AlertTriangle, PackagePlus } from 'lucide-react';

const empty = { name: '', category: '', price: '', quantity: '', barcode: '', supplier: '', lowStockThreshold: 10 };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [adjusting, setAdjusting] = useState(null);
  const [adjustForm, setAdjustForm] = useState({ quantityChange: 0, reason: '' });
  const [search, setSearch] = useState('');

  const load = async () => {
    const { data } = await api.get('/products');
    setProducts(data);
    const { data: ls } = await api.get('/products/low-stock');
    setLowStock(ls);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/products/${editing}`, form);
        toast.success('Product updated');
      } else {
        await api.post('/products', form);
        toast.success('Product added');
      }
      setForm(empty); setEditing(null); setShowForm(false); load();
    } catch { toast.error('Failed to save product'); }
  };

  const handleEdit = (p) => {
    setForm(p); setEditing(p.id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    toast.success('Product deleted'); load();
  };

  const openAdjust = (product) => {
    setAdjusting(product);
    setAdjustForm({ quantityChange: 0, reason: '' });
  };

  const submitAdjustment = async (e) => {
    e.preventDefault();
    if (!adjusting) return;
    if (!adjustForm.quantityChange || Number(adjustForm.quantityChange) === 0) {
      toast.error('Enter a non-zero quantity change');
      return;
    }

    try {
      await api.post(`/products/${adjusting.id}/adjust-stock`, {
        quantityChange: Number(adjustForm.quantityChange),
        reason: adjustForm.reason,
      });
      toast.success('Stock adjusted successfully');
      setAdjusting(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to adjust stock');
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Products</h2>
        <button onClick={() => { setForm(empty); setEditing(null); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Plus size={18} /> Add Product
        </button>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2 text-yellow-800">
          <AlertTriangle size={18} />
          <span>{lowStock.length} product(s) are low on stock</span>
        </div>
      )}

      <input className="border rounded-lg px-4 py-2 w-full max-w-sm"
        placeholder="Search products..." value={search}
        onChange={(e) => setSearch(e.target.value)} />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              {['ID', 'Name', 'Category', 'Price', 'Stock', 'Barcode', 'Supplier', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(p => (
              <tr key={p.id} className={p.quantity <= p.lowStockThreshold ? 'bg-yellow-50' : ''}>
                <td className="px-4 py-3 text-gray-500">{p.id}</td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">{p.category}</td>
                <td className="px-4 py-3">GH₵{p.price}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.quantity <= p.lowStockThreshold ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {p.quantity}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{p.barcode}</td>
                <td className="px-4 py-3">{p.supplier}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openAdjust(p)} className="text-emerald-600 hover:text-emerald-800" title="Adjust stock">
                    <PackagePlus size={16} />
                  </button>
                  <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-800"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-4">{editing ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {[['name', 'Name'], ['category', 'Category'], ['barcode', 'Barcode'], ['supplier', 'Supplier']].map(([key, label]) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-600">{label}</label>
                  <input className="w-full border rounded-lg px-3 py-2 mt-1"
                    value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Price</label>
                  <input type="number" step="0.01" required className="w-full border rounded-lg px-3 py-2 mt-1"
                    value={form.price || ''} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Quantity</label>
                  <input type="number" required className="w-full border rounded-lg px-3 py-2 mt-1"
                    value={form.quantity || ''} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">Save</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-200 py-2 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {adjusting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-1">Adjust Stock</h3>
            <p className="text-sm text-gray-500 mb-4">
              {adjusting.name} (current stock: {adjusting.quantity})
            </p>
            <form onSubmit={submitAdjustment} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Quantity Change</label>
                <input
                  type="number"
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  placeholder="e.g. 10 or -4"
                  value={adjustForm.quantityChange}
                  onChange={(e) => setAdjustForm({ ...adjustForm, quantityChange: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Use positive to add stock, negative to remove.</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Reason</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  placeholder="Restock / damaged items / correction..."
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700">Apply</button>
                <button type="button" onClick={() => setAdjusting(null)} className="flex-1 bg-gray-200 py-2 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
