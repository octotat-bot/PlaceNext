import { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Map, Zap, CheckCircle, Bot } from 'lucide-react';

const Tooltip = ({
    index,
    step,
    backProps,
    closeProps,
    primaryProps,
    tooltipProps,
    isLastStep,
    size
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            {...tooltipProps}
            style={{
                width: 380,
                background: 'rgba(15, 15, 15, 0.85)',
                backdropFilter: 'blur(24px) saturate(150%)',
                WebkitBackdropFilter: 'blur(24px) saturate(150%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 20,
                padding: '24px',
                boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                {step.icon && (
                    <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.15) 0%, rgba(232, 160, 69, 0.05) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#facc15',
                        flexShrink: 0,
                        border: '1px solid rgba(250, 204, 21, 0.2)'
                    }}>
                        {step.icon}
                    </div>
                )}
                <div>
                    <h3 style={{ fontSize: 17, fontWeight: 600, color: '#f5f5f5', marginBottom: 6, fontFamily: 'var(--font-sans)', lineHeight: 1.3 }}>
                        {step.title}
                    </h3>
                    <div style={{ fontSize: 14, color: '#a3a3a3', lineHeight: 1.5 }}>
                        {step.content}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                    {Array.from({ length: size }).map((_, i) => (
                        <div key={i} style={{
                            width: i === index ? 16 : 6,
                            height: 6,
                            borderRadius: 100,
                            background: i === index ? '#facc15' : 'rgba(255,255,255,0.15)',
                            transition: 'all 0.3s ease'
                        }} />
                    ))}
                </div>
                
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {index > 0 && (
                        <button
                            {...backProps}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#a3a3a3',
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: 'pointer',
                                padding: '6px 10px',
                                transition: 'color 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#f5f5f5'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#a3a3a3'}
                        >
                            Back
                        </button>
                    )}
                    
                    <button
                        {...primaryProps}
                        style={{
                            background: 'linear-gradient(135deg, #facc15 0%, #e8a045 100%)',
                            color: '#1a1200',
                            border: 'none',
                            borderRadius: 100,
                            padding: '8px 20px',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(232, 160, 69, 0.3)',
                            transition: 'transform 0.15s, filter 0.15s',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                        onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {isLastStep ? 'Get Started' : 'Next'}
                    </button>
                </div>
            </div>
            
            {/* Close Button */}
            {!isLastStep && (
                <button
                    {...closeProps}
                    style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: 'transparent',
                        border: 'none',
                        color: '#737373',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'background 0.2s, color 0.2s',
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.color = '#f5f5f5';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#737373';
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            )}
        </motion.div>
    );
};

const OnboardingWizard = () => {
    const { user, updateOnboardingStatus } = useAuth();
    const [run, setRun] = useState(false);

    // Only run if the user is a student and hasn't completed onboarding
    useEffect(() => {
        if (user && user.role === 'student' && !user.hasCompletedOnboarding) {
            const timer = setTimeout(() => {
                setRun(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const steps = [
        {
            target: 'body',
            title: 'Welcome to PlaceNext! 🚀',
            content: "We're excited to have you here. Let's take a quick tour to help you get started with securing your dream job.",
            icon: <Map size={22} />,
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '.tour-sidebar',
            title: 'Your Control Center',
            content: 'Access your dashboard, profile, resume tools, and upcoming placement drives from this sidebar.',
            icon: <Zap size={22} />,
            placement: 'right',
        },
        {
            target: '.tour-profile-progress',
            title: 'Complete Your Profile',
            content: 'Recruiters actively look at your profile completeness! Make sure you fill in your academic details, skills, and projects to stand out.',
            icon: <CheckCircle size={22} />,
            placement: 'bottom',
        },
        {
            target: '.tour-ai-chat',
            title: '24/7 AI Assistant',
            content: 'Got questions? Our AI assistant is always available to help you with platform queries, interview prep, and career advice.',
            icon: <Bot size={22} />,
            placement: 'top-end',
        },
    ];

    const handleJoyrideCallback = async (data) => {
        const { status } = data;
        const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setRun(false);
            try {
                // Call the API to mark onboarding as complete
                await studentAPI.completeOnboarding();
                // Update local context
                if (updateOnboardingStatus) {
                    updateOnboardingStatus(true);
                }
                toast.success("Tour completed! You're ready to go.");
            } catch (error) {
                console.error('Failed to complete onboarding:', error);
            }
        }
    };

    if (!user || user.role !== 'student' || user.hasCompletedOnboarding) {
        return null;
    }

    return (
        <Joyride
            callback={handleJoyrideCallback}
            continuous
            hideCloseButton
            run={run}
            scrollToFirstStep
            showProgress
            showSkipButton
            steps={steps}
            tooltipComponent={Tooltip}
            styles={{
                options: {
                    arrowColor: '#1a1a1a',
                    overlayColor: 'rgba(0, 0, 0, 0.8)',
                    zIndex: 10000,
                },
                spotlight: {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1.5px solid rgba(250, 204, 21, 0.8)',
                    borderRadius: '12px',
                    boxShadow: '0 0 30px rgba(250, 204, 21, 0.25)',
                },
                beacon: {
                    display: 'none',
                }
            }}
        />
    );
};

export default OnboardingWizard;
