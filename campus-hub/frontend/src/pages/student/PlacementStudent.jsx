import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const PlacementStudent = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobsRes, annRes, intRes] = await Promise.all([
                    api.get('/placements/jobs'),
                    api.get('/placements/announcements'),
                    api.get('/placements/interview-lists')
                ]);
                setJobs(jobsRes.data.data);
                setAnnouncements(annRes.data.data);
                setInterviews(intRes.data.data);
            } catch (error) {
                console.error('Error fetching placement data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleApply = async (jobId) => {
        try {
            await api.post(`/placements/apply/${jobId}`);
            alert('Applied successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Application failed');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="placement-container" style={{ padding: '20px' }}>
            <h1>Placement Hub - {user.department} Department</h1>

            <section className="announcements-section">
                <h2>📢 Announcements</h2>
                {announcements.map(ann => (
                    <div key={ann._id} className="announcement-card">
                        <h3>{ann.title}</h3>
                        <p>{ann.content}</p>
                        <small>{new Date(ann.createdAt).toLocaleDateString()}</small>
                    </div>
                ))}
            </section>

            <section className="jobs-section">
                <h2>💼 Available Jobs</h2>
                <div className="jobs-grid">
                    {jobs.map(job => (
                        <div key={job._id} className="job-card">
                            <h3>{job.companyName} - {job.role}</h3>
                            <p>{job.description}</p>
                            <p><strong>Package:</strong> {job.packageDetails.salary} {job.packageDetails.type}</p>
                            <button onClick={() => handleApply(job._id)}>Apply Now</button>
                        </div>
                    ))}
                </div>
            </section>

            <section className="interviews-section">
                <h2>🗓️ Today's Interviews</h2>
                {interviews.map(list => (
                    <div key={list._id} className="interview-list">
                        <h4>{list.companyName} - {new Date(list.date).toLocaleDateString()}</h4>
                        {list.students.find(s => s.studentId === user._id) ? (
                            <div className="my-slot">
                                <strong>Your Slot:</strong> {list.students.find(s => s.studentId === user._id).timeSlot} @ {list.students.find(s => s.studentId === user._id).venue}
                            </div>
                        ) : <p>No slots for you in this company today.</p>}
                    </div>
                ))}
            </section>
        </div>
    );
};

export default PlacementStudent;
