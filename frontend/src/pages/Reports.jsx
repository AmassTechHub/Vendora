import { useState, useEffect } from 'react';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import { TrendingUp, ShoppingBag, Package, DollarSign } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const TABS = ['daily', 'weekly', 'range', 'inventory'];
const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

const paymentColor = { CASH: 'green', MOBILE_MONEY: 'blue', CARD: 'purple' };

export default function Reports() {
  const [tab, setTab]           = useState('daily');
  const [report, setReport]     = useState(null);
  const [inventory, setInv]     = useState(null);
  const [date, setDate]         = useState(new Date().toISOString().split('T')[0]);
  const [from, setFrom]         = useState(new Date().toISOString().split('T')[0]);
  const [to, setTo]             = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading]   = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      if (tab === 'inventory') {
        const { data } = await api.get('/reports/inventory');
        setInv(data); setReport(null);
      } else {
        let endpoint = '/reports/daily?date=' + date;
        if (tab === 'weekly') endpoint = '/reports/weekly';
        if (tab === 'range')  endpoint = `/reports/range?from=${from}&to=${to}`;
        const { data } = await api.get(endpoint);
        setReport(data); setInv(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tab, date]);

  // Build payment breakdown for pie chart from sales list
  const paymentPie = report ? Object.entries(
    (report.sales || []).reduce((acc, s) => {
      const m = s.paymentMethod || 'UNKNOWN';
      acc[m] = (acc[m] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
        <p className="text-gray-500 text-sm mt-1">Monitor your business performance</p>
      </div>

      {/* Tab Bar */}
      <div className="flex flex-wrap gap-2 items-center">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg capitalize font-medium text-sm transition ${
              tab === t ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}>
            {t === 'range' ? 'Date Range' : t}
          </button>
        ))}

        <div className="ml-auto flex gap-2 items-center">
          {tab === 'daily' && (
            <input type="date" className="border rounded-lg px-3 py-2 text-sm"
              value={date} onChange={(e) => setDate(e.target.value)} />
          )}
          {tab === 'range' && (
            <>
              <input type="date" className="border rounded-lg px-3 py-2 text-sm"
                value={from} onChange={(e) => setFrom(e.target.value)} />
              <span className="text-gray-400">to</span>
              <input type="date" className="border rounded-lg px-3 py-2 text-sm"
                value={to} onChange={(e) => setTo(e.target.value)} />
              <button onClick={load} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                Apply
              </button>
            </>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {/* Sales Report */}
      {!loading && report && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Sales"     value={report.totalSales}                                          icon={ShoppingBag} color="blue"   />
            <StatCard label="Total Revenue"   value={`GH₵${parseFloat(report.totalRevenue).toFixed(2)}`}         icon={DollarSign}  color="green"  />
            <StatCard label="Items Sold"      value={report.totalItemsSold}                                       icon={Package}     color="purple" />
            <StatCard label="Avg Sale Value"  value={`GH₵${parseFloat(report.averageSaleValue || 0).toFixed(2)}`} icon={TrendingUp}  color="orange" />
          </div>

          {/* Charts */}
          {paymentPie.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-xl border shadow-sm p-5">
                <h3 className="font-semibold text-gray-700 mb-4">Payment Method Breakdown</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={paymentPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>
                      {paymentPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl border shadow-sm p-5">
                <h3 className="font-semibold text-gray-700 mb-4">Sales by Payment Method</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={paymentPie}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Transactions Table */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">Transactions ({report.sales?.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    {['Sale ID', 'Cashier', 'Customer', 'Items', 'Total', 'Payment', 'Date'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.sales?.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-400">No transactions found</td></tr>
                  )}
                  {report.sales?.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-gray-500">#{s.id}</td>
                      <td className="px-4 py-3 font-medium">{s.cashier?.fullName}</td>
                      <td className="px-4 py-3">{s.customer?.name || <span className="text-gray-400">Walk-in</span>}</td>
                      <td className="px-4 py-3">{s.items?.length}</td>
                      <td className="px-4 py-3 font-semibold text-green-700">GH₵{parseFloat(s.totalAmount).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <Badge label={s.paymentMethod} color={paymentColor[s.paymentMethod] || 'gray'} />
                      </td>
                      <td className="px-4 py-3 text-gray-500">{new Date(s.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Report */}
      {!loading && inventory && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 mb-4">All Products ({inventory.allProducts?.length})</h3>
            <div className="space-y-2 max-h-96 overflow-auto">
              {inventory.allProducts?.map(p => (
                <div key={p.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.category}</p>
                  </div>
                  <Badge
                    label={`${p.quantity} in stock`}
                    color={p.quantity <= p.lowStockThreshold ? 'red' : 'green'}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-5">
            <h3 className="font-semibold text-red-600 mb-4">Low Stock ({inventory.lowStock?.length})</h3>
            {inventory.lowStock?.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">All products are well stocked</p>
            ) : (
              <div className="space-y-2">
                {inventory.lowStock?.map(p => (
                  <div key={p.id} className="flex justify-between items-center bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.supplier || 'No supplier'}</p>
                    </div>
                    <span className="text-red-600 font-bold">{p.quantity} left</span>
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
