const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const openaiService = require('../services/openaiServices');
const Member = require('../models/Member');

// Support chat endpoint
router.post('/chat', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { message, chatHistory = [] } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get user info for context
        const member = await Member.findById(userId).select('full_name phone group_name role');

        // Build context for support agent
        const systemPrompt = `You are a helpful and friendly customer support agent for Chama-Vault, a table banking and group savings management application.

**Your Role:**
- Help users with account issues, features, troubleshooting, and general questions
- Be polite, professional, and empathetic
- Provide clear, step-by-step solutions
- Escalate complex technical issues to the development team

**Chama-Vault Features:**
- Savings Management: Track weekly savings, view member contributions, savings matrix
- Table Banking: Manage contributions with timing ratings (excellent/good/fair/poor)
- Loans & Repayments: Request loans, track repayments with performance ratings
- Milestones: Set savings goals with target amounts and deadlines
- AI Financial Insights: Get personalized financial advice and deadline nudges
- Group Leaderboard: View member rankings with performance ratings
- SMS Notifications: Automated reminders for payments (configurable)
- Group Settings: Admin can manage members, set rules, and configure preferences

**Subscription Plans:**
- Monthly AI Access: KES 100/month - Full AI features, SMS, leaderboard, analytics
- Weekly AI Access: KES 30/week - Basic AI features, SMS, leaderboard

**User Context:**
- Name: ${member.full_name}
- Group: ${member.group_name || 'No group'}
- Role: ${member.role === 'admin' ? 'Group Administrator' : 'Member'}

**Common Issues & Solutions:**
1. Login Issues: Check phone number format (254XXXXXXXXX), reset password if needed
2. SMS Not Received: SMS is currently disabled for testing, will be enabled in production
3. Savings Not Showing: Refresh page, check if admin has added savings for the week
4. Leaderboard Access: Requires active subscription to premium features
5. AI Chat Not Working: Works with or without subscription (fallback responses available)
6. Auto-Logout: Sessions expire after 30 minutes of inactivity for security

**Important:**
- For payment/subscription issues: Guide users to contact admin or check Paystack status
- For technical bugs: Acknowledge the issue and say "I'll report this to our technical team"
- Be concise but thorough in your responses
- Use emojis occasionally to be friendly (but don't overdo it)`;

        // Format chat history for OpenAI
        const messages = [
            { role: 'system', content: systemPrompt },
            ...chatHistory.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            })),
            { role: 'user', content: message }
        ];

        try {
            // Try OpenAI first
            const response = await openaiService.getChatCompletion(messages);
            return res.json({ reply: response, source: 'ai' });
        } catch (openaiError) {
            console.log('OpenAI error, using fallback support responses:', openaiError.message);
            
            // Fallback responses for common support queries
            const lowerMessage = message.toLowerCase();
            let fallbackReply = '';

            if (lowerMessage.includes('login') || lowerMessage.includes('sign in')) {
                fallbackReply = `Hi ${member.full_name}! 👋\n\nFor login issues:\n1. Ensure your phone number is in format 254XXXXXXXXX\n2. Check if you've registered with your group admin\n3. Try the "Forgot Password" option\n4. Contact your group admin if you're still having trouble\n\nNeed more help? Let me know! 😊`;
            } else if (lowerMessage.includes('sms') || lowerMessage.includes('notification')) {
                fallbackReply = `Regarding SMS notifications:\n\n- SMS service is currently disabled for testing purposes\n- It will be enabled in production\n- You can still use all other features normally\n- SMS reminders will notify you about payments and deadlines\n\nAnything else I can help with? 📱`;
            } else if (lowerMessage.includes('subscription') || lowerMessage.includes('payment') || lowerMessage.includes('plan')) {
                fallbackReply = `Our subscription plans:\n\n💎 Monthly AI Access - KES 100/month\n- Full AI insights with deadline nudges\n- SMS notifications\n- Group leaderboard with performance ratings\n- Advanced analytics\n- Priority support\n\n⭐ Weekly AI Access - KES 30/week\n- AI financial insights\n- SMS notifications\n- Leaderboard view\n- Basic analytics\n\nPayments are processed securely via Paystack. Need help subscribing?`;
            } else if (lowerMessage.includes('savings') || lowerMessage.includes('contribute')) {
                fallbackReply = `About savings management:\n\n- Your admin adds weekly savings for all members\n- View savings in the Savings Matrix\n- Track your progress with milestones\n- See your ranking in the group leaderboard\n- Get timing ratings for contributions (excellent/good/fair/poor)\n\nIs there a specific savings issue you need help with?`;
            } else if (lowerMessage.includes('loan')) {
                fallbackReply = `Loan & Repayment features:\n\n- Request loans through the Loans page\n- Admin reviews and approves/rejects requests\n- Track your repayments and due dates\n- Get timing ratings for repayments\n- View loan history and outstanding balances\n\nNeed help with a specific loan issue?`;
            } else if (lowerMessage.includes('leaderboard')) {
                fallbackReply = `Group Leaderboard features:\n\n- See member rankings by total savings\n- Performance ratings shown with color codes (green/yellow/orange/red)\n- Names are masked (A***) except your own\n- Top 3 members get medals 🥇🥈🥉\n- Requires active subscription to access\n\nCheck it out on your dashboard! 🏆`;
            } else if (lowerMessage.includes('admin') || lowerMessage.includes('group settings')) {
                fallbackReply = `${member.role === 'admin' ? 'As an admin, you can:' : 'Your admin can:'}\n\n- Add/remove group members\n- Record weekly savings\n- Approve loan requests\n- Set custom group rules for AI\n- Configure SMS preferences\n- Manage group settings\n\n${member.role === 'admin' ? 'Find these in Group Settings!' : 'Contact your admin for group management.'}`;
            } else {
                fallbackReply = `Hi ${member.full_name}! 👋\n\nI'm here to help with:\n- Login & account issues\n- Savings & contributions\n- Loans & repayments\n- Subscriptions & payments\n- App features & troubleshooting\n\nWhat can I help you with today? Feel free to ask specific questions!`;
            }

            return res.json({ 
                reply: fallbackReply, 
                source: 'fallback',
                note: 'AI temporarily unavailable, using support knowledge base'
            });
        }
    } catch (error) {
        console.error('Support chat error:', error);
        res.status(500).json({ 
            error: 'Support chat error',
            reply: 'Sorry, I\'m having trouble right now. Please try again in a moment or contact your group admin for urgent issues.'
        });
    }
});

module.exports = router;
