// src/components/ui/PageHeader.jsx
export default function PageHeader({ eyebrow, title, accentWord, subtitle, actions }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 28,
      gap: 16,
    }}>
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="page-title">
          {title}{accentWord && <> <em>{accentWord}</em></>}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 6, fontWeight: 400 }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4, flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </div>
  );
}
