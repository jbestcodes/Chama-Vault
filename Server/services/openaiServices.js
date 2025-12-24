const OpenAI = require('openai');
const GroupRule = require('../models/GroupRule');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

class OpenAIService {
    // Financial Nudges based on savings pattern
    async generateFinancialNudge(memberData) {
        try {
            const prompt = `
            Based on this Chama member's savings data:
            - Current savings: ${memberData.totalSavings || 0}
            - Weekly average: ${memberData.weeklyAverage || 0}
            - Missed weeks: ${memberData.missedWeeks || 0}
            - Group rank: ${memberData.rank || 'N/A'}
            
            Generate a personalized, encouraging financial nudge (max 50 words) to help them improve their savings habit. Be positive and specific.
            `;

            const response = await openai.chat.completions.create({
                model: "gpt-5-mini",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 80,
                temperature: 0.7
            });

            return response.choices[0].message.content.trim();
        } catch (error) {
            console.error('OpenAI Financial Nudge Error:', error);
            return "Keep up the great work with your savings! Every contribution counts towards your financial goals.";
        }
    }

    // Loan Eligibility and Advice
    async analyzeLoanEligibility(memberData) {
        try {
            const prompt = `
            Analyze loan eligibility for a Chama member:
            - Total savings: ${memberData.totalSavings || 0}
            - Savings consistency: ${memberData.consistencyRate || 0}%
            - Membership duration: ${memberData.membershipMonths || 0} months
            - Current loan status: ${memberData.hasActiveLoan ? 'Has active loan' : 'No active loan'}
            
            Provide: 1) Eligibility (Yes/No/Conditional) 2) Recommended loan amount 3) Brief advice (max 60 words)
            Format: "ELIGIBILITY: [status] | AMOUNT: [amount] | ADVICE: [advice]"
            `;

            const response = await openai.chat.completions.create({
                model: "gpt-5-mini",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 100,
                temperature: 0.6
            });

            const result = response.choices[0].message.content.trim();
            return this.parseLoanAnalysis(result);
        } catch (error) {
            console.error('OpenAI Loan Analysis Error:', error);
            return {
                eligibility: 'Conditional',
                recommendedAmount: memberData.totalSavings * 0.5,
                advice: 'Continue building your savings history for better loan terms.'
            };
        }
    }

    // Savings Health Insights
    async generateSavingsHealthInsight(memberData, groupData) {
        try {
            const prompt = `
            Generate savings health insights:
            Member Stats:
            - Current savings: ${memberData.totalSavings || 0}
            - Weekly goal: ${memberData.weeklyGoal || 100}
            - Achievement rate: ${memberData.achievementRate || 0}%
            
            Group Comparison:
            - Group average: ${groupData.groupAverage || 0}
            - Member rank: ${memberData.rank}/${groupData.totalMembers}
            - Top performer savings: ${groupData.topSavings || 0}
            
            Provide health score (1-100), status (Excellent/Good/Needs Improvement/Critical), and actionable insights (max 80 words).
            Format: "SCORE: [score] | STATUS: [status] | INSIGHTS: [insights]"
            `;

            const response = await openai.chat.completions.create({
                model: "gpt-5-mini",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 120,
                temperature: 0.7
            });

            const result = response.choices[0].message.content.trim();
            return this.parseHealthInsight(result);
        } catch (error) {
            console.error('OpenAI Health Insight Error:', error);
            return {
                score: 70,
                status: 'Good',
                insights: 'Your savings are on track. Consider increasing weekly contributions to reach your goals faster.'
            };
        }
    }

    // Chatbot for Savings Rules and Loan Terms
    async chatbotResponse(userQuestion, groupId = null, context = '') {
        try {
            // Get custom group rules if group ID provided
            let customRules = '';
            if (groupId) {
                try {
                    const questionKeywords = userQuestion.toLowerCase().split(/\s+/)
                        .filter(word => word.length > 3)
                        .slice(0, 5); // Limit keywords for performance
                    
                    const rules = await GroupRule.getAIRules(groupId, questionKeywords);
                    if (rules && rules.length > 0) {
                        customRules = '\n\nCustom Group Rules:\n' + 
                            rules.slice(0, 5).map(rule => `- ${rule.getAISummary ? rule.getAISummary() : `${rule.title}: ${rule.description}`}`).join('\n');
                        
                        // Mark rules as referenced
                        await Promise.all(
                            rules.slice(0, 3).map(async rule => {
                                if (rule._id) {
                                    try {
                                        const ruleDoc = await GroupRule.findById(rule._id);
                                        if (ruleDoc && ruleDoc.markReferenced) {
                                            await ruleDoc.markReferenced();
                                        }
                                    } catch (err) {
                                        console.warn('Could not mark rule as referenced:', err.message);
                                    }
                                }
                            })
                        );
                    }
                } catch (err) {
                    console.warn('Could not fetch custom rules:', err.message);
                }
            }
            
            const systemPrompt = `
            You are a helpful Jaza Nyumba financial assistant. You specialize in:
            1. Chama savings rules and regulations
            2. Loan terms and conditions
            3. Group savings best practices
            4. Financial literacy for group savings
            5. Table banking (merry-go-round) operations
            
            Default Jaza Nyumba Rules:
            - Weekly savings contributions required
            - Members can borrow up to 3x their savings
            - Loan interest rate: 2% per month (unless specified otherwise)
            - Loan repayment period: up to 12 months
            - Late payment fee: 5% of due amount
            - Membership requires consistent savings for 3 months before loan eligibility
            - Table banking cycles rotate monthly with equal contributions
            ${customRules}
            
            Answer questions clearly and helpfully. If custom group rules apply, prioritize them over default rules. Stay focused on Chama/group savings topics.
            `;

            const response = await openai.chat.completions.create({
                model: "gpt-5-nano",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `${context}\n\nQuestion: ${userQuestion}` }
                ],
                max_tokens: 250,
                temperature: 0.8
            });

            return response.choices[0].message.content.trim();
        } catch (error) {
            console.error('OpenAI Chatbot Error:', error);
            return "I'm sorry, I'm having trouble responding right now. Please try again later or contact support for assistance with savings rules and loan terms.";
        }
    }

    // Helper methods
    parseLoanAnalysis(result) {
        const parts = result.split(' | ');
        return {
            eligibility: parts[0]?.replace('ELIGIBILITY: ', '') || 'Conditional',
            recommendedAmount: parseFloat(parts[1]?.replace('AMOUNT: ', '').replace(/[^\d.]/g, '')) || 0,
            advice: parts[2]?.replace('ADVICE: ', '') || 'Continue building your savings history.'
        };
    }

    parseHealthInsight(result) {
        const parts = result.split(' | ');
        return {
            score: parseInt(parts[0]?.replace('SCORE: ', '')) || 70,
            status: parts[1]?.replace('STATUS: ', '') || 'Good',
            insights: parts[2]?.replace('INSIGHTS: ', '') || 'Keep up the good work with your savings!'
        };
    }
}

module.exports = new OpenAIService();