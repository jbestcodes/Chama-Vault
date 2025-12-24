const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireAI, checkAITrialStatus } = require('../middleware/subscription');
const Member = require('../models/Member');
const Group = require('../models/Group');
const Savings = require('../models/Savings');
const Loan = require('../models/Loan');
const Milestone = require('../models/Milestone');
const Subscription = require('../models/Subscription');
const openaiService = require('../services/openaiServices');
const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Check AI trial status (no subscription required)
router.get('/trial-status', authenticateToken, async (req, res) => {
    try {
        const memberId = req.user.id;
        const trialStatus = await checkAITrialStatus(memberId);
        
        const subscription = await Subscription.findOne({ 
            member_id: memberId,
            status: 'active'
        });

        res.json({
            ...trialStatus,
            hasActiveSubscription: !!subscription,
            message: trialStatus.inTrial 
                ? `You have ${trialStatus.daysLeft} days left in your AI trial period.`
                : subscription 
                ? 'You have full AI access with your subscription.'
                : 'Your AI trial has expired. Subscribe to continue using AI features.'
        });
    } catch (error) {
        console.error('Error checking AI trial status:', error);
        res.status(500).json({ error: 'Failed to check trial status' });
    }
});

// AI Financial Nudge endpoint (requires subscription or trial)
router.get('/financial-nudge', authenticateToken, requireAI, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Check trial status
        const trialStatus = await checkAITrialStatus(userId);
        
        // Update AI usage counter
        await updateAIUsage(userId);
        
        // Get member's data
        const member = await Member.findById(userId); // Changed from User to Member
        const savings = await Savings.find({ member_id: userId });
        const totalSavings = savings.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
        
        // Get milestone if exists
        const milestone = await Milestone.findOne({ member_id: userId }).sort({ createdAt: -1 });
        
        let nudge;
        if (totalSavings === 0) {
            nudge = `Karibu ${member.full_name}! Welcome to ${member.group_name}. You haven't started saving yet - take the first step towards financial freedom today! 🌟`;
        } else if (milestone) {
            const progress = (totalSavings / milestone.target_amount) * 100;
            const remaining = milestone.target_amount - totalSavings;
            
            // Check if milestone has a deadline and if it's approaching
            let deadlineWarning = '';
            if (milestone.target_date) {
                const deadline = new Date(milestone.target_date);
                const today = new Date();
                const daysRemaining = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
                
                if (daysRemaining > 0 && daysRemaining <= 30 && progress < 100) {
                    deadlineWarning = `\n\n⏰ Urgent: Only ${daysRemaining} days left to reach your "${milestone.milestone_name}" goal! You need to save KSh ${Math.ceil(remaining / daysRemaining).toLocaleString()} per day to make it. You can do this! 💪`;
                } else if (daysRemaining <= 0 && progress < 100) {
                    deadlineWarning = `\n\n⚠️ Your "${milestone.milestone_name}" deadline has passed. Don't give up! Adjust your deadline or push harder to complete it. Every step counts! 🎯`;
                } else if (progress >= 100) {
                    deadlineWarning = `\n\n🎉 Congratulations! You've reached your "${milestone.milestone_name}" goal! Time to celebrate and set a new challenge! 🌟`;
                }
            }
            
            nudge = `Hongera ${member.full_name}! You've saved KSh ${totalSavings.toLocaleString()} towards your "${milestone.milestone_name}" goal. You're ${progress.toFixed(1)}% there! Only KSh ${remaining.toLocaleString()} to go! 💪${deadlineWarning}`;
        } else {
            nudge = `Great work ${member.full_name}! You've saved KSh ${totalSavings.toLocaleString()} in ${member.group_name}. Ready to set your first milestone? 🎯`;
        }
        
        // Add trial info if user is in trial
        if (trialStatus.inTrial) {
            nudge += `\n\n🎉 You're enjoying your AI trial! ${trialStatus.daysLeft} days left. Subscribe to keep your AI assistant after the trial ends.`;
        }
        
        res.json({ 
            nudge,
            trialInfo: trialStatus
        });
    } catch (error) {
        console.error('Financial nudge error:', error);
        res.status(500).json({ error: 'Failed to generate financial nudge' });
    }
});

