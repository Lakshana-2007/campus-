import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { HiOutlineTrash } from 'react-icons/hi2';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/auth/users');
            setUsers(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const changeRole = async (userId, newRole) => {
        try {
            await api.put(`/auth/users/${userId}/role`, { role: newRole });
            setUsers((prev) =>
                prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
            );
            setMessage({ type: 'success', text: 'Role updated successfully' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update role' });
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/auth/users/${userId}`);
            setUsers((prev) => prev.filter((u) => u._id !== userId));
            setMessage({ type: 'success', text: 'User deleted' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete user' });
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner" /></div>;
    }

    const stats = {
        total: users.length,
        students: users.filter((u) => u.role === 'student').length,
        faculty: users.filter((u) => u.role === 'faculty').length,
        admins: users.filter((u) => u.role === 'admin').length,
    };

    return (
        <div className="page-container">
            <h1 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Manage Users</h1>

            {message.text && (
                <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>{message.text}</div>
            )}

            <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card">
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--diamond-500)' }}>{stats.students}</div>
                    <div className="stat-label">Students</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.faculty}</div>
                    <div className="stat-label">Faculty</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: '#8B5CF6' }}>{stats.admins}</div>
                    <div className="stat-label">Admins</div>
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u._id}>
                                <td style={{ fontWeight: 500 }}>{u.name}</td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{u.email}</td>
                                <td>
                                    <select
                                        className="form-select"
                                        value={u.role}
                                        onChange={(e) => changeRole(u._id, e.target.value)}
                                        style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8rem' }}
                                    >
                                        <option value="student">Student</option>
                                        <option value="faculty">Faculty</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td style={{ fontSize: '0.85rem' }}>
                                    {new Date(u.createdAt).toLocaleDateString()}
                                </td>
                                <td>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => deleteUser(u._id)}
                                    >
                                        <HiOutlineTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageUsers;
