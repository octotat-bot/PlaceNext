import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(_error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo,
        });

        // Log error to console in development
        if (import.meta.env.DEV) {
            console.error('Error Boundary caught an error:', error, errorInfo);
        }

        // In production, you could send this to an error tracking service
        // like Sentry, LogRocket, etc.
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ minHeight: '100vh', background: 'var(--color-background-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <div style={{ maxWidth: 520, width: '100%', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', padding: 40, textAlign: 'center' }}>
                        <div style={{ width: 64, height: 64, background: 'var(--color-background-danger)', border: '0.5px solid var(--color-text-danger)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <AlertTriangle size={26} style={{ color: 'var(--color-text-danger)' }} />
                        </div>

                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, color: 'var(--color-text-primary)', marginBottom: 8 }}>
                            Oops! Something went wrong
                        </h1>

                        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 24 }}>
                            We encountered an unexpected error. Don't worry, our team has been notified.
                        </p>

                        {import.meta.env.DEV && this.state.error && (
                            <div style={{ marginBottom: 24, padding: '12px 14px', background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', textAlign: 'left', overflow: 'auto' }}>
                                <p style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--color-text-danger)', marginBottom: 6 }}>
                                    {this.state.error.toString()}
                                </p>
                                <details style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                                    <summary style={{ cursor: 'pointer' }}>Stack trace</summary>
                                    <pre style={{ marginTop: 6, whiteSpace: 'pre-wrap', fontSize: 10 }}>
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </details>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                            <button onClick={this.handleRetry} className="btn btn-primary">
                                <RefreshCw size={14} /> Try Again
                            </button>
                            <button onClick={this.handleGoHome} className="btn">
                                <Home size={14} /> Go Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
