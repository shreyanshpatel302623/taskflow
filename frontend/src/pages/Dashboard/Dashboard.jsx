import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyTasks } from '../../api/tasks';
import { getProjects } from '../../api/projects';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/Layout/AppLayout';
import Badge from '../../components/UI/Badge';
import Spinner from '../../components/UI/Spinner';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  FolderIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { format, isAfter } from 'date-fns';

const CHART_COLORS = ['#64748b', '#3b82f6', '#10b981'];

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-start gap-4 hover:border-slate-700 transition-colors`}>
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-slate-400 text-sm font-medium">{label}</p>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [taskData, setTaskData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [taskRes, projRes] = await Promise.all([
          getMyTasks(),
          getProjects({ limit: 5 }),
        ]);
        setTaskData(taskRes.data.data);
        setProjects(projRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  const stats = taskData?.stats || {};
  const recentTasks = (taskData?.tasks || []).slice(0, 5);
  const chartData = [
    { name: 'Todo', value: stats.todo || 0 },
    { name: 'In Progress', value: stats.inProgress || 0 },
    { name: 'Done', value: stats.done || 0 },
  ].filter((d) => d.value > 0);

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          <span className="text-indigo-400">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-slate-400 mt-1">Here's what's on your plate today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={ClipboardDocumentListIcon}
          label="Total Tasks"
          value={stats.total || 0}
          color="bg-indigo-600"
          sub="assigned to you"
        />
        <StatCard
          icon={CheckCircleIcon}
          label="Completed"
          value={stats.done || 0}
          color="bg-emerald-600"
          sub={`${stats.total ? Math.round((stats.done / stats.total) * 100) : 0}% done`}
        />
        <StatCard
          icon={ExclamationTriangleIcon}
          label="Overdue"
          value={stats.overdue || 0}
          color="bg-red-600"
          sub="need attention"
        />
        <StatCard
          icon={ClockIcon}
          label="In Progress"
          value={stats.inProgress || 0}
          color="bg-blue-600"
          sub="currently active"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Task Status</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                  }}
                />
                <Legend
                  formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
              No tasks assigned yet
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">My Recent Tasks</h2>
            <Link
              to="/tasks"
              className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1 font-medium"
            >
              View all <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          {recentTasks.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
              No tasks assigned to you yet
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => {
                const overdue =
                  task.dueDate &&
                  task.status !== 'done' &&
                  isAfter(new Date(), new Date(task.dueDate));
                return (
                  <div
                    key={task._id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: task.project?.color || '#6366f1' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-slate-500' : 'text-white'}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{task.project?.name}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {overdue && <Badge type="overdue" value="overdue" />}
                      <Badge type="status" value={task.status} />
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
        </div>
      </div>

      {/* Projects Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FolderIcon className="w-5 h-5 text-indigo-400" />
            My Projects
          </h2>
          <Link
            to="/projects"
            className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1 font-medium"
          >
            View all <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        {projects.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No projects found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.slice(0, 6).map((project) => (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors border border-slate-700/50 hover:border-slate-600"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ backgroundColor: project.color + '30', color: project.color }}
                >
                  {project.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{project.name}</p>
                  <p className="text-xs text-slate-500">
                    {project.taskStats?.total || 0} tasks · {project.members?.length || 0} members
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
