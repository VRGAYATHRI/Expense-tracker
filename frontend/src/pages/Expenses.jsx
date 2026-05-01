import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit2, Trash2, X, Filter } from 'lucide-react';
import './Expenses.css';

const CATEGORIES = ['food', 'travel', 'shopping', 'entertainment', 'bills', 'health', 'education', 'other'];

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentExpense, setCurrentExpense] = useState(null);
    const [filterMonth, setFilterMonth] = useState('');

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: 'food',
        notes: ''
    });

    useEffect(() => {
        fetchExpenses();
    }, [filterMonth]);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            let url = 'expenses/';
            if (filterMonth) {
                url += `?month=${filterMonth}`;
            }
            const res = await api.get(url);
            setExpenses(res.data.results || res.data);
        } catch (error) {
            console.error("Error fetching expenses", error);
        }
        setLoading(false);
    };

    const handleOpenModal = (expense = null) => {
        if (expense) {
            setCurrentExpense(expense);
            setFormData({
                date: expense.date,
                amount: expense.amount,
                category: expense.category,
                notes: expense.notes
            });
        } else {
            setCurrentExpense(null);
            setFormData({
                date: new Date().toISOString().split('T')[0],
                amount: '',
                category: 'food',
                notes: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentExpense(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentExpense) {
                await api.put(`expenses/${currentExpense.id}/`, formData);
            } else {
                await api.post('expenses/', formData);
            }
            fetchExpenses();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving expense", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this expense?")) {
            try {
                await api.delete(`expenses/${id}/`);
                fetchExpenses();
            } catch (error) {
                console.error("Error deleting expense", error);
            }
        }
    };

    const handleMonthFilterChange = (e) => {
        setFilterMonth(e.target.value);
    };

    return (
        <div className="expenses-page animate-fade-in">
            <div className="page-header flex-between">
                <div>
                    <h1>Expenses</h1>
                    <p>Manage your daily expenses</p>
                </div>
                <button className="btn-primary flex-center" onClick={() => handleOpenModal()} style={{gap: '8px'}}>
                    <Plus size={18} /> Add Expense
                </button>
            </div>

            <div className="filters-container glass-panel">
                <div className="filter-group">
                    <Filter size={18} color="var(--text-secondary)" />
                    <label>Filter by Month:</label>
                    <input 
                        type="month" 
                        value={filterMonth} 
                        onChange={handleMonthFilterChange} 
                        className="filter-input"
                    />
                    {filterMonth && (
                        <button className="btn-secondary btn-sm" onClick={() => setFilterMonth('')} style={{padding: '6px 12px', fontSize: '0.8rem'}}>
                            Clear
                        </button>
                    )}
                </div>
            </div>

            <div className="table-container glass-panel">
                {loading ? (
                    <div className="flex-center" style={{padding: '40px'}}>Loading...</div>
                ) : expenses.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Notes</th>
                                <th style={{textAlign: 'right'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map(expense => (
                                <tr key={expense.id}>
                                    <td>{expense.date}</td>
                                    <td>
                                        <span className={`badge badge-${expense.category.toLowerCase()}`}>
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td style={{fontWeight: '600'}}>₹{parseFloat(expense.amount).toLocaleString()}</td>
                                    <td className="notes-col">{expense.notes || '-'}</td>
                                    <td style={{textAlign: 'right'}}>
                                        <button className="action-btn edit-btn" onClick={() => handleOpenModal(expense)}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="action-btn delete-btn" onClick={() => handleDelete(expense.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="flex-center empty-state" style={{padding: '40px'}}>
                        No expenses found for this period.
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content glass-panel animate-fade-in">
                        <div className="modal-header flex-between">
                            <h3>{currentExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
                            <button className="close-btn" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-body">
                            <div className="form-group">
                                <label>Date</label>
                                <input 
                                    type="date" 
                                    required 
                                    value={formData.date}
                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Amount (₹)</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    min="0.01" 
                                    required 
                                    value={formData.amount}
                                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select 
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>
                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Notes (Optional)</label>
                                <textarea 
                                    rows="3"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                ></textarea>
                            </div>
                            <div className="modal-actions flex-between">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className="btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
