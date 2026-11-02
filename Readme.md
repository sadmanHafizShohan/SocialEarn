# PROJECT: SocialEarn
## Google Sheets-Based Social Media Micro Task & Earning Platform

Act as a senior full-stack developer and software architect.

Build a complete, production-conscious, responsive Social Media Micro Task & Earning Platform named **SocialEarn**.

The application will initially support approximately 1–100 registered users.

The main objective is to allow users to complete administrator-created tasks, submit screenshot proof, earn points after administrator approval, convert points into Bangladeshi Taka (BDT), and request manual withdrawals through bKash or Nagad.

IMPORTANT: The entire project must use Google Sheets and Google Apps Script as its primary backend and database system. Do not require a separate persistent Node.js server, Express server, Render server, or traditional backend hosting.

---

# 1. TECHNOLOGY STACK

Frontend:
- React.js
- Vite
- JavaScript (JSX), not TypeScript
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React
- React Hook Form

Backend:
- Google Apps Script
- Google Apps Script Web App
- Google Apps Script Services
- Google Apps Script LockService

Database:
- Google Sheets

File Storage:
- Google Drive

Authentication:
- Firebase Authentication
- Google Sign-In
- Email and Password
- Firebase ID Token Verification

Hosting:
- Vercel for React frontend
- Vercel Serverless Functions as a lightweight API proxy only
- Google Apps Script for actual backend logic
- Google Sheets for database
- Google Drive for screenshot storage

Do not implement the main business logic inside Vercel Functions. All task, wallet, point, transaction, and withdrawal operations must be handled by Google Apps Script.

Use Vercel Functions only when required for secure request forwarding and browser CORS handling.

---

# 2. SYSTEM ARCHITECTURE

Implement the following architecture:

React Frontend
↓
Vercel Serverless API Proxy
↓
Google Apps Script Web App
↓
Google Sheets + Google Drive

Firebase Authentication will provide user identity.

The Vercel proxy must not duplicate business logic or maintain financial balances.

Use a secure server-to-server communication method between Vercel Functions and Apps Script.

Never expose Apps Script secrets, service credentials, or private configuration in frontend JavaScript.

Because Google Apps Script Web Apps have cross-origin and redirect limitations, test actual browser requests before choosing the proxy implementation. Do not assume ordinary CORS headers can be configured in Apps Script ContentService.

---

# 3. PROJECT STRUCTURE

Create one GitHub repository with a clean structure.

Frontend:
- src/components
- src/pages
- src/layouts
- src/context
- src/hooks
- src/services
- src/routes
- src/utils
- src/assets

Vercel API:
- api/proxy.js
- api/health.js

Google Apps Script:
- Code.gs
- Config.gs
- Auth.gs
- Database.gs
- Users.gs
- Tasks.gs
- Submissions.gs
- Wallet.gs
- Transactions.gs
- Withdrawals.gs
- Admin.gs
- Settings.gs
- Storage.gs
- Security.gs
- Utils.gs

Also create:
- README.md
- .env.example
- vercel.json
- .gitignore

Keep frontend, API proxy, and Google Apps Script source code logically separated.

Provide an Apps Script deployment and update guide.

---

# 4. GOOGLE SHEETS DATABASE

Create a Google Spreadsheet named:

SocialEarn Database

Create these sheets:

1. Users
2. Tasks
3. Submissions
4. Wallets
5. Transactions
6. Withdrawals
7. Settings
8. AdminLogs

Use predefined column headers and consistent data types.

Every record must have a unique ID generated independently of its spreadsheet row number.

## Users Sheet

Fields:
- userId
- firebaseUid
- name
- email
- phone
- profileImage
- role
- status
- createdAt
- updatedAt

Roles:
- user
- admin

Statuses:
- active
- blocked

## Tasks Sheet

Fields:
- taskId
- title
- description
- platform
- category
- instructions
- referenceUrl
- referenceImage
- points
- maxParticipants
- completedCount
- startDate
- expiryDate
- status
- createdBy
- createdAt
- updatedAt

