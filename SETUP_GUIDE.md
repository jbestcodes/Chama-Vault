# 🔧 Jaza Nyumba Setup Guide

This guide will help you set up the complete Jaza Nyumba system with all required API keys and configurations.

## 📋 Prerequisites

Before you begin, make sure you have:

- **Node.js** (v16 or higher) installed
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git** for version control
- A **code editor** (VS Code recommended)

## 📱 Required API Keys

You'll need to sign up for the following services to get API keys:

### 1. SMS Leopard (SMS Service)
- **Website**: [SMS Leopard](https://smsleopard.com)
- **Purpose**: Sending OTP codes and notifications
- **Required**: Username, Password, Source ID
- **Cost**: Pay per SMS (Kenya: ~KES 1 per SMS)

### 2. Paystack (Payment Processing)
- **Website**: [Paystack](https://paystack.com)
- **Purpose**: Handling subscriptions and payments
- **Required**: Secret Key, Public Key, Webhook Secret
- **Cost**: 1.5% + KES 20 per successful transaction

### 3. OpenAI (AI Features)
- **Website**: [OpenAI Platform](https://platform.openai.com)
- **Purpose**: AI assistant for financial advice
- **Required**: API Key
- **Cost**: Pay per usage (~$0.002 per 1K tokens)

### 4. MongoDB (Database)
- **Options**: Local MongoDB or [MongoDB Atlas](https://cloud.mongodb.com) (recommended)
- **Purpose**: Database for storing all application data
- **Required**: Connection URI
- **Cost**: Atlas free tier available, paid tiers start at ~$57/month

## 🚀 Quick Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repository-url>
cd Chama-Vault

# Install backend dependencies
cd Server
npm install

# Install frontend dependencies  
cd ../frontend
npm install
```

### Step 2: Set Up Environment Variables

#### Backend Configuration

```bash
# Go to Server directory
cd Server

# Copy environment template
cp .env.example .env

# Edit .env with your actual API keys
nano .env  # or use your preferred editor
```

Fill in your `.env` file with:

```env
# Database (MongoDB Atlas recommended)
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/Jaza Nyumba

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-here

# SMS Leopard
SMSLEOPARD_API_URL=https://api.smsleopard.com/v1/sms
SMSLEOPARD_USERNAME=your_username
SMSLEOPARD_PASSWORD=your_password
SMSLEOPARD_SOURCE=your_source_id

# Paystack
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret

# OpenAI
OPENAI_API_KEY=sk-your_openai_api_key
```

#### Frontend Configuration

```bash
# Go to frontend directory
cd ../frontend

# Copy environment template
cp .env.example .env

# Edit .env
nano .env
```

Fill in your frontend `.env` file:

```env
# API URL
VITE_API_URL=http://localhost:5000

# Paystack Public Key
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
```

### Step 3: Start the Development Servers

#### Terminal 1 - Backend
```bash
cd Server
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 🔐 Getting Your API Keys

### SMS Leopard Setup

1. Visit [SMS Leopard](https://smsleopard.com)
2. Sign up for an account
3. Go to your dashboard
4. Copy your:
   - Username
   - Password  
   - Source ID (your sender name)

### Paystack Setup

1. Visit [Paystack](https://paystack.com)
2. Sign up for an account
3. Go to Settings → API Keys & Webhooks
4. Copy your:
   - Test Secret Key (starts with `sk_test_`)
   - Test Public Key (starts with `pk_test_`)
5. Set up webhook URL: `https://yourdomain.com/api/subscriptions/webhook`
6. Copy the webhook secret

### OpenAI Setup

1. Visit [OpenAI Platform](https://platform.openai.com)
2. Sign up and add billing method
3. Go to API Keys section
4. Create new secret key
5. Copy the key (starts with `sk-`)

### MongoDB Atlas Setup

1. Visit [MongoDB Atlas](https://cloud.mongodb.com)
2. Sign up for free account
3. Create a new cluster (free tier available)
4. Create a database user
5. Whitelist your IP address (or 0.0.0.0/0 for development)
6. Get connection string from "Connect" button

## ⚡ Testing Your Setup

### 1. Test Database Connection
```bash
cd Server
npm run test:db
```

### 2. Test SMS Service
```bash
# This will send a test SMS to your phone
npm run test:sms
```

### 3. Test AI Service
```bash
npm run test:ai
```

### 4. Test Payment Service
```bash
npm run test:paystack
```

## 📱 Application Features

### Authentication
- OTP-based login and registration
- SMS verification for all accounts
- JWT token-based sessions

### Subscription System
- **Monthly Plan**: KES 100/month
- **Weekly Plan**: KES 30/week
- **Free Trial**: 14-day AI features trial
- Automatic SMS notifications for expiry

### AI Features (Trial/Subscription)
- Financial advice and insights
- Savings goal recommendations
- Expense analysis
- Payment reminders

### SMS Notifications
- OTP codes for login/registration
- Payment reminders
- Subscription notifications
- Custom group notifications
- Milestone achievement alerts

## 🌐 Production Deployment

For production deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on:

- VPS deployment with PM2
- Docker containerization
- Cloud platform deployment (Railway, Heroku, etc.)
- Domain configuration
- SSL certificate setup
- Environment security

## 🔧 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```
Error: Could not connect to MongoDB
```
- Check your connection string format
- Verify network access (IP whitelist)
- Confirm database user permissions

**SMS Not Sending**
```
SMS sending failed
```
- Verify SMS Leopard credentials
- Check phone number format (+254XXXXXXXXX)
- Confirm account balance

**Payment Webhook Not Working**
```
Paystack webhook verification failed
```
- Check webhook secret matches
- Verify webhook URL is publicly accessible
- Confirm HTTPS for production

**AI Features Not Working**
```
OpenAI API error
```
- Verify API key is correct
- Check account billing status
- Confirm rate limits not exceeded

### Getting Help

- **Documentation**: Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Issues**: Create GitHub issue with error details
- **Support**: Contact support@Jaza Nyumba.com

## 📚 Next Steps

1. **Get all API keys** following the sections above
2. **Test the complete system** using the test commands
3. **Customize** branding and settings for your chama
4. **Deploy to production** using the deployment guide
5. **Set up monitoring** and backup systems

## 💡 Tips for Success

- **Start with test keys** before going live
- **Test SMS delivery** with real phone numbers
- **Monitor API usage** to manage costs
- **Set up proper error logging** in production
- **Regular database backups** are essential
- **Keep API keys secure** and rotate them regularly

---

**Need Help?** 
- 📧 Email: support@Jaza Nyumba.com
- 📱 Phone: +254700000000
- 📖 Documentation: See the other `.md` files in this repository