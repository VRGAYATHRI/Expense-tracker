import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, CreditCard, PieChart, Activity } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [summary, setSummary] = useState(null);
    const [recentExpenses, setRecentExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [summaryRes, expensesRes] = await Promise.all([
                api.get('analytics/monthly/'),
                api.get('expenses/?limit=5')
            ]);
            setSummary(summaryRes.data);
            setRecentExpenses(expensesRes.data.results || expensesRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching dashboard data", error);
            setLoading(false);
        }
    };

    if (loading) return <div className="flex-center" style={{height: '60vh'}}>Loading...</div>;

    const total = summary?.total_expenses || 0;
    const topCategory = summary?.category_breakdown?.[0];
    
    // Format daily data for chart
    const chartData = summary?.daily_breakdown?.map(item => ({
        date: new Date(item.date).getDate().toString(),
        amount: parseFloat(item.total)
    })) || [];

    return (
        <div className="dashboard animate-fade-in">
            <header className="dashboard-header">
                <div>
                    <h1>Hello, {user.username}! 👋</h1>
                    <p>Here's your expense overview for this month.</p>
                </div>
            </header>

            <div className="grid-cards stats-grid">
                <div className="stat-card glass-panel">
                    <div className="stat-icon" style={{background: 'rgba(69, 162, 158, 0.1)', color: 'var(--primary-color)'}}>
                        <CreditCard size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Total Spent</h3>
                        <h2>₹{total.toLocaleString()}</h2>
                    </div>
                </div>

                <div className="stat-card glass-panel">
                    <div className="stat-icon" style={{background: 'rgba(102, 252, 241, 0.1)', color: 'var(--secondary-color)'}}>
                        <PieChart size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Top Category</h3>
                        <h2>{topCategory ? topCategory.category.charAt(0).toUpperCase() + topCategory.category.slice(1) : 'N/A'}</h2>
                        {topCategory && <p>₹{parseFloat(topCategory.total).toLocaleString()}</p>}
                    </div>
                </div>

                <div className="stat-card glass-panel">
                    <div className="stat-icon" style={{background: 'rgba(76, 175, 80, 0.1)', color: '#4caf50'}}>
                        <Activity size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Daily Average</h3>
                        <h2>₹{chartData.length ? (total / chartData.length).toFixed(0).toLocaleString() : 0}</h2>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="chart-section glass-panel">
                    <div className="section-header">
                        <h3><TrendingUp size={20} /> Spending Trend</h3>
                    </div>
                    <div className="chart-container">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                    <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} />
                                    <YAxis stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--surface-border)', borderRadius: '8px' }}
                                        itemStyle={{ color: 'var(--secondary-color)' }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="amount" 
                                        stroke="url(#colorGradient)" 
                                        strokeWidth={3}
                                        dot={{ fill: 'var(--primary-color)', strokeWidth: 2 }}
                                        activeDot={{ r: 8 }}
                                    />
                                    <defs>
                                        <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="var(--primary-color)" />
                                            <stop offset="100%" stopColor="var(--secondary-color)" />
                                        </linearGradient>
                                    </defs>
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex-center" style={{height: '100%', color: 'var(--text-secondary)'}}>
                                No expenses yet this month.
                            </div>
                        )}
                    </div>
                </div>

                <div className="recent-section glass-panel">
                    <div className="section-header">
                        <h3>Recent Expenses</h3>
                    </div>
                    <div className="recent-list">
                        {recentExpenses.length > 0 ? (
                            recentExpenses.map(expense => (
                                <div key={expense.id} className="recent-item">
                                    <div className="recent-details">
                                        <div className={`badge badge-${expense.category.toLowerCase()}`}>
                                            {expense.category}
                                        </div>
                                        <div className="recent-meta">
                                            <span className="date">{expense.date}</span>
                                            {expense.notes && <span className="notes">{expense.notes}</span>}
                                        </div>
                                    </div>
                                    <div className="recent-amount">
                                        -₹{parseFloat(expense.amount).toLocaleString()}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">No recent expenses</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
