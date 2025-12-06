# EGWallet Deployment Guide

## Overview
This guide covers building and deploying the EGWallet app to Google Play Console for closed testing and production.

---

## Prerequisites

1. **EAS Account** — Sign up at [https://expo.dev](https://expo.dev)
2. **Google Play Console Account** — [https://play.google.com/console](https://play.google.com/console)
3. **Service Account Key** — Download from Google Cloud Console (linked to Play Console)
4. **Backend API** — Deploy your backend to a production URL (replace `https://api.egwallet.com` in `src/config/env.ts`)

---

## Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

Authenticate with your Expo account:
```bash
eas login
```

---

## Step 2: Configure Backend URL

Edit `src/config/env.ts`:

```typescript
const ENV = {
  dev: {
    API_BASE_URL: 'http://localhost:4000',
    LOG_LEVEL: 'debug',
  },
  production: {
    API_BASE_URL: 'https://your-production-api.com', // Update this
    LOG_LEVEL: 'error',
  },
};
```

---

## Step 3: Build for Testing (Preview)

Create a preview build (APK) for internal testing:

```bash
eas build --platform android --profile preview
```

This will:
- Build an APK you can download and share
- Use your production API URL from `env.ts`
- Provide a direct download link

---

## Step 4: Build for Google Play (Production)

Create a production build (AAB) for Play Store:

```bash
eas build --platform android --profile production
```

This will:
- Build a signed Android App Bundle (AAB)
- Ready for submission to Play Store

---

## Step 5: Set Up Google Play Service Account

1. Go to **Google Cloud Console** → Create a project linked to your Play Console
2. Create a **Service Account** and download the JSON key
3. Save the key as `service-account-key.json` in the project root
4. Grant the service account **Editor** role in Play Console

---

## Step 6: Submit to Closed Testing

Automatically submit a build to Google Play's closed testing track:

```bash
eas submit --platform android --latest --profile production
```

Or manually:
1. Go to **Google Play Console** → Your app
2. Navigate to **Closed Testing** → **Create Release**
3. Upload the AAB file
4. Add release notes and submit

---

## Step 7: Invite Testers

In Google Play Console:
1. Go to **Closed Testing** → **Testers**
2. Add emails of internal testers
3. Generate the public testing link
4. Share with your team

They can then download and install the app from the Play Store (testing version).

---

## Environment-Based Configuration

The app automatically switches configurations:

- **Development** (`__DEV__ = true`):
  - Uses `http://localhost:4000` (local mock backend)
  - Debug logging enabled
  - Only available via Expo Go or dev builds

- **Production** (`__DEV__ = false`):
  - Uses your production API URL
  - Error-level logging
  - Built for Play Store distribution

---

## Backend Deployment

For production, you need a real backend server. Options:

1. **Heroku** (free tier with limitations)
2. **Railway** (simple Node.js hosting)
3. **AWS Lambda + API Gateway**
4. **DigitalOcean App Platform**
5. **Vercel** (if using Next.js or similar)

Move `mock-backend/index.js` to your production host and update `src/config/env.ts` with the URL.

---

## Troubleshooting

- **Build fails**: Check `eas.json` configuration and ensure app.json is valid
- **Service account error**: Verify JSON key is in the project root and has correct permissions
- **API connection fails**: Check that your production API URL is accessible and CORS is configured
- **Sign-in issues**: Ensure JWT_SECRET and token handling match between backend and app

---

## Next Steps

1. Set up your production backend server
2. Update API URL in `src/config/env.ts`
3. Create a preview build for internal testing
4. Get feedback from testers
5. Submit to closed testing on Play Store
6. Iterate and release to production

