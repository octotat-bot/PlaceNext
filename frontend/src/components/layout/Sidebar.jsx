import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Briefcase, FileText, Users,
  FileSearch, CalendarDays, Settings, X, ClipboardList, UserCheck, Palette,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// ---------------------------------------------------------------------------
// Compact theme switcher popover for the sidebar
// ---------------------------------------------------------------------------
function SidebarThemePicker() {
  const { themeId, changeTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        title="Change theme"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '8px 10px',
          borderRadius: 'var(--border-radius-md)',
          background: open ? 'var(--color-background-secondary)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.15s',
          color: 'var(--color-text-secondary)',
          fontSize: 13,
          fontFamily: 'inherit',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-background-secondary)'}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent'; }}
      >
        {/* Live swatch — shows current theme's accent dot */}
        <div style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: `conic-gradient(${themes.find(t => t.id === themeId)?.swatchColors.join(', ')})`,
          flexShrink: 0,
          border: '1.5px solid var(--color-border-secondary)',
        }} />
        <span style={{ flex: 1, textAlign: 'left' }}>Theme</span>
        <Palette size={13} style={{ opacity: 0.5 }} />
      </button>

      {/* Popover — opens upward */}
      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-secondary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: 12,
            zIndex: 200,
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          }}
        >
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-text-tertiary)',
            marginBottom: 10,
          }}>
            Appearance
          </div>

          {/* 3×2 grid of theme swatches */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {themes.map(theme => {
              const selected = themeId === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => { changeTheme(theme.id); setOpen(false); }}
                  title={theme.name}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 5,
                    padding: '8px 4px',
                    borderRadius: 8,
                    border: selected
                      ? `1.5px solid ${theme.vars['--accent']}`
                      : '1.5px solid transparent',
                    background: selected
                      ? theme.vars['--accent-bg']
                      : 'var(--color-background-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    outline: 'none',
                  }}
                  onMouseEnter={e => {
                    if (!selected) e.currentTarget.style.background = 'var(--color-background-tertiary)';
                  }}
                  onMouseLeave={e => {
                    if (!selected) e.currentTarget.style.background = 'var(--color-background-secondary)';
                  }}
                >
                  {/* Conic swatch */}
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: `conic-gradient(${theme.swatchColors.join(', ')})`,
                    flexShrink: 0,
                    boxShadow: selected ? `0 0 0 2px ${theme.vars['--accent']}44` : 'none',
                  }} />
                  <span style={{
                    fontSize: 9,
                    fontWeight: selected ? 600 : 400,
                    color: selected ? theme.vars['--accent'] : 'var(--color-text-tertiary)',
                    lineHeight: 1,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 48,
                  }}>
                    {theme.name}
                  </span>
                  {selected && (
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: theme.vars['--accent'] }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
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
              data-tour={`nav-${to.split('/').pop()}`}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: Theme picker + Settings */}
        <div style={{ padding: '8px', borderTop: '0.5px solid var(--color-border-tertiary)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <SidebarThemePicker />
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
