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

const roleColors = {
  ADMIN: 'bg-red-500',
  MANAGER: 'bg-blue-500',
  CASHIER: 'bg-emerald-500'
};

const navItems = [
  { to: '/dashboard',        label: 'Dashboard',    icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER'] },
  { to: '/cashier',          label: 'Cashier',       icon: ShoppingCart,    roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { to: '/sales',            label: 'Sales',         icon: ReceiptText,     roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { to: '/shifts',           label: 'Shifts',        icon: Clock,           roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { to: '/products',         label: 'Products',      icon: Package,         roles: ['ADMIN', 'MANAGER'] },
  { to: '/suppliers',        label: 'Suppliers',     icon: Truck,           roles: ['ADMIN', 'MANAGER'] },
  { to: '/customers',        label: 'Customers',     icon: Users,           roles: ['ADMIN', 'MANAGER'] },
  { to: '/refunds',          label: 'Refunds',       icon: RotateCcw,       roles: ['ADMIN', 'MANAGER'] },
  { to: '/expenses',         label: 'Expenses',      icon: TrendingDown,    roles: ['ADMIN', 'MANAGER'] },
  { to: '/reports',          label: 'Reports',       icon: BarChart2,       roles: ['ADMIN', 'MANAGER'] },
  { to: '/account',          label: 'My Account',    icon: UserCircle2,     roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { to: '/admin/users',      label: 'Users',         icon: Settings,        roles: ['ADMIN'] },
  { to: '/admin/audit-logs', label: 'Audit Logs',    icon: ShieldCheck,     roles: ['ADMIN'] },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const filtered = navItems.filter(i => i.roles.includes(user?.role));
  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const NavContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-700/50 shrink-0">
        <div className="bg-blue-600 rounded-xl p-2 shrink-0">
          <Store size={18} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-white font-black text-sm leading-tight">Vendora</p>
          <p className="text-gray-500 text-[10px]">Point of Sale</p>
        </div>
      </div>

      {/* User */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-700/50 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <span className="text-white text-[10px] font-bold">{initials}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white text-xs font-semibold truncate leading-tight">{user?.fullName}</p>
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold text-white ${roleColors[user?.role] || 'bg-gray-600'}`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Nav — scrollable */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 min-h-0">
        {filtered.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}>
              <Icon size={15} className="shrink-0" />
              <span className="flex-1 truncate">{label}</span>
              {active && <ChevronRight size={11} className="opacity-50 shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-2 border-t border-gray-700/50 space-y-0.5 shrink-0">
        <button onClick={toggle}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition">
          {dark ? <Sun size={14} /> : <Moon size={14} />}
          <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition">
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-52 bg-gray-900 flex-col shrink-0">
        <NavContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-56 bg-gray-900 flex flex-col h-full z-10 shadow-2xl">
            <button onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white p-1 rounded z-10">
              <X size={16} />
            </button>
            <NavContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <button onClick={() => setMobileOpen(true)} className="text-gray-600 dark:text-gray-400 p-1">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-1.5">
              <Store size={15} className="text-white" />
            </div>
            <span className="font-black text-gray-900 dark:text-white text-sm">Vendora</span>
          </div>
          <button onClick={toggle} className="text-gray-600 dark:text-gray-400 p-1">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
