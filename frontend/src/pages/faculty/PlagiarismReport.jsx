import { useState, useEffect } from 'react';
import api from '../../utils/api';

const PlagiarismReport = () => {
    const [assignments, setAssignments] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [results, setResults] = useState(null);
    const [flagged, setFlagged] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingFlagged, setLoadingFlagged] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/assignments'),
            api.get('/plagiarism/flagged'),
        ])
            .then(([aRes, fRes]) => {
                setAssignments(aRes.data.data);
                setFlagged(fRes.data.data);
            })
            .catch(console.error)
            .finally(() => setLoadingFlagged(false));
    }, []);

    const runAnalysis = async () => {
        if (!selectedId) return;
        setLoading(true);
        setResults(null);
        try {
            const res = await api.post(`/plagiarism/check-assignment/${selectedId}`);
            setResults(res.data.data);
            // Refresh flagged
            const fRes = await api.get('/plagiarism/flagged');
            setFlagged(fRes.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Integrity Analysis</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
                AI-driven plagiarism detection — text extraction, pairwise comparison, and structured insight scoring.
            </p>

            {/* Run Analysis */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <h3 className="card-title" style={{ marginBottom: '16px' }}>Run Batch Analysis</h3>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ flex: 1, minWidth: '250px', marginBottom: 0 }}>
                        <select
                            className="form-select"
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                        >
                            <option value="">Select an assignment...</option>
                            {assignments.map((a) => (
                                <option key={a._id} value={a._id}>{a.title}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={runAnalysis}
                        disabled={!selectedId || loading}
                    >
                        {loading ? 'Analyzing...' : '🔍 Analyze Submissions'}
                    </button>
                </div>
            </div>

            {/* Analysis Results */}
            {results && (
                <div className="card" style={{ marginBottom: '24px' }}>
                    <div className="card-header">
                        <h3 className="card-title">Results: {results.assignmentTitle}</h3>
                        <span className="badge badge-info">{results.totalSubmissions} submissions</span>
                    </div>

                    {results.flaggedCount > 0 && (
                        <div style={{ background: 'var(--danger-bg)', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '16px', fontSize: '0.875rem' }}>
                            ⚠️ <strong>{results.flaggedCount}</strong> submission(s) flagged with &gt;40% similarity
                        </div>
                    )}

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Similarity</th>
                                    <th>Quality Score</th>
                                    <th>Integrity Score</th>
                                    <th>Risk Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.results.map((r) => (
                                    <tr key={r.submissionId}>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{r.studentName}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.studentEmail}</div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontWeight: 600, fontSize: '0.85rem', minWidth: '35px' }}>{r.similarityScore}%</span>
                                                <div style={{ width: '40px', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                                                    <div style={{
                                                        width: `${r.similarityScore}%`,
                                                        height: '100%',
                                                        background: r.similarityScore > 40 ? 'var(--danger)' : r.similarityScore > 20 ? 'var(--warning)' : 'var(--success)',
                                                        borderRadius: '2px',
                                                    }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: (r.aiInsights?.qualityScore || 0) < 50 ? 'var(--danger)' : 'var(--text-primary)' }}>
                                                    {r.aiInsights?.qualityScore || 0}%
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: (r.aiInsights?.integrityScore || 0) < 60 ? 'var(--danger)' : 'var(--success)' }}>
                                                    {r.aiInsights?.integrityScore || 0}%
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <span className={`badge ${r.aiInsights?.riskLevel === 'High' ? 'badge-danger' : r.aiInsights?.riskLevel === 'Medium' ? 'badge-warning' : 'badge-success'}`}>
                                                    {r.aiInsights?.riskLevel || 'Low'}
                                                </span>
                                                {r.aiInsights?.analysisSummary && (
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '200px', lineHeight: '1.2' }}>
                                                        {r.aiInsights.analysisSummary}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Flagged Overview */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">🚩 All Flagged Submissions</h3>
                    <span className="badge badge-danger">{flagged.length} flagged</span>
                </div>
                {loadingFlagged ? (
                    <div className="loading-container"><div className="spinner" /></div>
                ) : flagged.length === 0 ? (
                    <div className="empty-state">
                        <p>✅ No flagged submissions — academic integrity looks good!</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Assignment</th>
                                    <th>Similarity</th>
                                    <th>Submitted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {flagged.map((f) => (
                                    <tr key={f._id}>
                                        <td style={{ fontWeight: 500 }}>{f.studentId?.name || 'Unknown'}</td>
                                        <td>{f.assignmentId?.title || 'Unknown'}</td>
                                        <td>
                                            <span className="badge badge-danger">{f.similarityScore}%</span>
                                        </td>
                                        <td style={{ fontSize: '0.85rem' }}>
                                            {new Date(f.submittedAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlagiarismReport;
