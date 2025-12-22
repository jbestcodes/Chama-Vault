# 🏗️ Jaza Nyumba System Architecture

## 📋 Project Overview

Jaza Nyumba is a comprehensive Chama (investment group) management system built with modern web technologies. It features OTP authentication, AI-powered financial insights, subscription management, and SMS notifications.

### Key Features
- **Email Authentication** with verification codes and password reset (primary system)
- **Email-based Group Invitations** with multi-level approval workflow
- **AI Financial Assistant** with 14-day trial period
- **Subscription Management** (Monthly/Weekly plans)
- **Group Savings Management** with milestones
- **Loan & Withdrawal System**
- **Email Notifications** for all activities (contributions, loans, approvals, reminders)
- **Payment Processing** via Paystack

### Legacy Systems (Inactive)
- **SMS Authentication** (`/api/sms-auth/*` routes - deprecated, use `/api/auth/*` instead)
- **SMS Notifications** (replaced by email system via Brevo)

## 🔧 Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State Management**: React Hooks & Context
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Payment**: Paystack React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + OTP verification
- **SMS Service**: SMS Leopard API
- **AI Service**: OpenAI GPT API
- **Payment**: Paystack API
- **Scheduling**: Node-cron for automated tasks

### External Services
- **Brevo (formerly Sendinblue)**: Email verification, password reset, invitations, and all notifications
- **Paystack**: Payment processing and subscriptions
- **OpenAI**: AI financial advice and insights
- **MongoDB Atlas**: Cloud database (recommended)

### Inactive/Legacy Services
- **SMS Leopard**: SMS notifications (configured but replaced by email)
- **Africa's Talking**: SMS service (configured but inactive)

## 🏛️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React/Vite)  │◄──►│  (Express.js)   │◄──►│   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       
         │                       ▼                       
         │              ┌─────────────────┐              
         │              │ External APIs   │              
         │              │                 │              
         └──────────────┤ • Brevo (Email) │              
                        │ • SMS Leopard   │              
                        │ • Africa's Talk │              
                        │ • Paystack      │              
                        │ • OpenAI        │              
                        └─────────────────┘              
```

## 📁 Project Structure

```
Chama-Vault/
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── GroupSettings.jsx
│   │   │   ├── SMSPreferences.jsx
│   │   │   └── TrialStatus.jsx
│   │   ├── pages/              # Page components
│   │   │   ├── dashboard.jsx   # Main dashboard
│   │   │   ├── login.jsx       # OTP login flow
│   │   │   ├── register.jsx    # Registration with phone verification
│   │   │   ├── AIDashboard.jsx # AI features interface
│   │   │   └── ...
│   │   ├── assets/             # Static assets
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # App entry point
│   ├── public/                 # Public assets
│   └── package.json
│
├── Server/                     # Backend API application
│   ├── routes/                 # API route handlers
│   │   ├── auth.js             # Authentication routes
│   │   ├── authWithSMS.js      # OTP authentication
│   │   ├── ai.js               # AI feature routes
│   │   ├── subscriptions.js    # Payment/subscription handling
│   │   ├── groups.js           # Group management
│   │   ├── savings.js          # Savings operations
│   │   ├── Loans.js            # Loan management
│   │   └── ...
│   ├── models/                 # MongoDB data models
│   │   ├── Member.js           # User accounts
│   │   ├── Group.js            # Chama groups
│   │   ├── Subscription.js     # Payment subscriptions
│   │   ├── Savings.js          # Savings records
│   │   └── ...
│   ├── services/               # Business logic services
│   │   ├── brevoEmailService.js # Brevo email integration
│   │   ├── smsService.js       # SMS Leopard integration (active)
│   │   ├── smsServiceAT.js     # Africa's Talking integration (inactive)
│   │   ├── openaiServices.js   # AI service integration
│   │   ├── paystackService.js  # Payment processing
│   │   ├── reminderService.js  # Automated reminders (email-based)
│   │   └── smsTemplates.js     # SMS message templates
│   ├── middleware/             # Express middleware
│   │   ├── auth.js             # JWT authentication
│   │   └── subscription.js     # Subscription validation
│   ├── index.js                # Server entry point
│   ├── db.js                   # Database connection
│   └── package.json
│
├── README.md                   # Project overview
├── SETUP_GUIDE.md             # Setup instructions
├── API_DOCUMENTATION.md       # API reference
├── DEPLOYMENT.md              # Production deployment guide
├── SMS_TEMPLATES.md           # SMS message reference
└── ARCHITECTURE.md            # This file
```

## 🔐 Authentication Flow

### Primary Authentication (Email-based)
```
1. User Registration
   ├── Enter name, phone, email, password
   ├── Backend sends 6-digit code via email (Brevo)
   ├── User enters verification code
   ├── Email verified + Account created
   ├── JWT issued
   └── 14-day AI trial activated

