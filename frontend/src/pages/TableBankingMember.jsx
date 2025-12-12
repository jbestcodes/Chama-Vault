import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const TableBankingMember = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${apiUrl}/api/table-banking/member-dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDashboardData(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPerformanceColor = (performance) => {
        switch (performance?.rating) {
            case 'excellent': return '#4caf50';
            case 'good': return '#ff9800';
            case 'poor': return '#f44336';
            default: return '#757575';
        }
    };

    const getPerformanceText = (performance) => {
        switch (performance?.rating) {
            case 'excellent': return 'Excellent Payer';
            case 'good': return 'Good Payer';
            case 'poor': return 'Needs Improvement';
            default: return 'New Member';
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-GB');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return '#4caf50';
            case 'late': return '#ff9800';
            case 'pending': return '#2196f3';
            case 'partially_paid': return '#ff5722';
            default: return '#757575';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'paid': return 'Paid';
            case 'late': return 'Late';
            case 'pending': return 'Pending';
            case 'partially_paid': return 'Partial';
            default: return 'Unknown';
        }
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Loading your table banking dashboard...</div>;
    }

    if (!dashboardData?.group || dashboardData.group.group_type !== 'table_banking') {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>Not a Table Banking Group</h2>
                <p>This group is not configured for table banking.</p>
            </div>
        );
    }

    const { group, currentCycle, memberOrder, contributions, performance, members } = dashboardData;

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
                <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>🔄 Table Banking</h1>
                <p style={{ margin: 0, opacity: 0.9 }}>{group.group_name}</p>
            </div>

            {!currentCycle ? (
                <div style={{ 
                    background: 'white',
                    border: '2px dashed #e1e5e9',
                    borderRadius: '15px',
                    padding: '40px',
                    textAlign: 'center',
                    marginBottom: '30px'
                }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>No Active Cycle</h3>
                    <p style={{ color: '#666', margin: 0 }}>
                        Wait for your admin to start a new table banking cycle.
                    </p>
                </div>
            ) : (
                <>
                    {/* Cycle Overview */}
                    <div style={{ 
                        background: 'white',
                        border: '1px solid #e1e5e9',
                        borderRadius: '15px',
                        padding: '25px',
                        marginBottom: '30px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                    }}>
                        <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>Current Cycle #{currentCycle.cycle_number}</h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '25px' }}>
                            <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                                    KSh {currentCycle.contribution_amount?.toLocaleString()}
                                </div>
                                <div style={{ color: '#666', fontSize: '14px' }}>Contribution Amount</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                                    {currentCycle.frequency}
                                </div>
                                <div style={{ color: '#666', fontSize: '14px' }}>Frequency</div>
                            </div>
                            {memberOrder && (
                                <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                                        #{memberOrder.position}
                                    </div>
                                    <div style={{ color: '#666', fontSize: '14px' }}>Your Turn</div>
                                </div>
                            )}
                        </div>

                        {memberOrder && (
                            <div style={{ 
                                background: memberOrder.position === currentCycle.current_recipient_position ? '#fff3cd' : '#f8f9fa',
                                border: memberOrder.position === currentCycle.current_recipient_position ? '2px solid #ffc107' : '1px solid #e1e5e9',
                                borderRadius: '10px',
                                padding: '20px',
                                textAlign: 'center'
                            }}>
                                {memberOrder.position === currentCycle.current_recipient_position ? (
                                    <div>
                                        <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>🎉 It's Your Turn!</h3>
                                        <p style={{ margin: 0, color: '#856404' }}>
                                            You are receiving the pooled contributions this round
                                        </p>
                                    </div>
                                ) : memberOrder.position < currentCycle.current_recipient_position ? (
                                    <div>
                                        <h3 style={{ margin: '0 0 10px 0', color: '#4caf50' }}>✅ You've Received</h3>
                                        <p style={{ margin: 0, color: '#4caf50' }}>
                                            You received KSh {memberOrder.amount_received?.toLocaleString() || 'N/A'}
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>⏳ Your Turn is Coming</h3>
                                        <p style={{ margin: 0, color: '#666' }}>
                                            You're #{memberOrder.position - currentCycle.current_recipient_position} in line
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Payment Performance */}
                    <div style={{ 
                        background: 'white',
                        border: '1px solid #e1e5e9',
                        borderRadius: '15px',
                        padding: '25px',
                        marginBottom: '30px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                    }}>
                        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Your Payment Performance</h3>
                        
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            padding: '20px',
                            background: '#f8f9fa',
                            borderRadius: '10px'
                        }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background: getPerformanceColor(performance),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '18px'
                            }}>
                                {performance?.percentage ? `${performance.percentage.toFixed(0)}%` : 'NEW'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ 
                                    fontWeight: '600', 
                                    color: getPerformanceColor(performance),
                                    marginBottom: '5px'
                                }}>
                                    {getPerformanceText(performance)}
                                </div>
                                {performance?.total > 0 && (
                                    <div style={{ fontSize: '14px', color: '#666' }}>
                                        {performance.onTimePayments} on-time payments out of {performance.total} total
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Contribution History */}
            {contributions && contributions.length > 0 && (
                <div style={{ 
                    background: 'white',
                    border: '1px solid #e1e5e9',
                    borderRadius: '15px',
                    padding: '25px',
                    marginBottom: '30px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Your Contribution History</h3>
                    
                    {contributions.slice(0, 5).map((contribution, index) => (
                        <div key={contribution._id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '15px 0',
                            borderBottom: index < contributions.length - 1 ? '1px solid #f0f0f0' : 'none'
                        }}>
                            <div>
                                <div style={{ fontWeight: '500', color: '#333' }}>
                                    KSh {contribution.expected_amount.toLocaleString()} 
                                    {contribution.status !== 'pending' && (
                                        <span style={{ color: '#666' }}>
                                            {' '}(Paid: KSh {contribution.paid_amount.toLocaleString()})
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                    Due: {formatDate(contribution.due_date)}
                                    {contribution.paid_date && (
                                        <span> • Paid: {formatDate(contribution.paid_date)}</span>
                                    )}
                                    {contribution.days_late > 0 && (
                                        <span style={{ color: '#f44336' }}> • {contribution.days_late} days late</span>
                                    )}
                                </div>
                            </div>
                            <div style={{
                                background: getStatusColor(contribution.status),
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '15px',
                                fontSize: '12px',
                                fontWeight: '500'
                            }}>
                                {getStatusText(contribution.status)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Group Members */}
            {members && members.length > 0 && (
                <div style={{ 
                    background: 'white',
                    border: '1px solid #e1e5e9',
                    borderRadius: '15px',
                    padding: '25px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Group Members</h3>
                    
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {members.map((member, index) => (
                            <div key={member._id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px 0',
                                borderBottom: index < members.length - 1 ? '1px solid #f0f0f0' : 'none'
                            }}>
                                <div>
                                    <div style={{ fontWeight: '500', color: '#333' }}>{member.full_name}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>{member.phone}</div>
                                </div>
                                {currentCycle && memberOrder && (
                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                        {(() => {
                                            const memberPos = currentCycle.member_order.find(
                                                order => order.member_id === member._id
                                            );
                                            if (!memberPos) return '';
                                            
                                            if (memberPos.has_received) return '✅ Received';
                                            if (memberPos.position === currentCycle.current_recipient_position) return '🎯 Current';
                                            return `#${memberPos.position}`;
                                        })()}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TableBankingMember;