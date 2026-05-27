import { Suspense } from 'react';
import { motion } from 'framer-motion';

// Loading spinner
const LoadingSpinner = ({ size = 'md', className = '' }) => {
    const px = { sm: 16, md: 32, lg: 48, xl: 64 }[size];
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} className={className}>
            <motion.div
                style={{ width: px, height: px, borderRadius: '50%', border: '3px solid var(--color-border-secondary)', borderTopColor: 'var(--color-text-primary)' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
        </div>
    );
};

// Full page loading screen
const PageLoader = ({ message = 'Loading…' }) => (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-background-primary)' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
            <LoadingSpinner size="xl" className="mb-4" />
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)' }}>{message}</p>
        </motion.div>
    </div>
);

// Skeleton block helper
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
        {/* Header */}
        <div style={{ background: 'var(--color-background-secondary)', padding: '12px 16px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {Array.from({ length: cols }).map((_, i) => (
                    <Skel key={i} style={{ height: 12 }} />
                ))}
            </div>
        </div>
        {/* Rows */}
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

// Lazy loading wrapper
const LazyWrapper = ({ children, fallback }) => (
    <Suspense fallback={fallback || <PageLoader />}>
        {children}
    </Suspense>
);

export { LoadingSpinner, PageLoader, SkeletonCard, SkeletonTable, SkeletonStats, LazyWrapper };
