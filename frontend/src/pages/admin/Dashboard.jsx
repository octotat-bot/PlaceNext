import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Briefcase, Building2, DollarSign, CheckCircle,
  TrendingUp, FileText, PieChart as PieChartIcon, UserCheck,
  ChevronRight, Download,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { adminAPI } from '../../services/api';
import api from '../../services/api';
import { StatCardSkeleton, ChartSkeleton } from '../../components/ui/Skeleton';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDate, formatStatus, downloadCSV } from '../../utils/helpers';
import toast from 'react-hot-toast';

// Status palette — flat, no gradients
const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#6b7280'];

const chartTooltipStyle = {
  backgroundColor: 'var(--color-background-primary)',
  borderRadius: 8,
  border: '0.5px solid var(--color-border-secondary)',
  fontSize: 12,
  color: 'var(--color-text-primary)',
};

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingRecruiters, setPendingRecruiters] = useState([]);

  useEffect(() => {
    fetchAnalytics();
    fetchPendingRecruiters();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await adminAPI.getAnalytics();
      setAnalytics(data.analytics);
    } catch { toast.error('Failed to load analytics'); }
    finally { setLoading(false); }
  };

  const fetchPendingRecruiters = async () => {
    try {
      const { data } = await api.get('/admin/recruiters/pending');
      setPendingRecruiters(data.data || []);
    } catch { /* silent */ }
  };

  const processChartData = (data) => {
    if (!data || data.length === 0) return [];
    if (data.length === 1) {
      const d = new Date(data[0]._id);
      return [
        { _id: new Date(d.getTime() - 7 * 86400000).toISOString(), count: 0 },
        { _id: data[0]._id, count: data[0].count },
        { _id: new Date().toISOString(), count: 0 },
      ];
    }
    return data;
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div style={{ height: 36, width: 220, background: 'var(--color-background-secondary)', borderRadius: 8, marginBottom: 28 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <ChartSkeleton /><ChartSkeleton />
        </div>
      </div>
    );
  }

  const { overview, applicationsByStatus, placementsByBranch, applicationsOverTime, topCompanies, recentApplications } = analytics || {};

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto' }}>
      <PageHeader
        eyebrow="Admin"
        title="Placement"
        accentWord="overview."
        subtitle="Real-time analytics and management"
        actions={
          <button
            className="btn btn-sm"
            onClick={async () => {
              try {
                const { data } = await adminAPI.exportPlacements();
                downloadCSV(data, 'placements.csv');
                toast.success('Exported');
              } catch { toast.error('Export failed'); }
            }}
          >
            <Download size={13} /> Export
          </button>
        }
      />

      {/* Pending Recruiters Alert */}
      {pendingRecruiters.length > 0 && (
        <Link
          to="/admin/recruiters"
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', marginBottom: 20,
            background: 'var(--color-background-warning)',
            border: '0.5px solid var(--color-text-warning)',
            borderRadius: 'var(--border-radius-md)',
            textDecoration: 'none',
          }}
        >
          <UserCheck size={15} style={{ color: 'var(--color-text-warning)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {pendingRecruiters.length} recruiter{pendingRecruiters.length > 1 ? 's' : ''} pending approval
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Click to review</div>
          </div>
          <ChevronRight size={14} style={{ color: 'var(--color-text-tertiary)' }} />
        </Link>
      )}

      {/* Primary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }} className="grid-responsive-4">
        <StatCard label="Total Students" value={overview?.totalStudents || 0} accentColor="#3b82f6" />
        <StatCard label="Active Drives"  value={overview?.activeDrives || 0}  accentColor="#8b5cf6" />
        <StatCard label="Placed"         value={overview?.selectedStudents || 0} accentColor="#10b981" />
        <StatCard label="Avg. Package"   value={`₹${overview?.avgPackage || 0}L`} accentColor="#f59e0b" />
      </div>

      {/* Secondary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }} className="grid-responsive-4">
        {[
          { label: 'Companies',      value: overview?.totalCompanies || 0 },
          { label: 'Total Drives',   value: overview?.totalDrives || 0 },
          { label: 'Applications',   value: overview?.totalApplications || 0 },
          { label: 'Placement Rate', value: `${overview?.placementRate || 0}%` },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-md)',
            padding: '12px 14px',
          }}>
            <div className="metric-label">{label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--color-text-primary)', marginTop: 4 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }} className="grid-responsive-2">
        {/* Area Chart */}
        <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', padding: '18px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 16 }}>
            Applications (Last 30 Days)
          </div>
          <div style={{ height: 220 }}>
            {applicationsOverTime?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={processChartData(applicationsOverTime)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" vertical={false} />
                  <XAxis
                    dataKey="_id"
                    tickFormatter={v => new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} itemStyle={{ color: 'var(--color-text-secondary)' }} labelFormatter={v => formatDate(v)} />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={1.5}
                    fill="#dbeafe" fillOpacity={0.6}
                    dot={{ fill: '#3b82f6', strokeWidth: 0, r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-tertiary)', fontSize: 13 }}>
                <FileText size={24} style={{ marginBottom: 8, opacity: 0.3 }} />
                No data yet
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', padding: '18px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 16 }}>
            Applications by Status
          </div>
          <div style={{ height: 220 }}>
            {applicationsByStatus?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={applicationsByStatus.map(item => ({ name: formatStatus(item._id), value: item.count }))}
                    cx="50%" cy="50%" outerRadius={80} dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {applicationsByStatus.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-tertiary)', fontSize: 13 }}>
                <PieChartIcon size={24} style={{ marginBottom: 8, opacity: 0.3 }} />
                No data yet
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }} className="grid-responsive-2">
        {/* Bar Chart — Placements by Branch */}
        <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', padding: '18px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 16 }}>
            Placements by Branch
          </div>
          <div style={{ height: 220 }}>
            {placementsByBranch?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={placementsByBranch} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="_id" type="category" width={90} tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} itemStyle={{ color: 'var(--color-text-secondary)' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-tertiary)', fontSize: 13 }}>
                <Building2 size={24} style={{ marginBottom: 8, opacity: 0.3 }} />
                No data yet
              </div>
            )}
          </div>
        </div>

        {/* Top Companies */}
        <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>Top Companies</span>
            <Link to="/admin/companies" style={{ fontSize: 11, color: 'var(--color-text-secondary)', textDecoration: 'none' }}>View all</Link>
          </div>
          {topCompanies?.length > 0 ? topCompanies.slice(0, 5).map((co, i) => (
            <div key={co._id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '11px 18px', borderBottom: '0.5px solid var(--color-border-tertiary)',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-background-secondary)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 500, background: 'var(--color-background-secondary)', color: 'var(--color-text-tertiary)',
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{co.companyName}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{co.applications}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-success)' }}>{co.selected} placed</div>
              </div>
            </div>
          )) : (
            <div style={{ padding: '32px 18px', textAlign: 'center', fontSize: 13, color: 'var(--color-text-tertiary)' }}>No companies yet</div>
          )}
        </div>
      </div>

      {/* Recent Applications */}
      <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>Recent Applications</span>
          <Link to="/admin/drives" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
            View all <ChevronRight size={12} />
          </Link>
        </div>
        {recentApplications?.length > 0 ? recentApplications.slice(0, 6).map((app, idx) => (
          <div key={app._id}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-background-secondary)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="avatar avatar-sm">
                  {app.studentId?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{app.studentId?.name || 'Unknown'}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                    {app.driveId?.roleTitle} · {app.driveId?.companyId?.companyName}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <StatusBadge status={app.applicationStatus} />
                <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 4 }}>{formatDate(app.createdAt)}</div>
              </div>
            </div>
            {idx < Math.min(recentApplications.length, 6) - 1 && (
              <div style={{ height: '0.5px', background: 'var(--color-border-tertiary)', margin: '0 18px' }} />
            )}
          </div>
        )) : (
          <div style={{ padding: '32px 18px', textAlign: 'center', fontSize: 13, color: 'var(--color-text-tertiary)' }}>No applications yet</div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }} className="grid-responsive-4">
        {[
          { to: '/admin/drives',     icon: Briefcase,   label: 'Manage Drives' },
          { to: '/admin/companies',  icon: Building2,   label: 'Companies' },
          { to: '/admin/students',   icon: Users,       label: 'Students' },
          { to: '/admin/recruiters', icon: UserCheck,   label: 'Recruiters' },
        ].map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px',
            background: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-md)',
            textDecoration: 'none',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-border-secondary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border-tertiary)'}
          >
            <Icon size={15} style={{ color: 'var(--color-text-secondary)' }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
