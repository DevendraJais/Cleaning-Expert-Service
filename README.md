<p align="center">
  <img src="Frontend/public/logo.png" alt="Appzeto Logo" width="200"/>
</p>

<h1 align="center">🏠 Appzeto - Home Services Platform</h1>

<p align="center">
  <strong>A comprehensive on-demand home services marketplace connecting users with trusted vendors and skilled workers</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#installation">Installation</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#api-documentation">API Documentation</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v18+-green?style=for-the-badge&logo=node.js" alt="Node.js"/>
  <img src="https://img.shields.io/badge/React-v19-blue?style=for-the-badge&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/MongoDB-v6+-brightgreen?style=for-the-badge&logo=mongodb" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Express-v4.22-lightgrey?style=for-the-badge&logo=express" alt="Express"/>
  <img src="https://img.shields.io/badge/Socket.io-v4.8-black?style=for-the-badge&logo=socket.io" alt="Socket.io"/>
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 Overview

**Appzeto** is a full-stack, enterprise-grade home services marketplace platform that connects customers with professional service providers. The platform supports multiple user roles including:

- **Users/Customers** - Book services, track bookings, make payments
- **Vendors** - Manage services, accept bookings, manage workers
- **Workers** - Handle assigned jobs, collect payments, track earnings
- **Administrators** - Complete platform management and analytics

The platform features real-time notifications, live location tracking, secure payments, and a comprehensive admin dashboard for platform governance.

---

## ✨ Features

### 👤 User Features
| Feature | Description |
|---------|-------------|
| 🔐 **OTP Authentication** | Secure phone-based OTP login and registration |
| 📱 **Service Booking** | Browse and book home services with ease |
| 🛒 **Shopping Cart** | Add multiple services before checkout |
| 💳 **Online Payments** | Razorpay integration for secure transactions |
| 📍 **Live Tracking** | Real-time tracking of service provider location |
| 🔔 **Push Notifications** | FCM-powered notifications for booking updates |
| 📊 **Booking History** | Complete history of past and current bookings |
| ⭐ **Reviews & Ratings** | Rate and review completed services |
| 💰 **Wallet System** | In-app wallet for quick payments |

### 🏪 Vendor Features
| Feature | Description |
|---------|-------------|
| 📋 **Service Management** | Create and manage service offerings |
| 👷 **Worker Management** | Onboard and assign workers to jobs |
| 📈 **Dashboard Analytics** | Revenue, bookings, and performance metrics |
| 💵 **Earnings Management** | Track earnings and request withdrawals |
| 📱 **Real-time Alerts** | Wave-based booking alerts system |
| 🗓️ **Booking Management** | Accept, assign, and track bookings |
| 💳 **Settlement Tracking** | Track admin settlements and dues |

### 👷 Worker Features
| Feature | Description |
|---------|-------------|
| 📋 **Job Dashboard** | View and manage assigned jobs |
| 📍 **Location Sharing** | Share live location with customers |
| 💵 **Cash Collection** | Collect and record cash payments |
| 💰 **Earnings Tracker** | Track daily and weekly earnings |
| 🔔 **Job Notifications** | Receive notifications for new assignments |

