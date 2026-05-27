import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Briefcase, FileText, Users,
  FileSearch, CalendarDays, Settings, X, ClipboardList, UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const studentLinks = [
    { to: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/drives',          icon: Briefcase,        label: 'Placement Drives' },
    { to: '/applications',    icon: FileText,          label: 'My Applications' },
    { to: '/resume-analyzer', icon: FileSearch,        label: 'Resume Analyzer' },
    { to: '/profile',         icon: Users,             label: 'My Profile' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/drives',     icon: Briefcase,        label: 'Manage Drives' },
    { to: '/admin/companies',  icon: Building2,        label: 'Companies' },
    { to: '/admin/students',   icon: Users,            label: 'Students' },
    { to: '/admin/recruiters', icon: UserCheck,        label: 'Recruiters' },
  ];

  const recruiterLinks = [
    { to: '/recruiter/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/recruiter/jobs',         icon: Briefcase,       label: 'Job Postings' },
    { to: '/recruiter/applications', icon: ClipboardList,   label: 'Applications' },
    { to: '/recruiter/interviews',   icon: CalendarDays,    label: 'Interviews' },
  ];

  const links = { admin: adminLinks, recruiter: recruiterLinks }[user?.role] || studentLinks;

  const settingsPath = {
    admin: '/admin/settings',
    recruiter: '/recruiter/settings',
  }[user?.role] || '/settings';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          style={{ position: 'fixed', top: 56, inset: '56px 0 0 0', background: 'rgba(17,24,39,0.3)', zIndex: 40 }}
          className="lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        style={{
          position: 'fixed',
          top: 56,
          left: 0,
          bottom: 0,
          width: 220,
          background: 'var(--color-background-primary)',
          borderRight: '0.5px solid var(--color-border-tertiary)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
        }}
        className="lg:translate-x-0"
      >
        {/* Brand */}
        <div style={{
          padding: '20px 16px 16px',
          borderBottom: '0.5px solid var(--color-border-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 0 }}>
              {user?.role || 'Portal'}
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-icon lg:hidden"
            style={{ border: 'none', background: 'transparent' }}
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="tour-sidebar" style={{ padding: '12px 8px', flex: 1, overflowY: 'auto' }}>
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              style={{ marginBottom: 2 }}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Settings */}
        <div style={{ padding: '8px', borderTop: '0.5px solid var(--color-border-tertiary)' }}>
          <NavLink
            to={settingsPath}
            onClick={onClose}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <Settings size={16} style={{ flexShrink: 0 }} />
            Settings
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
