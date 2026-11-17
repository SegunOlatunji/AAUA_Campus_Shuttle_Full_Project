# Phase 4, Module 3 — Routes & Shuttles Management

Builds on Modules 1 and 2. No new setup required if you already have the
Firebase project configured — this module just adds two new admin pages.

## What's new
- **`/routes`** — click **Load AAUA routes** once to populate all four real
  campus routes (Main Gate ↔ Senate, Sports Complex ↔ Senate/Main Gate) with
  every stop from your actual route data, in order. Edit any route's stop
  list afterward via a plain textarea (one stop per line) — reordering is
  just reordering lines, no drag-and-drop complexity needed for a project
  this size. Seeding is idempotent: it only fills in routes that don't
  already exist, so re-clicking after you've edited Route A won't overwrite
  your edit.
- **`/shuttles`** — full CRUD for the physical fleet: plate number, capacity,
  assigned route, assigned driver (pulled from your approved drivers list),
  and status (active/inactive/maintenance).
- **`/drivers`** — the shuttle-ID text field from Module 2 is now a real
  dropdown of actual shuttles, as promised. If no shuttles exist yet, the
  page tells you to add one first instead of letting you type a
  made-up ID.

## Test flow
1. Go to **Routes** → **Load AAUA routes** → confirm all 4 appear with the
   right stop counts (23, 22, 20, and 12 stops respectively).
2. Go to **Shuttles** → **Add shuttle** → give it a plate number, capacity,
   and assign it to Route A.
3. Go to **Drivers** → approve a pending driver → the shuttle dropdown now
   shows the shuttle you just created → approve.
4. Go back to **Shuttles** and edit that shuttle to assign the driver you
   just approved (driver-to-shuttle assignment currently happens from either
   side — Drivers sets it on approval, Shuttles can reassign it later).

## Known gap, carried forward
Stop coordinates (`lat`/`lng`) are still `null` after seeding — per Addendum 1
Section 4, someone needs to pin each stop's real location once, either via
Google's Geocoding API for formally-named stops or by hand for landmark
nicknames like "Blue House" or "30CQ." That pin-editor is a good candidate
for its own module once live tracking is being built, since that's the first
feature that actually needs the coordinates to do anything.
