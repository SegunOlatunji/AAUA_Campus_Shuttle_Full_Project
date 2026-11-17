# Phase 4, Module 5 — Finalizing the App

This module closes out every remaining feature from your original brief.
No new external services are required — everything here runs on the same
Firebase project as before.

## What's new

**Admin dashboard**
- **Students** — view all registered students, deactivate/reactivate an
  account. Students still self-register (Phase 2 decision); this isn't a
  create-account screen.
- **Schedules** — full CRUD linking route + shuttle + driver + departure
  time + days of week.
- **Notifications** — compose and send to everyone, students only, drivers
  only, or a specific route's students; sent history below.
- **Reports** — the Objective 3 evidence page: average actual wait time and
  matching accuracy (both computed from `match_requests`), trips today/total,
  trips-by-route breakdown, and average student feedback rating.
- **Overview** — upgraded from a placeholder to real live KPI cards (active
  shuttles right now, trips today, average wait time, drivers awaiting
  review) and a list of currently active shuttles.

**Student app**
- **Routes tab** — browse all four routes and their stops without picking a
  specific destination first (the secondary flow mentioned back in Addendum 2).
- **Notifications tab** — announcements relevant to students.
- **Profile tab** — account details, star-rating feedback submission, logout.
- **Deactivation is now enforced**, not just a flag on the Admin side: a
  deactivated student's login is rejected with a clear message, not silently
  allowed through.
- Added a lightweight bottom nav bar (Home / Routes / Alerts / Profile) tying
  these screens together. Results and Track stay as pushed screens on top of
  this, without the nav bar, since they're part of a linear flow rather than
  a destination you'd navigate to directly.

**Driver app**
- **Schedule tab** — the driver's own assigned time slots.
- **Profile tab** — name, phone, assigned shuttle, logout.

## Two real bugs fixed in this pass
While wiring up Reports and the Students/Drivers list pages, I found that
`users/students`, `users/drivers`, and `match_requests` only had **per-child**
read rules, not a **collection-level** read rule. Firebase Realtime Database
requires read permission at the *exact path* being queried — so the admin
dashboard's list pages (`onValue(ref('users/drivers'))` etc.) would have
returned a permission-denied error in production, despite looking correct in
the UI code. Fixed by adding `.read` at the collection level for admins on
all three paths. **If you already published an earlier version of
`database.rules.json`, republish the one in this package.**

## Test flow for the whole app, start to finish
1. Admin: load AAUA routes, pin a few stop coordinates, add a shuttle, add a
   schedule.
2. Driver: register (phone/OTP) then get approved by admin with the shuttle
   you created, then go online and start a trip.
3. Student: register then Dashboard then pick a From/To on that route to get
   matched, then track live as seats update while the driver adjusts them.
4. Student: Routes tab to browse without a destination in mind; Notifications
   tab after Admin sends one; Profile tab to submit a star rating.
5. Admin: Reports page should now show a trip, and once the student's Track
   screen detects arrival, an average wait time.
6. Admin: Students page then deactivate the test student then confirm they
   can no longer log in.

## What's still deliberately not built
- **A visual live map on the Admin Overview page.** The data for it already
  exists (the Active Shuttles list has everything a map marker would need);
  I chose not to add a mapping library (Leaflet or Google Maps JS) in this
  pass to avoid the added complexity/config for something that's genuinely
  optional polish rather than a functional gap — the list view already
  answers "what's active right now." Worth adding if you have time before
  submission, since it demos well.
- **A true 5-icon bottom tab bar using expo-router's `Tabs` navigator** on
  the Student app. The hand-rolled `BottomNav` component works identically
  from a user's perspective but doesn't get the native tab-bar chrome (e.g.
  active-tab highlighting animations). Fine for now; a nice-to-have polish
  item.
- **Click-to-pin coordinates** on the Admin Routes page — still a typed
  lat/lng table, as noted since Module 3.
