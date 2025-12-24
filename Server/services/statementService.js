const Member = require('../models/Member');
const Savings = require('../models/Savings');
const Loan = require('../models/Loan');
const LoanRepayment = require('../models/LoanRepayment');
const Milestone = require('../models/Milestone');
const Group = require('../models/Group');

class StatementService {
    /**
     * Generate account statement data for a member
     */
    async generateStatement(memberId) {
        try {
            const member = await Member.findById(memberId).populate('group_id');
            if (!member) {
                throw new Error('Member not found');
            }

            // Get all savings
            const savings = await Savings.find({ 
                member_id: memberId 
            }).sort({ date: -1 });

            const totalSavings = savings.reduce((sum, s) => sum + s.amount, 0);

            // Get all loans
            const loans = await Loan.find({ 
                member_id: memberId 
            }).sort({ request_date: -1 });

            const totalLoansReceived = loans
                .filter(l => l.status === 'approved')
                .reduce((sum, l) => sum + l.amount, 0);

            // Get all loan repayments
            const repayments = await LoanRepayment.find({
                member_id: memberId
            }).sort({ payment_date: -1 });

            const totalRepayments = repayments.reduce((sum, r) => sum + r.amount, 0);

            // Calculate outstanding loan balance
            const outstandingLoans = loans.filter(l => 
                l.status === 'approved' && 
                (!l.repayment_status || l.repayment_status !== 'completed')
            );

            const totalOutstanding = outstandingLoans.reduce((sum, loan) => {
                const principal = loan.amount;
                const interest = (loan.amount * loan.interest_rate) / 100;
                const totalDue = principal + interest;
                // Find repayments for this loan
                const loanRepayments = repayments.filter(r => 
                    r.loan_id && r.loan_id.toString() === loan._id.toString()
                );
                const paidAmount = loanRepayments.reduce((s, r) => s + r.amount, 0);
                return sum + (totalDue - paidAmount);
            }, 0);

            // Get milestones
            const milestones = await Milestone.find({ 
                member_id: memberId 
            }).sort({ createdAt: -1 });

            const milestoneProgress = milestones.map(m => {
                const progress = (totalSavings / m.target_amount) * 100;
                const remaining = Math.max(0, m.target_amount - totalSavings);
                return {
                    name: m.milestone_name,
                    target: m.target_amount,
                    current: totalSavings,
                    remaining: remaining,
                    progress: Math.min(100, progress),
                    target_date: m.target_date
                };
            });

            // Calculate account health score (0-100)
            let healthScore = 50; // Base score

            // Positive factors
            if (totalSavings > 0) healthScore += 15;
            if (totalSavings > 5000) healthScore += 10;
            if (savings.length > 10) healthScore += 5; // Consistent saver
            if (totalOutstanding === 0) healthScore += 20;
            if (repayments.length > 0) healthScore += 10; // Has repayment history

            // Negative factors
            if (totalOutstanding > totalSavings) healthScore -= 20;
            if (totalOutstanding > 0 && repayments.length === 0) healthScore -= 15;
            
            // Check for overdue loans
            const now = new Date();
            const overdueLoans = outstandingLoans.filter(l => 
                l.repayment_date && new Date(l.repayment_date) < now
            );
            if (overdueLoans.length > 0) healthScore -= 15;

            healthScore = Math.max(0, Math.min(100, healthScore));

            // Determine health status
            let healthStatus = 'Excellent';
            if (healthScore < 80) healthStatus = 'Good';
            if (healthScore < 60) healthStatus = 'Fair';
            if (healthScore < 40) healthStatus = 'Poor';

            return {
                member: {
                    name: member.full_name,
                    email: member.email,
                    phone: member.phone,
                    group: member.group_id?.group_name || 'N/A',
                    member_since: member.created_at
                },
                summary: {
                    total_savings: totalSavings,
                    total_loans_received: totalLoansReceived,
                    total_repayments: totalRepayments,
                    outstanding_balance: totalOutstanding,
                    active_loans: outstandingLoans.length,
                    overdue_loans: overdueLoans.length
                },
                savings: {
                    count: savings.length,
                    total: totalSavings,
                    recent: savings.slice(0, 10).map(s => ({
                        amount: s.amount,
                        date: s.date,
                        month: s.month,
                        year: s.year
                    }))
                },
                loans: {
                    count: loans.length,
                    active: outstandingLoans.length,
                    total_received: totalLoansReceived,
                    outstanding: totalOutstanding,
                    details: loans.slice(0, 10).map(l => ({
                        amount: l.amount,
                        interest_rate: l.interest_rate,
                        status: l.status,
                        request_date: l.request_date,
                        repayment_date: l.repayment_date,
                        repayment_status: l.repayment_status
                    }))
                },
                repayments: {
                    count: repayments.length,
                    total: totalRepayments,
                    recent: repayments.slice(0, 10).map(r => ({
                        amount: r.amount,
                        payment_date: r.payment_date
                    }))
                },
                milestones: {
                    count: milestones.length,
                    progress: milestoneProgress
                },
                account_health: {
                    score: healthScore,
                    status: healthStatus,
                    factors: {
                        has_savings: totalSavings > 0,
                        consistent_saver: savings.length > 10,
                        no_outstanding_debt: totalOutstanding === 0,
                        has_repayment_history: repayments.length > 0,
                        overdue_loans: overdueLoans.length
                    }
                },
                generated_at: new Date()
            };

        } catch (error) {
            console.error('Error generating statement:', error);
            throw error;
        }
    }

