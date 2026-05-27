import { useState, useEffect } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { Search, Briefcase, AlertCircle } from 'lucide-react';
import { studentAPI } from '../../services/api';
import DriveCard from '../../components/student/DriveCard';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import { DriveCardSkeleton } from '../../components/ui/Skeleton';
import { formatDate, formatPackage, getDaysRemaining } from '../../utils/helpers';
import toast from 'react-hot-toast';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'eligible', label: 'Eligible' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'applied', label: 'Applied' },
];

const Drives = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [expandedDrive, setExpandedDrive] = useState(null);

  useEffect(() => { fetchDrives(); }, []);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const { data } = await studentAPI.getDrives();
      setDrives(data.drives || []);
    } catch { toast.error('Failed to load drives'); }
    finally { setLoading(false); }
  };

  const handleApply = async () => {
    if (!selectedDrive) return;
    setApplying(true);
    try {
      await studentAPI.applyToDrive(selectedDrive._id, { coverLetter: coverLetter.trim() || undefined });
      toast.success('Application submitted!');
      setShowApplyModal(false); setSelectedDrive(null); setCoverLetter('');
      fetchDrives();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to apply'); }
    finally { setApplying(false); }
  };

  const filteredDrives = drives.filter(drive => {
    const q = debouncedSearch.toLowerCase();
    const matchSearch = (drive.roleTitle || '').toLowerCase().includes(q) ||
      (drive.companyId?.companyName || '').toLowerCase().includes(q);
    const matchFilter =
      activeFilter === 'all' ? true :
      activeFilter === 'eligible' ? drive.isEligible :
      activeFilter === 'applied' ? drive.hasApplied :
      drive.jobType === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto' }}>
      <PageHeader
        eyebrow="Student Portal"
        title="Placement"
        accentWord="drives."
        subtitle="Browse and apply to available opportunities"
      />

      {/* Search & Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 36 }}
            placeholder="Search by role or company…"
          />
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={activeFilter === f.value ? 'btn btn-primary btn-sm' : 'btn btn-sm'}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array(4).fill(0).map((_, i) => <DriveCardSkeleton key={i} />)}
        </div>
      ) : filteredDrives.length === 0 ? (
        <EmptyState 
          icon="ti-briefcase" 
          title="No eligible drives right now" 
          body="Check back soon — new drives are added regularly. Make sure your profile is complete to match more drives."
          cta={{ label: 'Complete profile', href: '/profile' }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredDrives.map(drive => (
            <div key={drive._id}>
              <DriveCard
                drive={drive}
                onApply={() => { setSelectedDrive(drive); setShowApplyModal(true); }}
              />
              {/* Expanded Details */}
              <div style={{ marginTop: expandedDrive === drive._id ? 0 : -2 }}>
                <button
                  onClick={() => setExpandedDrive(expandedDrive === drive._id ? null : drive._id)}
                  style={{ fontSize: 11, color: 'var(--color-text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', width: '100%', textAlign: 'right' }}
                >
                  {expandedDrive === drive._id ? 'Hide details ↑' : 'Show details ↓'}
                </button>

                {expandedDrive === drive._id && (
                  <div style={{
                    border: '0.5px solid var(--color-border-tertiary)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: '16px 18px',
                    background: 'var(--color-background-secondary)',
                    marginBottom: 4,
                  }}>
                    {/* Eligibility Issues */}
                    {!drive.isEligible && (
                      <div style={{
                        display: 'flex', gap: 8, alignItems: 'flex-start',
                        padding: '10px 12px', marginBottom: 12,
                        background: 'var(--color-background-danger)',
                        border: '0.5px solid var(--color-text-danger)',
                        borderRadius: 'var(--border-radius-md)',
                      }}>
                        <AlertCircle size={13} style={{ color: 'var(--color-text-danger)', marginTop: 1, flexShrink: 0 }} />
                        <div style={{ fontSize: 12, color: 'var(--color-text-danger)' }}>
                          {drive.eligibilityReasons?.filter(r => r !== 'All eligibility criteria met').join(', ')}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <div className="form-label">Description</div>
                        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{drive.roleDescription || '—'}</div>
                      </div>
                      <div>
                        <div className="form-label">Eligibility</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                          Min CGPA: {drive.eligibilityCriteria?.minCGPA || '—'}<br />
                          Branches: {drive.eligibilityCriteria?.allowedBranches?.join(', ') || 'All'}<br />
                          Max Backlogs: {drive.eligibilityCriteria?.maxBacklogs || 0}
                        </div>
                      </div>
                    </div>

                    {drive.selectionProcess?.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div className="form-label">Selection Process</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {drive.selectionProcess.map((step, i) => (
                            <span key={i} className="tag">Round {step.round}: {step.name}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => { setShowApplyModal(false); setSelectedDrive(null); setCoverLetter(''); }}
        title="Confirm Application"
        footer={<>
          <button className="btn" onClick={() => { setShowApplyModal(false); setSelectedDrive(null); }}>Cancel</button>
          <Button variant="primary" loading={applying} onClick={handleApply}>Submit Application</Button>
        </>}
      >
        {selectedDrive && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '12px 14px', background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)' }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{selectedDrive.roleTitle}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{selectedDrive.companyId?.companyName}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--color-text-primary)', marginTop: 4 }}>
                {formatPackage(selectedDrive.package || selectedDrive.stipend, selectedDrive.package ? 'lpa' : 'stipend')}
              </div>
            </div>

            <div>
              <label className="form-label">Cover Letter (optional)</label>
              <textarea
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="Tell the recruiter why you're a great fit…"
                className="form-textarea"
              />
              <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 4 }}>{coverLetter.length}/1000</div>
            </div>

            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Your profile and resume will be shared with the company. Make sure they're up to date.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Drives;
