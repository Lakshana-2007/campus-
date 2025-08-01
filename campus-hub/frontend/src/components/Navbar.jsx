import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = ({ collapsed }) => {
    const { user } = useAuth();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <header className={`navbar ${collapsed ? 'collapsed' : ''}`}>
            <div className="navbar-left">
                <h2 className="navbar-greeting">
                    {getGreeting()}, <span className="navbar-name">{user?.name?.split(' ')[0]}</span>
                </h2>
            </div>
            <div className="navbar-right">
                <div className="navbar-role-badge">
                    {user?.role}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
