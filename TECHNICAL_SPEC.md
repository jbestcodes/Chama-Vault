# 📋 Jaza Nyumba Technical Specification

## 🎯 Project Scope

Jaza Nyumba is a comprehensive digital platform for Chama (investment group) management in Kenya, featuring secure authentication, payment processing, AI-powered insights, and automated SMS/Email communications.

### Target Market
- **Primary**: Kenyan Chama groups (5-50 members)
- **Secondary**: Small investment clubs and savings groups
- **Geographic Focus**: Kenya (with SMS Leopard and Paystack integration)

### Business Model
- **Freemium**: Basic features free, premium AI features subscription-based
- **Subscription Plans**: KES 100/month or KES 30/week per group
- **Trial Period**: 14-day free AI features trial

## 🏗️ System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  React Frontend (Vite) - Responsive Web Application            │
│  • Authentication UI with OTP flow                             │
│  • Group management dashboard                                  │
│  • AI insights interface                                       │
│  • Payment integration                                         │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ HTTPS/REST API
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  Node.js/Express Backend API Server                            │
│  • JWT Authentication + OTP verification                       │
│  • Business logic for group operations                         │
│  • Payment webhook handling                                    │
│  • AI service integration                                      │
│  • SMS notification system                                     │
└─────────┬───────────────────┬───────────────────┬───────────────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   DATA LAYER    │  │ EXTERNAL APIs   │  │    STORAGE      │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ MongoDB Atlas   │  │ • SMS Leopard   │  │ • File uploads  │
│ • User data     │  │ • Paystack      │  │ • Profile pics  │
│ • Group data    │  │ • OpenAI GPT    │  │ • Documents     │
│ • Transactions  │  │ • Webhooks      │  │ • Logs          │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Technology Stack

#### Frontend Stack
```javascript
{
  "framework": "React 18",
  "buildTool": "Vite",
  "styling": "Tailwind CSS",
  "stateManagement": "React Context + Hooks",
  "routing": "React Router DOM v6",
  "httpClient": "Axios",
  "formHandling": "Native React state",
  "payments": "Paystack React",
  "deployment": "Vercel/Netlify"
}
```

#### Backend Stack
```javascript
{
  "runtime": "Node.js 18+",
  "framework": "Express.js",
  "database": "MongoDB with Mongoose ODM",
  "authentication": "JWT + bcrypt",
  "validation": "Joi",
  "scheduling": "node-cron",
  "fileUpload": "multer",
  "cors": "cors middleware",
  "rateLimiting": "express-rate-limit",
  "deployment": "PM2 on VPS/Railway"
}
```

#### External Integrations
```javascript
{
  "sms": "SMS Leopard API",
  "payments": "Paystack API v1",
  "ai": "OpenAI GPT-4 API",
  "database": "MongoDB Atlas",
  "storage": "Local filesystem/Cloud Storage",
  "monitoring": "Custom logging + PM2"
}
```

## 🔐 Security Architecture

### Authentication Flow
```
1. Registration Process:
   User Input → Phone Validation → Password Creation → OTP Generation
   → SMS Delivery → OTP Verification → Account Creation → JWT Issuance

2. Login Process:  
   Credentials → Validation → OTP Generation → SMS Delivery 
   → OTP Verification → JWT Issuance → Session Start

3. Protected Routes:
   Request → JWT Validation → User Context → Route Access
```

### Security Measures
```javascript
{
  "passwordSecurity": {
    "hashing": "bcrypt",
    "saltRounds": 12,
    "minLength": 8,
    "requirements": "uppercase + lowercase + number"
  },
  "jwtSecurity": {
    "algorithm": "HS256",
    "expiry": "24 hours",
    "refreshTokens": "Not implemented (future feature)",
    "storage": "localStorage (frontend), memory (backend)"
  },
  "otpSecurity": {
    "length": 6,
    "expiry": "5 minutes for login, 10 minutes for registration",
    "attempts": "Maximum 3 attempts",
    "cooldown": "5 minutes after 3 failed attempts"
  },
  "apiSecurity": {
    "rateLimiting": "100 requests per 15 minutes per IP",
    "cors": "Configured for specific origins",
    "validation": "Joi schema validation for all inputs",
    "sqlInjection": "MongoDB parameterized queries",
    "xss": "Input sanitization on frontend and backend"
  }
}
```

