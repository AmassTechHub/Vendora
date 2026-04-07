import { useState, useEffect } from 'react';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import { ShoppingBag, Users, Package, TrendingUp, AlertTriangle, DollarSign, RefreshCcw } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

export default function Dashboard() {
  const [stats, setStats]         = useState(null);
  const [trend, setTrend]         = useState([]);
  const [topProducts, setTop]     = useState([]);
  const [payBreakdown, setPay]    = useState([]);
  const [lowStock, setLowStock]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const [daily, ls, customers, products, trendData, topData, payData] = await Promise.all([
        api.get('/reports/daily'),
        api.get('/products/low-stock'),
        api.get('/customers'),
        api.get('/products'),
        api.get('/reports/trend'),
        api.get('/reports/top-products?limit=5'),
        api.get('/reports/payment-breakdown'),
      ]);

      setStats({
        todaySales:     daily.data.totalSales,
        todayRevenue:   parseFloat(daily.data.totalRevenue || 0),
        avgSale:        parseFloat(daily.data.averageSaleValue || 0),
        totalCustomers: customers.data.length,
        totalProducts:  products.data.length,
        lowStockCount:  ls.data.length,
      });

      setTrend(trendData.data || []);
      setTop(topData.data || []);
      setLowStock(ls.data || []);

      const payEntries = Object.entries(payData.data || {}).map(([name, value]) => ({ name, value }));
      setPay(payEntries);
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to load dashboard data';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Executive Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1">Real-time operations snapshot</p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 bg-white border px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        <StatCard label="Today's Sales"    value={stats.todaySales}                                    icon={ShoppingBag}  color="blue"   />
        <StatCard label="Today's Revenue"  value={`GH₵${stats.todayRevenue.toFixed(2)}`}               icon={DollarSign}   color="green"  />
        <StatCard label="Avg Sale Value"   value={`GH₵${stats.avgSale.toFixed(2)}`}                    icon={TrendingUp}   color="purple" />
        <StatCard label="Total Customers"  value={stats.totalCustomers}                                 icon={Users}        color="orange" />
        <StatCard label="Total Products"   value={stats.totalProducts}                                  icon={Package}      color="blue"   />
        <StatCard label="Low Stock Items"  value={stats.lowStockCount} sub="Need restocking"            icon={AlertTriangle} color="red"   />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Revenue Trend - takes 2 cols */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border p-5 min-h-[320px]">
          <h3 className="font-semibold text-gray-700 mb-4">Revenue — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`GH₵${parseFloat(v).toFixed(2)}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Breakdown Pie */}
        <div className="bg-white rounded-xl shadow-sm border p-5 min-h-[320px]">
          <h3 className="font-semibold text-gray-700 mb-4">Payment Methods (30 days)</h3>
          {payBreakdown.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-20">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={payBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {payBreakdown.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border p-5 min-h-[300px]">
          <h3 className="font-semibold text-gray-700 mb-4">Top Products (30 days)</h3>
          {topProducts.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No sales data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl shadow-sm border p-5 min-h-[300px]">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-yellow-500" size={18} />
            <h3 className="font-semibold text-gray-700">Low Stock Alerts</h3>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">All products are well stocked</p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-auto">
              {lowStock.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.supplier || 'No supplier'}</p>
                  </div>
                  <span className="text-red-600 font-bold text-sm">{p.quantity} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sales Count Trend */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h3 className="font-semibold text-gray-700 mb-4">Daily Sales Count — Last 7 Days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="sales" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
