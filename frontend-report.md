Baton Backend Contract

Frontend: React 18, Vite, React Router v6 (/frontend) Backend: Node.js, Express, MongoDB, Mongoose (/backend)

1. Conventions
Base URL: http://localhost:5000/api
Response: { success, data, message }. Responses shown below go inside data.
Auth: Authorization: Bearer <accessToken> on all routes except Public ones.
Errors: { success: false, message, errors? }
A user can only access projects they own or belong to (checked in service layer).
IDs are exposed as id.
2. Routes

Public: /, /login, /signup, /forgot-password (new), /reset-password/:token (new)

Protected: /dashboard, /projects, /projects/create, /projects/:projectId, /import, /review, /reports, /tasks, /timeline, /team, /assistant, /settings

3. Auth Flow
Signup and login return { token, refreshToken, user }.
Access token: 15 min. Refresh token: 7 days, hashed in DB, rotated on refresh.
Forgot password returns the same response whether the email exists or not.
Reset token: hashed, expires in 1 hour, single use.
AuthContext calls GET /auth/me on startup.
API client retries once via /auth/refresh on 401, then logs out.
4. API
Auth and Users
Method	Endpoint	Request	Response
POST (public)	/auth/signup	{ fullName, email, password }	{ token, refreshToken, user }
POST (public)	/auth/login	{ email, password, rememberMe? }	{ token, refreshToken, user }
POST (public)	/auth/refresh	{ refreshToken }	{ token, refreshToken }
POST	/auth/logout	{}	{}
POST (public)	/auth/forgot-password	{ email }	{}
POST (public)	/auth/reset-password	{ token, newPassword }	{}
GET	/auth/me	none	{ user }
PUT	/users/profile	{ name, email, role, location, bio }	{ user }
PUT	/users/security	{ username, currentPassword?, newPassword? }	{}
PUT	/users/notifications	{ emailSummary, mention, decisionAlerts, weeklyDigest, mobilePush }	{ notifications }
POST	/users/avatar	FormData avatar	{ avatarUrl }

user = { id, name, email, role, initials, location?, bio? }

Dashboard
Method	Endpoint	Response
GET	/dashboard/metrics	{ totalProjects, completedTasks, activeMembers, pendingHandover, projectTrend, taskTrend }
GET	/dashboard/insights	{ insights: [{ id, text, type, projectId? }] }
GET	/dashboard/activities	{ activities: [{ id, title, time, type, timestamp }] }
Projects
Method	Endpoint	Request	Response
GET	/projects	Query: status, search, page, limit	{ projects, total, page, totalPages, counts: { all, active, inProgress, review, completed } }
POST	/projects	{ name, description, category, startDate?, endDate?, teamMembers, status, autoReport, notifyTeam }	{ project }
GET	/projects/:projectId	none	{ project } with members, tasks, timeline, decisions
PUT	/projects/:projectId	partial project	{ project }
DELETE	/projects/:projectId	none	{ id } (owner only)
Documents and Analysis
Method	Endpoint	Request	Response
POST	/projects/:projectId/documents/upload	FormData files[], sourceType (docs, code, design, meetings)	{ uploadedFiles: [{ id, name, size, status, url }] }
DELETE	/projects/:projectId/documents/:fileId	none	{}
POST	/projects/:projectId/analyze	{ fileIds, sourceType }	{ jobId, status, extractedCounts: { decisions, tasks, timeline } }
GET	/projects/:projectId/analyze/status/:jobId	none	{ status, progress, error? }
Review
Method	Endpoint	Request	Response
GET	/projects/:projectId/extracted-items	none	{ decisions, tasks, timeline, owners, sources }
PATCH	/projects/:projectId/extracted-items/:itemId	{ status?, title?, detail?, owner? }	{ item }
POST	/projects/:projectId/extracted-items/finalize	{ approvedIds }	{ reportId }
Reports
Method	Endpoint	Request	Response
GET	/reports?projectId=	none	{ reports }
POST	/projects/:projectId/reports/generate	{ projectId, title? }	{ report }
GET	/reports/:reportId	none	{ report } with fullContent, sections
GET	/reports/:reportId/export?format=md|json|pdf	none	file download
POST	/reports/:reportId/share	{ expiresInDays? }	{ shareUrl, token }
Tasks
Method	Endpoint	Request	Response
GET	/tasks	Query: projectId, status, priority, assignee, search	{ tasks }
POST	/tasks	{ title, description?, projectId?, assignee, priority, status, due? }	{ task }
PATCH	/tasks/:taskId	{ completed?, status?, priority?, title?, assignee?, due? }	{ task }
DELETE	/tasks/:taskId	none	{ id }

