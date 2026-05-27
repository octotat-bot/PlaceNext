import { useState, useEffect, useCallback } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import {
  Plus, Briefcase, Users, Calendar, MapPin, DollarSign,
  Edit2, Trash2, Eye, Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { recruiterAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import { DriveCardSkeleton } from '../../components/ui/Skeleton';

const BRANCHES = [
  'Computer Science', 'Information Technology', 'Electronics',
  'Electrical', 'Mechanical', 'Civil', 'Chemical', 'Biotechnology', 'Other', 'All',
];

const emptyForm = {
  companyId: '', roleTitle: '', roleDescription: '', jobType: 'full-time',
  package: '', stipend: '', location: '', workMode: 'onsite',
  applicationDeadline: '', numberOfOpenings: '',
  eligibilityCriteria: { minCGPA: 6, allowedBranches: ['All'], maxBacklogs: 0, minSemester: 1, requiredSkills: [] },
};

/* ─── JobCard ─── */
const JobCard = ({ job, onEdit, onDelete }) => (
  <div style={{
    background: 'var(--color-background-primary)',
    border: '0.5px solid var(--color-border-tertiary)',
    borderRadius: 'var(--border-radius-lg)',
    padding: '18px',
    transition: 'border-color 0.2s',
  }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-border-secondary)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border-tertiary)'}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{job.title}</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{job.type}</div>
      </div>
      <StatusBadge status={job.status || 'active'} />
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
      {job.location && (
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <MapPin size={11} /> {job.location}
        </div>
      )}
      {job.salary && (
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <DollarSign size={11} /> {job.salary}
        </div>
      )}
      {job.deadline && (
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Calendar size={11} /> Deadline: {formatDate(job.deadline)}
        </div>
      )}
    </div>

    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '0.5px solid var(--color-border-tertiary)' }}>
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Users size={11} /> {job.applicants || 0} applicants
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          onClick={() => onEdit(job)}
          className="btn btn-icon btn-sm"
          title="Edit"
        >
          <Edit2 size={13} />
        </button>
        <button
          onClick={() => onDelete(job.id)}
          className="btn btn-icon btn-sm"
          title="Delete"
          style={{ color: 'var(--color-text-danger)' }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  </div>
);

