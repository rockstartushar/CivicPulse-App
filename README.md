# CivicPulse

Citizen-first civic issue guidance and personal tracking for the Jaipur/Jhotwara MVP. CivicPulse does not submit to or synchronise with government complaint systems.

## Run locally

1. Copy `apps/api/.env.example` to `apps/api/.env` and `apps/mobile/.env.example` to `apps/mobile/.env`; fill Firebase credentials for production mode.
2. Start PostgreSQL: `docker compose up -d` (it is exposed on host port `5433` because `5432` is already occupied on this machine).
3. Install packages: `npm.cmd install`.
4. Create schema and seed reviewed MVP data: `npm.cmd run db:generate`, `npm.cmd run db:migrate -- --name init`, `npm.cmd run db:seed`.
5. Start API: `npm.cmd run api:dev`; start the app in another terminal: `npm.cmd run mobile:start`.

For Android Emulator use `http://10.0.2.2:3000/v1`; for a physical device use the LAN IP of the API host. Phone OTP and production Firebase token verification require a Firebase project with Phone Authentication enabled.

### Jhotwara civic explorer (current public demo)

The current first-release experience is a no-login, read-only Jhotwara civic explorer. It does not need Docker, the API, Firebase, or Cloudinary. Run it with `npx expo start --clear` on Android or `npm.cmd run mobile:web` in a browser. See [JHOTWARA_CIVIC_EXPLORER_PLAN.md](JHOTWARA_CIVIC_EXPLORER_PLAN.md) for the verified-data rules and release plan.

### Demo without external accounts

The checked-in local `.env` files enable development demo mode. Start Docker, API, and Expo as above; the app opens directly into the local demo dashboard. From the repository root, use `npx expo start --clear --port 8082` or `npm.cmd run mobile:start`. Use an Expo Go client compatible with Expo SDK 53 or a matching Expo development build; do not downgrade Expo Go arbitrarily. See [implementation.md](implementation.md) for the current audit and demo limitations.

## Current MVP implementation

- Camera-only Firebase phone OTP report flow and server-side Firebase ID-token verification. The app never offers gallery/file selection; captured JPEGs are re-encoded before upload to remove camera metadata.
- PostgreSQL/Prisma data model seeded with Water Logging and Garbage Dump rules.
- External-complaint guidance routing snapshot, citizen-controlled lifecycle, idempotent offline create, and append-only activity rows.
- Anonymous public/rounded nearby-report projection with private reports excluded.
- Local SQLite draft persistence, idempotent draft replay, signed Cloudinary upload intents, three-attempt upload retry, and citizen lifecycle/report-detail UI.

Production notification worker, moderation console, map rendering, and automated abuse/moderation controls remain future work; no Cloudinary or Firebase Admin secret is shipped to the app.
