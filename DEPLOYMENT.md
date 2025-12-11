# ChamaVault Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- VPS or cloud server (DigitalOcean, AWS, Heroku, etc.)
- Domain name (optional)
- SSL certificate
- MongoDB Atlas account (or self-hosted MongoDB)

## 🖥️ Server Setup (Ubuntu/Debian)

### 1. Initial Server Configuration

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install nginx -y

# Install certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Deploy Application

```bash
# Clone repository
git clone <your-repo-url>
cd Chama-Vault

# Install backend dependencies
cd Server
npm install --production

# Install frontend dependencies  
cd ../frontend
npm install
npm run build
```

### 3. Environment Configuration

Create production environment files:

**Server/.env.production:**
```env
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chamavault

# JWT Secret (generate strong secret)
JWT_SECRET=super-secret-production-key-change-this

# SMS Leopard (production credentials)
SMSLEOPARD_API_URL=https://api.smsleopard.com/v1/sms
SMSLEOPARD_USERNAME=your_production_username
SMSLEOPARD_PASSWORD=your_production_password
SMSLEOPARD_SOURCE=your_production_source

# Paystack (live keys)
PAYSTACK_SECRET_KEY=sk_live_your_live_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_live_public_key
PAYSTACK_WEBHOOK_SECRET=your_production_webhook_secret

# OpenAI
OPENAI_API_KEY=sk-your_production_openai_key

# Production URLs
FRONTEND_URL=https://yourdomain.com
```

**frontend/.env.production:**
```env
VITE_API_URL=https://api.yourdomain.com
```

### 4. PM2 Process Management

Create PM2 ecosystem file:

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'chamavault-api',
    script: './Server/index.js',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

Start with PM2:
```bash
# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Enable PM2 startup
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### 5. Nginx Configuration

Create Nginx configuration:

**/etc/nginx/sites-available/chamavault:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (React build)
    location / {
        root /path/to/Chama-Vault/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Enable gzip compression
        gzip on;
        gzip_types text/plain application/json application/javascript text/css application/xml;
    }

    # API routes
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/chamavault /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL Certificate (Let's Encrypt)

```bash
# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## 🐳 Docker Deployment

### 1. Backend Dockerfile

**Server/Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

### 2. Frontend Dockerfile

**frontend/Dockerfile:**
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 3. Docker Compose

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build: ./Server
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - SMSLEOPARD_USERNAME=${SMSLEOPARD_USERNAME}
      - SMSLEOPARD_PASSWORD=${SMSLEOPARD_PASSWORD}
      - PAYSTACK_SECRET_KEY=${PAYSTACK_SECRET_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
```

Deploy with Docker:
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Scale backend
docker-compose up -d --scale backend=3
```

## ☁️ Cloud Platform Deployment

### Heroku Deployment

1. **Prepare for Heroku:**

**Procfile:**
```
web: node Server/index.js
```

**package.json (root):**
```json
{
  "scripts": {
    "heroku-postbuild": "cd frontend && npm install && npm run build",
    "start": "cd Server && npm start"
  },
  "engines": {
    "node": "18.x"
  }
}
```

2. **Deploy to Heroku:**
```bash
# Login to Heroku
heroku login

# Create app
heroku create chamavault-api

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set SMSLEOPARD_USERNAME=username
heroku config:set PAYSTACK_SECRET_KEY=sk_live_key
heroku config:set OPENAI_API_KEY=sk-key

# Deploy
git push heroku main
```

### Vercel Deployment (Frontend)

**vercel.json:**
```json
{
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend-url.herokuapp.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

Deploy:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Railway Deployment

1. **Connect GitHub repository**
2. **Set environment variables in dashboard**
3. **Deploy automatically on push**

## 🔐 Security Configuration

### 1. Environment Security

```bash
# Secure .env files
chmod 600 .env*

# Use environment variable management
export JWT_SECRET=$(openssl rand -base64 32)
```

### 2. Firewall Setup

```bash
# UFW firewall
sudo ufw enable
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 5000  # API (if direct access needed)
```

### 3. MongoDB Security

**Atlas Security:**
- Enable IP whitelist
- Use strong passwords
- Enable database access auditing

**Self-hosted Security:**
```bash
# Enable authentication
mongod --auth

# Create admin user
use admin
db.createUser({
  user: "admin",
  pwd: "secure_password",
  roles: ["root"]
})
```

### 4. API Security Headers

Add to Express app:
```javascript
// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // requests per windowMs
}));
```

## 📊 Monitoring & Logging

### 1. Application Monitoring

**PM2 Monitoring:**
```bash
# Install PM2 monitoring
pm2 install pm2-server-monit

# View monitoring
pm2 monit
```

### 2. Error Logging

**Winston Logger:**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'chamavault' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 3. Health Check Endpoint

```javascript
// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});
```

## 🔄 Backup Strategy

### 1. Database Backups

**MongoDB Atlas:**
- Automatic backups enabled by default
- Point-in-time recovery available

**Self-hosted MongoDB:**
```bash
# Daily backup script
mongodump --uri="mongodb://localhost:27017/chamavault" --out=/backups/$(date +%Y%m%d)

# Automated backup with cron
0 2 * * * /usr/local/bin/mongodump --uri="mongodb://localhost:27017/chamavault" --out=/backups/$(date +\%Y\%m\%d)
```

### 2. Code Backups

```bash
# Automated Git backups
git remote add backup git@backup-server:repo.git
git push backup main
```

## 📋 Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] API keys obtained (SMS, Paystack, OpenAI)
- [ ] Database setup and accessible
- [ ] Domain and SSL configured
- [ ] Security headers implemented

### Deployment
- [ ] Application builds successfully
- [ ] All services start without errors
- [ ] API endpoints respond correctly
- [ ] Frontend loads and functions
- [ ] SMS sending works in production
- [ ] Payment processing functional

### Post-deployment
- [ ] Health checks passing
- [ ] Monitoring setup
- [ ] Backup systems active
- [ ] Performance testing completed
- [ ] Security scan performed
- [ ] Documentation updated

## 🚨 Troubleshooting

### Common Issues

**Build failures:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Database connection:**
```bash
# Test MongoDB connection
mongosh "mongodb+srv://cluster.mongodb.net/test" --username username
```

**SMS not sending:**
- Check SMS Leopard credentials
- Verify phone number format
- Check account balance

**Payment issues:**
- Verify Paystack keys
- Check webhook URL configuration
- Monitor Paystack dashboard

### Logs Location
- **PM2 logs**: `~/.pm2/logs/`
- **Nginx logs**: `/var/log/nginx/`
- **Application logs**: `./logs/`

---

**Success!** Your ChamaVault application is now deployed and ready for production use! 🎉