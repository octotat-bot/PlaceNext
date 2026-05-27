import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, CheckCircle, Clock, ChevronRight, Building2, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import { StatCardSkeleton, DriveCardSkeleton } from '../../components/ui/Skeleton';
import StatusBadge from '../../components/ui/StatusBadge';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import { formatDate, formatPackage, formatStatus, getDaysRemaining } from '../../utils/helpers';

const StudentDashboard = () => {
  const { profile, loading: authLoading } = useAuth();
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setDataLoading(true);
      let drivesData = [];
      try {
        const r = await studentAPI.getDrives();
        drivesData = r.data.drives || [];
      } catch (e) { if (e.response?.status !== 400) console.error(e); }
      let appsData = [];
      try {
        const r = await studentAPI.getApplications();
        appsData = r.data.applications || [];
      } catch (e) { if (e.response?.status !== 400) console.error(e); }
      setDrives(drivesData);
      setApplications(appsData);
    } finally { setDataLoading(false); }
  }, []);

  useEffect(() => { if (!authLoading) fetchData(); }, [authLoading, fetchData]);

  const eligibleDrives = drives.filter(d => d.isEligible && !d.hasApplied);
  const appliedCount = applications.length;
  const shortlistedCount = applications.filter(a => ['shortlisted', 'interview-scheduled'].includes(a.applicationStatus)).length;
  const selectedCount = applications.filter(a => a.applicationStatus === 'selected').length;
  const firstName = profile?.name?.split(' ')[0] || 'Student';

  const isLoading = authLoading || dataLoading;

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto' }}>
      <PageHeader
        eyebrow="Student Portal"
        title={`Good morning,`}
        accentWord={`${firstName}.`}
        subtitle={
          !profile
            ? 'Complete your profile to start applying for placement opportunities.'
            : eligibleDrives.length > 0
              ? `You have ${eligibleDrives.length} placement opportunit${eligibleDrives.length === 1 ? 'y' : 'ies'} waiting.`
              : 'Check back for new placement opportunities.'
        }
      />

      {/* Profile incomplete banner */}
      {!profile && !isLoading && (
        <Link
          to="/profile"
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 18px', marginBottom: 24,
            background: 'var(--color-background-warning)',
            border: '0.5px solid var(--color-text-warning)',
            borderRadius: 'var(--border-radius-md)',
            textDecoration: 'none',
          }}
        >
          <FileText size={16} style={{ color: 'var(--color-text-warning)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>Complete your profile</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Required before you can browse and apply to placement drives.</div>
          </div>
          <ChevronRight size={15} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
      )}

      {/* Profile completeness */}
      {profile && profile.profileCompleteness < 100 && (
        <div className="tour-profile-progress" style={{
          padding: '12px 16px', marginBottom: 24,
          background: 'var(--color-background-secondary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 'var(--border-radius-md)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Profile completeness</span>
            <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{profile.profileCompleteness}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${profile.profileCompleteness}%`, background: 'var(--color-text-primary)' }} />
          </div>
          <Link to="/profile" style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
          >
            Complete profile <ChevronRight size={12} />
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }} className="grid-responsive-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (<>
          <StatCard label="Eligible Drives" value={eligibleDrives.length} accentColor="#3b82f6" />
          <StatCard label="Applied"         value={appliedCount}         accentColor="#8b5cf6" />
          <StatCard label="Shortlisted"     value={shortlistedCount}     accentColor="#f59e0b" />
          <StatCard label="Selected"        value={selectedCount}        accentColor="#10b981" />
        </>)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="grid-responsive-2">
        {/* Available Drives */}
        <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>Available Drives</span>
            <Link to="/drives" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
              View all <ChevronRight size={13} />
            </Link>
          </div>

          {isLoading ? (
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <DriveCardSkeleton /><DriveCardSkeleton />
            </div>
          ) : eligibleDrives.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <Briefcase size={28} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto 10px', display: 'block', opacity: 0.4 }} />
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>No new drives available</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 4 }}>Check back later</div>
            </div>
          ) : (
            <div>
              {eligibleDrives.slice(0, 3).map(drive => {
                const daysLeft = getDaysRemaining(drive.applicationDeadline);
                const urgent = daysLeft >= 0 && daysLeft <= 3;
                return (
                  <Link
                    key={drive._id}
                    to="/drives"
                    style={{ display: 'block', padding: '12px 18px', textDecoration: 'none', borderBottom: '0.5px solid var(--color-border-tertiary)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-background-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div className="avatar avatar-sm" style={{ borderRadius: 8, marginTop: 2 }}>
                        {drive.companyId?.companyName?.[0] || <Building2 size={12} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {drive.roleTitle}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                          {drive.companyId?.companyName}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--color-text-primary)' }}>
                          {formatPackage(drive.package || drive.stipend, drive.package ? 'lpa' : 'stipend')}
                        </div>
                        {drive.applicationDeadline && (
                          <div style={{ fontSize: 10, color: urgent ? 'var(--color-text-danger)' : 'var(--color-text-tertiary)', marginTop: 2 }}>
                            {daysLeft > 0 ? `${daysLeft}d left` : 'Closed'}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* My Applications */}
        <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>My Applications</span>
            <Link to="/applications" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
              View all <ChevronRight size={13} />
            </Link>
          </div>

          {isLoading ? (
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <DriveCardSkeleton /><DriveCardSkeleton />
            </div>
          ) : applications.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <FileText size={28} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto 10px', display: 'block', opacity: 0.4 }} />
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>No applications yet</div>
              <Link to="/drives" style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 6, display: 'inline-block', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
              >
                Browse drives →
              </Link>
            </div>
          ) : (
            <div>
              {applications.slice(0, 4).map(app => (
                <Link
                  key={app._id}
                  to="/applications"
                  style={{ display: 'block', padding: '12px 18px', textDecoration: 'none', borderBottom: '0.5px solid var(--color-border-tertiary)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-background-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {app.driveId?.roleTitle}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                        {app.driveId?.companyId?.companyName}
                      </div>
                      <div style={{ marginTop: 6 }}>
                        <StatusBadge status={app.applicationStatus} />
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', flexShrink: 0, marginLeft: 10, marginTop: 2 }}>
                      {formatDate(app.createdAt)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Interviews */}
      {applications.some(a => a.applicationStatus === 'interview-scheduled') && (
        <div style={{
          marginTop: 20,
          background: 'var(--color-background-info)',
          border: '0.5px solid var(--color-text-info)',
          borderRadius: 'var(--border-radius-md)',
          padding: '14px 18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Calendar size={15} style={{ color: 'var(--color-text-info)' }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>Upcoming Interviews</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {applications.filter(a => a.applicationStatus === 'interview-scheduled').map(app => (
              <div key={app._id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'var(--color-background-primary)',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 'var(--border-radius-md)',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    {app.driveId?.roleTitle} — {app.driveId?.companyId?.companyName}
                  </div>
                  {app.interviewDetails?.[app.interviewDetails.length - 1] && (
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 3 }}>
                      {formatDate(app.interviewDetails[app.interviewDetails.length - 1].date)} at{' '}
                      {app.interviewDetails[app.interviewDetails.length - 1].time}
                    </div>
                  )}
                </div>
                <StatusBadge status="interview-scheduled" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
