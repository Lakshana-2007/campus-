import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineArrowTrendingUp } from 'react-icons/hi2';

const AttendanceOverview = () => {
    const [records, setRecords] = useState([]);
    const [stats, setStats] = useState({ present: 0, absent: 0, rate: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const res = await api.get('/attendance/my-attendance');
                const data = res.data.data;
                setRecords(data);

                const present = data.filter(r => r.status === 'Present').length;
                const absent = data.filter(r => r.status === 'Absent').length;
                const rate = data.length > 0 ? (present / data.length) * 100 : 100;

                setStats({ present, absent, rate: Math.round(rate) });
            } catch (error) {
                console.error('Error fetching attendance:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    if (loading) return <div className="loading-container"><div className="spinner" /></div>;

    return (
        <div className="page-container">
            <h1>My Attendance</h1>

            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="card">
                    <HiOutlineArrowTrendingUp size={24} color="var(--diamond-400)" />
                    <h3>Attendance Rate</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 700, color: stats.rate < 75 ? 'var(--danger)' : 'var(--success)' }}>
                        {stats.rate}%
                    </p>
                </div>
                <div className="card">
                    <HiOutlineCheckCircle size={24} color="var(--success)" />
                    <h3>Classes Present</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stats.present}</p>
                </div>
                <div className="card">
                    <HiOutlineXCircle size={24} color="var(--danger)" />
                    <h3>Classes Absent</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stats.absent}</p>
                </div>
            </div>

            <div className="card">
                <h2>Recent Records</h2>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Faculty</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(record => (
                                <tr key={record._id}>
                                    <td>{new Date(record.date).toLocaleDateString()}</td>
                                    <td>{record.facultyId?.name}</td>
                                    <td>
                                        <span className={`badge ${record.status === 'Present' ? 'badge-success' : 'badge-danger'}`}>
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {records.length === 0 && (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', padding: '32px' }}>
                                        No attendance records found yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AttendanceOverview;
