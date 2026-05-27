import { useState, useEffect } from 'react';
import {
  User, Mail, Building2, Lock, Eye, EyeOff, Save, Shield, Bell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { recruiterAPI } from '../../services/api';
import toast from 'react-hot-toast';
import PageHeader from '../../components/ui/PageHeader';

const TABS = [
  { id: 'account',       label: 'Account',       icon: User },
  { id: 'security',      label: 'Security',       icon: Shield },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
];

const SettingsSection = ({ title, children }) => (
  <div style={{
    background: 'var(--color-background-primary)',
    border: '0.5px solid var(--color-border-tertiary)',
    borderRadius: 'var(--border-radius-lg)',
    padding: '20px 22px',
  }}>
    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 18, paddingBottom: 12, borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
      {title}
    </div>
    {children}
  </div>
);

const FieldRow = ({ label, children, hint }) => (
  <div style={{ marginBottom: 14 }}>
    <label className="form-label">{label}</label>
    {children}
    {hint && <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 4 }}>{hint}</div>}
  </div>
);

const InputWithIcon = ({ icon: Icon, ...props }) => (
  <div style={{ position: 'relative' }}>
    {Icon && <Icon size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />}
    <input {...props} className="form-input" style={{ paddingLeft: Icon ? 30 : 13, ...props.style }} />
  </div>
);

const RecruiterSettings = () => {
  const { user, checkAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const [accountData, setAccountData] = useState({ name: '', email: '', companyName: '' });
  useEffect(() => {
    if (user) setAccountData({ name: user.name || '', email: user.email || '', companyName: user.companyName || '' });
  }, [user]);

  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleAccountSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await recruiterAPI.updateProfile({ name: accountData.name, companyName: accountData.companyName });
      toast.success('Account updated');
      checkAuth();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!pwData.currentPassword) { toast.error('Current password required'); return; }
    if (pwData.newPassword.length < 6) { toast.error('Min 6 characters'); return; }
    if (pwData.newPassword !== pwData.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (pwData.currentPassword === pwData.newPassword) { toast.error('New password must differ'); return; }
    setLoading(true);
    try {
      await recruiterAPI.updatePassword({ currentPassword: pwData.currentPassword, newPassword: pwData.newPassword });
      toast.success('Password updated');
      setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <PageHeader
        eyebrow="Recruiter"
        title="Account"
        accentWord="settings."
        subtitle="Manage your profile, security, and preferences"
      />

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? 'btn btn-primary btn-sm' : 'btn btn-sm'}
            style={{ gap: 6 }}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Account */}
      {activeTab === 'account' && (
        <SettingsSection title="Account Information">
          <form onSubmit={handleAccountSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FieldRow label="Full Name">
                <InputWithIcon icon={User} type="text" value={accountData.name} onChange={e => setAccountData(d => ({ ...d, name: e.target.value }))} placeholder="Your name" />
              </FieldRow>
              <FieldRow label="Email Address" hint="Email cannot be changed">
                <InputWithIcon icon={Mail} type="email" value={accountData.email} disabled style={{ opacity: 0.6 }} />
              </FieldRow>
            </div>
            <FieldRow label="Company Name">
              <InputWithIcon icon={Building2} type="text" value={accountData.companyName} onChange={e => setAccountData(d => ({ ...d, companyName: e.target.value }))} placeholder="Your company" />
            </FieldRow>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <button type="submit" disabled={loading} className="btn btn-primary btn-sm">
                <Save size={13} /> {loading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </SettingsSection>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <SettingsSection title="Change Password">
          <form onSubmit={handlePasswordSave} style={{ maxWidth: 400 }}>
            <FieldRow label="Current Password">
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={pwData.currentPassword}
                  onChange={e => setPwData(d => ({ ...d, currentPassword: e.target.value }))}
                  className="form-input" style={{ paddingLeft: 30, paddingRight: 36 }}
                  placeholder="Current password"
                />
                <button type="button" onClick={() => setShowCurrent(v => !v)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 0 }}>
                  {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </FieldRow>
            <FieldRow label="New Password">
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={pwData.newPassword}
                  onChange={e => setPwData(d => ({ ...d, newPassword: e.target.value }))}
                  className="form-input" style={{ paddingLeft: 30, paddingRight: 36 }}
                  placeholder="New password (min 6 chars)"
                />
                <button type="button" onClick={() => setShowNew(v => !v)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 0 }}>
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </FieldRow>
            <FieldRow label="Confirm New Password">
              <InputWithIcon icon={Lock} type="password" value={pwData.confirmPassword} onChange={e => setPwData(d => ({ ...d, confirmPassword: e.target.value }))} placeholder="Confirm password" />
            </FieldRow>
            <button type="submit" disabled={loading} className="btn btn-primary btn-sm">
              <Shield size={13} /> {loading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </SettingsSection>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <SettingsSection title="Notification Preferences">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { label: 'New applications', desc: 'Get notified when students apply to your job postings' },
              { label: 'Interview reminders', desc: 'Receive reminders before scheduled interviews' },
              { label: 'Weekly summary', desc: 'Weekly summary of your recruitment activity' },
              { label: 'System updates', desc: 'Platform updates and new feature announcements' },
            ].map((item, i, arr) => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: i < arr.length - 1 ? '0.5px solid var(--color-border-tertiary)' : 'none',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{item.desc}</div>
                </div>
                {/* Minimal toggle */}
                <label style={{ position: 'relative', display: 'inline-block', width: 36, height: 20, flexShrink: 0 }}>
                  <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{
                    position: 'absolute', inset: 0, cursor: 'pointer',
                    background: 'var(--color-text-primary)', borderRadius: 10,
                    transition: 'background 0.2s',
                  }} />
                  <span style={{
                    position: 'absolute', left: 2, top: 2, width: 16, height: 16,
                    borderRadius: '50%', background: '#fff', transition: 'transform 0.2s',
                  }} />
                </label>
              </div>
            ))}
          </div>
        </SettingsSection>
      )}
    </div>
  );
};

export default RecruiterSettings;
