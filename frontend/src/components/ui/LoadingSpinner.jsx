import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <Loader2 className={`${sizes[size]} animate-spin text-muted`} />
        </div>
    );
};

export const LoadingPage = ({ message = 'Loading...' }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-main">
            <LoadingSpinner size="xl" />
            <p className="mt-4 text-muted">{message}</p>
        </div>
    );
};

export const LoadingCard = () => {
    return (
        <div className="card p-6">
            <div className="animate-pulse space-y-4">
                <div className="bg-[var(--bg-surface-2)] rounded h-4 w-3/4"></div>
                <div className="bg-[var(--bg-surface-2)] rounded h-4 w-1/2"></div>
                <div className="bg-[var(--bg-surface-2)] rounded h-20 w-full"></div>
                <div className="flex space-x-4">
                    <div className="bg-[var(--bg-surface-2)] rounded h-4 w-1/4"></div>
                    <div className="bg-[var(--bg-surface-2)] rounded h-4 w-1/4"></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
