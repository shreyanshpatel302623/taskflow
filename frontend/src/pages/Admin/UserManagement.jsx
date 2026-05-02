import { useState, useEffect } from 'react';
import { getAllUsers, updateUser, deleteUser, getUserStats } from '../../api/users';
import AppLayout from '../../components/Layout/AppLayout';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import Spinner from '../../components/UI/Spinner';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import {
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'member', isActive: true });
  const [submitting, setSubmitting] = useState(false);

  const load = async (q = '') => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        getAllUsers(q ? { search: q } : {}),
        getUserStats(),
      ]);
      setUsers(usersRes.data.data || []);
      setStats(statsRes.data.data || {});
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  let searchTimer;
  const handleSearch = (e) => {
    setSearch(e.target.value);
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => load(e.target.value), 400);
  };

  const openEdit = (user) => {
    setEditForm({ name: user.name, email: user.email, role: user.role, isActive: user.isActive });
    setEditModal(user);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await updateUser(editModal._id, editForm);
      setUsers(users.map((u) => (u._id === editModal._id ? data.data : u)));
      setEditModal(null);
      toast.success('User updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(deleteModal._id);
      setUsers(users.filter((u) => u._id !== deleteModal._id));
      toast.success('User deleted');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
    finally { setDeleteModal(null); }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <UsersIcon className="w-7 h-7 text-indigo-400" />
          User Management
        </h1>
        <p className="text-slate-400 text-sm mt-1">Manage team members and their roles</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: UsersIcon, color: 'text-indigo-400' },
          { label: 'Admins', value: stats.admins, icon: ShieldCheckIcon, color: 'text-purple-400' },
          { label: 'Members', value: stats.members, icon: UserCircleIcon, color: 'text-blue-400' },
          { label: 'Active', value: stats.activeUsers, icon: UserCircleIcon, color: 'text-emerald-400' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="text-2xl font-bold text-white">{s.value ?? '–'}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          value={search}
          onChange={handleSearch}
          placeholder="Search users by name or email..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-48"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Joined</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                          {u.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white flex items-center gap-1.5">
                            {u.name}
                            {u._id === currentUser?._id && (
                              <span className="text-xs text-indigo-400 font-normal">(you)</span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge type="role" value={u.role} />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${u.isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '–'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                          title="Edit user"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        {u._id !== currentUser?._id && (
                          <button
                            onClick={() => setDeleteModal(u)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                            title="Delete user"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={!!editModal}
        onClose={() => setEditModal(null)}
        title="Edit User"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditModal(null)}>Cancel</Button>
            <Button form="edit-user-form" type="submit" loading={submitting}>Save Changes</Button>
          </>
        }
      >
        <form id="edit-user-form" onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
            <input
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
              <select
                value={editForm.isActive ? 'active' : 'inactive'}
                onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'active' })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete User"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete User</Button>
          </>
        }
      >
        <p className="text-slate-300">
          Delete <strong className="text-white">{deleteModal?.name}</strong>? They will be removed from all projects and their tasks will be unassigned.
        </p>
      </Modal>
    </AppLayout>
  );
};

export default UserManagement;
