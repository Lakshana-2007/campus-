import { useState } from 'react';
import api from '../../utils/api';

const PlacementAdmin = () => {
    const [jobForm, setJobForm] = useState({
        companyName: '',
        role: '',
        description: '',
        salary: '',
        minCGPA: 0,
        allowedDepartments: [],
        deadline: ''
    });

    const [annForm, setAnnForm] = useState({ title: '', content: '' });

    const handleJobSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/placements/job', {
                ...jobForm,
                packageDetails: { salary: jobForm.salary, type: 'CTC' },
                eligibilityCriteria: {
                    minCGPA: jobForm.minCGPA,
                    allowedDepartments: jobForm.allowedDepartments,
                    minSemester: 1
                },
                applicationDeadline: jobForm.deadline
            });
            alert('Job posted!');
        } catch (error) {
            alert('Error posting job');
        }
    };

    const handleAnnSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/placements/announcement', annForm);
            alert('Announcement posted!');
        } catch (error) {
            alert('Error posting announcement');
        }
    };

    return (
        <div className="placement-admin-container" style={{ padding: '20px' }}>
            <h1>Placement Management Dashboard</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <section className="post-job">
                    <h2>📝 Post New Job</h2>
                    <form onSubmit={handleJobSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input placeholder="Company Name" required onChange={e => setJobForm({ ...jobForm, companyName: e.target.value })} />
                        <input placeholder="Role" required onChange={e => setJobForm({ ...jobForm, role: e.target.value })} />
                        <textarea placeholder="Job Description" required onChange={e => setJobForm({ ...jobForm, description: e.target.value })} />
                        <input type="number" placeholder="Package (e.g. 1200000)" required onChange={e => setJobForm({ ...jobForm, salary: e.target.value })} />
                        <input type="number" step="0.1" placeholder="Min CGPA" required onChange={e => setJobForm({ ...jobForm, minCGPA: e.target.value })} />
                        <input type="date" required onChange={e => setJobForm({ ...jobForm, deadline: e.target.value })} />
                        <button type="submit">Post Job</button>
                    </form>
                </section>

                <section className="post-announcement">
                    <h2>📢 Post Announcement</h2>
                    <form onSubmit={handleAnnSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input placeholder="Title" required onChange={e => setAnnForm({ ...annForm, title: e.target.value })} />
                        <textarea placeholder="Content" required onChange={e => setAnnForm({ ...annForm, content: e.target.value })} />
                        <button type="submit">Post Announcement</button>
                    </form>
                </section>
            </div>

            <section className="analytics-preview" style={{ marginTop: '40px' }}>
                <h2>📊 Placement Analytics View</h2>
                <button onClick={async () => {
                    const res = await api.get('/placements/analytics');
                    console.log(res.data.data);
                    alert('Analytics fetched! (Check console for raw data for now)');
                }}>View Detailed Stats</button>
            </section>
        </div>
    );
};

export default PlacementAdmin;
