import { useState, useRef, useEffect } from 'react';

export default function HintTooltip({ text }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const [position, setPosition] = useState('right');

    useEffect(() => {
        const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleMouseEnter = () => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            // If it's too close to the right edge (less than 240px space), open to the left
            if (window.innerWidth - rect.right < 240) {
                setPosition('left');
            } else {
                setPosition('right');
            }
        }
        setOpen(true);
    };

    return (
        <span ref={ref} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: 5 }}>
            <span
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setOpen(false)}
                onClick={() => setOpen(v => !v)}
                style={{
                    width: 15, height: 15, borderRadius: '50%',
                    background: 'var(--color-background-secondary)',
                    border: '0.5px solid var(--color-border-tertiary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 500, color: 'var(--color-text-tertiary)',
                    cursor: 'help', userSelect: 'none',
                }}
                aria-label={`Hint: ${text}`}
            >
                ?
            </span>
            {open && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    ...(position === 'right' ? { left: 20 } : { right: 20 }),
                    width: 220, background: 'var(--color-background-primary)',
                    border: '0.5px solid var(--color-border-secondary)',
                    borderRadius: 7, padding: '10px 12px',
                    fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5,
                    zIndex: 50, pointerEvents: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    animation: 'hintIn 0.15s ease',
                }}>
                    {text}
                </div>
            )}
        </span>
    );
}
