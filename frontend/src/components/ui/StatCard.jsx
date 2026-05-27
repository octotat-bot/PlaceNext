// src/components/ui/StatCard.jsx
export default function StatCard({ label, value, meta, accentColor }) {
  return (
    <div className="stat-card" style={{ '--stat-accent': accentColor }}>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value}</div>
      {meta && (
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
          {meta}
        </div>
      )}
    </div>
  );
}
