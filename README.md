# FitTrack (Fitness tracker app)

Offline-first fitness app (iOS/Android) built with Expo:

- Workouts (simple sets tracking)
- Nutrition logging with **Open Food Facts** search + local cache
- Steps (pedometer)
- GPS run tracking (distance + pace)
- Motivation corner (user adds quotes + their own photos)
- Premium (one-time in-app purchase) using **expo-iap**

## Run locally

```bash
npm install
npx expo start
```

Note: step counting, GPS, and in-app purchases require running on a real simulator/device.

## In-app purchases (Premium)

Expo’s IAP libraries require native code, so **Expo Go won’t work** for real purchases. Use a development build:

1. Install EAS:
   ```bash
   npm install -g eas-cli
   ```
2. Prebuild native projects:
   ```bash
   npx expo prebuild --clean
   ```
3. Build dev clients:
   ```bash
   eas build --platform ios --profile development
   eas build --platform android --profile development
   ```

You must create the product IDs in:
- App Store Connect (iOS)
- Google Play Console (Android)

The app currently uses these placeholders:
- iOS: `com.yourcompany.fitnessapp.premium`
- Android: `com.fittrack.premium`

Update them in `App.tsx` to match your store products.

## Publish to Google Play (high level)

You’ll need:
1. A **Google Play Developer** account (Play Console)
2. A unique **Android package name** (set in `app.json` under `expo.android.package`)
3. Store listing assets (icon, screenshots, feature graphic) + a privacy policy

Build an Android App Bundle (AAB) for Play Store with EAS:
```bash
npm install -g eas-cli
eas login

# generates native project and applies config plugins (required for IAP)
npx expo prebuild --clean

# production AAB
eas build --platform android --profile production
```

Then upload the generated **.aab** to Play Console (start with Internal testing), complete:
- App content / Data safety
- Privacy policy URL
- App access instructions (if any)
- IAP product setup (already created in your case)

Current Android package name in this project: `com.fitrack.app`

References:
- Expo guide: https://docs.expo.dev/guides/in-app-purchases/
- Expo IAP install guide: https://hyochan.github.io/expo-iap/getting-started/installation
