# 📧 Jaza Nyumba Notification System

## Overview

Jaza Nyumba uses **email-based notifications** for all system communications via the Brevo (formerly Sendinblue) email service. SMS services are configured but inactive.

## Email Service (Brevo)

### Configuration

**Environment Variables Required:**
```env
BREVO_API_KEY=your_brevo_api_key
BREVO_SECURITY_EMAIL=security@jazanyumba.online
BREVO_INFO_EMAIL=info@jazanyumba.online
FRONTEND_URL=https://jazanyumba.online
```

### Email Senders

- **security@jazanyumba.online**: Authentication-related emails (verification codes, password reset)
- **info@jazanyumba.online**: All other notifications (reminders, approvals, invitations, group messages)

## Email Templates (12 Types)

### 1. Authentication Emails

#### Verification Email
- **Sender**: security@jazanyumba.online
- **When**: User registers new account
- **Content**: 6-digit verification code, 15-minute expiry
- **Function**: `sendVerificationEmail(email, name, code)`

#### Password Reset Email
- **Sender**: security@jazanyumba.online
- **When**: User requests password reset
- **Content**: Secure reset link with token
- **Function**: `sendPasswordResetEmail(email, name, resetLink)`

### 2. Group Invitation & Approval Emails

#### Group Invitation Email
- **Sender**: info@jazanyumba.online
- **When**: Member or admin invites new person
- **Content**: Welcome message, invite code, registration link
- **Function**: `sendGroupInvitationEmail(email, recipientName, groupName, inviteCode, inviterName, inviteLink)`

#### Pending Approval Email
- **Sender**: info@jazanyumba.online
- **When**: Member (non-admin) registers via invitation
- **Content**: Notification that approval is pending
- **Function**: `sendPendingApprovalEmail(email, memberName, groupName)`

#### Admin Approval Notification
- **Sender**: info@jazanyumba.online
- **When**: New member registers and needs admin approval
- **Content**: New member details, link to admin panel
- **Function**: `sendAdminApprovalNotification(adminEmail, adminName, groupName, memberName, memberEmail)`

#### Account Approval Email
- **Sender**: info@jazanyumba.online
- **When**: Admin approves a pending member
- **Content**: Approval confirmation, login button, feature list
- **Function**: `sendAccountApprovalEmail(email, memberName, groupName)`

#### Welcome Email
- **Sender**: info@jazanyumba.online
- **When**: Admin-invited member registers (auto-approved)
- **Content**: Welcome message, getting started guide
- **Function**: `sendWelcomeEmail(email, name, groupName)`

### 3. Reminder Emails (Automated via Cron)

#### Contribution Reminder
- **Sender**: info@jazanyumba.online
- **When**: Automated daily (Mon-Sat 9 AM)
- **Content**: Amount due, payment date, group name
- **Function**: `sendContributionReminder(email, name, amount, dueDate, groupName)`

#### Loan Repayment Reminder
- **Sender**: info@jazanyumba.online
- **When**: Automated daily (Mon-Sat 9 AM)
- **Content**: Repayment amount, due date, loan details
- **Function**: `sendLoanRepaymentReminder(email, name, amount, dueDate, groupName)`

### 4. Loan Notification Emails

#### Loan Approval Email
- **Sender**: info@jazanyumba.online
- **When**: Admin approves loan application
- **Content**: Approved amount, interest rate, next steps
- **Function**: `sendLoanApprovalEmail(email, memberName, loanAmount, interestRate, groupName)`

#### Loan Denial Email
- **Sender**: info@jazanyumba.online
- **When**: Admin denies loan application
- **Content**: Denial reason, encouragement message
- **Function**: `sendLoanDenialEmail(email, memberName, reason, groupName)`

### 5. Communication Emails

#### Bulk Group Message
- **Sender**: info@jazanyumba.online
- **When**: Admin sends group-wide message
- **Content**: Custom message from admin
- **Function**: `sendBulkGroupMessage(emails, message, groupName, recipientNames)`

## Routes Using Email Notifications

### Authentication Routes (`/api/auth/`)
- `POST /register` → Sends verification email
- `POST /verify-email` → Sends welcome or pending approval email
- `POST /request-password-reset` → Sends password reset email

### Invitation Routes (`/api/invites/`)
- `POST /send-invite` → Sends group invitation email

### Notification Routes (`/api/notifications/`)
- `POST /approve-member/:memberId` → Sends account approval email
- `POST /approve-loan/:loanId` → Sends loan approval email
- `POST /deny-loan/:loanId` → Sends loan denial email
- `POST /send-group-message/:groupId` → Sends bulk group message

