import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const TableBankingAdmin = () => {
    const [groupData, setGroupData] = useState(null);
    const [currentCycle, setCurrentCycle] = useState(null);
    const [members, setMembers] = useState([]);
    const [contributions, setContributions] = useState([]);
    const [showSetupModal, setShowSetupModal] = useState(false);
    
    // Timing rating features
    const [timingAnalytics, setTimingAnalytics] = useState(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedContribution, setSelectedContribution] = useState(null);
    const [ratingData, setRatingData] = useState({ timing_rating: '', rating_notes: '' });
    
    // Group rules features
    const [groupRules, setGroupRules] = useState([]);
    const [showRulesModal, setShowRulesModal] = useState(false);
    const [showAddRuleModal, setShowAddRuleModal] = useState(false);
    const [newRule, setNewRule] = useState({
        category: 'general',
        title: '',
        description: '',
        enforcement_level: 'rule',
        has_penalty: false,
        penalty_amount: '',
        penalty_description: '',
        include_in_ai_responses: true
    });
    
    // New cycle setup state
    const [newCycleData, setNewCycleData] = useState({
        contributionAmount: '',
        frequency: 'monthly',
        startDate: '',
        memberOrder: []
    });

    useEffect(() => {
        fetchTableBankingData();
    }, []);

    const fetchTableBankingData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${apiUrl}/api/table-banking/admin-dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setGroupData(response.data.group);
            setCurrentCycle(response.data.currentCycle);
            setMembers(response.data.members);
            setContributions(response.data.contributions);
            
            // Fetch timing analytics if there are contributions
            if (response.data.contributions?.length > 0) {
                fetchTimingAnalytics(response.data.group._id);
            }
            
            // Fetch group rules
            fetchGroupRules(response.data.group._id);
        } catch (error) {
            console.error('Failed to fetch table banking data:', error);
        }
    };
    
    const fetchTimingAnalytics = async (groupId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${apiUrl}/api/table-banking/timing-analytics/${groupId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTimingAnalytics(response.data.analytics);
        } catch (error) {
            console.error('Failed to fetch timing analytics:', error);
        }
    };
    
    const fetchGroupRules = async (groupId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${apiUrl}/api/group-rules/group/${groupId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGroupRules(response.data.rules);
        } catch (error) {
            console.error('Failed to fetch group rules:', error);
        }
    };

    const startNewCycle = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${apiUrl}/api/table-banking/start-cycle`, newCycleData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setShowSetupModal(false);
            fetchTableBankingData();
        } catch (error) {
            console.error('Failed to start new cycle:', error);
        }
    };
    
    const rateContribution = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${apiUrl}/api/table-banking/contributions/${selectedContribution._id}/rate-timing`, 
                ratingData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setShowRatingModal(false);
            setSelectedContribution(null);
            setRatingData({ timing_rating: '', rating_notes: '' });
            fetchTableBankingData();
        } catch (error) {
            console.error('Failed to rate contribution:', error);
            alert('Failed to rate contribution');
        }
    };
    
    const addGroupRule = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${apiUrl}/api/group-rules/create`, newRule, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setShowAddRuleModal(false);
            setNewRule({
                category: 'general',
                title: '',
                description: '',
                enforcement_level: 'rule',
                has_penalty: false,
                penalty_amount: '',
                penalty_description: '',
                include_in_ai_responses: true
            });
            fetchGroupRules(groupData._id);
        } catch (error) {
            console.error('Failed to add group rule:', error);
            alert('Failed to add group rule');
        }
    };
    
    const openRatingModal = (contribution) => {
        setSelectedContribution(contribution);
        setRatingData({ 
            timing_rating: contribution.timing_rating || '', 
            rating_notes: contribution.rating_notes || '' 
        });
        setShowRatingModal(true);
    };

    const recordContribution = async (memberId, amount, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${apiUrl}/api/table-banking/record-contribution`, {
                memberId,
                amount,
                status,
                cycleId: currentCycle._id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            fetchTableBankingData();
        } catch (error) {
            console.error('Failed to record contribution:', error);
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

    const maskPhoneNumber = (phone) => {
        if (!phone) return '';
        return phone.slice(0, 3) + '*'.repeat(phone.length - 6) + phone.slice(-3);
    };

    if (!groupData) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Loading table banking data...</div>;
    }

    if (groupData.group_type !== 'table_banking') {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>Not a Table Banking Group</h2>
                <p>This group is configured as a savings and loans group, not table banking.</p>
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
                <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>🔄 Table Banking Admin</h1>
                <p style={{ margin: 0, opacity: 0.9 }}>{groupData.group_name}</p>
            </div>

            {/* Current Cycle Status */}
            {currentCycle ? (
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
                        <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                                #{currentCycle.current_recipient_position}
                            </div>
                            <div style={{ color: '#666', fontSize: '14px' }}>Current Turn</div>
                        </div>
                    </div>

                    {/* Member Rotation Order */}
                    <h3 style={{ margin: '25px 0 15px 0', color: '#333' }}>Member Rotation Order</h3>
                    <div style={{ background: '#f8f9fa', borderRadius: '10px', padding: '20px' }}>
                        {currentCycle.member_order?.map((memberOrder, index) => {
                            const member = members.find(m => m._id === memberOrder.member_id);
                            if (!member) return null;

                            return (
                                <div key={memberOrder.member_id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 0',
                                    borderBottom: index < currentCycle.member_order.length - 1 ? '1px solid #e1e5e9' : 'none'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{
                                            width: '30px',
                                            height: '30px',
                                            borderRadius: '50%',
                                            background: memberOrder.position === currentCycle.current_recipient_position ? '#667eea' : '#ccc',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px',
                                            fontWeight: 'bold'
                                        }}>
                                            {memberOrder.position}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '500', color: '#333' }}>{member.full_name}</div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>{maskPhoneNumber(member.phone)}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {memberOrder.has_received && (
                                            <span style={{ 
                                                background: '#4caf50', 
                                                color: 'white', 
                                                padding: '4px 8px', 
                                                borderRadius: '12px', 
                                                fontSize: '12px' 
                                            }}>
                                                ✓ Received
                                            </span>
                                        )}
                                        {memberOrder.position === currentCycle.current_recipient_position && !memberOrder.has_received && (
                                            <span style={{ 
                                                background: '#ff9800', 
                                                color: 'white', 
                                                padding: '4px 8px', 
                                                borderRadius: '12px', 
                                                fontSize: '12px' 
                                            }}>
                                                Current Turn
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div style={{ 
                    background: 'white',
                    border: '2px dashed #e1e5e9',
                    borderRadius: '15px',
                    padding: '40px',
                    textAlign: 'center',
                    marginBottom: '30px'
                }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>No Active Cycle</h3>
                    <p style={{ color: '#666', marginBottom: '20px' }}>Start a new table banking cycle to begin collecting contributions.</p>
                    <button 
                        onClick={() => setShowSetupModal(true)}
                        style={{
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '500'
                        }}
                    >
                        Start New Cycle
                    </button>
                </div>
            )}

            {/* Member Performance */}
            <div style={{ 
                background: 'white',
                border: '1px solid #e1e5e9',
                borderRadius: '15px',
                padding: '25px',
                marginBottom: '30px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Member Payment Performance</h3>
                
                {members.map(member => (
                    <div key={member._id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '15px 0',
                        borderBottom: '1px solid #f0f0f0'
                    }}>
                        <div>
                            <div style={{ fontWeight: '500', color: '#333' }}>{member.full_name}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{maskPhoneNumber(member.phone)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: getPerformanceColor(member.performance),
                                display: 'inline-block',
                                marginRight: '8px'
                            }}></div>
                            <span style={{ 
                                color: getPerformanceColor(member.performance),
                                fontWeight: '500',
                                fontSize: '14px'
                            }}>
                                {member.performance?.rating || 'New'}
                            </span>
                            {member.performance?.percentage && (
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                    {member.performance.percentage.toFixed(0)}% on-time
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Timing Analytics Section */}
            {timingAnalytics && (
                <div style={{ 
                    background: 'white',
                    border: '1px solid #e1e5e9',
                    borderRadius: '15px',
                    padding: '25px',
                    marginBottom: '30px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, color: '#333' }}>⏰ Contribution Timing Analytics</h3>
                        <span style={{ fontSize: '14px', color: '#666' }}>
                            {timingAnalytics.total_rated} of {timingAnalytics.total_contributions} contributions rated
                        </span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ textAlign: 'center', padding: '15px', background: '#e8f5e8', borderRadius: '10px', border: '1px solid #4caf50' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>
                                {timingAnalytics.ratings.early.count}
                            </div>
                            <div style={{ color: '#4caf50', fontSize: '12px', fontWeight: '500' }}>
                                Early ({timingAnalytics.ratings.early.percentage.toFixed(1)}%)
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '15px', background: '#fff3cd', borderRadius: '10px', border: '1px solid #ffc107' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
                                {timingAnalytics.ratings.on_time.count}
                            </div>
                            <div style={{ color: '#ffc107', fontSize: '12px', fontWeight: '500' }}>
                                On Time ({timingAnalytics.ratings.on_time.percentage.toFixed(1)}%)
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '15px', background: '#f8d7da', borderRadius: '10px', border: '1px solid #dc3545' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                                {timingAnalytics.ratings.late.count}
                            </div>
                            <div style={{ color: '#dc3545', fontSize: '12px', fontWeight: '500' }}>
                                Late ({timingAnalytics.ratings.late.percentage.toFixed(1)}%)
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '15px', background: '#e9ecef', borderRadius: '10px', border: '1px solid #6c757d' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6c757d' }}>
                                {timingAnalytics.ratings.not_rated.count}
                            </div>
                            <div style={{ color: '#6c757d', fontSize: '12px', fontWeight: '500' }}>
                                Not Rated
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Contributions List with Rating */}
            {contributions.length > 0 && (
                <div style={{ 
                    background: 'white',
                    border: '1px solid #e1e5e9',
                    borderRadius: '15px',
                    padding: '25px',
                    marginBottom: '30px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>📊 Recent Contributions</h3>
                    
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {contributions.slice(0, 10).map((contribution, index) => {
                            const member = members.find(m => m._id === contribution.member_id);
                            const getRatingColor = (rating) => {
                                switch(rating) {
                                    case 'early': return '#4caf50';
                                    case 'on_time': return '#ffc107';
                                    case 'late': return '#dc3545';
                                    default: return '#6c757d';
                                }
                            };
                            
                            return (
                                <div key={index} style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    padding: '15px',
                                    marginBottom: '10px',
                                    background: '#f8f9fa',
                                    borderRadius: '10px',
                                    border: '1px solid #e1e5e9'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: '500', color: '#333', marginBottom: '4px' }}>
                                            {member?.full_name || 'Unknown Member'}
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#666' }}>
                                            KSh {contribution.paid_amount?.toLocaleString()} • 
                                            Due: {new Date(contribution.due_date).toLocaleDateString()}
                                            {contribution.paid_date && ` • Paid: ${new Date(contribution.paid_date).toLocaleDateString()}`}
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {contribution.timing_rating && contribution.timing_rating !== 'not_rated' ? (
                                            <span style={{
                                                background: getRatingColor(contribution.timing_rating),
                                                color: 'white',
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                textTransform: 'capitalize'
                                            }}>
                                                {contribution.timing_rating.replace('_', ' ')}
                                            </span>
                                        ) : (
                                            <span style={{
                                                background: '#e9ecef',
                                                color: '#6c757d',
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                fontSize: '12px'
                                            }}>
                                                Not Rated
                                            </span>
                                        )}
                                        
                                        <button
                                            onClick={() => openRatingModal(contribution)}
                                            style={{
                                                background: '#667eea',
                                                color: 'white',
                                                border: 'none',
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            {contribution.timing_rating && contribution.timing_rating !== 'not_rated' ? 'Edit Rating' : 'Rate'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Group Rules Section */}
            <div style={{ 
                background: 'white',
                border: '1px solid #e1e5e9',
                borderRadius: '15px',
                padding: '25px',
                marginBottom: '30px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#333' }}>📋 Group Rules & Guidelines</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => setShowAddRuleModal(true)}
                            style={{
                                background: '#28a745',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Add Rule
                        </button>
                        <button
                            onClick={() => setShowRulesModal(true)}
                            style={{
                                background: '#667eea',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            View All ({groupRules.length})
                        </button>
                    </div>
                </div>
                
                {groupRules.length > 0 ? (
                    <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {groupRules.slice(0, 3).map((rule, index) => (
                            <div key={index} style={{ 
                                padding: '15px',
                                marginBottom: '10px',
                                background: '#f8f9fa',
                                borderRadius: '10px',
                                border: '1px solid #e1e5e9'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                    <div style={{ fontWeight: '500', color: '#333' }}>{rule.title}</div>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <span style={{
                                            background: '#e9ecef',
                                            color: '#495057',
                                            padding: '2px 6px',
                                            borderRadius: '10px',
                                            fontSize: '10px',
                                            textTransform: 'capitalize'
                                        }}>
                                            {rule.category}
                                        </span>
                                        {rule.include_in_ai_responses && (
                                            <span style={{
                                                background: '#e8f5e8',
                                                color: '#4caf50',
                                                padding: '2px 6px',
                                                borderRadius: '10px',
                                                fontSize: '10px'
                                            }}>
                                                AI
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.4' }}>
                                    {rule.description.length > 100 ? rule.description.substring(0, 100) + '...' : rule.description}
                                </div>
                            </div>
                        ))}
                        {groupRules.length > 3 && (
                            <div style={{ textAlign: 'center', marginTop: '15px' }}>
                                <button
                                    onClick={() => setShowRulesModal(true)}
                                    style={{
                                        background: 'transparent',
                                        color: '#667eea',
                                        border: '1px solid #667eea',
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    View {groupRules.length - 3} more rules
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                        <p>No custom rules yet. Add rules to help AI provide better answers to members.</p>
                    </div>
                )}
            </div>

            {/* Setup Modal */}
            {showSetupModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '15px',
                        padding: '30px',
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <h3 style={{ margin: '0 0 20px 0' }}>Start New Table Banking Cycle</h3>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                Contribution Amount (KSh)
                            </label>
                            <input
                                type="number"
                                value={newCycleData.contributionAmount}
                                onChange={(e) => setNewCycleData({...newCycleData, contributionAmount: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e1e5e9',
                                    borderRadius: '8px'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                Frequency
                            </label>
                            <select
                                value={newCycleData.frequency}
                                onChange={(e) => setNewCycleData({...newCycleData, frequency: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e1e5e9',
                                    borderRadius: '8px'
                                }}
                            >
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={newCycleData.startDate}
                                onChange={(e) => setNewCycleData({...newCycleData, startDate: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e1e5e9',
                                    borderRadius: '8px'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setShowSetupModal(false)}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    border: '1px solid #e1e5e9',
                                    background: 'white',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={startNewCycle}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    border: 'none',
                                    background: '#667eea',
                                    color: 'white',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Start Cycle
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rating Modal */}
            {showRatingModal && selectedContribution && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '15px',
                        padding: '30px',
                        maxWidth: '400px',
                        width: '90%'
                    }}>
                        <h3 style={{ margin: '0 0 20px 0' }}>Rate Contribution Timing</h3>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontWeight: '500', marginBottom: '5px' }}>
                                Member: {members.find(m => m._id === selectedContribution.member_id)?.full_name}
                            </div>
                            <div style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                                Amount: KSh {selectedContribution.paid_amount?.toLocaleString()} • 
                                Due: {new Date(selectedContribution.due_date).toLocaleDateString()}
                            </div>
                        </div>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                Timing Rating
                            </label>
                            <select
                                value={ratingData.timing_rating}
                                onChange={(e) => setRatingData({...ratingData, timing_rating: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e1e5e9',
                                    borderRadius: '8px'
                                }}
                            >
                                <option value="">Select Rating</option>
                                <option value="early">Early</option>
                                <option value="on_time">On Time</option>
                                <option value="late">Late</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                Notes (Optional)
                            </label>
                            <textarea
                                value={ratingData.rating_notes}
                                onChange={(e) => setRatingData({...ratingData, rating_notes: e.target.value})}
                                placeholder="Add any notes about this contribution..."
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e1e5e9',
                                    borderRadius: '8px',
                                    minHeight: '80px',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowRatingModal(false)}
                                style={{
                                    padding: '12px 24px',
                                    border: '1px solid #e1e5e9',
                                    background: 'white',
                                    color: '#333',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={rateContribution}
                                disabled={!ratingData.timing_rating}
                                style={{
                                    padding: '12px 24px',
                                    border: 'none',
                                    background: ratingData.timing_rating ? '#667eea' : '#ccc',
                                    color: 'white',
                                    borderRadius: '8px',
                                    cursor: ratingData.timing_rating ? 'pointer' : 'not-allowed'
                                }}
                            >
                                Save Rating
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Rule Modal */}
            {showAddRuleModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '15px',
                        padding: '30px',
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <h3 style={{ margin: '0 0 20px 0' }}>Add New Group Rule</h3>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                Category
                            </label>
                            <select
                                value={newRule.category}
                                onChange={(e) => setNewRule({...newRule, category: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e1e5e9',
                                    borderRadius: '8px'
                                }}
                            >
                                <option value="general">General</option>
                                <option value="membership">Membership</option>
                                <option value="contributions">Contributions</option>
                                <option value="loans">Loans</option>
                                <option value="meetings">Meetings</option>
                                <option value="table_banking">Table Banking</option>
                                <option value="penalties">Penalties</option>
                                <option value="withdrawals">Withdrawals</option>
                                <option value="governance">Governance</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                Rule Title
                            </label>
                            <input
                                type="text"
                                value={newRule.title}
                                onChange={(e) => setNewRule({...newRule, title: e.target.value})}
                                placeholder="Enter a clear rule title..."
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e1e5e9',
                                    borderRadius: '8px'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                Rule Description
                            </label>
                            <textarea
                                value={newRule.description}
                                onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                                placeholder="Explain the rule in detail..."
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e1e5e9',
                                    borderRadius: '8px',
                                    minHeight: '100px',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="checkbox"
                                    checked={newRule.has_penalty}
                                    onChange={(e) => setNewRule({...newRule, has_penalty: e.target.checked})}
                                />
                                <span style={{ fontWeight: '500' }}>This rule has penalties</span>
                            </label>
                        </div>

                        {newRule.has_penalty && (
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                    Penalty Amount (KSh)
                                </label>
                                <input
                                    type="number"
                                    value={newRule.penalty_amount}
                                    onChange={(e) => setNewRule({...newRule, penalty_amount: e.target.value})}
                                    placeholder="Enter penalty amount..."
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #e1e5e9',
                                        borderRadius: '8px'
                                    }}
                                />
                            </div>
                        )}

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="checkbox"
                                    checked={newRule.include_in_ai_responses}
                                    onChange={(e) => setNewRule({...newRule, include_in_ai_responses: e.target.checked})}
                                />
                                <span style={{ fontWeight: '500' }}>Include in AI responses</span>
                            </label>
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                When checked, AI assistant will reference this rule when answering member questions
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowAddRuleModal(false)}
                                style={{
                                    padding: '12px 24px',
                                    border: '1px solid #e1e5e9',
                                    background: 'white',
                                    color: '#333',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addGroupRule}
                                disabled={!newRule.title || !newRule.description}
                                style={{
                                    padding: '12px 24px',
                                    border: 'none',
                                    background: (newRule.title && newRule.description) ? '#28a745' : '#ccc',
                                    color: 'white',
                                    borderRadius: '8px',
                                    cursor: (newRule.title && newRule.description) ? 'pointer' : 'not-allowed'
                                }}
                            >
                                Add Rule
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View All Rules Modal */}
            {showRulesModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '15px',
                        padding: '30px',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>All Group Rules ({groupRules.length})</h3>
                            <button
                                onClick={() => setShowRulesModal(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    color: '#666'
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                            <button
                                onClick={() => setShowAddRuleModal(true)}
                                style={{
                                    background: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Add New Rule
                            </button>
                        </div>

                        {groupRules.length > 0 ? (
                            <div>
                                {groupRules.map((rule, index) => (
                                    <div key={index} style={{ 
                                        padding: '15px',
                                        marginBottom: '15px',
                                        background: '#f8f9fa',
                                        borderRadius: '10px',
                                        border: '1px solid #e1e5e9'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                            <div style={{ fontWeight: '500', color: '#333' }}>{rule.title}</div>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <span style={{
                                                    background: '#e9ecef',
                                                    color: '#495057',
                                                    padding: '2px 6px',
                                                    borderRadius: '10px',
                                                    fontSize: '10px',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {rule.category.replace('_', ' ')}
                                                </span>
                                                {rule.include_in_ai_responses && (
                                                    <span style={{
                                                        background: '#e8f5e8',
                                                        color: '#4caf50',
                                                        padding: '2px 6px',
                                                        borderRadius: '10px',
                                                        fontSize: '10px'
                                                    }}>
                                                        AI
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.4', marginBottom: '10px' }}>
                                            {rule.description}
                                        </div>
                                        {rule.has_penalty && rule.penalty_amount && (
                                            <div style={{ 
                                                fontSize: '12px', 
                                                color: '#dc3545',
                                                background: '#f8d7da',
                                                padding: '5px 8px',
                                                borderRadius: '5px',
                                                display: 'inline-block'
                                            }}>
                                                Penalty: KSh {rule.penalty_amount}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                <p>No rules have been added yet.</p>
                                <button
                                    onClick={() => {
                                        setShowRulesModal(false);
                                        setShowAddRuleModal(true);
                                    }}
                                    style={{
                                        background: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Add First Rule
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TableBankingAdmin;