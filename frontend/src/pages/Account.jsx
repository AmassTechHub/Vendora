import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { UserCircle2, Shield, Save } from 'lucide-react';

const inputClass = "w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white focus:bg-white transition";
const labelClass = "block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide";

const ROLE_COLORS = {
  ADMIN:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  MANAGER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CASHIER: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

export default function Account() {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ fullName: '', username: '', role: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      setProfileForm({ fullName: data.fullName || '', username: data.username || '', role: data.role || '' });
    }).catch(() => toast.error('Failed to load account'))
    .finally(() => setLoading(false));
  }, []);

  const submitProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.fullName.trim()) return toast.error('Full name is required');
    setSavingProfile(true);
    try {
      const { data } = await api.put('/auth/profile', { fullName: profileForm.fullName.trim() });
      updateUser({ id: data.id, fullName: data.fullName, role: data.role });
      toast.success('Profile updated');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to update profile'); }
    finally { setSavingProfile(false); }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return toast.error('Passwords do not match');
    setSavingPassword(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to change password'); }
    finally { setSavingPassword(false); }
  };

  if (loading) return <div className="text-sm text-gray-400 py-8 text-center">Loading...</div>;

  const initials = profileForm.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">My Account</h2>
        <p className="text-sm text-gray-500">Manage your profile and security settings</p>
      </div>

      {/* Avatar card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0">
          <span className="text-white text-xl font-black">{initials}</span>
        </div>
        <div>
          <p className="font-black text-gray-900 dark:text-white text-lg">{profileForm.fullName}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">@{profileForm.username}</p>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded-lg text-xs font-bold ${ROLE_COLORS[profileForm.role] || ''}`}>
            {profileForm.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Profile */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <UserCircle2 size={15} className="text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">Profile</h3>
          </div>
          <form onSubmit={submitProfile} className="space-y-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input className={inputClass} value={profileForm.fullName}
                onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })} required />
            </div>
            <div>
              <label className={labelClass}>Username</label>
              <input className={`${inputClass} opacity-60 cursor-not-allowed`} value={profileForm.username} disabled />
              <p className="text-xs text-gray-400 mt-1">Username cannot be changed</p>
            </div>
            <button type="submit" disabled={savingProfile}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2">
              <Save size={14} /> {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <Shield size={15} className="text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">Change Password</h3>
          </div>
          <form onSubmit={submitPassword} className="space-y-4">
            <div>
              <label className={labelClass}>Current Password</label>
              <input type="password" className={inputClass} value={passwordForm.currentPassword}
                onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
            </div>
            <div>
              <label className={labelClass}>New Password</label>
              <input type="password" className={inputClass} placeholder="Min. 8 characters"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required />
            </div>
            <div>
              <label className={labelClass}>Confirm New Password</label>
              <input type="password" className={inputClass} value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required />
            </div>
            <button type="submit" disabled={savingPassword}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2">
              <Shield size={14} /> {savingPassword ? 'Saving...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
