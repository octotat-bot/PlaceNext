import { useState, useEffect, useCallback } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import {
  Users, Search, CheckCircle, XCircle, Calendar, Mail,
  GraduationCap, FileText, Briefcase,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { recruiterAPI } from '../../services/api';
import { formatRelativeTime } from '../../utils/helpers';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { ListItemSkeleton } from '../../components/ui/Skeleton';

/* ─── ApplicationCard ─── */
const ApplicationCard = ({ application, onStatusChange }) => (
  <div style={{
    background: 'var(--color-background-primary)',
    border: '0.5px solid var(--color-border-tertiary)',
    borderRadius: 'var(--border-radius-lg)',
    padding: '16px 18px',
    transition: 'border-color 0.2s',
  }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-border-secondary)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border-tertiary)'}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div className="avatar avatar-md" style={{ fontFamily: 'var(--font-display)', fontSize: 16, flexShrink: 0 }}>
        {application.name?.charAt(0) || '?'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{application.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{application.position}</div>
          </div>
          <StatusBadge status={application.status} />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Mail size={11} /> {application.email}
          </span>
          {application.cgpa && (
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <GraduationCap size={11} /> {application.cgpa} CGPA
            </span>
          )}
          <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={11} /> Applied {formatRelativeTime(application.appliedDate)}
          </span>
        </div>

        {application.skills?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {application.skills.slice(0, 5).map((skill, i) => (
              <span key={i} className="tag">{skill}</span>
            ))}
            {application.skills.length > 5 && <span className="tag">+{application.skills.length - 5}</span>}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 10, borderTop: '0.5px solid var(--color-border-tertiary)', flexWrap: 'wrap' }}>
          {application.resumeUrl && (
            <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ textDecoration: 'none' }}>
              <FileText size={12} /> Resume
            </a>
          )}
          {(application.status === 'pending' || application.status === 'applied') && (<>
            <button
              onClick={() => onStatusChange(application.id, 'shortlisted')}
              className="btn btn-sm"
              style={{ background: 'var(--color-background-success)', color: 'var(--color-text-success)', borderColor: 'var(--color-text-success)' }}
            >
              <CheckCircle size={12} /> Shortlist
            </button>
            <button
              onClick={() => onStatusChange(application.id, 'rejected')}
              className="btn btn-sm btn-danger"
            >
              <XCircle size={12} /> Reject
            </button>
          </>)}
          {application.status === 'shortlisted' && (
            <button
              onClick={() => onStatusChange(application.id, 'interview-scheduled')}
              className="btn btn-primary btn-sm"
            >
              <Calendar size={12} /> Schedule Interview
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

/* ─── RecruiterApplications ─── */
const STATUS_TABS = ['all', 'pending', 'shortlisted', 'rejected'];

const RecruiterApplications = () => {
  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const [filter, setFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState('all');

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (selectedJob !== 'all') params.driveId = selectedJob;
      if (debouncedSearch) params.search = debouncedSearch;
      const { data } = await recruiterAPI.getApplications(params);
      setApplications(data.applications || []);
      if (data.drives) setDrives(data.drives);
    } catch { toast.error('Failed to load applications'); }
    finally { setLoading(false); }
  }, [filter, selectedJob, debouncedSearch]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await recruiterAPI.updateApplicationStatus(id, { status: newStatus });
      toast.success('Status updated');
      fetchApplications();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const stats = {
    total:       applications.length,
    pending:     applications.filter(a => a.status === 'pending' || a.status === 'applied').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    rejected:    applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto' }}>
      <PageHeader
        eyebrow="Recruiter"
        title="Candidate"
        accentWord="applications."
        subtitle="Review and manage candidate applications"
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }} className="grid-responsive-4">
        <StatCard label="Total"       value={stats.total}       />
        <StatCard label="Pending"     value={stats.pending}     accentColor="#f59e0b" />
        <StatCard label="Shortlisted" value={stats.shortlisted} accentColor="#10b981" />
        <StatCard label="Rejected"    value={stats.rejected}    accentColor="#ef4444" />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 260 }}>
          <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search candidates…" className="form-input" style={{ paddingLeft: 30 }} />
        </div>
        <select value={selectedJob} onChange={e => setSelectedJob(e.target.value)} className="form-select" style={{ width: 'auto', minWidth: 140 }}>
          <option value="all">All Jobs</option>
          {drives.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 6 }}>
          {STATUS_TABS.map(s => (
            <button key={s} onClick={() => setFilter(s)} className={filter === s ? 'btn btn-primary btn-sm' : 'btn btn-sm'}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array(3).fill(0).map((_, i) => <ListItemSkeleton key={i} />)}
        </div>
      ) : applications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)' }}>
          <Users size={28} style={{ margin: '0 auto 10px', display: 'block', color: 'var(--color-text-tertiary)', opacity: 0.4 }} />
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-secondary)' }}>No applications found</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 4 }}>
            {debouncedSearch ? 'Try adjusting your search' : 'Applications will appear here when candidates apply'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {applications.map(app => (
            <ApplicationCard key={app.id} application={app} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterApplications;
