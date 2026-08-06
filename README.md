# Omkareswar Realtors - Full-Stack Integration Guide

Welcome to the production-ready full-stack codebase of **Omkareswar Realtors**, a high-end estate management platform. This project features a React (Vite) frontend completely integrated with an Express/Sequelize (PostgreSQL) backend, replacing all client-side mock storage states with permanent database persistence, full authentication flows, and real-time Socket.IO notifications.

---

## 1. Project Overview & Architecture

The application is split into two main directory trees:
- **Frontend (Root Directory)**: React SPA styled with Vanilla CSS and compiled with Vite. All application state operations communicate directly via `apiClient` to the express backend.
- **Backend (`/backend`)**: Node.js Express server using Sequelize ORM for schema migration and query building. Authenticated endpoints require JSON Web Tokens (JWT) passed in request headers.

---

## 2. Environment Configurations

Both components are managed via environment variables. Example configuration templates are provided at the root and in the backend folder.

### Frontend Env (`/.env`)
Create a `.env` file at the root:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_UPLOAD_URL=http://localhost:5000/uploads
```

### Backend Env (`/backend/.env`)
Create a `.env` file in the `/backend` folder:
```env
PORT=5000
NODE_ENV=development
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=omkareswar_realtors
DB_TEST_NAME=omkareswar_realtors_test
DB_USER=postgres
DB_PASSWORD=user
DB_SSL=false

JWT_SECRET=omkareswar_realtors_jwt_secret_key_2026_super_secure
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=omkareswar_realtors_jwt_refresh_secret_key_2026
JWT_REFRESH_EXPIRES_IN=7d

OTP_MODE=demo
DEMO_OTP=1234
OTP_EXPIRY_MINUTES=10

FRONTEND_URL=http://localhost:3000
UPLOAD_BASE_URL=http://localhost:5000/uploads
MAX_IMAGE_SIZE_MB=5

SEED_ADMIN_LOGIN_ID=ADMIN001
SEED_ADMIN_PASSWORD=Admin@123
```

---

## 3. Installation & Local Setup

Follow these steps sequentially to setup the application:

### Step 1: Install Dependencies
Open a shell in the root workspace folder:
```bash
# Install Frontend dependencies
npm install

# Change directory and install Backend dependencies
cd backend
npm install
```

### Step 2: Database Setup & Migrations
Ensure your PostgreSQL instance is running (default port `5432`). Log in and create the required databases, then run migrations and seeders:
```bash
# Connect to your local PostgreSQL instance and execute:
CREATE DATABASE omkareswar_realtors;
CREATE DATABASE omkareswar_realtors_test;

# Run migrations and seed data in the backend folder:
cd backend
npm run db:migrate
npm run db:seed
```

### Step 3: Running the Application Locally
To launch both environments concurrently:
```bash
# In the backend directory:
npm run dev

# Open another terminal in the root directory:
npm run dev
```
- Frontend will run on: `http://localhost:3000`
- Backend API will run on: `http://localhost:5000`

---

## 4. Verification & Testing

### Automated Backend Tests
To run the automated endpoint, model validation, and authorization tests:
```bash
cd backend

# Setup the test database schema
npm run db:migrate:test
npm run db:seed:test

# Run tests via Jest
npm run test
```

### Linter Checks
Run the frontend linter to check code format and rules:
```bash
# In the root directory:
npm run lint
```

### Frontend Build
Compile the frontend asset bundles for production:
```bash
# In the root directory:
npm run build
```

---

## 5. Summary of Refactoring Changes

1. **Authentication Integrations**: Connected `authService.js` login, registration, OTP request, verification, Alt-verification, and Admin/Employee password reset logic to endpoints in `POST /api/auth/*`.
2. **User Profiles & Verifications**: Integrated `userService.js` and `verificationService.js` to manage employee lists, mediator tasks, and buyer/seller verification approvals.
3. **Properties & Media Rule Setup**: Connected `propertyService.js` and `mediaRuleService.js` to manage draft submissions, property listings (filtered by search query, type, city, and status), moderation checks, view counts, and category re-ordering.
4. **Site Visits, Enquiries & Follow-ups**: Switched `enquiryService.js`, `visitService.js`, and `followUpService.js` from LocalStorage arrays to live Postgres-backed updates.
5. **Dashboard, Settings, Audit Logs, and CMS**: Fully linked administrative dashboard settings, audit-logging endpoints, and public-facing CMS configuration blocks.
6. **Robust Image Uploads**: Refactored image and document uploads to dynamically store clean relative paths under `/uploads/...` while resolving them using environment configurations (`UPLOAD_BASE_URL` and `VITE_UPLOAD_URL`).

---

## 6. Helpful Database Reference Commands

For troubleshooting and direct database maintenance, use these common PostgreSQL commands:
- **Connect to database**: `psql -U postgres -d omkareswar_realtors`
- **List all tables**: `\dt`
- **Inspect table structure**: `\d users`
- **Clear a table (e.g. for re-seed)**: `TRUNCATE TABLE users CASCADE;`
- **Check active connections**: `SELECT count(*) FROM pg_stat_activity;`
