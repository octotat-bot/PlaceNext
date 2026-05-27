import { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Custom Tooltip ──────────────────────────────────── */
const Tooltip = ({
    index,
    step,
    backProps,
    closeProps,
    primaryProps,
    tooltipProps,
    isLastStep,
    size,
}) => (
    <motion.div
        key={index}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        {...tooltipProps}
        style={{
            position: 'relative',
            width: 360,
            background: '#0f0f0f',
            border: '1px solid #303030',
            borderRadius: 0,
            padding: '20px 20px 18px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.9)',
            fontFamily: 'var(--font-sans)',
            // Left gold accent stripe
            borderLeft: '3px solid #facc15',
        }}
    >
        {/* Eyebrow */}
        <div style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#facc15',
            opacity: 0.7,
            marginBottom: 10,
        }}>
            PLACEMENT BRIEFING — STEP {index + 1}/{size}
        </div>

        {/* Title */}
        <h3 style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#f5f5f5',
            marginBottom: 10,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-display)',
            lineHeight: 1.2,
        }}>
            {step.title}
        </h3>

        {/* Body */}
        <p style={{
            fontSize: 13,
            color: '#a3a3a3',
            lineHeight: 1.65,
            marginBottom: 18,
        }}>
            {step.content}
        </p>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 18 }}>
            {Array.from({ length: size }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        width: i === index ? 20 : 8,
                        height: 4,
                        borderRadius: 0,
                        background: i === index ? '#facc15' : '#2a2a2a',
                        transition: 'width 0.25s ease, background 0.25s ease',
                    }}
                />
            ))}
        </div>

        {/* Actions row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Skip */}
            <button
                {...closeProps}
                style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#555',
                    transition: 'color 0.15s',
                    fontFamily: 'var(--font-sans)',
                }}
                onMouseOver={e => e.currentTarget.style.color = '#facc15'}
                onMouseOut={e => e.currentTarget.style.color = '#555'}
            >
                [ SKIP BRIEFING ]
            </button>

            {/* Back + Next */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {index > 0 && (
                    <button
                        {...backProps}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: '#555',
                            transition: 'color 0.15s',
                            fontFamily: 'var(--font-sans)',
                        }}
                        onMouseOver={e => e.currentTarget.style.color = '#f5f5f5'}
                        onMouseOut={e => e.currentTarget.style.color = '#555'}
                    >
                        ← BACK
                    </button>
                )}

                <button
                    {...primaryProps}
                    style={{
                        background: '#facc15',
                        color: '#000',
                        border: 'none',
                        borderRadius: 0,
                        padding: '7px 16px',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                        transition: 'filter 0.15s, transform 0.1s',
                    }}
                    onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.12)'}
                    onMouseOut={e => e.currentTarget.style.filter = 'brightness(1)'}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    {isLastStep ? '[ FINISH ]' : '[ NEXT → ]'}
                </button>
            </div>
        </div>
    </motion.div>
);

/* ─── Main Component ──────────────────────────────────── */
const OnboardingWizard = () => {
    const { user, updateOnboardingStatus } = useAuth();
    const [run, setRun] = useState(false);

    useEffect(() => {
        if (user && user.role === 'student' && !user.hasCompletedOnboarding) {
            const timer = setTimeout(() => setRun(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const steps = [
        {
            target: 'body',
            title: 'Welcome',
            content: "Welcome to the PlaceNext secure portal. Let's take a brief tour to orient you and get you ready to land your dream role.",
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '.tour-sidebar',
            title: 'Navigation Console',
            content: 'This is your primary command console. Access your dashboard, placement drives, resume analyzer, and profile from here.',
            placement: 'right',
        },
        {
            target: '.tour-profile-progress',
            title: 'Profile Completeness',
            content: 'Recruiters rank students by profile strength. Fill in your academics, skills, and projects to rise to the top of the list.',
            placement: 'bottom',
        },
        {
            target: '.tour-ai-chat',
            title: 'AI Operative',
            content: 'Your AI assistant is online 24/7. Use it for interview prep, role research, cover letter help, or any question about the platform.',
            placement: 'top-end',
        },
    ];

    const handleCallback = async ({ status }) => {
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            setRun(false);
            try {
                await studentAPI.completeOnboarding();
                updateOnboardingStatus?.(true);
                toast.success("Briefing complete. You're ready to deploy.");
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
            disableScrolling={false}
            showSkipButton
            steps={steps}
            tooltipComponent={Tooltip}
            spotlightPadding={6}
            styles={{
                options: {
                    arrowColor: '#0f0f0f',
                    overlayColor: 'rgba(0, 0, 0, 0.82)',
                    zIndex: 10000,
                },
                spotlight: {
                    borderRadius: 0,
                    border: '2px solid rgba(250, 204, 21, 0.65)',
                    boxShadow: '0 0 0 4px rgba(250, 204, 21, 0.08)',
                },
                beacon: { display: 'none' },
            }}
        />
    );
};

export default OnboardingWizard;
