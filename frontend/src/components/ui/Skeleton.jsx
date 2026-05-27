// src/components/ui/Skeleton.jsx
export const Skeleton = ({ className = '', style = {} }) => (
  <div
    className={`animate-pulse ${className}`}
    style={{ background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-md)', ...style }}
  />
);

export const StatCardSkeleton = () => (
  <div className="stat-card" style={{ '--stat-accent': 'var(--color-border-secondary)' }}>
    <Skeleton style={{ height: 11, width: '60%', marginBottom: 10 }} />
    <Skeleton style={{ height: 26, width: '40%', marginBottom: 6 }} />
    <Skeleton style={{ height: 12, width: '50%' }} />
  </div>
);

export const ChartSkeleton = () => (
  <div className="card" style={{ height: 280 }}>
    <Skeleton style={{ height: 14, width: '40%', marginBottom: 20 }} />
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 180 }}>
      {[60, 80, 50, 90, 70, 85, 65].map((h, i) => (
        <Skeleton key={i} style={{ height: `${h}%`, flex: 1, borderRadius: 4 }} />
      ))}
    </div>
  </div>
);

export const DriveCardSkeleton = () => (
  <div style={{ border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', padding: '16px 18px' }}>
    <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
      <Skeleton style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <Skeleton style={{ height: 14, width: '60%', marginBottom: 6 }} />
        <Skeleton style={{ height: 12, width: '40%' }} />
      </div>
    </div>
    <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
      <Skeleton style={{ height: 22, width: 60, borderRadius: 100 }} />
      <Skeleton style={{ height: 22, width: 70, borderRadius: 100 }} />
    </div>
    <Skeleton style={{ height: 0.5, marginBottom: 10 }} />
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Skeleton style={{ height: 15, width: '30%' }} />
      <Skeleton style={{ height: 28, width: 60, borderRadius: 100 }} />
    </div>
  </div>
);

export const TableRowSkeleton = ({ cols = 4 }) => (
  <div style={{ display: 'flex', gap: 16, padding: '12px 0', alignItems: 'center' }}>
    {Array(cols).fill(0).map((_, i) => (
      <Skeleton key={i} style={{ height: 14, flex: i === 0 ? 2 : 1 }} />
    ))}
  </div>
);

export const ListItemSkeleton = () => (
  <div style={{ border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', padding: '16px 18px' }}>
    <div style={{ display: 'flex', gap: 12 }}>
      <Skeleton style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 10 }}>
          <Skeleton style={{ height: 14, width: '40%' }} />
          <Skeleton style={{ height: 20, width: 70, borderRadius: 100 }} />
        </div>
        <Skeleton style={{ height: 12, width: '70%', marginBottom: 6 }} />
        <Skeleton style={{ height: 12, width: '50%', marginBottom: 12 }} />
        <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '0.5px solid var(--color-border-tertiary)' }}>
          <Skeleton style={{ height: 28, width: 80, borderRadius: 100 }} />
          <Skeleton style={{ height: 28, width: 80, borderRadius: 100 }} />
        </div>
      </div>
    </div>
  </div>
);

export default Skeleton;

