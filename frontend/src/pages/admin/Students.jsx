import { useState, useEffect, useCallback } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { Search, Users, GraduationCap, FileText, Eye, Download } from 'lucide-react';
import { adminAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { ListItemSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { formatStatus, getStatusClass, downloadCSV } from '../../utils/helpers';
import toast from 'react-hot-toast';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebouncedValue(searchTerm, 300);
    const [branchFilter, setBranchFilter] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await adminAPI.getStudents({
                search: debouncedSearch,
                branch: branchFilter || undefined,
            });
            setStudents(data.students || []);
        } catch (_error) {
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, branchFilter]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const handleViewDetails = async (studentId) => {
        try {
            const { data } = await adminAPI.getStudent(studentId);
            setSelectedStudent(data.student);
            setShowDetails(true);
        } catch (_error) {
            toast.error('Failed to load student details');
        }
    };

    const branches = [
        'Computer Science', 'Information Technology', 'Electronics',
        'Electrical', 'Mechanical', 'Civil', 'Chemical', 'Biotechnology'
    ];

    const handleExport = async () => {
        try {
            const { data } = await adminAPI.exportStudents();
            downloadCSV(data, 'students.csv');
            toast.success('Students exported successfully');
        } catch { toast.error('Failed to export students'); }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div className="eyebrow">Admin</div>
                    <h1 className="page-title">Student <em>directory.</em></h1>
                    <p className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>View and manage registered students</p>
                </div>
                <button onClick={handleExport} className="btn btn-sm">
                    <Download size={13} /> Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
                    <input
                        type="text"
                        placeholder="Search by name or roll number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input pl-10"
                    />
                </div>
                <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="input w-auto"
                >
                    <option value="">All Branches</option>
                    {branches.map((branch) => (
                        <option key={branch} value={branch}>{branch}</option>
                    ))}
                </select>
            </div>

            {/* Students Grid */}
            {loading ? (
                <div className="space-y-4">
                    {Array(6).fill(0).map((_, i) => <ListItemSkeleton key={i} />)}
                </div>
            ) : students.length === 0 ? (
                <Card className="text-center py-12">
                    <EmptyState type="students" title="No students found" description="Students will appear here once they register and complete their profiles" />
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students.map((student) => (
                        <Card key={student._id}>
                            <div className="flex items-start gap-4">
                                <Avatar
                                    src={student.profilePictureUrl}
                                    name={student.name || 'Student'}
                                    size="lg"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }} className="truncate">{student.name || 'Unnamed Student'}</div>
                                        {student.hasProfile === false && (
                                            <Badge variant="warning" className="text-xs">Profile Pending</Badge>
                                        )}
                                    </div>
                                    {student.rollNumber ? (
                                        <>
                                            <p className="text-sm text-muted">{student.rollNumber}</p>
                                            <p className="text-sm text-muted">{student.branch}</p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="text-sm">
                                                    <span className="font-medium text-main">{student.cgpa}</span>
                                                    <span className="text-muted"> CGPA</span>
                                                </span>
                                                <span className="text-sm">
                                                    <span className="font-medium text-main">Sem {student.semester}</span>
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-sm text-muted">{student.userId?.email || 'No email'}</p>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {student.resumeUrl && (
                                        <a
                                            href={`http://localhost:5001${student.resumeUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-muted hover:text-main"
                                        >
                                            <FileText className="w-5 h-5" />
                                        </a>
                                    )}
                                </div>
                                {student.hasProfile !== false && (
                                    <button
                                        onClick={() => handleViewDetails(student._id)}
                                        className="text-sm text-muted hover:text-main flex items-center gap-1"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Details
                                    </button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Student Details Modal */}
            <Modal
                isOpen={showDetails}
                onClose={() => { setShowDetails(false); setSelectedStudent(null); }}
                title="Student Details"
                size="lg"
            >
                {selectedStudent && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Avatar
                                src={selectedStudent.profilePictureUrl}
                                name={selectedStudent.name}
                                size="xl"
                            />
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text-primary)' }}>{selectedStudent.name}</div>
                                <p className="text-muted">{selectedStudent.rollNumber}</p>
                                <p className="text-muted">{selectedStudent.userId?.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-lg">
                                <p className="text-sm text-muted">Branch</p>
                                <p className="font-medium text-main">{selectedStudent.branch}</p>
                            </div>
                            <div className="p-3 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-lg">
                                <p className="text-sm text-muted">Semester</p>
                                <p className="font-medium text-main">{selectedStudent.semester}</p>
                            </div>
                            <div className="p-3 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-lg">
                                <p className="text-sm text-muted">CGPA</p>
                                <p className="font-medium text-main">{selectedStudent.cgpa}</p>
                            </div>
                            <div className="p-3 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-lg">
                                <p className="text-sm text-muted">Backlogs</p>
                                <p className="font-medium text-main">{selectedStudent.backlogs || 0}</p>
                            </div>
                        </div>

                        {selectedStudent.skills?.length > 0 && (
                            <div>
                                <h4 className="font-medium text-main mb-2">Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedStudent.skills.map((skill, i) => (
                                        <Badge key={i} variant="primary">{skill}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedStudent.applications?.length > 0 && (
                            <div>
                                <h4 className="font-medium text-main mb-3">Applications ({selectedStudent.totalApplications})</h4>
                                <div className="space-y-2">
                                    {selectedStudent.applications.slice(0, 5).map((app) => (
                                        <div key={app._id} className="p-3 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-main">{app.driveId?.roleTitle}</p>
                                                <p className="text-sm text-muted">{app.driveId?.companyId?.companyName}</p>
                                            </div>
                                            <span className={`badge ${getStatusClass(app.applicationStatus)}`}>
                                                {formatStatus(app.applicationStatus)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Students;
