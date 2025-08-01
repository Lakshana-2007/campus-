import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import Assignments from './pages/student/Assignments';
import SubmitAssignment from './pages/student/SubmitAssignment';
import Chatbot from './pages/student/Chatbot';
import Profile from './pages/student/Profile';
import PlacementStudent from './pages/student/PlacementStudent';
import AlumniHub from './pages/student/AlumniHub';

// Faculty/Admin pages
import FacultyDashboard from './pages/faculty/Dashboard';
import CreateAssignment from './pages/faculty/CreateAssignment';
import ViewSubmissions from './pages/faculty/ViewSubmissions';
import PlagiarismReport from './pages/faculty/PlagiarismReport';
import Analytics from './pages/faculty/Analytics';
import RiskAssessment from './pages/faculty/RiskAssessment';
import MarkAttendance from './pages/faculty/MarkAttendance';
import PlacementAdmin from './pages/admin/PlacementAdmin';
import PlacementCoordinatorDashboard from './pages/coordinator/PlacementCoordinatorDashboard';
import AttendanceOverview from './pages/student/AttendanceOverview';
import MessagingHub from './pages/shared/MessagingHub';

// Alumni pages
import AlumniDashboard from './pages/alumni/Dashboard';

// Admin pages
import ManageUsers from './pages/admin/ManageUsers';

const DashboardLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="app-layout">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
                <Navbar collapsed={collapsed} />
                {children}
            </div>
        </div>
    );
};

const DashboardRouter = () => {
    const { user } = useAuth();

    if (user?.role === 'faculty') return <FacultyDashboard />;
    if (user?.role === 'placement_coordinator') return <PlacementCoordinatorDashboard />;
    if (user?.role === 'alumni') return <AlumniDashboard />;
    if (user?.role === 'admin') return <StudentDashboard />;
    return <StudentDashboard />;
};

const App = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container" style={{ minHeight: '100vh' }}>
                <div className="spinner" />
                <p>Loading Campus Hub...</p>
            </div>
        );
    }

    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Landing />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />

            {/* Protected: Dashboard (role-aware) */}
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <DashboardLayout>
                        <DashboardRouter />
                    </DashboardLayout>
                </ProtectedRoute>
            } />

            {/* Student routes */}
            <Route path="/assignments" element={
                <ProtectedRoute roles={['student']}>
                    <DashboardLayout><Assignments /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/submit" element={
                <ProtectedRoute roles={['student']}>
                    <DashboardLayout><SubmitAssignment /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/chatbot" element={
                <ProtectedRoute roles={['student']}>
                    <DashboardLayout><Chatbot /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/placements" element={
                <ProtectedRoute roles={['student']}>
                    <DashboardLayout><PlacementStudent /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/alumni" element={
                <ProtectedRoute roles={['student', 'alumni']}>
                    <DashboardLayout><AlumniHub /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/attendance" element={
                <ProtectedRoute roles={['student']}>
                    <DashboardLayout><AttendanceOverview /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/mentorship" element={
                <ProtectedRoute roles={['alumni']}>
                    <DashboardLayout><AlumniDashboard /></DashboardLayout>
                </ProtectedRoute>
            } />

            {/* Faculty routes */}
            <Route path="/create-assignment" element={
                <ProtectedRoute roles={['faculty']}>
                    <DashboardLayout><CreateAssignment /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/manage-placements" element={
                <ProtectedRoute roles={['admin', 'placement_coordinator']}>
                    <DashboardLayout><PlacementAdmin /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/placement-stats" element={
                <ProtectedRoute roles={['admin', 'placement_coordinator']}>
                    <DashboardLayout><PlacementCoordinatorDashboard /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/submissions" element={
                <ProtectedRoute roles={['faculty']}>
                    <DashboardLayout><ViewSubmissions /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/plagiarism" element={
                <ProtectedRoute roles={['faculty']}>
                    <DashboardLayout><PlagiarismReport /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/analytics" element={
                <ProtectedRoute roles={['faculty']}>
                    <DashboardLayout><Analytics /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/risk-assessment" element={
                <ProtectedRoute roles={['faculty']}>
                    <DashboardLayout><RiskAssessment /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/mark-attendance" element={
                <ProtectedRoute roles={['faculty']}>
                    <DashboardLayout><MarkAttendance /></DashboardLayout>
                </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/manage-users" element={
                <ProtectedRoute roles={['admin']}>
                    <DashboardLayout><ManageUsers /></DashboardLayout>
                </ProtectedRoute>
            } />

            {/* Shared: Profile */}
            <Route path="/profile" element={
                <ProtectedRoute>
                    <DashboardLayout><Profile /></DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/messages" element={
                <ProtectedRoute>
                    <DashboardLayout><MessagingHub /></DashboardLayout>
                </ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default App;
