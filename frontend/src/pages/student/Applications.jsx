import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, MapPin, Video, ChevronRight } from 'lucide-react';
import { studentAPI } from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import HintTooltip from '../../components/ui/HintTooltip';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatDate, formatDateTime, formatStatus } from '../../utils/helpers';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { value: 'all',                  label: 'All' },
  { value: 'applied',              label: 'Applied' },
  { value: 'under-review',         label: 'Under Review' },
  { value: 'shortlisted',          label: 'Shortlisted' },
  { value: 'interview-scheduled',  label: 'Interview' },
  { value: 'selected',             label: 'Selected' },
  { value: 'rejected',             label: 'Rejected' },
];

const Applications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data } = await studentAPI.getApplications();
      setApplications(data.applications || []);
    } catch { toast.error('Failed to load applications'); }
    finally { setLoading(false); }
  };

  const handleWithdraw = async () => {
    if (!selectedApp) return;
    setWithdrawing(true);
    try {
      await studentAPI.withdrawApplication(selectedApp._id);
      toast.success('Application withdrawn');
      setShowDetails(false); setSelectedApp(null);
      fetchApplications();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to withdraw'); }
    finally { setWithdrawing(false); }
  };

  const filtered = applications.filter(a => filter === 'all' || a.applicationStatus === filter);
  const counts = { all: applications.length };
  STATUS_TABS.slice(1).forEach(({ value }) => {
    counts[value] = applications.filter(a => a.applicationStatus === value).length;
  });

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto' }}>
      <PageHeader
        eyebrow="Student Portal"
        title="My"
        accentWord="applications."
        subtitle="Track and manage your placement applications"
      />

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={filter === tab.value ? 'btn btn-primary btn-sm' : 'btn btn-sm'}
            style={{ gap: 4 }}
          >
            {tab.label}
            {counts[tab.value] > 0 && (
              <span style={{
                fontSize: 10, minWidth: 16, height: 16,
                borderRadius: 8, padding: '0 4px',
                background: filter === tab.value ? 'rgba(255,255,255,0.25)' : 'var(--color-background-secondary)',
                color: filter === tab.value ? '#fff' : 'var(--color-text-secondary)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {counts[tab.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {Array(4).fill(0).map((_, i) => (
            <div key={i} style={{ padding: '14px 0', display: 'flex', gap: 12, alignItems: 'center' }}>
              <Skeleton style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <Skeleton style={{ height: 13, width: '55%', marginBottom: 6 }} />
                <Skeleton style={{ height: 11, width: '35%' }} />
              </div>
              <Skeleton style={{ height: 22, width: 80, borderRadius: 100 }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="ti-file-text"
          title={filter === 'all' ? "You haven't applied to anything yet" : `No ${formatStatus(filter)} applications`}
          body="Browse open drives and apply with one click. Your resume and profile are sent automatically."
          cta={filter === 'all' ? { label: 'Browse drives', href: '/drives' } : null}
        />
      ) : (
        <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
          {filtered.map((app, idx) => (
            <div key={app._id}>
              <div
                style={{ padding: '14px 18px', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-background-secondary)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => { setSelectedApp(app); setShowDetails(true); }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="avatar avatar-md" style={{ flexShrink: 0, fontSize: 15, fontFamily: 'var(--font-display)' }}>
                    {app.driveId?.companyId?.companyName?.[0] || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {app.driveId?.roleTitle}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                      {app.driveId?.companyId?.companyName}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <StatusBadge status={app.applicationStatus} />
                    <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>
                      {formatDate(app.createdAt)}
                    </div>
                  </div>
                  <ChevronRight size={13} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
                </div>

                {/* Interview info */}
                {app.applicationStatus === 'interview-scheduled' && app.interviewDetails?.length > 0 && (
                  <div style={{
                    marginTop: 10, padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'flex-start',
                    background: 'var(--color-background-info)', border: '0.5px solid var(--color-text-info)',
                    borderRadius: 'var(--border-radius-md)',
                  }}>
                    <Video size={13} style={{ color: 'var(--color-text-info)', marginTop: 1, flexShrink: 0 }} />
                    <div style={{ fontSize: 12 }}>
                      <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                        {app.interviewDetails[app.interviewDetails.length - 1].roundName}
                      </span>
                      <span style={{ color: 'var(--color-text-secondary)', marginLeft: 6 }}>
                        {formatDateTime(app.interviewDetails[app.interviewDetails.length - 1].date)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {idx < filtered.length - 1 && (
                <div style={{ height: '0.5px', background: 'var(--color-border-tertiary)' }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => { setShowDetails(false); setSelectedApp(null); }}
        title="Application Details"
        maxWidth="560px"
      >
        {selectedApp && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Header */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="avatar avatar-lg" style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>
                {selectedApp.driveId?.companyId?.companyName?.[0] || '?'}
              </div>
              <div>
                <div style={{ fontSize: 16, fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
                  {selectedApp.driveId?.roleTitle}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                  {selectedApp.driveId?.companyId?.companyName}
                </div>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <StatusBadge status={selectedApp.applicationStatus} />
                  <HintTooltip text="Updated by the recruiter. You'll receive a notification on every status change." />
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <div className="form-label">Application Timeline</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {selectedApp.statusHistory?.map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%', marginTop: 5,
                        background: i === selectedApp.statusHistory.length - 1 ? 'var(--color-text-primary)' : 'var(--color-border-secondary)',
                      }} />
                      {i < selectedApp.statusHistory.length - 1 && (
                        <div style={{ width: 1, flex: 1, minHeight: 20, background: 'var(--color-border-tertiary)', margin: '3px 0' }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: 12, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{formatStatus(h.status)}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{formatDateTime(h.changedAt)}</div>
                      {h.notes && <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{h.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interview Details */}
            {selectedApp.interviewDetails?.length > 0 && (
              <div>
                <div className="form-label">Interview Schedule</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedApp.interviewDetails.map((interview, i) => (
                    <div key={i} style={{ padding: '12px 14px', background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                            {interview.roundName || `Round ${interview.round}`}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={12} /> {formatDateTime(interview.date)}
                          </div>
                          {interview.venue && (
                            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                              <MapPin size={12} /> {interview.venue}
                            </div>
                          )}
                        </div>
                        {interview.meetingLink && (
                          <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                            <Video size={12} /> Join
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Withdraw */}
            {['applied', 'under-review', 'shortlisted'].includes(selectedApp.applicationStatus) && (
              <div style={{ paddingTop: 8, borderTop: '0.5px solid var(--color-border-tertiary)' }}>
                <Button variant="danger" loading={withdrawing} onClick={handleWithdraw}>
                  Withdraw Application
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Applications;
