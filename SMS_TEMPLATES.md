# 📊 SMS Templates Reference

This document outlines all SMS templates used in the ChamaVault system for easy management and customization.

## 🔐 Authentication Templates

### OTP Login/Registration
```
Your Chama Vault OTP code is: {otp}. Valid for 5 minutes. Do not share this code with anyone.
```

**Variables:**
- `{otp}` - 6-digit verification code

### Welcome Message
```
Welcome to Chama Vault! Your account has been created successfully. Start your 14-day AI trial today!
```

### Password Reset
```
Your Chama Vault password reset code is: {otp}. Valid for 10 minutes. If you didn't request this, please ignore.
```

**Variables:**
- `{otp}` - 6-digit reset code

## 💰 Payment & Subscription Templates

### Payment Reminder
```
Hi {name}, your monthly contribution of KES {amount} is due on {date}. Please make payment to avoid late fees.
```

**Variables:**
- `{name}` - Member name
- `{amount}` - Payment amount
- `{date}` - Due date (DD/MM/YYYY format)

### Payment Confirmation
```
Payment received! KES {amount} has been added to your {groupName} savings. New balance: KES {newBalance}. Thank you!
```

**Variables:**
- `{amount}` - Payment amount
- `{groupName}` - Chama group name
- `{newBalance}` - Updated savings balance

### Subscription Expiry Warning
```
Your Chama Vault subscription expires in {days} days. Renew now to continue using AI features and premium services.
```

**Variables:**
- `{days}` - Days until expiry

### Subscription Expired
```
Your Chama Vault subscription has expired. AI features are now disabled. Renew your subscription to reactivate premium features.
```

### Trial Expiry Warning
```
Your 14-day AI trial expires in {days} days. Subscribe now for KES 100/month to continue using AI financial advisor features.
```

**Variables:**
- `{days}` - Days until trial expiry

### Trial Expired
```
Your AI trial has expired. Subscribe for KES 100/month or KES 30/week to reactivate AI features and get personalized financial advice.
```

## 🎯 Milestone & Achievement Templates

### Milestone Achieved
```
Congratulations! Your group "{groupName}" has reached KES {amount} savings milestone! Keep up the excellent work!
```

**Variables:**
- `{groupName}` - Chama group name
- `{amount}` - Milestone amount

### Savings Goal Reached
```
Amazing! You've reached your savings goal of KES {goal}. Current balance: KES {balance}. Time to set a new goal!
```

**Variables:**
- `{goal}` - Target savings goal
- `{balance}` - Current savings balance

### Monthly Target Achieved
```
Excellent work! Your group has met this month's savings target of KES {target}. Total collected: KES {collected}.
```

**Variables:**
- `{target}` - Monthly target amount
- `{collected}` - Amount collected this month

## 👥 Group Management Templates

### Group Invitation
```
You've been invited to join "{groupName}" chama on Chama Vault. Download the app and use code {inviteCode} to join.
```

**Variables:**
- `{groupName}` - Name of the chama group
- `{inviteCode}` - Unique invitation code

### New Member Welcome
```
Welcome to {groupName}! Your contribution amount is KES {amount} due every {frequency}. Next payment due: {nextDate}.
```

**Variables:**
- `{groupName}` - Chama group name
- `{amount}` - Regular contribution amount
- `{frequency}` - Payment frequency (weekly/monthly)
- `{nextDate}` - Next payment due date

### Member Left Group
```
{memberName} has left the group {groupName}. Final balance: KES {balance}. Settlement process will be initiated.
```

**Variables:**
- `{memberName}` - Name of member who left
- `{groupName}` - Chama group name
- `{balance}` - Member's final balance

### Group Meeting Reminder
```
Reminder: {groupName} meeting scheduled for {date} at {time} at {location}. Please confirm attendance.
```

**Variables:**
- `{groupName}` - Chama group name
- `{date}` - Meeting date
- `{time}` - Meeting time
- `{location}` - Meeting location

## 💳 Loan & Withdrawal Templates

### Loan Application Submitted
```
Your loan application for KES {amount} has been submitted to {groupName}. You'll be notified once it's reviewed by group members.
```

**Variables:**
- `{amount}` - Loan amount requested
- `{groupName}` - Chama group name

