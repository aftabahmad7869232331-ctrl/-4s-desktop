# 4S

4S is a mobile-first 4S Desk prototype for students who need desktop-style work from a low-cost mobile device.

Created by Aftab Ahmad Khan.

It includes:

- Micro-task workspace with English default instructions and Hindi/Urdu language support.
- Offline-safe local work ledger.
- Data Saver mode for weak network use.
- Offline install support through PWA caching.
- 10-finger scan UI.
- Wall mode for a desktop-style projected workspace.
- Floating and compact controller flows for working beside another app.
- Air mouse controls and air keyboard typing flow for mobile-to-laptop style work.
- Setup guide for scan, wall mode, and minimize/floating use.

## First Launch Scope

The first launch is a web/PWA prototype. It proves the student workflow:

- Open 4S on a mobile device.
- Prepare scan and wall mode.
- Use a compact or floating controller.
- Practice desktop-style typing, task work, and low-data workflows.

Native Android keyboard, true overlay, and deeper app-to-app input are planned for a later version after the concept is validated.

## Creator

4S concept and prototype by Aftab Ahmad Khan.

## Requirements

- Node.js 20 or newer
- npm

## Local Setup

Install dependencies:

```bash
npm install
```

Run the app locally:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Offline Use

4S includes a PWA manifest and service worker.

After opening the app once while online, supported mobile browsers can install it to the home screen. The core interface, bundled practice UI, local ledger, and saved work can then open without internet.

Internet is only needed for server sync, updates, or downloading new content.

## Local Data

By default, submitted work is kept in the browser's local storage only. The server does not persist user submissions unless `ENABLE_SERVER_LEDGER=true` is explicitly set.

If server ledger mode is enabled, submitted work is saved to `.data/submissions.json`. The `.data/` folder is ignored by version control because it is runtime data.

## Privacy Posture

First launch is designed to be privacy-light:

- No account required.
- No location permission.
- No contacts, SMS, call log, files, photos, or broad storage permission.
- Camera is the only planned sensitive permission for the future hand-scan feature.
- Current web prototype does not open the camera yet; scan is a UI prototype.

## Production Build

Create the production build:

```bash
npm run build
```

Start the built server:

```bash
npm start
```

## Useful Commands

Type-check the project:

```bash
npm run lint
```

Clean generated build files:

```bash
npm run clean
```

Run the final local verification:

```bash
npm run check
```

## Notes

The current 4S Desk is a UI prototype. Real camera-based finger tracking would need MediaPipe Hands or a similar hand-landmark model, camera permission handling, calibration, and a wall display/casting flow. Real system-wide typing over other apps should be handled by an Android IME/custom keyboard in a later native version.
