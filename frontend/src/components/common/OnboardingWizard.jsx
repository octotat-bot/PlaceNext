import { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const OnboardingWizard = () => {
    const { user, updateOnboardingStatus } = useAuth();
    const [run, setRun] = useState(false);

    // Only run if the user is a student and hasn't completed onboarding
    useEffect(() => {
        if (user && user.role === 'student' && !user.hasCompletedOnboarding) {
            // Add a small delay to ensure the UI is fully rendered before starting the tour
            const timer = setTimeout(() => {
                setRun(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const steps = [
        {
            target: 'body',
            content: (
                <div style={{ textAlign: 'left' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--color-text-primary)' }}>Welcome to the Placement Portal! 🚀</h2>
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        We're excited to have you here. Let's take a quick tour to help you get started with securing your dream job.
                    </p>
                </div>
            ),
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '.tour-sidebar',
            content: (
                <div style={{ textAlign: 'left' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--color-text-primary)' }}>Navigation</h3>
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        This is your control center. Access your dashboard, profile, resume tools, and placement drives from here.
                    </p>
                </div>
            ),
            placement: 'right',
        },
        {
            target: '.tour-profile-progress',
            content: (
                <div style={{ textAlign: 'left' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--color-text-primary)' }}>Complete Your Profile</h3>
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        Recruiters look at your profile completeness! Make sure you fill in your academic details, skills, and projects to stand out.
                    </p>
                </div>
            ),
            placement: 'bottom',
        },
        {
            target: '.tour-ai-chat',
            content: (
                <div style={{ textAlign: 'left' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--color-text-primary)' }}>AI Assistant</h3>
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        Got questions? Our AI assistant is available 24/7 to help you with platform queries, interview prep, and career advice.
                    </p>
                </div>
            ),
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
            styles={{
                options: {
                    primaryColor: 'var(--color-text-primary)',
                    textColor: 'var(--color-text-primary)',
                    backgroundColor: 'var(--color-background-primary)',
                    arrowColor: 'var(--color-background-primary)',
                    overlayColor: 'rgba(0, 0, 0, 0.75)',
                    zIndex: 10000,
                },
                buttonNext: {
                    backgroundColor: 'var(--color-text-primary)',
                    color: 'var(--color-background-primary)',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 13,
                    padding: '8px 16px',
                },
                buttonBack: {
                    color: 'var(--color-text-secondary)',
                    fontSize: 13,
                },
                buttonSkip: {
                    color: 'var(--color-text-tertiary)',
                    fontSize: 13,
                },
                tooltipContainer: {
                    textAlign: 'left',
                },
                tooltipContent: {
                    padding: '10px 0',
                },
            }}
        />
    );
};

export default OnboardingWizard;
