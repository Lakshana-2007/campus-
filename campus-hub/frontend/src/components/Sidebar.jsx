import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    HiOutlineAcademicCap,
    HiOutlineHome,
    HiOutlineDocumentText,
    HiOutlineArrowUpTray,
    HiOutlineChatBubbleLeftRight,
    HiOutlineUserCircle,
    HiOutlinePlusCircle,
    HiOutlineEye,
    HiOutlineShieldCheck,
    HiOutlineUsers,
    HiOutlineArrowRightOnRectangle,
    HiOutlineBars3,
    HiOutlineXMark,
    HiOutlineChartBarSquare,
    HiOutlineExclamationTriangle,
    HiOutlineBriefcase,
    HiOutlineCheckCircle,
} from 'react-icons/hi2';
import './Sidebar.css';

const Sidebar = ({ collapsed, setCollapsed }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const studentLinks = [
        { to: '/dashboard', icon: <HiOutlineHome />, label: 'Overview' },
        { to: '/assignments', icon: <HiOutlineDocumentText />, label: 'Assignments' },
        { to: '/submit', icon: <HiOutlineArrowUpTray />, label: 'Submit Work' },
        { to: '/chatbot', icon: <HiOutlineChatBubbleLeftRight />, label: 'AI Tutor' },
        { to: '/placements', icon: <HiOutlineBriefcase />, label: 'Placements' },
        { to: '/alumni', icon: <HiOutlineUsers />, label: 'Alumni Hub' },
        { to: '/attendance', icon: <HiOutlineCheckCircle />, label: 'Attendance' },
        { to: '/messages', icon: <HiOutlineChatBubbleLeftRight />, label: 'Messages' },
        { to: '/profile', icon: <HiOutlineUserCircle />, label: 'Profile' },
    ];

    const facultyLinks = [
        { to: '/dashboard', icon: <HiOutlineHome />, label: 'Overview' },
        { to: '/create-assignment', icon: <HiOutlinePlusCircle />, label: 'Create Assignment' },
        { to: '/submissions', icon: <HiOutlineEye />, label: 'Submissions' },
        { to: '/plagiarism', icon: <HiOutlineShieldCheck />, label: 'Integrity Analysis' },
        { to: '/analytics', icon: <HiOutlineChartBarSquare />, label: 'Analytics' },
        { to: '/risk-assessment', icon: <HiOutlineExclamationTriangle />, label: 'Risk Profiles' },
        { to: '/mark-attendance', icon: <HiOutlineCheckCircle />, label: 'Mark Attendance' },
        { to: '/messages', icon: <HiOutlineChatBubbleLeftRight />, label: 'Messages' },
        { to: '/profile', icon: <HiOutlineUserCircle />, label: 'Profile' },
    ];

    const adminLinks = [
        { to: '/dashboard', icon: <HiOutlineHome />, label: 'Overview' },
        { to: '/manage-users', icon: <HiOutlineUsers />, label: 'Manage Users' },
        { to: '/profile', icon: <HiOutlineUserCircle />, label: 'Profile' },
    ];

    const coordinatorLinks = [
        { to: '/dashboard', icon: <HiOutlineHome />, label: 'Dashboard' },
        { to: '/manage-placements', icon: <HiOutlineBriefcase />, label: 'Manage Jobs' },
        { to: '/placement-stats', icon: <HiOutlineChartBarSquare />, label: 'Placement Stats' },
        { to: '/messages', icon: <HiOutlineChatBubbleLeftRight />, label: 'Messages' },
        { to: '/profile', icon: <HiOutlineUserCircle />, label: 'Profile' },
    ];

    const alumniLinks = [
        { to: '/dashboard', icon: <HiOutlineHome />, label: 'Overview' },
        { to: '/mentorship', icon: <HiOutlineUsers />, label: 'Mentorship' },
        { to: '/messages', icon: <HiOutlineChatBubbleLeftRight />, label: 'Messages' },
        { to: '/profile', icon: <HiOutlineUserCircle />, label: 'Profile' },
    ];

    const links =
        user?.role === 'faculty'
            ? facultyLinks
            : user?.role === 'admin'
                ? adminLinks
                : user?.role === 'placement_coordinator'
                    ? coordinatorLinks
                    : user?.role === 'alumni'
                        ? alumniLinks
                        : studentLinks;

    return (
        <>
            {/* Mobile toggle */}
            <button
                className="sidebar-mobile-toggle"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                {mobileOpen ? <HiOutlineXMark /> : <HiOutlineBars3 />}
            </button>

            {/* Overlay */}
            {mobileOpen && (
                <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
            )}

            <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
                {/* Brand */}
                <div className="sidebar-brand">
                    <div className="sidebar-logo">
                        <HiOutlineAcademicCap />
                    </div>
                    {!collapsed && <span className="sidebar-title">Campus Hub</span>}
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'active' : ''}`
                            }
                            onClick={() => setMobileOpen(false)}
                        >
                            <span className="sidebar-link-icon">{link.icon}</span>
                            {!collapsed && <span className="sidebar-link-label">{link.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* User info & logout */}
                <div className="sidebar-footer">
                    {!collapsed && (
                        <div className="sidebar-user">
                            <div className="sidebar-user-avatar">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="sidebar-user-info">
                                <div className="sidebar-user-name">{user?.name}</div>
                                <div className="sidebar-user-role">{user?.role}</div>
                            </div>
                        </div>
                    )}
                    <button className="sidebar-link logout-btn" onClick={handleLogout}>
                        <span className="sidebar-link-icon">
                            <HiOutlineArrowRightOnRectangle />
                        </span>
                        {!collapsed && <span className="sidebar-link-label">Logout</span>}
                    </button>
                </div>

                {/* Collapse toggle (desktop) */}
                <button
                    className="sidebar-collapse-btn"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? '→' : '←'}
                </button>
            </aside>
        </>
    );
};

export default Sidebar;
