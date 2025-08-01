import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Auto-login with demo user for development
        const demoUser = {
            _id: '1',
            name: 'John Doe',
            email: 'student@campus.edu',
            role: 'student',
            department: 'Computer Science'
        };
        const demoToken = 'demo-token-for-development';
        
        localStorage.setItem('campushub_token', demoToken);
        localStorage.setItem('campushub_user', JSON.stringify(demoUser));
        setToken(demoToken);
        setUser(demoUser);
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token: newToken, ...userData } = res.data.data;
        localStorage.setItem('campushub_token', newToken);
        localStorage.setItem('campushub_user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const register = async (name, email, password, role) => {
        const res = await api.post('/auth/register', { name, email, password, role });
        const { token: newToken, ...userData } = res.data.data;
        localStorage.setItem('campushub_token', newToken);
        localStorage.setItem('campushub_user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('campushub_token');
        localStorage.removeItem('campushub_user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, token, loading, login, register, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};
