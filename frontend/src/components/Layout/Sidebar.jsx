import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/projects', label: 'Projects', icon: FolderIcon },
  { to: '/tasks', label: 'My Tasks', icon: ClipboardDocumentListIcon },
];

const adminItems = [
  { to: '/admin/users', label: 'Users', icon: UsersIcon },
];

const Sidebar = () => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path);

  const NavLink = ({ to, label, icon: Icon }) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
        isActive(to)
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      } ${collapsed ? 'justify-center px-2' : ''}`}
      title={collapsed ? label : ''}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );

  return (
    <aside
      className={`flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } min-h-screen`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b border-slate-800 ${collapsed ? 'justify-center' : ''}`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <ClipboardDocumentListIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">TaskFlow</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {collapsed ? (
            <ChevronDoubleRightIcon className="w-4 h-4" />
          ) : (
            <ChevronDoubleLeftIcon className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.to} {...item} />
        ))}

        {isAdmin && (
          <>
            <div className={`pt-4 pb-1 ${collapsed ? 'hidden' : ''}`}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3">
                Admin
              </p>
            </div>
            {collapsed && <div className="border-t border-slate-800 my-2" />}
            {adminItems.map((item) => (
              <NavLink key={item.to} {...item} />
            ))}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <div className="flex items-center gap-1">
                {isAdmin && <ShieldCheckIcon className="w-3 h-3 text-indigo-400" />}
                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-all ${
            collapsed ? 'justify-center px-2' : ''
          }`}
          title="Logout"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
