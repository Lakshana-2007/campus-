import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineAcademicCap, HiOutlineChatBubbleLeftRight, HiOutlineShieldCheck, HiOutlineChartBarSquare } from 'react-icons/hi2';
import './Landing.css';

const Landing = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="landing">
            {/* Hero */}
            <header className="landing-header">
                <nav className="landing-nav">
                    <div className="landing-brand">
                        <HiOutlineAcademicCap className="landing-brand-icon" />
                        <span>Campus Hub</span>
                    </div>
                    <div className="landing-nav-links">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-secondary">Log In</Link>
                                <Link to="/register" className="btn btn-primary">Get Started</Link>
                            </>
                        )}
                    </div>
                </nav>

                <div className="hero">
                    <div className="hero-badge">AI-Driven Academic Intelligence</div>
                    <h1 className="hero-title">
                        The Future of<br />
                        <span className="hero-gradient">Academic Excellence</span>
                    </h1>
                    <p className="hero-subtitle">
                        Campus Hub is an AI-powered academic intelligence platform that predicts,
                        evaluates, and guides academic performance — not just another assignment portal.
                    </p>
                    <div className="hero-actions">
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Start Learning Smarter
                        </Link>
                        <Link to="/login" className="btn btn-secondary btn-lg">
                            Sign In
                        </Link>
                    </div>
                </div>
            </header>

            {/* Features */}
            <section className="features">
                <h2 className="features-title">Intelligent Modules</h2>
                <p className="features-subtitle">AI sits at the center of every interaction</p>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: 'rgba(51,117,255,0.1)', color: 'var(--diamond-500)' }}>
                            <HiOutlineAcademicCap />
                        </div>
                        <h3>Smart Submissions</h3>
                        <p>Upload assignments with automatic late detection, text extraction, and AI-powered quality analysis.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>
                            <HiOutlineChatBubbleLeftRight />
                        </div>
                        <h3>Adaptive AI Tutor</h3>
                        <p>Context-aware chatbot that knows your assignments, deadlines, and struggles — then builds study plans around them.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>
                            <HiOutlineShieldCheck />
                        </div>
                        <h3>Integrity Analysis</h3>
                        <p>AI-driven plagiarism detection with structured insight: integrity score, quality score, and risk assessment.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning)' }}>
                            <HiOutlineChartBarSquare />
                        </div>
                        <h3>Faculty Analytics</h3>
                        <p>AI-aggregated insights: submission trends, problematic assignments, late-submission patterns, and integrity clusters.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer" style={{ paddingBottom: '40px' }}>
                <p>&copy; {new Date().getFullYear()} Campus Hub — AI-Driven Academic Intelligence System</p>
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', marginBottom: '10px', opacity: 0.8 }}>
                        🧪 Want to test the platform?
                    </p>
                    <Link to="/test-credentials" style={{
                        display: 'inline-block',
                        padding: '10px 20px',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        border: '1px solid rgba(255,255,255,0.3)',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        transition: 'all 300ms'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.2)';
                        e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.1)';
                        e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                    }}
                    >
                        View Test Credentials
                    </Link>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
