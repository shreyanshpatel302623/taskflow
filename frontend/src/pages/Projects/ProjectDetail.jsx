import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById, updateProject, addMember, removeMember } from '../../api/projects';
import { getTasks, createTask, updateTask, deleteTask } from '../../api/tasks';
import { getAllUsers } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/Layout/AppLayout';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import Spinner from '../../components/UI/Spinner';
import { toast } from 'react-hot-toast';
import { format, isAfter } from 'date-fns';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  UserPlusIcon,
  UserMinusIcon,
  ChevronLeftIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

const TaskCard = ({ task, onUpdate, onDelete, isAdmin, currentUserId }) => {
  const isAssigned = task.assignedTo?._id === currentUserId;
  const canEdit = isAdmin || isAssigned;
  const overdue = task.dueDate && task.status !== 'done' && isAfter(new Date(), new Date(task.dueDate));

  const cycleStatus = async () => {
    if (!canEdit) return;
    const next = { todo: 'in-progress', 'in-progress': 'done', done: 'todo' };
    try {
      const { data } = await updateTask(task._id, { status: next[task.status] });
      onUpdate(data.data);
      toast.success('Status updated');
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className={`bg-slate-800/60 border rounded-xl p-4 hover:border-slate-600 transition-all ${overdue ? 'border-red-800/50' : 'border-slate-700/50'}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={cycleStatus}
          disabled={!canEdit}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
            task.status === 'done'
              ? 'bg-emerald-500 border-emerald-500'
              : task.status === 'in-progress'
              ? 'border-blue-400 bg-blue-400/20'
              : 'border-slate-500'
          } ${canEdit ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
          title="Click to cycle status"
        />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-slate-500' : 'text-white'}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge type="priority" value={task.priority} />
            {overdue && <Badge type="overdue" value="overdue" />}
            {task.dueDate && (
              <span className={`text-xs flex items-center gap-1 ${overdue ? 'text-red-400' : 'text-slate-500'}`}>
                Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
              </span>
            )}
            {task.assignedTo && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-indigo-600 inline-flex items-center justify-center text-white text-[9px] font-bold">
                  {task.assignedTo.name?.charAt(0)}
                </span>
                {task.assignedTo.name}
              </span>
            )}
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-1 flex-shrink-0">
            <button onClick={() => onUpdate(task, 'edit')} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700">
              <PencilIcon className="w-4 h-4" />
            </button>
            {isAdmin && (
              <button onClick={() => onDelete(task)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30">
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState({ status: '', priority: '', search: '' });

  const [taskModal, setTaskModal] = useState({ open: false, task: null });
  const [deleteModal, setDeleteModal] = useState(null);
  const [memberModal, setMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', assignedTo: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        getProjectById(id),
        getTasks({ project: id }),
      ]);
      setProject(projRes.data.data);
      setTasks(taskRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [id]);

  useEffect(() => {
    if (isAdmin && memberModal) {
      getAllUsers().then(({ data }) => setUsers(data.data || [])).catch(() => {});
    }
  }, [isAdmin, memberModal]);

  const filteredTasks = tasks.filter((t) => {
    if (filter.status && t.status !== filter.status) return false;
    if (filter.priority && t.priority !== filter.priority) return false;
    if (filter.search && !t.title.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  const grouped = {
    todo: filteredTasks.filter((t) => t.status === 'todo'),
    'in-progress': filteredTasks.filter((t) => t.status === 'in-progress'),
    done: filteredTasks.filter((t) => t.status === 'done'),
  };

  const openCreateTask = () => {
    setTaskForm({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', assignedTo: '' });
    setTaskModal({ open: true, task: null });
  };

  const openEditTask = (task) => {
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assignedTo: task.assignedTo?._id || '',
    });
    setTaskModal({ open: true, task });
  };

  const handleTaskUpdate = (taskOrData, action) => {
    if (action === 'edit') { openEditTask(taskOrData); return; }
    setTasks((prev) => prev.map((t) => (t._id === taskOrData._id ? taskOrData : t)));
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...taskForm, project: id };
      if (!payload.dueDate) delete payload.dueDate;
      if (!payload.assignedTo) delete payload.assignedTo;

      if (taskModal.task) {
        const { data } = await updateTask(taskModal.task._id, payload);
        setTasks((prev) => prev.map((t) => (t._id === taskModal.task._id ? data.data : t)));
        toast.success('Task updated');
      } else {
        const { data } = await createTask(payload);
        setTasks((prev) => [data.data, ...prev]);
        toast.success('Task created');
      }
      setTaskModal({ open: false, task: null });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally { setSubmitting(false); }
  };

  const handleDeleteTask = async () => {
    try {
      await deleteTask(deleteModal._id);
      setTasks((prev) => prev.filter((t) => t._id !== deleteModal._id));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete task'); }
    finally { setDeleteModal(null); }
  };

  const handleAddMember = async (userId) => {
    try {
      await addMember(id, userId);
      await loadData();
      toast.success('Member added');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add member'); }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await removeMember(id, userId);
      await loadData();
      toast.success('Member removed');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to remove member'); }
  };

  if (loading) return <AppLayout><div className="flex items-center justify-center h-64"><Spinner size="lg" /></div></AppLayout>;

  const statusColumns = [
    { key: 'todo', label: 'To Do', color: 'bg-slate-500' },
    { key: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
    { key: 'done', label: 'Done', color: 'bg-emerald-500' },
  ];

  const nonMembers = users.filter((u) => !project.members?.some((m) => m._id === u._id));

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <button onClick={() => navigate('/projects')} className="mt-1 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{ backgroundColor: project.color + '25', color: project.color }}>
              {project.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              {project.description && <p className="text-slate-400 text-sm">{project.description}</p>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Button variant="ghost" size="sm" onClick={() => setMemberModal(true)}>
                <UserPlusIcon className="w-4 h-4" /> Members
              </Button>
              <Button size="sm" onClick={openCreateTask}>
                <PlusIcon className="w-4 h-4" /> Add Task
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Members strip */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-xs text-slate-500 font-medium">Team:</span>
        {project.members?.map((m) => (
          <div key={m._id} className="flex items-center gap-1.5 bg-slate-800 rounded-full px-3 py-1">
            <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
              {m.name?.charAt(0)}
            </div>
            <span className="text-xs text-slate-300">{m.name}</span>
            <Badge type="role" value={m.role} className="text-[10px] px-1.5 py-0" />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <input
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            placeholder="Search tasks..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {statusColumns.map(({ key, label, color }) => (
          <div key={key} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
              <h3 className="font-semibold text-white text-sm">{label}</h3>
              <span className="ml-auto text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                {grouped[key]?.length || 0}
              </span>
            </div>
            <div className="space-y-3">
              {grouped[key]?.length === 0 ? (
                <p className="text-slate-600 text-xs text-center py-4">No tasks</p>
              ) : (
                grouped[key].map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onUpdate={handleTaskUpdate}
                    onDelete={setDeleteModal}
                    isAdmin={isAdmin}
                    currentUserId={user?._id}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal */}
      <Modal
        isOpen={taskModal.open}
        onClose={() => setTaskModal({ open: false, task: null })}
        title={taskModal.task ? 'Edit Task' : 'Create Task'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setTaskModal({ open: false, task: null })}>Cancel</Button>
            <Button form="task-form" type="submit" loading={submitting}>
              {taskModal.task ? 'Update' : 'Create'} Task
            </Button>
          </>
        }
      >
        <form id="task-form" onSubmit={handleSubmitTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Title *</label>
            <input
              required
              minLength={2}
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="What needs to be done?"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              placeholder="Add more details..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
              <select
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Due Date</label>
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Assign To</label>
              <select
                value={taskForm.assignedTo}
                onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Unassigned</option>
                {project.members?.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Task Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Task"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteTask}>Delete</Button>
          </>
        }
      >
        <p className="text-slate-300">
          Delete task <strong className="text-white">"{deleteModal?.title}"</strong>? This action cannot be undone.
        </p>
      </Modal>

      {/* Member Management Modal */}
      <Modal
        isOpen={memberModal}
        onClose={() => setMemberModal(false)}
        title="Manage Members"
        size="lg"
        footer={<Button onClick={() => setMemberModal(false)}>Done</Button>}
      >
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-2">Current Members</h4>
            <div className="space-y-2">
              {project.members?.map((m) => (
                <div key={m._id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white">
                    {m.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{m.name}</p>
                    <p className="text-xs text-slate-500">{m.email}</p>
                  </div>
                  <Badge type="role" value={m.role} />
                  {project.owner?._id !== m._id && (
                    <button
                      onClick={() => handleRemoveMember(m._id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-950/30"
                    >
                      <UserMinusIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {nonMembers.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Add Members</h4>
              <div className="space-y-2">
                {nonMembers.map((u) => (
                  <div key={u._id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
                    <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-sm font-bold text-white">
                      {u.name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                    <button
                      onClick={() => handleAddMember(u._id)}
                      className="p-1.5 text-slate-500 hover:text-emerald-400 rounded-lg hover:bg-emerald-950/30"
                    >
                      <UserPlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </AppLayout>
  );
};

export default ProjectDetail;
