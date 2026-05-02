import { useState, useEffect } from 'react';
import { getMyTasks, updateTask } from '../../api/tasks';
import AppLayout from '../../components/Layout/AppLayout';
import Badge from '../../components/UI/Badge';
import Spinner from '../../components/UI/Spinner';
import { toast } from 'react-hot-toast';
import { format, isAfter } from 'date-fns';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

const MyTasks = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', priority: '', search: '', overdue: false });

  useEffect(() => {
    getMyTasks()
      .then(({ data }) => setData(data.data))
      .catch(() => toast.error('Failed to load tasks'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (task) => {
    const next = { todo: 'in-progress', 'in-progress': 'done', done: 'todo' };
    try {
      const { data: res } = await updateTask(task._id, { status: next[task.status] });
      setData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t._id === task._id ? res.data : t)),
      }));
      toast.success('Status updated');
    } catch { toast.error('Failed to update'); }
  };

  const filtered = (data?.tasks || []).filter((t) => {
    if (filter.status && t.status !== filter.status) return false;
    if (filter.priority && t.priority !== filter.priority) return false;
    if (filter.search && !t.title.toLowerCase().includes(filter.search.toLowerCase())) return false;
    if (filter.overdue) {
      if (!t.dueDate || t.status === 'done') return false;
      if (!isAfter(new Date(), new Date(t.dueDate))) return false;
    }
    return true;
  });

  if (loading) return <AppLayout><div className="flex justify-center items-center h-64"><Spinner size="lg" /></div></AppLayout>;

  const stats = data?.stats;

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">My Tasks</h1>
        <p className="text-slate-400 text-sm mt-1">All tasks assigned to you</p>
      </div>

      {/* Mini Stats */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          { label: 'Total', value: stats?.total || 0, color: 'bg-slate-700' },
          { label: 'Todo', value: stats?.todo || 0, color: 'bg-slate-600' },
          { label: 'In Progress', value: stats?.inProgress || 0, color: 'bg-blue-900/60 border border-blue-700/50' },
          { label: 'Done', value: stats?.done || 0, color: 'bg-emerald-900/60 border border-emerald-700/50' },
          { label: 'Overdue', value: stats?.overdue || 0, color: 'bg-red-900/60 border border-red-700/50' },
        ].map((s) => (
          <div key={s.label} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm ${s.color}`}>
            <span className="text-slate-300">{s.label}</span>
            <span className="font-bold text-white">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            placeholder="Search tasks..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Status</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select
          value={filter.priority}
          onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button
          onClick={() => setFilter({ ...filter, overdue: !filter.overdue })}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            filter.overdue
              ? 'bg-red-600 text-white'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          Overdue Only
        </button>
      </div>

      {/* Task List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <ClipboardDocumentListIcon className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No tasks found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => {
            const overdue = task.dueDate && task.status !== 'done' && isAfter(new Date(), new Date(task.dueDate));
            return (
              <div
                key={task._id}
                className={`bg-slate-900 border rounded-2xl p-4 flex items-start gap-4 hover:border-slate-600 transition-all ${
                  overdue ? 'border-red-800/50' : 'border-slate-800'
                }`}
              >
                <button
                  onClick={() => handleStatusUpdate(task)}
                  className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all cursor-pointer hover:scale-110 ${
                    task.status === 'done'
                      ? 'bg-emerald-500 border-emerald-500'
                      : task.status === 'in-progress'
                      ? 'border-blue-400 bg-blue-400/20'
                      : 'border-slate-500 hover:border-slate-400'
                  }`}
                  title="Click to cycle status"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    {task.project?.color && (
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: task.project.color }} />
                    )}
                    <div className="min-w-0">
                      <p className={`font-medium ${task.status === 'done' ? 'line-through text-slate-500' : 'text-white'}`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">{task.project?.name}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                  <Badge type="priority" value={task.priority} />
                  <Badge type="status" value={task.status} />
                  {overdue && <Badge type="overdue" value="overdue" />}
                  {task.dueDate && (
                    <span className={`text-xs ${overdue ? 'text-red-400' : 'text-slate-500'}`}>
                      {format(new Date(task.dueDate), 'MMM d')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
};

export default MyTasks;
