const OpenAI = require('openai');
const GroupRule = require('../models/GroupRule');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

class OpenAIService {
    // 1. LIVE SUPPORT ASSISTANT (General Questions)

    async liveSupportResponse(userQuestion) {
        try {
            const systemPrompt = `
            You are the Live Support Assistant for Jaza Nyumba. 
            Your goal is to help visitors understand how the platform works.
            Focus on: 
            - How to create or join a Chama (savings group).
            - Benefits of group savings and table banking.
            - General platform security and ease of use.
            Keep answers friendly, professional, and concise. 
            If you cannot answer a specific technical issue, direct them to /contact or support@jazanyumba.com.`;

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userQuestion }
                ],
                max_tokens: 250,
                temperature: 0.7
            });

            return response.choices[0].message.content.trim();
        } catch (error) {
            console.error('Live Support Error:', error);
            return "Hi! I'm having a bit of trouble connecting to my brain. Please try again or contact our support team directly.";
        }
    }

    
    // 2. CHATBOT (Financial Assistant for Logged-in Members)

    async chatbotResponse(userQuestion, groupId = null, context = '') {
        try {
            let customRules = '';
            if (groupId) {
                try {
                    const questionKeywords = userQuestion.toLowerCase().split(/\s+/)
                        .filter(word => word.length > 3)
                        .slice(0, 5);
                    
                    const rules = await GroupRule.getAIRules(groupId, questionKeywords);
                    if (rules && rules.length > 0) {
                        customRules = '\n\nCustom Group Rules:\n' + 
                            rules.slice(0, 5).map(rule => `- ${rule.title}: ${rule.description}`).join('\n');
                    }
                } catch (err) {
                    console.warn('Could not fetch custom rules:', err.message);
                }
            }
            
            const systemPrompt = `
            You are the Jaza Nyumba Financial Assistant. You help members manage their Chama savings and loans.
            
            MEMBER CONTEXT:
            ${context}

            GROUP RULES:
            ${customRules || 'No specific group rules set. Use general Chama best practices.'}
            
            Your tasks:
            1. Answer questions about their specific savings progress.
            2. Explain loan terms based on group rules.
            3. Provide advice on table banking (merry-go-round) operations.
            
            Be encouraging, specific to their data, and clear.`;

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userQuestion }
                ],
                max_tokens: 300,
                temperature: 0.8
            });

            return response.choices[0].message.content.trim();
        } catch (error) {
            console.error('OpenAI Financial Chatbot Error:', error);
            return "I'm sorry, I'm having trouble responding right now. Please check your dashboard or contact your group admin.";
        }
    }


    // 3. FINANCIAL NUDGE (Proactive Encouragement)

    async generateFinancialNudge(memberData) {
        try {
            const prompt = `
            Based on this Chama member's savings data:
            - Current savings: ${memberData.totalSavings || 0}
            - Weekly average: ${memberData.weeklyAverage || 0}
            - Missed weeks: ${memberData.missedWeeks || 0}
            - Group rank: ${memberData.rank || 'N/A'}
            
            Generate a personalized, encouraging financial nudge (max 50 words) to help them improve their savings habit. Be positive and specific.`;

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 80,
                temperature: 0.7
            });

            return response.choices[0].message.content.trim();
        } catch (error) {
            console.error('OpenAI Financial Nudge Error:', error);
            return "Keep up the great work! Every contribution brings you closer to your financial goals.";
        }
    }

    
    // 4. LOAN ELIGIBILITY (Returns JSON)
    
    async analyzeLoanEligibility(memberData) {
        try {
            const prompt = `
            Analyze loan eligibility for a Chama member. 
            Data: Savings: ${memberData.totalSavings}, Consistency: ${memberData.consistencyRate}%, Months: ${memberData.membershipMonths}, Active Loan: ${memberData.hasActiveLoan}.
            
            Return a JSON object:
            {
                "eligibility": "Yes" | "No" | "Conditional",
                "recommendedAmount": number,
                "advice": "string (max 60 words)"
            }`;

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                response_format: { type: "json_object" },
                messages: [{ role: "user", content: prompt }],
                max_tokens: 150,
                temperature: 0.6
            });

            const result = JSON.parse(response.choices[0].message.content);
            return {
                eligibility: result.eligibility || 'Conditional',
                recommendedAmount: result.recommendedAmount || 0,
                advice: result.advice || 'Contact admin for more details.'
            };
        } catch (error) {
            console.error('OpenAI Loan Analysis Error:', error);
            return {
                eligibility: 'Conditional',
                recommendedAmount: (memberData.totalSavings || 0) * 0.5,
                advice: 'Continue building your savings history for better loan terms.'
            };
        }
    }

    
    // 5. SAVINGS HEALTH INSIGHTS (Returns JSON)
    async generateSavingsHealthInsight(memberData, groupData) {
        try {
            const prompt = `
            Generate savings health insights:
            Member: Savings ${memberData.totalSavings}, Goal ${memberData.weeklyGoal}, Achievement ${memberData.achievementRate}%.
            Group: Avg ${groupData.groupAverage}, Member Rank ${memberData.rank}/${groupData.totalMembers}.
            
            Return a JSON object:
            {
                "score": number (0-100),
                "status": "Excellent" | "Good" | "Fair" | "Poor",
                "insights": "string (max 80 words)"
            }`;

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                response_format: { type: "json_object" },
                messages: [{ role: "user", content: prompt }],
                max_tokens: 200,
                temperature: 0.7
            });

            return JSON.parse(response.choices[0].message.content);
        } catch (error) {
            console.error('OpenAI Health Insight Error:', error);
            return {
                score: 70,
                status: 'Good',
                insights: 'Your savings are on track. Keep contributing regularly to hit your goals.'
            };
        }
    }
}

module.exports = new OpenAIService();