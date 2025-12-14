import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const GroupLeaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${apiUrl}/api/leaderboard/leaderboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeaderboard(response.data.leaderboard);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            setError('Failed to load leaderboard');
        } finally {
            setLoading(false);
        }
    };

    const getRatingColor = (rating) => {
        switch (rating) {
            case 'excellent': return '#4caf50';
            case 'good': return '#2196f3';
            case 'fair': return '#ff9800';
            case 'poor': return '#f44336';
            default: return '#9e9e9e';
        }
    };

    const getRatingEmoji = (rating) => {
        switch (rating) {
            case 'excellent': return '🌟';
            case 'good': return '👍';
            case 'fair': return '👌';
            case 'poor': return '📉';
            default: return '⚪';
        }
    };

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading leaderboard...</div>;
    if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
    if (leaderboard.length === 0) return <div style={{ padding: '20px' }}>No leaderboard data available</div>;

    return (
        <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '20px',
            margin: '20px 0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>
                🏆 Group Leaderboard
            </h3>
            
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                            <th style={{ padding: '12px 8px', textAlign: 'left', color: '#666' }}>Rank</th>
                            <th style={{ padding: '12px 8px', textAlign: 'left', color: '#666' }}>Member</th>
                            <th style={{ padding: '12px 8px', textAlign: 'right', color: '#666' }}>Savings</th>
                            <th style={{ padding: '12px 8px', textAlign: 'center', color: '#666' }}>Performance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((member) => (
                            <tr 
                                key={member.id}
                                style={{
                                    borderBottom: '1px solid #f0f0f0',
                                    background: member.isCurrentUser ? '#e3f2fd' : 'transparent',
                                    fontWeight: member.isCurrentUser ? 'bold' : 'normal'
                                }}
                            >
                                <td style={{ padding: '12px 8px' }}>
                                    {member.rank === 1 && '🥇'}
                                    {member.rank === 2 && '🥈'}
                                    {member.rank === 3 && '🥉'}
                                    {member.rank > 3 && `#${member.rank}`}
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                    {member.name}
                                    {member.isCurrentUser && ' (You)'}
                                </td>
                                <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '500' }}>
                                    KSh {member.totalSavings.toLocaleString()}
                                </td>
                                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                    <span
                                        style={{
                                            background: getRatingColor(member.rating),
                                            color: 'white',
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            display: 'inline-block'
                                        }}
                                    >
                                        {getRatingEmoji(member.rating)} {member.rating}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div style={{ marginTop: '16px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                💡 Names are masked for privacy. Your name is shown in full.
            </div>
        </div>
    );
};

export default GroupLeaderboard;
