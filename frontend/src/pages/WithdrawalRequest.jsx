import React, { useState, useEffect } from 'react';
import axios from 'axios';

function WithdrawalRequest() {
    const [formData, setFormData] = useState({
        amount: '',
        reason: '',
        request_type: 'cash_withdrawal',
        loan_id: ''
    });
    const [loading, setLoading] = useState(false);
    const [totalSavings, setTotalSavings] = useState(0);
    const [loans, setLoans] = useState([]);
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetchMemberData();
        fetchRequests();
        fetchLoans();
    }, []);

    const fetchMemberData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await axios.get('http://localhost:5000/api/savings/dashboard', { headers });
            setTotalSavings(response.data.totalSavings || 0);
        } catch (error) {
            console.error('Error fetching member data:', error);
        }
    };

    const fetchLoans = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/withdrawals/my-loans', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLoans(response.data.loans || []);
        } catch (error) {
            console.error('Error fetching loans:', error);
        }
    };

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/withdrawals/my-requests', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(response.data.requests || []);
        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/withdrawals/request', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Withdrawal request submitted successfully! Waiting for admin approval.');
            setFormData({
                amount: '',
                reason: '',
                request_type: 'cash_withdrawal',
                loan_id: ''
            });
            fetchRequests();
            fetchMemberData();

        } catch (error) {
            alert(error.response?.data?.message || 'Error submitting request');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            // Reset loan_id when changing request type
            if (name === 'request_type' && value === 'cash_withdrawal') {
                newData.loan_id = '';
            }
            return newData;
        });
    };

    const selectedLoan = loans.find(loan => loan.id == formData.loan_id);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-6">
            <div className="max-w-6xl mx-auto">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">💰 Withdrawal Request</h1>
                    <p className="text-gray-600 text-sm sm:text-base">Request to use your savings for withdrawal or loan payment</p>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {/* Available Savings */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6">
                        <h3 className="text-lg font-bold mb-2">💵 Available Savings</h3>
                        <p className="text-2xl sm:text-3xl font-bold">${totalSavings.toFixed(2)}</p>
                    </div>

                    {/* Active Loans */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-6">
                        <h3 className="text-lg font-bold mb-2">🏦 Active Loans</h3>
                        <p className="text-2xl sm:text-3xl font-bold">{loans.length}</p>
                        <p className="text-sm opacity-90">loans requiring payment</p>
                    </div>

                    {/* Pending Requests */}
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl p-6 sm:col-span-2 lg:col-span-1">
                        <h3 className="text-lg font-bold mb-2">⏳ Pending Requests</h3>
                        <p className="text-2xl sm:text-3xl font-bold">
                            {requests.filter(r => r.status === 'pending').length}
                        </p>
                        <p className="text-sm opacity-90">awaiting approval</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Request Form */}
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                            <span className="mr-2">📝</span> New Request
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Request Type
                                </label>
                                <select
                                    name="request_type"
                                    value={formData.request_type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                    required
                                >
                                    <option value="cash_withdrawal">💵 Cash Withdrawal</option>
                                    <option value="loan_payment">🏦 Loan Payment</option>
                                </select>
                            </div>

                            {formData.request_type === 'loan_payment' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Loan to Pay
                                    </label>
                                    {loans.length === 0 ? (
                                        <p className="text-gray-500 italic">No active loans found</p>
                                    ) : (
                                        <select
                                            name="loan_id"
                                            value={formData.loan_id}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                            required={formData.request_type === 'loan_payment'}
                                        >
                                            <option value="">Select a loan</option>
                                            {loans.map(loan => (
                                                <option key={loan.id} value={loan.id}>
                                                    Loan #{loan.id} - ${Number(loan.total_due).toFixed(2)} remaining
                                                    {loan.days_until_due !== null && (
                                                        ` (Due in ${loan.days_until_due} days)`
                                                    )}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    
                                    {selectedLoan && (
                                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                            <p className="text-sm text-blue-700">
                                                <strong>Loan Details:</strong><br/>
                                                Original: ${Number(selectedLoan.amount).toFixed(2)}<br/>
                                                Remaining: ${Number(selectedLoan.total_due).toFixed(2)}<br/>
                                                Monthly Payment: ${Number(selectedLoan.monthly_payment).toFixed(2)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount ($)
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0.01"
                                    max={formData.request_type === 'loan_payment' && selectedLoan 
                                        ? Math.min(totalSavings, selectedLoan.total_due)
                                        : totalSavings
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                    placeholder="Enter amount"
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Maximum: ${(formData.request_type === 'loan_payment' && selectedLoan 
                                        ? Math.min(totalSavings, selectedLoan.total_due)
                                        : totalSavings
                                    ).toFixed(2)}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for Request
                                </label>
                                <textarea
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                                    placeholder={formData.request_type === 'cash_withdrawal' 
                                        ? "Please explain why you need this withdrawal..." 
                                        : "Reason for loan payment (optional)..."
                                    }
                                    required={formData.request_type === 'cash_withdrawal'}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !formData.amount || (formData.request_type === 'cash_withdrawal' && !formData.reason)}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                            >
                                {loading ? 'Submitting...' : 
                                 formData.request_type === 'cash_withdrawal' ? '💸 Submit Withdrawal Request' : '💳 Submit Payment Request'
                                }
                            </button>
                        </form>
                    </div>

                    {/* Request History */}
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                            <span className="mr-2">📋</span> Request History
                        </h2>
                        
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {requests.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 text-6xl mb-4">📝</div>
                                    <p className="text-gray-500">No requests yet</p>
                                    <p className="text-gray-400 text-sm">Your withdrawal requests will appear here</p>
                                </div>
                            ) : (
                                requests.map(request => (
                                    <div key={request.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-300">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xl">
                                                    {request.request_type === 'cash_withdrawal' ? '💵' : '🏦'}
                                                </span>
                                                <span className="font-semibold text-lg">
                                                    ${Number(request.amount).toFixed(2)}
                                                </span>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {request.status === 'approved' ? '✅ APPROVED' :
                                                 request.status === 'rejected' ? '❌ REJECTED' :
                                                 '⏳ PENDING'
                                                }
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-2 text-sm">
                                            <p className="text-gray-600">
                                                <strong>Type:</strong> {request.request_type === 'cash_withdrawal' ? 'Cash Withdrawal' : 'Loan Payment'}
                                            </p>
                                            {request.reason && (
                                                <p className="text-gray-600">
                                                    <strong>Reason:</strong> {request.reason}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500">
                                                Requested: {new Date(request.created_at).toLocaleDateString()} at {new Date(request.created_at).toLocaleTimeString()}
                                            </p>
                                        </div>

                                        {request.admin_notes && (
                                            <div className="mt-3 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                                                <p className="text-sm text-gray-700">
                                                    <strong>👨‍💼 Admin Notes:</strong><br/>
                                                    {request.admin_notes}
                                                </p>
                                                {request.processed_by_name && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Processed by: {request.processed_by_name}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WithdrawalRequest;