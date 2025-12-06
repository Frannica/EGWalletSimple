# EGWallet Build & Testing Quick Start

## Local Development

### Start Mock Backend
```bash
cd mock-backend
node index.js
```
Backend runs at `http://localhost:4000`

### Start Expo Dev Server
```bash
npm start
```

Options:
- Press `w` for web preview (browser)
- Press `a` for Android emulator
- Press `i` for iOS simulator (macOS only)
- Scan QR code with **Expo Go** app on phone

### Run Tests
```bash
npm test
```
Runs Jest unit tests (currency utils + API client)

---

## Internal Testing with Friends

### Option 1: Via Expo Go (Recommended for Quick Testing)

1. Ensure mock backend is running locally
2. Start Expo server: `npm start`
3. Friends download **Expo Go** app (iOS/Android)
4. Share your LAN IP with them
5. They enter your IP in Expo Go to connect

### Option 2: Preview Build (APK)

```bash
eas login
eas build --platform android --profile preview
```

- Creates a shareable APK link
- Friends can download directly
- Uses your production API URL from `src/config/env.ts`
- Better for offline testing

---

## Production Deployment

### Step 1: Update Backend URL
Edit `src/config/env.ts`:
```typescript
production: {
  API_BASE_URL: 'https://your-api.com',
  LOG_LEVEL: 'error',
}
```

### Step 2: Build for Play Store
```bash
eas build --platform android --profile production
```

### Step 3: Submit to Google Play
```bash
eas submit --platform android --latest --profile production
```

Or manually upload AAB to **Closed Testing** track in Play Console

### Step 4: Invite Testers
In Google Play Console → Closed Testing → Add testers' emails → Generate link

---

## Environment Configuration

**Development** (local):
- Backend: `http://localhost:4000`
- Runs via `npm start` with Expo Go
- Full debug logging

**Production** (Play Store):
- Backend: Your production API URL
- Built via `eas build --profile production`
- Error-level logging only

Switch is automatic based on `__DEV__` flag (set by Expo during build)

---

## Key Files

- `src/config/env.ts` — Environment & API URL configuration
- `eas.json` — EAS Build profiles
- `app.json` — Expo app config
- `DEPLOYMENT.md` — Full deployment guide
- `mock-backend/index.js` — Local mock server

---

## Troubleshooting

**App won't connect to backend?**
- Check `src/config/env.ts` API URL is correct
- Verify backend is running (local dev) or accessible (production)
- Check CORS on backend if using web preview

**Build fails?**
- Run `npm install` to ensure all deps are installed
- Check `app.json` is valid JSON

**Tests failing?**
- Run `npm test` to see detailed error messages
- Ensure TypeScript types match between tests and code

**Closed testing won't open in Play Store?**
- Verify tester email is added in Play Console
- Allow 24 hours for new testers to see the app
- Share the public testing link directly with testers

