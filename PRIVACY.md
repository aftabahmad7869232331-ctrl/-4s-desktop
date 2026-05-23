# 4S Privacy Notes

Created by Aftab Ahmad Khan.

## First Launch

4S first launch is a web/PWA prototype. It is designed to avoid unnecessary permissions and avoid server-side user data storage by default.

## Data Stored Locally

The app stores these values in the user's browser:

- Language choice.
- Data saver preference.
- Student display name.
- Local work ledger.
- Today earnings counter.

This data stays on the user's device unless server ledger mode is explicitly enabled by the deployer.

## Server Storage

Server-side submission storage is off by default.

To enable it for private testing only:

```bash
ENABLE_SERVER_LEDGER=true
```

When enabled, submissions are saved to `.data/submissions.json`.

## Permissions

Current PWA:

- No camera access is requested.
- No location access is requested.
- No microphone access is requested.
- No contacts, SMS, call log, photos, videos, or file storage access is requested.

Future Android version:

- Camera permission should be requested only when the user starts hand scan.
- Avoid broad storage, contacts, SMS, call log, location, and accessibility permissions in first native launch.
- If Android IME/custom keyboard is added later, document its behavior clearly in the app and Play listing.

## Play Store Data Safety Draft

For the current PWA/TWA-style launch:

- Data collection: no server collection by default.
- Data sharing: no.
- Location: no.
- Camera: only if a native camera hand-scan feature is added.
- Account creation: no.
- Ads: no.