Task statuses:
- draft
- active
- paused
- completed
- expired

Only administrators can create or modify tasks.

## Submissions Sheet

Fields:
- submissionId
- userId
- taskId
- screenshotFileId
- screenshotMimeType
- screenshotSize
- pointsSnapshot
- status
- rejectionReason
- reviewedBy
- reviewedAt
- createdAt
- updatedAt

Submission statuses:
- pending
- approved
- rejected

## Wallets Sheet

Fields:
- walletId
- userId
- availablePoints
- reservedPoints
- totalEarnedPoints
- totalWithdrawnPoints
- createdAt
- updatedAt

Every user must have exactly one wallet.

## Transactions Sheet

Fields:
- transactionId
- userId
- type
- points
- referenceId
- idempotencyKey
- balanceBefore
- balanceAfter
- description
- conversionRateSnapshot
- createdAt

Transaction types:
- credit
- reserve
- debit
- refund
- adjustment

Never edit or delete historical financial transactions.

## Withdrawals Sheet

Fields:
- withdrawalId
- userId
- points
- amountPaisa
- paymentMethod
- accountNumber
- exchangeRateSnapshot
- status
- paymentReference
- adminNote
- processedBy
- processedAt
- createdAt
- updatedAt

Withdrawal statuses:
- pending
- processing
- paid
- rejected

## Settings Sheet

Fields:
- settingKey
- settingValue
- updatedAt

Default settings:

POINTS_PER_UNIT = 100
TAKA_PAISE_PER_UNIT = 1000
MINIMUM_WITHDRAW_POINTS = 1000
WITHDRAW_ENABLED = true

Payment methods:
- bKash
- Nagad

## AdminLogs Sheet

Fields:
- logId
- adminId
- action
- targetType
- targetId
- details
- createdAt

Record important administrator actions.

---

# 5. GOOGLE SHEETS DATABASE ENGINE

Create reusable Apps Script database functions.

Requirements:

- Initialize spreadsheet using a configured Spreadsheet ID.
- Create missing sheets automatically during setup.
- Add column headers automatically.
- Read records using unique IDs.
- Insert records safely.
- Update records safely.
- Search and filter records.
- Support pagination.
- Validate data before writing.
- Handle missing sheets and malformed records.
- Avoid unnecessary full-sheet reads.
- Cache non-sensitive configuration where appropriate.

Do not rely on spreadsheet row numbers as permanent record identifiers.

Use LockService for all critical operations involving financial data.

Implement idempotency keys for all point credits, refunds, and withdrawal operations.

If a critical multi-step operation fails, use an operation journal or recovery mechanism to reconcile partially completed writes.

Do not silently treat a partially completed financial operation as successful.

---

# 6. AUTHENTICATION

Integrate Firebase Authentication.

Features:
- Google Sign-In
- Email Registration
- Email Login
- Logout
- Forgot Password
- Password Reset
- Protected Routes

After login:

1. Obtain Firebase ID Token from the frontend.
2. Send the token through the secure API proxy.
3. Verify the token server-side.
4. Resolve the corresponding user record.
5. Create a new user record if necessary.
6. Create an initial wallet.
7. Assign the default role as user.

For Apps Script, verify Firebase ID Tokens using a supported server-side verification approach, such as Firebase Identity Toolkit accounts:lookup with the configured Firebase Web API key. Do not trust decoded JWT claims without cryptographic verification.

Only the backend can assign admin roles.

Blocked users must not be able to submit tasks or request withdrawals.

---

# 7. USER INTERFACE

Build a modern, clean, professional fintech-inspired interface.

Design:
- Light background
- White cards
- Green earning indicators
- Blue or violet primary actions
- Rounded corners
- Subtle shadows
- Clean typography
- Lucide icons
- Responsive layouts
- Smooth lightweight animations

Avoid:
- Excessive gradients
- Cartoon-style designs
- Cluttered layouts
- Unnecessary animations
- Fake financial statistics

