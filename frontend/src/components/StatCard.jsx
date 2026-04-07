export default function StatCard({ label, value, icon: Icon, color, sub }) {
  const colors = {
    blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100',   text: 'text-blue-600'   },
    green:  { bg: 'bg-green-50',  icon: 'bg-green-100',  text: 'text-green-600'  },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-100', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-50', icon: 'bg-orange-100', text: 'text-orange-600' },
    red:    { bg: 'bg-red-50',    icon: 'bg-red-100',    text: 'text-red-600'    },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={`${c.bg} rounded-xl p-4 flex items-start gap-3 border border-white shadow-sm min-h-[110px]`}>
      <div className={`${c.icon} p-2.5 rounded-xl shrink-0`}>
        <Icon className={c.text} size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-gray-500 text-xs sm:text-sm leading-snug">{label}</p>
        <p className="text-xl xl:text-2xl font-bold text-gray-800 leading-tight wrap-break-word">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
