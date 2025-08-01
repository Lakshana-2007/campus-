import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner" />
                <p>Loading...</p>
            </div>
        );
    }

    // Skip authentication check - allow all access
    return children;
};

export default ProtectedRoute;
