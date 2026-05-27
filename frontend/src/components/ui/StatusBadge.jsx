// src/components/ui/StatusBadge.jsx
const statusMap = {
  'applied':              'status-applied',
  'under-review':         'status-review',
  'shortlisted':          'status-shortlisted',
  'interview-scheduled':  'status-interview',
  'selected':             'status-selected',
  'rejected':             'status-rejected',
  'withdrawn':            'status-withdrawn',
  'active':               'status-active',
  'upcoming':             'status-upcoming',
  'pending':              'status-pending',
  'closed':               'status-closed',
  'cancelled':            'status-cancelled',
};

const labelMap = {
  'applied':              'Applied',
  'under-review':         'Under Review',
  'shortlisted':          'Shortlisted',
  'interview-scheduled':  'Interview Scheduled',
  'selected':             'Selected',
  'rejected':             'Rejected',
  'withdrawn':            'Withdrawn',
  'active':               'Active',
  'upcoming':             'Upcoming',
  'pending':              'Pending',
  'closed':               'Closed',
  'cancelled':            'Cancelled',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${statusMap[status] || 'status-withdrawn'}`}>
      {labelMap[status] || status}
    </span>
  );
}
