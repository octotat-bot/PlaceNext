import { cn } from '../../utils/helpers';

const Input = ({
    label,
    type = 'text',
    error,
    helperText,
    className = '',
    containerClassName = '',
    ...props
}) => {
    return (
        <div className={cn('mb-4', containerClassName)}>
            {label && (
                <label className="label">
                    {label}
                    {props.required && <span style={{ color: 'var(--color-text-danger)', marginLeft: 2 }}>*</span>}
                </label>
            )}
            <input
                type={type}
                className={cn('input', error && 'input-error', className)}
                {...props}
            />
            {error && <p style={{ color: 'var(--color-text-danger)', fontSize: 11, marginTop: 4 }}>{error}</p>}
            {helperText && !error && (
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: 11, marginTop: 4 }}>{helperText}</p>
            )}
        </div>
    );
};

export default Input;
