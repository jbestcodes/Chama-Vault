const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const StatementRequest = require('../models/StatementRequest');
const Member = require('../models/Member');
const statementService = require('../services/statementService');
const brevoEmailService = require('../services/brevoEmailService');
const axios = require('axios');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const STATEMENT_AMOUNT = 1000; // KSh 10 in kobo (10 * 100)

/**
 * Initialize payment for account statement
 * POST /api/statements/request
 */
router.post('/request', authenticateToken, async (req, res) => {
    try {
        const memberId = req.user.id;
        const member = await Member.findById(memberId);

        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Create statement request
        const statementRequest = new StatementRequest({
            member_id: memberId,
            amount: 10.00,
            payment_status: 'pending'
        });

        await statementRequest.save();

        // Initialize Paystack payment
        try {
            const paystackResponse = await axios.post(
                'https://api.paystack.co/transaction/initialize',
                {
                    email: member.email,
                    amount: STATEMENT_AMOUNT, // In kobo
                    currency: 'KES',
                    reference: `STMT-${statementRequest._id}`,
                    metadata: {
                        statement_request_id: statementRequest._id.toString(),
                        member_id: memberId,
                        member_name: member.full_name,
                        purpose: 'Account Statement'
                    },
                    callback_url: `${process.env.FRONTEND_URL}/my-profile?statement_payment=success`
                },
                {
                    headers: {
                        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const { authorization_url, access_code, reference } = paystackResponse.data.data;

            // Update statement request with payment reference
            statementRequest.payment_reference = reference;
            await statementRequest.save();

            res.json({
                success: true,
                message: 'Payment initialized',
                payment_url: authorization_url,
                reference: reference,
                amount: 10.00,
                statement_request_id: statementRequest._id
            });

        } catch (paystackError) {
            console.error('Paystack error:', paystackError.response?.data || paystackError.message);
            
            // Delete the statement request if payment initialization failed
            await StatementRequest.findByIdAndDelete(statementRequest._id);
            
            return res.status(500).json({ 
                error: 'Failed to initialize payment',
                details: paystackError.response?.data?.message || paystackError.message
            });
        }

    } catch (error) {
        console.error('Statement request error:', error);
        res.status(500).json({ error: 'Failed to process statement request' });
    }
});

/**
 * Verify payment and send statement
 * GET /api/statements/verify/:reference
 */
router.get('/verify/:reference', authenticateToken, async (req, res) => {
    try {
        const { reference } = req.params;
        const memberId = req.user.id;

        // Find statement request
        const statementRequest = await StatementRequest.findOne({
            payment_reference: reference,
            member_id: memberId
        });

        if (!statementRequest) {
            return res.status(404).json({ error: 'Statement request not found' });
        }

        // Check if already sent
        if (statementRequest.payment_status === 'sent') {
            return res.json({
                success: true,
                message: 'Statement already sent to your email',
                sent_at: statementRequest.statement_sent_at
            });
        }

        // Verify payment with Paystack
        try {
            const verifyResponse = await axios.get(
                `https://api.paystack.co/transaction/verify/${reference}`,
                {
                    headers: {
                        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
                    }
                }
            );

            const { status, amount, paid_at } = verifyResponse.data.data;

            if (status !== 'success') {
                statementRequest.payment_status = 'failed';
                await statementRequest.save();
                
                return res.status(400).json({ 
                    error: 'Payment verification failed',
                    status: status
                });
            }

            // Payment successful - generate and send statement
            const member = await Member.findById(memberId);
            const statementData = await statementService.generateStatement(memberId);
            const statementHTML = statementService.formatStatementHTML(statementData);

            // Send statement via email
            await brevoEmailService.sendAccountStatement(
                member.email,
                member.full_name,
                statementHTML
            );

            // Update statement request
            statementRequest.payment_status = 'sent';
            statementRequest.statement_sent_at = new Date();
            statementRequest.email_sent_to = member.email;
            await statementRequest.save();

            res.json({
                success: true,
                message: 'Statement sent successfully to your email',
                email: member.email,
                sent_at: statementRequest.statement_sent_at
            });

        } catch (paystackError) {
            console.error('Payment verification error:', paystackError.response?.data || paystackError.message);
            
            statementRequest.payment_status = 'failed';
            await statementRequest.save();
            
            return res.status(500).json({ 
                error: 'Payment verification failed',
                details: paystackError.response?.data?.message || paystackError.message
            });
        }

    } catch (error) {
        console.error('Statement verification error:', error);
        res.status(500).json({ error: 'Failed to verify and send statement' });
    }
});

/**
 * Get statement request history
 * GET /api/statements/history
 */
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const memberId = req.user.id;

        const statements = await StatementRequest.find({
            member_id: memberId
        }).sort({ request_date: -1 }).limit(10);

        res.json({
            count: statements.length,
            statements: statements.map(s => ({
                id: s._id,
                request_date: s.request_date,
                payment_status: s.payment_status,
                amount: s.amount,
                sent_at: s.statement_sent_at,
                email_sent_to: s.email_sent_to
            }))
        });

    } catch (error) {
        console.error('Error fetching statement history:', error);
        res.status(500).json({ error: 'Failed to fetch statement history' });
    }
});

/**
 * Webhook for Paystack payment notifications (optional)
 * POST /api/statements/webhook
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const hash = require('crypto')
            .createHmac('sha512', PAYSTACK_SECRET_KEY)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (hash !== req.headers['x-paystack-signature']) {
            return res.status(400).json({ error: 'Invalid signature' });
        }

        const event = req.body;

        if (event.event === 'charge.success') {
            const { reference, metadata } = event.data;
            
            if (metadata.purpose === 'Account Statement') {
                const statementRequest = await StatementRequest.findById(metadata.statement_request_id);
                
                if (statementRequest && statementRequest.payment_status === 'pending') {
                    // Generate and send statement
                    const member = await Member.findById(metadata.member_id);
                    const statementData = await statementService.generateStatement(metadata.member_id);
                    const statementHTML = statementService.formatStatementHTML(statementData);

                    await brevoEmailService.sendAccountStatement(
                        member.email,
                        member.full_name,
                        statementHTML
                    );

                    statementRequest.payment_status = 'sent';
                    statementRequest.statement_sent_at = new Date();
                    statementRequest.email_sent_to = member.email;
                    await statementRequest.save();

                    console.log(`✅ Statement sent via webhook for ${member.email}`);
                }
            }
        }

        res.status(200).send('Webhook received');

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).send('Webhook processing failed');
    }
});

module.exports = router;
