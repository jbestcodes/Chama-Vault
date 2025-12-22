# Jaza Nyumba API Documentation

## Base URL
- **Development**: `http://localhost:5000`
- **Production**: `https://your-production-domain.com`

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Error Responses
All endpoints return errors in this format:
```json
{
  "error": "Error message description",
  "message": "Additional details (optional)"
}
```

## 🔐 Authentication Endpoints

### Email-Based Authentication (Primary)

#### POST `/api/auth/register`
Register a new member with email verification.

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "0712345678",
  "email": "john@example.com",
  "password": "password123",
  "role": "admin",
  "group_name": "Smart Savers Chama",
  "group_type": "savings_and_loans"
}
```

**Response (201):**
```json
{
  "message": "Registration successful. Please check your email for verification code.",
  "email": "john@example.com"
}
```

#### POST `/api/auth/verify-email`
Verify email with 6-digit code sent via email.

**Request Body:**
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully",
  "token": "jwt_token_here",
  "member": {
    "_id": "member_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "0712345678",
    "role": "admin",
    "email_verified": true
  }
}
```

#### POST `/api/auth/resend-verification`
Resend email verification code.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "message": "Verification code resent to your email"
}
```

#### POST `/api/auth/login`
Login with email or phone and password.

**Request Body:**
```json
{
  "emailOrPhone": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "jwt_token_here",
  "member": {
    "_id": "member_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "0712345678",
    "role": "admin"
  }
}
```

**Error (400):**
```json
{
  "error": "Email not verified",
  "message": "Please verify your email before logging in"
}
```

#### POST `/api/auth/request-password-reset`
Request password reset via email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "message": "Password reset link sent to your email"
}
```

#### POST `/api/auth/reset-password/:token`
Reset password using token from email.

**URL Parameters:**
- `token`: Password reset token from email link

**Request Body:**
```json
{
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "message": "Password reset successful"
}
```

### SMS-Based Authentication (Legacy)

#### POST `/api/sms-auth/register`
Register a new member with phone verification.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "phone": "0712345678",
  "password": "password123",
  "group_name": "Smart Savers Chama",
  "role": "member"
}
```

**Response (201):**
```json
{
  "message": "Registration submitted. Please verify your phone number with the OTP sent to your phone.",
  "memberId": "member_id_here",
  "requiresVerification": true
}
```

#### POST `/api/sms-auth/verify-phone`
Verify phone number with OTP received via SMS.

**Request Body:**
```json
{
  "memberId": "member_id_from_registration",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "message": "Phone number verified successfully!",
  "status": "pending"
}
```

#### POST `/api/sms-auth/login`
Login with phone and password (sends OTP for verification).

**Request Body:**
```json
{
  "phone": "0712345678",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login OTP sent to your phone",
  "memberId": "member_id_here",
  "requiresOTP": true
}
```

#### POST `/api/sms-auth/verify-login`
Complete login with OTP verification.

**Request Body:**
```json
{
  "memberId": "member_id_from_login",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "token": "jwt_token_here",
  "member": {
    "id": "member_id",
    "full_name": "John Doe",
    "phone": "254712345678",
    "role": "member",
    "is_admin": false
  },
  "trialInfo": {
    "inTrial": true,
    "daysLeft": 12
  }
}
```

#### POST `/api/sms-auth/resend-verification`
Resend phone verification OTP.

**Request Body:**
```json
{
  "memberId": "member_id_here"
}
```

**Response (200):**
```json
{
  "message": "New verification code sent"
}
```

## 🤖 AI Endpoints (Requires subscription or trial)

#### GET `/api/ai/trial-status`
Check AI trial status for current user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "inTrial": true,
  "daysLeft": 8,
  "hasActiveSubscription": false,
  "message": "You have 8 days left in your AI trial period."
}
```

#### GET `/api/ai/financial-nudge`
Get personalized financial nudge message.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "nudge": "Great work John! You've saved KSh 15,000 in Smart Savers. Ready to set your first milestone? 🎯\n\n🎉 You're enjoying your AI trial! 8 days left. Subscribe to keep your AI assistant after the trial ends.",
  "trialInfo": {
    "inTrial": true,
    "daysLeft": 8
  }
}
```

#### GET `/api/ai/loan-analysis`
Get AI-powered loan eligibility analysis.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "eligibility": "Eligible",
  "maxLoanAmount": 45000,
  "recommendation": "Based on your KSh 15,000 savings, you can borrow up to KSh 45,000. Your consistent savings show financial responsibility!",
  "riskLevel": "low",
  "currentSavings": 15000
}
```

