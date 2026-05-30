import { useState } from 'react';
import { User, Mail, Lock, Shield, Save, UserPlus, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import PageHeader from '../../components/ui/PageHeader';
import ThemePicker from '../../components/settings/ThemePicker';
import { useWalkthroughReset } from '../../context/WalkthroughContext';

const TABS = [
  { id: 'account',    label: 'My Account' },
  { id: 'security',   label: 'Security' },
  { id: 'users',      label: 'Create User' },
  { id: 'appearance', label: 'Appearance' },
];

const Section = ({ title, subtitle, children }) => (
  <div style={{
    background: 'var(--color-background-primary)',
    border: '0.5px solid var(--color-border-tertiary)',
    borderRadius: 'var(--border-radius-lg)',
    overflow: 'hidden',
  }}>
    <div style={{ padding: '14px 20px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{subtitle}</div>}
    </div>
    <div style={{ padding: '20px' }}>{children}</div>
  </div>
);

function WalkthroughResetButton() {
  const { resetWalkthrough } = useWalkthroughReset();
  return (
    <div style={{ marginTop: 24, paddingTop: 20, borderTop: '0.5px solid var(--color-border-tertiary)' }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 4 }}>
        App walkthrough
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
        Restart the guided tour to revisit features you may have missed.
      </div>
      <button
        className="btn"
        onClick={() => { resetWalkthrough(); toast.success('Walkthrough reset — it will show on next page load.'); }}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}
      >
        <RotateCcw size={13} /> Restart walkthrough
      </button>
    </div>
  );
}

const FieldRow = ({ label, hint, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label className="form-label">{label}</label>
    {children}
    {hint && <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 4 }}>{hint}</div>}
  </div>
);

const InfoRow = ({ icon: Icon, label, value }) => (
  <div>
    <label className="form-label">{label}</label>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px', background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-md)', fontSize: 13, color: 'var(--color-text-secondary)' }}>
      {Icon && <Icon size={14} style={{ color: 'var(--color-text-tertiary)' }} />}
      {value}
    </div>
  </div>
);

const AdminSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [showPasswords, setShowPasswords] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [newUserData, setNewUserData] = useState({ email: '', password: '', role: 'admin' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword) { toast.error('Current password is required'); return; }
    if (passwordData.newPassword.length < 6) { toast.error('Min 6 characters'); return; }
    if (passwordData.newPassword !== passwordData.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwordData.currentPassword === passwordData.newPassword) { toast.error('New password must differ from current'); return; }
    setChangingPassword(true);
    try {
      await authAPI.updatePassword({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
      toast.success('Password updated!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setChangingPassword(false); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserData.email || !newUserData.password) { toast.error('All fields required'); return; }
    if (newUserData.password.length < 6) { toast.error('Password must be at least 6 chars'); return; }
    setCreatingUser(true);
    try {
      await adminAPI.createUser(newUserData);
      toast.success(`${newUserData.role.charAt(0).toUpperCase() + newUserData.role.slice(1)} created!`);
      setNewUserData({ email: '', password: '', role: 'admin' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setCreatingUser(false); }
  };

  /* password input with toggle */
  const PwField = ({ label, field }) => (
    <FieldRow label={label}>
      <div style={{ position: 'relative' }}>
        <Lock size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
        <input
          type={showPasswords ? 'text' : 'password'}
          value={passwordData[field]}
          onChange={e => setPasswordData(d => ({ ...d, [field]: e.target.value }))}
          className="form-input" style={{ paddingLeft: 30 }}
          required
        />
      </div>
    </FieldRow>
  );

  return (
    <div style={{ maxWidth: 720 }}>
      <PageHeader
        eyebrow="Admin"
        title="System"
        accentWord="settings."
        subtitle="Manage your account, security and user creation"
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={activeTab === tab.id ? 'btn btn-primary btn-sm' : 'btn btn-sm'}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Account ── */}
      {activeTab === 'account' && (
        <Section title="Account Information" subtitle="Details about your profile and role">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 16, borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
            <div className="avatar avatar-lg" style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>
              {user?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>{user?.name || user?.email?.split('@')[0]}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>{user?.email}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <InfoRow icon={Mail} label="Email Address" value={user?.email} />
            <InfoRow icon={Shield} label="Role & Status" value={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
                <span className="status-badge status-active" style={{ fontSize: 10 }}>Active</span>
              </div>
            } />
          </div>
        </Section>
      )}

      {/* ── Security ── */}
      {activeTab === 'security' && (
        <Section title="Security" subtitle="Update your password to keep your account safe">
          <form onSubmit={handlePasswordChange} style={{ maxWidth: 400 }}>
            <PwField label="Current Password" field="currentPassword" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <PwField label="New Password" field="newPassword" />
              <PwField label="Confirm New Password" field="confirmPassword" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <button type="button" onClick={() => setShowPasswords(v => !v)} className="btn btn-sm">
                {showPasswords ? <EyeOff size={13} /> : <Eye size={13} />}
                {showPasswords ? 'Hide' : 'Show'} passwords
              </button>
              <button type="submit" disabled={changingPassword} className="btn btn-primary btn-sm">
                <Shield size={13} /> {changingPassword ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </form>
        </Section>
      )}

      {/* ── Create User ── */}
      {activeTab === 'users' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
          <Section title="Create New User" subtitle="Add administrators, recruiters, or students manually">
            <form onSubmit={handleCreateUser}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FieldRow label="Email Address">
                  <input type="email" required value={newUserData.email}
                    onChange={e => setNewUserData(d => ({ ...d, email: e.target.value }))}
                    className="form-input" placeholder="user@example.com" />
                </FieldRow>
                <FieldRow label="Role">
                  <select value={newUserData.role} onChange={e => setNewUserData(d => ({ ...d, role: e.target.value }))} className="form-select">
                    <option value="admin">Admin</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="student">Student</option>
                  </select>
                </FieldRow>
              </div>
              <FieldRow label="Initial Password">
                <input type="text" required value={newUserData.password}
                  onChange={e => setNewUserData(d => ({ ...d, password: e.target.value }))}
                  className="form-input" placeholder="Set a temporary password" />
              </FieldRow>
              <button type="submit" disabled={creatingUser} className="btn btn-primary btn-sm">
                <UserPlus size={13} /> {creatingUser ? 'Creating…' : 'Create Account'}
              </button>
            </form>
          </Section>

          <div style={{
            background: 'var(--color-background-warning)',
            border: '0.5px solid var(--color-text-warning)',
            borderRadius: 'var(--border-radius-md)',
            padding: '14px 16px', maxWidth: 220,
          }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 8 }}>Important Note</div>
            <ul style={{ fontSize: 11, color: 'var(--color-text-secondary)', paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>User can login immediately</li>
              <li>Share the password securely</li>
              <li>They should change it on first login</li>
              <li>Admin accounts have full access</li>
            </ul>
          </div>
        </div>
      )}

      {/* ── Appearance ── */}
      {activeTab === 'appearance' && (
        <Section title="Theme" subtitle="Personalise your interface">
          <ThemePicker />
          <WalkthroughResetButton />
        </Section>
      )}
    </div>
  );
};

export default AdminSettings;
