import { useState, useEffect, useCallback } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import {
  Calendar, Clock, Video, MapPin, CheckCircle, XCircle,
  FileText, Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { recruiterAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { ListItemSkeleton } from '../../components/ui/Skeleton';

/* ─── InterviewCard ─── */
const InterviewCard = ({ interview, onComplete, onCancel }) => {
  const isToday = interview.date === 'Today';
  const isPast = interview.status === 'completed' || interview.status === 'cancelled';

  return (
    <div style={{
      background: 'var(--color-background-primary)',
      border: isToday && !isPast
        ? '0.5px solid var(--color-border-secondary)'
        : '0.5px solid var(--color-border-tertiary)',
      borderRadius: 'var(--border-radius-lg)',
      padding: '16px 18px',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-border-secondary)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = isToday && !isPast ? 'var(--color-border-secondary)' : 'var(--color-border-tertiary)'}
    >
      {isToday && !isPast && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 11, fontWeight: 500, color: 'var(--color-text-warning)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-text-warning)' }} />
          Today
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div className="avatar avatar-md" style={{ fontFamily: 'var(--font-display)', fontSize: 16, flexShrink: 0 }}>
          {interview.candidateName?.charAt(0) || '?'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{interview.candidateName}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                {interview.position}{interview.company ? ` · ${interview.company}` : ''}
              </div>
            </div>
            <StatusBadge status={interview.status || 'interview'} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: isPast ? 0 : 10 }}>
            {[
              { icon: Calendar, text: isToday ? 'Today' : formatDate(interview.date) },
              { icon: Clock, text: interview.time },
              { icon: interview.type === 'video' ? Video : MapPin, text: interview.type === 'video' ? 'Video Call' : interview.location },
              { icon: FileText, text: interview.round },
            ].filter(i => i.text).map(({ icon: Icon, text }, idx) => (
              <div key={idx} style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon size={11} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} /> {text}
              </div>
            ))}
          </div>

          {!isPast && (
            <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '0.5px solid var(--color-border-tertiary)', flexWrap: 'wrap' }}>
              {interview.meetingLink && (
                <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                  <Video size={12} /> Join Call
                </a>
              )}
              <button onClick={() => onComplete(interview.id)} className="btn btn-sm" style={{ background: 'var(--color-background-success)', color: 'var(--color-text-success)', borderColor: 'var(--color-text-success)' }}>
                <CheckCircle size={12} /> Complete
              </button>
              <button onClick={() => onCancel(interview.id)} className="btn btn-sm btn-danger">
                <XCircle size={12} /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── RecruiterInterviews ─── */
const STATUS_TABS = ['upcoming', 'completed', 'cancelled', 'all'];

const RecruiterInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const fetchInterviews = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await recruiterAPI.getInterviews({ status: filter !== 'all' ? filter : undefined });
      setInterviews(data.interviews || []);
    } catch { toast.error('Failed to load interviews'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchInterviews(); }, [fetchInterviews]);

  const handleComplete = async (id) => {
    try { await recruiterAPI.updateApplicationStatus(id, { status: 'hired' }); toast.success('Marked complete'); fetchInterviews(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const handleCancel = async (id) => {
    try { await recruiterAPI.cancelInterview(id); toast.success('Cancelled'); fetchInterviews(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const filtered = interviews.filter(i => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return (i.candidateName || '').toLowerCase().includes(q) || (i.position || '').toLowerCase().includes(q);
  });

  const stats = {
    today:     interviews.filter(i => i.date === 'Today' && i.status === 'scheduled').length,
    upcoming:  interviews.filter(i => i.status === 'scheduled').length,
    completed: interviews.filter(i => i.status === 'completed').length,
  };

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto' }}>
      <PageHeader
        eyebrow="Recruiter"
        title="Scheduled"
        accentWord="interviews."
        subtitle="Manage your upcoming and past interview sessions"
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }} className="grid-responsive-3">
        <StatCard label="Today"     value={stats.today}     accentColor="#f59e0b" />
        <StatCard label="Upcoming"  value={stats.upcoming}  accentColor="#3b82f6" />
        <StatCard label="Completed" value={stats.completed} accentColor="#10b981" />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 260 }}>
          <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search candidates…" className="form-input" style={{ paddingLeft: 30 }} />
        </div>
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
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)' }}>
          <Calendar size={28} style={{ margin: '0 auto 10px', display: 'block', color: 'var(--color-text-tertiary)', opacity: 0.4 }} />
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-secondary)' }}>No interviews found</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 4 }}>
            {filter === 'upcoming' ? 'Schedule interviews with shortlisted candidates' : 'No interviews match your filter'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(interview => (
            <InterviewCard key={interview.id} interview={interview} onComplete={handleComplete} onCancel={handleCancel} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterInterviews;
