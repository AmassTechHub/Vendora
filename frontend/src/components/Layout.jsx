import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  ShoppingCart, Package, Users, BarChart2, Settings, LogOut,
  LayoutDashboard, UserCircle2, ShieldCheck, ReceiptText,
  TrendingDown, RotateCcw, Truck, Clock, Sun, Moon, Menu, X,
  Store, ChevronRight
} from 'lucide-react';

const roleColor = {
  ADMIN: 'bg-red-500 text-white',
  MANAGER: 'bg-blue-500 text-white',
  CASHIER: 'bg-emerald-500 text-white'
};

const navGroups = [
  {
    label: 'Operations',
    items: [
      { to: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER'] },
      { to: '/cashier',     label: 'Cashier',      icon: ShoppingCart,    roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
      { to: '/sales',       label: 'Sales',        icon: ReceiptText,     roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
      { to: '/shifts',      label: 'Shifts',       icon: Clock,           roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
      { to: '/refunds',     label: 'Refunds',      icon: RotateCcw,       roles: ['ADMIN', 'MANAGER'] },
    ]
  },
  {
    label: 'Inventory',
    items: [
      { to: '/products',    label: 'Products',     icon: Package,         roles: ['ADMIN', 'MANAGER'] },
      { to: '/suppliers',   label: 'Suppliers',    icon: Truck,           roles: ['ADMIN', 'MANAGER'] },
      { to: '/customers',   label: 'Customers',    icon: Users,           roles: ['ADMIN', 'MANAGER'] },
    ]
  },
  {
    label: 'Finance',
    items: [
      { to: '/expenses',    label: 'Expenses',     icon: TrendingDown,    roles: ['ADMIN', 'MANAGER'] },
      { to: '/reports',     label: 'Reports',      icon: BarChart2,       roles: ['ADMIN', 'MANAGER'] },
    ]
  },
  {
    label: 'Account',
    items: [
      { to: '/account',     label: 'My Account',   icon: UserCircle2,     roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
      { to: '/admin/users', label: 'Users',        icon: Settings,        roles: ['ADMIN'] },
      { to: '/admin/audit-logs', label: 'Audit Logs', icon: ShieldCheck,  roles: ['ADMIN'] },
    ]
  }
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const filteredGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => item.roles.includes(user?.role))
  })).filter(group => group.items.length > 0);

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 rounded-xl p-2 shadow-lg shrink-0">
            <Store size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-base leading-tight">Vendora</h1>
            <p className="text-gray-500 text-[10px] leading-tight">Point of Sale</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-gray-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">
              {user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-semibold truncate">{user?.fullName}</p>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${roleColor[user?.role] || 'bg-gray-600 text-white'}`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {filteredGroups.map(group => (
          <div key={group.label}>
            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest px-2 mb-1.5">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;
                return (
                  <Link key={to} to={to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all group ${
                      active
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}>
                    <Icon size={15} className="shrink-0" />
                    <span className="flex-1">{label}</span>
                    {active && <ChevronRight size={12} className="opacity-60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 pt-2 border-t border-gray-700/50 space-y-0.5">
        <button onClick={toggle}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition">
          {dark ? <Sun size={15} /> : <Moon size={15} />}
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition">
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 bg-gray-900 flex-col shrink-0 border-r border-gray-800">
        <NavContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-gray-900 flex flex-col h-full z-10 shadow-2xl">
            <button onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800">
              <X size={18} />
            </button>
            <NavContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shrink-0 shadow-sm">
          <button onClick={() => setMobileOpen(true)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-1.5">
              <Store size={16} className="text-white" />
            </div>
            <span className="font-black text-gray-900 dark:text-white text-sm">Vendora</span>
          </div>
          <button onClick={toggle}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
