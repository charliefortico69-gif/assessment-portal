#!/bin/bash

# Assessment Portal Production Deployment Script

echo "🚀 Starting Assessment Portal Deployment..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (use sudo)"
  exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 globally
echo "📦 Installing PM2..."
npm install -g pm2

# Install MongoDB
echo "📦 Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt-get update
apt-get install -y mongodb-org

# Start and enable MongoDB
systemctl start mongod
systemctl enable mongod

# Install Nginx
echo "📦 Installing Nginx..."
apt-get install -y nginx

# Create application directory
echo "📁 Setting up application directory..."
mkdir -p /var/www/assessment-portal
cd /var/www/assessment-portal

# Clone or copy your application here
# git clone <your-repo-url> .

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install --production

# Install frontend dependencies and build
echo "📦 Building frontend..."
cd ../frontend
npm install
npm run build

# Copy built files to nginx directory
cp -r build/* /var/www/html/

# Setup environment variables
echo "⚙️ Setting up environment variables..."
cd ../backend
cp .env.production .env

# Seed database
echo "🌱 Seeding database..."
node seed.js

# Setup PM2
echo "⚙️ Setting up PM2..."
cd ..
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Setup Nginx
echo "⚙️ Configuring Nginx..."
cp nginx.conf /etc/nginx/sites-available/assessment-portal
ln -sf /etc/nginx/sites-available/assessment-portal /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Setup firewall
echo "🔒 Configuring firewall..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

# Create systemd service for auto-start
echo "⚙️ Creating systemd service..."
cat > /etc/systemd/system/assessment-portal.service << EOF
[Unit]
Description=Assessment Portal
After=network.target

[Service]
Type=forking
User=root
WorkingDirectory=/var/www/assessment-portal
ExecStart=/usr/bin/pm2 start ecosystem.config.js --env production
ExecReload=/usr/bin/pm2 reload all
ExecStop=/usr/bin/pm2 stop all
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl enable assessment-portal
systemctl start assessment-portal

echo "✅ Deployment completed!"
echo "🌐 Your application should be accessible at: http://your-server-ip"
echo "📊 Monitor with: pm2 monit"
echo "📝 View logs with: pm2 logs"
echo ""
echo "🔑 Default credentials:"
echo "Admin: admin@test.com / password123"
echo "Faculty: faculty.cs@test.com / password123"
echo "Student: student1@test.com / password123"