import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  ShoppingCart, Package, Users, BarChart2, Settings, LogOut,
  LayoutDashboard, Store, UserCircle2, ShieldCheck, ReceiptText,
  TrendingDown, RotateCcw, Truck, Clock, Sun, Moon, Menu, X
} from 'lucide-react';

const roleColor = { ADMIN: 'bg-red-500', MANAGER: 'bg-blue-500', CASHIER: 'bg-green-500' };

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/dashboard',      label: 'Dashboard',   icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER'] },
    { to: '/cashier',        label: 'Cashier',      icon: ShoppingCart,    roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { to: '/sales',          label: 'Sales',        icon: ReceiptText,     roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { to: '/shifts',         label: 'Shifts',       icon: Clock,           roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { to: '/products',       label: 'Products',     icon: Package,         roles: ['ADMIN', 'MANAGER'] },
    { to: '/suppliers',      label: 'Suppliers',    icon: Truck,           roles: ['ADMIN', 'MANAGER'] },
    { to: '/customers',      label: 'Customers',    icon: Users,           roles: ['ADMIN', 'MANAGER'] },
    { to: '/refunds',        label: 'Refunds',      icon: RotateCcw,       roles: ['ADMIN', 'MANAGER'] },
    { to: '/expenses',       label: 'Expenses',     icon: TrendingDown,    roles: ['ADMIN', 'MANAGER'] },
    { to: '/reports',        label: 'Reports',      icon: BarChart2,       roles: ['ADMIN', 'MANAGER'] },
    { to: '/account',        label: 'My Account',   icon: UserCircle2,     roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { to: '/admin/users',    label: 'Users',        icon: Settings,        roles: ['ADMIN'] },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: ShieldCheck,     roles: ['ADMIN'] },
  ].filter(item => item.roles.includes(user?.role));

  const NavContent = () => (
    <>
      {/* Brand */}
      <div className="px-4 py-4 border-b border-gray-700/60">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Store size={18} />
          </div>
          <span className="font-bold text-base tracking-tight">Vendora</span>
        </div>
        <div className="bg-gray-800 rounded-lg px-3 py-2">
          <p className="text-white text-sm font-medium truncate">{user?.fullName}</p>
          <span className={`text-xs px-1.5 py-0.5 rounded mt-0.5 inline-block text-white ${roleColor[user?.role] || 'bg-gray-600'}`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}>
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 pb-4 space-y-1 border-t border-gray-700/60 pt-3">
        <button onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition">
          {dark ? <Sun size={16} /> : <Moon size={16} />}
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 bg-gray-900 text-white flex-col shrink-0">
        <NavContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-gray-900 text-white flex flex-col h-full z-10">
            <button onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white p-1">
              <X size={20} />
            </button>
            <NavContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b dark:border-gray-700 shrink-0">
          <button onClick={() => setMobileOpen(true)} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1 rounded-lg">
              <Store size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">Vendora</span>
          </div>
          <button onClick={toggle} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