    /**
     * Format statement as HTML for email
     */
    formatStatementHTML(statementData) {
        const { member, summary, savings, loans, repayments, milestones, account_health, generated_at } = statementData;

        return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
        .section { margin: 20px 0; padding: 20px; background: #f9f9f9; border-radius: 8px; border-left: 4px solid #667eea; }
        .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 15px 0; }
        .summary-card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .summary-card h4 { margin: 0 0 5px 0; color: #666; font-size: 14px; }
        .summary-card .amount { font-size: 24px; font-weight: bold; color: #667eea; }
        .health-score { text-align: center; padding: 20px; }
        .health-score .score { font-size: 48px; font-weight: bold; }
        .health-excellent { color: #10b981; }
        .health-good { color: #3b82f6; }
        .health-fair { color: #f59e0b; }
        .health-poor { color: #ef4444; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #667eea; color: white; }
        .milestone-progress { background: #e5e7eb; height: 20px; border-radius: 10px; margin: 10px 0; overflow: hidden; }
        .milestone-bar { background: linear-gradient(90deg, #10b981 0%, #3b82f6 100%); height: 100%; transition: width 0.3s; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>💼 Account Statement</h1>
        <h2>${member.name}</h2>
        <p>${member.email} | ${member.phone}</p>
        <p><strong>Group:</strong> ${member.group}</p>
        <p><small>Member since: ${new Date(member.member_since).toLocaleDateString()}</small></p>
    </div>

    <div class="section">
        <h3>📊 Account Summary</h3>
        <div class="summary-grid">
            <div class="summary-card">
                <h4>Total Savings</h4>
                <div class="amount">KSh ${summary.total_savings.toLocaleString()}</div>
            </div>
            <div class="summary-card">
                <h4>Loans Received</h4>
                <div class="amount">KSh ${summary.total_loans_received.toLocaleString()}</div>
            </div>
            <div class="summary-card">
                <h4>Total Repayments</h4>
                <div class="amount">KSh ${summary.total_repayments.toLocaleString()}</div>
            </div>
            <div class="summary-card">
                <h4>Outstanding Balance</h4>
                <div class="amount" style="color: ${summary.outstanding_balance > 0 ? '#ef4444' : '#10b981'}">
                    KSh ${summary.outstanding_balance.toLocaleString()}
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <h3>💚 Account Health</h3>
        <div class="health-score">
            <div class="score health-${account_health.status.toLowerCase()}">${account_health.score}/100</div>
            <p style="font-size: 20px; margin: 10px 0;"><strong>${account_health.status}</strong></p>
        </div>
        <ul style="list-style: none; padding: 0;">
            <li>✅ Has Savings: ${account_health.factors.has_savings ? 'Yes' : 'No'}</li>
            <li>✅ Consistent Saver: ${account_health.factors.consistent_saver ? 'Yes' : 'No'}</li>
            <li>✅ No Outstanding Debt: ${account_health.factors.no_outstanding_debt ? 'Yes' : 'No'}</li>
            <li>✅ Has Repayment History: ${account_health.factors.has_repayment_history ? 'Yes' : 'No'}</li>
            <li>⚠️ Overdue Loans: ${account_health.factors.overdue_loans}</li>
        </ul>
    </div>

    ${milestones.count > 0 ? `
    <div class="section">
        <h3>🎯 Milestone Progress</h3>
        ${milestones.progress.map(m => `
            <div style="margin: 20px 0;">
                <h4>${m.name}</h4>
                <p>Target: KSh ${m.target.toLocaleString()} | Current: KSh ${m.current.toLocaleString()} | Remaining: KSh ${m.remaining.toLocaleString()}</p>
                <div class="milestone-progress">
                    <div class="milestone-bar" style="width: ${m.progress}%"></div>
                </div>
                <p style="text-align: center; margin: 5px 0;">${m.progress.toFixed(1)}% Complete</p>
                ${m.target_date ? `<p style="text-align: center; color: #666; font-size: 14px;">Target Date: ${new Date(m.target_date).toLocaleDateString()}</p>` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="section">
        <h3>💰 Recent Savings (Last 10)</h3>
        ${savings.count > 0 ? `
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Month/Year</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${savings.recent.map(s => `
                        <tr>
                            <td>${new Date(s.date).toLocaleDateString()}</td>
                            <td>${s.month}/${s.year}</td>
                            <td>KSh ${s.amount.toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p><strong>Total Savings:</strong> ${savings.count} contributions | <strong>KSh ${summary.total_savings.toLocaleString()}</strong></p>
        ` : '<p>No savings recorded yet.</p>'}
    </div>

    <div class="section">
        <h3>🏦 Loan History (Last 10)</h3>
        ${loans.count > 0 ? `
            <table>
                <thead>
                    <tr>
                        <th>Amount</th>
                        <th>Interest</th>
                        <th>Status</th>
                        <th>Request Date</th>
                        <th>Repayment Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${loans.details.map(l => `
                        <tr>
                            <td>KSh ${l.amount.toLocaleString()}</td>
                            <td>${l.interest_rate}%</td>
                            <td>${l.status}</td>
                            <td>${new Date(l.request_date).toLocaleDateString()}</td>
                            <td>${l.repayment_date ? new Date(l.repayment_date).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p><strong>Active Loans:</strong> ${loans.active} | <strong>Outstanding:</strong> KSh ${summary.outstanding_balance.toLocaleString()}</p>
        ` : '<p>No loan history.</p>'}
    </div>

    <div class="section">
        <h3>💳 Recent Repayments (Last 10)</h3>
        ${repayments.count > 0 ? `
            <table>
                <thead>
                    <tr>
                        <th>Payment Date</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${repayments.recent.map(r => `
                        <tr>
                            <td>${new Date(r.payment_date).toLocaleDateString()}</td>
                            <td>KSh ${r.amount.toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p><strong>Total Repayments:</strong> KSh ${summary.total_repayments.toLocaleString()}</p>
        ` : '<p>No repayments recorded yet.</p>'}
    </div>

    <div class="footer">
        <p>Statement generated on ${new Date(generated_at).toLocaleString()}</p>
        <p style="margin-top: 15px;">
            <strong>Jaza Nyumba</strong> - Chama Management System<br>
            This is a computer-generated statement. For inquiries, contact your group admin.
        </p>
    </div>
</body>
</html>
        `;
    }
}

module.exports = new StatementService();
