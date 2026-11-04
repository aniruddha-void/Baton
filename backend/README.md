# Baton Backend API

RESTful backend service powering Baton, an AI-driven project knowledge handover platform.

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8-47A248?logo=mongodb&logoColor=white)](https://mongoosejs.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT_HS256-blue)](https://jwt.io/)
[![Validation](https://img.shields.io/badge/Validation-Zod_v4-3E67B1?logo=zod&logoColor=white)](https://zod.dev/)

---

## Overview

The Baton backend delivers the core API infrastructure for project knowledge transfer between departing leads and incoming engineers. It provides secure multi-session JWT authentication with token rotation, team identity and settings management, and protected local file uploads. Future phases integrate AI knowledge extraction from project artifacts, task workflows, timeline generation, and exportable handover documentation.

---

## Tech Stack

All packages match `package.json`:

- `express` (v4.21.2): HTTP web framework for routing and middleware pipelines.
- `mongoose` (v8.9.2): Object Data Modeling (ODM) library for MongoDB schemas and queries.
- `jsonwebtoken` (v9.0.2): Signs and verifies cryptographically secure HS256 access and refresh tokens.
- `bcryptjs` (v2.4.3): Hashes user passwords using 12 salt rounds.
- `zod` (v4.6.7): Schema validation for HTTP request bodies, parameters, and queries.
- `multer` (v1.4.5-lts.1): Multipart form-data parser for avatar and project document uploads.
- `helmet` (v8.0.0): Security middleware setting defensive HTTP response headers.
- `cors` (v2.8.5): Cross-Origin Resource Sharing middleware restricting access to allowed frontend origins.
- `express-rate-limit` (v7.5.0): IP-based request rate limiting mitigating brute-force attacks.
- `express-mongo-sanitize` (v2.2.0): Strips `$` and `.` characters from input to prevent NoSQL injection.
- `dotenv` (v16.4.7): Loads environment variables from `.env` into `process.env`.
- `morgan` (v1.10.0): HTTP request logger formatted for development and production.

---

## Folder Structure

```text
backend/
├── .env.example              # Environment variables template
├── package.json              # Project scripts and dependencies
├── uploads/                  # Local storage for avatars and staged documents
│   ├── avatars/              # Uploaded user profile photos
│   └── documents/            # Staged project documentation for AI ingestion
└── src/
    ├── app.js                # Express app setup, security middleware, route mounting
    ├── server.js             # HTTP server entry, MongoDB bootstrap, signal handlers
    ├── config/
    │   ├── ai.js             # AI wrapper with timeout, character boundaries, fallbacks
    │   └── db.js             # Mongoose connection logic and lifecycle listeners
    ├── middlewares/
    │   ├── auth.js           # JWT verification middleware protecting private endpoints
    │   ├── errorHandler.js   # Centralized error handler and operational error responder
    │   ├── rateLimiter.js    # Auth-specific (25/15m) and general (300/15m) rate limiters
    │   ├── upload.js         # Multer disk storage and file filter configurations
    │   └── validate.js       # Zod validation middleware for body, params, and query
    ├── modules/
    │   ├── auth/             # Authentication module
    │   │   ├── auth.controller.js  # Controllers for signup, login, refresh, logout, reset
    │   │   ├── auth.routes.js      # Public and protected authentication route definitions
    │   │   ├── auth.service.js     # Token issuance, rotation, hashing, credential checks
    │   │   └── auth.validation.js  # Zod schemas for auth request bodies
    │   └── users/            # User profile and account management
    │       ├── user.controller.js  # Controllers for profile, security, avatar, preferences
    │       ├── user.model.js       # Mongoose User schema, methods, and JSON transforms
    │       ├── user.routes.js      # User management routes
    │       ├── user.service.js     # Profile mutations, password updates, avatar storage
    │       └── user.validation.js  # Zod schemas for user mutations
    └── utils/
        ├── appError.js       # Custom operational error class with HTTP status codes
        ├── asyncHandler.js   # Async route wrapper forwarding rejections to error handler
        ├── response.js       # Standardized { success, data, message } envelope
        └── tokens.js         # JWT signing/verification, SHA-256 token hashing, random tokens
```

---

## Getting Started

### Prerequisites
- Node.js `v18.0.0` or higher (`v20+` recommended)
- MongoDB `v6.0+` running locally or a MongoDB Atlas connection URI

### Installation
```bash
cd backend
npm install
```

### Environment Configuration
```bash
# On Linux/macOS
cp .env.example .env

# On Windows PowerShell
Copy-Item .env.example .env
```
Update values in `.env` as appropriate for your local environment.

### Running the Server
```bash
# Development mode (auto-reload via Node native --watch)
npm run dev

# Production mode
npm start
```

---

## Environment Variables

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `PORT` | No | Port on which the Express server listens (default: `5000`) | `5000` |
| `NODE_ENV` | No | Runtime environment (`development` or `production`) | `development` |
| `CLIENT_URL` | Yes | Permitted frontend origin for CORS | `http://localhost:5173` |
| `MONGODB_URI` | Yes | MongoDB connection string | `mongodb://127.0.0.1:27017/baton` |
| `JWT_ACCESS_SECRET` | Yes | Secret key for signing 15-minute access tokens (min 32 chars) | `your_access_secret_key_here` |
| `JWT_REFRESH_SECRET`| Yes | Secret key for signing 7-day refresh tokens (min 32 chars) | `your_refresh_secret_key_here` |
| `AI_API_KEY` | No | Google Gemini API key (Google AI Studio) for AI completions | `your_ai_api_key_here` |
| `UPLOAD_DIR` | No | Target directory for file uploads (default: `uploads`) | `uploads` |

---

## API Conventions

- **Base URL:** `http://localhost:5000/api`
- **Response Format:** All successful responses return a standard envelope:
  ```json
  { "success": true, "data": { ... }, "message": "Optional description" }
  ```
- **Error Format:** Failed operations return:
  ```json
  { "success": false, "message": "Error description", "errors": [] }
  ```
- **Authentication Header:** Protected routes require a Bearer token:
  ```http
  Authorization: Bearer <accessToken>
  ```
- **Rate Limits:**
  - Sensitive Auth Endpoints (`/api/auth/*`): 25 requests per 15 minutes per IP (`authLimiter`).
  - General API Endpoints (`/api/*`): 300 requests per 15 minutes per IP (`generalLimiter`).

---

## Implemented Endpoints

### Health
| Method | Path | Auth Required | Request Body | Response Envelope `data` |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/health` | No | None | `{ success, message, timestamp, uptime }` |

### Authentication (`/api/auth`)
| Method | Path | Auth Required | Request Body | Response Envelope `data` |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/auth/signup` | No | `{ fullName, email, password }` | `{ token, refreshToken, user }` |
| `POST` | `/api/auth/login` | No | `{ email, password, rememberMe? }` | `{ token, refreshToken, user }` |
| `POST` | `/api/auth/refresh` | No | `{ refreshToken }` | `{ token, refreshToken }` |
| `POST` | `/api/auth/forgot-password` | No | `{ email }` | `null` (generic success message) |
| `POST` | `/api/auth/reset-password` | No | `{ token, password }` | `null` (success message) |
| `POST` | `/api/auth/logout` | Yes | `{ refreshToken? }` | `null` (success message) |
| `GET` | `/api/auth/me` | Yes | None | `{ user }` |

### Users (`/api/users`)
| Method | Path | Auth Required | Request Body | Response Envelope `data` |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/users/avatar/:filename` | No | None | Raw image file |
| `PUT` | `/api/users/profile` | Yes | `{ name?, email?, role?, location?, bio? }` | `{ user }` |
| `PUT` | `/api/users/security` | Yes | `{ currentPassword, newPassword, username? }` | `null` (success message) |
| `PUT` | `/api/users/notifications` | Yes | `{ emailSummary?, mention?, decisionAlerts?, weeklyDigest?, mobilePush? }` | `{ notifications }` |
| `POST` | `/api/users/avatar` | Yes | `multipart/form-data` with field `avatar` | `{ avatarUrl, user }` |

---

## Planned Endpoints

The following modules represent upcoming contract specifications from `frontend-report.md`:

| Module | Planned Phase | Primary Endpoints |
| :--- | :---: | :--- |
| **Projects & Dashboard** | Phase 2 | `GET/POST /projects`, `GET/PUT/DELETE /projects/:id`, `GET /dashboard/metrics` |
| **Team Management** | Phase 2 | `GET /team`, `POST /team/invite`, `DELETE /team/:memberId` |
| **Documents & Extraction**| Phase 3 | `POST /projects/:id/documents/upload`, `POST /projects/:id/analyze`, `GET /status/:jobId` |
| **Review & Verification** | Phase 3 | `GET/PATCH /projects/:id/extracted-items`, `POST /extracted-items/finalize` |
| **Tasks & Timeline** | Phase 4 | `GET/POST/PATCH/DELETE /tasks`, `GET /timeline`, `GET/PATCH /notifications` |
| **Dashboard Insights** | Phase 4 | `GET /dashboard/insights`, `GET /dashboard/activities` |
| **Handover Reports** | Phase 5 | `POST /reports/generate`, `GET /reports/:id`, `GET /export?format=`, `POST /share` |
| **AI Assistant Chat** | Phase 5 | `POST /ai/chat` (contextual project Q&A) |

---

## Data Models

### Implemented: `User`
Defined in `backend/src/modules/users/user.model.js`:
- `name`: String, required, trim, max 100.
- `email`: String, required, unique, lowercase, trim, indexed.
- `passwordHash`: String, select: false (excluded from queries by default).
- `role`: Enum (`'Project Lead'`, `'Frontend Engineer'`, `'Backend Engineer'`, `'Product Designer'`, `'QA Engineer'`, `'Product Manager'`, `'Other'`).
- `initials`: String, uppercase.
- `color`: String, hex accent color assigned on signup.
- `status`: Enum (`'active'`, `'on-leave'`, `'invited'`), default `'active'`.
- `location`, `bio`, `avatarUrl`: Strings for profile metadata.
- `notifications`: Embedded subdocument (`emailSummary`, `mention`, `decisionAlerts`, `weeklyDigest`, `mobilePush`).
- `refreshTokens`: Embedded array with `tokenHash`, `createdAt`, `expiresAt` (select: false).
- `passwordResetTokenHash`, `passwordResetExpiresAt`: Strings/Dates for single-use resets (select: false).

### Planned Models
`Project`, `Document`, `ExtractedItem`, `Task`, `HandoverReport`, `TimelineEvent`, `Notification`.

---

## Authentication and Security

- **Token Lifecycle:** 15-minute access tokens (`HS256`, containing user ID, email, role) and 7-day refresh tokens (containing user ID, token version, and unique `jti` UUID).
- **Refresh Token Rotation & Hashing:** Refresh tokens are never stored in plaintext. The backend stores SHA-256 hashes. Upon refresh, the old token hash is removed, a new pair is returned, and active sessions are capped at 5 per user. Reusing an old refresh token invalidates all active sessions.
- **Password Security:** Passwords hashed with `bcryptjs` using 12 salt rounds. `passwordHash` has `select: false` on the Mongoose model to prevent accidental leaks.
- **Anti-Enumeration Password Reset:** `/auth/forgot-password` returns an identical success message whether the email exists or not. Reset tokens use 32 crypto bytes, stored hashed, valid for 1 hour, single-use only.
- **Defensive Headers & Sanitization:** `helmet` applies standard security headers. `express-mongo-sanitize` strips keys containing `$` or `.` from all inputs.
- **Input Validation:** Incoming requests are validated against strict Zod schemas before hitting business logic.
- **CORS Governance:** Origin is validated against `CLIENT_URL`. Unauthorized origins receive no CORS access headers (`callback(null, false)`). Requests without origin headers (cURL, mobile clients) are permitted.

---

## File Uploads

File upload behavior is managed by `backend/src/middlewares/upload.js`:

- **Storage Location:** Local filesystem under `uploads/avatars/` and `uploads/documents/`. Filenames are sanitized and suffixed with random hex bytes to prevent directory traversal and collisions.
- **Avatar Uploads:** Restricted to `image/jpeg`, `image/png`, `image/webp`, and `image/gif`. Maximum file size is **5 MB**; maximum count is **1 file**.
- **Document Uploads:** Restricted to `.pdf`, `.docx`, `.doc`, `.txt`, `.md`, `.png`, `.jpg`, `.jpeg`, and `.zip`. Maximum file size is **25 MB**; maximum count is **10 files per batch**. Staged documents are not served publicly.

---

## Testing the API

Run these commands in PowerShell or bash against a running backend server (`http://localhost:5000`):

### 1. Health Check
```powershell
curl.exe -s http://localhost:5000/api/health
```

### 2. User Signup
```powershell
curl.exe -s -X POST http://localhost:5000/api/auth/signup `
  -H "Content-Type: application/json" `
  -d '{"fullName":"Dev User","email":"dev@baton.app","password":"Password123!"}'
```

### 3. User Login
```powershell
curl.exe -s -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"dev@baton.app","password":"Password123!"}'
```

### 4. Fetch Authenticated Profile
```powershell
curl.exe -s http://localhost:5000/api/auth/me `
  -H "Authorization: Bearer <PASTE_ACCESS_TOKEN_HERE>"
```

---

## Error Handling

- **Operational Errors:** Handled through the custom `AppError` class with predefined HTTP status codes.
- **Validation Errors:** Zod errors are formatted into `{ success: false, message: "Validation failed", errors: [{ field, message }] }` with status 400.
- **Database Errors:** Mongoose duplicate keys (code 11000) return status 409, and invalid ObjectIds return status 400.
- **Environment Distinction:** In `development`, the stack trace is included in the response. In `production`, internal server error details and stack traces are suppressed, returning `"An unexpected server error occurred."`.

---

## Troubleshooting

- **Port Conflict (`EADDRINUSE: port 5000`):**
  Identify and terminate the lingering process:
  ```powershell
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F

  # Linux / macOS
  lsof -i :5000
  kill -9 <PID>
  ```
- **MongoDB Connection Failure:**
  Ensure the MongoDB daemon is active (`Get-Service MongoDB` on Windows or `sudo systemctl status mongod` on Linux) and verify `MONGODB_URI` in `.env`.
- **CORS Origin Rejected:**
  Confirm that `CLIENT_URL` in `.env` matches the port where your frontend is running (default: `http://localhost:5173`).
- **401 Unauthorized On Protected Routes:**
  Access tokens expire after 15 minutes. Pass the `refreshToken` to `POST /api/auth/refresh` to obtain a fresh token pair.
- **Missing Environment Variables:**
  If the application fails during startup, verify that `.env` exists in the `/backend` root and contains all mandatory keys specified in `.env.example`.

---

## Roadmap

- **Phase 2:** Project CRUD, team member invitations, dashboard summary metrics.
- **Phase 3:** Document upload pipeline, background text extraction, and item review staging.
- **Phase 4:** Task management, interactive project timeline, notification triggers, activity feed.
- **Phase 5:** Handover report compiler, markdown/JSON/PDF exporters, shareable links, and AI chat assistant.
- **Production Enhancements:**
  - Transition password reset logging to transactional emails via Resend or SendGrid.
  - Integration and unit test suite with Jest / Supertest.
  - Structured logging with Winston or Pino.
  - Cloud storage integration (AWS S3 or Cloudinary) for avatars and project artifacts.

