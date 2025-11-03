const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const Member = require('../models/Member');
const Savings = require('../models/Savings');
const Loan = require('../models/Loan');
const LoanRepayment = require('../models/LoanRepayment');
const WithdrawalRequest = require('../models/WithdrawalRequest');

// Member: Request withdrawal
router.post('/request', authenticateToken, async (req, res) => {
    try {
        const { amount, reason, request_type, loan_id } = req.body;
        const member_id = req.user.id;

        // Validate input
        if (!amount || !reason || !request_type) {
            return res.status(400).json({
                success: false,
                message: 'Amount, reason, and request type are required'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0'
            });
        }

        // Check member's total savings
        const memberSavings = await Savings.find({ member_id });
        const totalSavings = memberSavings.reduce((sum, saving) => sum + Number(saving.amount || 0), 0);

        if (amount > totalSavings) {
            return res.status(400).json({
                success: false,
                message: `Insufficient savings. You have $${totalSavings.toFixed(2)} available`
            });
        }

        // If it's a loan payment, verify the loan exists and amount is valid
        if (request_type === 'loan_payment' && loan_id) {
            const loan = await Loan.findOne({
                _id: loan_id,
                member_id: member_id,
                status: { $in: ['active', 'approved'] }
            });

            if (!loan) {
                return res.status(404).json({
                    success: false,
                    message: 'Active loan not found'
                });
            }

            if (amount > loan.total_due) {
                return res.status(400).json({
                    success: false,
                    message: `Payment amount exceeds loan balance of $${loan.total_due}`
                });
            }
        }

        // Create withdrawal request
        const newRequest = new WithdrawalRequest({
            member_id,
            amount,
            reason,
            request_type,
            loan_id: loan_id || null,
            status: 'pending'
        });

        await newRequest.save();

        res.json({
            success: true,
            message: 'Withdrawal request submitted successfully. Waiting for admin approval.',
            request_id: newRequest._id
        });

    } catch (error) {
        console.error('Withdrawal request error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing withdrawal request'
        });
    }
});

// Member: Get own withdrawal history
router.get('/my-requests', authenticateToken, async (req, res) => {
    try {
        const member_id = req.user.id;

        const requests = await WithdrawalRequest.find({ member_id })
            .populate('loan_id', 'amount total_due')
            .populate('processed_by', 'full_name')
            .sort({ createdAt: -1 });

        // Format the response to match the old structure
        const formattedRequests = requests.map(request => ({
            id: request._id,
            member_id: request.member_id,
            amount: request.amount,
            reason: request.reason,
            request_type: request.request_type,
            loan_id: request.loan_id?._id,
            status: request.status,
            admin_notes: request.admin_notes,
            processed_by: request.processed_by?._id,
            created_at: request.createdAt,
            updated_at: request.updatedAt,
            loan_original_amount: request.loan_id?.amount,
            loan_remaining: request.loan_id?.total_due,
            processed_by_name: request.processed_by?.full_name
        }));

        res.json({
            success: true,
            requests: formattedRequests
        });

    } catch (error) {
        console.error('Get withdrawal requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching withdrawal requests'
        });
    }
});

