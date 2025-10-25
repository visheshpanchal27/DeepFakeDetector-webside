# Setup & Run Guide - DeepFake Detector

Complete guide to set up and run the DeepFake Detector application on any Windows PC.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Setup (Automated)](#quick-setup-automated)
- [Manual Setup](#manual-setup)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts (Free)
1. **MongoDB Atlas** - Database
   - Sign up: https://www.mongodb.com/cloud/atlas/register
   - Create free cluster (M0 Sandbox)
   - Get connection string

2. **Gmail Account** - Email OTP service
   - Enable 2-Step Verification
   - Generate App Password: https://myaccount.google.com/apppasswords

3. **Cloudinary** - File storage
   - Sign up: https://cloudinary.com/users/register/free
   - Get Cloud Name, API Key, API Secret from dashboard

### System Requirements
- Windows 10/11 (64-bit)
- 4GB RAM minimum
- 2GB free disk space
- Internet connection

---

## Quick Setup (Automated)

### Step 1: Download Project
```bash
# Extract the project folder to your desired location
# Example: C:\Users\YourName\Desktop\DeepFakeDetector
```

### Step 2: Run Automated Setup
```bash
# Double-click or run in Command Prompt
SETUP.bat
```

This will automatically:
- ✅ Check system requirements
- ✅ Install Python 3.8+ (if missing)
- ✅ Install Node.js 16+ (if missing)
- ✅ Install all dependencies
- ✅ Create configuration files
- ✅ Verify installation

### Step 3: Configure Environment
The setup script will prompt you for:
- MongoDB connection string
- Gmail email and app password
- Cloudinary credentials
- JWT secret key (auto-generated)

### Step 4: Start Application
```bash
scripts\start.bat
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## Manual Setup

### Step 1: Install Python
1. Download Python 3.8+: https://www.python.org/downloads/
2. During installation, check "Add Python to PATH"
3. Verify installation:
```bash
python --version
```

### Step 2: Install Node.js
1. Download Node.js 16+: https://nodejs.org/
2. Install with default settings
3. Verify installation:
```bash
node --version
npm --version
```

### Step 3: Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 4: Install Frontend Dependencies
```bash
cd frontend
npm install
```

### Step 5: Configure Environment Variables

#### Backend Configuration
Create `backend\.env` file:
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/deepfake_detector

# Email Service
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Security
JWT_SECRET=your-random-secret-key-min-32-chars
SECRET_KEY=your-flask-secret-key

# Server
PORT=5000
FLASK_ENV=production
```

#### Frontend Configuration
Create `frontend\.env` file:
```env
REACT_APP_API_URL=http://localhost:5000
```

---

## Running the Application

### Production Mode (Recommended)
```bash
# Start both frontend and backend
scripts\start.bat
```

### Development Mode (Hot Reload)
```bash
# Start with auto-reload on code changes
scripts\dev.bat
```

### Manual Start

#### Start Backend
```bash
cd backend
python app_new.py
```

#### Start Frontend (New Terminal)
```bash
cd frontend
npm start
```

### Stop Application
```bash
scripts\stop.bat
```

---

## Verification Steps

### 1. Check Backend Health
Open browser: http://localhost:5000/api/health

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00"
}
```

### 2. Check Frontend
Open browser: http://localhost:3000

You should see the login/register page.

### 3. Test Registration
1. Click "Register"
2. Enter email and password
3. Check email for OTP
4. Verify OTP
5. Login with credentials

---

## Troubleshooting

### Python Not Found
```bash
# Add Python to PATH manually
# Windows: Search "Environment Variables" → Edit PATH → Add Python folder
```

### Node.js Not Found
```bash
# Restart Command Prompt after Node.js installation
# Or add Node.js to PATH manually
```

### Port Already in Use
```bash
# Backend (Port 5000)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Frontend (Port 3000)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### MongoDB Connection Failed
- Verify connection string format
- Check network access in MongoDB Atlas (allow 0.0.0.0/0)
- Ensure database user has read/write permissions

### Email OTP Not Sending
- Verify Gmail App Password (16 characters, no spaces)
- Enable "Less secure app access" if using old Gmail
- Check SMTP settings in .env file

### Cloudinary Upload Failed
- Verify API credentials
- Check Cloudinary dashboard for quota limits
- Ensure file size within limits (100MB images, 500MB videos)

### Module Not Found Errors
```bash
# Reinstall backend dependencies
cd backend
pip install -r requirements.txt --force-reinstall

# Reinstall frontend dependencies
cd frontend
npm install --force
```

### Build Tools Missing (Windows)
```bash
# Install Visual Studio Build Tools
npm install --global windows-build-tools
```

---

## Quick Commands Reference

| Command | Purpose |
|---------|---------|
| `SETUP.bat` | Complete automated setup |
| `scripts\start.bat` | Start production servers |
| `scripts\dev.bat` | Start development mode |
| `scripts\stop.bat` | Stop all servers |
| `scripts\health-check.bat` | Verify system health |
| `scripts\install.bat` | Install dependencies only |

---

## Default Ports

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **MongoDB**: Remote (Atlas)

---

## Next Steps

1. ✅ Complete setup
2. ✅ Start application
3. ✅ Register account
4. ✅ Upload test image/video
5. ✅ View analysis results

For transferring to another PC, see [TRANSFER_GUIDE.md](TRANSFER_GUIDE.md)

---

**Need Help?** Check the main [README.md](README.md) or create an issue on GitHub.
