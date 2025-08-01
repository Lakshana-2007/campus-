import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { HiOutlineDocumentText, HiOutlineExclamationTriangle, HiOutlineClock, HiOutlineUsers, HiOutlineChartBarSquare } from 'react-icons/hi2';

const FacultyDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/assignments/analytics/overview')
            .then((res) => setAnalytics(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="loading-container"><div className="spinner" /><p>Loading analytics...</p></div>;
    }

    const a = analytics || {};

    return (
        <div className="page-container">
            <h1 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Faculty Intelligence Dashboard</h1>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(51,117,255,0.1)', color: 'var(--diamond-500)' }}>
                        <HiOutlineDocumentText />
                    </div>
                    <div className="stat-value">{a.totalAssignments || 0}</div>
                    <div className="stat-label">Total Assignments</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>
                        <HiOutlineUsers />
                    </div>
                    <div className="stat-value">{a.totalSubmissions || 0}</div>
                    <div className="stat-label">Total Submissions</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning)' }}>
                        <HiOutlineClock />
                    </div>
                    <div className="stat-value">{a.latePercentage || 0}%</div>
                    <div className="stat-label">Late Submission Rate</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>
                        <HiOutlineExclamationTriangle />
                    </div>
                    <div className="stat-value">{a.flaggedSubmissions || 0}</div>
                    <div className="stat-label">Integrity Flags</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>
                        <HiOutlineChartBarSquare />
                    </div>
                    <div className="stat-value">{a.averageSimilarity || 0}%</div>
                    <div className="stat-label">Avg Similarity Score</div>
                </div>
            </div>

            {/* Most Problematic Assignment */}
            {a.mostProblematicAssignment && (
                <div className="card" style={{ marginBottom: '20px', borderLeft: '4px solid var(--danger)' }}>
                    <div className="card-header">
                        <h3 className="card-title">⚠️ Highest Risk Assignment</h3>
                        <span className="badge badge-danger">{a.mostProblematicAssignment.avgSimilarity}% avg similarity</span>
                    </div>
                    <p style={{ fontWeight: 600 }}>{a.mostProblematicAssignment.title}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        This assignment has the highest average similarity score among submissions. Consider reviewing for potential integrity issues.
                    </p>
                </div>
            )}

            {/* Submission Time Distribution */}
            {a.submissionTimeDistribution && (
                <div className="card" style={{ marginBottom: '20px' }}>
                    <div className="card-header">
                        <h3 className="card-title">📊 Submission Time Pattern</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '100px' }}>
                        {a.submissionTimeDistribution.map((count, hour) => {
                            const max = Math.max(...a.submissionTimeDistribution, 1);
                            const height = (count / max) * 100;
                            return (
                                <div
                                    key={hour}
                                    title={`${hour}:00 — ${count} submissions`}
                                    style={{
                                        flex: 1,
                                        height: `${Math.max(height, 2)}%`,
                                        background: count > 0 ? `rgba(51,117,255,${0.3 + (count / max) * 0.7})` : 'var(--border)',
                                        borderRadius: '2px 2px 0 0',
                                        cursor: 'pointer',
                                        transition: 'var(--transition)',
                                    }}
                                />
                            );
                        })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        <span>12 AM</span>
                        <span>6 AM</span>
                        <span>12 PM</span>
                        <span>6 PM</span>
                        <span>12 AM</span>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                <Link to="/create-assignment" className="card" style={{ textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ fontSize: '2rem', color: 'var(--diamond-500)', marginBottom: '8px' }}>➕</div>
                    <div style={{ fontWeight: 600 }}>Create Assignment</div>
                </Link>
                <Link to="/submissions" className="card" style={{ textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ fontSize: '2rem', color: 'var(--success)', marginBottom: '8px' }}>📋</div>
                    <div style={{ fontWeight: 600 }}>View Submissions</div>
                </Link>
                <Link to="/plagiarism" className="card" style={{ textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ fontSize: '2rem', color: 'var(--danger)', marginBottom: '8px' }}>🛡️</div>
                    <div style={{ fontWeight: 600 }}>Integrity Analysis</div>
                </Link>
            </div>
        </div>
    );
};

export default FacultyDashboard;
