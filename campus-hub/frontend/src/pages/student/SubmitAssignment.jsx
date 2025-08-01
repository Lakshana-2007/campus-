import { useState, useEffect } from 'react';
import api from '../../utils/api';

const SubmitAssignment = () => {
    const [assignments, setAssignments] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingAssignments, setLoadingAssignments] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        api.get('/assignments')
            .then((res) => {
                const pending = res.data.data.filter((a) => !a.hasSubmitted);
                setAssignments(pending);
            })
            .catch(console.error)
            .finally(() => setLoadingAssignments(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedId || !file) {
            setMessage({ type: 'error', text: 'Please select an assignment and a file' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post(`/submissions/${selectedId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage({ type: 'success', text: 'Assignment submitted successfully!' });
            setFile(null);
            setSelectedId('');
            // Remove from pending list
            setAssignments((prev) => prev.filter((a) => a._id !== selectedId));
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Submission failed' });
        } finally {
            setLoading(false);
        }
    };

    if (loadingAssignments) {
        return <div className="loading-container"><div className="spinner" /></div>;
    }

    return (
        <div className="page-container">
            <h1 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Submit Assignment</h1>

            <div className="card" style={{ maxWidth: '600px' }}>
                {message.text && (
                    <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
                        {message.text}
                    </div>
                )}

                {assignments.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">✅</div>
                        <h3>All Done!</h3>
                        <p>You've submitted all available assignments.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Select Assignment</label>
                            <select
                                className="form-select"
                                value={selectedId}
                                onChange={(e) => setSelectedId(e.target.value)}
                                required
                            >
                                <option value="">Choose an assignment...</option>
                                {assignments.map((a) => (
                                    <option key={a._id} value={a._id}>
                                        {a.title} — Due {new Date(a.deadline).toLocaleDateString()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Upload File</label>
                            <div
                                style={{
                                    border: '2px dashed var(--border)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '32px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'var(--transition)',
                                    background: file ? 'var(--diamond-50)' : 'var(--surface-alt)',
                                }}
                                onClick={() => document.getElementById('file-input').click()}
                            >
                                <input
                                    id="file-input"
                                    type="file"
                                    accept=".pdf,.doc,.docx,.txt"
                                    style={{ display: 'none' }}
                                    onChange={(e) => setFile(e.target.files[0])}
                                />
                                {file ? (
                                    <div>
                                        <p style={{ fontWeight: 600 }}>📄 {file.name}</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <p style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📤</p>
                                        <p style={{ fontWeight: 600 }}>Click to upload</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>PDF, DOC, DOCX, TXT — Max 10MB</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Assignment'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default SubmitAssignment;