2. User Login
   ├── Enter email or phone + password
   ├── Backend validates credentials
   ├── Check email verification status
   ├── JWT token issued
   └── Redirect to dashboard

3. Password Reset
   ├── Enter email address
   ├── Receive password reset link via email
   ├── Click link with secure token
   ├── Set new password
   └── Password updated
```

### Legacy Authentication (SMS-based)
```
1. User Registration (Legacy)
   ├── Enter phone number + password
   ├── Backend sends OTP via SMS
   ├── User enters OTP code
   ├── Account created + JWT issued
   └── 14-day AI trial activated

2. User Login (Legacy)
   ├── Enter phone number + password
   ├── Backend validates credentials
   ├── OTP sent via SMS
   ├── User enters OTP
   ├── JWT token issued
   └── Redirect to dashboard
```

## 💰 Subscription System

### Subscription Plans
- **Free**: Basic group management, limited features
- **Weekly**: KES 30/week - Full features + AI
- **Monthly**: KES 100/month - Full features + AI

### Trial System
- **AI Trial**: 14 days free access to AI features
- **Auto-expire**: Trial expires, AI features disabled
- **Upgrade Prompts**: Shown throughout the app

### Payment Flow
```
1. User clicks upgrade
2. Paystack payment modal opens
3. Payment processed
4. Webhook confirms payment
5. Subscription activated in database
6. AI features unlocked
```

## 🤖 AI Integration

### Features
- **Financial Insights**: Spending analysis and recommendations
- **Savings Goals**: AI-suggested targets based on group performance
- **Risk Assessment**: Loan default probability analysis
- **Budget Optimization**: Expense category recommendations

### Implementation
```javascript
// AI Service Integration
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    { role: "system", content: "You are a financial advisor for Chama groups..." },
    { role: "user", content: `Analyze this financial data: ${groupData}` }
  ]
});
```

## � Email Integration (Primary)

### Email Types (via Brevo)
- **Verification Codes**: 6-digit email verification during registration
- **Password Reset**: Secure token-based password reset links
- **Group Invitations**: Email invites with registration links and invite codes
- **Contribution Reminders**: Automated reminders for upcoming payments
- **Loan Repayment Reminders**: Payment due date notifications
- **Welcome Emails**: New member onboarding

### Email Sender Configuration
- **security@jazanyumba.online**: Verification codes, password reset
- **info@jazanyumba.online**: Reminders, welcome emails, group invitations, notifications

### Email Service Architecture
```javascript
// Brevo Email Service Pattern
class BrevoEmailService {
  async sendVerificationEmail(email, name, code) { ... }
  async sendPasswordResetEmail(email, name, resetLink) { ... }
  async sendGroupInvitationEmail(email, recipientName, groupName, inviteCode, inviterName, inviteLink) { ... }
  async sendContributionReminder(email, name, amount, dueDate) { ... }
  async sendLoanRepaymentReminder(email, name, amount, dueDate) { ... }
  async sendWelcomeEmail(email, name) { ... }
}
```

## 📱 SMS Integration (Future/Backup)

### SMS Providers
- **SMS Leopard**: Configured but not currently active
- **Africa's Talking**: Configured but not currently active

### Potential Use Cases (Future)
- **OTP Codes**: Alternative authentication method
- **Payment Reminders**: Backup notification channel
- **Group Notifications**: Urgent group announcements
- **Alerts**: Critical subscription or payment alerts

**Note:** All current notifications are sent via email. SMS services are configured but inactive pending registration/subscription with providers.

## 🗄️ Database Schema

### Key Collections

#### Members
```javascript
{
  _id: ObjectId,
  name: String,
  phone: String,
  email: String,                      // Primary identifier for login
  password: String,                   // Hashed with bcrypt
  email_verified: Boolean,            // Email verification status (required for login)
  email_verification_code: String,    // 6-digit code
  email_verification_expires: Date,   // Code expiry time
  isVerified: Boolean,                // Phone verification status (legacy)
  profilePicture: String,
  groups: [ObjectId],                 // Reference to Group._id
  role: String,                       // 'admin' | 'member'
  createdAt: Date,
  subscription: {
    isActive: Boolean,
    type: String,                     // 'monthly' | 'weekly'
    startDate: Date,
    nextBillingDate: Date
  },
  aiTrial: {
    isActive: Boolean,
    startDate: Date,
    endDate: Date
  }
}
```

#### Groups
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  rules: String,
  contributionAmount: Number,
  contributionFrequency: String,  // 'weekly' | 'monthly'
  members: [{
    memberId: ObjectId,
    role: String,                 // 'admin' | 'member'
    joinDate: Date
  }],
  totalSavings: Number,
  milestones: [Number],
  nextMeeting: {
    date: Date,
    location: String,
    agenda: String
  }
}
```

