import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Store, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    inviteCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showRegisterPass, setShowRegisterPass] = useState(false);
  const [hasUsers, setHasUsers] = useState(true);
  const [signupEnabled, setSignupEnabled] = useState(true);
  const [mode, setMode] = useState('signin');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const { data } = await api.get('/auth/status');
        setHasUsers(Boolean(data?.hasUsers));
        setSignupEnabled(data?.publicSignupEnabled !== false);
      } catch {
        setHasUsers(true);
        setSignupEnabled(true);
      }
    };
    loadStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(
        { id: data.id, fullName: data.fullName, role: data.role },
        data.token,
        data.refreshToken
      );
      navigate(data.role === 'CASHIER' ? '/cashier' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerForm.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        username: registerForm.username.trim(),
        fullName: registerForm.fullName.trim(),
        password: registerForm.password,
        inviteCode: registerForm.inviteCode.trim(),
      });
      toast.success(data?.message || 'Account created. Sign in now.');
      setForm({ username: registerForm.username.trim(), password: '' });
      setRegisterForm({ username: '', fullName: '', password: '', confirmPassword: '', inviteCode: '' });
      setMode('signin');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Account creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-blue-600 rounded-2xl p-4 mb-4 shadow-lg">
            <Store size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Vendora</h1>
          <p className="text-gray-400 mt-1">Smart Point of Sale Management</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                  mode === 'signin' ? 'bg-white shadow text-gray-800' : 'text-gray-500'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('create')}
                disabled={!signupEnabled}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                  mode === 'create' ? 'bg-white shadow text-gray-800' : 'text-gray-500'
                } disabled:opacity-50`}
              >
                Create Account
              </button>
            </div>
          </div>

          {mode === 'signin' ? (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Sign in to your account</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                  <input
                    type="text"
                    autoFocus
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Enter your username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition active:scale-95 mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Signing in...
                    </span>
                  ) : 'Sign In'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Create your account</h2>
              <p className="text-xs text-gray-500 mb-5">
                New here? Register, then sign in to continue.
              </p>
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
                    value={registerForm.fullName}
                    onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Invite Code</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm uppercase"
                    value={registerForm.inviteCode}
                    onChange={(e) => setRegisterForm({ ...registerForm, inviteCode: e.target.value })}
                    placeholder={hasUsers ? 'ABCD-1234' : 'Optional for first account'}
                    required={hasUsers}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {hasUsers
                      ? 'Enter invite code provided by an administrator.'
                      : 'No users found: this first account will be created as Admin.'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showRegisterPass ? 'text' : 'password'}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 pr-10 text-sm"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPass(!showRegisterPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showRegisterPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-xs text-gray-400 mt-6">
            {signupEnabled
              ? 'Need access as manager/admin? Ask your administrator to update your role.'
              : 'Account creation is disabled. Contact your administrator.'}
          </p>
        </div>
      </div>
    </div>
  );
}
