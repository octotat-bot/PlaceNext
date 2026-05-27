import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, User, CheckCircle, FileText, Bot, Key, Phone, Building2, Briefcase, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
    const [selectedRole, setSelectedRole] = useState('student'); // 'student' or 'recruiter'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        companyName: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [registrationComplete, setRegistrationComplete] = useState(false);
    const [pendingRecruiter, setPendingRecruiter] = useState(null);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const { register } = useAuth();
    const navigate = useNavigate();

    const validateField = (name, value) => {
        switch (name) {
            case 'name':
                if (!value || value.trim().length < 2) return 'Name must be at least 2 characters';
                return '';
            case 'email':
                if (!value) return 'Email is required';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
                return '';
            case 'phone':
                if (selectedRole !== 'student') return '';
                if (!value) return 'Phone number is required';
                if (!/^[6-9]\d{9}$/.test(value)) return 'Enter a valid 10-digit mobile number';
                return '';
            case 'companyName':
                if (selectedRole !== 'recruiter') return '';
                if (!value || value.trim().length < 2) return 'Company name is required';
                return '';
            case 'password':
                if (!value) return 'Password is required';
                if (value.length < 6) return 'Must be at least 6 characters';
                return '';
            case 'confirmPassword':
                if (!value) return 'Please confirm your password';
                if (value !== formData.password) return 'Passwords do not match';
                return '';
            default: return '';
        }
    };

    const getPasswordStrength = (password) => {
        if (!password) return { score: 0, label: '', color: '' };
        let score = 0;
        if (password.length >= 6) score++;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        const levels = [
            { label: '', hex: '' },
            { label: 'Weak',        hex: '#ef4444' },
            { label: 'Fair',        hex: '#f97316' },
            { label: 'Good',        hex: '#eab308' },
            { label: 'Strong',      hex: '#10b981' },
            { label: 'Very Strong', hex: '#16a34a' },
        ];
        return { score, ...levels[score] };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (touched[name]) {
            setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields
        const fields = ['name', 'email', 'password', 'confirmPassword'];
        if (selectedRole === 'student') fields.push('phone');
        if (selectedRole === 'recruiter') fields.push('companyName');

        const newErrors = {};
        fields.forEach((f) => { newErrors[f] = validateField(f, formData[f]); });
        setErrors(newErrors);
        setTouched(Object.fromEntries(fields.map((f) => [f, true])));

        if (Object.values(newErrors).some((e) => e)) {
            toast.error('Please fix the errors below');
            return;
        }

        setLoading(true);
        try {
            const data = await register(
                formData.email,
                formData.password,
                selectedRole,
                formData.name,
                selectedRole === 'student' ? formData.phone : null,
                selectedRole === 'recruiter' ? formData.companyName : null
            );

            // Check if this is a recruiter with pending approval
            if (data.requiresApproval) {
                setRegistrationComplete(true);
                setPendingRecruiter(data.user);
                toast.success('Registration submitted for approval!');
            } else {
                toast.success('Registration successful!');
                navigate('/profile');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const getRoleConfig = () => {
        switch (selectedRole) {
            case 'recruiter':
                return {
                    badge: 'RECRUITER REGISTRATION',
                    icon: <Briefcase className="w-5 h-5 text-white" />,
                    iconBg: 'bg-primary',
                    title: 'Recruiter Portal',
                    subtitle: 'Find Top Talent.',
                    description: 'Register as a recruiter to post job openings, review applications, and connect with qualified candidates.',
                    accentColor: 'indigo',
                    features: [
                        { icon: Building2, title: 'Company Dashboard', desc: 'Manage job postings and view applicant profiles' },
                        { icon: Briefcase, title: 'Direct Applications', desc: 'Receive and review applications from qualified students' },
                        { icon: Clock, title: 'Admin Approval', desc: 'Account will be verified before activation' },
                    ],
                };
            default:
                return {
                    badge: 'STUDENT REGISTRATION',
                    icon: <User className="w-5 h-5 text-white" />,
                    iconBg: 'bg-primary',
                    title: 'Start Your Career',
                    subtitle: 'Journey Today.',
                    description: 'Join thousands of students who have landed their dream jobs through our AI-powered placement portal.',
                    accentColor: 'slate',
                    features: [
                        { icon: FileText, title: 'AI Resume Analysis', desc: 'Get instant feedback on your resume with ATS score and suggestions' },
                        { icon: CheckCircle, title: 'Smart Matching', desc: 'Automatically matched with drives based on your eligibility' },
                        { icon: Bot, title: 'AI Assistant', desc: '24/7 chatbot for placement queries and interview prep tips' },
                    ],
                };
        }
    };

    const config = getRoleConfig();

    // Show success screen for pending recruiter registration
    if (registrationComplete && pendingRecruiter) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-background-tertiary)', padding: 24 }}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                        background: 'var(--color-background-primary)',
                        border: '0.5px solid var(--color-border-tertiary)',
                        borderRadius: 'var(--border-radius-lg)', padding: 36,
                        maxWidth: 440, width: '100%', textAlign: 'center',
                    }}
                >
                    <div style={{ width: 64, height: 64, background: 'var(--color-text-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <Clock style={{ color: 'var(--color-background-primary)', width: 28, height: 28 }} />
                    </div>
                    <h2 style={{ fontSize: 22, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>Registration Submitted!</h2>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 20 }}>
                        Your recruiter account for <strong style={{ color: 'var(--color-text-primary)' }}>{pendingRecruiter.companyName}</strong> is pending admin approval.
                    </p>

                    <div style={{ background: 'var(--color-background-warning)', border: '0.5px solid var(--color-text-warning)', borderRadius: 'var(--border-radius-md)', padding: '12px 16px', marginBottom: 20, textAlign: 'left' }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 8 }}>What happens next?</div>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {['Our admin team will review your registration', "You'll receive an email once approved", 'Then you can log in and start posting jobs'].map((step, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                                    <CheckCircle size={13} style={{ color: 'var(--color-text-warning)', flexShrink: 0, marginTop: 1 }} />
                                    {step}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 20 }}>
                        Registered email: <strong style={{ color: 'var(--color-text-primary)' }}>{pendingRecruiter.email}</strong>
                    </p>

                    <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', textDecoration: 'none' }}>
                        Go to Login <ArrowRight size={13} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', color: 'var(--color-text-primary)', background: 'var(--color-background-tertiary)' }}>
            {/* Left Side - Illustration */}
            <div className="hidden lg:flex flex-1" style={{ background: 'var(--color-background-secondary)', borderRight: '0.5px solid var(--color-border-tertiary)', alignItems: 'center', justifyContent: 'center', padding: 48, position: 'relative', overflow: 'hidden' }}>
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#0F172A 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

                <div className="text-left w-full max-w-lg relative z-10">
                    <div className="mb-6">
                        <motion.span
                            key={selectedRole}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ display: 'inline-block', padding: '3px 10px', border: '0.5px solid var(--color-border-secondary)', fontSize: 10, fontWeight: 500, borderRadius: 100, marginBottom: 12, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--color-background-primary)', color: 'var(--color-text-secondary)' }}>
                            {config.badge}
                        </motion.span>
                        <h2 style={{ fontSize: 32, fontWeight: 400, fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', lineHeight: 1.2, marginBottom: 12 }}>
                            {config.title}<br />
                            <em style={{ color: '#e8a045', fontStyle: 'italic' }}>{config.subtitle}</em>
                        </h2>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 32, lineHeight: 1.7 }}>
                        {config.description}
                    </p>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedRole}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            {config.features.map((feature, index) => (
                                <div key={index} style={{ background: 'var(--color-background-primary)', padding: '14px 16px', borderRadius: 'var(--border-radius-lg)', border: '0.5px solid var(--color-border-tertiary)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 'var(--border-radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)' }}>
                                        <feature.icon size={16} style={{ color: 'var(--color-text-secondary)' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{feature.title}</div>
                                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{feature.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Right Side - Form */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: 'var(--color-background-primary)', overflowY: 'auto' }}>
                <div className="w-full max-w-md flex flex-col">
                    <div className="text-center mb-6">
                        <motion.div
                            key={selectedRole}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 10, marginBottom: 14, background: 'var(--color-text-primary)' }}
                        >
                            {config.icon}
                        </motion.div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>Create Account</h1>
                        <p className="text-sm text-[var(--muted)] mt-1">
                            {selectedRole === 'recruiter'
                                ? 'Register as a company recruiter'
                                : 'Start your placement journey today'}
                        </p>
                    </div>

                    {/* Role Toggle */}
                    <div style={{ display: 'flex', position: 'relative', background: 'var(--color-background-secondary)', padding: 4, borderRadius: 100, marginBottom: 18 }}>
                        <motion.div
                            style={{ position: 'absolute', top: 4, bottom: 4, background: 'var(--color-text-primary)', borderRadius: 100 }}
                            initial={false}
                            animate={{ x: selectedRole === 'student' ? '0%' : '100%', width: '50%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                        <button
                            type="button"
                            onClick={() => setSelectedRole('student')}
                            style={{ flex: 1, position: 'relative', zIndex: 1, padding: '8px 16px', fontSize: 13, fontWeight: 500, transition: 'color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: selectedRole === 'student' ? 'var(--color-background-primary)' : 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 100 }}
                        >
                            <User size={14} /> Student
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedRole('recruiter')}
                            style={{ flex: 1, position: 'relative', zIndex: 1, padding: '8px 16px', fontSize: 13, fontWeight: 500, transition: 'color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: selectedRole === 'recruiter' ? 'var(--color-background-primary)' : 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 100 }}
                        >
                            <Briefcase size={14} /> Recruiter
                        </button>
                    </div>

                    {/* Recruiter Notice */}
                    <AnimatePresence>
                        {selectedRole === 'recruiter' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div style={{ background: 'var(--color-background-warning)', border: '0.5px solid var(--color-text-warning)', borderRadius: 'var(--border-radius-md)', padding: '10px 12px', marginBottom: 14, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                    <Clock size={13} style={{ color: 'var(--color-text-warning)', flexShrink: 0, marginTop: 1 }} />
                                    <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                                        Recruiter accounts require admin approval. You'll receive an email once verified.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Common: Full Name */}
                        <div>
                            <label className="label">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`input !pl-9 ${errors.name && touched.name ? '!border-[var(--color-text-danger)]' : ''}`}
                                    placeholder="Your full name"
                                    required
                                />
                            </div>
                            {errors.name && touched.name && <p style={{ fontSize: 11, color: 'var(--color-text-danger)', marginTop: 3 }}>{errors.name}</p>}
                        </div>

                        {/* Student: Phone Number */}
                        <AnimatePresence initial={false}>
                            {selectedRole === 'student' && (
                                <motion.div
                                    key="phone-field"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div>
                                        <label className="label">Mobile Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className={`input !pl-9 ${errors.phone && touched.phone ? '!border-[var(--color-text-danger)]' : ''}`}
                                                placeholder="10-digit mobile number"
                                                maxLength={10}
                                                required={selectedRole === 'student'}
                                            />
                                        </div>
                                        {errors.phone && touched.phone && <p style={{ fontSize: 11, color: 'var(--color-text-danger)', marginTop: 3 }}>{errors.phone}</p>}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Recruiter: Company Name */}
                        <AnimatePresence initial={false}>
                            {selectedRole === 'recruiter' && (
                                <motion.div
                                    key="company-field"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div>
                                        <label className="label">Company Name</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
                                            <input
                                                type="text"
                                                name="companyName"
                                                value={formData.companyName}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className={`input !pl-9 ${errors.companyName && touched.companyName ? '!border-[var(--color-text-danger)]' : ''}`}
                                                placeholder="Your company name"
                                                required={selectedRole === 'recruiter'}
                                            />
                                        </div>
                                        {errors.companyName && touched.companyName && <p style={{ fontSize: 11, color: 'var(--color-text-danger)', marginTop: 3 }}>{errors.companyName}</p>}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Email */}
                        <div>
                            <label className="label">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`input !pl-9 ${errors.email && touched.email ? '!border-[var(--color-text-danger)]' : ''}`}
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                            {errors.email && touched.email && <p style={{ fontSize: 11, color: 'var(--color-text-danger)', marginTop: 3 }}>{errors.email}</p>}
                        </div>

                        {/* Passwords Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`input !pl-9 pr-8 ${errors.password && touched.password ? '!border-[var(--color-text-danger)]' : ''}`}
                                        placeholder="Min 6 chars"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text)]"
                                    >
                                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                {errors.password && touched.password && <p style={{ fontSize: 11, color: 'var(--color-text-danger)', marginTop: 3 }}>{errors.password}</p>}
                            </div>

                            <div>
                                <label className="label">Confirm</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`input !pl-9 ${errors.confirmPassword && touched.confirmPassword ? '!border-[var(--color-text-danger)]' : ''}`}
                                        placeholder="Confirm"
                                        required
                                    />
                                </div>
                                {errors.confirmPassword && touched.confirmPassword && <p style={{ fontSize: 11, color: 'var(--color-text-danger)', marginTop: 3 }}>{errors.confirmPassword}</p>}
                            </div>
                        </div>

                        {/* Password Strength Meter */}
                        {formData.password && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <div style={{ display: 'flex', gap: 3 }}>
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, transition: 'background 0.3s', background: i <= passwordStrength.score ? passwordStrength.hex : 'var(--color-border-secondary)' }} />
                                    ))}
                                </div>
                                <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Strength: <span style={{ fontWeight: 500, color: passwordStrength.hex || 'var(--color-text-secondary)' }}>{passwordStrength.label || '—'}</span></p>
                            </div>
                        )}

                        {/* Terms */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4 }}>
                            <input type="checkbox" required style={{ width: 13, height: 13, accentColor: 'var(--color-text-primary)', cursor: 'pointer' }} />
                            <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                                I agree to <a href="#" style={{ fontWeight: 500, color: 'var(--color-text-primary)', textDecoration: 'none' }}>Terms</a> &amp; <a href="#" style={{ fontWeight: 500, color: 'var(--color-text-primary)', textDecoration: 'none' }}>Privacy</a>
                            </span>
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            variant="primary"
                            loading={loading}
                            className="w-full py-2.5 text-sm"
                        >
                            {selectedRole === 'recruiter' ? 'Submit for Approval' : 'Create Account'}
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                    </form>

                    {/* Login Link */}
                    <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 16 }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ fontWeight: 500, color: 'var(--color-text-primary)', textDecoration: 'none' }}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
