import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { HiOutlineArrowDownTray } from 'react-icons/hi2';

const ViewSubmissions = () => {
    const [assignments, setAssignments] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingSubs, setLoadingSubs] = useState(false);

    useEffect(() => {
        api.get('/assignments')
            .then((res) => setAssignments(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const loadSubmissions = async (assignmentId) => {
        setSelectedId(assignmentId);
        setLoadingSubs(true);
        try {
            const res = await api.get(`/submissions/assignment/${assignmentId}`);
            setSubmissions(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingSubs(false);
        }
    };

    const handleDownload = async (subId, fileName) => {
        try {
            const res = await api.get(`/submissions/${subId}/download`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner" /></div>;
    }

    return (
        <div className="page-container">
            <h1 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>View Submissions</h1>

            <div className="form-group" style={{ maxWidth: '400px', marginBottom: '24px' }}>
                <label className="form-label">Select Assignment</label>
                <select
                    className="form-select"
                    value={selectedId}
                    onChange={(e) => loadSubmissions(e.target.value)}
                >
                    <option value="">Choose an assignment...</option>
                    {assignments.map((a) => (
                        <option key={a._id} value={a._id}>
                            {a.title} ({a.analytics?.totalSubmissions || 0} submissions)
                        </option>
                    ))}
                </select>
            </div>

            {loadingSubs ? (
                <div className="loading-container"><div className="spinner" /></div>
            ) : selectedId && submissions.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>No Submissions Yet</h3>
                </div>
            ) : submissions.length > 0 ? (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Email</th>
                                <th>Submitted</th>
                                <th>Status</th>
                                <th>Similarity</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((s) => (
                                <tr key={s._id}>
                                    <td style={{ fontWeight: 500 }}>{s.studentId?.name || 'Unknown'}</td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{s.studentId?.email}</td>
                                    <td style={{ fontSize: '0.85rem' }}>
                                        {new Date(s.submittedAt).toLocaleString('en-US', {
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </td>
                                    <td>
                                        {s.isLate ? (
                                            <span className="badge badge-danger">Late</span>
                                        ) : (
                                            <span className="badge badge-success">On Time</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`badge ${s.similarityScore > 40 ? 'badge-danger' : s.similarityScore > 20 ? 'badge-warning' : 'badge-success'}`}>
                                            {s.similarityScore}%
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleDownload(s._id, s.originalFileName)}
                                        >
                                            <HiOutlineArrowDownTray /> Download
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null}
        </div>
    );
};

export default ViewSubmissions;