Use a consistent design system.

Desktop:
- Sidebar
- Top navigation
- Main dashboard
- User profile menu

Mobile:
- Responsive navigation
- Mobile-friendly cards
- Touch-friendly buttons
- Responsive tables

---

# 8. USER DASHBOARD

Display:

- Available Balance in BDT
- Available Points
- Reserved Points
- Total Earned
- Total Withdrawn
- Completed Tasks
- Pending Submissions
- Rejected Submissions

Sections:
- Available Tasks
- Recent Submissions
- Recent Transactions
- Wallet Summary
- Quick Withdraw

All values must be retrieved from Google Sheets through the backend.

Never use hardcoded demo financial values in production.

---

# 9. TASK MANAGEMENT

Only administrators can create tasks.

Task creation form:

- Task Title
- Description
- Platform
- Category
- Instructions
- Reference URL
- Optional Reference Image
- Reward Points
- Maximum Participants
- Start Date
- Expiry Date
- Status

Supported platforms:
- Facebook
- YouTube
- Instagram
- TikTok
- Other

Allowed task categories:
- Genuine Promotional Feedback
- Survey
- Content Review
- Website Visit
- Brand Awareness
- Approved Research Activities

Do not create tasks that pay users to generate artificial engagement, fake likes, fake followers, fake views, fake subscriptions, or paid comments in violation of platform rules.

Admin must be able to:
- Create tasks
- Edit tasks
- Delete tasks
- Pause tasks
- Activate tasks
- View participants
- View completed count

User task list:
- Task Title
- Platform
- Description
- Reward Points
- Expiry Date
- Remaining Participants
- Task Status

Add search, filter, sorting, and pagination.

---

# 10. TASK SUBMISSION

User workflow:

1. Browse tasks.
2. Open task details.
3. Read instructions.
4. Complete the permitted activity.
5. Capture a screenshot.
6. Upload screenshot.
7. Submit for verification.

Validate:
- File format
- MIME type
- Actual file content
- File size
- Task availability
- User status
- Duplicate submission

Accept:
- JPG
- JPEG
- PNG
- WebP

Use Google Drive to store uploaded screenshots.

Save the Drive File ID in the Submissions Sheet.

Do not create publicly accessible screenshot links.

Use authenticated backend image retrieval or short-lived authorized access.

---

# 11. ADMIN SUBMISSION REVIEW

Create a dedicated Admin Submission page.

Display:
- Submission ID
- User Name
- User Email
- Task Name
- Screenshot Preview
- Submitted Date
- Reward Points
- Current Status

Admin can:
- View screenshot
- Approve
- Reject
- Add rejection reason

On approval:

1. Acquire a financial operation lock.
2. Re-read the submission.
3. Confirm its status is pending.
4. Confirm the task is valid.
5. Read the authoritative reward from the Tasks Sheet.
6. Verify participant limits.
7. Credit points to the wallet.
8. Write a transaction record.
9. Update task completion count.
10. Mark submission as approved.
11. Record admin activity.
12. Release the lock.

Use an idempotency key based on the submission ID.

A repeated approval request must never credit points twice.

Use a recovery journal if multiple Sheet writes cannot be completed consistently.

---

# 12. POINT SYSTEM

Default conversion:

100 Points = ৳10 BDT

Examples:

100 Points = ৳10
500 Points = ৳50
1,000 Points = ৳100
5,000 Points = ৳500

Admin can configure conversion settings.

Use integer point values and integer Paisa for financial calculations.

Do not use floating-point arithmetic for wallet or withdrawal calculations.

Store the applicable conversion rate snapshot with every earning and withdrawal record.

Changing future conversion settings must not silently change the historical value of already-earned points.

---

# 13. WALLET

Wallet information:

- Available Points
- Reserved Points
- Total Earned Points
- Total Withdrawn Points

Rules:

- Only approved submissions generate points.
- Pending submissions do not generate spendable points.
- Users cannot edit their wallet.
- All point changes must be performed by Apps Script.
- Every balance change requires a corresponding transaction.
- Prevent negative balance.
- Prevent duplicate transactions.
- Use LockService during financial updates.

Create a reconciliation function that compares wallet balances against transaction history.

Provide an Admin-only reconciliation report.

---

# 14. WITHDRAWAL SYSTEM

Supported methods:
- bKash
- Nagad

Default minimum withdrawal:
৳100

User enters:
- Requested Points
- Payment Method
- Account Number

Backend must:

1. Verify user authentication.
2. Verify withdrawal availability.
3. Validate minimum amount.
4. Validate account number.
5. Acquire financial lock.
6. Re-read wallet balance.
7. Reserve requested points.
8. Create withdrawal record.
9. Create reserve transaction.
10. Release lock.

Admin withdrawal panel:

- User Name
- User Email
- Requested Points
- Amount in BDT
- Payment Method
- Account Number
- Request Date
- Current Status

Admin actions:

- Approve for Processing
- Reject
- Mark as Paid
- Enter Payment Reference

On rejection:
- Return reserved points.
- Create a refund transaction.
- Update withdrawal status.

On payment:
- Confirm the request is processing.
- Require a unique payment reference.
- Prevent duplicate payment confirmation.
- Deduct reserved points.
- Update withdrawn totals.
- Create a debit transaction.
- Mark request as paid.

Never mark a withdrawal paid without actual payment confirmation.

---

# 15. ADMIN DASHBOARD

Statistics:

- Total Users
- Active Users
- Blocked Users
- Total Tasks
- Active Tasks
- Pending Submissions
- Approved Submissions
- Rejected Submissions
- Total Points Issued
- Pending Withdrawals
- Total Paid Withdrawals
- Total Paid Amount

Admin pages:

- Dashboard
- Task Management
- Create Task
- Submissions
- Withdrawal Requests
- User Management
- Transactions
- Settings
- Admin Logs

Admin must be able to search, filter, sort, and paginate records.

---

# 16. API DESIGN

Create consistent API endpoints.

Authentication:
- POST /api/auth/register
- GET /api/auth/me

User:
- GET /api/users/me
- PATCH /api/users/me

Tasks:
- GET /api/tasks
- GET /api/tasks/:id

Submissions:
- POST /api/submissions
- GET /api/submissions/my

Wallet:
- GET /api/wallet
- GET /api/transactions

Withdrawals:
- POST /api/withdrawals
- GET /api/withdrawals/my

Admin:
- GET /api/admin/dashboard
- POST /api/admin/tasks
- GET /api/admin/tasks
- PATCH /api/admin/tasks/:id
- DELETE /api/admin/tasks/:id
- GET /api/admin/submissions
- PATCH /api/admin/submissions/:id/review
- GET /api/admin/users
- PATCH /api/admin/users/:id/status
- GET /api/admin/withdrawals
- PATCH /api/admin/withdrawals/:id/review
- GET /api/admin/settings
- PATCH /api/admin/settings
- GET /api/admin/logs

Implement request validation, centralized error responses, authentication middleware, role checks, and pagination.

Use a consistent response format:

success
message
data
error

---

# 17. GOOGLE APPS SCRIPT WEB APP

Implement:

- doGet(e)
- doPost(e)
- Request Router
- Authentication Verification
- Database Service
- File Storage Service
- Business Logic Services
- Error Handling

Use POST requests for state-changing operations.

Use GET for read-only operations.

Return JSON responses consistently.

Handle:
- Invalid JSON
- Missing parameters
- Invalid authentication
- Unauthorized requests
- Missing records
- Duplicate submissions
- Insufficient points
- Google Drive failures
- Google Sheets failures
- Apps Script quota errors

Use a lightweight Vercel API proxy to handle browser-origin communication if needed.

Do not expose private backend secrets to the browser.

---

# 18. ENVIRONMENT CONFIGURATION

Create an environment template for:

Frontend:
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_APP_ID