### Group Routes (`/api/groups/`)
- `PUT /approve-member/:memberId` → Sends account approval email

### Automated Services
- **reminderService.js** → Runs daily Mon-Sat 9 AM
  - Sends contribution reminders to members with upcoming payments
  - Sends loan repayment reminders to members with upcoming due dates

## Multi-Level Approval System

### Admin Invitations (Auto-Approved)
1. Admin sends invitation via email
2. Recipient registers with invite code
3. System verifies invite was from admin (`invited_by.is_admin === true`)
4. Member status set to `'approved'` automatically
5. Welcome email sent immediately
6. Member can log in right away

### Member Invitations (Pending Approval)
1. Regular member sends invitation via email
2. Recipient registers with invite code
3. System verifies invite was from regular member (`invited_by.is_admin === false`)
4. Member status set to `'pending'`
5. Two emails sent:
   - Pending approval email to new member
   - Admin notification email to group admin
6. Member cannot log in until approved
7. When admin approves:
   - Status changed to `'approved'`
   - Approval email sent to member
   - Member can now log in

## Legacy SMS System (Inactive)

### Configured Services (Not Active)
- **SMS Leopard**: Configured in `smsLeopardService.js` but not in use
- **Africa's Talking**: Configured in `smsServiceAT.js` but not in use

### Deprecated Routes
- `/api/sms-auth/*` - SMS-based authentication (replaced by `/api/auth/*`)

### Backward Compatibility
- SMS preferences remain in Member model
- Frontend `SMSPreferences.jsx` component exists but is non-functional
- Subscription usage tracking includes `sms_sent_this_month` field (unused)

## Migration Checklist

✅ **Completed:**
- Email authentication system
- Email verification with 6-digit codes
- Password reset via email
- Group invitations via email
- Multi-level approval workflow
- Account approval emails
- Contribution reminder emails
- Loan repayment reminder emails
- Loan approval/denial emails
- Bulk group message emails
- Welcome emails
- Pending approval emails
- Admin notification emails

📝 **Legacy Components (Retained for Compatibility):**
- `/api/sms-auth/*` routes in server
- `authWithSMS.js` route file
- `smsService.js`, `smsLeopardService.js`, `smsServiceAT.js` service files
- SMS preferences in frontend
- `sms_notifications` field in Member model

## Testing Checklist

### Email Deliverability
- [ ] Verify Brevo API key is valid
- [ ] Confirm sender emails are verified in Brevo
- [ ] Test verification email delivery
- [ ] Test password reset email delivery
- [ ] Test invitation email delivery
- [ ] Test approval email delivery
- [ ] Test reminder email delivery
- [ ] Check spam folder if emails not received

### Multi-Level Approval
- [ ] Admin invitation → auto-approval works
- [ ] Member invitation → pending status works
- [ ] Admin receives notification of pending member
- [ ] Pending member receives pending email
- [ ] Approved member receives approval email
- [ ] Approved member can log in

### Automated Reminders
- [ ] Cron job runs Monday-Saturday at 9 AM
- [ ] Contribution reminders sent correctly
- [ ] Loan reminders sent correctly
- [ ] No reminders sent on Sunday

## Troubleshooting

### Emails Not Received
1. Check Brevo API key in `.env`
2. Verify sender email domains in Brevo dashboard
3. Check Brevo sending limits/quota
4. Review Brevo logs for failed sends
5. Check recipient spam/junk folder
6. Verify email address is correctly formatted

### Approval Workflow Issues
1. Check `invite_code` is valid in database
2. Verify `invited_by` field is populated
3. Check `is_admin` status of inviter
4. Review member `status` field ('pending' vs 'approved')
5. Ensure admin email is correct in group settings

### Reminder Service Not Working
1. Verify cron job is running (check server logs)
2. Check if day is Sunday (service skips Sunday)
3. Verify members have `email_verified: true`
4. Check contribution/loan due dates are set
5. Review reminderService.js logs for errors

## Future Enhancements

### Potential Additions
- Email templates in Brevo UI (currently in code)
- Email analytics and open/click tracking
- Scheduled message sending
- Email preference customization (frequency, types)
- Rich text formatting for group messages
- Email attachments (statements, receipts)

### SMS Reactivation (If Needed)
If SMS services are reactivated in the future:
1. Subscribe to SMS Leopard or Africa's Talking
2. Add API keys to environment variables
3. Update routes to include SMS alongside email
4. Enable SMS preferences in frontend
5. Update subscription limits for SMS usage