### Loan Approved
```
Great news! Your loan of KES {amount} has been approved. Interest rate: {rate}%. Repayment starts {date}. Amount will be disbursed soon.
```

**Variables:**
- `{amount}` - Approved loan amount
- `{rate}` - Interest rate percentage
- `{date}` - Repayment start date

### Loan Rejected
```
Sorry, your loan application for KES {amount} was not approved by {groupName}. You can reapply after {days} days.
```

**Variables:**
- `{amount}` - Requested loan amount
- `{groupName}` - Chama group name
- `{days}` - Days before can reapply

### Loan Repayment Due
```
Loan repayment of KES {amount} is due on {date}. Outstanding balance: KES {balance}. Please make payment to avoid penalties.
```

**Variables:**
- `{amount}` - Repayment amount due
- `{date}` - Due date
- `{balance}` - Outstanding loan balance

### Withdrawal Request Submitted
```
Your withdrawal request for KES {amount} from {groupName} has been submitted. You'll be notified once processed.
```

**Variables:**
- `{amount}` - Withdrawal amount
- `{groupName}` - Chama group name

### Withdrawal Approved
```
Your withdrawal of KES {amount} from {groupName} has been approved. Amount will be processed within 24 hours.
```

**Variables:**
- `{amount}` - Withdrawal amount
- `{groupName}` - Chama group name

## 🤖 AI-Powered Templates

### AI Insights Available
```
New AI financial insights available! Based on your spending patterns, you could save KES {savingsAmount} this month. Check the app for details.
```

**Variables:**
- `{savingsAmount}` - Potential savings amount

### AI Recommendation
```
AI Tip: {tip}. This could help improve your group's financial health. Visit the AI dashboard for more insights.
```

**Variables:**
- `{tip}` - AI-generated financial tip

### Budget Alert
```
AI Budget Alert: You've spent 80% of your monthly budget. Current spend: KES {spent} of KES {budget}. Consider reviewing expenses.
```

**Variables:**
- `{spent}` - Amount spent so far
- `{budget}` - Monthly budget limit

## 🔔 System Notifications

### System Maintenance
```
Chama Vault will undergo maintenance on {date} from {startTime} to {endTime}. Services may be temporarily unavailable.
```

**Variables:**
- `{date}` - Maintenance date
- `{startTime}` - Start time
- `{endTime}` - End time

### Security Alert
```
Security Alert: New login detected from {device} in {location}. If this wasn't you, please secure your account immediately.
```

**Variables:**
- `{device}` - Device type/name
- `{location}` - Login location

### App Update Available
```
A new version of Chama Vault is available! Update now for new features and security improvements. Download from app stores.
```

## 📱 Customization Guidelines

### Template Variables
All templates support these common variables:
- `{name}` - Member's full name
- `{firstName}` - Member's first name
- `{groupName}` - Chama group name
- `{amount}` - Monetary amounts (formatted as KES X,XXX)
- `{date}` - Dates (formatted as DD/MM/YYYY)
- `{time}` - Times (formatted as HH:MM AM/PM)
- `{balance}` - Account/savings balance

### Message Length Limits
- **Single SMS**: 160 characters maximum
- **Concatenated SMS**: 1530 characters maximum (charged as multiple SMS)
- **Recommended**: Keep messages under 160 characters when possible

### Character Encoding
- Use **GSM 7-bit encoding** for standard characters
- Avoid special Unicode characters that increase SMS costs
- Emojis count as multiple characters

### Personalization Tips
1. **Use first names** when possible for personal touch
2. **Include relevant amounts** to make messages actionable
3. **Add clear call-to-actions** when needed
4. **Keep tone friendly** but professional
5. **Test templates** with real phone numbers

### Regional Considerations
- **Date format**: DD/MM/YYYY for Kenya
- **Currency**: Always show KES before amounts
- **Phone format**: +254XXXXXXXXX for Kenya
- **Time format**: 12-hour format with AM/PM
- **Language**: English (Swahili templates can be added)

### Template Management
Templates are stored in:
- **File**: `Server/services/smsTemplates.js`
- **Database**: Templates can be customized per group
- **Admin Panel**: Future feature for web-based template management

---

**Note**: All SMS sending is handled through SMS Leopard service. Ensure your account has sufficient balance for message delivery.