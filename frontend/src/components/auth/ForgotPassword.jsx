import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const card = {
    background: 'var(--color-background-primary)',
    border: '0.5px solid var(--color-border-tertiary)',
    borderRadius: 'var(--border-radius-lg)',
    padding: 32,
};

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) { toast.error('Please enter your email address'); return; }
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
        } catch { /* show success anyway for security */ }
        finally { setLoading(false); setSent(true); }
    };

    const pageWrap = {
        minHeight: '100vh',
        background: 'var(--color-background-tertiary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    };

    if (sent) {
        return (
            <div style={pageWrap}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: 420, width: '100%' }}>
                    <div style={{ ...card, textAlign: 'center' }}>
                        <div style={{ width: 56, height: 56, background: 'var(--color-background-success)', border: '0.5px solid var(--color-text-success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <CheckCircle size={22} style={{ color: '#10b981' }} />
                        </div>

                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, color: 'var(--color-text-primary)', marginBottom: 8 }}>
                            Check your email
                        </h1>
                        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                            If an account with <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong> exists,
                            we've sent a link to reset your password.
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 24 }}>
                            Didn't receive it? Check your spam folder or try again.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <button onClick={() => setSent(false)} className="btn btn-primary" style={{ width: '100%' }}>
                                Try another email
                            </button>
                            <Link to="/login" className="btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}>
                                <ArrowLeft size={14} /> Back to login
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={pageWrap}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 420, width: '100%' }}>
                <div style={card}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 28 }}>
                        <div style={{ width: 48, height: 48, background: 'var(--color-text-primary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <Mail size={20} style={{ color: 'var(--color-background-primary)' }} />
                        </div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, color: 'var(--color-text-primary)', marginBottom: 6 }}>
                            Forgot Password?
                        </h1>
                        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                            Enter your email and we'll send reset instructions.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label className="form-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="form-input"
                                    style={{ paddingLeft: 30 }}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            {loading ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : 'Send Reset Link'}
                        </button>
                    </form>

                    <div style={{ marginTop: 20, textAlign: 'center' }}>
                        <Link to="/login" style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                            <ArrowLeft size={13} /> Back to login
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
