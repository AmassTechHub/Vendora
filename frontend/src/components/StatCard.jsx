export default function StatCard({ label, value, icon: Icon, color, sub }) {
  const colors = {
    blue:   { bg: 'bg-blue-600',   light: 'bg-blue-50 dark:bg-gray-800' },
    green:  { bg: 'bg-emerald-600', light: 'bg-emerald-50 dark:bg-gray-800' },
    purple: { bg: 'bg-violet-600',  light: 'bg-violet-50 dark:bg-gray-800' },
    orange: { bg: 'bg-orange-500',  light: 'bg-orange-50 dark:bg-gray-800' },
    red:    { bg: 'bg-red-500',     light: 'bg-red-50 dark:bg-gray-800' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={`${c.light} rounded-2xl p-5 flex items-center gap-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow`}>
      <div className={`${c.bg} p-3 rounded-xl shrink-0 shadow-sm`}>
        <Icon className="text-white" size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-black text-gray-900 dark:text-white leading-tight mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