priority: high | medium | low. status: todo | in-progress | review | done.

Timeline and Team
Method	Endpoint	Request	Response
GET	/timeline	Query: projectId, type, search	{ events }
GET	/team	Query: role, status, search	{ members }
POST	/team/invite	{ name, email, role, projectIds? }	{ invite: { id, name, email, role, status } }
DELETE	/team/:memberId	none	{}

Team members are Users. Invite creates a User with status: "invited".

AI and Notifications
Method	Endpoint	Request	Response
POST	/ai/chat	{ prompt, projectId?, conversationId? }	{ message: { role, heading, body, points[] }, conversationId }
GET	/notifications	none	{ notifications: [{ id, type, title, message, time, read }] }
PATCH	/notifications/:id	{ read }	{}
POST	/notifications/mark-all-read	none	{}

Health: GET /api/health (public)

5. Data Models
User: name, email (unique), passwordHash (select: false), role, initials, color, avatarUrl, status (active, on-leave, invited), location, bio, notifications { emailSummary, mention, decisionAlerts, weeklyDigest, mobilePush }
Project: name, description, category, iconKey, status, statusType, progress (0-100), handoverStatus (Draft, In Review, Ready), startDate, endDate, autoReport, notifyTeam, ownerId, members [{ userId, role }]
Document: projectId, name, size, mimeType, storageUrl, sourceType, status (uploading, uploaded, analyzing, done, failed), uploadedById
ExtractedItem: projectId, sourceDocumentId, type (decision, task, timeline, blocker), title, detail, ownerId, confidence (0-100), status (pending, approved, rejected), metadata { deadline?, phase?, period?, sourceExcerpt? }
Task: projectId, title, description, assigneeId, priority, status, due, completed, sourceExtractedItemId?
HandoverReport: projectId, title, status (Draft, In Progress, Ready), authorId, coverage, excerpt, decisionsCount, tasksCount, sections { overview, decisions[], tasks[], timeline[], sources[] }, shareToken?, shareExpiresAt?
TimelineEvent: projectId?, title, description, kind (approval, task, milestone, analysis, team, create), type (decision, task, timeline, team), memberNames[]
Notification: recipientId, type (task, decision, milestone, team, report), title, message, read
RefreshToken: userId, tokenHash, expiresAt
PasswordResetToken: userId, tokenHash, expiresAt, usedAt

All models have timestamps. TimelineEvents and Notifications are created automatically when a task is created, an item is approved, a report is generated or a member is invited.

6. File Upload and AI

Upload: PDF, DOCX, TXT, MD, ZIP, PNG, JPG, SVG on /import. Avatar image on /settings. Type and size limits, sanitized filenames, local disk, not publicly served without auth.

AI (API key from .env, timeout, input size limit, treat document text as untrusted):

Extract decisions, tasks, milestones and blockers with confidence score and source excerpt
Generate handover report from approved items
Project Q&A assistant
Dashboard insights
7. Mock Data to Replace
File	Replace with
AuthContext.jsx	JWT and GET /auth/me
Header.jsx	GET /notifications
DashboardPage.jsx	/dashboard/*, /projects, /tasks
ProjectsPage.jsx	GET /projects
CreateProjectPage.jsx	GET /team, POST /projects
ProjectDetailPage.jsx	GET /projects/:projectId
ImportAnalyzePage.jsx	real upload and analyze APIs
ReviewVerifyPage.jsx	/extracted-items APIs
HandoverReportsPage.jsx	/reports APIs
TasksPage.jsx	/tasks APIs
TimelinePage.jsx	GET /timeline
TeamPage.jsx	/team APIs
AiAssistantPage.jsx	POST /ai/chat
SettingsPage.jsx	/auth/me, /users/*
8. Build Phases
Setup, config, error handling, auth, users. Frontend: services/apiClient.js, .env.example, connect AuthContext, Login, Signup, add Forgot and Reset password pages.
Projects, project detail, team, dashboard metrics.
Documents upload, analyze, AI extraction, review.
Tasks, timeline, notifications, dashboard insights and activities.
Reports (generate, export, share) and AI assistant.

Rules: auth on all routes except public ones, membership check on every project resource, Zod validation on body, params and query, whitelist fields, strict rate limit on auth routes, no hardcoded secrets.

.env.example:

PORT=5000
MONGODB_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
CLIENT_URL=http://localhost:5173
AI_API_KEY=

Frontend: VITE_API_URL=http://localhost:5000/api