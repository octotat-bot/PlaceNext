import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Briefcase, FileText, CheckCircle, Calendar, ChevronRight, Plus, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { recruiterAPI } from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { StatCardSkeleton } from '../../components/ui/Skeleton';
import { formatRelativeTime } from '../../utils/helpers';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ activeJobs: 0, totalApplications: 0, shortlisted: 0, interviews: 0 });
  const [recentApplications, setRecentApplications] = useState([]);
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await recruiterAPI.getDashboardStats();
        setStats(data.stats || { activeJobs: 0, totalApplications: 0, shortlisted: 0, interviews: 0 });
        setRecentApplications(data.recentApplications || []);
        setJobPostings(data.jobPostings || []);
      } catch { toast.error('Failed to load dashboard data'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto' }}>
      <PageHeader
        eyebrow="Recruiter Portal"
        title="Your hiring"
        accentWord="pipeline."
        subtitle={`${user?.companyName || 'Your Company'} — manage your job postings and applicants`}
        actions={
          <Link to="/recruiter/jobs" className="btn btn-primary btn-sm">
            <Plus size={13} /> New Job
          </Link>
        }
      />

      {/* Stat cards */}
      <div data-tour="stat-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }} className="grid-responsive-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (<>
          <StatCard label="Active Postings"  value={stats.activeJobs}         accentColor="#3b82f6" />
          <StatCard label="Applications"     value={stats.totalApplications}   accentColor="#8b5cf6" />
          <StatCard label="Shortlisted"      value={stats.shortlisted}         accentColor="#f59e0b" />
          <StatCard label="Interviews"       value={stats.interviews}          accentColor="#10b981" />
        </>)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }} className="grid-responsive-2">
        {/* Recent Applications */}
        <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>Recent Applications</span>
            <Link to="/recruiter/applications" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
              View all <ChevronRight size={13} />
            </Link>
          </div>
          {recentApplications.length === 0 && !loading ? (
            <div style={{ padding: '24px 18px' }}>
              <EmptyState 
                icon="ti-file-text"
                title="No applications yet"
                body="Applications will appear here once students start applying."
              />
            </div>
          ) : recentApplications.map((app, idx) => (
            <div key={app.id || idx}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-background-secondary)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div className="avatar avatar-sm" style={{ fontFamily: 'var(--font-display)' }}>
                  {app.avatar || app.name?.charAt(0) || '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>{app.position}</div>
                </div>
                <StatusBadge status={app.status || 'applied'} />
                <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)', flexShrink: 0 }}>{formatRelativeTime(app.date)}</span>
              </div>
              {idx < recentApplications.length - 1 && <div style={{ height: '0.5px', background: 'var(--color-border-tertiary)', margin: '0 18px' }} />}
            </div>
          ))}
        </div>

        {/* Job Postings */}
        <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>Job Postings</span>
            <Link to="/recruiter/jobs" style={{ fontSize: 12, color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
              Manage
            </Link>
          </div>
          {jobPostings.length === 0 && !loading ? (
            <div style={{ padding: '24px 18px' }}>
              <EmptyState 
                icon="ti-briefcase"
                title="No jobs posted"
                body="Create a drive to start hiring."
                cta={{ label: 'Create drive', href: '/recruiter/jobs' }}
              />
            </div>
          ) : jobPostings.map((job, idx) => (
            <div key={job.id || idx}>
              <div style={{ padding: '12px 18px' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-background-secondary)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users size={11} /> {job.applicants || 0} applicants
                    </div>
                  </div>
                  <StatusBadge status={job.status === 'active' ? 'active' : 'closed'} />
                </div>
              </div>
              {idx < jobPostings.length - 1 && <div style={{ height: '0.5px', background: 'var(--color-border-tertiary)', margin: '0 18px' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <div style={{
        marginTop: 20, padding: '20px 24px',
        background: 'var(--color-background-secondary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 'var(--border-radius-md)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--color-text-primary)' }}>
            Ready to find your next <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>hire?</em>
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
            Post a new job opening and connect with talented students.
          </div>
        </div>
        <Link to="/recruiter/jobs" className="btn btn-primary" style={{ flexShrink: 0 }}>
          <Plus size={13} /> Post a Job
        </Link>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
