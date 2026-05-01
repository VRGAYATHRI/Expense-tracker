import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Calendar } from 'lucide-react';
import './Dashboard.css'; // Reusing some grid styles

const COLORS = ['#FF9800', '#2196F3', '#E91E63', '#9C27B0', '#F44336', '#4CAF50', '#3F51B5', '#9E9E9E'];

const Analytics = () => {
    const [monthlyData, setMonthlyData] = useState(null);
    const [trendData, setTrendData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterMonth, setFilterMonth] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, [filterMonth]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            let url = 'analytics/monthly/';
            if (filterMonth) {
                url += `?month=${filterMonth}`;
            }
            
            const [monthlyRes, trendRes] = await Promise.all([
                api.get(url),
                api.get('analytics/trend/?months=6')
            ]);
            
            setMonthlyData(monthlyRes.data);
            setTrendData(trendRes.data);
        } catch (error) {
            console.error("Error fetching analytics", error);
        }
        setLoading(false);
    };

    // Format data for Pie chart
    const pieData = monthlyData?.category_breakdown?.map(item => ({
        name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
        value: parseFloat(item.total)
    })) || [];

    // Format data for Bar chart
    const barData = trendData.map(item => ({
        month: item.month,
        amount: parseFloat(item.total)
    }));

    return (
        <div className="analytics-page animate-fade-in">
            <div className="page-header flex-between">
                <div>
                    <h1>Analytics</h1>
                    <p>Deep dive into your spending habits</p>
                </div>
                <div className="filter-group glass-panel" style={{padding: '10px 15px', borderRadius: 'var(--border-radius-sm)'}}>
                    <Calendar size={18} color="var(--text-secondary)" />
                    <input 
                        type="month" 
                        value={filterMonth} 
                        onChange={(e) => setFilterMonth(e.target.value)} 
                        className="filter-input"
                        style={{background: 'transparent', border: 'none', padding: '0'}}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex-center" style={{height: '50vh'}}>Loading...</div>
            ) : (
                <div className="dashboard-content" style={{gridTemplateColumns: '1fr 1fr'}}>
                    
                    {/* Category Breakdown */}
                    <div className="chart-section glass-panel">
                        <div className="section-header">
                            <h3>Category Breakdown</h3>
                        </div>
                        <div className="chart-container" style={{height: '350px'}}>
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            formatter={(value) => `₹${value.toLocaleString()}`}
                                            contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--surface-border)', borderRadius: '8px' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex-center" style={{height: '100%', color: 'var(--text-secondary)'}}>
                                    No data available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 6-Month Trend */}
                    <div className="chart-section glass-panel">
                        <div className="section-header">
                            <h3>6-Month Spending Trend</h3>
                        </div>
                        <div className="chart-container" style={{height: '350px'}}>
                            {barData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="month" stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                                        <YAxis stroke="var(--text-secondary)" tickFormatter={(val) => `₹${val}`} width={80} />
                                        <Tooltip 
                                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                            formatter={(value) => [`₹${value.toLocaleString()}`, 'Total']}
                                            contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--surface-border)', borderRadius: '8px' }}
                                        />
                                        <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                            {barData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill="url(#barGradient)" />
                                            ))}
                                        </Bar>
                                        <defs>
                                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="var(--secondary-color)" />
                                                <stop offset="100%" stopColor="var(--primary-color)" />
                                            </linearGradient>
                                        </defs>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex-center" style={{height: '100%', color: 'var(--text-secondary)'}}>
                                    No trend data available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;
