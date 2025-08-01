import { useState, useEffect } from 'react';
import api from '../../utils/api';

const PlacementCoordinatorDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/placements/analytics');
                setStats(res.data.data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div>Loading Analytics...</div>;

    return (
        <div className="page-container">
            <h1>Placement Coordinator Dashboard</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div className="card" style={{ background: 'var(--diamond-900)', border: '1px solid var(--diamond-400)' }}>
                    <h3>Average Selected CGPA</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--diamond-400)' }}>{stats?.averageCGPAOfSelected || 'N/A'}</p>
                </div>
                <div className="card">
                    <h3>Overall Selection Rate</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 700 }}>{stats?.selectionRate ? (stats.selectionRate * 100).toFixed(1) : '0.0'}%</p>
                </div>
            </div>

            <section className="competition-analysis">
                <h2>📈 Job Competition</h2>
                <div className="grid">
                    {stats?.jobCompetition?.map((job, idx) => (
                        <div key={idx} className="card" style={{ margin: '10px 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>{job.companyName} - {job.role}</strong>
                                <span className="badge">{job.appCount} Applications</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#eee', marginTop: '10px', borderRadius: '4px' }}>
                                <div style={{ width: `${Math.min(job.appCount * 5, 100)}%`, height: '100%', background: 'var(--diamond-500)', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="status-overview" style={{ marginTop: '40px' }}>
                <h2>📊 Placement Funnel</h2>
                <div className="card">
                    {stats?.applicationStats?.map(stat => (
                        <div key={stat._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                            <span>{stat._id}</span>
                            <strong>{stat.count}</strong>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default PlacementCoordinatorDashboard;
