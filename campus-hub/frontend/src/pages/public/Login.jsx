import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineAcademicCap } from 'react-icons/hi2';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <div className="auth-logo">
                        <HiOutlineAcademicCap />
                    </div>
                    <h1>Welcome Back</h1>
                    <p>Sign in to Campus Hub</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@university.edu"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account? <Link to="/register">Register</Link>
                </p>

                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        👇 Testing CampusHub?
                    </p>
                    <Link 
                        to="/test-credentials" 
                        style={{
                            display: 'inline-block',
                            padding: '8px 16px',
                            background: 'var(--surface-alt)',
                            color: 'var(--diamond-600)',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            fontWeight: 600,
                            transition: 'all 300ms',
                            border: '1px solid var(--diamond-300)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'var(--diamond-600)';
                            e.target.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'var(--surface-alt)';
                            e.target.style.color = 'var(--diamond-600)';
                        }}
                    >
                        View All Test Credentials
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
