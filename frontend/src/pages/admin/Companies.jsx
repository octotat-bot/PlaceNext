import { useState, useEffect, useCallback } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import {
    Plus,
    Search,
    Building2,
    Edit,
    Trash2,
    Eye,
    Briefcase,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import { DriveCardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const Companies = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebouncedValue(searchTerm, 300);
    const [showModal, setShowModal] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '',
        industry: '',
        website: '',
        description: '',
        headquarters: '',
        employeeCount: '',
        contactPerson: { name: '', email: '', phone: '' },
    });

    const fetchCompanies = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await adminAPI.getCompanies({ search: debouncedSearch });
            setCompanies(data.companies || []);
        } catch (_error) {
            toast.error('Failed to load companies');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch]);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (selectedCompany) {
                await adminAPI.updateCompany(selectedCompany._id, formData);
                toast.success('Company updated successfully');
            } else {
                await adminAPI.createCompany(formData);
                toast.success('Company created successfully');
            }
            setShowModal(false);
            resetForm();
            fetchCompanies();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this company?')) return;
        try {
            await adminAPI.deleteCompany(id);
            toast.success('Company deleted');
            fetchCompanies();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        }
    };

    const openEditModal = (company) => {
        setSelectedCompany(company);
        setFormData({
            companyName: company.companyName,
            industry: company.industry,
            website: company.website || '',
            description: company.description || '',
            headquarters: company.headquarters || '',
            employeeCount: company.employeeCount || '',
            contactPerson: company.contactPerson || { name: '', email: '', phone: '' },
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setSelectedCompany(null);
        setFormData({
            companyName: '',
            industry: '',
            website: '',
            description: '',
            headquarters: '',
            employeeCount: '',
            contactPerson: { name: '', email: '', phone: '' },
        });
    };

    const industryOptions = [
        { value: 'Technology', label: 'Technology' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Healthcare', label: 'Healthcare' },
        { value: 'Manufacturing', label: 'Manufacturing' },
        { value: 'Consulting', label: 'Consulting' },
        { value: 'E-commerce', label: 'E-commerce' },
        { value: 'Education', label: 'Education' },
        { value: 'Automotive', label: 'Automotive' },
        { value: 'Energy', label: 'Energy' },
        { value: 'Other', label: 'Other' },
    ];

    const sizeOptions = [
        { value: '1-50', label: '1-50 employees' },
        { value: '51-200', label: '51-200 employees' },
        { value: '201-500', label: '201-500 employees' },
        { value: '501-1000', label: '501-1000 employees' },
        { value: '1000+', label: '1000+ employees' },
    ];

    return (
        <div className="space-y-6 animate-fadeIn">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div className="eyebrow">Admin</div>
                    <h1 className="page-title">Partner <em>companies.</em></h1>
                    <p className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>Manage partner companies and contact details</p>
                </div>
                <Button variant="primary" onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus className="w-4 h-4" />
                    Add Company
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
                <input
                    type="text"
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input !pl-11"
                />
            </div>

            {/* Companies Grid */}
            {loading ? (
                <div className="grid md:grid-cols-2 gap-4">
                    {Array(4).fill(0).map((_, i) => <DriveCardSkeleton key={i} />)}
                </div>
            ) : companies.length === 0 ? (
                <Card className="text-center py-12">
                    <EmptyState type="companies" title="No companies yet" description="Add your first company to get started" />
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {companies.map((company) => (
                        <Card key={company._id}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-14 h-14 bg-[var(--bg-surface-2)] rounded-xl flex items-center justify-center">
                                    {company.logoUrl ? (
                                        <img src={company.logoUrl} alt={company.companyName} className="w-10 h-10 object-contain" />
                                    ) : (
                                        <Building2 className="w-7 h-7 icon-muted" />
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => openEditModal(company)}
                                        className="p-2 hover:bg-[var(--bg-surface-2)] rounded-lg transition-colors"
                                    >
                                        <Edit className="w-4 h-4 text-main" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(company._id)}
                                        className="p-2 hover:bg-[var(--reject-btn-bg)] rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 text-[var(--danger)]" />
                                    </button>
                                </div>
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{company.companyName}</div>
                            <p className="text-sm text-muted">{company.industry}</p>
                            {company.headquarters && (
                                <p className="text-sm text-muted mt-1">{company.headquarters}</p>
                            )}
                            {company.drivesCount !== undefined && (
                                <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] flex items-center gap-2 text-sm text-muted">
                                    <Briefcase className="w-4 h-4" />
                                    {company.drivesCount} drives
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {/* Company Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); resetForm(); }}
                title={selectedCompany ? 'Edit Company' : 'Add Company'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input
                            label="Company Name"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            required
                        />
                        <Select
                            label="Industry"
                            value={formData.industry}
                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                            options={industryOptions}
                            required
                        />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input
                            label="Website"
                            type="url"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            placeholder="https://..."
                        />
                        <Input
                            label="Headquarters"
                            value={formData.headquarters}
                            onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                        />
                    </div>
                    <Select
                        label="Company Size"
                        value={formData.employeeCount}
                        onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                        options={sizeOptions}
                    />
                    <div>
                        <label className="label">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input"
                            rows="3"
                        />
                    </div>
                    <div className="border-t border-[var(--border-subtle)] pt-4">
                        <h4 className="font-medium text-main mb-3">Contact Person</h4>
                        <div className="grid md:grid-cols-3 gap-4">
                            <Input
                                label="Name"
                                value={formData.contactPerson.name}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    contactPerson: { ...formData.contactPerson, name: e.target.value }
                                })}
                            />
                            <Input
                                label="Email"
                                type="email"
                                value={formData.contactPerson.email}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    contactPerson: { ...formData.contactPerson, email: e.target.value }
                                })}
                            />
                            <Input
                                label="Phone"
                                value={formData.contactPerson.phone}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    contactPerson: { ...formData.contactPerson, phone: e.target.value }
                                })}
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" loading={saving} className="flex-1">
                            {selectedCompany ? 'Update' : 'Create'} Company
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Companies;
