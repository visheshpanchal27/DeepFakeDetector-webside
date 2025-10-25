# Frontend Documentation - DeepFake Detector

## 📋 Table of Contents
- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Components](#components)
- [Pages](#pages)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Routing](#routing)
- [Authentication Flow](#authentication-flow)
- [File Upload System](#file-upload-system)
- [Setup & Installation](#setup--installation)
- [Development & Deployment](#development--deployment)

---

## Overview

Modern React-based SPA providing intuitive interface for AI-generated content detection. Built with React 18, Tailwind CSS, and modern JavaScript practices.

### Key Features
- 🔐 Complete authentication (Register, Login, Password Reset)
- 📤 Drag-and-drop file upload with preview
- 📊 Real-time analysis results with visual charts
- 📜 Analysis history with filtering
- 📈 Statistics dashboard (personal & global)
- 👤 User profile management
- 📱 Fully responsive design
- 🎨 Modern UI with smooth animations
- 🔔 Toast notifications

---

## Technology Stack

### Core Libraries
- **React 18.2.0** - UI library with hooks
- **React Router DOM 6.x** - Client-side routing
- **Axios 1.x** - HTTP client
- **Tailwind CSS 3.x** - Utility-first CSS

### UI & UX
- **React Hot Toast** - Toast notifications
- **Lucide React** - Modern icons
- **Framer Motion** - Animations (optional)

### Development Tools
- **Vite** - Fast build tool
- **ESLint** - Code linting
- **PostCSS** - CSS processing

---

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
│
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Layout.jsx
│   │   ├── UI/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   └── FileUpload.jsx
│   │   ├── Analysis/
│   │   │   ├── ResultCard.jsx
│   │   │   ├── ScoreChart.jsx
│   │   │   ├── MethodScores.jsx
│   │   │   └── RiskBadge.jsx
│   │   └── Auth/
│   │       ├── ProtectedRoute.jsx
│   │       └── AuthForm.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Analyze.jsx
│   │   ├── History.jsx
│   │   ├── Profile.jsx
│   │   └── NotFound.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── utils/
│   │   ├── api.js
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── validators.js
│   │
│   ├── styles/
│   │   ├── index.css
│   │   └── tailwind.css
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── routes.jsx
│
├── .env
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## Components

### Layout Components

#### Navbar.jsx
- Logo and branding
- Navigation links (Home, Dashboard, Analyze, History)
- User menu (Profile, Logout)
- Mobile responsive hamburger menu
- Active route highlighting

#### Footer.jsx
- Copyright information
- Social media links
- Quick links
- Contact information

#### Layout.jsx
- Wraps all pages with Navbar and Footer
- Consistent spacing and structure
- Scroll to top on route change

### UI Components

#### Button.jsx
```jsx
Props:
- variant: 'primary' | 'secondary' | 'danger' | 'ghost'
- size: 'sm' | 'md' | 'lg'
- loading: boolean
- disabled: boolean
- onClick: function
- children: ReactNode
```

#### Input.jsx
```jsx
Props:
- type: 'text' | 'email' | 'password' | 'number'
- label: string
- error: string
- required: boolean
- placeholder: string
- value: string
- onChange: function
```

#### Card.jsx
```jsx
Props:
- title: string
- subtitle: string
- children: ReactNode
- className: string
- hoverable: boolean
```

#### LoadingSpinner.jsx
```jsx
Props:
- size: 'sm' | 'md' | 'lg'
- color: string
- fullScreen: boolean
```

#### FileUpload.jsx
```jsx
Features:
- Drag and drop zone
- Click to browse
- File type validation
- File size validation
- Preview for images
- Progress indicator

Props:
- accept: string
- maxSize: number
- onFileSelect: function
- loading: boolean
```

### Analysis Components

#### ResultCard.jsx
```jsx
Features:
- Authenticity score with color coding
- Confidence level
- Classification badge
- Risk level indicator
- Timestamp
- File information

Props:
- result: object
- onViewDetails: function
```

#### ScoreChart.jsx
```jsx
Features:
- Circular progress chart
- Color-coded by risk level
- Animated transitions
- Percentage display

Props:
- score: number (0-100)
- label: string
- size: 'sm' | 'md' | 'lg'
```

#### MethodScores.jsx
```jsx
Features:
- List of all detection methods
- Progress bars for each method
- Score percentages
- Method descriptions (tooltip)

Props:
- scores: object
```

#### RiskBadge.jsx
```jsx
Features:
- Color-coded badges
- Icon indicators
- Tooltip with description

Props:
- riskLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH'
- size: 'sm' | 'md' | 'lg'
```

### Auth Components

#### ProtectedRoute.jsx
```jsx
Features:
- Check authentication status
- Redirect to login if not authenticated
- Show loading while checking auth
- Pass through if authenticated

Props:
- children: ReactNode
- redirectTo: string
```

---

## Pages

### Home.jsx
- Hero section with CTA
- Feature highlights
- How it works section
- Statistics showcase
- Call to action buttons

### Login.jsx
- Email and password form
- Form validation
- Error handling
- Remember me option
- Forgot password link
- Register link

### Register.jsx
- Multi-step form (optional)
- Email, password, name fields
- Password strength indicator
- Terms acceptance
- OTP verification
- Auto-login after verification

### ForgotPassword.jsx
- Email input
- Send OTP to email
- Success message
- Redirect to reset form

### ResetPassword.jsx
- OTP input
- New password fields
- Password confirmation
- Validation
- Success redirect to login

### Dashboard.jsx
- Welcome message
- Quick stats cards
- Recent analyses
- Quick action buttons
- Global statistics

### Analyze.jsx
- File upload component
- File preview
- Analysis progress
- Real-time results
- Download report option
- Analyze another file

### History.jsx
- List of past analyses
- Filtering options (date, type, score)
- Sorting options
- Pagination
- View details modal
- Delete analysis option

### Profile.jsx
- User information display
- Edit profile form
- Change password
- Account statistics
- Delete account option

---

## State Management

### AuthContext
```jsx
Context provides:
- user: object | null
- token: string | null
- loading: boolean
- login: function
- logout: function
- register: function
- updateUser: function
- isAuthenticated: boolean

Usage:
import { useAuth } from '../context/AuthContext';
const { user, login, logout } = useAuth();
```

### Local State Management
- Component-level state with useState
- Form state management
- Loading states
- Error states
- Modal visibility states

---

## API Integration

### API Configuration (utils/api.js)

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Logout and redirect
    }
    return Promise.reject(error);
  }
);
```

### API Endpoints

#### Authentication
```javascript
POST /api/register
Body: { email, password, name }

POST /api/verify-otp
Body: { email, otp }

POST /api/login
Body: { email, password }

POST /api/forgot-password
Body: { email }

POST /api/reset-password
Body: { email, otp, newPassword }
```

#### Analysis (Protected)
```javascript
POST /api/analyze
Body: FormData { file }
Headers: { Authorization: Bearer <token> }

GET /api/history?page=1&limit=10
Headers: { Authorization: Bearer <token> }

GET /api/stats
Headers: { Authorization: Bearer <token> }

GET /api/global-stats
```

---

## Routing

### Route Configuration (App.jsx)

```jsx
<BrowserRouter>
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />

    {/* Protected Routes */}
    <Route path="/dashboard" element={
      <ProtectedRoute><Dashboard /></ProtectedRoute>
    } />
    <Route path="/analyze" element={
      <ProtectedRoute><Analyze /></ProtectedRoute>
    } />
    <Route path="/history" element={
      <ProtectedRoute><History /></ProtectedRoute>
    } />
    <Route path="/profile" element={
      <ProtectedRoute><Profile /></ProtectedRoute>
    } />

    {/* 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

---

## Authentication Flow

### Registration Flow
1. User fills registration form
2. Frontend validates input
3. POST /api/register
4. Backend sends OTP to email
5. User enters OTP
6. POST /api/verify-otp
7. Token returned and stored
8. Redirect to dashboard

### Login Flow
1. User enters credentials
2. POST /api/login
3. Token returned and stored
4. User object stored in context
5. Redirect to dashboard

### Password Reset Flow
1. User enters email
2. POST /api/forgot-password
3. OTP sent to email
4. User enters OTP and new password
5. POST /api/reset-password
6. Redirect to login

### Token Management
```javascript
// Store token
localStorage.setItem('token', token);

// Retrieve token
const token = localStorage.getItem('token');

// Remove token (logout)
localStorage.removeItem('token');
```

---

## File Upload System

### FileUpload Component

```jsx
// Drag and drop
const handleDrop = (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;
  handleFiles(files);
};

// File validation
const validateFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'video/mp4'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }
  
  const maxSize = file.type.startsWith('image/') 
    ? 100 * 1024 * 1024 
    : 500 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large' };
  }
  
  return { valid: true };
};

// Upload with progress
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/api/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      const progress = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      setUploadProgress(progress);
    }
  });
  
  return response.data;
};
```

---

## Setup & Installation

### Prerequisites
- Node.js 16+
- npm or yarn
- Backend API running

### Installation

```bash
cd frontend

npm install

cp .env.example .env

# Edit .env
VITE_API_URL=http://localhost:5000

npm run dev
```

### Environment Variables

```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=DeepFake Detector
VITE_MAX_FILE_SIZE_IMAGE=104857600
VITE_MAX_FILE_SIZE_VIDEO=524288000
```

---

## Development & Deployment

### Development Server
```bash
npm run dev
# Access at http://localhost:5173
```

### Production Build
```bash
npm run build
# Output in dist/ directory
```

### Preview Build
```bash
npm run preview
```

### Deployment

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### Vercel
```bash
npm install -g vercel
vercel --prod
```

#### Manual
1. Build: `npm run build`
2. Upload `dist/` to server
3. Configure SPA routing

### SPA Server Config

#### Nginx
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

#### Apache
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

## Styling

### Tailwind Configuration

```javascript
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#3b82f6',
          600: '#2563eb',
        },
        danger: {
          500: '#ef4444',
        },
        success: {
          500: '#10b981',
        }
      }
    }
  }
}
```

### Component Patterns

```jsx
// Responsive spacing
className="p-4 md:p-6 lg:p-8"

// Grid layout
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"

// Card styling
className="bg-white rounded-lg shadow-md hover:shadow-lg transition"

// Button variants
primary: "bg-blue-600 hover:bg-blue-700 text-white"
secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800"
```

---

## Best Practices

1. **Components**: Keep small and reusable
2. **State**: Use context for global, local for component-specific
3. **Error Handling**: Handle API errors gracefully
4. **Loading States**: Show indicators for async operations
5. **Validation**: Validate on both client and server
6. **Accessibility**: Use semantic HTML and ARIA labels
7. **Performance**: Lazy load routes and images
8. **Security**: Never store sensitive data in localStorage

---

**Built with React + Tailwind CSS** ⚛️
