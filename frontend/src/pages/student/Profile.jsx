import { useState, useEffect } from 'react';
import {
    User,
    GraduationCap,
    Github,
    Linkedin,
    Globe,
    Save,
    Camera,
    Plus,
    X,
    FileText,
    ExternalLink,
    Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import Avatar from '../../components/ui/Avatar';
import ProgressBar from '../../components/ui/ProgressBar';
import toast from 'react-hot-toast';
import ThemePicker from '../../components/settings/ThemePicker';

/* ── tiny reusable field wrappers ── */
const Field = ({ label, error, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {label && (
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {label}
            </label>
        )}
        {children}
        {error && <span style={{ fontSize: 12, color: '#f87171' }}>{error}</span>}
    </div>
);

const inputStyle = {
    width: '100%',
    background: 'var(--color-background-secondary)',
    border: '1px solid var(--color-border-secondary)',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 14,
    color: 'var(--color-text-primary)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
};

const SectionCard = ({ children, style }) => (
    <div style={{
        background: 'var(--color-background-primary)',
        border: '1px solid var(--color-border-tertiary)',
        borderRadius: 12,
        padding: 24,
        ...style,
    }}>
        {children}
    </div>
);

const SectionTitle = ({ icon: Icon, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        {Icon && <Icon size={16} style={{ color: 'var(--color-text-tertiary)' }} />}
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {children}
        </span>
    </div>
);

const Profile = () => {
    const { profile, updateProfile } = useAuth();
    const [saving, setSaving] = useState(false);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [uploadingPicture, setUploadingPicture] = useState(false);
    const [profileErrors, setProfileErrors] = useState({});

    const [formData, setFormData] = useState({
        name: '', rollNumber: '', branch: '', semester: '',
        cgpa: '', backlogs: 0, phone: '', skills: [], projects: [],
        socialLinks: { github: '', linkedin: '', portfolio: '' },
        about: '',
    });
    const [newSkill, setNewSkill] = useState('');
    const [newProject, setNewProject] = useState({ title: '', description: '', technologies: '', link: '', github: '' });
    const [showProjectForm, setShowProjectForm] = useState(false);

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                rollNumber: profile.rollNumber || '',
                branch: profile.branch || '',
                semester: profile.semester || '',
                cgpa: profile.cgpa || '',
                backlogs: profile.backlogs || 0,
                phone: profile.phone || '',
                skills: profile.skills || [],
                projects: profile.projects || [],
                socialLinks: {
                    github: profile.socialLinks?.github || '',
                    linkedin: profile.socialLinks?.linkedin || '',
                    portfolio: profile.socialLinks?.portfolio || '',
                },
                about: profile.about || '',
            });
        }
    }, [profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('socialLinks.')) {
            const field = name.split('.')[1];
            setFormData({ ...formData, socialLinks: { ...formData.socialLinks, [field]: value } });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const addSkill = () => {
        if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
            setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
            setNewSkill('');
        }
    };

    const removeSkill = (skill) => setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });

    const addProject = () => {
        if (newProject.title.trim()) {
            const project = { ...newProject, technologies: newProject.technologies.split(',').map(t => t.trim()).filter(Boolean) };
            setFormData({ ...formData, projects: [...formData.projects, project] });
            setNewProject({ title: '', description: '', technologies: '', link: '', github: '' });
            setShowProjectForm(false);
        }
    };

    const removeProject = (index) => setFormData({ ...formData, projects: formData.projects.filter((_, i) => i !== index) });

    const validateProfile = () => {
        const errs = {};
        if (!formData.name || formData.name.trim().length < 2) errs.name = 'Name is required';
        if (!formData.rollNumber) errs.rollNumber = 'Roll number is required';
        if (!formData.branch) errs.branch = 'Please select your branch';
        const sem = Number(formData.semester);
        if (!formData.semester || isNaN(sem) || sem < 1 || sem > 8) errs.semester = 'Semester must be 1–8';
        const cgpa = Number(formData.cgpa);
        if (formData.cgpa === '' || isNaN(cgpa) || cgpa < 0 || cgpa > 10) errs.cgpa = 'CGPA must be 0–10';
        if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) errs.phone = 'Invalid phone number';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validateProfile();
        setProfileErrors(errs);
        if (Object.keys(errs).length > 0) { toast.error('Please fix the highlighted fields'); return; }
        setSaving(true);
        try {
            const { data } = await studentAPI.updateProfile({
                ...formData,
                semester: parseInt(formData.semester, 10) || 1,
                cgpa: parseFloat(formData.cgpa) || 0,
                backlogs: parseInt(formData.backlogs, 10) || 0,
            });
            updateProfile(data.profile);
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== 'application/pdf') { toast.error('Please upload a PDF file'); return; }
        if (file.size > 5 * 1024 * 1024) { toast.error('File size must be less than 5MB'); return; }
        setUploadingResume(true);
        try {
            const fd = new FormData();
            fd.append('resume', file);
            const { data } = await studentAPI.uploadResume(fd);
            updateProfile({ ...profile, resumeUrl: data.resumeUrl });
            toast.success('Resume uploaded successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload resume');
        } finally {
            setUploadingResume(false);
        }
    };

    const handlePictureUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
        setUploadingPicture(true);
        try {
            const fd = new FormData();
            fd.append('profilePicture', file);
            const { data } = await studentAPI.uploadProfilePicture(fd);
            updateProfile({ ...profile, profilePictureUrl: data.profilePictureUrl });
            toast.success('Profile picture updated!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload picture');
        } finally {
            setUploadingPicture(false);
        }
    };

    const branchOptions = ['Computer Science','Information Technology','Electronics','Electrical','Mechanical','Civil','Chemical','Biotechnology','Other'];

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 48 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
                <div>
                    <div className="eyebrow">Student</div>
                    <h1 className="page-title">My <em>Profile.</em></h1>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>Manage your personal and academic information</p>
                </div>
                {profile && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--color-background-secondary)', border: '1px solid var(--color-border-tertiary)', borderRadius: 8, padding: '8px 14px' }}>
                        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>Profile completeness</span>
                        <div style={{ width: 100 }}>
                            <ProgressBar value={profile.profileCompleteness} showLabel />
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* ── Avatar & Identity ── */}
                <SectionCard>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                        {/* Avatar with upload button */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <Avatar src={profile?.profilePictureUrl} name={formData.name} size="xl" />
                            <label style={{
                                position: 'absolute', bottom: 0, right: 0,
                                width: 30, height: 30, borderRadius: '50%',
                                background: 'var(--color-background-secondary)',
                                border: '1px solid var(--color-border-primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: uploadingPicture ? 'not-allowed' : 'pointer',
                                opacity: uploadingPicture ? 0.6 : 1,
                            }}>
                                {uploadingPicture
                                    ? <Loader2 size={13} style={{ color: 'var(--color-text-secondary)', animation: 'spin 1s linear infinite' }} />
                                    : <Camera size={13} style={{ color: 'var(--color-text-secondary)' }} />
                                }
                                <input type="file" accept="image/*" onChange={handlePictureUpload} style={{ display: 'none' }} disabled={uploadingPicture} />
                            </label>
                        </div>
                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                {formData.name || 'Your Name'}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                                {formData.branch || 'Branch'} {formData.semester ? `• Semester ${formData.semester}` : ''}
                            </div>
                            {profile?.resumeUrl && (
                                <a
                                    href={`http://localhost:5001${profile.resumeUrl}`}
                                    target="_blank" rel="noopener noreferrer"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--accent-text)', marginTop: 8, textDecoration: 'none' }}
                                >
                                    <FileText size={13} /> View Resume <ExternalLink size={11} />
                                </a>
                            )}
                        </div>
                    </div>
                </SectionCard>

                {/* ── Personal Information ── */}
                <SectionCard>
                    <SectionTitle icon={User}>Personal Information</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                        <Field label="Full Name" error={profileErrors.name}>
                            <input style={{ ...inputStyle, borderColor: profileErrors.name ? '#f87171' : undefined }}
                                name="name" value={formData.name} onChange={handleChange}
                                placeholder="Enter your full name" />
                        </Field>
                        <Field label="Roll Number" error={profileErrors.rollNumber}>
                            <input style={{ ...inputStyle, borderColor: profileErrors.rollNumber ? '#f87171' : undefined }}
                                name="rollNumber" value={formData.rollNumber} onChange={handleChange}
                                placeholder="e.g., CS2021001" />
                        </Field>
                        <Field label="Phone Number" error={profileErrors.phone}>
                            <input style={{ ...inputStyle, borderColor: profileErrors.phone ? '#f87171' : undefined }}
                                name="phone" value={formData.phone} onChange={handleChange}
                                placeholder="10-digit mobile number" />
                        </Field>
                        <Field label="Resume (PDF)">
                            <label style={{
                                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                                background: 'var(--color-background-secondary)',
                                border: '1px dashed var(--color-border-secondary)',
                                borderRadius: 8, padding: '10px 12px',
                            }}>
                                {uploadingResume
                                    ? <><Loader2 size={15} style={{ color: 'var(--color-text-tertiary)', animation: 'spin 1s linear infinite' }} /><span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Uploading…</span></>
                                    : <><FileText size={15} style={{ color: 'var(--color-text-tertiary)' }} /><span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{profile?.resumeUrl ? 'Replace resume PDF' : 'Upload resume PDF'}</span></>
                                }
                                <input type="file" accept=".pdf" onChange={handleResumeUpload} style={{ display: 'none' }} disabled={uploadingResume} />
                            </label>
                        </Field>
                    </div>
                </SectionCard>

                {/* ── Academic Information ── */}
                <SectionCard>
                    <SectionTitle icon={GraduationCap}>Academic Information</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                        <Field label="Branch" error={profileErrors.branch}>
                            <select
                                name="branch" value={formData.branch} onChange={handleChange}
                                style={{ ...inputStyle, borderColor: profileErrors.branch ? '#f87171' : undefined }}
                            >
                                <option value="">Select branch</option>
                                {branchOptions.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </Field>
                        <Field label="Semester" error={profileErrors.semester}>
                            <select
                                name="semester" value={formData.semester} onChange={handleChange}
                                style={{ ...inputStyle, borderColor: profileErrors.semester ? '#f87171' : undefined }}
                            >
                                <option value="">Select semester</option>
                                {Array.from({ length: 8 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>Semester {i + 1}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="CGPA (0–10)" error={profileErrors.cgpa}>
                            <input style={{ ...inputStyle, borderColor: profileErrors.cgpa ? '#f87171' : undefined }}
                                type="number" step="0.01" min="0" max="10"
                                name="cgpa" value={formData.cgpa} onChange={handleChange}
                                placeholder="e.g., 8.5" />
                        </Field>
                        <Field label="Active Backlogs">
                            <input style={inputStyle} type="number" min="0"
                                name="backlogs" value={formData.backlogs} onChange={handleChange}
                                placeholder="0" />
                        </Field>
                    </div>
                </SectionCard>

                {/* ── Skills ── */}
                <SectionCard>
                    <SectionTitle>Skills</SectionTitle>
                    {/* Skill tags */}
                    {formData.skills.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                            {formData.skills.map((skill, i) => (
                                <span key={i} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '5px 12px', borderRadius: 100, fontSize: 13,
                                    background: 'var(--accent-soft)',
                                    color: 'var(--accent-text)',
                                    border: '1px solid rgba(132,204,22,0.2)',
                                }}>
                                    {skill}
                                    <button type="button" onClick={() => removeSkill(skill)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', padding: 0 }}>
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    {/* Add skill input */}
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input
                            style={{ ...inputStyle, flex: 1 }}
                            value={newSkill} onChange={e => setNewSkill(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                            placeholder="Type a skill and press Enter or Add (e.g., React, Python)"
                        />
                        <button type="button" onClick={addSkill}
                            style={{
                                padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                                background: 'var(--color-background-secondary)',
                                border: '1px solid var(--color-border-secondary)',
                                color: 'var(--color-text-primary)', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                            }}>
                            <Plus size={14} /> Add
                        </button>
                    </div>
                </SectionCard>

                {/* ── Projects ── */}
                <SectionCard>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Projects</span>
                        <button type="button" onClick={() => setShowProjectForm(!showProjectForm)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                                borderRadius: 8, fontSize: 13, fontWeight: 500,
                                background: 'var(--color-background-secondary)',
                                border: '1px solid var(--color-border-secondary)',
                                color: 'var(--color-text-primary)', cursor: 'pointer',
                            }}>
                            <Plus size={14} /> Add Project
                        </button>
                    </div>

                    {/* Add project form */}
                    {showProjectForm && (
                        <div style={{ background: 'var(--color-background-secondary)', border: '1px solid var(--color-border-tertiary)', borderRadius: 10, padding: 20, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <Field label="Project Title">
                                    <input style={inputStyle} value={newProject.title}
                                        onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                                        placeholder="My Awesome Project" />
                                </Field>
                                <Field label="Technologies (comma-separated)">
                                    <input style={inputStyle} value={newProject.technologies}
                                        onChange={e => setNewProject({ ...newProject, technologies: e.target.value })}
                                        placeholder="React, Node.js, MongoDB" />
                                </Field>
                            </div>
                            <Field label="Description">
                                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} rows={3}
                                    value={newProject.description}
                                    onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                                    placeholder="Describe what this project does..." />
                            </Field>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <Field label="Live Link (optional)">
                                    <input style={inputStyle} value={newProject.link}
                                        onChange={e => setNewProject({ ...newProject, link: e.target.value })}
                                        placeholder="https://myproject.com" />
                                </Field>
                                <Field label="GitHub Link (optional)">
                                    <input style={inputStyle} value={newProject.github}
                                        onChange={e => setNewProject({ ...newProject, github: e.target.value })}
                                        placeholder="https://github.com/..." />
                                </Field>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button type="button" onClick={addProject} style={{ padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500, background: 'var(--color-text-primary)', color: 'var(--color-background-primary)', border: 'none', cursor: 'pointer' }}>
                                    Add Project
                                </button>
                                <button type="button" onClick={() => setShowProjectForm(false)} style={{ padding: '9px 20px', borderRadius: 8, fontSize: 13, background: 'transparent', border: '1px solid var(--color-border-secondary)', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Project list */}
                    {formData.projects.length === 0 && !showProjectForm && (
                        <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', textAlign: 'center', padding: '24px 0' }}>
                            No projects added yet. Click "Add Project" to showcase your work.
                        </p>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {formData.projects.map((project, index) => (
                            <div key={index} style={{ border: '1px solid var(--color-border-tertiary)', borderRadius: 10, padding: 16, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{project.title}</div>
                                    {project.description && <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4, lineHeight: 1.5 }}>{project.description}</p>}
                                    {project.technologies?.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                                            {project.technologies.map((tech, i) => (
                                                <span key={i} style={{ fontSize: 11, padding: '3px 8px', background: 'var(--color-background-secondary)', border: '1px solid var(--color-border-tertiary)', borderRadius: 4, color: 'var(--color-text-secondary)' }}>
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button type="button" onClick={() => removeProject(index)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', flexShrink: 0, padding: 4 }}>
                                    <X size={15} />
                                </button>
                            </div>
                        ))}
                    </div>
                </SectionCard>

                {/* ── Social Links ── */}
                <SectionCard>
                    <SectionTitle>Social Links</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                        <Field label="GitHub">
                            <div style={{ position: 'relative' }}>
                                <Github size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }} />
                                <input style={{ ...inputStyle, paddingLeft: 36 }}
                                    name="socialLinks.github" value={formData.socialLinks.github}
                                    onChange={handleChange} placeholder="https://github.com/username" />
                            </div>
                        </Field>
                        <Field label="LinkedIn">
                            <div style={{ position: 'relative' }}>
                                <Linkedin size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }} />
                                <input style={{ ...inputStyle, paddingLeft: 36 }}
                                    name="socialLinks.linkedin" value={formData.socialLinks.linkedin}
                                    onChange={handleChange} placeholder="https://linkedin.com/in/username" />
                            </div>
                        </Field>
                        <Field label="Portfolio">
                            <div style={{ position: 'relative' }}>
                                <Globe size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }} />
                                <input style={{ ...inputStyle, paddingLeft: 36 }}
                                    name="socialLinks.portfolio" value={formData.socialLinks.portfolio}
                                    onChange={handleChange} placeholder="https://yourportfolio.com" />
                            </div>
                        </Field>
                    </div>
                </SectionCard>

                {/* ── About Me ── */}
                <SectionCard>
                    <SectionTitle>About Me</SectionTitle>
                    <textarea
                        name="about" value={formData.about} onChange={handleChange}
                        rows={4} maxLength={500}
                        placeholder="Write a brief introduction about yourself..."
                        style={{ ...inputStyle, resize: 'vertical', minHeight: 100, lineHeight: 1.6 }}
                    />
                    <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 6, textAlign: 'right' }}>
                        {formData.about.length}/500 characters
                    </div>
                </SectionCard>

                {/* ── Save Button ── */}
                <button
                    type="submit"
                    disabled={saving}
                    style={{
                        width: '100%', padding: '14px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                        background: 'var(--color-text-primary)', color: 'var(--color-background-primary)',
                        border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        transition: 'opacity 0.15s',
                    }}>
                    {saving
                        ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
                        : <><Save size={16} /> Save Profile</>
                    }
                </button>
            </form>

            {/* ── Appearance ── */}
            <div style={{
                marginTop: 32,
                paddingTop: 24,
                borderTop: '0.5px solid var(--color-border-tertiary)',
            }}>
                <ThemePicker />
            </div>
        </div>
    );
};

export default Profile;
