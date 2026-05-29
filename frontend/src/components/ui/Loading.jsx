import { Suspense, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ---------------------------------------------------------------------------
// THEME CONFIG — matches the 6 themes in src/themes/themes.js
// Applied via CSS variables (already on :root), so no import needed
// ---------------------------------------------------------------------------
const THEME_CONFIGS = {
  'midnight-ink': {
    label: 'Midnight Ink',
    icon: '◆',
    particles: ['#6366f1', '#818cf8', '#e8a045'],
    ring: '#6366f1',
    glow: 'rgba(99,102,241,0.18)',
    subtitle: 'Electric Indigo',
  },
  'obsidian': {
    label: 'Obsidian',
    icon: '◈',
    particles: ['#7c3aed', '#a78bfa', '#f59e0b'],
    ring: '#7c3aed',
    glow: 'rgba(124,58,237,0.22)',
    subtitle: 'Violet Glow',
  },
  'aurora': {
    label: 'Aurora',
    icon: '◉',
    particles: ['#059669', '#34d399', '#e8a045'],
    ring: '#059669',
    glow: 'rgba(5,150,105,0.18)',
    subtitle: 'Emerald Bloom',
  },
  'slate-pro': {
    label: 'Slate Pro',
    icon: '◇',
    particles: ['#06b6d4', '#22d3ee', '#e8a045'],
    ring: '#06b6d4',
    glow: 'rgba(6,182,212,0.18)',
    subtitle: 'Cyan Pulse',
  },
  'rosewood': {
    label: 'Rosewood',
    icon: '◐',
    particles: ['#e11d48', '#fb7185', '#f97316'],
    ring: '#e11d48',
    glow: 'rgba(225,29,72,0.18)',
    subtitle: 'Rose Flame',
  },
  'void': {
    label: 'Void',
    icon: '◯',
    particles: ['#84cc16', '#bef264', '#facc15'],
    ring: '#84cc16',
    glow: 'rgba(132,204,22,0.18)',
    subtitle: 'Acid Green',
  },
};

const DEFAULT_CONFIG = THEME_CONFIGS['midnight-ink'];

function getThemeConfig() {
  const id = document.documentElement.getAttribute('data-theme') || 'midnight-ink';
  return THEME_CONFIGS[id] || DEFAULT_CONFIG;
}

// ---------------------------------------------------------------------------
// Orbiting particle
// ---------------------------------------------------------------------------
function OrbitParticle({ color, radius, duration, delay, size = 5 }) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        top: '50%',
        left: '50%',
        marginTop: -size / 2,
        marginLeft: -size / 2,
        boxShadow: `0 0 ${size * 2}px ${color}`,
      }}
      animate={{
        x: [
          radius, 0, -radius, 0, radius,
        ],
        y: [
          0, -radius, 0, radius, 0,
        ],
        opacity: [0.8, 1, 0.8, 1, 0.8],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Animated logo mark
// ---------------------------------------------------------------------------
function LogoMark({ config }) {
  return (
    <div style={{ position: 'relative', width: 88, height: 88 }}>
      {/* Glow halo */}
      <motion.div
        style={{
          position: 'absolute',
          inset: -8,
          borderRadius: '50%',
          background: config.glow,
          filter: 'blur(12px)',
        }}
        animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.9, 1.05, 0.9] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Spinning outer ring */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `1.5px dashed ${config.ring}`,
          opacity: 0.4,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />

      {/* Spinning accent ring */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 6,
          borderRadius: '50%',
          border: `2px solid transparent`,
          borderTopColor: config.ring,
          borderRightColor: config.ring,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
      />

      {/* Inner circle */}
      <div style={{
        position: 'absolute',
        inset: 14,
        borderRadius: '50%',
        background: 'var(--color-background-secondary)',
        border: `0.5px solid var(--color-border-secondary)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <motion.span
          style={{
            fontSize: 22,
            color: config.ring,
            fontWeight: 700,
            lineHeight: 1,
            userSelect: 'none',
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {config.icon}
        </motion.span>
      </div>

      {/* Orbiting particles */}
      <OrbitParticle color={config.particles[0]} radius={44} duration={2.4} delay={0} size={5} />
      <OrbitParticle color={config.particles[1]} radius={44} duration={2.4} delay={0.8} size={4} />
      <OrbitParticle color={config.particles[2]} radius={44} duration={2.4} delay={1.6} size={3} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading bar at bottom
// ---------------------------------------------------------------------------
function LoadingBar({ config }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      height: 2,
      background: 'var(--color-background-secondary)',
      overflow: 'hidden',
    }}>
      <motion.div
        style={{
          height: '100%',
          background: `linear-gradient(90deg, transparent, ${config.ring}, ${config.particles[1] || config.ring}, transparent)`,
          width: '40%',
        }}
        animate={{ x: ['-100%', '300%'] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Floating dots
// ---------------------------------------------------------------------------
function FloatingDots({ config }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 20 }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: config.ring,
          }}
          animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, delay: i * 0.18, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Full page loading screen — theme-aware
// ---------------------------------------------------------------------------
const PageLoader = ({ message = 'Loading…' }) => {
  const [config, setConfig] = useState(getThemeConfig);

  // Re-read theme if it changes after mount (e.g. theme switch mid-session)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setConfig(getThemeConfig());
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        key="page-loader"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-background-tertiary)',
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
        }}
      >
        {/* Background grid texture */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(${config.ring}11 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          pointerEvents: 'none',
        }} />

        {/* Radial glow behind logo */}
        <div style={{
          position: 'absolute',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: config.glow,
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }} />

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, position: 'relative' }}
        >
          <LogoMark config={config} />

          {/* Brand name */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            style={{ marginTop: 24, textAlign: 'center' }}
          >
            <div style={{
              fontFamily: 'var(--font-display, "DM Serif Display", serif)',
              fontSize: 26,
              fontWeight: 400,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
              lineHeight: 1,
            }}>
              Place<em style={{ color: config.ring, fontStyle: 'italic' }}>Next</em>
            </div>
            <div style={{
              fontSize: 11,
              color: 'var(--color-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              marginTop: 6,
            }}>
              {message}
            </div>
          </motion.div>

          {/* Bouncing dots */}
          <FloatingDots config={config} />
        </motion.div>

        {/* Bottom loading bar */}
        <LoadingBar config={config} />
      </motion.div>
    </AnimatePresence>
  );
};

// ---------------------------------------------------------------------------
// Loading spinner (inline use)
// ---------------------------------------------------------------------------
const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const [config, setConfig] = useState(getThemeConfig);
  useEffect(() => {
    const observer = new MutationObserver(() => setConfig(getThemeConfig()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const px = { sm: 16, md: 32, lg: 48, xl: 64 }[size];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} className={className}>
      <motion.div
        style={{
          width: px, height: px,
          borderRadius: '50%',
          border: `2.5px solid var(--color-border-secondary)`,
          borderTopColor: config.ring,
          borderRightColor: config.ring,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Skeletons (unchanged logic, kept here for single export)
// ---------------------------------------------------------------------------
const Skel = ({ style }) => (
  <div className="animate-pulse" style={{ background: 'var(--color-background-secondary)', borderRadius: 6, ...style }} />
);

const SkeletonCard = () => (
  <div style={{ background: 'var(--color-background-primary)', borderRadius: 'var(--border-radius-lg)', padding: 24, border: '0.5px solid var(--color-border-tertiary)' }} className="animate-pulse">
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
      <Skel style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <Skel style={{ height: 14, width: '75%', marginBottom: 8 }} />
        <Skel style={{ height: 11, width: '50%' }} />
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Skel style={{ height: 11, width: '100%' }} />
      <Skel style={{ height: 11, width: '80%' }} />
    </div>
  </div>
);

const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div style={{ background: 'var(--color-background-primary)', borderRadius: 'var(--border-radius-lg)', border: '0.5px solid var(--color-border-tertiary)', overflow: 'hidden' }}>
    <div style={{ background: 'var(--color-background-secondary)', padding: '12px 16px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => <Skel key={i} style={{ height: 12 }} />)}
      </div>
    </div>
    {Array.from({ length: rows }).map((_, ri) => (
      <div key={ri} style={{ padding: '12px 16px', borderBottom: ri < rows - 1 ? '0.5px solid var(--color-border-tertiary)' : 'none' }}>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, ci) => (
            <Skel key={ci} style={{ height: 12, width: `${60 + Math.random() * 35}%` }} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

const SkeletonStats = ({ count = 4 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{ background: 'var(--color-background-primary)', borderRadius: 'var(--border-radius-lg)', padding: 16, border: '0.5px solid var(--color-border-tertiary)' }} className="animate-pulse">
        <Skel style={{ height: 28, width: '50%', marginBottom: 8 }} />
        <Skel style={{ height: 12, width: '75%' }} />
      </div>
    ))}
  </div>
);

const LazyWrapper = ({ children, fallback }) => (
  <Suspense fallback={fallback || <PageLoader />}>
    {children}
  </Suspense>
);

export { LoadingSpinner, PageLoader, SkeletonCard, SkeletonTable, SkeletonStats, LazyWrapper };
