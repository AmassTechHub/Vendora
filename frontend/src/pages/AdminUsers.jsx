import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Copy, Plus, ToggleLeft, ToggleRight, Users, Ticket, RefreshCcw, X, Check } from 'lucide-react';

const ROLE_COLORS = {
  ADMIN:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  MANAGER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CASHIER: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

const inputClass = "w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
const selectClass = `${inputClass} cursor-pointer`;

export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState({ username: '', password: '', fullName: '', role: 'CASHIER' });
  const [inviteForm, setInviteForm] = useState({ role: 'CASHIER', expiresInHours: 24 });
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [usersRes, invitesRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/invites'),
      ]);
      setUsers(usersRes.data || []);
      setInvites(invitesRes.data || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load data');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', form);
      toast.success('User created successfully');
      setForm({ username: '', password: '', fullName: '', role: 'CASHIER' });
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create user');
    }
  };

  const toggleActive = async (id) => {
    try {
      await api.put(`/admin/users/${id}/toggle`);
      load();
    } catch { toast.error('Failed to update user'); }
  };

  const generateInvite = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const { data } = await api.post('/admin/invites', {
        role: inviteForm.role,
        expiresInHours: Number(inviteForm.expiresInHours),
      });
      toast.success(`Invite code: ${data.code}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate invite code');
    } finally { setGenerating(false); }
  };

  const copyCode = async (id, code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch { toast.error('Copy failed'); }
  };

  const inviteStatus = (invite) => {
    if (invite.used) return 'Used';
    if (new Date(invite.expiresAt) < new Date()) return 'Expired';
    return 'Active';
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">User Management</h2>
          <p className="text-sm text-gray-500">Manage team members and invite codes</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
            <RefreshCcw size={15} className="dark:text-white" />
          </button>
          <button onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold transition">
            <Plus size={15} /> Add User
          </button>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b dark:border-gray-700 flex items-center gap-2">
          <Users size={15} className="text-blue-600" />
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Team Members</h3>
          <span className="ml-auto text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full font-semibold">
            {users.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase text-xs">
              <tr>
                {['Full Name', 'Username', 'Role', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No users found</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                  <td className="px-4 py-3 font-semibold dark:text-white">{u.fullName}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{u.username}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${ROLE_COLORS[u.role] || ''}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                      u.active
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {u.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(u.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition">
                      {u.active
                        ? <ToggleRight size={20} className="text-green-500" />
                        : <ToggleLeft size={20} className="text-gray-400" />}
                      {u.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite codes */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b dark:border-gray-700 flex items-center gap-2">
          <Ticket size={15} className="text-emerald-600" />
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Invite Codes</h3>
        </div>

        {/* Generate form */}
        <div className="px-5 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Generate New Invite</p>
          <form onSubmit={generateInvite} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[140px]">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Role</label>
              <select className={selectClass} value={inviteForm.role}
                onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}>
                <option value="CASHIER">Cashier</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Expires in (hours)</label>
              <input type="number" min="1" max="168" className={inputClass}
                value={inviteForm.expiresInHours}
                onChange={e => setInviteForm({ ...inviteForm, expiresInHours: e.target.value })} />
            </div>
            <button type="submit" disabled={generating}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2">
              <Ticket size={14} />
              {generating ? 'Generating...' : 'Generate Code'}
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-2">Share the generated code with the new team member — they'll use it when creating their account.</p>
        </div>

        {/* Invites table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase text-xs">
              <tr>
                {['Code', 'Role', 'Expires', 'Status', 'Used By', 'Copy'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {invites.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No invite codes yet — generate one above</td></tr>
              ) : invites.map(invite => {
                const status = inviteStatus(invite);
                return (
                  <tr key={invite.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    <td className="px-4 py-3 font-mono font-bold text-gray-900 dark:text-white tracking-widest text-xs">{invite.code}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${ROLE_COLORS[invite.role] || ''}`}>{invite.role}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                      {new Date(invite.expiresAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                        status === 'Active'  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        status === 'Used'    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                              'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                      }`}>{status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{invite.usedByUsername || '—'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => copyCode(invite.id, invite.code)}
                        disabled={status !== 'Active'}
                        className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:text-gray-300 dark:disabled:text-gray-600 transition">
                        {copiedId === invite.id ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                        {copiedId === invite.id ? 'Copied!' : 'Copy'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create user modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-[100] flex justify-center overflow-y-auto bg-black/60 p-4 sm:py-8"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
        >
          <div
            className="my-auto w-full max-w-md min-h-0 max-h-[min(90dvh,920px)] overflow-y-auto overscroll-contain rounded-2xl border bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Create User</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">Full Name</label>
                <input required className={inputClass} placeholder="John Doe"
                  value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">Username</label>
                <input required className={inputClass} placeholder="johndoe"
                  value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">Password</label>
                <input required type="password" className={inputClass} placeholder="Min. 8 characters"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">Role</label>
                <select className={selectClass} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="CASHIER">Cashier</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold text-sm transition">
                  Create User
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white py-2.5 rounded-xl font-semibold text-sm transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
