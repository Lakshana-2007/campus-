import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { HiOutlineCheck, HiOutlineXMark, HiOutlineCalendar } from 'react-icons/hi2';

const MarkAttendance = () => {
    const [students, setStudents] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [records, setRecords] = useState({}); // {studentId: 'Present' | 'Absent'}
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                // In a real app, we'd fetch by department/section
                const res = await api.get('/auth/users'); // Admin route, might need modification or a new faculty route
                const studentList = res.data.data.filter(u => u.role === 'student');
                setStudents(studentList);

                // Initialize records
                const initialRecords = {};
                studentList.forEach(s => initialRecords[s._id] = 'Present');
                setRecords(initialRecords);
            } catch (error) {
                console.error('Error fetching students:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const toggleStatus = (id) => {
        setRecords(prev => ({
            ...prev,
            [id]: prev[id] === 'Present' ? 'Absent' : 'Present'
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const formattedRecords = Object.entries(records).map(([studentId, status]) => ({
                studentId,
                status
            }));
            await api.post('/attendance/mark', { date, records: formattedRecords });
            alert('Attendance marked successfully!');
        } catch (error) {
            alert('Error saving attendance');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner" /></div>;

    return (
        <div className="page-container">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1>Mark Attendance</h1>
                    <p>Select date and update student presence status.</p>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <HiOutlineCalendar style={{ marginRight: '8px' }} />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Attendance'}
                    </button>
                </div>
            </header>

            <div className="card">
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th style={{ textAlign: 'center' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student._id}>
                                    <td><strong>{student.name}</strong></td>
                                    <td>{student.email}</td>
                                    <td>{student.department || 'N/A'}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button
                                            className={`btn ${records[student._id] === 'Present' ? 'btn-success' : 'btn-danger'} btn-sm`}
                                            onClick={() => toggleStatus(student._id)}
                                            style={{ minWidth: '100px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                        >
                                            {records[student._id] === 'Present' ? (
                                                <><HiOutlineCheck /> Present</>
                                            ) : (
                                                <><HiOutlineXMark /> Absent</>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MarkAttendance;
