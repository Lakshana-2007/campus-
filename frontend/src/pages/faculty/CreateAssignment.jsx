import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const CreateAssignment = () => {
    const [form, setForm] = useState({ title: '', description: '', deadline: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await api.post('/assignments', form);
            setMessage({ type: 'success', text: 'Assignment created successfully!' });
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create assignment' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <h1 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Create Assignment</h1>

            <div className="card" style={{ maxWidth: '600px' }}>
                {message.text && (
                    <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>{message.text}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Title</label>
                        <input
                            type="text"
                            className="form-input"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="e.g., Data Structures Assignment 3"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-textarea"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Describe the assignment requirements, topics covered, grading criteria..."
                            rows={5}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Deadline</label>
                        <input
                            type="datetime-local"
                            className="form-input"
                            name="deadline"
                            value={form.deadline}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Creating...' : 'Create Assignment'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateAssignment;
