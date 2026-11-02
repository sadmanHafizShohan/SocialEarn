# SocialEarn deployment guide

The original specification is kept in [Readme.md](./Readme.md). This guide turns the repository into a deployable Google Sheets + Apps Script + Vercel application.

## 1. Firebase

1. Create a Firebase project and register a Web app.
2. Enable Google and Email/Password providers in Authentication.
3. Copy the web configuration into `.env.local` using `.env.example`.
4. Add the Firebase Web API key to Apps Script Script Properties as `FIREBASE_WEB_API_KEY`.
5. Add Firebase Authentication authorized domains for the Vercel deployment domain.

## 2. Google Sheets and Drive

1. Create a spreadsheet named **SocialEarn Database**.
2. Create a private Drive folder for proof screenshots.
3. Open Apps Script from the spreadsheet, add every file in `apps-script/`, and set Script Properties:
   - `SPREADSHEET_ID`
   - `DRIVE_ROOT_FOLDER_ID`
   - `FIREBASE_WEB_API_KEY`
   - `PROXY_SHARED_SECRET`
4. Run `setupDatabase` once and approve the requested Sheets, Drive, and UrlFetch permissions.
5. Add the first administrator directly in the Users sheet by changing a verified user's `role` to `admin`. Never expose an admin role in the client.

## 3. Apps Script

Deploy as a Web app:

- Execute as: **Me**
- Who has access: **Anyone**

The deployment URL is not an authentication mechanism. Requests must come through the Vercel proxy with the shared secret and a verified Firebase ID token. If the deployment URL changes, update `APPS_SCRIPT_WEB_APP_URL`.

## 4. Vercel

1. Import the repository into Vercel.
2. Set `APPS_SCRIPT_WEB_APP_URL` and `APPS_SCRIPT_PROXY_SECRET`.
3. Set all `VITE_*` Firebase variables.
4. Deploy with the default Vite build command (`npm run build`) and output directory (`dist`).

For local development, `npm run dev` only serves the Vite frontend. It does not run
the Vercel `/api` function. This project now includes a local Vite `/api` proxy;
keep `APPS_SCRIPT_WEB_APP_URL` and `APPS_SCRIPT_PROXY_SECRET` in `.env.local`,
then run `npm run dev`. The browser will call `http://localhost:5173/api`, and
the Vite server will forward requests to Apps Script without requiring Vercel.
After changing Apps Script files, create a new Web app deployment/version so the
updated backend code is active.

The current database setup also creates `UnlockRequests`, `TaskUnlocks`,
`SupportMessages`, and `Referrals` sheets. Run `setupDatabase()` after adding
these files. Referral, task unlock, support, wallet, and transaction changes
are all enforced by Apps Script; publishing only the frontend is not enough.

Tasks can be assigned to one or more categories (`Basic`, `Standard`, and
`Premium`). Users choose one of their unlocked categories when submitting a
task, and the submission is credited with that category's points (10, 25, or
50). Existing tasks with a single category remain supported.

Always update and save every file in `apps-script/` before publishing a new
version. The request router in `Code.gs` calls helpers from the other files, so
an older deployment can report errors such as `dashboardData_ is not defined`
or `screenshotForAdmin_ is not defined`. In Apps Script use **Deploy → Manage
deployments → Edit → New version → Deploy**; do not only save the editor.

The admin workspace is available automatically after an administrator signs in.
It includes dashboard statistics, task creation/archiving, submission approval
or rejection, withdrawal review, user blocking, settings, and admin logs. After
updating the Apps Script files, publish a new Web app version before testing
these tools locally.

The browser only calls `/api/*`; it never receives the Apps Script URL or proxy secret. The proxy forwards the bearer token and does not hold balances or business state.

## 5. Financial safety

`LockService` protects wallet reserve, submission approval, and withdrawal review operations. Transaction rows are append-only and idempotency keys prevent duplicate credits/reserves. If a multi-write operation fails, the request returns an error; operators must use the reconciliation process before retrying.

Before production use, test:

- duplicate approval requests for the same submission;
- simultaneous withdrawals near the available balance;
- rejected withdrawals and reserved-point refunds;
- Drive file permissions;
- blocked users;
- Firebase token expiry and invalid tokens.

The initial implementation uses private Drive files and stores only file IDs in Sheets. A future authenticated file-preview endpoint should be added if admins need in-app previews rather than opening files from the Drive console.