### 🛠️ Admin Features
| Feature | Description |
|---------|-------------|
| 📊 **Comprehensive Dashboard** | Platform-wide analytics and metrics |
| 👥 **User Management** | Manage users, vendors, and workers |
| 📦 **Service & Category Management** | Configure service catalog |
| 💼 **Booking Oversight** | Monitor all platform bookings |
| 💳 **Payment Management** | Track transactions and process refunds |
| 📑 **Settlement Management** | Handle vendor settlements and withdrawals |
| 📄 **Report Generation** | Generate business reports |
| ⚙️ **Platform Settings** | Configure platform-wide settings |
| 🏷️ **Plan Management** | Create and manage subscription plans |
| 🖼️ **Home Page CMS** | Customize app home page content |

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime Environment | v18+ |
| **Express.js** | Web Framework | v4.22 |
| **MongoDB** | Database | v6+ |
| **Mongoose** | ODM | v8.20 |
| **Socket.io** | Real-time Communication | v4.8 |
| **Redis** | Caching & Session Management | v5.9 |
| **JWT** | Authentication | v9.0 |
| **Firebase Admin** | Push Notifications | v13.6 |
| **Razorpay** | Payment Gateway | v2.9 |
| **Cloudinary** | Media Storage | v1.41 |
| **Nodemailer** | Email Service | v6.9 |
| **Helmet** | Security Headers | v7.1 |

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | v19.2 |
| **Vite** | Build Tool | v7.2 |
| **Tailwind CSS** | Styling | v4.1 |
| **React Router** | Routing | v7.10 |
| **Axios** | HTTP Client | v1.13 |
| **Socket.io Client** | Real-time Client | v4.8 |
| **Firebase** | Push Notifications | v12.7 |
| **Framer Motion** | Animations | v12.23 |
| **GSAP** | Advanced Animations | v3.13 |
| **Leaflet** | Maps | v1.9 |
| **React Google Maps** | Google Maps Integration | v2.20 |
| **Recharts** | Data Visualization | v3.6 |
| **React Hot Toast** | Notifications | v2.6 |
| **React Icons** | Icon Library | v5.5 |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT APPLICATIONS                         │
├─────────────────┬─────────────────┬─────────────────┬───────────────┤
│   User App      │   Vendor App    │   Worker App    │   Admin Panel │
│   (React PWA)   │   (React PWA)   │   (React PWA)   │   (React SPA) │
└────────┬────────┴────────┬────────┴────────┬────────┴───────┬───────┘
         │                 │                 │                │
         └─────────────────┴────────┬────────┴────────────────┘
                                    │
                         ┌──────────▼──────────┐
                         │    API Gateway      │
                         │   (Express.js)      │
                         │   - Rate Limiting   │
                         │   - CORS            │
                         │   - Helmet Security │
                         └──────────┬──────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
┌────────▼────────┐      ┌──────────▼──────────┐    ┌─────────▼─────────┐
│   REST API      │      │    Socket.io        │    │   Firebase Cloud  │
│   Endpoints     │      │   Real-time Server  │    │   Messaging (FCM) │
│                 │      │                     │    │                   │
│ - Auth Routes   │      │ - Location Updates  │    │ - Push Notifs     │
│ - User Routes   │      │ - Booking Alerts    │    │ - Background Msgs │
│ - Vendor Routes │      │ - Live Tracking     │    │                   │
│ - Admin Routes  │      │ - Chat (Future)     │    │                   │
└────────┬────────┘      └──────────┬──────────┘    └───────────────────┘
         │                          │
         └────────────┬─────────────┘
                      │
         ┌────────────▼────────────┐
         │      MongoDB Atlas      │
         │    (Primary Database)   │
         │                         │
         │ - Users, Vendors, Workers│
         │ - Bookings, Services    │
         │ - Transactions, Payments │
         └────────────┬────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
┌───▼───┐      ┌──────▼──────┐    ┌─────▼─────┐
│ Redis │      │  Cloudinary │    │ Razorpay  │
│ Cache │      │   (Media)   │    │ (Payments)│
└───────┘      └─────────────┘    └───────────┘
```

---

## 📥 Installation

### Prerequisites

Ensure you have the following installed on your system:

| Software | Minimum Version | Download Link |
|----------|-----------------|---------------|
| Node.js | v18.0.0 | [Download](https://nodejs.org/) |
| npm | v9.0.0 | Comes with Node.js |
| MongoDB | v6.0 | [Download](https://www.mongodb.com/try/download/community) |
| Redis | v7.0 (Optional) | [Download](https://redis.io/download) |
| Git | v2.40 | [Download](https://git-scm.com/) |

### Step-by-Step Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/appzeto.git
cd appzeto
```

#### 2. Install Backend Dependencies

```bash
cd Backend
npm install
```

#### 3. Install Frontend Dependencies

```bash
cd ../Frontend
npm install
```

#### 4. Environment Configuration

Create environment files for both backend and frontend:

