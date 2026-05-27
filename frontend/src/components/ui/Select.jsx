import { cn } from '../../utils/helpers';

const Select = ({
    label,
    options = [],
    error,
    helperText,
    className = '',
    containerClassName = '',
    placeholder = 'Select an option',
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
            <select
                className={cn('input pr-10 appearance-none', error && 'input-error', className)}
                style={{ background: 'var(--color-background-secondary)' }}
                {...props}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <p style={{ color: 'var(--color-text-danger)', fontSize: 11, marginTop: 4 }}>{error}</p>}
            {helperText && !error && (
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: 11, marginTop: 4 }}>{helperText}</p>
            )}
        </div>
    );
};

export default Select;
