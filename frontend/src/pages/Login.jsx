import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ShoppingCart, BarChart2, Users, Shield, Zap } from 'lucide-react';

const FEATURES = [
  { icon: ShoppingCart, text: 'Fast cashier with Paystack payments' },
  { icon: BarChart2,    text: 'Real-time sales & revenue analytics' },
  { icon: Users,        text: 'Customer & supplier management' },
  { icon: Shield,       text: 'Role-based access control' },
  { icon: Zap,          text: 'Shift tracking & cash reconciliation' },
];

export default function Login() {
  const [form, setForm]               = useState({ username: '', password: '' });
  const [regForm, setRegForm]         = useState({ username: '', fullName: '', password: '', confirmPassword: '', inviteCode: '' });
  const [loading, setLoading]         = useState(false);
  const [showPass, setShowPass]       = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [hasUsers, setHasUsers]       = useState(true);
  const [signupEnabled, setSignupEnabled] = useState(true);
  const [mode, setMode]               = useState('signin');
  const { login }                     = useAuth();
  const navigate                      = useNavigate();

  useEffect(() => {
    api.get('/auth/status').then(({ data }) => {
      setHasUsers(Boolean(data?.hasUsers));
      setSignupEnabled(data?.publicSignupEnabled !== false);
      if (!data?.hasUsers) setMode('create');
    }).catch(() => {});
  }, []);

  const handleSignIn = async (e) => {
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
    if (regForm.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (regForm.password !== regForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        username: regForm.username.trim(),
        fullName: regForm.fullName.trim(),
        password: regForm.password,
        inviteCode: regForm.inviteCode.trim() || undefined,
      });
      toast.success(data?.message || 'Account created. Sign in now.');
      setForm({ username: regForm.username.trim(), password: '' });
      setRegForm({ username: '', fullName: '', password: '', confirmPassword: '', inviteCode: '' });
      setMode('signin');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Account creation failed');
    } finally { setLoading(false); }
  };

  const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition";

  return (
    <div className="min-h-screen flex bg-white">

      {/* ── Left: Form ── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-[360px] mx-auto">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <p className="text-lg font-black text-gray-900 leading-none">Vendora</p>
              <p className="text-[11px] text-gray-400 leading-tight">Point of Sale</p>
            </div>
          </div>

          {/* Tab switcher */}
          {signupEnabled && (
            <div className="flex bg-gray-100 p-1 rounded-xl mb-7 gap-1">
              {[['signin', 'Sign In'], ['create', 'Create Account']].map(([m, label]) => (
                <button key={m} type="button" onClick={() => setMode(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    mode === m ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          )}

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-5">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Welcome back</h2>
                <p className="text-sm text-gray-400 mt-1">Sign in to your Vendora account</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Username</label>
                  <input type="text" autoFocus className={inp} placeholder="Enter your username"
                    value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} className={`${inp} pr-11`}
                      placeholder="Enter your password"
                      value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition active:scale-95 text-sm">
                {loading
                  ? <span className="flex items-center justify-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Signing in...</span>
                  : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Create account</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {!hasUsers ? 'You\'re setting up the first admin account.' : 'Use your invite code to join.'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Full Name</label>
                <input type="text" className={inp} placeholder="John Doe"
                  value={regForm.fullName} onChange={e => setRegForm({ ...regForm, fullName: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Username</label>
                <input type="text" className={inp} placeholder="johndoe"
                  value={regForm.username} onChange={e => setRegForm({ ...regForm, username: e.target.value })} required />
              </div>
              {hasUsers && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Invite Code</label>
                  <input type="text" className={`${inp} uppercase tracking-widest font-mono`}
                    placeholder="XXXX-XXXX"
                    value={regForm.inviteCode}
                    onChange={e => setRegForm({ ...regForm, inviteCode: e.target.value })} required />
                  <p className="text-xs text-gray-400 mt-1">Ask your admin for an invite code</p>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <input type={showRegPass ? 'text' : 'password'} className={`${inp} pr-11`}
                    placeholder="Min. 8 characters"
                    value={regForm.password} onChange={e => setRegForm({ ...regForm, password: e.target.value })} required />
                  <button type="button" onClick={() => setShowRegPass(!showRegPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                    {showRegPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                <input type="password" className={inp} placeholder="Repeat password"
                  value={regForm.confirmPassword} onChange={e => setRegForm({ ...regForm, confirmPassword: e.target.value })} required />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition text-sm">
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-gray-300 mt-8">Vendora POS · Secure & Role-Based Access</p>
        </div>
      </div>

      {/* ── Right: Branding panel ── */}
      <div className="hidden lg:flex w-[440px] bg-gray-950 flex-col justify-center p-14 relative overflow-hidden shrink-0">
        {/* Subtle glow */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-600 opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-600 opacity-10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="relative z-10">
          {/* Big logo mark */}
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-900">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>

          <h2 className="text-4xl font-black text-white mb-2 leading-tight">Vendora</h2>
          <p className="text-gray-400 text-sm mb-10 leading-relaxed">
            A complete point-of-sale system built for modern retail businesses in Ghana.
          </p>

          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-blue-400" />
                </div>
                <span className="text-sm text-gray-400">{text}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-white/5">
            <p className="text-xs text-gray-600">© 2026 Vendora POS</p>
          </div>
        </div>
      </div>
    </div>
  );
}
