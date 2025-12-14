import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const MemberPerformance = () => {
    const [memberData, setMemberData] = useState(null);
    const [performanceData, setPerformanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState(null);
    const [groupMembers, setGroupMembers] = useState([]);

    useEffect(() => {
        fetchMemberData();
    }, []);

    useEffect(() => {
        if (selectedMemberId) {
            fetchPerformanceData(selectedMemberId);
        }
    }, [selectedMemberId]);

    const fetchMemberData = async () => {
        try {
            const token = localStorage.getItem('token');
            const storedMember = JSON.parse(localStorage.getItem('member'));
            
            setMemberData(storedMember);
            setIsAdmin(storedMember?.is_admin || storedMember?.role === 'admin');
            
            // Set current member as selected
            setIsAdmin(storedMember?.is_admin || storedMember?.role === 'admin');
            setSelectedMemberId(storedMember._id || storedMember.id);
            
            // Note: Group member selection removed - will be added when endpoint is available
        } catch (error) {
            console.error('Error fetching member data:', error);
            setError('Failed to load member data');
        }
    };

    const fetchPerformanceData = async (memberId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${apiUrl}/api/repayments/combined-performance/${memberId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPerformanceData(response.data);
        } catch (error) {
            console.error('Error fetching performance data:', error);
            setError('Failed to load performance data');
        } finally {
            setLoading(false);
        }
    };

    const getPerformanceColor = (rating) => {
        switch (rating) {
            case 'excellent': return '#4caf50';
            case 'good': return '#2196f3';
            case 'fair': return '#ff9800';
            case 'poor': return '#f44336';
            default: return '#9e9e9e';
        }
    };

    const getPerformanceIcon = (rating) => {
        switch (rating) {
            case 'excellent': return '🌟';
            case 'good': return '👍';
            case 'fair': return '👌';
            case 'poor': return '📉';
            default: return '❓';
        }
    };

    const getRatingDescription = (rating) => {
        switch (rating) {
            case 'excellent': return 'Outstanding performance! Consistently early or on-time.';
            case 'good': return 'Good performance with mostly timely payments.';
            case 'fair': return 'Average performance with some delays.';
            case 'poor': return 'Needs improvement - frequent late payments.';
            default: return 'Not enough data to determine performance.';
        }
    };

    if (loading) {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
                <h2>Loading Member Performance...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
                <div style={{ 
                    background: '#ffebee', 
                    color: '#c62828', 
                    padding: '15px', 
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            {/* Header */}
            <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '30px',
                borderRadius: '15px',
                marginBottom: '30px',
                textAlign: 'center'
            }}>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>📊 Member Performance</h1>
                <p style={{ margin: 0, opacity: 0.9 }}>Track contribution and loan repayment timing</p>
            </div>

            {/* Member Selector (Admin Only) */}
            {isAdmin && groupMembers.length > 0 && (
                <div style={{ 
                    background: 'white',
                    border: '1px solid #e1e5e9',
                    borderRadius: '15px',
                    padding: '20px',
                    marginBottom: '30px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>
                        Select Member to View:
                    </label>
                    <select
                        value={selectedMemberId || ''}
                        onChange={(e) => setSelectedMemberId(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #e1e5e9',
                            borderRadius: '8px',
                            fontSize: '16px'
                        }}
                    >
                        {groupMembers.map(member => (
                            <option key={member._id} value={member._id}>
                                {member.first_name} {member.last_name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Performance Overview */}
            {performanceData && (
                <>
                    {/* Overall Performance Card */}
                    <div style={{ 
                        background: 'white',
                        border: '1px solid #e1e5e9',
                        borderRadius: '15px',
                        padding: '30px',
                        marginBottom: '30px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        textAlign: 'center'
                    }}>
                        <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>
                            {performanceData.member.name}
                        </h2>
                        
                        <div style={{
                            fontSize: '48px',
                            marginBottom: '15px'
                        }}>
                            {getPerformanceIcon(performanceData.combined_performance.overall_rating)}
                        </div>
                        
                        <div style={{
                            fontSize: '32px',
                            fontWeight: 'bold',
                            color: getPerformanceColor(performanceData.combined_performance.overall_rating),
                            marginBottom: '10px',
                            textTransform: 'capitalize'
                        }}>
                            {performanceData.combined_performance.overall_rating.replace('_', ' ')}
                        </div>
                        
                        <p style={{ 
                            color: '#666', 
                            fontSize: '16px', 
                            lineHeight: '1.5',
                            maxWidth: '500px',
                            margin: '0 auto 20px'
                        }}>
                            {getRatingDescription(performanceData.combined_performance.overall_rating)}
                        </p>
                        
                        {performanceData.combined_performance.total_activities > 0 && (
                            <div style={{
                                background: '#f8f9fa',
                                borderRadius: '10px',
                                padding: '15px',
                                display: 'inline-block'
                            }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                                    {performanceData.combined_performance.overall_score.toFixed(2)}/3.0
                                </div>
                                <div style={{ fontSize: '14px', color: '#666' }}>
                                    Overall Score
                                </div>
                                <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                                    Based on {performanceData.combined_performance.total_activities} activities
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Detailed Performance Breakdown */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        
                        {/* Contribution Performance */}
                        <div style={{ 
                            background: 'white',
                            border: '1px solid #e1e5e9',
                            borderRadius: '15px',
                            padding: '25px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                        }}>
                            <h3 style={{ margin: '0 0 20px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                🔄 Table Banking Contributions
                            </h3>
                            
                            {performanceData.contribution_performance.total_rated > 0 ? (
                                <>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: '20px'
                                    }}>
                                        <div style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '50%',
                                            background: getPerformanceColor(performanceData.contribution_performance.average_rating),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '24px',
                                            fontWeight: 'bold'
                                        }}>
                                            {getPerformanceIcon(performanceData.contribution_performance.average_rating)}
                                        </div>
                                    </div>
                                    
                                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                        <div style={{
                                            fontSize: '20px',
                                            fontWeight: 'bold',
                                            color: getPerformanceColor(performanceData.contribution_performance.average_rating),
                                            textTransform: 'capitalize'
                                        }}>
                                            {performanceData.contribution_performance.average_rating}
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#666' }}>
                                            Score: {performanceData.contribution_performance.score?.toFixed(2)}/3.0
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '15px' }}>
                                        <div style={{ textAlign: 'center', padding: '10px', background: '#e8f5e8', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4caf50' }}>
                                                {performanceData.contribution_performance.breakdown.early}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#4caf50' }}>Early</div>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '10px', background: '#fff3cd', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffc107' }}>
                                                {performanceData.contribution_performance.breakdown.on_time}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#ffc107' }}>On Time</div>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '10px', background: '#f8d7da', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc3545' }}>
                                                {performanceData.contribution_performance.breakdown.late}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#dc3545' }}>Late</div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
                                        Total Rated: {performanceData.contribution_performance.total_rated} contributions
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>📊</div>
                                    <p>No contribution data available</p>
                                </div>
                            )}
                        </div>

                        {/* Loan Repayment Performance */}
                        <div style={{ 
                            background: 'white',
                            border: '1px solid #e1e5e9',
                            borderRadius: '15px',
                            padding: '25px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                        }}>
                            <h3 style={{ margin: '0 0 20px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                💰 Loan Repayments
                            </h3>
                            
                            {performanceData.loan_performance.total_rated > 0 ? (
                                <>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: '20px'
                                    }}>
                                        <div style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '50%',
                                            background: getPerformanceColor(performanceData.loan_performance.average_rating),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '24px',
                                            fontWeight: 'bold'
                                        }}>
                                            {getPerformanceIcon(performanceData.loan_performance.average_rating)}
                                        </div>
                                    </div>
                                    
                                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                        <div style={{
                                            fontSize: '20px',
                                            fontWeight: 'bold',
                                            color: getPerformanceColor(performanceData.loan_performance.average_rating),
                                            textTransform: 'capitalize'
                                        }}>
                                            {performanceData.loan_performance.average_rating}
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#666' }}>
                                            Score: {performanceData.loan_performance.score?.toFixed(2)}/3.0
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '15px' }}>
                                        <div style={{ textAlign: 'center', padding: '10px', background: '#e8f5e8', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4caf50' }}>
                                                {performanceData.loan_performance.breakdown.early}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#4caf50' }}>Early</div>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '10px', background: '#fff3cd', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffc107' }}>
                                                {performanceData.loan_performance.breakdown.on_time}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#ffc107' }}>On Time</div>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '10px', background: '#f8d7da', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc3545' }}>
                                                {performanceData.loan_performance.breakdown.late}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#dc3545' }}>Late</div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
                                        Total Rated: {performanceData.loan_performance.total_rated} repayments<br/>
                                        Avg Days Late: {performanceData.loan_performance.average_days_late?.toFixed(1)} days
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>💰</div>
                                    <p>No loan repayment data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Performance Tips */}
                    {performanceData.combined_performance.overall_rating !== 'excellent' && (
                        <div style={{ 
                            background: '#e3f2fd',
                            border: '1px solid #2196f3',
                            borderRadius: '15px',
                            padding: '20px',
                            marginBottom: '20px'
                        }}>
                            <h3 style={{ margin: '0 0 15px 0', color: '#1976d2', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                💡 Tips to Improve Performance
                            </h3>
                            <ul style={{ margin: 0, color: '#1976d2', lineHeight: '1.6' }}>
                                {performanceData.contribution_performance.total_rated === 0 && (
                                    <li>Start participating in table banking contributions to build your payment history</li>
                                )}
                                {performanceData.loan_performance.total_rated === 0 && performanceData.contribution_performance.average_rating === 'excellent' && (
                                    <li>Your contribution performance is excellent! You may be eligible for loans.</li>
                                )}
                                {performanceData.combined_performance.overall_rating === 'poor' && (
                                    <li>Set up payment reminders to avoid late payments</li>
                                )}
                                {(performanceData.combined_performance.overall_rating === 'fair' || performanceData.combined_performance.overall_rating === 'poor') && (
                                    <li>Try to make payments a few days before the due date</li>
                                )}
                                <li>Consistent early or on-time payments improve your group standing and loan eligibility</li>
                            </ul>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MemberPerformance;