#### GET `/api/ai/savings-health`
Get savings health analysis.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "score": 85,
  "status": "Excellent",
  "summary": "Your savings pattern shows excellent consistency. You're ahead of 78% of group members!",
  "recommendations": [
    "Consider setting a milestone for KSh 50,000",
    "Your monthly average is strong - maintain the momentum"
  ]
}
```

#### POST `/api/ai/chat`
Chat with AI financial assistant.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "message": "How much can I borrow based on my savings?"
}
```

**Response (200):**
```json
{
  "response": "Based on your current savings of KSh 15,000, you can borrow up to KSh 45,000 (3x your savings). This follows your group's lending policy. Your consistent saving pattern makes you eligible for this amount at 5% monthly interest.",
  "context": "loan_inquiry"
}
```

## 💳 Subscription Endpoints

#### GET `/api/subscriptions/plans`
Get available subscription plans.

**Response (200):**
```json
{
  "plans": [
    {
      "id": "premium_monthly",
      "name": "Premium Monthly",
      "price": 10000,
      "currency": "KES",
      "interval": "monthly",
      "features": [
        "Unlimited SMS notifications",
        "AI financial assistant",
        "Advanced analytics",
        "Group invites",
        "Priority support"
      ]
    },
    {
      "id": "premium_weekly",
      "name": "Premium Weekly",
      "price": 3000,
      "currency": "KES", 
      "interval": "weekly",
      "features": [
        "Unlimited SMS notifications",
        "AI financial assistant",
        "Advanced analytics",
        "Group invites",
        "Priority support"
      ]
    }
  ]
}
```

#### POST `/api/subscriptions/subscribe`
Subscribe to a plan.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "plan": "premium_monthly",
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "paymentUrl": "https://checkout.paystack.com/xxxx",
  "reference": "subscription_ref_12345"
}
```

#### GET `/api/subscriptions/status`
Get current subscription status.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "hasActiveSubscription": true,
  "plan": "premium_monthly",
  "frequency": "monthly",
  "expiresAt": "2025-01-11T00:00:00.000Z",
  "usage": {
    "sms_sent_this_month": 25,
    "sms_limit": 1000,
    "ai_queries_this_month": 45
  }
}
```

#### GET `/api/subscriptions/my-subscription`
Get detailed subscription information.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "hasSubscription": true,
  "isActive": true,
  "planType": "premium_monthly",
  "status": "active",
  "features": {
    "sms_notifications": true,
    "ai_access": true,
    "loan_notifications": true,
    "contribution_reminders": true,
    "group_invites": true
  },
  "nextPaymentDate": "2025-01-11T00:00:00.000Z",
  "expiresAt": "2025-01-11T00:00:00.000Z",
  "usage": {
    "sms_sent_this_month": 25,
    "sms_limit": 1000
  }
}
```

## 📱 SMS Preferences Endpoints

#### GET `/api/auth/members/sms-preferences`
Get current SMS notification preferences.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "smsPreferences": {
    "contribution_reminders": true,
    "loan_updates": true,
    "repayment_reminders": true,
    "group_updates": false,
    "account_updates": true
  }
}
```

#### PUT `/api/auth/members/sms-preferences`
Update SMS notification preferences.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "smsPreferences": {
    "contribution_reminders": false,
    "loan_updates": true,
    "repayment_reminders": true,
    "group_updates": true,
    "account_updates": true
  }
}
```

**Response (200):**
```json
{
  "message": "SMS preferences updated successfully",
  "smsPreferences": {
    "contribution_reminders": false,
    "loan_updates": true,
    "repayment_reminders": true,
    "group_updates": true,
    "account_updates": true
  }
}
```

## 💰 Savings Endpoints

#### GET `/api/savings/dashboard`
Get member dashboard data.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "member": {
    "full_name": "John Doe",
    "phone": "254712345678",
    "group_name": "Smart Savers"
  },
  "total_savings": 15000,
  "rank": 3,
  "group_total_savings": 450000,
  "leaderboard": [
    {
      "name": "Top Saver",
      "total_savings": 35000,
      "rank": 1
    }
  ],
  "savingsHistory": [
    {
      "id": "savings_id",
      "amount": 2000,
      "created_at": "2025-12-01T00:00:00.000Z"
    }
  ]
}
```

