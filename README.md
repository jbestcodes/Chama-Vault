# ChamaVault - Digital Chama Management System

**🌟 Live Demo: [https://chama-vault-aiid.vercel.app/](https://chama-vault-aiid.vercel.app/)**

ChamaVault is a comprehensive digital platform for managing Chama (savings group) operations in Kenya. It features SMS notifications, AI-powered financial insights, loan management, and subscription-based services.

## ✨ Key Features

### 📱 SMS Integration
- **Phone verification** with OTP authentication
- **Automated reminders** for contributions and repayments  
- **Group notifications** and announcements
- **SMS templates** for consistent messaging
- **Smart scheduling** (no Sunday SMS)

### 🤖 AI Financial Assistant
- **2-week free trial** for new members
- **Personalized financial advice**
- **Savings analysis** and recommendations
- **Loan eligibility assessment**
- **Goal tracking** and milestone management

### 💰 Financial Management
- **Group savings tracking**
- **Loan application and approval workflow**
- **Repayment scheduling and tracking**
- **Member rankings and leaderboards**
- **Financial milestone setting**

### 👥 Group Administration
- **Member approval system**
- **Role-based permissions** (Admin/Member)
- **Group invitations** with codes
- **Contribution schedule management**
- **SMS preference controls**

### 💳 Subscription System
- **Member-based subscriptions** (KES 100/month, KES 30/week)
- **Feature gating** based on subscription status
- **Paystack integration** for payments
- **Usage tracking** and limits

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB database
- SMS Leopard account
- Paystack account  
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Chama-Vault
```

2. **Install backend dependencies**
```bash
cd Server
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Configure environment variables** (see Environment Setup below)

5. **Start the development servers**
```bash
# Backend (from Server directory)
npm run dev

# Frontend (from frontend directory)
npm run dev
```

## 🔧 Environment Setup

### Backend Environment Variables

Create `Server/.env` with the following:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/chamavault
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/chamavault

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-here

# SMS Leopard Configuration
SMSLEOPARD_API_URL=https://api.smsleopard.com/v1/sms
SMSLEOPARD_USERNAME=your_smsleopard_username
SMSLEOPARD_PASSWORD=your_smsleopard_password
SMSLEOPARD_SOURCE=your_sender_id

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
PAYSTACK_WEBHOOK_SECRET=your_paystack_webhook_secret

# OpenAI Configuration
OPENAI_API_KEY=sk-your_openai_api_key

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables

Create `frontend/.env` with:

```env
VITE_API_URL=http://localhost:5000
```

## 🔑 API Keys Setup Guide

### 1. MongoDB Setup
- **Local**: Install MongoDB or use MongoDB Atlas
- **Atlas**: Create cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
- **Connection**: Get connection string and add to `MONGODB_URI`

### 2. SMS Leopard Setup  
- **Account**: Sign up at [smsleopard.com](https://smsleopard.com)
- **API Credentials**: Get username, password, and source ID
- **Testing**: Use test credits for development

### 3. Paystack Setup
- **Account**: Sign up at [paystack.com](https://paystack.com)
- **API Keys**: Get test and live keys from dashboard
- **Webhooks**: Set up webhook endpoint for subscription events

### 4. OpenAI Setup
- **Account**: Sign up at [platform.openai.com](https://platform.openai.com)
- **API Key**: Generate API key from dashboard
- **Billing**: Add payment method for usage

## 📱 Frontend Usage

### User Authentication Flow
1. **Register**: Phone verification with SMS OTP
2. **Login**: 2-step process (credentials → OTP)  
3. **Dashboard**: Access features based on subscription

### AI Trial System
- New users get 2 weeks free AI access
- Trial countdown shown in dashboard
- Upgrade prompts when trial expires

### SMS Preferences
- Access via profile page
- Toggle specific notification types
- Real-time preference updates

## 🏗️ System Architecture

### Backend Structure
```
Server/
├── models/          # MongoDB schemas
├── routes/          # API endpoints  
├── services/        # Business logic
├── middleware/      # Auth, validation
└── utils/          # Helper functions
```

### Key Services
- **SMS Service**: Template-based messaging with subscription checks
- **AI Service**: OpenAI integration for financial insights
- **Payment Service**: Paystack integration for subscriptions
- **Reminder Service**: Cron jobs for automated notifications
- **Withdrawal Requests** - Secure withdrawal system with admin approval
- **Member Management** - Admin tools for adding, editing, and managing members

### Analytics & Visualization
- **Anonymous Leaderboard** - Masked group rankings with visual bar graphs
- **Savings Matrix** - Admin dashboard with comprehensive savings overview
- **Progress Tracking** - Personal milestones and goal setting
- **Visual Charts** - Line graphs showing savings history and trends

### AI-Powered Features
- **Smart Financial Nudges** - Personalized saving encouragement based on your data
- **Loan Eligibility Analysis** - Real-time qualification assessment with group-specific rules
- **Savings Health Score** - Consistency-based financial health metrics
- **AI Chat Assistant** - Contextual help using OpenAI GPT-4 with your actual savings data
- **Group-Specific Intelligence** - AI adapts to your group's interest rates and loan policies

### Administrative Tools
- **Member Approval Workflow** - Pending/approved/denied status management
- **Group Financial Settings** - Customizable interest rates and minimum loan savings per group
- **Group Management** - Multi-group support with isolated data
- **Email Notifications** - Contact form integration with Formspree
- **Audit Trail** - Complete transaction and activity history

### Enhanced Features (New!)
- **Customizable Group Policies** - Admins can set unique interest rates and loan eligibility requirements
- **AI-Powered Financial Advisor** - Chat with an AI that knows your savings history and group rules
- **Anonymous Savings Leaderboard** - See your rank without revealing member identities
- **Personal Milestone Tracking** - Set and track custom savings goals
- **Real-time Dashboard** - Live updates of your savings progress and group statistics

## Coming Soon
- **M-Pesa Integration** - Direct mobile money transactions
- **SMS Notifications** - Real-time updates and balance inquiries
- **Multi-Group Membership** - Individual support across multiple Chamas
- **Advanced Analytics** - Predictive insights and trend analysis
- **Mobile App** - Native iOS and Android applications
- **WhatsApp Bot Integration** - Quick balance checks and savings reminders

## Technologies Used

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - Secure authentication tokens
- **Bcrypt** - Password hashing and security
- **OpenAI GPT-4** - AI-powered financial assistant
- **Nodemailer** - Email notifications

### Frontend
- **React 18** - Modern UI framework with hooks
- **Vite** - Fast development and build tool
- **Axios** - HTTP client for API requests
- **Recharts** - Interactive data visualization
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing

### Database & Infrastructure
- **MongoDB Atlas** - Cloud database hosting
- **Vercel** - Frontend deployment
- **Render** - Backend API hosting
- **OpenAI API** - AI chat functionality

## API Endpoints

### Authentication
- `POST /api/auth/register` - Member registration
- `POST /api/auth/login` - Member login
- `POST /api/auth/admin/login` - Admin login

### Savings & Analytics
- `GET /api/savings/dashboard` - Personal dashboard data
- `GET /api/savings/matrix` - Admin savings matrix
- `POST /api/savings/milestone` - Create personal goals

### Loans & Repayments
- `POST /api/loans/request` - Request a loan
- `GET /api/loans/my` - Personal loan history
- `POST /api/repayments/` - Submit repayment

### Group Management (New!)
- `GET /api/groups/settings/:groupId` - Get group financial settings
- `PUT /api/groups/settings/:groupId` - Update group interest rates and loan policies
- `POST /api/groups/` - Create new group (admin only)

### AI Features (Enhanced!)
- `GET /api/ai/financial-nudge` - Personalized motivation with real data
- `GET /api/ai/loan-analysis` - Eligibility assessment with group-specific rules
- `GET /api/ai/savings-health` - Comprehensive financial health analysis
- `POST /api/ai/chat` - AI assistant chat with OpenAI GPT-4 integration

## Getting Started

### Quick Start (Live Demo)
1. **Visit:** [https://chama-vault-aiid.vercel.app/](https://chama-vault-aiid.vercel.app/)
2. **Register** as a new member or contact support for admin demo
3. **Explore** all features including AI assistant and savings tracking
4. **Test** loan applications and group analytics

### Local Development

#### Prerequisites
- Node.js 16+ installed
- MongoDB Atlas account (or local MongoDB)
- OpenAI API key (optional, for AI features)
- Gmail account for email notifications

#### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/chama-vault.git
   cd chama-vault
   ```

2. **Backend Setup**
   ```bash
   cd Server
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Configuration**
   
   Create `.env` in the `Server` folder:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chama_vault
   JWT_SECRET=your_super_secure_jwt_secret_key
   GMAIL_USER=your-email@gmail.com
   GMAIL_PASS=your-app-password
   OPENAI_API_KEY=your_openai_api_key_for_ai_features
   PORT=5000
   ```

5. **Run the Application**
   
   **Backend** (Terminal 1):
   ```bash
   cd Server
   npm start
   # Server runs on http://localhost:5000
   ```
   
   **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   # App runs on http://localhost:5173
   ```

### First Time Setup
1. Register as an admin for your group
2. Configure group financial settings (interest rates, loan minimums)
3. Add members through the admin dashboard
4. Members can then register using their phone numbers
5. Start tracking savings and managing loans!
6. Try the AI assistant for personalized financial advice!

## Route Analysis

### Group Routes ✅
Your group routes are well-implemented with:
- **Proper authentication** and admin verification
- **Input validation** for interest rates (0-100%) and positive savings amounts
- **MongoDB integration** with proper error handling
- **RESTful design** with clear endpoints

### AI Routes ✅ 
Your AI implementation is excellent with:
- **OpenAI GPT-4 integration** for intelligent responses
- **Group-specific context** using admin-configured settings
- **Smart fallback responses** when API is unavailable
- **Real user data integration** for personalized advice
- **Cost optimization** with gpt-4o-mini model and reduced tokens

## Security Features

- **JWT Authentication** - Secure token-based sessions
- **Password Hashing** - Bcrypt encryption for passwords
- **Role-Based Access** - Admin and member permission levels
- **Input Validation** - Comprehensive data sanitization
- **CORS Protection** - Cross-origin request security
- **Admin-Only Group Settings** - Prevents unauthorized policy changes

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Support

- **Live Demo:** [https://chama-vault-aiid.vercel.app/](https://chama-vault-aiid.vercel.app/)
- **Website Contact Form** - Use the built-in contact feature
- **GitHub Issues** - Report bugs and request features
- **Email** - Direct admin contact for urgent matters

## Acknowledgments

- Built for the Chama community to modernize group banking
- Inspired by traditional table banking practices
- Powered by modern web technologies and AI for reliability and scale
- OpenAI integration for intelligent financial guidance

---

**Jaza Nyumba** - Empowering community savings with modern technology and AI 🏦✨🤖

**Try it now: [https://chama-vault-aiid.vercel.app/](https://chama-vault-aiid.vercel.app/)**
