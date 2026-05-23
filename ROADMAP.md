# 4S Roadmap

Created by Aftab Ahmad Khan.

## Product Vision

4S turns a low-cost mobile phone into a student-friendly desktop-style workspace. A student can prepare a wall/large-screen workspace, use a compact or floating controller, and practice work that normally needs a laptop.

## First Launch

- Web/PWA prototype.
- Student-first topbar and setup guide.
- Tasks, wall mode, compact controller, floating controller, and local ledger.
- Offline-ready interface with low-data behavior.
- English, Hindi, and Urdu language support.
- Privacy-light posture: no account, no location, no broad storage, and no server submission storage by default.

## Version 2

- Android native app.
- Android custom keyboard / IME for real input into other apps.
- Floating overlay controller for keyboard and pointer controls.
- Camera hand tracking with calibration.
- Stronger wall display/cast workflow.

## Version 3

- Optional accessibility-powered pointer/click support.
- Better app integrations where useful.
- Student accounts, synced progress, and teacher/admin workflows.
- Real micro-work marketplace or learning content pipeline.

## Technical Decision

The first launch stays web/PWA because it is fast to test and easy to share. System-wide input into other apps should not be solved with browser hacks. The correct future path is Android IME plus overlay permissions.
