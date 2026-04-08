import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ShieldCheck, RefreshCcw } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/audit-logs');
      setLogs(data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load audit logs');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Audit Logs</h2>
          <p className="text-sm text-gray-500">Full record of all system actions</p>
        </div>
        <button onClick={load}
          className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
          <RefreshCcw size={15} className="dark:text-white" />
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-gray-400">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <ShieldCheck size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-400">No audit logs yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase text-xs">
                <tr>
                  {['Time', 'User', 'Action', 'Resource', 'Details', 'Status', 'IP'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium dark:text-white">{log.username || 'anonymous'}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-lg">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                      {log.resourceType}{log.resourceId ? ` #${log.resourceId}` : ''}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs max-w-[200px] truncate">
                      {log.details || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                        log.status === 'SUCCESS'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs font-mono">
                      {log.ipAddress || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
