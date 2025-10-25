# Deployment Guide

## Local Development

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB

### Quick Start
```bash
# Install dependencies
scripts\install.bat

# Start development servers
scripts\dev.bat
```

## Production Deployment

### Using Docker
```bash
# Build and start all services
cd config
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment

#### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

#### Frontend
```bash
cd frontend
npm install
npm run build
npm install -g serve
serve -s build -l 3000
```

## Environment Variables

### Backend (.env)
```
FLASK_ENV=production
SECRET_KEY=your-secret-key
MONGODB_URI=mongodb://localhost:27017/deepfake_detector
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
JWT_SECRET=your-jwt-secret
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENV=production
```

## Security Considerations

1. Change default passwords
2. Use HTTPS in production
3. Set up proper CORS
4. Configure rate limiting
5. Use environment variables for secrets
6. Regular security updates

## Monitoring

- Backend logs: `backend/deepfake_detector.log`
- Frontend build: `frontend/build/`
- Database: MongoDB logs
- Health check: `GET /api/health`