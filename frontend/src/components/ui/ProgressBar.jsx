const ProgressBar = ({ value, max = 100, size = 'md', showLabel = false, className = '' }) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizes = {
        sm: 4,
        md: 8,
        lg: 12,
    };

    const height = sizes[size] || 8;

    return (
        <div style={{ width: '100%' }}>
            {showLabel && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, fontSize: 13 }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Progress</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{Math.round(percentage)}%</span>
                </div>
            )}
            <div style={{ width: '100%', height, background: 'var(--color-border-secondary)', borderRadius: height / 2, overflow: 'hidden' }}>
                <div
                    style={{
                        height: '100%',
                        background: 'var(--color-text-primary)',
                        borderRadius: height / 2,
                        transition: 'width 0.5s ease-out',
                        width: `${percentage}%`
                    }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
