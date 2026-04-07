import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Copy, Plus, ToggleLeft, ToggleRight } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', fullName: '', role: 'CASHIER' });
  const [inviteForm, setInviteForm] = useState({ role: 'CASHIER', expiresInHours: 24 });
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const [usersRes, invitesRes] = await Promise.all([
      api.get('/admin/users'),
      api.get('/admin/invites'),
    ]);
    setUsers(usersRes.data);
    setInvites(invitesRes.data);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', form);
      toast.success('User created');
      setForm({ username: '', password: '', fullName: '', role: 'CASHIER' });
      setShowForm(false); load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create user');
    }
  };

  const toggleActive = async (id) => {
    await api.put(`/admin/users/${id}/toggle`);
    load();
  };

  const createInvite = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/admin/invites', inviteForm);
      toast.success(`Invite code created: ${data.code}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create invite');
    }
  };

  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code);
    toast.success('Invite code copied');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <button onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Plus size={18} /> Add User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              {['ID', 'Full Name', 'Username', 'Role', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map(u => (
              <tr key={u.id}>
                <td className="px-4 py-3 text-gray-500">{u.id}</td>
                <td className="px-4 py-3 font-medium">{u.fullName}</td>
                <td className="px-4 py-3">{u.username}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    u.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                    u.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>{u.role}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${u.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {u.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(u.id)} className="text-gray-600 hover:text-gray-800">
                    {u.active ? <ToggleRight size={20} className="text-green-600" /> : <ToggleLeft size={20} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-lg border shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Invite Codes</h3>
        </div>
        <form onSubmit={createInvite} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            className="border rounded-lg px-3 py-2"
            value={inviteForm.role}
            onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
          >
            <option value="CASHIER">Cashier</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
          <input
            type="number"
            min="1"
            max="168"
            className="border rounded-lg px-3 py-2"
            value={inviteForm.expiresInHours}
            onChange={(e) => setInviteForm({ ...inviteForm, expiresInHours: Number(e.target.value) })}
            placeholder="Expires (hours)"
          />
          <button type="submit" className="bg-emerald-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-emerald-700">
            Generate Invite
          </button>
          <p className="text-xs text-gray-500 self-center">
            Share code with first-time users to create account.
          </p>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                {['Code', 'Role', 'Expires', 'Status', 'Used By', 'Actions'].map((h) => (
                  <th key={h} className="px-3 py-2 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {invites.map((invite) => {
                const expired = new Date(invite.expiresAt) < new Date();
                const status = invite.used ? 'Used' : (expired ? 'Expired' : 'Active');
                return (
                  <tr key={invite.id}>
                    <td className="px-3 py-2 font-mono font-semibold">{invite.code}</td>
                    <td className="px-3 py-2">{invite.role}</td>
                    <td className="px-3 py-2 text-gray-500">{new Date(invite.expiresAt).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        status === 'Active' ? 'bg-green-100 text-green-700' :
                        status === 'Used' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-500">{invite.usedByUsername || '-'}</td>
                    <td className="px-3 py-2">
                      <button
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                        onClick={() => copyCode(invite.code)}
                        disabled={status !== 'Active'}
                      >
                        <Copy size={14} /> Copy
                      </button>
                    </td>
                  </tr>
                );
              })}
              {invites.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-gray-500 text-sm" colSpan={6}>No invite codes yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-4">Create User</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {[['fullName', 'Full Name'], ['username', 'Username'], ['password', 'Password']].map(([key, label]) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-600">{label}</label>
                  <input required type={key === 'password' ? 'password' : 'text'}
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium text-gray-600">Role</label>
                <select className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="CASHIER">Cashier</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold">Create</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-200 py-2 rounded-lg font-semibold">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