**Backend (.env)**
```bash
cd Backend
cp env.example .env
# Edit .env with your configuration
```

**Frontend (.env)**
```bash
cd Frontend
cp .env.example .env
# Edit .env with your configuration
```

---

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `Backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/appzeto
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/appzeto?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-token-secret-change-this-in-production
JWT_REFRESH_EXPIRE=30d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=120

# Cloudinary Configuration (Media Storage)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="Appzeto <noreply@appzeto.com>"

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Redis Configuration (Optional but recommended)
REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# OTP Configuration
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5
USE_DEFAULT_OTP=true  # Set to false in production

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Frontend Environment Variables

Create a `.env` file in the `Frontend` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx

# App Configuration
VITE_APP_NAME=Appzeto

# Socket.io Configuration
VITE_SOCKET_URL=http://localhost:5000

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_FIREBASE_VAPID_KEY=your_vapid_key_here
```

---

## 🚀 Running the Application

### Development Mode

#### Terminal 1: Start Backend Server
```bash
cd Backend
npm run dev
```
The backend server will start on `http://localhost:5000`

#### Terminal 2: Start Frontend Development Server
```bash
cd Frontend
npm run dev
```
The frontend will be available at `http://localhost:5173`

### Production Mode

#### Build Frontend
```bash
cd Frontend
npm run build
```

#### Start Backend
```bash
cd Backend
npm start
```

### Database Seeding

Seed the database with initial data:

```bash
cd Backend

# Seed admin user
npm run seed:admin

# Seed database with sample data
npm run seed:database

# Seed category sections
npm run seed:category-sections

# Upload category icons
npm run upload:icons
```

---

## 📁 Project Structure

