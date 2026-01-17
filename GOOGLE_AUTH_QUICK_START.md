# 🔐 Google Authentication - Quick Start Guide
**Time to complete:** 5-10 minutes

---

## 🎯 What You Need to Do

### Step 1: Get Google Credentials (3-5 minutes)

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a Project**
   - Click **"New Project"** (top right)
   - Name: `Sports Fest 2026`
   - Click **"Create"**

3. **Enable Google People API**
   - Go to **"APIs & Services"** → **"Library"**
   - Search for **"Google People API"**
   - Click **"Enable"**

4. **Configure OAuth Consent Screen**
   - Go to **"APIs & Services"** → **"OAuth consent screen"**
   - Select **"External"**
   - Fill in:
     - App name: `Sports Fest 2026`
     - User support email: Your email
     - Developer contact: Your email
   - Click **"Add or Remove Scopes"**
   - Select:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - Click **"Save and Continue"**

5. **Create OAuth 2.0 Credentials**
   - Go to **"APIs & Services"** → **"Credentials"**
   - Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
   - Application type: **Web application**
   - Name: `Sports Fest Web App`
   - Authorized JavaScript origins:
     - `http://localhost:3000`
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
   - Click **"Create"**

6. **Copy Your Credentials**
   - Copy **Client ID** (looks like: `...apps.googleusercontent.com`)
   - Copy **Client Secret**
   - Save them somewhere safe

### Step 2: Update .env File (1 minute)

1. **Open your `.env` file**
   ```bash
   nano .env
   ```

2. **Add Google credentials**
   ```env
   # Google OAuth Credentials
   GOOGLE_CLIENT_ID="your-client-id-from-google-cloud"
   GOOGLE_CLIENT_SECRET="your-client-secret-from-google-cloud"
   ```

3. **Save and exit**
   - Press `Ctrl+X`
   - Press `Y`
   - Press `Enter`

### Step 3: Restart & Test (1-2 minutes)

1. **Restart the server**
   ```bash
   # Stop with Ctrl+C, then:
   npm run dev
   ```

2. **Test Google sign-in**
   - Open: http://localhost:3000/auth/signin
   - Click **"Sign in with Google"**
   - Complete authentication
   - You should be redirected to dashboard!

---

## 🧪 Verify It Works

### Quick Test
```bash
node test_google_auth.js
```

**Expected output:**
```
✅ env File
✅ env Variables
✅ secret Strength
✅ next Auth Url
✅ prisma Schema
✅ auth Config
✅ sign In Page
✅ redirect Uri
```

### Manual Test
1. Open browser → http://localhost:3000/auth/signin
2. Click "Sign in with Google"
3. Complete Google authentication
4. Check you're redirected to dashboard

---

## 📚 Documentation

- **Full Setup Guide:** `GOOGLE_AUTH_SETUP.md`
- **Summary:** `GOOGLE_AUTH_SUMMARY.md`
- **Test Script:** `test_google_auth.js`

---

## ⚠️ Common Issues

### "Invalid redirect URI"
**Fix:** Add this to Google Cloud Console:
- `http://localhost:3000/api/auth/callback/google`

### "Client ID not found"
**Fix:** Verify credentials are copied correctly (no extra spaces)

### "Email already exists"
**Fix:** This is normal - Google will link to existing account

---

## 🎉 That's It!

Once you add the credentials, Google authentication will work immediately. No code changes needed!

**Need help?** See `GOOGLE_AUTH_SETUP.md` for detailed troubleshooting.