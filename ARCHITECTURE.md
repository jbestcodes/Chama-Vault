# 🏗️ ChamaVault System Architecture

## 📋 Project Overview

ChamaVault is a comprehensive Chama (investment group) management system built with modern web technologies. It features OTP authentication, AI-powered financial insights, subscription management, and SMS notifications.

### Key Features
- **OTP-based Authentication** with SMS verification
- **AI Financial Assistant** with 14-day trial period
- **Subscription Management** (Monthly/Weekly plans)
- **Group Savings Management** with milestones
- **Loan & Withdrawal System**
- **SMS Notifications** for all activities
- **Payment Processing** via Paystack

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
- **SMS Leopard**: OTP and notification delivery
- **Paystack**: Payment processing and subscriptions
- **OpenAI**: AI financial advice and insights
- **MongoDB Atlas**: Cloud database (recommended)

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
         └──────────────┤ • SMS Leopard   │              
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
│   │   ├── smsService.js       # SMS Leopard integration
│   │   ├── openaiServices.js   # AI service integration
│   │   ├── paystackService.js  # Payment processing
│   │   ├── reminderService.js  # Automated reminders
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

```
1. User Registration
   ├── Enter phone number + password
   ├── Backend sends OTP via SMS
   ├── User enters OTP code
   ├── Account created + JWT issued
   └── 14-day AI trial activated

2. User Login
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

## 📱 SMS Integration

### Message Types
- **OTP Codes**: Authentication verification
- **Payment Reminders**: Contribution due dates
- **Notifications**: Group activities and milestones
- **Alerts**: Subscription expiry, trial warnings

### SMS Service Architecture
```javascript
// SMS Service Pattern
class SMSService {
  async sendOTP(phoneNumber, otp) { ... }
  async sendPaymentReminder(member, amount, dueDate) { ... }
  async sendGroupNotification(groupMembers, message) { ... }
}
```

## 🗄️ Database Schema

### Key Collections

#### Members
```javascript
{
  _id: ObjectId,
  phoneNumber: String,    // Primary identifier
  password: String,       // Hashed
  firstName: String,
  lastName: String,
  profilePicture: String,
  isVerified: Boolean,    // Phone verification status
  groups: [ObjectId],     // Reference to Group._id
  createdAt: Date,
  subscription: {
    isActive: Boolean,
    type: String,         // 'monthly' | 'weekly'
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
Authentication
├── POST /api/auth/register          # Phone + password registration
├── POST /api/auth/verify-otp        # OTP verification
├── POST /api/auth/login             # Phone + password login
├── POST /api/auth/login-verify      # Login OTP verification
└── POST /api/auth/logout            # Session cleanup

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