```
appzeto/
├── 📁 Backend/
│   ├── 📁 config/              # Database and service configurations
│   │   ├── db.js               # MongoDB connection
│   │   └── firebase.js         # Firebase Admin SDK setup
│   │
│   ├── 📁 controllers/         # Route handlers (42 controllers)
│   │   ├── 📁 admin/           # Admin-specific controllers
│   │   ├── 📁 user/            # User-specific controllers
│   │   ├── 📁 vendor/          # Vendor-specific controllers
│   │   └── 📁 worker/          # Worker-specific controllers
│   │
│   ├── 📁 middleware/          # Custom middleware
│   │   ├── auth.js             # JWT authentication
│   │   ├── rateLimiter.js      # Rate limiting
│   │   ├── errorHandler.js     # Error handling
│   │   └── upload.js           # File upload middleware
│   │
│   ├── 📁 models/              # Mongoose schemas (20 models)
│   │   ├── User.js             # User model
│   │   ├── Vendor.js           # Vendor model
│   │   ├── Worker.js           # Worker model
│   │   ├── Booking.js          # Booking model
│   │   ├── Service.js          # Service model
│   │   ├── Category.js         # Category model
│   │   └── ...                 # Other models
│   │
│   ├── 📁 routes/              # API route definitions
│   │   ├── 📁 admin-routes/    # Admin API routes
│   │   ├── 📁 user-routes/     # User API routes
│   │   ├── 📁 vendor-routes/   # Vendor API routes
│   │   ├── 📁 worker-routes/   # Worker API routes
│   │   ├── 📁 public-routes/   # Public API routes
│   │   └── 📁 payment-routes/  # Payment API routes
│   │
│   ├── 📁 services/            # Business logic services
│   │   ├── bookingScheduler.js # Wave-based alerting system
│   │   ├── cloudinaryService.js# Image upload service
│   │   ├── emailService.js     # Email notifications
│   │   ├── firebaseAdmin.js    # FCM push notifications
│   │   ├── razorpayService.js  # Payment processing
│   │   ├── redisService.js     # Caching service
│   │   ├── otpService.js       # OTP generation/verification
│   │   └── smsService.js       # SMS notifications
│   │
│   ├── 📁 sockets/             # Socket.io handlers
│   │   └── index.js            # Real-time event handlers
│   │
│   ├── 📁 scripts/             # Utility scripts
│   │   ├── seedAdmin.js        # Admin seeder
│   │   ├── seedDatabase.js     # Database seeder
│   │   └── ...                 # Other scripts
│   │
│   ├── 📁 utils/               # Utility functions
│   │   ├── validators.js       # Input validation
│   │   └── helpers.js          # Helper functions
│   │
│   ├── server.js               # Application entry point
│   ├── package.json            # Dependencies
│   └── env.example             # Environment template
│
├── 📁 Frontend/
│   ├── 📁 public/              # Static assets
│   │   ├── favicon.ico         # App favicon
│   │   └── firebase-messaging-sw.js # Service worker
│   │
│   ├── 📁 src/
│   │   ├── 📁 assets/          # Images, fonts, etc.
│   │   │
│   │   ├── 📁 components/      # Reusable components
│   │   │   ├── 📁 auth/        # Authentication components
│   │   │   └── 📁 common/      # Shared UI components
│   │   │
│   │   ├── 📁 context/         # React context providers
│   │   │   └── AuthContext.jsx # Authentication context
│   │   │
│   │   ├── 📁 hooks/           # Custom React hooks
│   │   │   ├── useAuth.js      # Auth hook
│   │   │   └── useSocket.js    # Socket.io hook
│   │   │
│   │   ├── 📁 modules/         # Feature modules
│   │   │   ├── 📁 admin/       # Admin dashboard (75 files)
│   │   │   ├── 📁 user/        # User app (83 files)
│   │   │   ├── 📁 vendor/      # Vendor app (60 files)
│   │   │   └── 📁 worker/      # Worker app (23 files)
│   │   │
│   │   ├── 📁 services/        # API service functions
│   │   │   ├── api.js          # Base API configuration
│   │   │   ├── authService.js  # Authentication API
│   │   │   └── ...             # Other services
│   │   │
│   │   ├── 📁 routes/          # Route definitions
│   │   ├── 📁 theme/           # Theme configuration
│   │   ├── 📁 utils/           # Utility functions
│   │   │
│   │   ├── App.jsx             # Root component
│   │   ├── main.jsx            # Application entry
│   │   ├── firebase.js         # Firebase configuration
│   │   └── index.css           # Global styles
│   │
│   ├── index.html              # HTML template
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # Tailwind configuration
│   └── package.json            # Dependencies
│
└── README.md                   # This file
```

---

## 📚 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://api.yourDomain.com/api
```

### Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### API Endpoints Overview

#### 🔐 Authentication APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/auth/send-otp` | Send OTP to user |
| POST | `/users/auth/verify-otp` | Verify OTP and login |
| POST | `/users/auth/register` | Register new user |
| POST | `/vendors/auth/send-otp` | Send OTP to vendor |
| POST | `/vendors/auth/verify-otp` | Verify vendor OTP |
| POST | `/workers/auth/send-otp` | Send OTP to worker |
| POST | `/admin/auth/login` | Admin login |

#### 👤 User APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/profile` | Get user profile |
| PUT | `/users/profile` | Update user profile |
| GET | `/users/bookings` | Get user bookings |
| POST | `/users/bookings` | Create new booking |
| GET | `/users/cart` | Get cart items |
| POST | `/users/cart` | Add to cart |

#### 🏪 Vendor APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vendors/profile` | Get vendor profile |
| PUT | `/vendors/profile` | Update vendor profile |
| GET | `/vendors/bookings` | Get vendor bookings |
| PUT | `/vendors/bookings/:id` | Update booking status |
| GET | `/vendors/workers` | Get vendor workers |
| POST | `/vendors/workers` | Add new worker |

#### 👷 Worker APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workers/profile` | Get worker profile |
| GET | `/workers/jobs` | Get assigned jobs |
| PUT | `/workers/jobs/:id` | Update job status |
| GET | `/workers/earnings` | Get earnings data |

#### 🛠️ Admin APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Get dashboard stats |
| GET | `/admin/users` | Get all users |
| GET | `/admin/vendors` | Get all vendors |
| GET | `/admin/bookings` | Get all bookings |
| GET | `/admin/transactions` | Get all transactions |
| POST | `/admin/categories` | Create category |
| POST | `/admin/services` | Create service |

