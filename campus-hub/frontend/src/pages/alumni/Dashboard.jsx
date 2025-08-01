import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { HiOutlineUsers, HiOutlineChatBubbleLeftRight, HiOutlineStar } from 'react-icons/hi2';

const AlumniDashboard = () => {
    const [stats, setStats] = useState({ activeMentorships: 0, storiesShared: 0, pendingRequests: 0 });
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlumniData = async () => {
            try {
                // Mocking some data for the new dashboard until backend endpoints are fully mapped
                const res = await api.get('/messages'); // Reusing existing messages for mentorship-like connections
                setRequests(res.data.data.filter(msg => msg.status === 'pending' || !msg.status));
                setStats({
                    activeMentorships: res.data.data.length,
                    storiesShared: 2, // Example stat
                    pendingRequests: res.data.data.filter(m => !m.isRead).length
                });
            } catch (error) {
                console.error('Error fetching alumni dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAlumniData();
    }, []);

    if (loading) return <div className="loading-container"><div className="spinner" /></div>;

    return (
        <div className="page-container">
            <header className="page-header">
                <h1>Alumni Professional Dashboard</h1>
                <p>Manage your mentorship connections and share your industry journey.</p>
            </header>

            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="card">
                    <HiOutlineUsers size={24} color="var(--diamond-400)" />
                    <h3>Active Mentorships</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.activeMentorships}</p>
                </div>
                <div className="card">
                    <HiOutlineStar size={24} color="var(--diamond-400)" />
                    <h3>Success Stories</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.storiesShared}</p>
                </div>
                <div className="card">
                    <HiOutlineChatBubbleLeftRight size={24} color="var(--diamond-400)" />
                    <h3>Pending Requests</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.pendingRequests}</p>
                </div>
            </div>

            <section className="mentorship-requests">
                <h2>🤝 Recent Connection Requests</h2>
                {requests.length === 0 ? (
                    <div className="empty-state">
                        <p>No new mentorship requests at the moment.</p>
                    </div>
                ) : (
                    <div className="grid">
                        {requests.map(req => (
                            <div key={req._id} className="card" style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong>{req.sessionTitle}</strong>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            Subject: Career Guidance
                                        </p>
                                    </div>
                                    <button className="btn btn-primary btn-sm">Accept Request</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default AlumniDashboard;
