import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, AlertTriangle, WifiOff, RefreshCw, X, Clock } from 'lucide-react';
import { isServerError, isRateLimitError } from '../../utils/errors';

/**
 * Error Alert Component
 * Displays user-friendly error messages with appropriate styling and actions
 */
const ErrorAlert = ({
    error,
    onDismiss,
    onRetry,
    className = '',
    variant = 'default', // 'default' | 'inline' | 'toast'
}) => {
    if (!error) return null;

    const getErrorConfig = () => {
        const errorCode = error.code || '';

        if (errorCode === 'NETWORK_ERROR' || errorCode === 'TIMEOUT_ERROR') {
            return {
                icon: WifiOff,
                title: 'Connection Error',
                bg: 'var(--color-background-warning)',
                border: '0.5px solid var(--color-text-warning)',
                iconColor: 'var(--color-text-warning)',
                textColor: 'var(--color-text-primary)',
                mutedColor: 'var(--color-text-secondary)',
            };
        }
        if (isRateLimitError(error)) {
            return {
                icon: Clock,
                title: 'Too Many Requests',
                bg: 'var(--color-background-warning)',
                border: '0.5px solid var(--color-text-warning)',
                iconColor: 'var(--color-text-warning)',
                textColor: 'var(--color-text-primary)',
                mutedColor: 'var(--color-text-secondary)',
            };
        }
        if (isServerError(error)) {
            return {
                icon: AlertTriangle,
                title: 'Server Error',
                bg: 'var(--color-background-danger)',
                border: '0.5px solid var(--color-text-danger)',
                iconColor: 'var(--color-text-danger)',
                textColor: 'var(--color-text-primary)',
                mutedColor: 'var(--color-text-secondary)',
            };
        }
        return {
            icon: AlertCircle,
            title: 'Error',
            bg: 'var(--color-background-danger)',
            border: '0.5px solid var(--color-text-danger)',
            iconColor: 'var(--color-text-danger)',
            textColor: 'var(--color-text-primary)',
            mutedColor: 'var(--color-text-secondary)',
        };
    };

    const config = getErrorConfig();
    const Icon = config.icon;

    if (variant === 'inline') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-danger)' }} className={className}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>{error.message}</span>
            </div>
        );
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ borderRadius: 'var(--border-radius-md)', padding: '12px 14px', background: config.bg, border: config.border }}
                className={className}
            >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <Icon size={16} style={{ color: config.iconColor, flexShrink: 0, marginTop: 1 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: config.textColor, marginBottom: 2 }}>
                            {config.title}
                        </div>
                        <div style={{ fontSize: 12, color: config.mutedColor }}>
                            {error.message}
                        </div>

                        {error.details?.errors?.length > 0 && (
                            <ul style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {error.details.errors.map((err, i) => (
                                    <li key={i} style={{ fontSize: 11, color: config.mutedColor }}>
                                        • {err.field}: {err.message}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {(onRetry || onDismiss) && (
                            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                                {onRetry && (
                                    <button onClick={onRetry} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500, color: config.textColor, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                        <RefreshCw size={12} /> Retry
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {onDismiss && (
                        <button onClick={onDismiss} style={{ color: config.mutedColor, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0 }}>
                            <X size={15} />
                        </button>
                    )}
                </div>

                {error.requestId && (
                    <p style={{ marginTop: 8, fontSize: 10, color: 'var(--color-text-tertiary)', fontFamily: 'monospace' }}>
                        Request ID: {error.requestId}
                    </p>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

/**
 * Field Error Component
 */
export const FieldError = ({ error, className = '' }) => {
    if (!error) return null;
    return (
        <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 11, color: 'var(--color-text-danger)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}
            className={className}
        >
            <AlertCircle size={11} />
            {error}
        </motion.p>
    );
};

/**
 * Empty State Component
 */
export const EmptyState = ({ icon: Icon, title, description, action, className = '' }) => (
    <div style={{ textAlign: 'center', padding: '48px 0' }} className={className}>
        {Icon && (
            <div style={{ width: 56, height: 56, margin: '0 auto 16px', borderRadius: '50%', background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={22} style={{ color: 'var(--color-text-tertiary)' }} />
            </div>
        )}
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{title}</div>
        {description && <p style={{ marginTop: 4, fontSize: 12, color: 'var(--color-text-secondary)' }}>{description}</p>}
        {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
);

/**
 * Loading Error Component
 */
export const LoadingError = ({ error, onRetry, title = 'Failed to load', className = '' }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }} className={className}>
        <div style={{ width: 56, height: 56, marginBottom: 16, borderRadius: '50%', background: 'var(--color-background-danger)', border: '0.5px solid var(--color-text-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={22} style={{ color: 'var(--color-text-danger)' }} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{title}</div>
        <p style={{ marginTop: 4, fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'center', maxWidth: 400 }}>
            {error?.message || 'Something went wrong. Please try again.'}
        </p>
        {onRetry && (
            <button onClick={onRetry} className="btn btn-sm" style={{ marginTop: 16 }}>
                <RefreshCw size={13} /> Retry
            </button>
        )}
        {error?.requestId && (
            <p style={{ marginTop: 16, fontSize: 10, color: 'var(--color-text-tertiary)', fontFamily: 'monospace' }}>
                Request ID: {error.requestId}
            </p>
        )}
    </div>
);

export default ErrorAlert;
