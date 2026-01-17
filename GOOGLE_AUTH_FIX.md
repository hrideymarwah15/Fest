# 🔐 Google Authentication - Fix Guide
**Date:** January 17, 2026  
**Status:** ⚠️ **MISSING CREDENTIALS**

---

## 🎯 The Problem

Google authentication is **not working** because the Google OAuth credentials are missing from your `.env` file.

**Diagnostic Results:**
- ✅ NextAuth is configured for Google
- ✅ Sign-in page has Google button
- ✅ Prisma schema has OAuth models
- ✅ Server is running
- ❌ **GOOGLE_CLIENT_ID is empty**
- ❌ **GOOGLE_CLIENT_SECRET is empty**

---

## 🚀 Quick Fix (5-10 minutes)

### Step 1: Get Google Credentials

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

### Step 2: Update .env File

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

### Step 3: Restart & Test

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

## 🧪 Verify the Fix

### Run Diagnostic
```bash
node diagnose_google_auth.js
```

**Expected output after adding credentials:**
```
✅ env File
✅ google Credentials
✅ next Auth Config
✅ sign In Page
✅ prisma Schema
✅ server Status
✅ browser Access
```

### Manual Test
1. Open browser → http://localhost:3000/auth/signin
2. Click "Sign in with Google"
3. Complete Google authentication
4. Check you're redirected to dashboard

---

## 📚 Documentation

- **Quick Start:** `GOOGLE_AUTH_QUICK_START.md`
- **Full Setup Guide:** `GOOGLE_AUTH_SETUP.md`
- **Summary:** `GOOGLE_AUTH_SUMMARY.md`
- **Diagnostic Tool:** `node diagnose_google_auth.js`

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

## 🎯 What's Already Working

✅ **NextAuth Configuration** - Google provider is set up  
✅ **Sign-In Page** - Google button is present  
✅ **Prisma Schema** - OAuth models exist  
✅ **Database** - Ready to store Google data  
✅ **Server** - Running on port 3000  
✅ **UI** - Sign-in page loads correctly  

**Only missing piece:** Google credentials in `.env` file!

---

## 📝 Commands

```bash
# Run diagnostic
node diagnose_google_auth.js

# Test Google auth setup
node test_google_auth.js

# Run all tests
node test_registration_flow.js

# Start server
npm run dev

# Check database
npx prisma studio
```

---

## 🎉 Success Criteria

Once you add the credentials, Google authentication will work when:
- ✅ "Sign in with Google" button appears
- ✅ Clicking it redirects to Google
- ✅ Google consent screen appears
- ✅ User can grant permissions
- ✅ User is redirected back to app
- ✅ User appears in database
- ✅ Session is created
- ✅ User can access dashboard

---

## 📞 Need Help?

- **Quick Start:** `GOOGLE_AUTH_QUICK_START.md`
- **Full Guide:** `GOOGLE_AUTH_SETUP.md`
- **Summary:** `GOOGLE_AUTH_SUMMARY.md`
- **Diagnostic:** `node diagnose_google_auth.js`

---

## 🚀 Next Steps

1. **Get Google credentials** (5 minutes)
2. **Add to `.env` file** (1 minute)
3. **Restart server** (1 minute)
4. **Test Google sign-in** (2 minutes)

**Total time:** ~10 minutes

---

**Google authentication is fully configured - just add credentials!** 🎉