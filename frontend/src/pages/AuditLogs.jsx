import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/admin/audit-logs');
        setLogs(data);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Audit Logs</h2>
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-4 text-sm text-gray-500">Loading audit logs...</p>
        ) : logs.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No audit logs yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                {['Time', 'User', 'Action', 'Resource', 'Status', 'IP'].map((h) => (
                  <th key={h} className="px-3 py-2 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-3 py-2 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-2">{log.username || 'anonymous'}</td>
                  <td className="px-3 py-2 font-medium">{log.action}</td>
                  <td className="px-3 py-2">{log.resourceType}{log.resourceId ? ` #${log.resourceId}` : ''}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-500">{log.ipAddress || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
