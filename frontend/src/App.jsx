import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cashier from './pages/Cashier';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import AdminUsers from './pages/AdminUsers';
import Account from './pages/Account';
import AuditLogs from './pages/AuditLogs';
import Sales from './pages/Sales';
import Expenses from './pages/Expenses';
import Refunds from './pages/Refunds';
import Suppliers from './pages/Suppliers';
import Shifts from './pages/Shifts';
import Settings from './pages/Settings';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/cashier" />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'CASHIER' ? '/cashier' : '/dashboard'} /> : <Login />} />
      <Route path="/dashboard"       element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><Dashboard /></ProtectedRoute>} />
      <Route path="/cashier"         element={<ProtectedRoute><Cashier /></ProtectedRoute>} />
      <Route path="/sales"           element={<ProtectedRoute><Sales /></ProtectedRoute>} />
      <Route path="/shifts"          element={<ProtectedRoute><Shifts /></ProtectedRoute>} />
      <Route path="/products"        element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><Products /></ProtectedRoute>} />
      <Route path="/suppliers"       element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><Suppliers /></ProtectedRoute>} />
      <Route path="/customers"       element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><Customers /></ProtectedRoute>} />
      <Route path="/refunds"         element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><Refunds /></ProtectedRoute>} />
      <Route path="/expenses"        element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><Expenses /></ProtectedRoute>} />
      <Route path="/reports"         element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><Reports /></ProtectedRoute>} />
      <Route path="/admin/users"     element={<ProtectedRoute roles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/audit-logs" element={<ProtectedRoute roles={['ADMIN']}><AuditLogs /></ProtectedRoute>} />
      <Route path="/account"         element={<ProtectedRoute><Account /></ProtectedRoute>} />
      <Route path="/settings"        element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><Settings /></ProtectedRoute>} />
      <Route path="*"                element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ className: 'dark:bg-gray-800 dark:text-white' }} />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
