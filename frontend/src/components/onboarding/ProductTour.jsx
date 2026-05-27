import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useProductTour } from '../../hooks/useProductTour';
import { Link } from 'react-router-dom';

const studentTourSteps = [
    { target: '[data-tour="stat-cards"]', title: 'Your placement snapshot', body: 'These 4 cards update in real time — applications, shortlists, resume score, and profile completeness.', placement: 'bottom' },
    { target: '[data-tour="drive-list"]', title: 'Drives matched to you', body: 'We only show drives you\'re eligible for based on your CGPA, branch, and semester. No irrelevant listings.', placement: 'right' },
    { target: '[data-tour="nav-drives"]', title: 'Browse all drives', body: 'See the full list, filter by package, job type, or company tier, and apply in one click.', placement: 'right' },
    { target: '[data-tour="nav-applications"]', title: 'Track your applications', body: 'Every status change — from applied to selected — is logged here with timestamps.', placement: 'right' },
    { target: '[data-tour="nav-resume"]', title: 'AI resume scoring', body: 'Upload your resume and get an ATS score, keyword gap analysis, and AI-rewritten bullet suggestions.', placement: 'right' },
    { target: '[data-tour="nav-profile"]', title: 'Complete your profile', body: 'A complete profile improves your eligibility for more drives and boosts your resume score. Takes 5 minutes.', placement: 'bottom', cta: { label: 'Complete profile →', href: '/profile' } },
];

const recruiterTourSteps = [
    { target: '[data-tour="stat-cards"]', title: 'Your hiring at a glance', body: 'Total applications, under review, upcoming interviews, and offers made — all live.', placement: 'bottom' },
    { target: '[data-tour="nav-jobs"]', title: 'Create and manage drives', body: 'Post a new placement drive, set eligibility criteria, and manage openings. Students see it instantly.', placement: 'right', cta: { label: 'Create your first drive →', href: '/recruiter/jobs' } },
    { target: '[data-tour="nav-applications"]', title: 'Review applications', body: 'View every applicant\'s profile, resume score, and CGPA. Update status individually or in bulk.', placement: 'right' },
    { target: '[data-tour="nav-interviews"]', title: 'Schedule interviews', body: 'Add interview details (date, time, online/offline) and candidates get notified automatically.', placement: 'right' },
];

const adminTourSteps = [
    { target: '[data-tour="stat-cards"]', title: 'Season overview', body: 'Total students, placed count, companies onboarded, and highest package — live for the current batch.', placement: 'bottom' },
    { target: '[data-tour="nav-companies"]', title: 'Start with companies', body: 'Add companies first — recruiters are linked to a company. You can also manage company profiles and logos.', placement: 'right', cta: { label: 'Add first company →', href: '/admin/companies' } },
    { target: '[data-tour="nav-drives"]', title: 'Manage all drives', body: 'Create drives directly as admin, or approve/reject ones created by recruiters.', placement: 'right' },
    { target: '[data-tour="nav-recruiters"]', title: 'Recruiter approvals', body: 'New recruiters need your approval before they can post drives. You\'ll see a badge when approvals are pending.', placement: 'right' },
];

const getSteps = (role) => {
    if (role === 'student') return studentTourSteps;
    if (role === 'recruiter') return recruiterTourSteps;
    if (role === 'admin') return adminTourSteps;
    return [];
};

