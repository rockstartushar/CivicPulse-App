# CivicPulse implementation status

Last audited: 18 July 2026  
Mode for local demonstrations: `DEMO_MODE=true` / `EXPO_PUBLIC_DEMO_MODE=true`

## What is implemented

### Current product direction

- The active release direction is the no-login, read-only Jhotwara Civic Explorer. Reporting, authentication, backend sync, Firebase, and Cloudinary are retained for a future opt-in Civic Reports phase and are not part of the first public user flow.
- The detailed product/data plan is in `JHOTWARA_CIVIC_EXPLORER_PLAN.md`.

### Repository and local services

- npm workspace monorepo with `apps/api` (NestJS) and `apps/mobile` (Expo React Native).
- Docker Compose PostgreSQL/PostGIS service. On this laptop it is exposed as `localhost:5433` because port 5432 is occupied.
- Prisma schema, generated client, initial SQL migration, and Jhotwara seed data.
- `npm.cmd run api:build` and `npm.cmd run typecheck --workspace=@civicpulse/mobile` are the required local compile checks.

### Backend

- NestJS modular monolith with Prisma module, Firebase auth guard, reports, reference/configuration, and media modules.
- Database records for users, categories, geographies, departments, official channels, routing rules, reports, report media, append-only report activities, and offline idempotency receipts.
- Seeded Water Logging and Garbage Dump categories. Both currently require a captured photo and location.
- Citizen report create/read/update APIs, server-side lifecycle validation, reference-number support, and an append-only activity log.
- Deterministic department-routing snapshot with JMC channel guidance.
- Public nearby endpoint that excludes private and unpublished reports, with issue-type and status filtering.
- Public location is rounded to an approximately 150 m grid before storage/display.
- Cloudinary signed direct-upload intent and post-upload media registration for production configuration.

### Mobile

- Expo Router navigation on Android and Expo Web. The mobile workspace is upgraded to the current stable Expo SDK 57 / React Native 0.86 generation.
- Firebase phone OTP remains a production integration task and is intentionally excluded from the demo bundle.
- Explicit development demo entry that bypasses Firebase only when `EXPO_PUBLIC_DEMO_MODE=true`.
- Camera-only issue evidence flow using `expo-camera`. There is no gallery, file picker, or local-library selection path.
- Captured images are re-encoded before uploading to remove camera metadata. In demo mode they are copied to the app document directory.
- Demo form supports category, description, compulsory automatic GPS location, and camera-only evidence. Visibility is intentionally hidden and demo reports default to private.
- Platform-local draft queue: SQLite on Android and browser local storage on Expo Web.
- Report detail screen displays route guidance and lets a citizen progress through allowed lifecycle states, including reopen reason and optional external reference number.
- Device-local Issues Map: Android uses the native map view and web uses an OpenStreetMap embed. Both show only GPS reports saved on that same device/browser and support issue-type filtering. Demo-map data does not call the API.

## Demo-mode behavior

Demo mode is intended only for a laptop/phone demonstration without Firebase or Cloudinary credentials.

- The mobile app opens directly to the dashboard; no phone OTP is shown while demo mode is enabled.
- API accepts the `X-CivicPulse-Demo: true` header only when `DEMO_MODE=true` and `NODE_ENV` is not `production`.
- The API creates/uses one local demo user.
- Captured photos are stored in the app sandbox and registered as demo media; they are not uploaded to Cloudinary.
- Demo mode is rejected by the server when `NODE_ENV=production`.

## Required configuration

### Demo

`apps/api/.env`:

```env
NODE_ENV=development
DEMO_MODE=true
DATABASE_URL=postgresql://civicpulse:civicpulse@localhost:5433/civicpulse?schema=public
```

`apps/mobile/.env` for Android Emulator:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/v1
EXPO_PUBLIC_DEMO_MODE=true
```

For a physical Android phone, replace `10.0.2.2` with the laptop's LAN IP and keep phone/laptop on the same Wi-Fi.

### Production prerequisites

- Firebase project with Phone Authentication, Android package registration, Android signing fingerprints, mobile Firebase config, API service account, and a production development-build integration.
- Cloudinary cloud name/API key/API secret.
- A production database, secret store, backups, monitoring, terms/privacy notice, and a reviewed moderation operating process.

## Not implemented or incomplete

These items are deliberately not represented as complete:

- Super-admin web console and moderation workflows. Public reports start `PENDING`, so there is no user-facing published nearby feed until moderation exists.
- Area/locality selection and full Country → State → City → Constituency → Area cascading filters. The current Jaipur/Jhotwara demo intentionally keeps city, state, and country fixed.
- Push notification tokens, preference UI, scheduled reminder worker, Expo/FCM delivery, receipts, and notification centre.
- Persistent production Firebase session adapter/device credential validation on real builds.
- Encryption/KMS for exact coordinates and complaint reference numbers. Current database columns are plain values and must not be used for sensitive production data until encryption is added.
- Automated PII/image safety checks, report abuse flow, rate limiting, and audit/admin operations.
- Robust offline background queueing, automatic exponential retry, cross-device conflict resolution, and retained local-photo cleanup.
- Unit, integration, device, accessibility, Hindi localisation, and end-to-end tests.
- Deployment, CI/CD, monitoring, backups/restore drills, operational runbooks, and legal/privacy documentation.

## Known demo limitations

- Expo SDK is pinned to 53. Use an Expo Go client compatible with SDK 53, or preferably create a matching Expo development build. An older arbitrary Expo Go version can open the QR session but fail to load the JavaScript bundle/native modules.
- The native map uses `react-native-maps`; the web map uses OpenStreetMap tiles. Basic Android map testing works in Expo Go; a standalone production Android build needs a configured Google Maps API key/billing project. Web needs an internet connection to load OpenStreetMap tiles.
- Android Emulator uses `10.0.2.2` to reach the laptop; this address does not work on a physical phone.
- The local API and Docker database must both be running before entering demo mode.
- The demo user/data is local-only and must never be treated as authenticated production activity.

## Next implementation order

1. Test the current SDK 57 demo in current Expo Go on Android and in a local browser using `npm.cmd run mobile:web`.
2. Build the moderation/admin console, then introduce an opt-in remote/public map feed alongside the device-local demo map.
3. Add notifications and the reminder worker.
4. Implement encryption, rate limits, content safety, tests, and production operations.
5. Configure Firebase/Cloudinary and validate the full real-device production-authentication path.
