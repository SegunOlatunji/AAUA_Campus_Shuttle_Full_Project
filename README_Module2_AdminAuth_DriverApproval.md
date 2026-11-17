# Phase 4, Module 2 — Admin Dashboard Auth + Driver Approval

## Setup
```bash
cd admin-dashboard
cp .env.example .env   # same Firebase project as the two mobile apps
npm install
npm run dev
```
Visit `http://localhost:3000` — you'll land on `/login` since there's no session yet.

## Bootstrapping your first admin
Admins are never self-registered (Phase 2 decision, reaffirmed here). To create one:
1. Firebase console → Authentication → Add user → set an email + password.
2. Firebase console → Realtime Database → add a record at `users/admins/{that user's uid}`:
   ```json
   { "uid": "...", "fullName": "Your Name", "email": "you@aaua.edu.ng", "createdAt": 1234567890 }
   ```
3. Log in with that email/password at `/login`.

This is a one-time manual step per admin — after this module, you could build an
"Invite admin" flow if you want it self-service, but it wasn't in your original
role list, so it's intentionally left manual for now.

## What this module does
- **`/login`** — admin email/password sign-in, same role-lookup guard pattern as the mobile apps.
- **`/drivers`** — the actual point of this module:
  - **Pending approval** section: every driver who completed phone/OTP verification in the Driver app shows up here.
  - Enter a **Shuttle ID** (placeholder text field for now — becomes a proper dropdown once the Shuttles module exists) and hit **Approve**, or **Reject**.
  - **All drivers** section: everyone else, with their approval and online/offline status.
- Approving/rejecting writes directly to `users/drivers/{uid}` in Realtime Database — permitted by `backend/database.rules.json` because the acting user has a matching `users/admins/{uid}` record.

## End-to-end test (ties Module 1 and Module 2 together)
1. In the **Driver app**, register with a phone number → verify OTP → land on the "under review" pending screen.
2. In the **Admin dashboard** → Drivers → find that driver in "Pending approval" → enter any placeholder shuttle ID (e.g. `shuttle_01`) → Approve.
3. Back in the **Driver app**, the pending screen should update automatically (it's a live listener) and route to the placeholder Dashboard — no app restart needed, no manual console editing required anymore.

## Known gaps (intentional, deferred to later modules)
- Sidebar links to Students, Shuttles, Routes, Schedules, Notifications, and Reports go to pages that don't exist yet — they'll 404 until those modules are built. Only Overview and Drivers are functional right now.
- The Shuttle ID field on approval is free text, not validated against real shuttle records, since the Shuttles module hasn't been built. It'll become a proper dropdown once it exists.
