# Phase 4, Module 1 — Authentication

Two Expo apps: `student-app` (email/password) and `driver-app` (phone/OTP with
admin-approval gate). Both point at the same Firebase project. Rules for that
project are in `backend/database.rules.json`.

## Firebase project setup (one-time)
1. Create a Firebase project (or use an existing one for this system).
2. Enable **Authentication → Sign-in method → Email/Password** (for the Student app).
3. Enable **Authentication → Sign-in method → Phone** (for the Driver app).
   - Add a test phone number + fixed OTP in the Firebase console while developing,
     so you're not burning real SMS credits every test run.
4. Create a **Realtime Database** (not Firestore) in your target region.
5. Publish `backend/database.rules.json` as your database's rules
   (Firebase console → Realtime Database → Rules → paste → Publish).
6. To let the first Admin account exist at all (rules require an existing admin
   to write most things), manually add one record under `users/admins/{uid}`
   in the console after creating that admin's Auth user — this is a one-time
   bootstrap step, not something the app does at runtime.

## Running each app
```bash
cd student-app        # or driver-app
cp .env.example .env  # fill in your Firebase web app config
npm install
npx expo start
```

## What to test in this module
**Student app:**
- Register → creates `users/students/{uid}` → lands on placeholder Dashboard showing your name.
- Log out → log back in → same account, same data.
- Forgot password → check inbox for reset email.
- Try registering with an email already in use → clear error, not a crash.

**Driver app:**
- Enter phone + name → receive OTP → verify → lands on **pending-approval** screen
  (this is correct — no driver is auto-approved).
- In the Firebase console, manually set that driver's `approvalStatus` to
  `"approved"` and `assignedShuttleId` to any placeholder shuttle ID.
- Relaunch the app (or wait for the listener) → should now land on the
  placeholder Dashboard instead of the pending screen.
- Try writing to `shuttles/{id}/currentLocation` from a pending driver's
  session (e.g. via the Firebase console's simulator, or just trust the
  rules) — it should be rejected until `approvalStatus` is `"approved"`.

## Known setup dependency
`expo-firebase-recaptcha` (used for phone OTP) requires `expo-web-browser` and
`react-native-webview`, both already listed in `driver-app/package.json`.
If you eject from Expo Go to a custom dev client, no extra native config is
needed beyond a standard `expo prebuild`.
