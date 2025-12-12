import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const TableBankingAdmin = () => {
    const [groupData, setGroupData] = useState(null);
    const [currentCycle, setCurrentCycle] = useState(null);
    const [members, setMembers] = useState([]);
    const [contributions, setContributions] = useState([]);
    const [showSetupModal, setShowSetupModal] = useState(false);
    
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
        } catch (error) {
            console.error('Failed to fetch table banking data:', error);
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
        </div>
    );
};

export default TableBankingAdmin;