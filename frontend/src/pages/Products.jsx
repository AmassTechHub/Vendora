import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, AlertTriangle, PackagePlus, Search, Package } from 'lucide-react';

const CATEGORIES = [
  'Electronics', 'Food & Beverages', 'Clothing & Apparel', 'Health & Beauty',
  'Home & Kitchen', 'Office Supplies', 'Sports & Fitness', 'Toys & Games',
  'Books & Stationery', 'Automotive', 'Agriculture', 'Pharmaceuticals', 'Other'
];

const ADJUST_REASONS = [
  'Restock / New delivery', 'Damaged / Expired', 'Stock count correction',
  'Returned by customer', 'Transferred out', 'Promotional use', 'Other'
];

const empty = { name: '', category: '', price: '', quantity: '', barcode: '', supplierId: '', lowStockThreshold: 10 };

const inputClass = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white";
const labelClass = "block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [adjusting, setAdjusting] = useState(null);
  const [adjustForm, setAdjustForm] = useState({ quantityChange: '', reason: '' });
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [customCategory, setCustomCategory] = useState('');

  const load = async () => {
    try {
      const [{ data: prods }, { data: ls }, { data: sups }] = await Promise.all([
        api.get('/products'),
        api.get('/products/low-stock'),
        api.get('/suppliers').catch(() => ({ data: [] })),
      ]);
      setProducts(prods);
      setLowStock(ls);
      setSuppliers(sups);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load products');
    }
  };

  useEffect(() => { load(); }, []);

  // Get unique categories from existing products + predefined
  const allCategories = [...new Set([...CATEGORIES, ...products.map(p => p.category).filter(Boolean)])].sort();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      category: form.category === '__custom__' ? customCategory : form.category,
      supplier: suppliers.find(s => s.id === parseInt(form.supplierId))?.name || form.supplierId || ''
    };
    try {
      if (editing) {
        await api.put(`/products/${editing}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product added');
      }
      setForm(empty); setEditing(null); setShowForm(false); setCustomCategory(''); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save product'); }
  };

  const handleEdit = (p) => {
    setForm({ ...p, supplierId: suppliers.find(s => s.name === p.supplier)?.id?.toString() || '' });
    setEditing(p.id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await api.delete(`/products/${id}`); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to delete'); }
  };

  const submitAdjustment = async (e) => {
    e.preventDefault();
    if (!adjustForm.quantityChange || Number(adjustForm.quantityChange) === 0) {
      toast.error('Enter a non-zero quantity'); return;
    }
    try {
      await api.post(`/products/${adjusting.id}/adjust-stock`, {
        quantityChange: Number(adjustForm.quantityChange),
        reason: adjustForm.reason,
      });
      toast.success('Stock adjusted');
      setAdjusting(null); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.includes(search);
    const matchCat = !filterCat || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h2>
          <p className="text-sm text-gray-500">{products.length} products · {lowStock.length} low stock</p>
        </div>
        <button onClick={() => { setForm(empty); setEditing(null); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 font-semibold text-sm shadow-sm">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center gap-2 text-amber-800 dark:text-amber-300">
          <AlertTriangle size={16} className="shrink-0" />
          <span className="text-sm font-medium">{lowStock.length} product(s) need restocking</span>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Search by name, category, barcode..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No products found</p>
            <button onClick={() => { setForm(empty); setShowForm(true); }}
              className="mt-3 text-blue-600 text-sm font-medium hover:underline">Add your first product →</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                <tr>
                  {['Name', 'Category', 'Price', 'Stock', 'Supplier', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 dark:text-white">{p.name}</p>
                      {p.barcode && <p className="text-xs text-gray-400 font-mono">{p.barcode}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {p.category && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {p.category}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">GH₵{parseFloat(p.price).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        p.quantity <= p.lowStockThreshold
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {p.quantity} {p.quantity <= p.lowStockThreshold ? '⚠️' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{p.supplier || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setAdjusting(p); setAdjustForm({ quantityChange: '', reason: '' }); }}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition" title="Adjust stock">
                          <PackagePlus size={15} />
                        </button>
                        <button onClick={() => handleEdit(p)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                          <Trash2 size={15} />
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
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:py-8"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowForm(false);
              setCustomCategory('');
            }
          }}
        >
          <div
            className="my-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-5 dark:text-white">{editing ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Product Name *</label>
                <input required className={inputClass} placeholder="e.g. Samsung Galaxy A15"
                  value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <select className={inputClass} value={form.category || ''}
                  onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select category...</option>
                  {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="__custom__">+ Add custom category</option>
                </select>
                {form.category === '__custom__' && (
                  <input className={`${inputClass} mt-2`} placeholder="Enter custom category name"
                    value={customCategory} onChange={e => setCustomCategory(e.target.value)} />
                )}
              </div>

              <div>
                <label className={labelClass}>Supplier</label>
                <select className={inputClass} value={form.supplierId || ''}
                  onChange={e => setForm({ ...form, supplierId: e.target.value })}>
                  <option value="">No supplier</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {suppliers.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">No suppliers yet — <a href="/suppliers" className="text-blue-500 hover:underline">add one first</a></p>
                )}
              </div>

              <div>
                <label className={labelClass}>Barcode (optional)</label>
                <input className={inputClass} placeholder="Scan or enter barcode"
                  value={form.barcode || ''} onChange={e => setForm({ ...form, barcode: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Price (GH₵) *</label>
                  <input type="number" step="0.01" min="0" required className={inputClass}
                    placeholder="0.00" value={form.price || ''} onChange={e => setForm({ ...form, price: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Quantity *</label>
                  <input type="number" min="0" required className={inputClass}
                    placeholder="0" value={form.quantity || ''} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Low Stock Alert Threshold</label>
                <input type="number" min="0" className={inputClass}
                  placeholder="10" value={form.lowStockThreshold || 10}
                  onChange={e => setForm({ ...form, lowStockThreshold: e.target.value })} />
                <p className="text-xs text-gray-400 mt-1">Alert when stock falls below this number</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700">
                  {editing ? 'Update Product' : 'Add Product'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setCustomCategory(''); }}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 dark:text-white py-2.5 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjusting && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:py-8"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.target === e.currentTarget && setAdjusting(null)}
        >
          <div
            className="my-auto w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-1 dark:text-white">Adjust Stock</h3>
            <p className="text-sm text-gray-500 mb-4">{adjusting.name} · Current: <strong>{adjusting.quantity}</strong></p>
            <form onSubmit={submitAdjustment} className="space-y-4">
              <div>
                <label className={labelClass}>Quantity Change</label>
                <input type="number" className={inputClass} placeholder="e.g. +10 or -4"
                  value={adjustForm.quantityChange}
                  onChange={e => setAdjustForm({ ...adjustForm, quantityChange: e.target.value })} />
                <p className="text-xs text-gray-400 mt-1">Positive = add stock · Negative = remove stock</p>
              </div>
              <div>
                <label className={labelClass}>Reason</label>
                <select className={inputClass} value={adjustForm.reason}
                  onChange={e => setAdjustForm({ ...adjustForm, reason: e.target.value })}>
                  <option value="">Select reason...</option>
                  {ADJUST_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-semibold hover:bg-emerald-700">Apply</button>
                <button type="button" onClick={() => setAdjusting(null)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 dark:text-white py-2.5 rounded-xl font-semibold">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
