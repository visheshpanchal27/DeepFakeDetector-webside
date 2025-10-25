# MongoDB Setup Guide

## Installation

### Windows
1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. Start MongoDB service:
   ```cmd
   net start MongoDB
   ```

### Using MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `.env` file

## Configuration

Update your `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/deepfake_detector
# or for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/deepfake_detector
```

## Database Schema

The application uses these collections:
- `users` - User accounts and authentication
- `analyses` - Analysis results and history
- `sessions` - User sessions

## Verification

Test connection:
```bash
cd backend
python -c "from config import get_db_connection; print('Connected!' if get_db_connection() else 'Failed!')"
```