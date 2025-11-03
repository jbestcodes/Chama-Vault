# Chama Vault

Chama Vault is a secure, web-based savings and loan management platform built for table banking groups (Chamas). It enables members to track weekly savings, manage loans, view anonymous group rankings, set personal milestones, and get AI-powered financial insights.

## Features

### Core Banking Features
- **Secure Authentication** - Member registration, login, and role-based access
- **Savings Management** - Track weekly contributions with visual progress charts
- **Loan System** - Request loans, admin approval workflow, and repayment tracking
- **Withdrawal Requests** - Secure withdrawal system with admin approval
- **Member Management** - Admin tools for adding, editing, and managing members

### Analytics & Visualization
- **Anonymous Leaderboard** - Masked group rankings with visual bar graphs
- **Savings Matrix** - Admin dashboard with comprehensive savings overview
- **Progress Tracking** - Personal milestones and goal setting
- **Visual Charts** - Line graphs showing savings history and trends

### AI-Powered Features
- **Smart Financial Nudges** - Personalized saving encouragement
- **Loan Eligibility Analysis** - Real-time qualification assessment
- **Savings Health Score** - Consistency-based financial health metrics
- **AI Chat Assistant** - Contextual help using your actual data

### Administrative Tools
- **Member Approval Workflow** - Pending/approved/denied status management
- **Group Management** - Multi-group support with isolated data
- **Email Notifications** - Contact form integration
- **Audit Trail** - Complete transaction and activity history

## Coming Soon
- **M-Pesa Integration** - Direct mobile money transactions
- **SMS Notifications** - Real-time updates and balance inquiries
- **Multi-Group Membership** - Individual support across multiple Chamas
- **Advanced Analytics** - Predictive insights and trend analysis
- **Mobile App** - Native iOS and Android applications

## Technologies Used

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - Secure authentication tokens
- **Bcrypt** - Password hashing and security
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

## Getting Started

### Prerequisites
- Node.js 16+ installed
- MongoDB Atlas account (or local MongoDB)
- Gmail account for email notifications

### Installation

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
   OPENAI_API_KEY=your_openai_api_key_optional
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
2. Add members through the admin dashboard
3. Members can then register using their phone numbers
4. Start tracking savings and managing loans!

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

### AI Features
- `GET /api/ai/financial-nudge` - Personalized motivation
- `GET /api/ai/loan-analysis` - Eligibility assessment
- `POST /api/ai/chat` - AI assistant chat

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security Features

- **JWT Authentication** - Secure token-based sessions
- **Password Hashing** - Bcrypt encryption for passwords
- **Role-Based Access** - Admin and member permission levels
- **Input Validation** - Comprehensive data sanitization
- **CORS Protection** - Cross-origin request security

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Support

- **Website Contact Form** - Use the built-in contact feature
- **GitHub Issues** - Report bugs and request features
- **Email** - Direct admin contact for urgent matters

## Acknowledgments

- Built for the Chama community to modernize group banking
- Inspired by traditional table banking practices
- Powered by modern web technologies for reliability and scale

---

**Chama Vault** - Empowering community savings with modern technology 🏦✨
