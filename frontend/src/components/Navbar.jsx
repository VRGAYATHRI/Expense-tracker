import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Receipt, BarChart3, Users, LogOut, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (!user) return null;

    const navLinks = [
        { path: '/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/expenses', name: 'Expenses', icon: <Receipt size={18} /> },
        { path: '/analytics', name: 'Analytics', icon: <BarChart3 size={18} /> },
        { path: '/friends', name: 'Friends', icon: <Users size={18} /> },
    ];

    return (
        <nav className="navbar glass-panel">
            <div className="navbar-container container">
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">💸</span>
                    <span className="logo-text">ExpenseTracker</span>
                </Link>

                <div className="menu-icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </div>

                <ul className={isMobileMenuOpen ? "nav-menu active" : "nav-menu"}>
                    {navLinks.map((link) => (
                        <li key={link.path} className="nav-item">
                            <Link 
                                to={link.path} 
                                className={location.pathname === link.path ? "nav-links active" : "nav-links"}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.icon}
                                <span>{link.name}</span>
                            </Link>
                        </li>
                    ))}
                    <li className="nav-item nav-user-mobile">
                        <div className="user-profile">
                            <div className="avatar">{user.username.charAt(0).toUpperCase()}</div>
                            <span>{user.username}</span>
                        </div>
                        <button className="btn-logout" onClick={logout}>
                            <LogOut size={16} />
                            <span>Logout</span>
                        </button>
                    </li>
                </ul>

                <div className="nav-user-desktop">
                    <div className="user-profile">
                        <div className="avatar">{user.username.charAt(0).toUpperCase()}</div>
                        <span className="username">{user.username}</span>
                    </div>
                    <button className="btn-icon" onClick={logout} title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
