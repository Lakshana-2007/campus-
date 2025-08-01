import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { HiOutlineDocumentText, HiOutlineArrowUpTray, HiOutlineClock, HiOutlineCheckCircle } from 'react-icons/hi2';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/assignments');
                setAssignments(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const pending = assignments.filter((a) => !a.hasSubmitted && !a.isExpired);
    const submitted = assignments.filter((a) => a.hasSubmitted);
    const overdue = assignments.filter((a) => !a.hasSubmitted && a.isExpired);

    if (loading) {
        return <div className="loading-container"><div className="spinner" /><p>Loading dashboard...</p></div>;
    }

    return (
        <div className="page-container">
            <h1 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Student Dashboard</h1>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(51,117,255,0.1)', color: 'var(--diamond-500)' }}>
                        <HiOutlineDocumentText />
                    </div>
                    <div className="stat-value">{assignments.length}</div>
                    <div className="stat-label">Total Assignments</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning)' }}>
                        <HiOutlineClock />
                    </div>
                    <div className="stat-value">{pending.length}</div>
                    <div className="stat-label">Pending</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>
                        <HiOutlineCheckCircle />
                    </div>
                    <div className="stat-value">{submitted.length}</div>
                    <div className="stat-label">Submitted</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>
                        <HiOutlineArrowUpTray />
                    </div>
                    <div className="stat-value">{overdue.length}</div>
                    <div className="stat-label">Overdue</div>
                </div>
            </div>

            {/* Upcoming deadlines */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <div className="card-header">
                    <h3 className="card-title">Upcoming Deadlines</h3>
                    <Link to="/assignments" className="btn btn-secondary btn-sm">View All</Link>
                </div>
                {pending.length === 0 ? (
                    <div className="empty-state"><p>🎉 All caught up! No pending assignments.</p></div>
                ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {pending.slice(0, 5).map((a) => {
                            const daysLeft = Math.ceil((new Date(a.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                            return (
                                <div key={a._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--surface-alt)', borderRadius: 'var(--radius-md)' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{a.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            by {a.facultyId?.name || 'Faculty'}
                                        </div>
                                    </div>
                                    <span className={`badge ${daysLeft <= 2 ? 'badge-danger' : daysLeft <= 5 ? 'badge-warning' : 'badge-info'}`}>
                                        {daysLeft <= 0 ? 'Due today' : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                <Link to="/submit" className="card" style={{ textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
                    <HiOutlineArrowUpTray style={{ fontSize: '2rem', color: 'var(--diamond-500)', marginBottom: '8px' }} />
                    <div style={{ fontWeight: 600 }}>Submit Assignment</div>
                </Link>
                <Link to="/chatbot" className="card" style={{ textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
                    <span style={{ fontSize: '2rem' }}>🤖</span>
                    <div style={{ fontWeight: 600, marginTop: '8px' }}>AI Tutor</div>
                </Link>
            </div>
        </div>
    );
};

export default StudentDashboard;