#### POST `/api/savings/add`
Add a savings contribution.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "amount": 2000
}
```

**Response (201):**
```json
{
  "message": "Savings added successfully",
  "savings": {
    "id": "savings_id",
    "amount": 2000,
    "member_id": "member_id",
    "created_at": "2025-12-11T00:00:00.000Z"
  },
  "total_savings": 17000
}
```

## 🏦 Loan Endpoints

#### GET `/api/loans/my-loans`
Get member's loan history.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "loans": [
    {
      "id": "loan_id",
      "amount": 10000,
      "interest_rate": 5,
      "status": "approved",
      "application_date": "2025-12-01T00:00:00.000Z",
      "repayment_date": "2025-12-31T00:00:00.000Z",
      "total_due": 10500
    }
  ]
}
```

#### POST `/api/loans/apply`
Apply for a loan.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "amount": 15000,
  "purpose": "Business expansion",
  "repayment_period": 30
}
```

**Response (201):**
```json
{
  "message": "Loan application submitted successfully",
  "loan": {
    "id": "loan_id",
    "amount": 15000,
    "status": "pending",
    "application_date": "2025-12-11T00:00:00.000Z"
  }
}
```

## 👥 Group Endpoints

#### GET `/api/groups/members`
Get group members (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "members": [
    {
      "id": "member_id",
      "full_name": "John Doe",
      "phone": "254712345678",
      "status": "approved",
      "total_savings": 15000,
      "join_date": "2025-11-01T00:00:00.000Z"
    }
  ],
  "total_members": 25,
  "pending_approvals": 3
}
```

#### POST `/api/groups/approve-member`
Approve a pending member (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "member_id": "member_id_to_approve"
}
```

**Response (200):**
```json
{
  "message": "Member approved successfully"
}
```

## 📊 Milestones Endpoints

#### GET `/api/milestones/my-milestones`
Get member's milestones.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "milestones": [
    {
      "id": "milestone_id",
      "milestone_name": "Emergency Fund",
      "target_amount": 50000,
      "current_progress": 15000,
      "progress_percentage": 30,
      "target_date": "2026-06-01T00:00:00.000Z",
      "status": "active"
    }
  ]
}
```

#### POST `/api/milestones/create`
Create a new milestone.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "milestone_name": "Business Capital",
  "target_amount": 100000,
  "target_date": "2026-12-31"
}
```

**Response (201):**
```json
{
  "message": "Milestone created successfully",
  "milestone": {
    "id": "milestone_id",
    "milestone_name": "Business Capital",
    "target_amount": 100000,
    "current_progress": 0,
    "target_date": "2026-12-31T00:00:00.000Z"
  }
}
```

## 🔔 Notification Endpoints

#### GET `/api/notifications/my-notifications`
Get member notifications.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "notifications": [
    {
      "id": "notification_id",
      "type": "contribution_reminder",
      "message": "Your contribution is due tomorrow",
      "read": false,
      "created_at": "2025-12-11T00:00:00.000Z"
    }
  ],
  "unread_count": 3
}
```

#### PUT `/api/notifications/:id/read`
Mark notification as read.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Notification marked as read"
}
```

## 🎯 Webhook Endpoints

#### POST `/api/webhooks/paystack`
Paystack webhook for subscription events.

**Headers:** 
```
x-paystack-signature: webhook_signature_here
```

**Request Body:** (Paystack event payload)

**Response (200):**
```json
{
  "message": "Webhook processed successfully"
}
```

## 📋 Status Codes

- **200** - Success
- **201** - Created  
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden (subscription required, trial expired)
- **404** - Not Found
- **500** - Internal Server Error

## 🧪 Testing

### Using curl

**Register new member:**
```bash
curl -X POST http://localhost:5000/api/sms-auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "phone": "0712345678",
    "password": "password123",
    "group_name": "Test Group",
    "role": "member"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/sms-auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0712345678",
    "password": "password123"
  }'
```

**Get AI trial status:**
```bash
curl -X GET http://localhost:5000/api/ai/trial-status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Postman Collection

Import this collection to test all endpoints:
- Base URL: `{{base_url}}`
- Auth token: `{{auth_token}}`
- Set environment variables for easy testing

---

**Note**: Replace `YOUR_JWT_TOKEN` with actual JWT token received from login.