import {
    Briefcase,
    FileText,
    Users,
    Building2,
    Bell,
    Calendar,
    Search,
    ClipboardList,
    Upload,
    MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const illustrations = {
    drives: Briefcase,
    'ti-briefcase': Briefcase,
    applications: FileText,
    'ti-file-text': FileText,
    students: Users,
    'ti-users': Users,
    companies: Building2,
    'ti-building': Building2,
    notifications: Bell,
    interviews: Calendar,
    'ti-calendar': Calendar,
    search: Search,
    'ti-upload': Upload,
    'ti-message-circle': MessageCircle,
    default: ClipboardList,
};

const EmptyState = ({
    type = 'default',
    title = 'No data found',
    description = '',
    body = '', // Add body alias for description
    action,
    actionLabel,
    cta, // Add cta object { label, href }
    icon, // Alias for icon
    icon: CustomIcon,
}) => {
    // Determine icon based on string icon name or fallback to type
    const IconComponent = typeof icon === 'string' ? illustrations[icon] || illustrations.default : CustomIcon;
    const Icon = IconComponent || illustrations[type] || illustrations.default;
    
    const desc = body || description;

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            {/* Illustrated icon */}
            <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-[var(--bg-surface-2)] flex items-center justify-center">
                    <Icon className="w-10 h-10 text-[var(--text-faint)]" />
                </div>
                {/* Decorative dots */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--border)] rounded-full" />
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-[var(--bg-surface-2)] rounded-full" />
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 4 }}>{title}</h3>

            {desc && (
                <p className="text-sm text-[var(--muted)] max-w-sm mb-6">{desc}</p>
            )}

            {cta ? (
                <Link
                    to={cta.href}
                    className="btn btn-primary"
                    style={{ borderRadius: 100 }}
                >
                    {cta.label}
                </Link>
            ) : (
                action && actionLabel && (
                    <button
                        onClick={action}
                        className="btn btn-primary"
                        style={{ borderRadius: 100 }}
                    >
                        {actionLabel}
                    </button>
                )
            )}
        </div>
    );
};

export default EmptyState;
