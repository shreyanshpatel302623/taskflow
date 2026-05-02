const statusConfig = {
  todo: { label: 'Todo', className: 'bg-slate-700 text-slate-300' },
  'in-progress': { label: 'In Progress', className: 'bg-blue-900/60 text-blue-300 border border-blue-700/50' },
  done: { label: 'Done', className: 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' },
};

const priorityConfig = {
  low: { label: 'Low', className: 'bg-slate-700 text-slate-300' },
  medium: { label: 'Medium', className: 'bg-amber-900/60 text-amber-300 border border-amber-700/50' },
  high: { label: 'High', className: 'bg-red-900/60 text-red-300 border border-red-700/50' },
};

const roleConfig = {
  admin: { label: 'Admin', className: 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/50' },
  member: { label: 'Member', className: 'bg-slate-700 text-slate-300' },
};

const overdueConfig = {
  label: 'Overdue',
  className: 'bg-red-900/60 text-red-300 border border-red-700/50 animate-pulse',
};

const Badge = ({ type = 'status', value, className = '' }) => {
  let config;

  if (type === 'status') config = statusConfig[value] || { label: value, className: 'bg-slate-700 text-slate-300' };
  else if (type === 'priority') config = priorityConfig[value] || { label: value, className: 'bg-slate-700 text-slate-300' };
  else if (type === 'role') config = roleConfig[value] || { label: value, className: 'bg-slate-700 text-slate-300' };
  else if (type === 'overdue') config = overdueConfig;
  else config = { label: value, className: 'bg-slate-700 text-slate-300' };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
};

export default Badge;
