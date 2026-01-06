# 🚀 Assessment Portal - Production Deployment Guide

## Overview
This guide covers multiple deployment options for the Assessment Portal with 24/7 uptime, auto-restart capabilities, and production-ready configurations.

## 🎯 Quick Start (Recommended)

### Option 1: Docker Deployment (Easiest)
```bash
# Clone/navigate to project directory
cd assessment-portal

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```
**Access:** http://localhost (Frontend) | http://localhost:5000 (Backend API)

### Option 2: PM2 + Nginx (Traditional)
```bash
# For Linux/Ubuntu
sudo chmod +x deploy.sh
sudo ./deploy.sh

# For Windows
deploy.bat
```

## 🌐 Cloud Deployment Options

### AWS EC2 Deployment
1. **Launch EC2 Instance**
   - Ubuntu 20.04 LTS
   - t3.medium or larger
   - Security Groups: 22, 80, 443

2. **Deploy**
   ```bash
   # Upload files to EC2
   scp -r assessment-portal ubuntu@your-ec2-ip:~/
   
   # SSH and deploy
   ssh ubuntu@your-ec2-ip
   cd assessment-portal
   sudo ./deploy.sh
   ```

3. **Domain Setup**
   - Point domain to EC2 IP
   - Update nginx.conf with your domain
   - Setup SSL with Let's Encrypt:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

### Railway Deployment
1. **Connect Repository**
   - Push code to GitHub
   - Connect Railway to repository

2. **Environment Variables**
   ```
   NODE_ENV=production
   JWT_SECRET=your-secure-secret
   MONGODB_URI=your-mongodb-connection-string
   PORT=5000
   ```

3. **Deploy Commands**
   ```json
   {
     "build": "cd backend && npm install",
     "start": "cd backend && npm start"
   }
   ```

### Render Deployment
1. **Backend Service**
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Environment: Add all variables

2. **Frontend Service**
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/build`

### Vercel Deployment (Frontend Only)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

## 🔧 Manual Production Setup

### Prerequisites
- Node.js 18+
- MongoDB 6.0+
- PM2 (for process management)
- Nginx (for reverse proxy)

### Step-by-Step Setup

1. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   npm install --production
   
   # Frontend
   cd ../frontend
   npm install
   npm run build
   ```

2. **Environment Configuration**
   ```bash
   # Backend environment
   cp backend/.env.production backend/.env
   # Edit with your production values
   ```

3. **Database Setup**
   ```bash
   # Start MongoDB
   sudo systemctl start mongod
   sudo systemctl enable mongod
   
   # Seed database
   cd backend
   node seed.js
   ```

4. **Process Management with PM2**
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start application
   pm2 start ecosystem.config.js --env production
   
   # Save PM2 configuration
   pm2 save
   
   # Setup auto-start on boot
   pm2 startup
   ```

5. **Nginx Configuration**
   ```bash
   # Copy configuration
   sudo cp nginx.conf /etc/nginx/sites-available/assessment-portal
   
   # Enable site
   sudo ln -s /etc/nginx/sites-available/assessment-portal /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default
   
   # Test and reload
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## 🔒 Security Configuration

### Environment Variables (Production)
```env
# Backend .env
JWT_SECRET=your-256-bit-secret-key
MONGODB_URI=mongodb://username:password@host:port/database
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com
```

### MongoDB Security
```bash
# Enable authentication
sudo nano /etc/mongod.conf
# Add:
security:
  authorization: enabled

# Create admin user
mongo
use admin
db.createUser({
  user: "admin",
  pwd: "secure-password",
  roles: ["userAdminAnyDatabase"]
})
```

### SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 📊 Monitoring & Maintenance

### PM2 Monitoring
```bash
# Real-time monitoring
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart all

# Update application
git pull
pm2 reload all
```

### Health Checks
```bash
# Backend health
curl http://localhost:5000/health

# Check processes
pm2 status

# System resources
htop
```

### Backup Strategy
```bash
# MongoDB backup
mongodump --uri="mongodb://user:pass@host:port/database" --out=/backup/$(date +%Y%m%d)

# Application backup
tar -czf assessment-portal-$(date +%Y%m%d).tar.gz /var/www/assessment-portal
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   sudo lsof -i :5000
   sudo kill -9 <PID>
   ```

2. **MongoDB Connection Failed**
   ```bash
   sudo systemctl status mongod
   sudo systemctl restart mongod
   ```

3. **Nginx Configuration Error**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

4. **PM2 Process Crashed**
   ```bash
   pm2 logs
   pm2 restart all
   ```

### Log Locations
- PM2 Logs: `~/.pm2/logs/`
- Nginx Logs: `/var/log/nginx/`
- MongoDB Logs: `/var/log/mongodb/`
- Application Logs: `backend/logs/`

## 🔑 Default Credentials

After deployment, use these credentials:

- **Admin:** admin@test.com / password123
- **Faculty:** faculty.cs@test.com / password123  
- **Student:** student1@test.com / password123

**⚠️ Change default passwords in production!**

## 📈 Performance Optimization

### Backend Optimization
- Enable gzip compression
- Use connection pooling for MongoDB
- Implement caching with Redis
- Use CDN for static assets

### Frontend Optimization
- Enable service workers
- Implement code splitting
- Optimize images and assets
- Use browser caching

## 🔄 Auto-Restart Configuration

The deployment automatically configures:
- **PM2:** Auto-restart on crashes
- **Systemd:** Auto-start on server reboot
- **MongoDB:** Auto-start service
- **Nginx:** Auto-start service

## 📞 Support

For deployment issues:
1. Check logs: `pm2 logs`
2. Verify services: `sudo systemctl status nginx mongod`
3. Test connectivity: `curl http://localhost:5000`
4. Review configuration files

---

**🎉 Your Assessment Portal is now running 24/7 in production mode!**