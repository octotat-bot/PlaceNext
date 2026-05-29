import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Eye, EyeOff, ArrowRight, Lock, Mail, Phone,
    GraduationCap, Building2, Briefcase, Zap,
    CheckCircle, TrendingUp, Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated, user, profile, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isPhone = /^[6-9]\d{9}$/.test(identifier);

    useEffect(() => {
        if (location.state?.identifier) {
            setIdentifier(location.state.identifier);
        }
        if (location.state?.password) {
            setPassword(location.state.password);
        }
    }, [location.state]);

    useEffect(() => {
        if (authLoading) return;
        if (isAuthenticated && user) {
            if (user.role === 'admin') navigate('/admin/dashboard');
            else if (user.role === 'recruiter') navigate('/recruiter/dashboard');
            else navigate(profile ? '/dashboard' : '/profile');
        }
    }, [isAuthenticated, user, profile, navigate, authLoading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!identifier || !password) { toast.error('Please fill in all fields'); return; }
        setLoading(true);
        try {
            await login(identifier, password);
            toast.success('Welcome back!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
            setLoading(false);
        }
    };

    const features = [
        {
            icon: TrendingUp,
            title: 'AI Resume Analysis',
            desc: 'Get instant ATS score and tailored improvement tips',
        },
        {
            icon: CheckCircle,
            title: 'Smart Drive Matching',
            desc: 'Auto-matched to drives you\'re eligible for',
        },
        {
            icon: Users,
            title: 'Recruiter Connect',
            desc: 'Direct visibility to 50+ partner companies',
        },
    ];

    const stats = [
        { icon: GraduationCap, value: '500+', label: 'Students Placed' },
        { icon: Building2,     value: '50+',  label: 'Partner Companies' },
        { icon: Briefcase,     value: '₹12L', label: 'Avg. Package' },
        { icon: Zap,           value: '95%',  label: 'Placement Rate' },
    ];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'var(--font-sans)' }}>

            {/* ── Left Panel: Branding + Stats ── */}
            <div
                className="hidden lg:flex"
                style={{
                    flex: 1,
                    background: 'var(--color-background-secondary)',
                    borderRight: '0.5px solid var(--color-border-tertiary)',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '56px 48px',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Subtle dot grid */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'radial-gradient(#0F172A 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

                {/* Logo wordmark */}
                <div style={{ marginBottom: 40 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--color-text-primary)' }}>
                        Place<em style={{ fontStyle: 'italic', color: '#e8a045' }}>Next</em>
                    </div>
                </div>

                {/* Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="eyebrow" style={{ marginBottom: 12 }}>Campus Placement</div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 400, color: 'var(--color-text-primary)', lineHeight: 1.2, marginBottom: 14 }}>
                        Your career journey,<br />
                        <em style={{ color: '#e8a045', fontStyle: 'italic' }}>reimagined.</em>
                    </h2>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 36, maxWidth: 340 }}>
                        AI-powered placement portal connecting students with top recruiters — smart matching, real-time tracking, all in one place.
                    </p>
                </motion.div>

                {/* Feature cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}
                >
                    {features.map((f, i) => (
                        <div key={i} style={{
                            background: 'var(--color-background-primary)',
                            border: '0.5px solid var(--color-border-tertiary)',
                            borderRadius: 'var(--border-radius-lg)',
                            padding: '14px 16px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12,
                        }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                                background: 'var(--color-background-secondary)',
                                border: '0.5px solid var(--color-border-tertiary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <f.icon size={15} style={{ color: 'var(--color-text-secondary)' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{f.title}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{f.desc}</div>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Stat grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}
                >
                    {stats.map(({ icon: Icon, value, label }) => (
                        <div key={label} style={{
                            background: 'var(--color-background-primary)',
                            border: '0.5px solid var(--color-border-tertiary)',
                            borderRadius: 'var(--border-radius-md)',
                            padding: '14px 16px',
                        }}>
                            <Icon size={14} style={{ color: 'var(--color-text-tertiary)', marginBottom: 6 }} />
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--color-text-primary)' }}>{value}</div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* ── Right Panel: Form ── */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 24px',
                background: 'var(--color-background-primary)',
                overflowY: 'auto',
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ width: '100%', maxWidth: 400 }}
                >
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        {/* Mobile logo */}
                        <div className="lg:hidden" style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--color-text-primary)', marginBottom: 16 }}>
                            Place<em style={{ fontStyle: 'italic', color: '#e8a045' }}>Next</em>
                        </div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400, color: 'var(--color-text-primary)', marginBottom: 6 }}>
                            Welcome <em style={{ fontStyle: 'italic', color: '#e8a045' }}>back.</em>
                        </h1>
                        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                            Sign in to access your placement portal
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* Email / Mobile */}
                        <div>
                            <label className="form-label">Email or Mobile</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute', left: 13, top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: isPhone ? '#10b981' : 'var(--color-text-tertiary)',
                                    display: 'flex', pointerEvents: 'none',
                                }}>
                                    {isPhone ? <Phone size={14} /> : <Mail size={14} />}
                                </div>
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={e => setIdentifier(e.target.value)}
                                    className="form-input"
                                    style={{ paddingLeft: 36 }}
                                    placeholder="you@example.com or 9876543210"
                                    required
                                />
                            </div>
                            <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 5 }}>
                                Students can also sign in with their mobile number
                            </p>
                        </div>

                        {/* Password */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                                <Link
                                    to="/forgot-password"
                                    style={{ fontSize: 11, color: 'var(--color-text-secondary)', textDecoration: 'none', fontWeight: 500 }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                                >
                                    Forgot?
                                </Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute', left: 13, top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--color-text-tertiary)',
                                    display: 'flex', pointerEvents: 'none',
                                }}>
                                    <Lock size={14} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="form-input"
                                    style={{ paddingLeft: 36, paddingRight: 40 }}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(s => !s)}
                                    aria-label="Toggle password"
                                    style={{
                                        position: 'absolute', right: 12, top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--color-text-tertiary)', display: 'flex',
                                    }}
                                >
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>

                        <Button type="submit" variant="primary" loading={loading} size="lg" className="w-full" style={{ marginTop: 4, justifyContent: 'center' }}>
                            Sign In <ArrowRight size={14} />
                        </Button>
                    </form>

                    {/* Quick Login */}
                    <div style={{ marginTop: 28, paddingTop: 20, borderTop: '0.5px solid var(--color-border-tertiary)' }}>
                        <div className="eyebrow" style={{ textAlign: 'center', marginBottom: 10 }}>Quick Login</div>
                        <button
                            type="button"
                            onClick={() => { setIdentifier('admin@placement.com'); setPassword('admin123'); }}
                            className="btn btn-primary btn-sm"
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            <Zap size={13} /> Fill Admin Credentials
                        </button>
                        <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', textAlign: 'center', marginTop: 6 }}>
                            Auto-fills admin credentials — just press Sign In
                        </p>
                    </div>

                    {/* Register link */}
                    <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 24 }}>
                        No account?{' '}
                        <Link to="/register" style={{ color: 'var(--color-text-primary)', fontWeight: 500, textDecoration: 'none' }}>
                            Sign up
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