## 📊 Database Design

### Database Schema

#### Members Collection
```javascript
{
  _id: ObjectId,
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    match: /^\+254\d{9}$/  // Kenyan phone format
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  firstName: String,
  lastName: String,
  profilePicture: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  groups: [{
    groupId: ObjectId,
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    joinDate: {
      type: Date,
      default: Date.now
    }
  }],
  subscription: {
    isActive: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['weekly', 'monthly']
    },
    startDate: Date,
    endDate: Date,
    paystackCustomerCode: String
  },
  aiTrial: {
    isActive: {
      type: Boolean,
      default: true
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date
  },
  smsPreferences: {
    paymentReminders: {
      type: Boolean,
      default: true
    },
    groupNotifications: {
      type: Boolean,
      default: true
    },
    aiInsights: {
      type: Boolean,
      default: true
    },
    milestoneAlerts: {
      type: Boolean,
      default: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
}
```

#### Groups Collection
```javascript
{
  _id: ObjectId,
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  rules: {
    type: String,
    maxlength: 1000
  },
  contributionAmount: {
    type: Number,
    required: true,
    min: 100  // Minimum KES 100
  },
  contributionFrequency: {
    type: String,
    enum: ['weekly', 'monthly'],
    required: true
  },
  members: [{
    memberId: ObjectId,
    role: {
      type: String,
      enum: ['admin', 'member']
    },
    joinDate: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  totalSavings: {
    type: Number,
    default: 0
  },
  milestones: [{
    amount: Number,
    achievedDate: Date,
    isAchieved: {
      type: Boolean,
      default: false
    }
  }],
  nextMeeting: {
    date: Date,
    location: String,
    agenda: String
  },
  settings: {
    allowLoans: {
      type: Boolean,
      default: true
    },
    maxLoanMultiplier: {
      type: Number,
      default: 3  // 3x member savings
    },
    loanInterestRate: {
      type: Number,
      default: 10  // 10% per year
    },
    latePenaltyRate: {
      type: Number,
      default: 5  // 5% of late amount
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

#### Savings Collection
```javascript
{
  _id: ObjectId,
  memberId: ObjectId,
  groupId: ObjectId,
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['contribution', 'penalty', 'interest', 'bonus'],
    default: 'contribution'
  },
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'bank', 'cash', 'paystack'],
    default: 'cash'
  },
  transactionReference: String,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: ObjectId,  // Who recorded this saving
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: ObjectId,
  verifiedAt: Date
}
```

#### Loans Collection
```javascript
{
  _id: ObjectId,
  borrowerId: ObjectId,
  groupId: ObjectId,
  amount: {
    type: Number,
    required: true,
    min: 100
  },
  interestRate: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    required: true  // Duration in months
  },
  purpose: {
    type: String,
    required: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'disbursed', 'completed'],
    default: 'pending'
  },
  approvals: [{
    memberId: ObjectId,
    approved: Boolean,
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  disbursementDate: Date,
  expectedRepaymentDate: Date,
  actualRepaymentDate: Date,
  totalAmountDue: Number,  // Principal + interest
  amountPaid: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: Date,
  approvedBy: ObjectId
}
```

#### Subscriptions Collection
```javascript
{
  _id: ObjectId,
  memberId: ObjectId,
  type: {
    type: String,
    enum: ['weekly', 'monthly'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'pending'
  },
  paystackSubscriptionCode: String,
  paystackCustomerCode: String,
  paystackAuthorizationCode: String,
  startDate: Date,
  endDate: Date,
  nextBillingDate: Date,
  paymentHistory: [{
    amount: Number,
    reference: String,
    status: String,
    paidAt: Date,
    paystackResponse: Object
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  cancelledAt: Date,
  cancelReason: String
}
```

### Database Indexes
```javascript
// Performance optimization indexes
{
  "Members": [
    { "phoneNumber": 1 },
    { "groups.groupId": 1 },
    { "subscription.isActive": 1 },
    { "aiTrial.endDate": 1 }
  ],
  "Groups": [
    { "members.memberId": 1 },
    { "createdAt": -1 }
  ],
  "Savings": [
    { "memberId": 1, "groupId": 1 },
    { "groupId": 1, "createdAt": -1 },
    { "transactionReference": 1 }
  ],
  "Loans": [
    { "borrowerId": 1, "status": 1 },
    { "groupId": 1, "status": 1 },
    { "expectedRepaymentDate": 1 }
  ],
  "Subscriptions": [
    { "memberId": 1, "status": 1 },
    { "nextBillingDate": 1, "status": 1 }
  ]
}
```

## 🔄 API Specification

### RESTful API Design

#### Authentication Endpoints
```
POST   /api/auth/register
POST   /api/auth/verify-registration
POST   /api/auth/login  
POST   /api/auth/verify-login
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/profile
PUT    /api/auth/profile
```

#### Groups Management
```
GET    /api/groups                    # List user's groups
POST   /api/groups                    # Create group
GET    /api/groups/:id                # Get group details
PUT    /api/groups/:id                # Update group
DELETE /api/groups/:id                # Delete group
POST   /api/groups/:id/join           # Join group with invite code
POST   /api/groups/:id/leave          # Leave group
GET    /api/groups/:id/members        # Get group members
POST   /api/groups/:id/invite         # Send invitation
DELETE /api/groups/:id/members/:memberId  # Remove member
```

#### Savings Management
```
GET    /api/savings/:groupId          # Get group savings
POST   /api/savings/:groupId          # Record new saving
PUT    /api/savings/:id               # Update saving record
DELETE /api/savings/:id               # Delete saving record
POST   /api/savings/:id/verify        # Verify saving
GET    /api/savings/member/:memberId  # Get member's savings across groups
```

#### AI Features (Subscription Required)
```
POST   /api/ai/analyze-spending       # Analyze group spending patterns
POST   /api/ai/suggest-goals          # AI-suggested savings goals
POST   /api/ai/risk-assessment        # Loan risk assessment
GET    /api/ai/insights/:groupId      # Get AI insights for group
POST   /api/ai/chat                   # AI chat interface
GET    /api/ai/trial-status           # Check AI trial status
```

#### Subscription Management
```
GET    /api/subscriptions/plans       # Get available plans
POST   /api/subscriptions/initiate    # Start subscription process
POST   /api/subscriptions/webhook     # Paystack webhook handler
GET    /api/subscriptions/status      # Check subscription status
POST   /api/subscriptions/cancel      # Cancel subscription
GET    /api/subscriptions/history     # Payment history
```

### API Response Format
```javascript
// Success Response
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "pagination": {  // For paginated responses
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "errors": [  // Validation errors
    {
      "field": "phoneNumber",
      "message": "Phone number is required"
    }
  ]
}
```

## 📱 SMS Integration Specification

### SMS Service Architecture
```javascript
class SMSService {
  constructor() {
    this.baseUrl = process.env.SMSLEOPARD_API_URL;
    this.username = process.env.SMSLEOPARD_USERNAME;
    this.password = process.env.SMSLEOPARD_PASSWORD;
    this.source = process.env.SMSLEOPARD_SOURCE;
  }

  async sendSMS(recipient, message) {
    // Implementation with retry logic
    // Error handling for failed deliveries
    // Logging for monitoring
  }

  async sendOTP(phoneNumber, otp) {
    const message = `Your Chama Vault OTP: ${otp}. Valid for 5 minutes.`;
    return await this.sendSMS(phoneNumber, message);
  }
}
```

### SMS Template Categories
```javascript
{
  "authentication": [
    "otp_login",
    "otp_registration", 
    "password_reset",
    "welcome_message"
  ],
  "payments": [
    "payment_reminder",
    "payment_confirmation",
    "late_payment_warning"
  ],
  "subscriptions": [
    "trial_expiry_warning",
    "subscription_expiry",
    "payment_failed",
    "subscription_renewed"
  ],
  "groups": [
    "group_invitation",
    "new_member_welcome",
    "meeting_reminder",
    "milestone_achieved"
  ],
  "loans": [
    "loan_application_submitted",
    "loan_approved",
    "loan_rejected",
    "repayment_reminder"
  ]
}
```

### SMS Cost Optimization
```javascript
{
  "strategies": [
    "Character limit optimization (160 chars/SMS)",
    "Template reuse and standardization",
    "User preference-based opt-out",
    "Bulk messaging for group notifications",
    "Time-based sending (business hours)",
    "Failed delivery retry logic"
  ],
  "costEstimates": {
    "perSMS": "KES 1",
    "monthlyEstimate": "KES 500-2000 per 100 active users",
    "revenueRatio": "SMS costs should be <10% of subscription revenue"
  }
}
```

## 💰 Payment Integration Specification

### Paystack Integration
```javascript
class PaystackService {
  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY;
    this.publicKey = process.env.PAYSTACK_PUBLIC_KEY;
    this.baseUrl = 'https://api.paystack.co';
  }

  async initializePayment(email, amount, plan) {
    // Create payment session
    // Return authorization URL
  }

  async verifyPayment(reference) {
    // Verify payment with Paystack
    // Update subscription status
  }

  async createSubscription(customerCode, planCode) {
    // Create recurring subscription
    // Handle webhook setup
  }
}
```

### Subscription Plans
```javascript
{
  "plans": [
    {
      "code": "CHAMA_MONTHLY",
      "name": "Monthly AI Access",
      "amount": 10000,  // KES 100 in kobo
      "interval": "monthly",
      "description": "Full access to AI features and premium support"
    },
    {
      "code": "CHAMA_WEEKLY", 
      "name": "Weekly AI Access",
      "amount": 3000,   // KES 30 in kobo
      "interval": "weekly",
      "description": "Weekly access to AI features"
    }
  ]
}
```

### Webhook Handling
```javascript
app.post('/api/subscriptions/webhook', (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
  
  // Verify webhook signature
  const hash = crypto.createHmac('sha512', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');
    
  if (hash !== signature) {
    return res.status(400).send('Invalid signature');
  }

  const event = req.body;
  
  switch (event.event) {
    case 'subscription.create':
      // Handle new subscription
      break;
    case 'invoice.payment_failed':
      // Handle failed payment
      break;
    case 'subscription.disable':
      // Handle cancelled subscription
      break;
  }
  
  res.status(200).send('OK');
});
```

## 🤖 AI Integration Specification

### OpenAI Service Architecture
```javascript
class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.model = 'gpt-4';
  }

  async analyzeSpending(groupData) {
    const prompt = this.buildSpendingAnalysisPrompt(groupData);
    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: "You are a financial advisor..." },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7
    });
    
    return this.parseAIResponse(response);
  }
}
```

### AI Feature Specifications
```javascript
{
  "features": {
    "spendingAnalysis": {
      "input": "Group transaction history",
      "output": "Spending patterns, recommendations",
      "prompt": "Analyze group spending patterns and suggest optimizations"
    },
    "savingsGoals": {
      "input": "Group savings data, member count, contribution frequency",
      "output": "Realistic savings targets with timeline",
      "prompt": "Suggest achievable savings goals based on group performance"
    },
    "riskAssessment": {
      "input": "Loan applications, member history",
      "output": "Risk score and recommendations",
      "prompt": "Assess loan default risk for this member and group"
    },
    "budgetOptimization": {
      "input": "Expense categories, income sources",
      "output": "Budget allocation suggestions",
      "prompt": "Optimize budget allocation for maximum savings growth"
    }
  }
}
```

### AI Cost Management
```javascript
{
  "strategies": [
    "Cache frequent responses",
    "Limit token usage per request",
    "Implement rate limiting per user",
    "Use cheaper models for simple tasks",
    "Batch process similar requests"
  ],
  "costEstimates": {
    "perRequest": "$0.02-0.08",
    "monthlyBudget": "$50-200 for 1000 active users",
    "optimizations": "Implement caching to reduce by 60%"
  }
}
```

## 📈 Performance Requirements

### System Performance Targets
```javascript
{
  "responseTime": {
    "api": "<500ms for 95% of requests",
    "pageLoad": "<2 seconds initial load",
    "smsDelivery": "<30 seconds",
    "paymentProcessing": "<10 seconds"
  },
  "throughput": {
    "concurrent": "100 simultaneous users",
    "apiRequests": "1000 requests/minute", 
    "smsVolume": "500 SMS/hour",
    "databaseQueries": "<100ms average"
  },
  "availability": {
    "uptime": "99.5% monthly uptime",
    "maintenance": "4 hours/month scheduled downtime",
    "backup": "Daily automated backups",
    "recovery": "<4 hours RTO, <1 hour RPO"
  }
}
```

### Scalability Considerations
```javascript
{
  "horizontal": {
    "frontend": "CDN distribution via Vercel/Netlify",
    "backend": "Load balancer with multiple server instances",
    "database": "MongoDB sharding for large datasets"
  },
  "caching": {
    "frontend": "Browser caching + service workers",
    "api": "Redis for session and query caching",
    "database": "MongoDB query optimization"
  },
  "optimization": {
    "images": "WebP format, lazy loading",
    "code": "Tree shaking, code splitting",
    "api": "Pagination, field selection",
    "database": "Proper indexing, aggregation pipelines"
  }
}
```

## 🔧 Development & Deployment

### Development Environment
```javascript
{
  "requirements": {
    "node": "18.x LTS",
    "npm": "9.x",
    "mongodb": "6.x",
    "git": "2.x"
  },
  "tools": {
    "ide": "VS Code with extensions",
    "api": "Postman/Thunder Client",
    "database": "MongoDB Compass",
    "version": "Git with conventional commits"
  }
}
```

### Deployment Architecture
```javascript
{
  "production": {
    "frontend": "Vercel/Netlify static hosting",
    "backend": "VPS with PM2 or Railway/Render",
    "database": "MongoDB Atlas cluster",
    "monitoring": "PM2 monitoring + custom logging"
  },
  "staging": {
    "purpose": "Pre-production testing",
    "database": "Separate Atlas cluster",
    "apis": "Test keys for all services"
  },
  "cicd": {
    "git": "Feature branches → main",
    "testing": "Jest unit tests + manual testing",
    "deployment": "Automatic via webhooks"
  }
}
```

### Monitoring & Analytics
```javascript
{
  "metrics": [
    "User registration/retention rates",
    "SMS delivery success rates", 
    "Payment conversion rates",
    "AI feature usage statistics",
    "API response times",
    "Error rates and types"
  ],
  "logging": {
    "levels": "error, warn, info, debug",
    "rotation": "Daily log rotation",
    "storage": "Local files + cloud backup"
  },
  "alerts": [
    "High error rates (>5%)",
    "Slow response times (>1s)",
    "SMS delivery failures",
    "Payment processing errors"
  ]
}
```

---

This technical specification serves as the definitive guide for understanding, developing, and maintaining the Jaza Nyumba system. All implementations should align with these specifications to ensure consistency and reliability.