// Member: Get active loans for loan payment selection
router.get('/my-loans', authenticateToken, async (req, res) => {
    try {
        const member_id = req.user.id;

        const loans = await Loan.find({
            member_id: member_id,
            status: { $in: ['active', 'approved'] },
            total_due: { $gt: 0 }
        }).sort({ due_date: 1 });

        // Format the response to calculate days until due
        const formattedLoans = loans.map(loan => {
            const daysUntilDue = loan.due_date ? Math.ceil((new Date(loan.due_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;
            return {
                id: loan._id,
                amount: loan.amount,
                total_due: loan.total_due,
                monthly_payment: loan.installment_amount,
                days_until_due: daysUntilDue
            };
        });

        res.json({
            success: true,
            loans: formattedLoans
        });

    } catch (error) {
        console.error('Get member loans error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching loans'
        });
    }
});

// Admin: Get all withdrawal requests
router.get('/admin/all', authenticateToken, isAdmin, async (req, res) => {
    try {
        const adminId = req.user.id;
        const { status } = req.query;
        
        // Get admin's group
        const admin = await Member.findById(adminId);
        const groupId = admin?.group_id;
        if (!groupId) return res.status(400).json({ error: 'No group assigned.' });

        // Find all members in the group
        const groupMembers = await Member.find({ group_id: groupId });
        const memberIds = groupMembers.map(member => member._id);

        // Build query
        let query = { member_id: { $in: memberIds } };
        if (status && status !== 'all') {
            query.status = status;
        }

        const requests = await WithdrawalRequest.find(query)
            .populate('member_id', 'full_name phone')
            .populate('loan_id', 'amount total_due')
            .populate('processed_by', 'full_name')
            .sort({ createdAt: -1 });

        // Get member savings totals
        const allSavings = await Savings.find({ member_id: { $in: memberIds } });
        const memberSavings = {};
        allSavings.forEach(saving => {
            if (!memberSavings[saving.member_id]) memberSavings[saving.member_id] = 0;
            memberSavings[saving.member_id] += Number(saving.amount || 0);
        });

        // Format the response
        const formattedRequests = requests.map(request => ({
            id: request._id,
            member_id: request.member_id._id,
            amount: request.amount,
            reason: request.reason,
            request_type: request.request_type,
            loan_id: request.loan_id?._id,
            status: request.status,
            admin_notes: request.admin_notes,
            processed_by: request.processed_by?._id,
            created_at: request.createdAt,
            updated_at: request.updatedAt,
            member_name: request.member_id.full_name,
            member_phone: request.member_id.phone,
            loan_original_amount: request.loan_id?.amount,
            loan_remaining: request.loan_id?.total_due,
            processed_by_name: request.processed_by?.full_name,
            member_total_savings: memberSavings[request.member_id._id] || 0
        }));

        res.json({
            success: true,
            requests: formattedRequests
        });

    } catch (error) {
        console.error('Get all withdrawal requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching withdrawal requests'
        });
    }
});

// Admin: Process withdrawal request
router.put('/admin/process/:requestId', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, admin_notes } = req.body;
        const admin_id = req.user.id;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be either approved or rejected'
            });
        }

        // Get the withdrawal request
        const request = await WithdrawalRequest.findOne({
            _id: requestId,
            status: 'pending'
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Pending withdrawal request not found'
            });
        }

        // Start MongoDB session for transaction
        const session = await WithdrawalRequest.startSession();
        
        try {
            await session.withTransaction(async () => {
                // Update the request status
                await WithdrawalRequest.findByIdAndUpdate(
                    requestId,
                    {
                        status,
                        admin_notes: admin_notes || null,
                        processed_by: admin_id,
                        updatedAt: new Date()
                    },
                    { session }
                );

                if (status === 'approved') {
                    // Get current week number (simplified - you can adjust this logic)
                    const currentWeek = Math.ceil((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));

                    // Deduct from savings (negative entry)
                    const withdrawalSaving = new Savings({
                        member_id: request.member_id,
                        week_number: currentWeek,
                        amount: -request.amount
                    });
                    await withdrawalSaving.save({ session });

                    // If it's a loan payment, create a repayment entry
                    if (request.request_type === 'loan_payment' && request.loan_id) {
                        // Create loan repayment entry
                        const repayment = new LoanRepayment({
                            loan_id: request.loan_id,
                            amount: request.amount,
                            paid_date: new Date(),
                            status: 'approved',
                            confirmed_at: new Date()
                        });
                        await repayment.save({ session });

                        // Update loan balance
                        const loan = await Loan.findById(request.loan_id).session(session);
                        if (loan) {
                            let newTotalDue = loan.total_due - Number(request.amount);
                            if (newTotalDue < 0) newTotalDue = 0;
                            
                            const newStatus = newTotalDue === 0 ? 'paid' : loan.status;
                            
                            await Loan.findByIdAndUpdate(
                                request.loan_id,
                                {
                                    total_due: newTotalDue,
                                    status: newStatus
                                },
                                { session }
                            );
                        }
                    }
                }
            });

            res.json({
                success: true,
                message: `Withdrawal request ${status} successfully`
            });

        } catch (error) {
            throw error;
        } finally {
            await session.endSession();
        }

    } catch (error) {
        console.error('Process withdrawal request error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing withdrawal request'
        });
    }
});

// Admin: Get withdrawal statistics
router.get('/admin/stats', authenticateToken, isAdmin, async (req, res) => {
    try {
        const adminId = req.user.id;
        
        // Get admin's group
        const admin = await Member.findById(adminId);
        const groupId = admin?.group_id;
        if (!groupId) return res.status(400).json({ error: 'No group assigned.' });

        // Find all members in the group
        const groupMembers = await Member.find({ group_id: groupId });
        const memberIds = groupMembers.map(member => member._id);

        // Get withdrawal statistics using aggregation
        const stats = await WithdrawalRequest.aggregate([
            { $match: { member_id: { $in: memberIds } } },
            {
                $group: {
                    _id: null,
                    total_requests: { $sum: 1 },
                    pending_requests: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    approved_requests: {
                        $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
                    },
                    rejected_requests: {
                        $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
                    },
                    total_approved_amount: {
                        $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$amount', 0] }
                    },
                    pending_amount: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] }
                    }
                }
            }
        ]);

        const result = stats[0] || {
            total_requests: 0,
            pending_requests: 0,
            approved_requests: 0,
            rejected_requests: 0,
            total_approved_amount: 0,
            pending_amount: 0
        };

        res.json({
            success: true,
            stats: result
        });

    } catch (error) {
        console.error('Get withdrawal stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching withdrawal statistics'
        });
    }
});

module.exports = router;