#### 📦 Public APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/public/categories` | Get all categories |
| GET | `/public/services` | Get all services |
| GET | `/public/plans` | Get available plans |
| GET | `/public/config` | Get app configuration |

#### 💳 Payment APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/create-order` | Create Razorpay order |
| POST | `/payments/verify` | Verify payment |
| POST | `/payments/webhook` | Razorpay webhook |

---

## 🗄️ Database Schema

### Core Models

#### User Model
```javascript
{
  name: String,
  phone: String (unique),
  email: String,
  profilePhoto: String,
  addresses: [{
    type: String,
    address: String,
    location: { lat, lng },
    isDefault: Boolean
  }],
  fcmTokens: [String],
  wallet: { balance: Number },
  isBlocked: Boolean,
  createdAt: Date
}
```

#### Vendor Model
```javascript
{
  businessName: String,
  ownerName: String,
  phone: String (unique),
  email: String,
  profilePhoto: String,
  aadhar: { number, frontImage, backImage },
  address: String,
  location: { lat, lng },
  services: [ObjectId],
  workers: [ObjectId],
  rating: Number,
  wallet: { balance, dues },
  cashLimit: Number,
  isBlocked: Boolean,
  isVerified: Boolean
}
```

#### Booking Model
```javascript
{
  user: ObjectId,
  vendor: ObjectId,
  worker: ObjectId,
  service: ObjectId,
  items: [{ service, quantity, price }],
  status: String,
  scheduledDate: Date,
  scheduledTime: String,
  address: Object,
  otp: { code, verified },
  payment: {
    method: String,
    status: String,
    amount: Number,
    transactionId: String
  },
  extras: [{ description, amount }],
  ratings: { userRating, userReview }
}
```

---

## 🌐 Deployment

### Backend Deployment (Vercel/Railway/DigitalOcean)

#### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set the root directory to `Backend`
3. Configure environment variables
4. Deploy

#### Railway Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Set the root directory to `Frontend`
3. Configure environment variables
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB URI
- [ ] Set strong JWT secrets
- [ ] Configure production Razorpay keys
- [ ] Enable Redis for caching
- [ ] Set up SSL/HTTPS
- [ ] Configure CORS for production domains
- [ ] Set up monitoring (PM2, New Relic)
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

---

## 🧪 Testing

### Running Tests

```bash
cd Backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

### Test Structure
```
Backend/tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
└── e2e/           # End-to-end tests
```

---

## 🔧 Troubleshooting

### Common Issues

#### MongoDB Connection Issues
```bash
# Check MongoDB is running
mongod --version

# Start MongoDB service
sudo systemctl start mongod
```

#### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

#### CORS Errors
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that credentials are enabled in both frontend and backend CORS config

#### Push Notifications Not Working
- Verify Firebase credentials in both frontend and backend
- Check browser permissions for notifications
- Ensure service worker is registered correctly

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Coding Standards
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the **ISC License**.

```
ISC License

Copyright (c) 2024 Appzeto

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

---

## 📞 Contact & Support

### Project Maintainers

| Name | Role | Contact |
|------|------|---------|
| Shubham | Lead Developer | [GitHub](https://github.com/shubham) |

### Get Help

- 📧 **Email**: support@appzeto.com
- 💬 **Discord**: [Join our community](#)
- 📖 **Documentation**: [Wiki](#)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/appzeto/issues)

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI Library
- [Express.js](https://expressjs.com/) - Backend Framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Socket.io](https://socket.io/) - Real-time Engine
- [Razorpay](https://razorpay.com/) - Payment Gateway
- [Firebase](https://firebase.google.com/) - Push Notifications
- [Cloudinary](https://cloudinary.com/) - Media Management
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework

---

<p align="center">
  Made with ❤️ by the Appzeto Team
</p>

<p align="center">
  <a href="#top">⬆️ Back to Top</a>
</p>
