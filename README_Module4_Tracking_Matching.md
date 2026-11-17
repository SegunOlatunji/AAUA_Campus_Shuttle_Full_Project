# Phase 4, Module 4 — Live Tracking & Shuttle Matching

This is the module where Objectives 2 and 3 become real: live shuttle
position, and the matching engine that pairs a student with the fastest
shuttle to their destination (Addendum 2).

## New setup needed
1. **Pin stop coordinates**: go to Admin → Routes → the pin icon on each
   route → enter real lat/lng for as many stops as you can (look them up on
   Google Maps). Matching and the live map both degrade gracefully with
   unpinned stops, but accuracy improves a lot once they're in.
2. **Student app** needs `react-native-maps`, which needs a Google Maps API
   key for Android (`student-app/app.json` has a placeholder —
   `REPLACE_WITH_YOUR_ANDROID_MAPS_API_KEY`). iOS uses Apple Maps by default
   and needs no key.
3. **Driver app** needs location permission — already configured in
   `driver-app/app.json` from this module.
4. Optional: set `settings/app/avgMinutesPerStop` in the Firebase console
   (e.g. `2.5`) to tune the ETA estimate. Defaults to 2.5 if not set.

## What's new
- **Driver app** — real Dashboard (online/offline toggle) and Trip tab
  (Start/End trip, seat +/- stepper, live location broadcasting while a
  trip is active).
- **Admin dashboard** — per-stop coordinate editor on the Routes page.
- **Student app** — Dashboard is now "Where are you going?" (From/To stop
  pickers), Results ranks live shuttles by estimated arrival time with the
  fastest one highlighted, and Track shows a live map with the shuttle's
  position, route polyline, seat count, and nearest stop.

## End-to-end test
1. **Driver app**: go online → Start trip. Grant location permission when
   asked.
2. **Student app**: Dashboard → pick a From/To pair that's on that driver's
   route → Find my shuttle → the matched shuttle should appear in Results →
   tap it → Track shows the live map, updating as the driver moves.
3. Adjust seats in the **Driver app**'s Trip screen → confirm the count
   updates live in the **Student app**'s Track screen.
4. End the trip in the Driver app → the Student app's Track screen should
   reflect "Trip ended" and the shuttle disappears from future match results.

## Known limitations (by design, for a project this scope)
- **ETA is stop-count based**, not real driving time (Addendum 2, Section 2,
  Step 5 notes the Google Directions API as a documented future upgrade).
- **No "next loop" awareness**: if a shuttle has already passed a student's
  stop on its current run, the matching engine excludes it rather than
  predicting when it'll come back around. Worth mentioning as a limitation
  in your report's evaluation/discussion section.
- **Stop coordinates are manually typed**, not click-to-pin on an embedded
  map. Flagged in Module 3's README as a good next enhancement once this
  data already exists and is proven useful.
