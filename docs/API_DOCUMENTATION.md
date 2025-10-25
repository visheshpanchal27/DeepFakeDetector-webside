# API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /register
Register a new user
```json
{
  "username": "string",
  "email": "string", 
  "password": "string"
}
```

#### POST /login
User login
```json
{
  "email": "string",
  "password": "string"
}
```

#### POST /verify-otp
Verify email with OTP
```json
{
  "email": "string",
  "otp": "string"
}
```

#### POST /forgot-password
Request password reset
```json
{
  "email": "string"
}
```

#### POST /reset-password
Reset password with OTP
```json
{
  "email": "string",
  "otp": "string",
  "new_password": "string"
}
```

### Analysis (Protected)

#### POST /analyze
Analyze uploaded file
- Content-Type: multipart/form-data
- Body: file (image/video)

#### GET /history
Get user analysis history
- Query params: page, limit

#### GET /stats
Get user statistics

#### GET /health
Health check endpoint

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "string"
}
```

### Error Response
```json
{
  "success": false,
  "error": "string",
  "message": "string"
}
```

## Analysis Result Format
```json
{
  "authenticity_score": 85.5,
  "classification": "AUTHENTIC_HUMAN",
  "risk_level": "SAFE",
  "confidence": 0.92,
  "processing_time": 2.3,
  "file_info": {
    "filename": "image.jpg",
    "size": 1024000,
    "format": "JPEG"
  },
  "detailed_scores": {
    "face_analysis": 0.88,
    "texture_analysis": 0.82,
    "compression_analysis": 0.91
  }
}
```