import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { HiOutlineExclamationTriangle, HiOutlineShieldCheck, HiOutlineClock } from 'react-icons/hi2';

const RiskAssessment = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/analytics/risk-assessment')
            .then(res => setProfiles(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-container"><div className="spinner" /></div>;

    return (
        <div className="page-container">
            <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Student Risk Assessment</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
                Behavioral and AI-driven analysis of student academic integrity and performance risk.
            </p>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Submissions</th>
                            <th>Late Rate</th>
                            <th>AI Integrity</th>
                            <th>Risk Score</th>
                            <th>Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profiles.map((p) => (
                            <tr key={p.studentId} style={{ borderLeft: `4px solid ${p.riskLevel === 'High' ? 'var(--danger)' : p.riskLevel === 'Medium' ? 'var(--warning)' : 'var(--success)'}` }}>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.email}</div>
                                </td>
                                <td>{p.stats.totalSubmissions}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {p.stats.lateCount > 0 && <HiOutlineClock style={{ color: 'var(--warning)' }} />}
                                        {Math.round((p.stats.lateCount / p.stats.totalSubmissions) * 100)}%
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <HiOutlineShieldCheck style={{ color: p.stats.avgIntegrity < 60 ? 'var(--danger)' : 'var(--success)' }} />
                                        {p.stats.avgIntegrity}%
                                    </div>
                                </td>
                                <td>
                                    <div style={{ width: '80px', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${p.riskScore}%`,
                                            height: '100%',
                                            background: p.riskScore > 60 ? 'var(--danger)' : p.riskScore > 30 ? 'var(--warning)' : 'var(--success)',
                                            borderRadius: '4px'
                                        }} />
                                    </div>
                                </td>
                                <td>
                                    <span className={`badge ${p.riskLevel === 'High' ? 'badge-danger' : p.riskLevel === 'Medium' ? 'badge-warning' : 'badge-success'}`}>
                                        {p.riskLevel}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '24px', padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--diamond-50)', border: '1px solid var(--diamond-200)', fontSize: '0.85rem' }}>
                <h4 style={{ color: 'var(--diamond-700)', marginBottom: '8px' }}>How is the Risk Score calculated?</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    The score is an AI-weighted aggregate of multiple signals:
                    <br />• <strong>40% Academic Integrity:</strong> Derived from AI integrity scores across all submissions.
                    <br />• <strong>30% Submission Timeliness:</strong> Percentage of late vs. on-time submissions.
                    <br />• <strong>20% Direct Similarity:</strong> Average similarity score compared to peer submissions.
                    <br />• <strong>10% AI Quality Assessment:</strong> Linguistic and depth analysis of the submitted work.
                </p>
            </div>
        </div>
    );
};

export default RiskAssessment;
