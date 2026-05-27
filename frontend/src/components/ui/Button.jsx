// src/components/ui/Button.jsx
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  style = {},
  ...props
}) => {
  const variantClass = {
    primary:   'btn btn-primary',
    secondary: 'btn',
    accent:    'btn btn-accent',
    danger:    'btn btn-danger',
    outline:   'btn',
  }[variant] || 'btn';

  const sizeClass = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
    icon: 'btn-icon',
  }[size] || '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${variantClass} ${sizeClass} ${className}`.trim()}
      style={style}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      {children}
    </button>
  );
};

export default Button;
