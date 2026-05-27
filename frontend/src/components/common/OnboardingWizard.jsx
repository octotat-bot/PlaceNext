import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Joyride, STATUS, EVENTS } from 'react-joyride';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

/* ─────────────────────────────────────────────────────────
   Design tokens
   ───────────────────────────────────────────────────────── */
const T = {
    bg:       '#0f0f0f',
    surface:  '#141414',
    border:   '#2a2a2a',
    gold:     '#facc15',
    goldDim:  'rgba(250,204,21,0.18)',
    ink:      '#f5f5f5',
    inkFaded: '#a3a3a3',
    muted:    '#484848',
    font:     "'Inter', 'SF Pro Display', system-ui, sans-serif",
    fontMono: "'JetBrains Mono', 'Fira Code', monospace",
};



/* ─────────────────────────────────────────────────────────
   Tooltip
   ───────────────────────────────────────────────────────── */
const Tooltip = ({
    index, step,
    backProps, closeProps, primaryProps,
    tooltipProps, isLastStep, size,
}) => (
    <motion.div
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        {...tooltipProps}
        style={{
            width: 360,
            background: T.bg,
            border: `1px solid ${T.border}`,
            borderLeft: `3px solid ${T.gold}`,
            borderRadius: 0,
            padding: '22px 22px 18px',
            boxShadow: '0 32px 64px rgba(0,0,0,0.9)',
            fontFamily: T.font,
            position: 'relative',
            zIndex: 10001,
        }}
    >
        {/* Eyebrow */}
        <div style={{
            fontFamily: T.fontMono,
            fontSize: 10, fontWeight: 600,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: T.gold, opacity: 0.8, marginBottom: 10,
        }}>
            PLACEMENT BRIEFING — STEP {index + 1}/{size}
        </div>

        {/* Title */}
        <h3 style={{
            fontSize: 18, fontWeight: 700,
            color: T.ink, marginBottom: 10,
            letterSpacing: '0.04em', textTransform: 'uppercase',
            fontFamily: T.font, lineHeight: 1.2, margin: '0 0 10px',
        }}>
            {step.title}
        </h3>

        {/* Body */}
        <p style={{
            fontFamily: T.fontMono,
            fontSize: 13, color: T.inkFaded,
            lineHeight: 1.65, marginBottom: 20,
        }}>
            {step.content}
        </p>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 20 }}>
            {Array.from({ length: size }).map((_, i) => (
                <div key={i} style={{
                    width:  i === index ? 22 : 8,
                    height: 4, borderRadius: 0,
                    background: i === index ? T.gold : '#252525',
                    transition: 'width 0.3s ease',
                }} />
            ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Skip */}
            <button {...closeProps} style={{
                background: 'transparent', border: 'none', padding: 0,
                cursor: 'pointer', fontFamily: T.fontMono,
                fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: T.muted,
                transition: 'color 0.15s',
            }}
                onMouseOver={e => e.currentTarget.style.color = T.gold}
                onMouseOut={e  => e.currentTarget.style.color = T.muted}
            >
                [ SKIP BRIEFING ]
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Back */}
                {index > 0 && (
                    <button {...backProps} style={{
                        background: 'transparent', border: 'none', padding: 0,
                        cursor: 'pointer', fontFamily: T.fontMono,
                        fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
                        textTransform: 'uppercase', color: T.muted,
                        transition: 'color 0.15s',
                    }}
                        onMouseOver={e => e.currentTarget.style.color = T.ink}
                        onMouseOut={e  => e.currentTarget.style.color = T.muted}
                    >
                        ← BACK
                    </button>
                )}

                {/* Next / Finish */}
                <button {...primaryProps} style={{
                    background: T.gold, color: '#000',
                    border: 'none', borderRadius: 0,
                    padding: '8px 18px',
                    fontFamily: T.fontMono, fontSize: 11, fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'filter 0.15s, transform 0.1s',
                }}
                    onMouseOver={e  => e.currentTarget.style.filter = 'brightness(1.12)'}
                    onMouseOut={e   => e.currentTarget.style.filter = 'brightness(1)'}
                    onMouseDown={e  => e.currentTarget.style.transform = 'scale(0.97)'}
                    onMouseUp={e    => e.currentTarget.style.transform = 'scale(1)'}
                >
                    {isLastStep ? '[ FINISH ]' : '[ NEXT → ]'}
                </button>
            </div>
        </div>
    </motion.div>
);

/* ─────────────────────────────────────────────────────────
   OnboardingWizard
   ───────────────────────────────────────────────────────── */
const OnboardingWizard = () => {
    const { user, updateOnboardingStatus } = useAuth();
    const [run,       setRun]       = useState(false);
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        if (user?.role === 'student' && !user?.hasCompletedOnboarding) {
            const t = setTimeout(() => setRun(true), 1000);
            return () => clearTimeout(t);
        }
    }, [user]);

    const steps = [
        {
            target: 'body',
            title: 'Welcome to PlaceNext',
            content: "Welcome to the secure placement portal. Let's take a quick tour so you know exactly where everything is.",
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '.tour-sidebar',
            title: 'Navigation Console',
            content: 'Your command console. Access the dashboard, placement drives, resume analyzer, and your profile from here.',
            placement: 'right',
        },
        {
            target: '.tour-profile-progress',
            title: 'Profile Strength',
            content: 'Recruiters rank students by profile completeness. Fill in academics, skills, and projects to rise to the top.',
            placement: 'bottom',
        },
        {
            target: '.tour-ai-chat',
            title: 'AI Operative',
            content: 'Your AI assistant — available 24/7 for interview prep, cover letters, role research, or any platform question.',
            placement: 'top-end',
        },
    ];

    const handleCallback = async ({ status, index, type }) => {
        if (type === EVENTS.STEP_BEFORE) {
            setStepIndex(index);
        }
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            setRun(false);
            setStepIndex(0);
            try {
                await studentAPI.completeOnboarding();
                updateOnboardingStatus?.(true);
                toast.success("Briefing complete. You're cleared to operate.");
            } catch (err) {
                console.error('Failed to mark onboarding complete:', err);
            }
        }
    };

    if (!user || user.role !== 'student' || user.hasCompletedOnboarding) return null;

    return (
        <Joyride
            callback={handleCallback}
            continuous
            hideCloseButton
            run={run}
            scrollToFirstStep
            showSkipButton
            disableOverlayClose
            spotlightPadding={12}
            steps={steps}
            tooltipComponent={Tooltip}
            styles={{
                options: {
                    overlayColor: 'rgba(0, 0, 0, 0.88)', // Deep dark overlay
                    zIndex: 100000,
                    arrowColor: T.bg,
                },
                spotlight: {
                    borderRadius: 0,
                    border: '2px solid rgba(255, 255, 255, 0.85)', // White border
                    outline: '4px solid rgba(255, 255, 255, 0.15)', // Soft outer ring
                    outlineOffset: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)', // Slight inner brightness
                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)', // Glow
                },
                beacon: { display: 'none' },
            }}
        />
    );
};

export default OnboardingWizard;
