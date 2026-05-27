import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Search,
    Briefcase,
    Edit,
    Trash2,
    Eye,
    Users,
    Calendar,
    MapPin,
    Building2,
    Download,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { DriveCardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate, formatPackage, getDriveStatusClass, downloadCSV } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ManageDrives = () => {
    const [drives, setDrives] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showApplicationsModal, setShowApplicationsModal] = useState(false);
    const [selectedDrive, setSelectedDrive] = useState(null);
    const [applications, setApplications] = useState([]);
    const [saving, setSaving] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');

    const [formData, setFormData] = useState({
        companyId: '',
        roleTitle: '',
        roleDescription: '',
        jobType: 'full-time',
        package: '',
        stipend: '',
        location: '',
        workMode: 'onsite',
        applicationDeadline: '',
        numberOfOpenings: '',
        eligibilityCriteria: {
            minCGPA: '',
            allowedBranches: [],
            maxBacklogs: 0,
            minSemester: 1,
            requiredSkills: [],
        },
        selectionProcess: [],
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [drivesRes, companiesRes] = await Promise.all([
                adminAPI.getDrives({ status: statusFilter !== 'all' ? statusFilter : undefined }),
                adminAPI.getCompanies(),
            ]);
            setDrives(drivesRes.data.drives || []);
            setCompanies(companiesRes.data.companies || []);
        } catch (_error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const parsedPkg = parseFloat(formData.package);
            const parsedStipend = parseFloat(formData.stipend);
            const parsedOpenings = parseInt(formData.numberOfOpenings, 10);
            const parsedCGPA = parseFloat(formData.eligibilityCriteria.minCGPA);
            const parsedBacklogs = parseInt(formData.eligibilityCriteria.maxBacklogs, 10);
            const parsedSemester = parseInt(formData.eligibilityCriteria.minSemester, 10);

            const payload = {
                ...formData,
                package: !isNaN(parsedPkg) ? parsedPkg : undefined,
                stipend: !isNaN(parsedStipend) ? parsedStipend : undefined,
                numberOfOpenings: !isNaN(parsedOpenings) ? parsedOpenings : undefined,
                eligibilityCriteria: {
                    ...formData.eligibilityCriteria,
                    minCGPA: !isNaN(parsedCGPA) ? parsedCGPA : 0,
                    maxBacklogs: !isNaN(parsedBacklogs) ? parsedBacklogs : 0,
                    minSemester: !isNaN(parsedSemester) ? parsedSemester : 1,
                },
            };

            if (selectedDrive) {
                await adminAPI.updateDrive(selectedDrive._id, payload);
                toast.success('Drive updated successfully');
            } else {
                await adminAPI.createDrive(payload);
                toast.success('Drive created successfully');
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setSaving(false);
        }
    };

    const handleViewApplications = async (drive) => {
        try {
            const { data } = await adminAPI.getDriveApplications(drive._id);
            setApplications(data.applications || []);
            setSelectedDrive(drive);
            setShowApplicationsModal(true);
        } catch (_error) {
            toast.error('Failed to load applications');
        }
    };

    const handleStatusUpdate = async (appId, newStatus) => {
        try {
            await adminAPI.updateApplicationStatus(appId, { status: newStatus });
            toast.success('Status updated');
            handleViewApplications(selectedDrive);
        } catch (_error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this drive?')) return;
        try {
            await adminAPI.deleteDrive(id);
            toast.success('Drive deleted');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        }
    };

    const resetForm = () => {
        setSelectedDrive(null);
        setFormData({
            companyId: '',
            roleTitle: '',
            roleDescription: '',
            jobType: 'full-time',
            package: '',
            stipend: '',
            location: '',
            workMode: 'onsite',
            applicationDeadline: '',
            numberOfOpenings: '',
            eligibilityCriteria: {
                minCGPA: '',
                allowedBranches: [],
                maxBacklogs: 0,
                minSemester: 1,
                requiredSkills: [],
            },
            selectionProcess: [],
        });
    };

    const branchOptions = [
        'Computer Science', 'Information Technology', 'Electronics', 'Electrical',
        'Mechanical', 'Civil', 'Chemical', 'Biotechnology', 'Other', 'All'
    ];

    const handleBranchToggle = (branch) => {
        const current = formData.eligibilityCriteria.allowedBranches;
        const updated = current.includes(branch)
            ? current.filter(b => b !== branch)
            : [...current, branch];
        setFormData({
            ...formData,
            eligibilityCriteria: { ...formData.eligibilityCriteria, allowedBranches: updated }
        });
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title">Manage <em>drives.</em></h1>
                    <p className="text-muted mt-1">Create and manage placement drives</p>
                </div>
                <Button variant="primary" onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus className="w-4 h-4" />
                    Create Drive
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input w-auto"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            {/* Drives List */}
            {loading ? (
                <div className="grid md:grid-cols-2 gap-4">
                    {Array(4).fill(0).map((_, i) => <DriveCardSkeleton key={i} />)}
                </div>
            ) : drives.length === 0 ? (
                <Card className="text-center py-12">
                    <EmptyState type="drives" title="No drives found" description="Create a new placement drive to get started" />
                </Card>
            ) : (
                <div className="space-y-4">
                    {drives.map((drive) => (
                        <Card key={drive._id}>
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-14 h-14 bg-[var(--bg-surface-2)] rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Building2 className="w-7 h-7 icon-muted" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{drive.roleTitle}</h3>
                                        <p className="text-sm text-muted">{drive.companyId?.companyName}</p>
                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {drive.location}
                                            </span>
                                            <span>{formatPackage(drive.package || drive.stipend, drive.package ? 'lpa' : 'stipend')}</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(drive.applicationDeadline)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {drive.applicantCount || 0} applicants
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Badge className={getDriveStatusClass(drive.driveStatus)}>
                                        {drive.driveStatus}
                                    </Badge>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewApplications(drive)}
                                        >
                                            <Eye className="w-4 h-4" />
                                            Applications
                                        </Button>
                                        <button
                                            onClick={() => {
                                                setSelectedDrive(drive);
                                                setFormData({
                                                    companyId: drive.companyId?._id || '',
                                                    roleTitle: drive.roleTitle || '',
                                                    roleDescription: drive.roleDescription || '',
                                                    jobType: drive.jobType || 'full-time',
                                                    package: drive.package || '',
                                                    stipend: drive.stipend || '',
                                                    location: drive.location || '',
                                                    workMode: drive.workMode || 'onsite',
                                                    applicationDeadline: drive.applicationDeadline || '',
                                                    numberOfOpenings: drive.numberOfOpenings || '',
                                                    eligibilityCriteria: {
                                                        minCGPA: drive.eligibilityCriteria?.minCGPA ?? '',
                                                        allowedBranches: drive.eligibilityCriteria?.allowedBranches || [],
                                                        maxBacklogs: drive.eligibilityCriteria?.maxBacklogs ?? 0,
                                                        minSemester: drive.eligibilityCriteria?.minSemester ?? 1,
                                                        requiredSkills: drive.eligibilityCriteria?.requiredSkills || [],
                                                    },
                                                    selectionProcess: drive.selectionProcess || [],
                                                });
                                                setShowModal(true);
                                            }}
                                            className="p-2 hover:bg-[var(--bg-surface-2)] rounded-lg transition-colors"
                                        >
                                            <Edit className="w-4 h-4 text-muted" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(drive._id)}
                                            className="p-2 hover:bg-[var(--reject-btn-bg)] rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 text-[var(--danger)]" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create/Edit Drive Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); resetForm(); }}
                title={selectedDrive ? 'Edit Drive' : 'Create New Drive'}
                size="xl"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Select
                            label="Company"
                            value={formData.companyId}
                            onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                            options={companies.map(c => ({ value: c._id, label: c.companyName }))}
                            required
                        />
                        <Input
                            label="Role Title"
                            value={formData.roleTitle}
                            onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="label">Role Description</label>
                        <textarea
                            value={formData.roleDescription}
                            onChange={(e) => setFormData({ ...formData, roleDescription: e.target.value })}
                            className="input"
                            rows="3"
                            required
                        />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <Select
                            label="Job Type"
                            value={formData.jobType}
                            onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                            options={[
                                { value: 'full-time', label: 'Full Time' },
                                { value: 'internship', label: 'Internship' },
                                { value: 'both', label: 'Both' },
                            ]}
                        />
                        {formData.jobType !== 'internship' && (
                            <Input
                                label="Package (LPA)"
                                type="number"
                                step="0.1"
                                value={formData.package}
                                onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                            />
                        )}
                        {formData.jobType !== 'full-time' && (
                            <Input
                                label="Stipend (per month)"
                                type="number"
                                value={formData.stipend}
                                onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                            />
                        )}
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <Input
                            label="Location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            required
                        />
                        <Select
                            label="Work Mode"
                            value={formData.workMode}
                            onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                            options={[
                                { value: 'onsite', label: 'On-site' },
                                { value: 'remote', label: 'Remote' },
                                { value: 'hybrid', label: 'Hybrid' },
                            ]}
                        />
                        <Input
                            label="Application Deadline"
                            type="date"
                            value={formData.applicationDeadline ? formData.applicationDeadline.split('T')[0] : ''}
                            onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                            required
                        />
                    </div>

                    <div className="border-t border-[var(--border-subtle)] pt-4">
                        <h4 className="font-medium text-main mb-3">Eligibility Criteria</h4>
                        <div className="grid md:grid-cols-3 gap-4">
                            <Input
                                label="Min CGPA"
                                type="number"
                                step="0.1"
                                min="0"
                                max="10"
                                value={formData.eligibilityCriteria.minCGPA}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    eligibilityCriteria: { ...formData.eligibilityCriteria, minCGPA: e.target.value }
                                })}
                                required
                            />
                            <Input
                                label="Max Backlogs"
                                type="number"
                                min="0"
                                value={formData.eligibilityCriteria.maxBacklogs}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    eligibilityCriteria: { ...formData.eligibilityCriteria, maxBacklogs: e.target.value }
                                })}
                            />
                            <Input
                                label="Min Semester"
                                type="number"
                                min="1"
                                max="8"
                                value={formData.eligibilityCriteria.minSemester}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    eligibilityCriteria: { ...formData.eligibilityCriteria, minSemester: e.target.value }
                                })}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="label">Allowed Branches</label>
                            <div className="flex flex-wrap gap-2">
                                {branchOptions.map((branch) => (
                                    <button
                                        key={branch}
                                        type="button"
                                        onClick={() => handleBranchToggle(branch)}
                                        className={`px-3 py-1.5 rounded-full text-sm transition-colors border ${formData.eligibilityCriteria.allowedBranches.includes(branch)
                                            ? 'bg-[var(--bg-surface-2)] text-main border-[var(--border-strong)]'
                                            : 'bg-transparent text-muted border-[var(--border-subtle)] hover:bg-[var(--bg-surface-2)]'
                                            }`}
                                    >
                                        {branch}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" loading={saving} className="flex-1">
                            {selectedDrive ? 'Update' : 'Create'} Drive
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Applications Modal */}
            <Modal
                isOpen={showApplicationsModal}
                onClose={() => { setShowApplicationsModal(false); setSelectedDrive(null); }}
                title={`Applications - ${selectedDrive?.roleTitle}`}
                size="xl"
            >
                <div className="space-y-4">
                    {selectedDrive && applications.length > 0 && (
                        <div className="flex justify-end">
                            <button
                                onClick={async () => {
                                    try {
                                        const { data } = await adminAPI.exportDriveApplications(selectedDrive._id);
                                        downloadCSV(data, `${selectedDrive.roleTitle.replace(/\s+/g, '_')}_applications.csv`);
                                        toast.success('Applications exported');
                                    } catch { toast.error('Export failed'); }
                                }}
                                className="btn btn-outline flex items-center gap-2 text-sm"
                            >
                                <Download className="w-4 h-4" /> Export CSV
                            </button>
                        </div>
                    )}
                    {applications.length === 0 ? (
                        <p className="text-center text-muted py-8">No applications yet</p>
                    ) : (
                        applications.map((app) => (
                            <div key={app._id} className="p-4 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xl space-y-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-main">{app.studentId?.name}</p>
                                        <p className="text-sm text-muted">
                                            {app.studentId?.branch} • CGPA: {app.studentId?.cgpa}
                                        </p>
                                    </div>
                                    <select
                                        value={app.applicationStatus}
                                        onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                                        className="input w-auto text-sm"
                                    >
                                        <option value="applied">Applied</option>
                                        <option value="under-review">Under Review</option>
                                        <option value="shortlisted">Shortlisted</option>
                                        <option value="interview-scheduled">Interview Scheduled</option>
                                        <option value="selected">Selected</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                                {app.coverLetter && (
                                    <div className="mt-2 p-3 bg-[var(--bg)] rounded-lg border border-[var(--border-subtle)]">
                                        <p className="text-xs font-medium text-muted mb-1">Cover Letter</p>
                                        <p className="text-sm text-main whitespace-pre-line">{app.coverLetter}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default ManageDrives;
