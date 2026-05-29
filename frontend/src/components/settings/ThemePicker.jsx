// src/components/settings/ThemePicker.jsx
import { useTheme } from '../../context/ThemeContext';

export default function ThemePicker() {
  const { themeId, changeTheme, themes, currentTheme } = useTheme();

  return (
    <div>
      {/* Section header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{
          fontFamily: 'var(--font-display, "DM Serif Display", serif)',
          fontSize: 20,
          fontWeight: 400,
          color: 'var(--color-text-primary)',
          marginBottom: 4,
        }}>
          Appearance
        </h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          Choose a theme. Your preference is saved to your account and won't
          affect other users.
        </p>
      </div>

      {/* Theme grid — 3 columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10,
        marginBottom: 20,
      }}>
        {themes.map(theme => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            selected={themeId === theme.id}
            onSelect={() => changeTheme(theme.id)}
          />
        ))}
      </div>

      {/* Current theme confirmation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 14px',
        background: 'var(--accent-bg)',
        border: '0.5px solid var(--color-border-secondary)',
        borderRadius: 7,
        fontSize: 13,
      }}>
        <div style={{
          width: 8, height: 8,
          borderRadius: '50%',
          background: 'var(--accent)',
          flexShrink: 0,
        }} />
        <span style={{ color: 'var(--color-text-secondary)' }}>Active theme:</span>
        <strong style={{ color: 'var(--color-text-primary)' }}>{currentTheme.name}</strong>
        <span style={{ color: 'var(--color-text-tertiary)', fontSize: 12 }}>
          — {currentTheme.description}
        </span>
      </div>
    </div>
  );
}


function ThemeCard({ theme, selected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      style={{
        background: theme.vars['--color-background-primary'],
        border: selected
          ? `2px solid ${theme.vars['--accent']}`
          : `0.5px solid ${theme.vars['--color-border-secondary']}`,
        borderRadius: 10,
        padding: 14,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'border-color 0.15s, transform 0.1s, box-shadow 0.15s',
        position: 'relative',
        fontFamily: 'inherit',
        boxShadow: selected ? `0 0 0 4px ${theme.vars['--accent']}22` : 'none',
      }}
      onMouseEnter={e => {
        if (!selected) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = selected ? `0 0 0 4px ${theme.vars['--accent']}22` : 'none';
      }}
      aria-pressed={selected}
      aria-label={`Select ${theme.name} theme`}
    >
      {/* Selected checkmark */}
      {selected && (
        <div style={{
          position: 'absolute',
          top: 8, right: 8,
          width: 18, height: 18,
          borderRadius: '50%',
          background: theme.vars['--accent'],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          color: '#fff',
          fontWeight: 700,
        }}>
          ✓
        </div>
      )}

      {/* Color swatches */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
        {theme.swatchColors.map((color, i) => (
          <div key={i} style={{
            width: 16, height: 16,
            borderRadius: '50%',
            background: color,
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        ))}
      </div>

      {/* Mini preview strip */}
      <MiniPreview theme={theme} />

      {/* Name + description */}
      <div style={{
        fontSize: 12,
        fontWeight: 600,
        color: theme.vars['--color-text-primary'],
        marginTop: 10,
        marginBottom: 2,
      }}>
        {theme.name}
      </div>
      <div style={{
        fontSize: 11,
        color: theme.vars['--color-text-tertiary'],
      }}>
        {theme.description}
      </div>
    </button>
  );
}


function MiniPreview({ theme }) {
  const v = theme.vars;
  return (
    <div style={{
      background: v['--color-background-tertiary'],
      borderRadius: 6,
      padding: '8px 10px',
      display: 'flex',
      flexDirection: 'column',
      gap: 5,
      border: `0.5px solid ${v['--color-border-tertiary']}`,
    }}>
      {/* Fake heading */}
      <div style={{
        fontFamily: 'var(--font-display, "DM Serif Display", serif)',
        fontSize: 11,
        color: v['--color-text-primary'],
        lineHeight: 1,
      }}>
        Dashboard
      </div>

      {/* Fake stat cards row */}
      <div style={{ display: 'flex', gap: 4 }}>
        {[v['--accent'], v['--gold'], '#22c55e', '#14b8a6'].map((c, i) => (
          <div key={i} style={{
            flex: 1,
            height: 24,
            background: v['--color-background-primary'],
            borderRadius: 4,
            border: `0.5px solid ${v['--color-border-tertiary']}`,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: 2,
              background: c,
            }} />
          </div>
        ))}
      </div>

      {/* Fake active nav item */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        background: v['--accent-bg'],
        borderRadius: 4,
        padding: '3px 6px',
      }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: v['--accent'] }} />
        <div style={{ height: 4, width: 40, borderRadius: 2, background: v['--accent'], opacity: 0.5 }} />
      </div>
    </div>
  );
}
