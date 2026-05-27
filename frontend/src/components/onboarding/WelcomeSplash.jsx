import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const getSlidesForRole = (role, user) => {
    const firstName = user?.name?.split(' ')[0] || 'there';

    if (role === 'student') {
        return [
            {
                title: <>Welcome to PlaceNext, <em>{firstName}</em>.</>,
                subtext: "Your entire placement journey in one place — drives, applications, resume scoring, and AI prep.",
                illustration: (
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', height: 160 }}>
                        <div style={{ padding: 12, background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 7 }}>
                            <div style={{ width: 40, height: 4, background: 'var(--color-border-secondary)', borderRadius: 2, marginBottom: 8 }} />
                            <div style={{ width: 60, height: 4, background: 'var(--color-border-tertiary)', borderRadius: 2 }} />
                        </div>
                        <div style={{ padding: 16, background: 'var(--color-background-secondary)', border: '0.5px solid var(--gold)', borderRadius: 7, transform: 'translateY(-10px)' }}>
                            <div style={{ fontSize: 28, fontWeight: 500, color: 'var(--gold)', fontFamily: 'var(--font-display)' }}>84</div>
                        </div>
                        <div style={{ padding: 12, background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 7 }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1px solid var(--color-border-primary)' }} />
                        </div>
                    </div>
                )
            },
            {
                title: <>Find drives you're <em>eligible</em> for.</>,
                subtext: "We automatically filter drives based on your CGPA, branch, and semester. No manual checking.",
                illustration: (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', height: 160, justifyContent: 'center' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 7, width: 160 }}>
                                <div style={{ width: 14, height: 14, borderRadius: 2, background: i === 1 ? 'var(--gold)' : 'transparent', border: i === 1 ? 'none' : '0.5px solid var(--color-border-secondary)' }} />
                                <div style={{ width: '100%', height: 4, background: 'var(--color-border-tertiary)', borderRadius: 2 }} />
                            </div>
                        ))}
                    </div>
                )
            },
            {
                title: <><em>AI</em> that knows your profile.</>,
                subtext: "Ask anything — resume tips, interview prep, salary negotiation. The AI has your full context.",
                illustration: (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 220, margin: '0 auto', height: 160, justifyContent: 'center' }}>
                        <div style={{ padding: '10px 14px', background: 'var(--color-background-secondary)', borderRadius: '12px 12px 12px 0', fontSize: 11, color: 'var(--color-text-secondary)', border: '0.5px solid var(--color-border-tertiary)' }}>Prepare me for a Google SWE interview.</div>
                        <div style={{ padding: '10px 14px', background: 'rgba(250,204,21,0.08)', borderRadius: '12px 12px 0 12px', fontSize: 11, color: 'var(--gold)', alignSelf: 'flex-end', border: '0.5px solid rgba(250,204,21,0.2)' }}>I can help with that. Let's start with data structures...</div>
                    </div>
                )
            }
        ];
    }
    if (role === 'recruiter') {
        const approved = user?.accountStatus === 'approved';
        return [
            {
                title: <>Welcome to <em>PlaceNext</em>.</>,
                subtext: "Post drives, review applications, and schedule interviews — all from one dashboard."
            },
            {
                title: <>Your hiring pipeline, <em>visualised</em>.</>,
                subtext: "Track every candidate from applied to offer. Bulk actions save hours."
            },
            {
                title: approved ? <>You're <em>approved</em> and ready to hire.</> : <>Your account is under <em>review</em>.</>,
                subtext: approved ? "Start by creating a drive." : "You can start creating drives once your account is approved."
            }
        ];
    }
    if (role === 'admin') {
        return [
            {
                title: <>The placement cell, <em>upgraded</em>.</>,
                subtext: "Manage companies, drives, students, and recruiters from a single control panel."
            },
            {
                title: <>Data that tells a <em>story</em>.</>,
                subtext: "Real-time placement analytics by branch, company tier, and package range."
            },
            {
                title: <>You're <em>all set</em>.</>,
                subtext: "Start by adding your first company, then create a drive."
            }
        ];
    }
    return [];
};

export default function WelcomeSplash({ onComplete }) {
    const { user } = useAuth();
    const [step, setStep] = useState(0);
    const storageKey = user ? `onboarding_splash_${user._id}` : null;

    useEffect(() => {
        if (storageKey && localStorage.getItem(storageKey)) {
            onComplete();
        }
    }, [storageKey, onComplete]);

    const finish = () => {
        if (storageKey) localStorage.setItem(storageKey, 'true');
        onComplete();
    };

    const slides = getSlidesForRole(user?.role, user);
    if (!slides || slides.length === 0) return null;

    const currentSlide = slides[step];

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            backdropFilter: 'blur(4px)',
        }}>
            <div style={{
                background: 'var(--color-background-primary)',
                border: '0.5px solid var(--color-border-secondary)',
                borderRadius: 'var(--border-radius-lg)',
                width: '100%',
                maxWidth: 480,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}>
                <button
                    onClick={finish}
                    style={{
                        position: 'absolute',
                        top: 16,
                        right: 20,
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-tertiary)',
                        fontSize: 12,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        zIndex: 10,
                    }}
                >
                    Skip for now
                </button>

                <div style={{ padding: '48px 32px 32px', minHeight: 320, display: 'flex', flexDirection: 'column' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ x: 40, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -40, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                        >
                            {currentSlide.illustration && (
                                <div style={{ marginBottom: 24 }}>
                                    {currentSlide.illustration}
                                </div>
                            )}
                            
                            <h2 className="page-title" style={{ fontSize: 28, marginBottom: 12, textAlign: 'center' }}>
                                {currentSlide.title}
                            </h2>
                            <p style={{
                                fontSize: 14,
                                color: 'var(--color-text-secondary)',
                                lineHeight: 1.6,
                                textAlign: 'center',
                                margin: '0 auto',
                                maxWidth: 360,
                            }}>
                                {currentSlide.subtext}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div style={{
                    padding: '20px 32px',
                    borderTop: '0.5px solid var(--color-border-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--color-background-secondary)'
                }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {slides.map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    background: i === step ? 'var(--gold)' : 'var(--color-border-secondary)',
                                    transition: 'background 0.3s ease',
                                }}
                            />
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        {step > 0 && (
                            <button
                                onClick={() => setStep(s => s - 1)}
                                className="btn"
                                style={{ borderRadius: 100, padding: '8px 16px', fontSize: 13 }}
                            >
                                <ChevronLeft size={16} />
                                Back
                            </button>
                        )}
                        {step < slides.length - 1 ? (
                            <button
                                onClick={() => setStep(s => s + 1)}
                                className="btn btn-primary"
                                style={{ borderRadius: 100, padding: '8px 20px', fontSize: 13 }}
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button
                                onClick={finish}
                                className="btn btn-primary"
                                style={{ borderRadius: 100, padding: '8px 20px', fontSize: 13 }}
                            >
                                Let's go
                                <ChevronRight size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
