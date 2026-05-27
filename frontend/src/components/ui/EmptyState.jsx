import {
    Briefcase,
    FileText,
    Users,
    Building2,
    Bell,
    Calendar,
    Search,
    ClipboardList,
} from 'lucide-react';

const illustrations = {
    drives: Briefcase,
    applications: FileText,
    students: Users,
    companies: Building2,
    notifications: Bell,
    interviews: Calendar,
    search: Search,
    default: ClipboardList,
};

const EmptyState = ({
    type = 'default',
    title = 'No data found',
    description = '',
    action,
    actionLabel,
    icon: CustomIcon,
}) => {
    const Icon = CustomIcon || illustrations[type] || illustrations.default;

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

            {description && (
                <p className="text-sm text-[var(--muted)] max-w-sm mb-6">{description}</p>
            )}

            {action && actionLabel && (
                <button
                    onClick={action}
                    className="btn btn-primary"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
