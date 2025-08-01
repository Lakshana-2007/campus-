import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        skills: user?.skills?.join(', ') || '',
        phone: user?.phone || '',
        linkedinURL: user?.linkedinURL || ''
    });

    const [loading, setLoading] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put('/auth/profile', {
                ...formData,
                skills: formData.skills.split(',').map(s => s.trim()).filter(s => s !== '')
            });
            setUser({ ...user, ...res.data.data });
            setEditMode(false);
            alert('Profile updated!');
        } catch (error) {
            alert(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <h1 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>My Profile</h1>

            <div className="card" style={{ maxWidth: '600px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--diamond-400), var(--diamond-600))',
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2rem', fontWeight: 700
                        }}>
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{user?.name}</h2>
                            <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ')}</span>
                        </div>
                    </div>
                    <button className="btn btn-secondary" onClick={() => setEditMode(!editMode)}>
                        {editMode ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>

                {!editMode ? (
                    <div style={{ display: 'grid', gap: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Attendance Rate</label>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: user?.attendanceRate < 75 ? 'var(--error)' : 'var(--success)' }}>
                                    {user?.attendanceRate || 0}%
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>CGPA</label>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{user?.cgpa || 'N/A'}</div>
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Bio</label>
                            <p style={{ marginTop: '4px', lineHeight: '1.5' }}>{user?.bio || 'Tell us about yourself...'}</p>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Skills</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                {user?.skills?.length > 0 ? user.skills.map((skill, idx) => (
                                    <span key={idx} className="badge badge-outline">{skill}</span>
                                )) : <span style={{ color: 'var(--text-tertiary)' }}>No skills listed</span>}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <strong>📧 Email:</strong> {user?.email}
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <strong>📞 Phone:</strong> {user?.phone || 'Not provided'}
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <strong>🔗 LinkedIn:</strong> {user?.linkedinURL ? <a href={user.linkedinURL} target="_blank" rel="noreferrer">View Profile</a> : 'Not linked'}
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleUpdate} style={{ display: 'grid', gap: '16px' }}>
                        <div>
                            <label>Bio</label>
                            <textarea
                                className="input"
                                style={{ width: '100%', height: '100px' }}
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                            />
                        </div>
                        <div>
                            <label>Skills (comma separated)</label>
                            <input
                                className="input"
                                value={formData.skills}
                                onChange={e => setFormData({ ...formData, skills: e.target.value })}
                                placeholder="React, Node.js, Python..."
                            />
                        </div>
                        <div>
                            <label>Phone Number</label>
                            <input
                                className="input"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label>LinkedIn URL</label>
                            <input
                                className="input"
                                value={formData.linkedinURL}
                                onChange={e => setFormData({ ...formData, linkedinURL: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Profile;
