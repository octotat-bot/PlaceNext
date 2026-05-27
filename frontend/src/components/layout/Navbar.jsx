import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import useNotifications from '../../hooks/useNotifications';
import Avatar from '../ui/Avatar';
import { formatRelativeTime } from '../../utils/helpers';

const Navbar = ({ onMenuClick }) => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleNotifClick = async (notif) => {
    if (!notif.isRead) await markAsRead(notif._id);
    setShowNotifications(false);
    if (notif.link) navigate(notif.link);
  };

  const dropdownStyle = {
    position: 'absolute',
    right: 0,
    top: 'calc(100% + 8px)',
    background: 'var(--color-background-primary)',
    border: '0.5px solid var(--color-border-secondary)',
    borderRadius: 'var(--border-radius-lg)',
    zIndex: 60,
    overflow: 'hidden',
    minWidth: 220,
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 30,
      height: 56,
      background: 'var(--color-background-primary)',
      borderBottom: '0.5px solid var(--color-border-tertiary)',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 16px' }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onMenuClick}
            className="btn btn-icon lg:hidden"
            style={{ border: 'none', background: 'transparent', color: 'var(--color-text-secondary)' }}
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>
          <Link to="/" style={{ textDecoration: 'none', fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--color-text-primary)' }}>
            Place<em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Next</em>
          </Link>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Notifications */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              onClick={() => setShowNotifications(s => !s)}
              className="btn btn-icon"
              style={{ border: 'none', background: 'transparent', color: 'var(--color-text-secondary)', position: 'relative' }}
              aria-label="Notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 7, height: 7,
                  background: 'var(--color-text-danger)',
                  borderRadius: '50%',
                  border: '1.5px solid var(--color-background-primary)',
                }} />
              )}
            </button>

            {showNotifications && (
              <div className="animate-fadeIn" style={{ ...dropdownStyle, width: 300 }}>
                <div style={{
                  padding: '12px 14px',
                  borderBottom: '0.5px solid var(--color-border-tertiary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} style={{ fontSize: 11, color: 'var(--color-text-info)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 13 }}>
                      <Bell size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
                      No notifications
                    </div>
                  ) : notifications.slice(0, 6).map(notif => (
                    <button
                      key={notif._id}
                      onClick={() => handleNotifClick(notif)}
                      style={{
                        width: '100%', textAlign: 'left', padding: '10px 14px',
                        background: !notif.isRead ? 'var(--color-background-info)' : 'transparent',
                        border: 'none', cursor: 'pointer',
                        borderBottom: '0.5px solid var(--color-border-tertiary)',
                        display: 'flex', gap: 8, alignItems: 'flex-start',
                      }}
                    >
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                        background: !notif.isRead ? 'var(--color-text-info)' : 'transparent',
                      }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)' }}>{notif.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>{notif.message}</div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 4 }}>{formatRelativeTime(notif.createdAt)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: 'var(--color-border-tertiary)', margin: '0 4px' }} />

          {/* User Menu */}
          <div style={{ position: 'relative' }} ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(s => !s)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '4px 8px 4px 4px',
                border: '0.5px solid transparent',
                borderRadius: 100,
                background: 'transparent',
                cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-background-secondary)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Avatar src={profile?.profilePictureUrl} name={profile?.name || user?.name || user?.email} size="sm" />
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', display: 'none' }} className="sm:block">
                {(profile?.name || user?.name || user?.email || '').split(' ')[0].split('@')[0]}
              </span>
              <ChevronDown size={13} style={{ color: 'var(--color-text-tertiary)', display: 'none' }} className="sm:block" />
            </button>

            {showUserMenu && (
              <div className="animate-fadeIn" style={{ ...dropdownStyle, minWidth: 220 }}>
                <div style={{ padding: '12px 14px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    {profile?.name || user?.name || 'User'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{user?.email}</div>
                  <span className="status-badge status-applied" style={{ marginTop: 6, display: 'inline-flex' }}>
                    {user?.role}
                  </span>
                </div>
                <div style={{ padding: 4 }}>
                  {user?.role === 'student' && (
                    <Link to="/profile" onClick={() => setShowUserMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, fontSize: 13, color: 'var(--color-text-primary)', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-background-secondary)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <User size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                      My Profile
                    </Link>
                  )}
                  <Link
                    to={user?.role === 'admin' ? '/admin/settings' : user?.role === 'recruiter' ? '/recruiter/settings' : '/settings'}
                    onClick={() => setShowUserMenu(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, fontSize: 13, color: 'var(--color-text-primary)', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-background-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Settings size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                    Settings
                  </Link>
                </div>
                <div style={{ borderTop: '0.5px solid var(--color-border-tertiary)', padding: 4 }}>
                  <button onClick={handleLogout}
                    style={{
                      display: 'flex', width: '100%', alignItems: 'center', gap: 8,
                      padding: '8px 12px', borderRadius: 8, fontSize: 13,
                      color: 'var(--color-text-danger)', background: 'none', border: 'none', cursor: 'pointer',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-background-danger)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
