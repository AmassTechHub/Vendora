import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Account() {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    username: '',
    role: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setProfileForm({
          fullName: data.fullName || '',
          username: data.username || '',
          role: data.role || '',
        });
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to load account info');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const submitProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }
    try {
      setSavingProfile(true);
      const { data } = await api.put('/auth/profile', { fullName: profileForm.fullName.trim() });
      updateUser({ id: data.id, fullName: data.fullName, role: data.role });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setSavingPassword(true);
      await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading account...</div>;
  }

  return (
    <div className="max-w-3xl space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">My Account</h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Profile</h3>
          <form onSubmit={submitProfile} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Full Name</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Username</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 mt-1 bg-gray-50 text-gray-500"
                value={profileForm.username}
                disabled
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Role</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 mt-1 bg-gray-50 text-gray-500"
                value={profileForm.role}
                disabled
              />
            </div>
            <button
              type="submit"
              disabled={savingProfile}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Security</h3>
          <p className="text-xs text-gray-500 mb-3">
            Signed in as <span className="font-medium">{user?.fullName}</span>
          </p>
          <form onSubmit={submitPassword} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Current Password</label>
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">New Password</label>
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Confirm New Password</label>
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
              />
            </div>
            <button
              type="submit"
              disabled={savingPassword}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {savingPassword ? 'Saving...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
