# 🤝 Contributing to ChamaVault

Welcome to the ChamaVault project! This guide will help you understand how to contribute effectively to our Chama management system.

## 📋 Project Overview

ChamaVault is a modern web application that helps investment groups (Chamas) manage their finances, with features like OTP authentication, AI insights, subscription management, and SMS notifications.

### Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js + MongoDB
- **External APIs**: SMS Leopard, Paystack, OpenAI

## 🚀 Getting Started

### Prerequisites
- **Node.js** v16+ 
- **MongoDB** (local or Atlas account)
- **Git** for version control
- Code editor (VS Code recommended)

### Initial Setup
```bash
# Clone the repository
git clone <repository-url>
cd Chama-Vault

# Install backend dependencies
cd Server
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Copy environment files
cp Server/.env.example Server/.env
cp frontend/.env.example frontend/.env
```

### Environment Configuration
Fill in your API keys in the `.env` files. See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions on obtaining API keys.

### Running the Development Environment
```bash
# Terminal 1 - Backend
cd Server
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 📁 Project Structure Understanding

```
Chama-Vault/
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── assets/             # Static files
│   │   └── App.jsx             # Main app component
│   └── package.json
│
├── Server/                     # Backend API
│   ├── routes/                 # API endpoints
│   ├── models/                 # Database schemas
│   ├── services/               # Business logic
│   ├── middleware/             # Express middleware
│   └── index.js                # Server entry point
│
└── [documentation files]
```

## 🔧 Development Workflow

### 1. Branch Strategy
```bash
# Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# Create hotfix branch for urgent fixes
git checkout -b hotfix/urgent-fix-description
```

### 2. Branch Naming Convention
- **Features**: `feature/auth-improvements`, `feature/ai-enhancements`
- **Bug fixes**: `bugfix/login-error`, `bugfix/payment-validation`
- **Hotfixes**: `hotfix/security-patch`, `hotfix/sms-delivery`
- **Documentation**: `docs/api-updates`, `docs/setup-guide`

### 3. Commit Messages
Follow conventional commit format:
```bash
# Format: type(scope): description

# Examples
git commit -m "feat(auth): add OTP verification for login"
git commit -m "fix(payments): resolve Paystack webhook validation"
git commit -m "docs(api): update endpoint documentation"
git commit -m "refactor(sms): optimize template rendering"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## 🎨 Code Standards

### JavaScript/React Standards

#### General JavaScript
```javascript
// Use const/let, avoid var
const apiUrl = process.env.VITE_API_URL;
let userToken = null;

// Use async/await over .then()
const fetchUserData = async (userId) => {
  try {
    const response = await axios.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    throw error;
  }
};

// Use template literals
const welcomeMessage = `Welcome ${user.firstName} to ${group.name}!`;
```

#### React Components
```javascript
// Use functional components with hooks
import React, { useState, useEffect } from 'react';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const userData = await api.getUser(userId);
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner">Loading...</div>;
  
  return (
    <div className="user-profile">
      <h2>{user?.firstName} {user?.lastName}</h2>
      {/* Component content */}
    </div>
  );
};

export default UserProfile;
```

#### CSS/Tailwind Standards
```javascript
// Use semantic class names with Tailwind
<div className="bg-white rounded-lg shadow-md p-6 mb-4">
  <h2 className="text-xl font-semibold text-gray-800 mb-2">
    Group Savings
  </h2>
  <p className="text-gray-600 text-sm">
    Current balance: KES {balance.toLocaleString()}
  </p>
</div>
```

### Backend Standards

#### API Routes
```javascript
// Use proper HTTP methods and status codes
router.post('/groups', authenticateToken, async (req, res) => {
  try {
    const { name, description, contributionAmount } = req.body;
    
    // Validation
    if (!name || !contributionAmount) {
      return res.status(400).json({
        success: false,
        message: 'Name and contribution amount are required'
      });
    }

    const group = new Group({
      name,
      description,
      contributionAmount,
      members: [{ memberId: req.user.id, role: 'admin' }]
    });

    await group.save();

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: group
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});
```

#### Error Handling
```javascript
// Consistent error response format
const errorResponse = (res, statusCode, message, details = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details })
  });
};

// Use try-catch for all async operations
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});
```

### Database Standards

#### Model Definitions
```javascript
const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^\+254\d{9}$/.test(v);
      },
      message: 'Phone number must be in format +254XXXXXXXXX'
    }
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  }
}, {
  timestamps: true
});

// Add indexes for performance
userSchema.index({ phoneNumber: 1 });
userSchema.index({ 'groups.groupId': 1 });
```

## 🧪 Testing Guidelines

### Frontend Testing
```javascript
// Component tests using React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../pages/login';

describe('LoginPage', () => {
  test('shows OTP input after valid phone number', async () => {
    render(<LoginPage />);
    
    const phoneInput = screen.getByLabelText(/phone number/i);
    fireEvent.change(phoneInput, { target: { value: '+254712345678' } });
    
    const nextButton = screen.getByText(/next/i);
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/otp code/i)).toBeInTheDocument();
    });
  });
});
```

