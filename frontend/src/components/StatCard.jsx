export default function StatCard({ label, value, icon: Icon, color, sub }) {
  const colors = {
    blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',   icon: 'bg-blue-600',   text: 'text-white', border: 'border-blue-100 dark:border-blue-800' },
    green:  { bg: 'bg-green-50 dark:bg-green-900/20',  icon: 'bg-green-600',  text: 'text-white', border: 'border-green-100 dark:border-green-800' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'bg-purple-600', text: 'text-white', border: 'border-purple-100 dark:border-purple-800' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', icon: 'bg-orange-500', text: 'text-white', border: 'border-orange-100 dark:border-orange-800' },
    red:    { bg: 'bg-red-50 dark:bg-red-900/20',    icon: 'bg-red-500',    text: 'text-white', border: 'border-red-100 dark:border-red-800' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={`${c.bg} rounded-2xl p-5 flex items-start gap-4 border ${c.border} shadow-sm hover:shadow-md transition-shadow`}>
      <div className={`${c.icon} p-3 rounded-xl shrink-0 shadow-sm`}>
        <Icon className={c.text} size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-black text-gray-900 dark:text-white leading-tight mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}
