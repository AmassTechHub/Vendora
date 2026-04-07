import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Store, Eye, EyeOff, ShoppingCart, BarChart2, Users, Shield } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '', fullName: '', password: '', confirmPassword: '', inviteCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showRegisterPass, setShowRegisterPass] = useState(false);
  const [hasUsers, setHasUsers] = useState(true);
  const [signupEnabled, setSignupEnabled] = useState(true);
  const [mode, setMode] = useState('signin');
  const [backendStatus, setBackendStatus] = useState('checking');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/auth/status').then(({ data }) => {
      setHasUsers(Boolean(data?.hasUsers));
      setSignupEnabled(data?.publicSignupEnabled !== false);
      setBackendStatus('online');
    }).catch((err) => {
      console.error('Backend unreachable:', err.message);
      setBackendStatus('offline');
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login({ id: data.id, fullName: data.fullName, role: data.role }, data.token, data.refreshToken);
      navigate(data.role === 'CASHIER' ? '/cashier' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid username or password');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerForm.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (registerForm.password !== registerForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        username: registerForm.username.trim(),
        fullName: registerForm.fullName.trim(),
        password: registerForm.password,
        inviteCode: registerForm.inviteCode.trim() || undefined,
      });
      toast.success(data?.message || 'Account created. Sign in now.');
      setForm({ username: registerForm.username.trim(), password: '' });
      setRegisterForm({ username: '', fullName: '', password: '', confirmPassword: '', inviteCode: '' });
      setMode('signin');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Account creation failed';
      toast.error(msg);
      console.error('Register error:', err.response?.data || err.message);
    } finally { setLoading(false); }
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50 focus:bg-white";

  return (
    <div className="min-h-screen flex">
      {/* Left — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-600 rounded-2xl p-2.5 shadow-lg">
              <Store size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">Vendora</h1>
              <p className="text-xs text-gray-400">Point of Sale</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
            {['signin', 'create'].map(m => (
              <button key={m} type="button" onClick={() => setMode(m)}
                disabled={m === 'create' && !signupEnabled}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === m ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                } disabled:opacity-40`}>
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {mode === 'signin' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
                <p className="text-sm text-gray-500 mb-5">Sign in to your account</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                <input type="text" autoFocus className={inputClass} placeholder="Enter your username"
                  value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} className={`${inputClass} pr-10`}
                    placeholder="Enter your password"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition active:scale-95">
                {loading ? <span className="flex items-center justify-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Signing in...</span> : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Create account</h2>
                <p className="text-sm text-gray-500 mb-4">
                  {!hasUsers ? '🎉 You\'re the first user — you\'ll be ADMIN.' : 'Enter your invite code to register.'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input type="text" className={inputClass} placeholder="John Doe"
                  value={registerForm.fullName} onChange={e => setRegisterForm({ ...registerForm, fullName: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                <input type="text" className={inputClass} placeholder="johndoe"
                  value={registerForm.username} onChange={e => setRegisterForm({ ...registerForm, username: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Invite Code {!hasUsers && <span className="text-gray-400 font-normal">(not needed for first account)</span>}
                </label>
                <input type="text" className={`${inputClass} uppercase tracking-widest`}
                  placeholder={hasUsers ? 'ABCD-1234' : 'Leave blank'}
                  value={registerForm.inviteCode}
                  onChange={e => setRegisterForm({ ...registerForm, inviteCode: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showRegisterPass ? 'text' : 'password'} className={`${inputClass} pr-10`}
                    placeholder="Min. 8 characters"
                    value={registerForm.password} onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })} required />
                  <button type="button" onClick={() => setShowRegisterPass(!showRegisterPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showRegisterPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                <input type="password" className={inputClass} placeholder="Repeat password"
                  value={registerForm.confirmPassword} onChange={e => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })} required />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 transition">
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-gray-400 mt-6">
            Vendora POS · Secure & Role-Based Access
          </p>
        </div>
      </div>

      {/* Right — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[420px] bg-gray-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-indigo-500 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center">
          <div className="bg-blue-600 rounded-3xl p-5 inline-flex mb-6 shadow-2xl">
            <Store size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Vendora</h2>
          <p className="text-gray-400 text-sm mb-10">Smart Point of Sale Management</p>
          <div className="space-y-3 text-left">
            {[
              { icon: ShoppingCart, text: 'Fast cashier with Paystack payments' },
              { icon: BarChart2, text: 'Real-time sales analytics' },
              { icon: Users, text: 'Customer & supplier management' },
              { icon: Shield, text: 'Role-based access control' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                <Icon size={16} className="text-blue-400 shrink-0" />
                <span className="text-sm text-gray-300">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
