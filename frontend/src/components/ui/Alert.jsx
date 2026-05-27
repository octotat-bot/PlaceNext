import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

const Alert = ({ type = 'info', title, message, onClose, className = '' }) => {
    const types = {
        info: {
            bgVar: 'var(--color-background-info)',
            textVar: 'var(--color-text-info)',
            icon: Info
        },
        success: {
            bgVar: 'var(--color-background-success)',
            textVar: 'var(--color-text-success)',
            icon: CheckCircle
        },
        warning: {
            bgVar: 'var(--color-background-warning)',
            textVar: 'var(--color-text-warning)',
            icon: AlertCircle
        },
        error: {
            bgVar: 'var(--color-background-danger)',
            textVar: 'var(--color-text-danger)',
            icon: XCircle
        },
    };

    const style = types[type] || types.info;
    const IconComponent = style.icon;

    return (
        <div 
            className={`flex items-start ${className}`}
            style={{ 
                backgroundColor: style.bgVar,
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 'var(--border-radius-md)',
                padding: '16px'
            }}
        >
            <div className="flex-shrink-0">
                <IconComponent className="w-5 h-5" style={{ color: style.textVar }} />
            </div>
            <div className="ml-3 flex-1 font-sans">
                {title && (
                    <h3 
                        style={{ fontSize: '13px', fontWeight: 500, color: style.textVar }}
                    >
                        {title}
                    </h3>
                )}
                {message && (
                    <p 
                        style={{ fontSize: '13px', fontWeight: 400, color: style.textVar }}
                        className={title ? 'mt-1' : ''}
                    >
                        {message}
                    </p>
                )}
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="ml-auto pl-3 -mr-1 -mt-1"
                    style={{ 
                        background: 'transparent',
                        border: 'none',
                        color: style.textVar,
                        cursor: 'pointer',
                        padding: '4px'
                    }}
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default Alert;
