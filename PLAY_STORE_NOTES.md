# 4S Play Store Notes

Created by Aftab Ahmad Khan.

## First Launch Permission Plan

The first launch should avoid unnecessary permissions.

Current PWA/TWA-style build:

- No Android manifest is present in this repo.
- No runtime camera API is called in the web app.
- No location, microphone, contacts, SMS, call log, file storage, photo/video, or broad package visibility permission is used.
- Server-side submission storage is off by default.

Future native Android build:

- Request `CAMERA` only when the user starts hand scan.
- Do not request location.
- Do not request contacts, SMS, call log, broad storage, photo/video library, or package visibility.
- Do not add Accessibility Service in the first native launch unless it becomes a documented, user-facing core feature.

## Data Safety Draft

- Data collected: none by default.
- Data shared: none.
- Account required: no.
- Ads: no.
- Location: no.
- Camera: only for future hand scan, requested in context.
- Local data: preferences and practice ledger stay on the user's device.

## Policy Notes

Google Play expects sensitive permissions to be necessary for current, user-facing features and limited to user-consented purposes. Keep permission requests incremental and in context.

Useful official references:

- Google Play permissions and APIs policy: https://support.google.com/googleplay/android-developer/answer/9888170
- Google Play Data safety section: https://support.google.com/googleplay/android-developer/answer/10787469
- Android app permissions: https://developer.android.com/guide/topics/permissions/overview