// AI Loan Analysis endpoint (requires subscription)
router.get('/loan-analysis', authenticateToken, requireAI, async (req, res) => {
    try {
        const memberId = req.user.id;
        
        // Update AI usage counter
        await updateAIUsage(memberId);
        
        // Get user's data
        const member = await Member.findById(memberId);
        const savings = await Savings.find({ member_id: memberId });
        const totalSavings = savings.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
        const activeLoan = await Loan.findOne({ member_id: memberId, status: 'active' });
        
        // Calculate eligibility
        const maxLoanAmount = totalSavings * 3; // 3x savings rule
        const hasActiveLoan = !!activeLoan;
        const meetsMinimum = totalSavings >= 500; // Minimum KSh 500 savings
        
        let eligibility, recommendation;
        
        if (hasActiveLoan) {
            eligibility = 'Not Eligible';
            recommendation = `You have an active loan of KSh ${activeLoan.total_due.toLocaleString()}. Please complete your current loan repayments before applying for a new loan.`;
        } else if (!meetsMinimum) {
            const needed = 500 - totalSavings;
            eligibility = 'Not Eligible';
            recommendation = `Build your savings first! You need KSh ${needed.toLocaleString()} more to reach the minimum KSh 500 requirement for loan eligibility.`;
        } else {
            eligibility = 'Qualified';
            recommendation = `Excellent! Based on your KSh ${totalSavings.toLocaleString()} savings in ${member.group_name}, you qualify for loans with competitive rates. Your financial discipline shows! 🏆`;
        }
        
        const analysis = {
            eligibility,
            maxAmount: hasActiveLoan ? 'KSh 0' : `KSh ${maxLoanAmount.toLocaleString()}`,
            currentSavings: `KSh ${totalSavings.toLocaleString()}`,
            recommendation
        };
        
        res.json({ analysis });
    } catch (error) {
        console.error('Loan analysis error:', error);
        res.status(500).json({ error: 'Failed to get loan analysis' });
    }
});

// AI Savings Health endpoint (requires subscription)
router.get('/savings-health', authenticateToken, requireAI, async (req, res) => {
    try {
        const memberId = req.user.id;
        
        // Update AI usage counter
        await updateAIUsage(memberId);
        
        // Get user's data
        const member = await Member.findById(memberId);
        const savings = await Savings.find({ member_id: memberId }).sort({ createdAt: -1 });
        const totalSavings = savings.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
        
        // Calculate health score based on consistency
        const recentSavings = savings.slice(0, 4); // Last 4 entries
        const hasRecentActivity = recentSavings.length > 0;
        const consistencyScore = (recentSavings.length / 4) * 100;
        
        let score, status, summary;
        
        if (totalSavings === 0) {
            score = 0;
            status = 'Getting Started';
            summary = `Welcome to your financial journey ${member.full_name}! Every expert was once a beginner. Start with small, consistent savings to build momentum! 🌱`;
        } else if (consistencyScore >= 75) {
            score = 85 + Math.random() * 10;
            status = 'Excellent';
            summary = `Outstanding work ${member.full_name}! Your consistent saving pattern of KSh ${totalSavings.toLocaleString()} shows exceptional financial discipline. You're a role model! 🌟`;
        } else if (consistencyScore >= 50) {
            score = 60 + Math.random() * 20;
            status = 'Good';
            summary = `Good progress ${member.full_name}! You've saved KSh ${totalSavings.toLocaleString()} in ${member.group_name}. Try to maintain more regular contributions to maximize your financial growth! 📈`;
        } else if (consistencyScore > 0) {
            score = 30 + Math.random() * 25;
            status = 'Needs Improvement';
            summary = `You're on the right track ${member.full_name} with KSh ${totalSavings.toLocaleString()} saved! Consider setting a weekly savings routine to boost your financial health! 💪`;
        }
        
        const health = {
            score: Math.round(score),
            status,
            summary,
            totalSavings: `KSh ${totalSavings.toLocaleString()}`,
            recentEntries: recentSavings.length,
            groupName: member.group_name
        };
        
        res.json({ health });
    } catch (error) {
        console.error('Savings health error:', error);
        res.status(500).json({ error: 'Failed to get savings health' });
    }
});