/* ─── RecruiterJobs ─── */
const RecruiterJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await recruiterAPI.getJobs({
        status: filter !== 'all' ? filter : undefined,
        search: debouncedSearch || undefined,
      });
      setJobs(data.jobs || []);
    } catch { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  }, [filter, debouncedSearch]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);
  useEffect(() => {
    recruiterAPI.getCompanies().then(({ data }) => setCompanies(data.companies || [])).catch(() => {});
  }, []);

  const handleCreate = () => { setEditingJob(null); setFormData(emptyForm); setShowModal(true); };
  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      companyId: job.company?._id || '', roleTitle: job.title, roleDescription: job.description || '',
      jobType: job.type || 'full-time', package: job.package || '', stipend: job.stipend || '',
      location: job.location || '', workMode: job.workMode || 'onsite',
      applicationDeadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
      numberOfOpenings: job.numberOfOpenings || '',
      eligibilityCriteria: job.eligibilityCriteria || emptyForm.eligibilityCriteria,
    });
    setShowModal(true);
  };
  const handleDelete = async (id) => {
    if (!confirm('Delete this job posting?')) return;
    try { await recruiterAPI.deleteJob(id); toast.success('Deleted'); fetchJobs(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        package: parseFloat(formData.package) || undefined,
        stipend: parseFloat(formData.stipend) || undefined,
        numberOfOpenings: parseInt(formData.numberOfOpenings, 10) || undefined,
        eligibilityCriteria: {
          ...formData.eligibilityCriteria,
          minCGPA: parseFloat(formData.eligibilityCriteria?.minCGPA) || 0,
          maxBacklogs: parseInt(formData.eligibilityCriteria?.maxBacklogs, 10) || 0,
          minSemester: parseInt(formData.eligibilityCriteria?.minSemester, 10) || 1,
        },
      };
      if (editingJob) { await recruiterAPI.updateJob(editingJob.id, payload); toast.success('Updated'); }
      else { await recruiterAPI.createJob(payload); toast.success('Job posted!'); }
      setShowModal(false); fetchJobs();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSubmitting(false); }
  };

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    closed: jobs.filter(j => j.status === 'closed').length,
  };

  /* helpers for branch toggle */
  const setEC = (key, val) => setFormData(f => ({ ...f, eligibilityCriteria: { ...f.eligibilityCriteria, [key]: val } }));
  const toggleBranch = (b) => {
    const curr = formData.eligibilityCriteria.allowedBranches;
    const next = curr.includes(b) ? curr.filter(x => x !== b) : [...curr, b];
    setEC('allowedBranches', next.length ? next : ['All']);
  };

  const STATUS_TABS = ['all', 'active', 'closed'];

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto' }}>
      <PageHeader
        eyebrow="Recruiter"
        title="Job"
        accentWord="postings."
        subtitle="Manage listings and track applicants"
        actions={
          <button className="btn btn-primary btn-sm" onClick={handleCreate}>
            <Plus size={13} /> Post Job
          </button>
        }
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }} className="grid-responsive-3">
        <StatCard label="Total Postings" value={stats.total} />
        <StatCard label="Active" value={stats.active} accentColor="#10b981" />
        <StatCard label="Closed" value={stats.closed} accentColor="#6b7280" />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
          <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
          <input
            type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search jobs…" className="form-input" style={{ paddingLeft: 30 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {STATUS_TABS.map(s => (
            <button key={s} onClick={() => setFilter(s)} className={filter === s ? 'btn btn-primary btn-sm' : 'btn btn-sm'}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="grid-responsive-2">
          {Array(4).fill(0).map((_, i) => <DriveCardSkeleton key={i} />)}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState 
          icon="ti-briefcase"
          title="No jobs found"
          body={searchQuery ? 'Try adjusting your search' : 'Create your first job posting'}
          action={handleCreate}
          actionLabel="Post Job"
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="grid-responsive-2">
          {jobs.map(job => <JobCard key={job.id} job={job} onEdit={handleEdit} onDelete={handleDelete} />)}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingJob ? 'Edit Job Posting' : 'Post New Job'}
        size="lg"
        footer={<>
          <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving…' : editingJob ? 'Update Job' : 'Post Job'}
          </button>
        </>}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Company */}
          <div>
            <label className="form-label">Company *</label>
            <select value={formData.companyId} onChange={e => setFormData(f => ({ ...f, companyId: e.target.value }))} required className="form-select">
              <option value="">Select a company</option>
              {companies.map(c => <option key={c._id} value={c._id}>{c.companyName}</option>)}
            </select>
          </div>

          {/* Role + Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Role Title *</label>
              <input type="text" value={formData.roleTitle} onChange={e => setFormData(f => ({ ...f, roleTitle: e.target.value }))} required className="form-input" placeholder="e.g. Software Engineer" />
            </div>
            <div>
              <label className="form-label">Job Type</label>
              <select value={formData.jobType} onChange={e => setFormData(f => ({ ...f, jobType: e.target.value }))} className="form-select">
                <option value="full-time">Full Time</option>
                <option value="internship">Internship</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Role Description *</label>
            <textarea value={formData.roleDescription} onChange={e => setFormData(f => ({ ...f, roleDescription: e.target.value }))} required rows={3} className="form-textarea" placeholder="Describe the role…" />
          </div>

          {/* Location + Package + Stipend */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Location *</label>
              <input type="text" value={formData.location} onChange={e => setFormData(f => ({ ...f, location: e.target.value }))} required className="form-input" placeholder="Bangalore" />
            </div>
            <div>
              <label className="form-label">Package (LPA)</label>
              <input type="number" value={formData.package} onChange={e => setFormData(f => ({ ...f, package: e.target.value }))} className="form-input" placeholder="12" />
            </div>
            <div>
              <label className="form-label">Stipend (₹/mo)</label>
              <input type="number" value={formData.stipend} onChange={e => setFormData(f => ({ ...f, stipend: e.target.value }))} className="form-input" placeholder="25000" />
            </div>
          </div>

          {/* Deadline + Work Mode */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Application Deadline *</label>
              <input type="date" value={formData.applicationDeadline} onChange={e => setFormData(f => ({ ...f, applicationDeadline: e.target.value }))} required className="form-input" />
            </div>
            <div>
              <label className="form-label">Work Mode</label>
              <select value={formData.workMode} onChange={e => setFormData(f => ({ ...f, workMode: e.target.value }))} className="form-select">
                <option value="onsite">Onsite</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {/* Eligibility */}
          <div style={{ borderTop: '0.5px solid var(--color-border-tertiary)', paddingTop: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 12 }}>Eligibility Criteria</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label className="form-label">Min CGPA *</label>
                <input type="number" step="0.1" min="0" max="10" value={formData.eligibilityCriteria.minCGPA}
                  onChange={e => setEC('minCGPA', e.target.value)} required className="form-input" />
              </div>
              <div>
                <label className="form-label">Max Backlogs</label>
                <input type="number" min="0" value={formData.eligibilityCriteria.maxBacklogs}
                  onChange={e => setEC('maxBacklogs', e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="form-label">Min Semester</label>
                <input type="number" min="1" max="8" value={formData.eligibilityCriteria.minSemester}
                  onChange={e => setEC('minSemester', e.target.value)} className="form-input" />
              </div>
            </div>
            <label className="form-label">Allowed Branches *</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {BRANCHES.map(b => {
                const active = formData.eligibilityCriteria.allowedBranches.includes(b);
                return (
                  <button key={b} type="button" onClick={() => toggleBranch(b)}
                    className={active ? 'btn btn-primary btn-sm' : 'btn btn-sm'}
                    style={{ fontSize: 11 }}>
                    {b}
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RecruiterJobs;
