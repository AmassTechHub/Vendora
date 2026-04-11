import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag, Users, Package, TrendingUp, AlertTriangle, DollarSign,
  RefreshCcw, ArrowUpRight, ShoppingCart, BarChart2, Clock, Zap,
  TrendingDown, RotateCcw, Sun, Moon, CloudSun, Activity, Target
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning', Icon: Sun, color: 'text-amber-500' };
  if (h < 17) return { text: 'Good afternoon', Icon: CloudSun, color: 'text-orange-500' };
  return { text: 'Good evening', Icon: Moon, color: 'text-indigo-400' };
}

const QuickAction = ({ to, icon: Icon, label, bg }) => (
  <Link to={to} className={`${bg} rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-1.5 hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-sm`}>
    <div className="p-2 rounded-xl bg-white/20">
      <Icon size={18} className="text-white" />
    </div>
    <span className="text-white text-[10px] sm:text-xs font-semibold text-center leading-tight">{label}</span>
  </Link>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-xl text-xs">
      <p className="font-bold text-gray-700 dark:text-gray-300 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.name?.toLowerCase().includes('revenue') ? `GH₵${parseFloat(p.value).toFixed(2)}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [topProducts, setTop] = useState([]);
  const [payBreakdown, setPay] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true);
    setLoadError(null);
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
        todaySales: daily.data.totalSales || 0,
        todayRevenue: parseFloat(daily.data.totalRevenue || 0),
        avgSale: parseFloat(daily.data.averageSaleValue || 0),
        totalCustomers: customers.data.length,
        totalProducts: products.data.length,
        lowStockCount: ls.data.length,
      });
      setTrend(trendData.data || []);
      setTop(topData.data || []);
      setLowStock(ls.data || []);
      setPay(Object.entries(payData.data || {}).map(([name, value]) => ({ name, value })));
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard error:', err);
      const msg = err.response?.data?.error || err.message || 'Failed to load dashboard';
      setLoadError(msg);
      toast.error(msg);
    }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const { text: greeting, Icon: GreetIcon, color: greetColor } = getGreeting();
  const firstName = user?.fullName?.split(' ')[0] || 'there';
  const totalRevenue7d = trend.reduce((s, d) => s + parseFloat(d.revenue || 0), 0);

  if (loading) return (
    <div className="space-y-5 animate-pulse">
      <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">

      {/* API error banner */}
      {loadError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">Dashboard failed to load</p>
            <p className="text-xs text-red-600 dark:text-red-500 mt-0.5 break-words">{loadError}</p>
          </div>
          <button onClick={() => load()} className="text-xs text-red-600 dark:text-red-400 font-semibold hover:underline shrink-0">Retry</button>
        </div>
      )}

      {/* Hero greeting */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <GreetIcon size={16} className={greetColor} />
              <h1 className="text-lg font-black text-gray-900 dark:text-white">{greeting}, {firstName}!</h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date().toLocaleDateString('en-GH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {lastUpdated && <span className="ml-2 opacity-60">· {lastUpdated.toLocaleTimeString()}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {stats?.lowStockCount > 0 && (
              <Link to="/products" className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold hover:bg-red-100 transition">
                <AlertTriangle size={12} /> {stats.lowStockCount} low stock
              </Link>
            )}
            <button onClick={() => load(true)} disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition disabled:opacity-50">
              <RefreshCcw size={12} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard label="Today's Sales" value={stats?.todaySales || 0} icon={ShoppingBag} color="blue" sub="transactions today" />
        <StatCard label="Today's Revenue" value={`GH₵${(stats?.todayRevenue || 0).toFixed(2)}`} icon={DollarSign} color="green" sub="total collected" />
        <StatCard label="Avg Sale Value" value={`GH₵${(stats?.avgSale || 0).toFixed(2)}`} icon={TrendingUp} color="purple" sub="per transaction" />
        <StatCard label="Customers" value={stats?.totalCustomers || 0} icon={Users} color="orange" sub="registered" />
        <StatCard label="Products" value={stats?.totalProducts || 0} icon={Package} color="blue" sub="in catalog" />
        <StatCard label="7-Day Revenue" value={`GH₵${totalRevenue7d.toFixed(2)}`} icon={Activity} color="green" sub="last 7 days" />
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2.5">Quick Actions</p>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
          <QuickAction to="/cashier"   icon={ShoppingCart} label="New Sale"   bg="bg-blue-600" />
          <QuickAction to="/products"  icon={Package}      label="Products"   bg="bg-violet-600" />
          <QuickAction to="/customers" icon={Users}        label="Customers"  bg="bg-emerald-600" />
          <QuickAction to="/reports"   icon={BarChart2}    label="Reports"    bg="bg-amber-500" />
          <QuickAction to="/shifts"    icon={Clock}        label="Shifts"     bg="bg-cyan-600" />
          <QuickAction to="/expenses"  icon={TrendingDown} label="Expenses"   bg="bg-red-500" />
          <QuickAction to="/refunds"   icon={RotateCcw}    label="Refunds"    bg="bg-orange-500" />
          <QuickAction to="/suppliers" icon={Zap}          label="Suppliers"  bg="bg-indigo-600" />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Revenue Trend</h3>
              <p className="text-xs text-gray-400">Last 7 days</p>
            </div>
            <Link to="/reports" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              Full report <ArrowUpRight size={11} />
            </Link>
          </div>
          {trend.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-gray-300 dark:text-gray-600">
              <Target size={32} className="mb-2" />
              <p className="text-sm">No sales data yet — make your first sale!</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" fill="url(#revGrad)" strokeWidth={2.5} dot={{ r: 3, fill: '#3b82f6' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Payment Methods</h3>
          <p className="text-xs text-gray-400 mb-4">Last 30 days</p>
          {payBreakdown.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-gray-300 dark:text-gray-600 text-sm">No data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={payBreakdown} dataKey="value" cx="50%" cy="50%" outerRadius={60} innerRadius={30}>
                    {payBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {payBreakdown.map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-gray-600 dark:text-gray-400">{p.name}</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{p.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Top Products</h3>
              <p className="text-xs text-gray-400">By quantity sold (30 days)</p>
            </div>
            <Link to="/reports" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View all →</Link>
          </div>
          {topProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No sales data yet</div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => {
                const max = topProducts[0]?.quantity || 1;
                const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-red-500'];
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-xs font-black text-gray-300 dark:text-gray-600 w-4 shrink-0">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-800 dark:text-white truncate">{p.name}</span>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 shrink-0 ml-2">{p.quantity}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full ${colors[i]} rounded-full transition-all duration-700`}
                          style={{ width: `${(p.quantity / max) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Low Stock Alerts</h3>
              <p className="text-xs text-gray-400">Items needing restock</p>
            </div>
            <Link to="/products" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Manage →</Link>
          </div>
          {lowStock.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package size={18} className="text-green-600" />
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">All stocked up!</p>
              <p className="text-xs text-gray-400 mt-0.5">No items need restocking</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {lowStock.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2.5 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white text-xs truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-400">{p.category || 'Uncategorized'}</p>
                  </div>
                  <span className="text-red-600 dark:text-red-400 font-black text-sm ml-3">{p.quantity} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sales count bar chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Daily Transaction Count</h3>
        <p className="text-xs text-gray-400 mb-4">Number of sales per day (last 7 days)</p>
        {trend.length === 0 ? (
          <div className="h-28 flex items-center justify-center text-gray-300 text-sm">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={trend} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sales" name="Sales" fill="#8b5cf6" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
