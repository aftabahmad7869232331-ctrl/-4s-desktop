# 4S First Launch Checklist

Created by Aftab Ahmad Khan.

## Ready For First Launch

- Topbar says `4S Desktop` and `In your pocket`.
- Navbar includes `Tasks`, `4S Desk`, `Setup guide`, and `Help`.
- Navbar includes `Scan` and `Minimize 4S`.
- `Minimize 4S` opens the compact/floating controller flow and prepares Desk mode.
- Tasks load from `/api/jobs`.
- Submissions save locally and through the server.
- PWA manifest and service worker are present for production.
- Dev mode unregisters old service workers to avoid stale cache.
- Topbar visibly shows privacy posture: camera-only direction and local-only storage.
- Server-side submission storage is disabled unless `ENABLE_SERVER_LEDGER=true`.

## Verification

Run:

```bash
npm run check
```

Then start locally:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Known Limits

- Browser/PWA cannot truly control other apps or force OS-level minimize.
- Floating behavior is browser-supported only where available.
- Real system-wide typing belongs in the planned Android IME/custom keyboard version.
- Future Play Store camera permission should be requested only at scan time.