#### Subscriptions
```javascript
{
  _id: ObjectId,
  memberId: ObjectId,
  type: String,                   // 'weekly' | 'monthly'
  amount: Number,
  status: String,                 // 'active' | 'expired' | 'cancelled'
  paystackReference: String,
  startDate: Date,
  endDate: Date,
  paymentHistory: [{
    date: Date,
    amount: Number,
    reference: String,
    status: String
  }]
}
```

## 🔄 API Architecture

### REST Endpoints Structure
```
Authentication (Email-based)
├── POST /api/auth/register              # Email + phone + password registration
├── POST /api/auth/verify-email          # Email verification with 6-digit code
├── POST /api/auth/resend-verification   # Resend email verification code
├── POST /api/auth/login                 # Email/phone + password login
├── POST /api/auth/request-password-reset # Request password reset via email
├── POST /api/auth/reset-password/:token  # Reset password with token
└── POST /api/auth/logout                # Session cleanup

Authentication (SMS-based - Legacy)
├── POST /api/sms-auth/register          # Phone + password registration
├── POST /api/sms-auth/verify-phone      # SMS OTP verification
├── POST /api/sms-auth/login             # Phone + password login
├── POST /api/sms-auth/verify-login      # Login OTP verification
└── POST /api/sms-auth/logout            # Session cleanup

Groups Management
├── GET    /api/groups               # List user's groups
├── POST   /api/groups               # Create new group
├── GET    /api/groups/:id           # Get group details
├── PUT    /api/groups/:id           # Update group settings
└── DELETE /api/groups/:id           # Delete group

AI Features (Subscription Required)
├── POST /api/ai/analyze-spending    # Spending analysis
├── POST /api/ai/suggest-goals       # Savings goal suggestions
├── GET  /api/ai/insights           # General insights
└── POST /api/ai/chat               # AI chat interface

Subscriptions
├── POST /api/subscriptions/initiate # Start payment process
├── POST /api/subscriptions/webhook  # Paystack webhook
├── GET  /api/subscriptions/status   # Check subscription status
└── POST /api/subscriptions/cancel   # Cancel subscription
```

### Middleware Chain
```
Request → Rate Limiting → Authentication → Subscription Check → Route Handler
```

## 🔧 Development Workflow

### Local Development
1. **Backend**: `npm run dev` (nodemon with auto-restart)
2. **Frontend**: `npm run dev` (Vite dev server)
3. **Database**: MongoDB local or Atlas connection
4. **Testing**: Postman collection for API testing

### Code Standards
- **ES6+ JavaScript** for modern syntax
- **Async/await** for promise handling
- **Error boundaries** in React components
- **Try-catch blocks** for all async operations
- **Input validation** on both frontend and backend
- **JWT tokens** for stateless authentication

### Git Workflow
```
main branch    ──┬── feature/auth-improvements
                 ├── feature/ai-enhancements
                 ├── feature/sms-templates
                 └── hotfix/payment-bug
```

## 🚀 Deployment Architecture

### Production Environment
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Vercel)      │    │   (VPS/Railway) │    │ (MongoDB Atlas) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │              ┌─────────────────┐
         └───────────────────────┼──────────────┤ External APIs   │
                                 │              │ (SMS/Payment)   │
                                 │              └─────────────────┘
                        ┌─────────────────┐
                        │   Monitoring    │
                        │ (PM2/Docker)    │
                        └─────────────────┘
```

### Environment Configuration
- **Development**: Local MongoDB, test API keys
- **Staging**: Atlas database, test payment keys
- **Production**: Atlas cluster, live payment keys

## 🔍 Monitoring & Analytics

### Key Metrics
- **User Registrations**: Daily signup tracking
- **SMS Delivery**: Success/failure rates
- **Payment Success**: Transaction completion rates
- **AI Usage**: Feature adoption metrics
- **API Response Times**: Performance monitoring

### Error Tracking
- **Frontend**: React error boundaries
- **Backend**: Express error middleware
- **Database**: MongoDB connection monitoring
- **External APIs**: Service availability checks

## 🔒 Security Considerations

### Authentication Security
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Short expiry (24h), refresh mechanism
- **OTP Security**: 6-digit codes, 5-minute expiry
- **Rate Limiting**: Prevent brute force attacks

### API Security
- **CORS Configuration**: Restricted origins
- **Input Validation**: Joi schema validation
- **SQL Injection**: MongoDB parameterized queries
- **XSS Prevention**: Input sanitization

### Data Protection
- **Phone Numbers**: Stored with country codes
- **Financial Data**: Encrypted sensitive fields
- **API Keys**: Environment variables only
- **Webhooks**: Signature verification

---

This architecture supports a scalable, maintainable system that can handle growing user bases while maintaining security and performance standards.