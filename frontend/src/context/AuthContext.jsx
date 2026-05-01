import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkUserStatus();
    }, []);

    const checkUserStatus = async () => {
        const token = localStorage.getItem('access');
        if (token) {
            try {
                const res = await api.get('auth/me/');
                setUser(res.data);
            } catch (err) {
                console.error("Failed to fetch user", err);
                // Token might be invalid or expired, interceptor will try to refresh
            }
        }
        setLoading(false);
    };

    const login = async (username, password) => {
        setError(null);
        try {
            const res = await api.post('auth/login/', { username, password });
            localStorage.setItem('access', res.data.access);
            localStorage.setItem('refresh', res.data.refresh);
            await checkUserStatus();
            return true;
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
            return false;
        }
    };

    const register = async (username, email, password, password_confirm) => {
        setError(null);
        try {
            await api.post('auth/register/', { 
                username, 
                email, 
                password, 
                password_confirm 
            });
            // Automatically log in after registration
            return await login(username, password);
        } catch (err) {
            const errData = err.response?.data;
            const errMsg = errData ? Object.values(errData).flat()[0] : 'Registration failed.';
            setError(errMsg);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