export default function ProductTour() {
    const { user } = useAuth();
    const steps = getSteps(user?.role);
    const { active, step, currentStep, next, back, complete } = useProductTour(steps);
    
    const [targetRect, setTargetRect] = useState(null);

    // Escape to close
    useEffect(() => {
        if (!active) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') complete();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [active, complete]);

    // Measure target element
    useEffect(() => {
        if (!active || !currentStep) return;

        let attempt = 0;
        let t;

        const measure = () => {
            const el = document.querySelector(currentStep.target);
            if (!el || (el.getBoundingClientRect().width === 0)) {
                if (attempt++ < 10) t = setTimeout(measure, 100);
                return;
            }
            const r = el.getBoundingClientRect();
            // Scroll into view if needed
            if (r.top < 0 || r.bottom > window.innerHeight) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                t = setTimeout(measure, 300); // Wait for scroll
                return;
            }
            setTargetRect({
                top: r.top - 8,
                left: r.left - 8,
                width: r.width + 16,
                height: r.height + 16,
                placement: currentStep.placement || 'bottom'
            });
        };

        measure();
        const onResize = () => measure();
        window.addEventListener('resize', onResize);
        window.addEventListener('scroll', onResize, true);
        
        return () => {
            clearTimeout(t);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('scroll', onResize, true);
        };
    }, [active, currentStep, step]);

    if (!active || !currentStep || !targetRect) return null;

    // Calculate tooltip position
    const tooltipWidth = 280;
    let tooltipStyle = {};
    let arrowStyle = {};

    switch (targetRect.placement) {
        case 'right':
            tooltipStyle = { top: targetRect.top + targetRect.height / 2, left: targetRect.left + targetRect.width + 12, transform: 'translateY(-50%)' };
            arrowStyle = { top: '50%', left: -6, transform: 'translateY(-50%)', borderRight: '6px solid var(--color-background-primary)', borderTop: '6px solid transparent', borderBottom: '6px solid transparent' };
            break;
        case 'left':
            tooltipStyle = { top: targetRect.top + targetRect.height / 2, left: targetRect.left - tooltipWidth - 12, transform: 'translateY(-50%)' };
            arrowStyle = { top: '50%', right: -6, transform: 'translateY(-50%)', borderLeft: '6px solid var(--color-background-primary)', borderTop: '6px solid transparent', borderBottom: '6px solid transparent' };
            break;
        case 'top':
            tooltipStyle = { top: targetRect.top - 12, left: targetRect.left + targetRect.width / 2, transform: 'translate(-50%, -100%)' };
            arrowStyle = { bottom: -6, left: '50%', transform: 'translateX(-50%)', borderTop: '6px solid var(--color-background-primary)', borderLeft: '6px solid transparent', borderRight: '6px solid transparent' };
            break;
        case 'bottom':
        default:
            tooltipStyle = { top: targetRect.top + targetRect.height + 12, left: Math.max(16, targetRect.left + targetRect.width / 2), transform: 'translateX(-50%)' };
            arrowStyle = { top: -6, left: '50%', transform: 'translateX(-50%)', borderBottom: '6px solid var(--color-background-primary)', borderLeft: '6px solid transparent', borderRight: '6px solid transparent' };
            break;
    }

    return createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 999998 }}>
            {/* Spotlight Overlay */}
            <div style={{
                position: 'absolute',
                top: targetRect.top,
                left: targetRect.left,
                width: targetRect.width,
                height: targetRect.height,
                borderRadius: 'var(--border-radius-md)',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.85)',
                border: '2px solid var(--gold)',
                transition: 'all 0.3s ease-in-out',
                pointerEvents: 'none',
            }} />
            
            {/* Click outside to close (invisible catcher) */}
            <div onClick={complete} style={{ position: 'absolute', inset: 0, zIndex: 1 }} />

            {/* Tooltip */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{
                        position: 'absolute',
                        width: tooltipWidth,
                        background: 'var(--color-background-primary)',
                        border: '0.5px solid var(--color-border-secondary)',
                        borderRadius: 'var(--border-radius-md)',
                        padding: 16,
                        zIndex: 2,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                        ...tooltipStyle
                    }}
                >
                    {/* Arrow (requires positioning a pseudo-element or just an absolute div) */}
                    <div style={{ position: 'absolute', width: 0, height: 0, ...arrowStyle }} />
                    
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                            Step {step + 1} of {steps.length}
                        </span>
                        <button onClick={complete} style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                            ✕ skip
                        </button>
                    </div>

                    {/* Content */}
                    <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)', marginBottom: 6 }}>
                        {currentStep.title}
                    </h4>
                    <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: currentStep.cta ? 16 : 20 }}>
                        {currentStep.body}
                    </p>

                    {/* CTA */}
                    {currentStep.cta && (
                        <Link 
                            to={currentStep.cta.href}
                            onClick={complete}
                            className="btn btn-primary"
                            style={{ display: 'block', width: '100%', textAlign: 'center', borderRadius: 100, fontSize: 12, padding: '8px 0', marginBottom: 20 }}
                        >
                            {currentStep.cta.label}
                        </Link>
                    )}

                    {/* Controls */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button 
                            onClick={back} 
                            disabled={step === 0}
                            style={{ background: 'none', border: 'none', color: step === 0 ? 'var(--color-border-primary)' : 'var(--color-text-secondary)', fontSize: 12, cursor: step === 0 ? 'default' : 'pointer' }}
                        >
                            ← Back
                        </button>
                        <button 
                            onClick={next}
                            className="btn"
                            style={{ borderRadius: 100, padding: '4px 12px', fontSize: 12, background: 'var(--color-background-secondary)' }}
                        >
                            {step === steps.length - 1 ? 'Finish' : 'Next →'}
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>,
        document.body
    );
}
