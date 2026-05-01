import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password_confirm: ''
    });
    const [localError, setLocalError] = useState('');
    const { register, error } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        
        const { username, email, password, password_confirm } = formData;

        if (!username || !email || !password || !password_confirm) {
            setLocalError('Please fill in all fields');
            return;
        }

        if (password !== password_confirm) {
            setLocalError('Passwords do not match');
            return;
        }

        const success = await register(username, email, password, password_confirm);
        if (success) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass-panel animate-fade-in">
                <h2>Create Account</h2>
                <p className="auth-subtitle">Start tracking your expenses today</p>
                
                {(error || localError) && (
                    <div className="auth-error">
                        {error || localError}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input 
                            type="text" 
                            name="username"
                            value={formData.username} 
                            onChange={handleChange}
                            placeholder="Choose a username"
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email} 
                            onChange={handleChange}
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            name="password"
                            value={formData.password} 
                            onChange={handleChange}
                            placeholder="Create a password"
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input 
                            type="password" 
                            name="password_confirm"
                            value={formData.password_confirm} 
                            onChange={handleChange}
                            placeholder="Confirm your password"
                        />
                    </div>
                    <button type="submit" className="btn-primary auth-btn">Register</button>
                </form>
                
                <div className="auth-footer">
                    Already have an account? <Link to="/login">Login here</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
