import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { HiOutlineChartBarSquare, HiOutlineClock, HiOutlineExclamationTriangle, HiOutlineDocumentText } from 'react-icons/hi2';

const Analytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/assignments/analytics/overview'),
            api.get('/assignments'),
        ])
            .then(([aRes, asRes]) => {
                setAnalytics(aRes.data.data);
                setAssignments(asRes.data.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="loading-container"><div className="spinner" /><p>Loading analytics...</p></div>;
    }

    const a = analytics || {};

    return (
        <div className="page-container">
            <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Academic Analytics</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
                AI-derived insights from submission patterns, integrity checks, and engagement data.
            </p>

            {/* Overview Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(51,117,255,0.1)', color: 'var(--diamond-500)' }}>
                        <HiOutlineDocumentText />
                    </div>
                    <div className="stat-value">{a.totalAssignments || 0}</div>
                    <div className="stat-label">Assignments Created</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>
                        <HiOutlineChartBarSquare />
                    </div>
                    <div className="stat-value">{a.totalSubmissions || 0}</div>
                    <div className="stat-label">Total Submissions</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning)' }}>
                        <HiOutlineClock />
                    </div>
                    <div className="stat-value">{a.lateSubmissions || 0}</div>
                    <div className="stat-label">Late Submissions ({a.latePercentage || 0}%)</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>
                        <HiOutlineExclamationTriangle />
                    </div>
                    <div className="stat-value">{a.flaggedSubmissions || 0}</div>
                    <div className="stat-label">Integrity Flags (&gt;40%)</div>
                </div>
            </div>

            {/* Per-Assignment Breakdown */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Assignment Analytics Breakdown</h3>
                </div>

                {assignments.length === 0 ? (
                    <div className="empty-state"><p>No assignments yet</p></div>
                ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {assignments.map((assign) => {
                            const an = assign.analytics || {};
                            return (
                                <div key={assign._id} style={{
                                    padding: '16px',
                                    background: 'var(--surface-alt)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border)',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                                        <div>
                                            <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>{assign.title}</h4>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                Due: {new Date(assign.deadline).toLocaleDateString()}
                                                {assign.isExpired && <span className="badge badge-warning" style={{ marginLeft: '8px' }}>Expired</span>}
                                            </span>
                                        </div>
                                        <span className="badge badge-info">{an.totalSubmissions || 0} submissions</span>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                                        <div style={{ padding: '8px 12px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--warning)' }}>{an.latePercentage || 0}%</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Late Rate</div>
                                        </div>
                                        <div style={{ padding: '8px 12px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: an.averageSimilarity > 40 ? 'var(--danger)' : 'var(--success)' }}>{an.averageSimilarity || 0}%</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Avg Similarity</div>
                                        </div>
                                        <div style={{ padding: '8px 12px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--danger)' }}>{an.flaggedSubmissions || 0}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Flagged</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
