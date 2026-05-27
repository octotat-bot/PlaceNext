import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const card = {
    background: 'var(--color-background-primary)',
    border: '0.5px solid var(--color-border-tertiary)',
    borderRadius: 'var(--border-radius-lg)',
    padding: 32,
};

const pageWrap = {
    minHeight: '100vh',
    background: 'var(--color-background-tertiary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
};

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) setError('Invalid or missing reset token');
    }, [token]);

    const requirements = [
        { label: 'At least 6 characters', met: password.length >= 6 },
        { label: 'Passwords match', met: password && confirmPassword && password === confirmPassword },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
        setLoading(true);
        setError('');
        try {
            await api.put(`/auth/reset-password/${token}`, { password });
            setSuccess(true);
            toast.success('Password reset successful!');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to reset password';
            setError(msg);
            toast.error(msg);
        } finally { setLoading(false); }
    };

    /* Invalid token screen */
    if (error && !token) {
        return (
            <div style={pageWrap}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: 420, width: '100%' }}>
                    <div style={{ ...card, textAlign: 'center' }}>
                        <div style={{ width: 56, height: 56, background: 'var(--color-background-danger)', border: '0.5px solid var(--color-text-danger)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <XCircle size={22} style={{ color: 'var(--color-text-danger)' }} />
                        </div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, color: 'var(--color-text-primary)', marginBottom: 8 }}>Invalid Link</h1>
                        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 24 }}>
                            This password reset link is invalid or has expired.
                        </p>
                        <Link to="/forgot-password" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                            Request new link
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    /* Success screen */
    if (success) {
        return (
            <div style={pageWrap}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: 420, width: '100%' }}>
                    <div style={{ ...card, textAlign: 'center' }}>
                        <div style={{ width: 56, height: 56, background: 'var(--color-background-success)', border: '0.5px solid var(--color-text-success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <CheckCircle size={22} style={{ color: '#10b981' }} />
                        </div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, color: 'var(--color-text-primary)', marginBottom: 8 }}>Password Reset!</h1>
                        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 24 }}>
                            Your password has been reset successfully. Redirecting to login…
                        </p>
                        <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                            Go to Login
                        </Link>
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
                            <Lock size={20} style={{ color: 'var(--color-background-primary)' }} />
                        </div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, color: 'var(--color-text-primary)', marginBottom: 6 }}>
                            Reset Password
                        </h1>
                        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                            Create a new password for your account
                        </p>
                    </div>

                    {/* Error banner */}
                    {error && (
                        <div style={{ marginBottom: 20, padding: '10px 14px', background: 'var(--color-background-danger)', border: '0.5px solid var(--color-text-danger)', borderRadius: 'var(--border-radius-md)', fontSize: 13, color: 'var(--color-text-danger)' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* New password */}
                        <div>
                            <label className="form-label">New Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min 6 characters"
                                    className="form-input"
                                    style={{ paddingLeft: 30, paddingRight: 36 }}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(v => !v)}
                                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label className="form-label">Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm password"
                                    className="form-input"
                                    style={{ paddingLeft: 30 }}
                                    required
                                />
                            </div>
                        </div>

                        {/* Requirements checklist */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {requirements.map((req, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: req.met ? '#10b981' : 'var(--color-text-tertiary)' }}>
                                    {req.met
                                        ? <CheckCircle size={13} />
                                        : <div style={{ width: 13, height: 13, borderRadius: '50%', border: '1.5px solid var(--color-border-secondary)' }} />
                                    }
                                    {req.label}
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !requirements.every(r => r.met)}
                            className="btn btn-primary"
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            {loading ? <><Loader2 size={14} className="animate-spin" /> Resetting…</> : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