// UPDATED AI Chat endpoint with REAL OpenAI
router.post('/chat', authenticateToken, async (req, res) => {
    try {
        const { question } = req.body;
        const userId = req.user.id;
        
        console.log('💬 AI Chat request from user:', userId);
        console.log('Question:', question);
        
        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }
        
        // Get member and their group settings
        const member = await Member.findById(userId);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }
        
        const group = await Group.findById(member.group_id);
        
        // Get member's total savings
        const userSavings = await Savings.find({ member_id: userId });
        const totalSavings = userSavings.reduce((sum, saving) => sum + Number(saving.amount || 0), 0);
        
        const groupMinSavings = group?.minimum_loan_savings || 500;
        const groupInterestRate = group?.interest_rate || 5.0;
        const lowerQuestion = question.toLowerCase();

        // Get user context for personalized responses
        const activeLoan = await Loan.findOne({ member_id: userId, status: 'active' });
        const milestone = await Milestone.findOne({ member_id: userId }).sort({ createdAt: -1 });

        // Helper function to generate smart fallback responses
        const generateFallbackResponse = () => {
            let fallbackResponse = `Hi ${member.full_name}! I'm your financial assistant. `;
            
            if (lowerQuestion.includes('save') || lowerQuestion.includes('saving')) {
                fallbackResponse += `You currently have KSh ${totalSavings.toLocaleString()} saved in ${member.group_name}. `;
                if (lowerQuestion.includes('week') || lowerQuestion.includes('monthly')) {
                    fallbackResponse += `To save KSh 10,000 in a year, you need about KSh 192 per week or KSh 833 per month. Keep up the great work! 📊`;
                } else {
                    fallbackResponse += `Great progress! Keep saving consistently to reach your goals. 💪`;
                }
            } else if (lowerQuestion.includes('loan')) {
                const canBorrow = totalSavings * 3;
                if (totalSavings >= groupMinSavings) {
                    fallbackResponse += `Great news! You can borrow up to KSh ${canBorrow.toLocaleString()} (3x your savings) at ${groupInterestRate}% interest rate. 💰`;
                } else {
                    const needed = groupMinSavings - totalSavings;
                    fallbackResponse += `You need KSh ${needed.toLocaleString()} more savings to qualify for loans. Keep saving! 💪`;
                }
            } else if (lowerQuestion.includes('milestone') || lowerQuestion.includes('goal')) {
                if (milestone) {
                    const progress = (totalSavings / milestone.target_amount) * 100;
                    fallbackResponse += `Your goal "${milestone.milestone_name}" is ${progress.toFixed(1)}% complete! Target: KSh ${milestone.target_amount.toLocaleString()}. 🎯`;
                } else {
                    fallbackResponse += `You haven't set any savings goals yet. Set a milestone in your dashboard to track your progress! 🎯`;
                }
            } else if (lowerQuestion.includes('group') || lowerQuestion.includes('chama')) {
                fallbackResponse += `Your group "${member.group_name}" requires minimum KSh ${groupMinSavings.toLocaleString()} savings for loans, with ${groupInterestRate}% interest rate. 👥`;
            } else if (lowerQuestion.includes('how much') || lowerQuestion.includes('eligible')) {
                fallbackResponse += `Based on your savings of KSh ${totalSavings.toLocaleString()}, you can borrow up to KSh ${(totalSavings * 3).toLocaleString()}. ${totalSavings >= groupMinSavings ? 'You qualify for a loan! 🎉' : 'Save a bit more to unlock loan eligibility.'}`;
            } else {
                fallbackResponse += `I can help you with questions about:
• Your savings progress (You have KSh ${totalSavings.toLocaleString()})
• Loan eligibility and amounts
• Savings goals and milestones
• Your group's rules

What would you like to know? 😊`;
            }
            
            return fallbackResponse;
        };

        // Check if OpenAI is available
        if (!process.env.OPENAI_API_KEY) {
            console.warn('⚠️ OpenAI API key not configured, using fallback responses');
            return res.json({ response: generateFallbackResponse() });
        }

        // Try OpenAI, but fall back if it fails (quota, network, etc.)
        try {
            // Create rich context for OpenAI
            const userContext = `
            User Information:
            - Name: ${member.full_name}
            - Group: ${member.group_name}
            - Total Savings: KSh ${totalSavings.toLocaleString()}
            - Active Loan: ${activeLoan ? `KSh ${activeLoan.total_due.toLocaleString()} (Amount: KSh ${activeLoan.amount.toLocaleString()}, Due Date: ${activeLoan.due_date})` : 'None'}
            - Current Savings Goal: ${milestone ? `${milestone.milestone_name} - Target: KSh ${milestone.target_amount.toLocaleString()}, Progress: KSh ${totalSavings.toLocaleString()} (${((totalSavings / milestone.target_amount) * 100).toFixed(1)}%)` : 'No active goal set'}
            - Recent Activity: ${userSavings.length} savings entries recorded
            
            Group Rules:
            - Minimum savings for loan eligibility: KSh ${groupMinSavings.toLocaleString()}
            - Maximum loan amount: 3x total savings
            - Interest rate: ${groupInterestRate}% per month
            - Weekly contributions required
            - Loan repayment period: up to 12 months
            - Late payment fee: 5% of due amount
            - Membership requires 3 months consistent savings
            
            Current Date: ${new Date().toLocaleDateString()}
            `;

            // Use enhanced OpenAI service with group rules
            const aiResponse = await openaiService.chatbotResponse(
                question, 
                member.group_id, // Pass group ID for custom rules
                userContext
            );

            console.log('✅ AI response generated successfully');
            res.json({ response: aiResponse });

        } catch (openaiError) {
            // OpenAI failed (quota exceeded, network error, etc.) - use fallback
            console.warn('⚠️ OpenAI API failed, using smart fallback:', openaiError.message);
            res.json({ response: generateFallbackResponse() });
        }

    } catch (error) {
        console.error('❌ AI Chat error:', error);
        
        // Return user-friendly error with fallback
        res.json({ 
            response: "I'm sorry, I'm having trouble responding right now. But I can tell you that I can help with questions about your savings, loans, goals, and group rules. Please try asking a specific question! 😊" 
        });
    }
});