Vercel:
- APPS_SCRIPT_WEB_APP_URL
- APPS_SCRIPT_PROXY_SECRET

Apps Script Script Properties:
- SPREADSHEET_ID
- DRIVE_ROOT_FOLDER_ID
- FIREBASE_WEB_API_KEY
- ADMIN_EMAIL
- PROXY_SHARED_SECRET

Never hardcode credentials.

Never commit real credentials.

Use Google Apps Script Script Properties for backend configuration.

---

# 19. SECURITY

Implement:

- Firebase ID Token Verification
- Server-side Role Authorization
- Input Validation
- Request Rate Limiting
- File Upload Validation
- Private Screenshot Storage
- Duplicate Submission Protection
- Financial Idempotency
- LockService
- Immutable Transaction Records
- Admin Activity Logging
- Safe Error Handling
- Secure Secret Management

Do not trust frontend-supplied:
- User IDs
- Admin Roles
- Point Values
- Wallet Balances
- Withdrawal Amounts
- Submission Status

Always resolve these values on the backend.

Restrict Apps Script access to authenticated application users through backend verification. Do not treat an obscure Web App URL as authentication.

---

# 20. PERFORMANCE AND LIMITATIONS

The initial expected user base is 1–100 users.

Optimize for small-scale usage.

Requirements:

- Batch Google Sheets reads and writes.
- Minimize repeated spreadsheet access.
- Cache safe configuration.
- Avoid unnecessary Drive operations.
- Implement pagination.
- Avoid reading entire sheets for every API request.
- Handle Apps Script execution quotas.
- Handle simultaneous submissions.
- Handle simultaneous withdrawal requests.
- Add recovery for interrupted financial operations.
- Add an Admin database reconciliation tool.

Do not claim that Google Sheets provides full database transaction guarantees.

If a financial operation cannot be safely completed, reject it and report an error rather than silently continuing.

---

# 21. DEVELOPMENT PHASES

Implement in the following order.

Phase 1: Project Setup
- React + Vite
- Tailwind
- Vercel Configuration
- Apps Script Project
- Google Sheets Initialization
- Google Drive Setup

Phase 2: Authentication
- Firebase Setup
- Google Login
- Email Login
- User Registration
- Admin Role
- Protected Routes

Phase 3: Task Management
- Admin Task Creation
- Task List
- Task Details
- Task Editing
- Task Status Management

Phase 4: Submission
- Screenshot Upload
- Google Drive Storage
- Submission Management
- Admin Review

Phase 5: Wallet
- Point Credit
- Wallet Dashboard
- Transaction History
- Reconciliation

Phase 6: Withdrawal
- bKash / Nagad
- Withdrawal Request
- Reserved Points
- Admin Payment Processing
- Refund System

Phase 7: Finalization
- Security Testing
- Error Handling
- Responsive UI
- Deployment
- Documentation

Do not skip phases.

After completing each phase, test all related functionality before moving to the next.

---

# 22. FINAL REQUIREMENTS

Deliver:

1. Complete React Frontend.
2. Google Apps Script Backend.
3. Google Sheets Database.
4. Google Drive Screenshot Storage.
5. Firebase Authentication.
6. Vercel API Proxy.
7. User Dashboard.
8. Admin Dashboard.
9. Task Management.
10. Screenshot Submission.
11. Admin Approval.
12. Point System.
13. Wallet.
14. Manual bKash/Nagad Withdrawal.
15. Transaction History.
16. Admin Activity Logs.
17. Environment Configuration.
18. Deployment Guide.
19. Google Sheets Initialization Guide.
20. Complete README.

Do not create UI-only prototypes.

Do not use hardcoded demo data in production.

Do not leave critical functions as TODO placeholders.

Do not invent successful financial operations.

Test actual integration between React, Vercel, Apps Script, Firebase, Sheets, and Drive.

The application must be deployable from a single GitHub repository connected to Vercel, without a separate persistent backend server.

Prioritize correctness, security, maintainability, and financial consistency over unnecessary features.