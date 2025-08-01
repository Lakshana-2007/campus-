import { HiOutlineCheckCircle, HiOutlineClipboard } from 'react-icons/hi2';
import { useState } from 'react';

const TestCredentials = () => {
    const [copied, setCopied] = useState(null);

    const credentials = [
        {
            role: '🎓 Student',
            email: 'student@campushub.edu',
            password: 'student123',
            features: ['View assignments', 'Submit work', 'Track attendance', 'Find jobs', 'Chat with AI']
        },
        {
            role: '👨‍🏫 Faculty',
            email: 'faculty@campus.edu',
            password: 'password123',
            features: ['Create assignments', 'Grade submissions', 'Check plagiarism', 'Mark attendance', 'View analytics']
        },
        {
            role: '👔 Placement Coordinator',
            email: 'coordinator@campus.edu',
            password: 'password123',
            features: ['Post jobs', 'Manage placements', 'Schedule interviews', 'Track applications', 'View metrics']
        },
        {
            role: '🔑 Admin',
            email: 'admin@campushub.edu',
            password: 'admin123',
            features: ['Manage users', 'Manage courses', 'View analytics', 'System configuration', 'Backups']
        },
        {
            role: '🎯 Alumni',
            email: 'alumni@campushub.edu',
            password: 'password123',
            features: ['Connect with students', 'Share experience', 'Help with placements', 'Mentorship']
        }
    ];

    const copyToClipboard = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--diamond-600) 0%, var(--diamond-800) 100%)', padding: '40px 20px' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px', color: 'white' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🧪 Test Credentials</h1>
                    <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Use these accounts to explore CampusHub</p>
                </div>

                {/* Credentials Grid */}
                <div style={{ display: 'grid', gap: '20px', marginBottom: '40px' }}>
                    {credentials.map((cred, idx) => (
                        <div
                            key={idx}
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '24px',
                                boxShadow: 'var(--shadow-lg)',
                                border: '2px solid var(--border-color)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--diamond-600)' }}>
                                    {cred.role}
                                </h3>
                                <span style={{
                                    background: 'var(--success-light)',
                                    color: 'var(--success)',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                }}>
                                    Ready to Use
                                </span>
                            </div>

                            {/* Email */}
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Email</label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <code style={{
                                        flex: 1,
                                        background: 'var(--surface-alt)',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        fontSize: '0.95rem',
                                        fontFamily: 'monospace'
                                    }}>
                                        {cred.email}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(cred.email, `email-${idx}`)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '8px',
                                            color: copied === `email-${idx}` ? 'var(--success)' : 'var(--diamond-600)',
                                            fontSize: '1.2rem',
                                            transition: 'all 300ms'
                                        }}
                                    >
                                        {copied === `email-${idx}` ? <HiOutlineCheckCircle /> : <HiOutlineClipboard />}
                                    </button>
                                </div>
                            </div>

                            {/* Password */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Password</label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <code style={{
                                        flex: 1,
                                        background: 'var(--surface-alt)',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        fontSize: '0.95rem',
                                        fontFamily: 'monospace',
                                        letterSpacing: '0.05em'
                                    }}>
                                        {cred.password}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(cred.password, `pass-${idx}`)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '8px',
                                            color: copied === `pass-${idx}` ? 'var(--success)' : 'var(--diamond-600)',
                                            fontSize: '1.2rem',
                                            transition: 'all 300ms'
                                        }}
                                    >
                                        {copied === `pass-${idx}` ? <HiOutlineCheckCircle /> : <HiOutlineClipboard />}
                                    </button>
                                </div>
                            </div>

                            {/* Features */}
                            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Can access:</p>
                                <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: 0, padding: 0, listStyle: 'none' }}>
                                    {cred.features.map((feature, i) => (
                                        <li
                                            key={i}
                                            style={{
                                                background: 'var(--surface-alt)',
                                                padding: '4px 10px',
                                                borderRadius: '4px',
                                                fontSize: '0.8rem',
                                                color: 'var(--text-primary)'
                                            }}
                                        >
                                            ✓ {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Info Box */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '2px solid var(--info-border)',
                    color: 'var(--text-primary)'
                }}>
                    <h3 style={{ marginTop: 0, color: 'var(--diamond-600)' }}>💡 Tips</h3>
                    <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.8 }}>
                        <li><strong>Click the clipboard icon</strong> to copy email/password</li>
                        <li>Each role has a <strong>unique dashboard</strong> with role-specific features</li>
                        <li><strong>Students</strong> can submit assignments, check grades, and apply for jobs</li>
                        <li><strong>Faculty</strong> can create assignments, grade submissions, and check plagiarism</li>
                        <li><strong>Placement Officers</strong> can post jobs, manage applications, and schedule interviews</li>
                        <li><strong>Admins</strong> can manage users, courses, and view system analytics</li>
                        <li><strong>Alumni</strong> can connect with students and provide mentorship</li>
                        <li>All accounts have <strong>realistic data</strong> for testing AI features</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TestCredentials;
