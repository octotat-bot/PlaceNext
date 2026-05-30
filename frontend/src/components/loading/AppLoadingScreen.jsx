// src/components/loading/AppLoadingScreen.jsx
// Shows a branded loading screen once per tab session.
// sessionStorage key clears when the tab closes — so it shows again next time.
// On page refresh the key still exists → loading screen is skipped instantly.

import { useEffect, useState } from 'react';

const SESSION_KEY = 'app_session_started';

export default function AppLoadingScreen({ onComplete }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('loading'); // 'loading' | 'done'
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const alreadyPlayed = sessionStorage.getItem(SESSION_KEY);

    if (alreadyPlayed) {
      // Refresh or re-render — skip immediately
      onComplete();
      return;
    }

    // New tab session — show loading screen
    setVisible(true);

    const duration = 2000;
    let start = null;

    const tick = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);

      if (pct < 100) {
        requestAnimationFrame(tick);
      } else {
        setPhase('done');
        setTimeout(() => {
          setFading(true);
          sessionStorage.setItem(SESSION_KEY, '1');
          setTimeout(() => {
            setVisible(false);
            onComplete();
          }, 450);
        }, 400);
      }
    };

    requestAnimationFrame(tick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'var(--color-background-tertiary, #f8f9fa)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.45s ease',
        pointerEvents: fading ? 'none' : 'all',
      }}
    >
      {/* Dot grid background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(var(--accent, #6366f1)18 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        opacity: 0.35,
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          position: 'relative',
          animation: 'pn_fadeUp 0.5s ease forwards',
        }}
      >
        {/* Logo icon */}
        <div style={{
          width: 52,
          height: 52,
          background: 'var(--accent, #6366f1)',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px var(--accent, #6366f1)44',
          animation: 'pn_pulse 2s ease-in-out infinite',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>

        {/* Brand name */}
        <div style={{
          fontFamily: 'var(--font-display, "DM Serif Display", serif)',
          fontSize: 30,
          fontWeight: 400,
          color: 'var(--color-text-primary, #1a1a2e)',
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}>
          Place<em style={{ fontStyle: 'italic', color: 'var(--accent, #6366f1)' }}>Next</em>
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 12,
          color: 'var(--color-text-tertiary, #9ca3af)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontWeight: 500,
        }}>
          Your placement, simplified.
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          marginTop: 52,
          width: 180,
          position: 'relative',
          animation: 'pn_fadeIn 0.3s ease 0.3s both',
        }}
      >
        <div style={{
          height: 2,
          background: 'var(--color-border-secondary, #e5e7eb)',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'var(--accent, #6366f1)',
            borderRadius: 2,
            transition: 'width 0.06s linear',
          }} />
        </div>

        <div style={{
          marginTop: 10,
          fontSize: 10,
          color: 'var(--color-text-tertiary, #9ca3af)',
          textAlign: 'center',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}>
          {phase === 'done' ? 'Ready' : 'Loading'}
        </div>
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes pn_fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pn_fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pn_pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 32px var(--accent, #6366f1)44; }
          50%       { transform: scale(1.06); box-shadow: 0 12px 40px var(--accent, #6366f1)66; }
        }
      `}</style>
    </div>
  );
}
