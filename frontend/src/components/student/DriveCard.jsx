// src/components/student/DriveCard.jsx
import StatusBadge from '../ui/StatusBadge';

function formatPackage(pkg, stipend) {
  if (pkg) return `₹${(pkg / 100000).toFixed(0)} LPA`;
  if (stipend) return `₹${stipend.toLocaleString('en-IN')}/mo`;
  return null;
}

function daysLeft(deadline) {
  if (!deadline) return null;
  const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'Closed';
  if (diff === 0) return 'Closes today';
  if (diff <= 7) return `${diff}d left`;
  return new Date(deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function DriveCard({ drive, onApply }) {
  const {
    _id, roleTitle, companyId, package: pkg, stipend,
    jobType, applicationDeadline, driveStatus,
    requiredSkills, hasApplied, applicationStatus,
    workMode, location,
  } = drive;

  const isUrgent = (() => {
    const diff = Math.ceil((new Date(applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 3;
  })();

  return (
    <div
      style={{
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 'var(--border-radius-lg)',
        padding: '16px 18px',
        background: 'var(--color-background-primary)',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-border-secondary)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border-tertiary)'}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', minWidth: 0 }}>
          <div
            className="avatar avatar-md"
            style={{ flexShrink: 0, fontSize: 15, fontFamily: 'var(--font-display)' }}
          >
            {companyId?.companyName?.[0] || '?'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {roleTitle}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
              {companyId?.companyName}
              {location && <span style={{ color: 'var(--color-text-tertiary)' }}> · {location}</span>}
            </div>
          </div>
        </div>
        <StatusBadge status={hasApplied ? (applicationStatus || 'applied') : driveStatus} />
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '10px 0' }}>
        {jobType && <span className="tag">{jobType}</span>}
        {workMode && workMode !== 'on-site' && <span className="tag">{workMode}</span>}
        {requiredSkills?.slice(0, 3).map(s => <span key={s} className="tag">{s}</span>)}
        {requiredSkills?.length > 3 && (
          <span className="tag" style={{ color: 'var(--color-text-tertiary)' }}>+{requiredSkills.length - 3}</span>
        )}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 10,
        borderTop: '0.5px solid var(--color-border-tertiary)',
        marginTop: 4,
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--color-text-primary)' }}>
          {formatPackage(pkg, stipend) || '—'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {applicationDeadline && (
            <span style={{
              fontSize: 11,
              color: isUrgent ? 'var(--color-text-danger)' : 'var(--color-text-tertiary)',
              fontWeight: isUrgent ? 500 : 400,
            }}>
              {daysLeft(applicationDeadline)}
            </span>
          )}
          {!hasApplied && driveStatus === 'active' && onApply && (
            <button
              className="btn btn-primary btn-sm"
              onClick={e => { e.stopPropagation(); onApply(_id); }}
            >
              Apply
            </button>
          )}
          {hasApplied && (
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Applied</span>
          )}
        </div>
      </div>
    </div>
  );
}
