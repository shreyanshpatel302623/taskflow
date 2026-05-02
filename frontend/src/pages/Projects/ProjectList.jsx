import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, createProject, deleteProject } from '../../api/projects';
import { getAllUsers } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/Layout/AppLayout';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import Spinner from '../../components/UI/Spinner';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  FolderOpenIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

const PROJECT_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16',
];

const ProjectList = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', members: [], color: '#6366f1' });
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async (q = '') => {
    try {
      const { data } = await getProjects(q ? { search: q } : {});
      setProjects(data.data || []);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (isAdmin && showModal) {
      getAllUsers().then(({ data }) => setUsers(data.data || [])).catch(() => {});
    }
  }, [isAdmin, showModal]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    const timer = setTimeout(() => load(e.target.value), 400);
    return () => clearTimeout(timer);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await createProject(form);
      setProjects([data.data, ...projects]);
      setShowModal(false);
      setForm({ name: '', description: '', members: [], color: '#6366f1' });
      toast.success('Project created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteProject(deleteTarget._id);
      setProjects(projects.filter((p) => p._id !== deleteTarget._id));
      toast.success('Project deleted');
    } catch { toast.error('Failed to delete project'); }
    finally { setDeleteTarget(null); }
  };

  const toggleMember = (userId) => {
    setForm((f) => ({
      ...f,
      members: f.members.includes(userId)
        ? f.members.filter((id) => id !== userId)
        : [...f.members, userId],
    }));
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowModal(true)}>
            <PlusIcon className="w-4 h-4" /> New Project
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          value={search}
          onChange={handleSearch}
          placeholder="Search projects..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Spinner size="lg" /></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpenIcon className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 text-lg font-medium">No projects found</p>
          {isAdmin && (
            <p className="text-slate-600 text-sm mt-1">Create your first project to get started</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all hover:shadow-lg hover:shadow-black/20 group"
            >
              {/* Color bar */}
              <div
                className="w-full h-1 rounded-full mb-4 opacity-60"
                style={{ backgroundColor: project.color }}
              />

              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                  style={{ backgroundColor: project.color + '25', color: project.color }}
                >
                  {project.name.charAt(0)}
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setDeleteTarget(project)}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-all"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              <h3 className="text-lg font-semibold text-white mb-1 truncate">{project.name}</h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{project.description || 'No description'}</p>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                <span className="flex items-center gap-1">
                  <ClipboardDocumentListIcon className="w-4 h-4" />
                  {project.taskStats?.total || 0} tasks
                </span>
                <span className="flex items-center gap-1">
                  <UsersIcon className="w-4 h-4" />
                  {project.members?.length || 0} members
                </span>
              </div>

              {/* Member avatars */}
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {project.members?.slice(0, 4).map((m) => (
                    <div
                      key={m._id}
                      className="w-7 h-7 rounded-full bg-indigo-600 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white"
                      title={m.name}
                    >
                      {m.name?.charAt(0)}
                    </div>
                  ))}
                  {(project.members?.length || 0) > 4 && (
                    <div className="w-7 h-7 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs text-slate-400">
                      +{project.members.length - 4}
                    </div>
                  )}
                </div>
                <Link
                  to={`/projects/${project._id}`}
                  className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Open →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Project"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button form="create-project-form" type="submit" loading={submitting}>Create Project</Button>
          </>
        }
      >
        <form id="create-project-form" onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Project Name *</label>
            <input
              required
              minLength={2}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Website Redesign"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What is this project about?"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Project Color</label>
            <div className="flex gap-2">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${form.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Add Members</label>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {users.map((user) => (
                <label key={user._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.members.includes(user._id)}
                    onChange={() => toggleMember(user._id)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                    {user.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm text-white">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Project"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-slate-300">
          Are you sure you want to delete <strong className="text-white">{deleteTarget?.name}</strong>?
          This will permanently delete all tasks inside this project.
        </p>
      </Modal>
    </AppLayout>
  );
};

export default ProjectList;
