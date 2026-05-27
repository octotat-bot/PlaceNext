import { useState, useEffect } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import {
  Building2, Check, X, Clock, Mail, Calendar, Search,
  RefreshCw, CheckCircle, XCircle, Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

/* ─── RecruiterCard ─────────────────────────────────── */
const RecruiterCard = ({ recruiter, onApprove, onReject, loading }) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const statusMap = {
    pending:  'pending',
    approved: 'active',
    rejected: 'rejected',
  };

  return (
    <>
      <div style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 'var(--border-radius-lg)',
        padding: '18px',
        transition: 'border-color 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-border-secondary)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border-tertiary)'}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div className="avatar avatar-md" style={{ fontFamily: 'var(--font-display)', fontSize: 16, flexShrink: 0 }}>
              {recruiter.companyName?.charAt(0) || 'R'}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{recruiter.name}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Building2 size={11} /> {recruiter.companyName}
              </div>
            </div>
          </div>
          <StatusBadge status={statusMap[recruiter.accountStatus] || 'pending'} />
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Mail size={11} style={{ flexShrink: 0 }} /> {recruiter.email}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={11} style={{ flexShrink: 0 }} />
            Registered: {recruiter.createdAt
              ? new Date(recruiter.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—'}
          </div>
        </div>

        {/* Actions */}
        {recruiter.accountStatus === 'pending' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onApprove(recruiter._id)}
              disabled={loading}
              className="btn btn-sm"
              style={{
                flex: 1, justifyContent: 'center',
                background: 'var(--color-background-success)',
                color: 'var(--color-text-success)',
                borderColor: 'var(--color-text-success)',
              }}
            >
              <Check size={13} /> Approve
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={loading}
              className="btn btn-sm btn-danger"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <X size={13} /> Reject
            </button>
          </div>
        )}

        {recruiter.accountStatus === 'rejected' && recruiter.rejectionReason && (
          <div style={{
            padding: '8px 12px', fontSize: 12,
            background: 'var(--color-background-danger)',
            border: '0.5px solid var(--color-text-danger)',
            borderRadius: 'var(--border-radius-md)',
            color: 'var(--color-text-danger)',
          }}>
            <strong>Reason:</strong> {recruiter.rejectionReason}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => { setShowRejectModal(false); setRejectReason(''); }}
        title="Reject Registration"
        footer={<>
          <button className="btn" onClick={() => setShowRejectModal(false)}>Cancel</button>
          <button className="btn btn-danger" onClick={() => {
            onReject(recruiter._id, rejectReason);
            setShowRejectModal(false);
            setRejectReason('');
          }}>
            Confirm Reject
          </button>
        </>}
      >
        <div style={{ marginBottom: 8, fontSize: 13, color: 'var(--color-text-secondary)' }}>
          {recruiter.name} from {recruiter.companyName}
        </div>
        <label className="form-label">Rejection Reason (optional)</label>
        <textarea
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
          className="form-textarea"
          rows={3}
          placeholder="Provide a reason for rejection…"
        />
      </Modal>
    </>
  );
};

/* ─── Recruiters Page ───────────────────────────────── */
const STATUS_TABS = [
  { id: 'all',      label: 'All' },
  { id: 'pending',  label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

const Recruiters = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const fetchRecruiters = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/recruiters');
      setRecruiters(data.data || []);
    } catch { toast.error('Failed to fetch recruiters'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRecruiters(); }, []);

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      await api.put(`/admin/recruiters/${id}/approve`);
      toast.success('Recruiter approved!');
      fetchRecruiters();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to approve'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async (id, reason) => {
    try {
      setActionLoading(true);
      await api.put(`/admin/recruiters/${id}/reject`, { reason });
      toast.success('Registration rejected');
      fetchRecruiters();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to reject'); }
    finally { setActionLoading(false); }
  };

  const counts = {
    all:      recruiters.length,
    pending:  recruiters.filter(r => r.accountStatus === 'pending').length,
    approved: recruiters.filter(r => r.accountStatus === 'approved').length,
    rejected: recruiters.filter(r => r.accountStatus === 'rejected').length,
  };

  const filtered = recruiters.filter(r => {
    const matchesFilter = filter === 'all' || r.accountStatus === filter;
    if (!debouncedSearch) return matchesFilter;
    const q = debouncedSearch.toLowerCase();
    return matchesFilter && (
      (r.name || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.companyName || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto' }}>
      <PageHeader
        eyebrow="Admin"
        title="Recruiter"
        accentWord="management."
        subtitle="Review and approve recruiter registrations"
        actions={
          <button className="btn btn-sm" onClick={fetchRecruiters} disabled={loading}>
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        }
      />

      {/* Pending alert */}
      {counts.pending > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', marginBottom: 20,
          background: 'var(--color-background-warning)',
          border: '0.5px solid var(--color-text-warning)',
          borderRadius: 'var(--border-radius-md)',
        }}>
          <Clock size={15} style={{ color: 'var(--color-text-warning)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {counts.pending} recruiter{counts.pending > 1 ? 's' : ''} pending approval
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              Review and approve new recruiter registrations
            </div>
          </div>
        </div>
      )}

      {/* Filters + Search */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {STATUS_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={filter === tab.id ? 'btn btn-primary btn-sm' : 'btn btn-sm'}
              style={{ gap: 4 }}
            >
              {tab.label}
              {counts[tab.id] > 0 && (
                <span style={{
                  fontSize: 10, minWidth: 16, height: 16, borderRadius: 8, padding: '0 4px',
                  background: filter === tab.id ? 'rgba(255,255,255,0.25)' : 'var(--color-background-secondary)',
                  color: filter === tab.id ? '#fff' : 'var(--color-text-secondary)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {counts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search name, email, company…"
            className="form-input"
            style={{ paddingLeft: 32 }}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }} className="grid-responsive-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} style={{ padding: 18, background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <Skeleton style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <Skeleton style={{ height: 14, width: '60%', marginBottom: 6 }} />
                  <Skeleton style={{ height: 12, width: '40%' }} />
                </div>
              </div>
              <Skeleton style={{ height: 11, marginBottom: 6 }} />
              <Skeleton style={{ height: 11, width: '70%', marginBottom: 14 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <Skeleton style={{ height: 30, flex: 1, borderRadius: 100 }} />
                <Skeleton style={{ height: 30, flex: 1, borderRadius: 100 }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)' }}>
          <Users size={28} style={{ margin: '0 auto 10px', display: 'block', color: 'var(--color-text-tertiary)', opacity: 0.4 }} />
          <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', fontWeight: 500 }}>No recruiters found</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 4 }}>
            {filter !== 'all' ? `No ${filter} recruiters at the moment` : 'Recruiters will appear here once they register'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }} className="grid-responsive-3">
          {filtered.map(recruiter => (
            <RecruiterCard
              key={recruiter._id}
              recruiter={recruiter}
              onApprove={handleApprove}
              onReject={handleReject}
              loading={actionLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Recruiters;
