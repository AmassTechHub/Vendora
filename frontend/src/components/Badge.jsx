const variants = {
  green:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  red:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  blue:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  gray:   'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

export default function Badge({ label, color = 'gray' }) {
  return (
    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${variants[color] || variants.gray}`}>
      {label}
    </span>
  );
}
