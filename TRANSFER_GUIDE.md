# Project Transfer Guide - DeepFake Detector

Complete guide to transfer the DeepFake Detector project to a different PC.

## 📋 Table of Contents
- [What to Transfer](#what-to-transfer)
- [Transfer Methods](#transfer-methods)
- [Setup on New PC](#setup-on-new-pc)
- [Important Notes](#important-notes)

---

## What to Transfer

### ✅ Files to Include
```
DeepFakeDetector/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── app_new.py
│   ├── detector.py
│   ├── simple_detector.py
│   ├── requirements.txt
│   └── .env.example          # Template only
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example          # Template only
├── scripts/
├── docs/
├── SETUP.bat
├── README.md
├── SETUP_GUIDE.md
└── TRANSFER_GUIDE.md
```

### ❌ Files to EXCLUDE
```
# DO NOT transfer these folders (will be regenerated):
backend/node_modules/
backend/__pycache__/
backend/uploads/
backend/venv/
backend/.env                  # Contains secrets!

frontend/node_modules/
frontend/build/
frontend/.env                 # Contains secrets!

.git/                         # Optional (large)
```

---

## Transfer Methods

### Method 1: USB Drive / External Storage (Recommended)

#### Step 1: Prepare Project Folder
```bash
# On original PC
cd DeepFakeDetector

# Delete unnecessary folders
rmdir /s /q backend\node_modules
rmdir /s /q backend\__pycache__
rmdir /s /q backend\uploads
rmdir /s /q backend\venv
rmdir /s /q frontend\node_modules
rmdir /s /q frontend\build
```

#### Step 2: Copy to USB Drive
1. Copy entire `DeepFakeDetector` folder to USB drive
2. Verify folder size (should be ~50-100MB without node_modules)

#### Step 3: Transfer to New PC
1. Insert USB drive into new PC
2. Copy `DeepFakeDetector` folder to desired location
   - Example: `C:\Users\YourName\Desktop\DeepFakeDetector`

---

### Method 2: Cloud Storage (Google Drive, OneDrive, Dropbox)

#### Step 1: Compress Project
```bash
# On original PC
# Right-click DeepFakeDetector folder → Send to → Compressed (zipped) folder
```

#### Step 2: Upload to Cloud
1. Upload `DeepFakeDetector.zip` to cloud storage
2. Share link or access from new PC

#### Step 3: Download on New PC
1. Download `DeepFakeDetector.zip`
2. Extract to desired location
3. Right-click → Extract All

---

### Method 3: Git Repository (For Developers)

#### Step 1: Push to GitHub (Original PC)
```bash
cd DeepFakeDetector

# Create .gitignore file
echo node_modules/ >> .gitignore
echo __pycache__/ >> .gitignore
echo venv/ >> .gitignore
echo .env >> .gitignore
echo uploads/ >> .gitignore
echo build/ >> .gitignore

# Initialize and push
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/deepfake-detector.git
git push -u origin main
```

#### Step 2: Clone on New PC
```bash
# On new PC
cd C:\Users\YourName\Desktop
git clone https://github.com/yourusername/deepfake-detector.git
cd deepfake-detector
```

---

## Setup on New PC

### Quick Setup (Automated) - RECOMMENDED

#### One-Command Setup & Start
```bash
# Double-click this file - it does everything!
FIRST_TIME_SETUP.bat
```

This single script will:
- ✅ Check Python and Node.js installation
- ✅ Install all backend dependencies
- ✅ Install all frontend dependencies
- ✅ Prompt for configuration (MongoDB, Gmail, Cloudinary)
- ✅ Create .env files automatically
- ✅ Start both backend and frontend servers

**Just enter your credentials when prompted and you're done!**

#### Quick Start (After First Setup)
```bash
# For subsequent runs, just double-click:
QUICK_START.bat
```

---

### Alternative: Use Existing Setup Script

#### Step 1: Open Project Folder
```bash
cd C:\Users\YourName\Desktop\DeepFakeDetector
```

#### Step 2: Run Setup Script
```bash
# Double-click or run in Command Prompt
SETUP.bat
```

This will:
- ✅ Install Python (if missing)
- ✅ Install Node.js (if missing)
- ✅ Install all dependencies
- ✅ Create configuration files

#### Step 3: Configure Environment
Enter your credentials when prompted:
- MongoDB URI (same as original PC)
- Gmail credentials (same as original PC)
- Cloudinary credentials (same as original PC)

#### Step 4: Start Application
```bash
scripts\start.bat
```

---

### Manual Setup

#### Step 1: Install Prerequisites
1. **Python 3.8+**: https://www.python.org/downloads/
2. **Node.js 16+**: https://nodejs.org/

#### Step 2: Install Dependencies
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

#### Step 3: Configure Environment

**Create `backend\.env`:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/deepfake_detector
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your-secret-key
SECRET_KEY=your-flask-secret
PORT=5000
```

**Create `frontend\.env`:**
```env
REACT_APP_API_URL=http://localhost:5000
```

#### Step 4: Run Application
```bash
scripts\start.bat
```

---

## Important Notes

### 🔐 Security Considerations

**NEVER transfer these files:**
- `backend\.env` - Contains sensitive credentials
- `frontend\.env` - Contains API URLs
- `backend\uploads\` - May contain user data

**Always:**
- Create new `.env` files on the new PC
- Use the same credentials from your accounts (MongoDB, Gmail, Cloudinary)
- Keep credentials secure and private

---

### 📊 Database & Storage

**MongoDB Atlas:**
- Same database works on all PCs
- No data transfer needed
- Just use the same connection string

**Cloudinary:**
- Same storage works on all PCs
- All uploaded files accessible
- Just use the same API credentials

**User Data:**
- All user accounts preserved
- Analysis history maintained
- No data loss during transfer

---

### 🔄 Multiple PC Setup

You can run the project on multiple PCs simultaneously:

1. **Same Configuration**: Use identical `.env` files
2. **Shared Database**: All PCs connect to same MongoDB
3. **Shared Storage**: All PCs use same Cloudinary account
4. **Independent Servers**: Each PC runs on localhost

**Example Use Cases:**
- Development on laptop, testing on desktop
- Team collaboration with shared database
- Backup setup on multiple machines

---

## Transfer Checklist

### Before Transfer (Original PC)
- [ ] Delete `node_modules` folders
- [ ] Delete `__pycache__` folders
- [ ] Delete `venv` folder
- [ ] Delete `uploads` folder
- [ ] Delete `build` folder
- [ ] Save `.env` credentials separately (secure location)
- [ ] Verify project folder size (~50-100MB)

### During Transfer
- [ ] Copy/compress project folder
- [ ] Transfer via USB/Cloud/Git
- [ ] Verify all files transferred successfully

### After Transfer (New PC)
- [ ] Extract/clone project
- [ ] Run `FIRST_TIME_SETUP.bat` (easiest option)
  - OR run `SETUP.bat` for traditional setup
  - OR manual setup if preferred
- [ ] Enter credentials when prompted
- [ ] Application starts automatically
- [ ] Test login and file upload
- [ ] For next time, use `QUICK_START.bat`

---

## Quick Transfer Commands

### Prepare for Transfer
```bash
# Delete generated folders
cd DeepFakeDetector
rmdir /s /q backend\node_modules backend\__pycache__ backend\venv backend\uploads
rmdir /s /q frontend\node_modules frontend\build
```

### Setup on New PC
```bash
# Method 1: One-command setup (RECOMMENDED)
cd DeepFakeDetector
FIRST_TIME_SETUP.bat

# Method 2: Traditional setup
cd DeepFakeDetector
SETUP.bat

# Method 3: Quick start (if already configured)
cd DeepFakeDetector
QUICK_START.bat
```

---

## Troubleshooting Transfer Issues

### Project Won't Start
```bash
# Reinstall dependencies
cd backend
pip install -r requirements.txt

cd frontend
npm install
```

### Missing Configuration
```bash
# Run configuration wizard
scripts\setup-config.bat
```

### Port Conflicts
```bash
# Check and kill processes
netstat -ano | findstr :5000
netstat -ano | findstr :3000
```

### Permission Errors
- Run Command Prompt as Administrator
- Check folder permissions
- Ensure antivirus isn't blocking

---

## Estimated Transfer Sizes

| Component | Size (without dependencies) |
|-----------|----------------------------|
| Backend code | ~5-10 MB |
| Frontend code | ~2-5 MB |
| Scripts & docs | ~1 MB |
| **Total** | **~10-20 MB** |

| Component | Size (with dependencies) |
|-----------|-------------------------|
| Backend (with venv) | ~500 MB |
| Frontend (with node_modules) | ~300 MB |
| **Total** | **~800 MB** |

**Recommendation**: Transfer without dependencies, reinstall on new PC.

---

## Support

For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md)

For general information, see [README.md](README.md)

---

**✅ Transfer Complete!** Your DeepFake Detector is ready to run on the new PC.
