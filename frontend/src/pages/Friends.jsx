import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, UserX, Check, X, Trophy } from 'lucide-react';
import './Friends.css';

const Friends = () => {
    const { user } = useContext(AuthContext);
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [searchUsername, setSearchUsername] = useState('');
    const [searchError, setSearchError] = useState('');
    const [searchSuccess, setSearchSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [filterMonth, setFilterMonth] = useState('');

    useEffect(() => {
        fetchFriendsData();
    }, [filterMonth]);

    const fetchFriendsData = async () => {
        setLoading(true);
        try {
            const [friendsRes, requestsRes] = await Promise.all([
                api.get('friends/'),
                api.get('friends/requests/')
            ]);
            
            setFriends(friendsRes.data);
            setRequests(requestsRes.data);

            let compareUrl = 'friends/compare/';
            if (filterMonth) {
                compareUrl += `?month=${filterMonth}`;
            }
            const leaderboardRes = await api.get(compareUrl);
            setLeaderboard(leaderboardRes.data);
            
        } catch (error) {
            console.error("Error fetching friends data", error);
        }
        setLoading(false);
    };

    const handleSendRequest = async (e) => {
        e.preventDefault();
        setSearchError('');
        setSearchSuccess('');
        
        if (!searchUsername) return;

        if (searchUsername === user.username) {
            setSearchError("You cannot send a request to yourself.");
            return;
        }

        try {
            await api.post('friends/request/', { username: searchUsername });
            setSearchSuccess(`Friend request sent to ${searchUsername}!`);
            setSearchUsername('');
        } catch (error) {
            setSearchError(error.response?.data?.error || "User not found or request already exists.");
        }
    };

    const handleRespondRequest = async (id, action) => {
        try {
            await api.post(`friends/respond/${id}/`, { action });
            fetchFriendsData();
        } catch (error) {
            console.error("Error responding to request", error);
        }
    };

    const handleRemoveFriend = async (id) => {
        if (window.confirm("Are you sure you want to remove this friend?")) {
            try {
                await api.delete(`friends/${id}/`);
                fetchFriendsData();
            } catch (error) {
                console.error("Error removing friend", error);
            }
        }
    };

    return (
        <div className="friends-page animate-fade-in">
            <div className="page-header">
                <h1>Social Comparison</h1>
                <p>Track and compare expenses with friends</p>
            </div>

            <div className="friends-layout">
                {/* Left Column: Requests & Friends List */}
                <div className="friends-sidebar">
                    
                    {/* Add Friend Section */}
                    <div className="glass-panel p-20 mb-20">
                        <h3>Add Friend</h3>
                        <form onSubmit={handleSendRequest} className="add-friend-form mt-15">
                            <input 
                                type="text" 
                                placeholder="Enter username" 
                                value={searchUsername}
                                onChange={(e) => setSearchUsername(e.target.value)}
                            />
                            <button type="submit" className="btn-primary" style={{padding: '12px 15px'}}>
                                <UserPlus size={18} />
                            </button>
                        </form>
                        {searchError && <p className="text-danger mt-10 text-sm">{searchError}</p>}
                        {searchSuccess && <p className="text-success mt-10 text-sm">{searchSuccess}</p>}
                    </div>

                    {/* Pending Requests */}
                    {requests.length > 0 && (
                        <div className="glass-panel p-20 mb-20 border-accent">
                            <h3>Pending Requests ({requests.length})</h3>
                            <div className="requests-list mt-15">
                                {requests.map(req => (
                                    <div key={req.id} className="request-item">
                                        <div className="user-info">
                                            <div className="avatar sm">{req.from_user.username.charAt(0).toUpperCase()}</div>
                                            <span>{req.from_user.username}</span>
                                        </div>
                                        <div className="request-actions">
                                            <button className="btn-icon success" onClick={() => handleRespondRequest(req.id, 'accept')}>
                                                <Check size={18} />
                                            </button>
                                            <button className="btn-icon danger" onClick={() => handleRespondRequest(req.id, 'reject')}>
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Friends List */}
                    <div className="glass-panel p-20">
                        <h3>My Friends ({friends.length})</h3>
                        <div className="friends-list mt-15">
                            {friends.length > 0 ? (
                                friends.map(friendship => (
                                    <div key={friendship.id} className="friend-item">
                                        <div className="user-info">
                                            <div className="avatar sm">{friendship.friend.username.charAt(0).toUpperCase()}</div>
                                            <span>{friendship.friend.username}</span>
                                        </div>
                                        <button className="btn-icon danger-hover" onClick={() => handleRemoveFriend(friendship.id)} title="Remove friend">
                                            <UserX size={16} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted text-center py-20">No friends added yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Leaderboard */}
                <div className="friends-main">
                    <div className="glass-panel p-20 h-100">
                        <div className="flex-between mb-20 border-bottom pb-15">
                            <h3 className="flex-center" style={{gap: '10px'}}>
                                <Trophy size={20} color="var(--primary-color)" /> 
                                Spending Leaderboard
                            </h3>
                            <input 
                                type="month" 
                                value={filterMonth} 
                                onChange={(e) => setFilterMonth(e.target.value)} 
                                className="filter-input-sm"
                            />
                        </div>

                        {loading ? (
                            <div className="flex-center" style={{height: '200px'}}>Loading leaderboard...</div>
                        ) : leaderboard.length > 0 ? (
                            <div className="leaderboard-list">
                                {leaderboard.map((item, index) => {
                                    const isCurrentUser = item.user.username === user.username;
                                    return (
                                        <div key={item.user.id} className={`leaderboard-item ${isCurrentUser ? 'current-user-rank' : ''}`}>
                                            <div className="rank">#{index + 1}</div>
                                            
                                            <div className="leader-info">
                                                <div className="leader-name">
                                                    {item.user.username} {isCurrentUser && <span className="badge" style={{background: 'var(--primary-color)', color: '#000', padding: '2px 6px', fontSize: '10px'}}>YOU</span>}
                                                </div>
                                                <div className="top-categories-mini">
                                                    {item.top_categories?.slice(0,2).map(cat => (
                                                        <span key={cat.category} className="cat-dot" title={`${cat.category}: ₹${cat.total}`}>
                                                            {cat.category}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div className="leader-amount">
                                                ₹{parseFloat(item.total_expenses).toLocaleString()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-muted text-center py-40">No spending data available for this month.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Friends;
