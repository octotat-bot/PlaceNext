// src/components/ui/Avatar.jsx
const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const sizeClass = { sm: 'avatar-sm', md: 'avatar-md', lg: 'avatar-lg' }[size] || 'avatar-md';
  const initial = name?.charAt(0)?.toUpperCase() || '?';

  if (src) {
    const px = { sm: 28, md: 36, lg: 56 }[size] || 36;
    const radius = size === 'lg' ? 16 : 10;
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        width={px}
        height={px}
        style={{ borderRadius: radius, objectFit: 'cover', flexShrink: 0, border: '0.5px solid var(--color-border-tertiary)' }}
        className={className}
      />
    );
  }

  return (
    <div className={`avatar ${sizeClass} ${className}`}>
      {initial}
    </div>
  );
};

export default Avatar;