### Backend Testing
```javascript
// API endpoint tests using Jest + Supertest
const request = require('supertest');
const app = require('../index');

describe('POST /api/auth/login', () => {
  test('should send OTP for valid phone number', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        phoneNumber: '+254712345678',
        password: 'validpassword'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('OTP sent successfully');
  });
});
```

## 📱 Feature Development

### Adding New Features

1. **Plan the feature** - Create issue describing the feature
2. **Design the API** - Define endpoints and data flow
3. **Update database** - Add/modify schemas if needed
4. **Implement backend** - Create routes and services
5. **Implement frontend** - Create components and pages
6. **Test thoroughly** - Unit tests and manual testing
7. **Update documentation** - API docs and user guides

### Feature Structure Example

**Adding Payment History Feature:**

1. **Backend**: 
   - `models/PaymentHistory.js` - Data schema
   - `routes/payments.js` - API endpoints
   - `services/paymentService.js` - Business logic

2. **Frontend**:
   - `components/PaymentHistory.jsx` - Main component
   - `pages/PaymentsDashboard.jsx` - Page integration
   - Update navigation and routing

### SMS Template Updates

When adding new SMS templates:

1. Add template to `Server/services/smsTemplates.js`
2. Update `SMS_TEMPLATES.md` documentation
3. Test with real phone numbers
4. Consider character limits (160 chars per SMS)

### AI Feature Development

For AI-related features:
1. Design prompts carefully for consistent results
2. Handle API rate limits and errors gracefully
3. Cache responses when appropriate
4. Test with various input scenarios

## 🔍 Code Review Process

### Pull Request Guidelines

1. **Clear Description**: Explain what the PR does and why
2. **Small, Focused Changes**: Keep PRs manageable
3. **Tests Included**: Add tests for new functionality
4. **Documentation Updated**: Update relevant docs

### PR Template
```markdown
## Description
Brief description of changes made

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] API endpoints tested

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements left
```

### Review Checklist
- **Functionality**: Does it work as intended?
- **Security**: No sensitive data exposed?
- **Performance**: Efficient database queries?
- **Error Handling**: Proper try-catch blocks?
- **Code Style**: Follows project standards?

## 🐛 Bug Reporting & Fixing

### Bug Report Format
```markdown
## Bug Description
Clear description of what's wrong

## Steps to Reproduce
1. Go to login page
2. Enter invalid phone number
3. Click submit
4. See error

## Expected Behavior
Should show validation error

## Actual Behavior
Page crashes with console error

## Environment
- OS: Windows 10
- Browser: Chrome 120
- Node.js: 18.2.0
```

### Bug Fix Process
1. **Reproduce** the bug locally
2. **Identify** root cause
3. **Fix** with minimal code changes
4. **Test** the fix thoroughly
5. **Verify** no new bugs introduced

## 🚀 Deployment Contributions

### Environment Setup
- Follow [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
- Test in staging environment first
- Verify all environment variables are set

### Database Migrations
```javascript
// Example migration script
const mongoose = require('mongoose');

async function migrationScript() {
  // Add new field to existing documents
  await Member.updateMany(
    { smsPreferences: { $exists: false } },
    { 
      $set: { 
        smsPreferences: {
          paymentReminders: true,
          groupNotifications: true,
          aiInsights: true
        }
      }
    }
  );
}
```

## 📚 Documentation Contributions

### Documentation Standards
- Keep examples up-to-date with current code
- Use clear, concise language
- Include code examples where helpful
- Update API documentation for endpoint changes

### API Documentation Format
```markdown
### POST /api/groups

Create a new chama group.

**Request Body:**
```json
{
  "name": "Our Investment Group",
  "contributionAmount": 1000,
  "contributionFrequency": "monthly"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Group created successfully",
  "data": {
    "_id": "60f...",
    "name": "Our Investment Group"
  }
}
```
```

## 🔧 Development Tools

### Recommended VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens

### Useful Commands
```bash
# Backend development
npm run dev          # Start with nodemon
npm run test         # Run tests
npm run lint         # Check code style

# Frontend development
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run preview      # Preview build
```

## 🆘 Getting Help

### Resources
- **Project Documentation**: See all `.md` files in the repository
- **API Reference**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Setup Issues**: [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)

### Communication
- **Issues**: Create GitHub issues for bugs or features
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Comment on pull requests

### Common Development Issues

**MongoDB Connection Error**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Or for Atlas, verify connection string
```

**SMS Not Sending**
- Check SMS Leopard credentials in `.env`
- Verify phone number format (+254XXXXXXXXX)
- Check account balance on SMS Leopard dashboard

**Paystack Integration Issues**
- Ensure using correct test/live keys
- Verify webhook URL is publicly accessible
- Check webhook signature validation

---

Thank you for contributing to ChamaVault! Your help makes this project better for everyone. 🙏