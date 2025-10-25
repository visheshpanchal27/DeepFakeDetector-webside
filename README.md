# DeepFake Detector - Full Stack Application

A complete full-stack application for detecting AI-generated content using advanced machine learning algorithms.

## 🚀 Quick Start

### One-Click Setup (Recommended)
```bash
# Complete automated setup
SETUP.bat
```

### Manual Setup
```bash
# 1. Check system requirements
scripts\health-check.bat

# 2. Install dependencies
scripts\install.bat

# 3. Configure environment
scripts\setup-config.bat

# 4. Start application
scripts\start.bat
```

### Prerequisites (Auto-installed)
- Python 3.8+ (auto-installed if missing)
- Node.js 16+ (auto-installed if missing)
- MongoDB Atlas account (free)
- Gmail account for OTP emails
- Cloudinary account (free)

## 📁 Project Structure

```
DeepFakeDetector/
├── backend/                    # Flask API server
│   ├── models/                # Database models (User, Analysis, OTP)
│   ├── routes/                # API routes (auth, analysis)
│   ├── services/              # Business logic (email, file handling)
│   ├── middleware/            # Authentication middleware
│   ├── uploads/               # Temporary file uploads
│   ├── app_new.py             # Main application (modular)
│   ├── detector.py            # Advanced ML detector
│   ├── simple_detector.py     # Fallback detector
│   └── requirements.txt       # Python dependencies
├── frontend/                   # React + Tailwind CSS
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Layout/        # Navigation, layout
│   │   │   ├── UI/            # FileUpload, LoadingSpinner
│   │   │   └── Analysis/      # ResultCard, charts
│   │   ├── pages/             # Page components
│   │   ├── context/           # React context (Auth)
│   │   └── utils/             # Helper functions
│   ├── public/                # Static files
│   └── package.json           # Node dependencies
├── docs/                       # Documentation
├── scripts/                    # Utility scripts
│   ├── install.bat            # Install dependencies
│   ├── start.bat              # Start application
│   └── dev.bat                # Development mode
└── config/                     # Configuration files
```

## 🎯 Features

### Authentication & Security
- **User Registration**: Email verification with OTP
- **Secure Login**: JWT-based authentication
- **Password Reset**: OTP-based recovery
- **Protected Routes**: Middleware authentication

### File Analysis
- **Drag & Drop Upload**: Modern file upload interface
- **Multiple Formats**: Images (JPG, PNG, GIF) & Videos (MP4, AVI, MOV)
- **Real-time Processing**: Advanced ML detection algorithms
- **Detailed Results**: Authenticity scores, confidence levels, risk assessment

### User Dashboard
- **Analysis History**: Track all previous analyses
- **Statistics**: Personal and global analytics
- **Profile Management**: Update user information
- **Responsive Design**: Works on all devices

### Advanced UI Components
- **Modern Design**: Tailwind CSS with custom components
- **Interactive Elements**: Loading states, progress bars
- **Toast Notifications**: Real-time feedback
- **Mobile Responsive**: Optimized for all screen sizes

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/verify-otp` - Verify email with OTP
- `POST /api/login` - User login
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password` - Reset password with OTP

### Analysis (Protected)
- `POST /api/analyze` - Analyze uploaded file
- `GET /api/history` - Get user analysis history
- `GET /api/stats` - Get user statistics
- `GET /api/global-stats` - Get global statistics
- `GET /api/health` - Health check

## 📊 Analysis Results

### Authenticity Assessment
- **Authenticity Score**: 0-100% human probability
- **Confidence Level**: Model confidence in prediction
- **Classification**: AUTHENTIC_HUMAN, HUMAN_ENHANCED, SUSPICIOUS, AI_GENERATED
- **Risk Level**: SAFE, LOW, MEDIUM, HIGH

### Individual Method Scores
- **Multiple Detection Methods**: Various ML algorithms
- **Detailed Breakdown**: Score per detection method
- **Visual Progress Bars**: Easy-to-understand results

## 🛠️ Technology Stack

### Backend
- **Flask**: Python web framework
- **MongoDB**: Document database
- **JWT**: Authentication tokens
- **Cloudinary**: File storage
- **TensorFlow/PyTorch**: ML models
- **OpenCV**: Image/video processing

### Frontend
- **React 18**: Modern UI library
- **Tailwind CSS**: Utility-first styling
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **React Hot Toast**: Notifications
- **Framer Motion**: Animations

### Development Tools
- **Hot Reload**: Development mode
- **Error Handling**: Comprehensive error management
- **Loading States**: User feedback
- **Form Validation**: Client & server-side

## 📈 Performance & Limits

- **Image Accuracy**: 92-95% (14 detection methods)
- **Video Accuracy**: 90-95% (10 detection methods + temporal analysis)
- **Speed**: 2-4 seconds per image, 10-24 seconds per video
- **File Limits**: 100MB images, 500MB videos
- **Supported Formats**: JPG, PNG, GIF, BMP, WebP, MP4, AVI, MOV, WebM, MKV

### Advanced Detection
- **Images**: GAN artifacts, texture analysis, wavelet, noise, forensic analysis
- **Videos**: Optical flow, face tracking, temporal artifacts, blinking patterns
- **See IMPROVEMENTS.md for full details**

## 🚀 Deployment

### Local Development
```bash
scripts\dev.bat  # Hot reload for both frontend and backend
```

### Local Production
```bash
scripts\start.bat  # Optimized production build
```

### Docker Deployment
```bash
# Development
docker-compose up --build

# Production
docker-compose -f docker-compose.production.yml up -d
```

### Cloud Deployment
- **Heroku**: Backend deployment ready
- **Netlify/Vercel**: Frontend deployment ready
- **AWS/Azure/GCP**: Docker images provided

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📝 Configuration

### Backend (.env)
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Email Service
SMTP_EMAIL=your_gmail@gmail.com
SMTP_PASSWORD=your_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Security
JWT_SECRET=your_jwt_secret_key
```

## 🛠️ Available Scripts

| Script | Purpose |
|--------|---------|
| `SETUP.bat` | Complete automated setup |
| `scripts\install.bat` | Install all dependencies |
| `scripts\start.bat` | Start production servers |
| `scripts\dev.bat` | Start development with hot reload |
| `scripts\stop.bat` | Stop all running servers |
| `scripts\health-check.bat` | System health verification |
| `scripts\test.bat` | Run all tests |
| `scripts\setup-config.bat` | Interactive configuration |

## 🔧 Cross-Platform Compatibility

### Windows (Primary)
- ✅ Full native support
- ✅ Automated installation scripts
- ✅ Visual Studio Build Tools auto-install
- ✅ Windows-optimized dependencies

### macOS/Linux
- ✅ Docker support
- ✅ Manual installation guides
- ✅ Shell script equivalents
- ✅ Cross-platform Python/Node.js

### Any PC Setup Guarantee
1. **System Check**: Automated dependency verification
2. **Auto-Install**: Missing software installed automatically
3. **Configuration**: Interactive setup wizard
4. **Validation**: Health checks ensure everything works
5. **Support**: Comprehensive troubleshooting guides

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Development Setup
```bash
# Quick development setup
scripts\dev.bat

# Run tests
scripts\test.bat

# Check code quality
scripts\health-check.bat
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check `docs/` folder
- **Issues**: Create GitHub issue
- **Email**: Contact support team

---

**Built with ❤️ for AI content detection and digital media authenticity**