// Support Chat endpoint (no auth required, general FAQs)
router.post('/support/chat', async (req, res) => {
    try {
        const { message, chatHistory } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log('Support chat request:', message);

        // Create system prompt for general support
        const systemPrompt = `
        You are a friendly support assistant for Jaza Nyumba, a Chama (savings group) management platform in Kenya.

        Your role is to help visitors and users with:
        1. General questions about the app and its features
        2. How to get started with Chama management
        3. Basic explanations of savings groups, loans, and financial concepts
        4. Account registration and login help
        5. Subscription and pricing information
        6. Troubleshooting common issues

        Key App Features:
        - Group savings management
        - Loan tracking and repayments
        - Member performance analytics
        - AI-powered financial insights
        - SMS notifications
        - Table banking (merry-go-round)
        - Milestone tracking
        - Admin panel for group management

        Pricing:
        - Weekly subscription: KSh 30
        - Monthly subscription: KSh 100
        - Premium features include AI insights, SMS notifications, and advanced analytics

        Important Guidelines:
        - Be helpful, friendly, and patient
        - Keep responses clear and concise
        - If you can't answer something, suggest contacting support@jazanyumba.com
        - Don't provide personal financial advice
        - Direct users to create accounts or contact admins for specific group issues
        - Encourage registration for full features

        Current date: ${new Date().toLocaleDateString()}
        `;

        // Prepare messages for OpenAI
        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        // Add chat history (limit to last 10 messages for context)
        if (chatHistory && Array.isArray(chatHistory)) {
            const recentHistory = chatHistory.slice(-10);
            recentHistory.forEach(msg => {
                messages.push({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content
                });
            });
        }

        // Add current message
        messages.push({ role: 'user', content: message });

        // Call OpenAI
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            max_tokens: 300,
            temperature: 0.7
        });

        const reply = response.choices[0].message.content.trim();

        console.log('Support chat response generated');

        res.json({
            reply: reply,
            source: 'ai'
        });

    } catch (error) {
        console.error('Support chat error:', error);
        res.json({
            reply: '😔 Sorry, I\'m having trouble connecting right now. Please try again in a moment or contact support@jazanyumba.com for urgent issues.',
            source: 'error'
        });
    }
});

// Update AI usage counter
async function updateAIUsage(memberId) {
    try {
        const subscription = await Subscription.findOne({ member_id: memberId });
        if (subscription) {
            subscription.usage.ai_requests_this_month += 1;
            await subscription.save();
        }
    } catch (error) {
        console.error('Error updating AI usage:', error);
    }
}

module.exports = router;