import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { HiOutlineClock, HiOutlineCheckCircle, HiOutlineExclamationTriangle } from 'react-icons/hi2';

const Assignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/assignments')
            .then((res) => setAssignments(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="loading-container"><div className="spinner" /><p>Loading assignments...</p></div>;
    }

    return (
        <div className="page-container">
            <h1 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Assignments</h1>

            {assignments.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📄</div>
                    <h3>No Assignments Yet</h3>
                    <p>Assignments from your faculty will appear here.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {assignments.map((a) => {
                        const deadline = new Date(a.deadline);
                        const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
                        const isExpired = daysLeft < 0;

                        return (
                            <div key={a._id} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>{a.title}</h3>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px', lineHeight: '1.6' }}>
                                            {a.description}
                                        </p>
                                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            <span>👤 {a.facultyId?.name || 'Faculty'}</span>
                                            <span>📅 {deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            <span>📨 {a.submissionCount || 0} submissions</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                                        {a.hasSubmitted ? (
                                            <span className="badge badge-success"><HiOutlineCheckCircle style={{ marginRight: '4px' }} /> Submitted{a.mySubmission?.isLate ? ' (Late)' : ''}</span>
                                        ) : isExpired ? (
                                            <span className="badge badge-danger"><HiOutlineExclamationTriangle style={{ marginRight: '4px' }} /> Overdue</span>
                                        ) : (
                                            <span className="badge badge-warning"><HiOutlineClock style={{ marginRight: '4px' }} /> {daysLeft} day{daysLeft !== 1 ? 's' : ''} left</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Assignments;
