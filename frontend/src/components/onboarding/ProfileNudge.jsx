import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function ProfileNudge({ completeness = 0 }) {
    const [dismissed, setDismissed] = useState(
        () => sessionStorage.getItem('nudge_dismissed') === 'true'
    );

    if (dismissed || completeness >= 80) return null;

    const dismiss = () => {
        sessionStorage.setItem('nudge_dismissed', 'true');
        setDismissed(true);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                style={{
                    background: 'rgba(250,204,21,0.08)',
                    borderBottom: '0.5px solid rgba(250,204,21,0.2)',
                    padding: '8px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 13,
                    color: 'var(--gold)',
                    position: 'relative',
                    zIndex: 40,
                }}
            >
                {/* dot indicator */}
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />
                <span>
                    Your profile is <strong>{completeness}% complete</strong> — complete it to unlock more eligible drives.
                </span>
                <Link
                    to="/profile"
                    style={{
                        marginLeft: 8,
                        padding: '4px 12px',
                        borderRadius: 100,
                        background: 'var(--gold)',
                        color: 'var(--color-background-primary)',
                        fontSize: 11,
                        fontWeight: 500,
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                    }}
                >
                    Complete now →
                </Link>
                <button
                    onClick={dismiss}
                    style={{
                        marginLeft: 'auto',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-text-tertiary)',
                        fontSize: 16,
                        display: 'flex',
                        alignItems: 'center',
                        padding: 4,
                        flexShrink: 0,
                    }}
                    aria-label="Dismiss"
                >
                    ✕
                </button>
            </motion.div>
        </AnimatePresence>
    );
}
