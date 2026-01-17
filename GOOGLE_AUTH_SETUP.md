# 🔐 Google OAuth Authentication Setup Guide
**Project:** Rishihood Sports Fest 2026  
**Date:** January 17, 2026

---

## 📋 Overview

This guide provides step-by-step instructions to set up Google OAuth authentication for the Sports Fest platform. The platform is already configured to support Google authentication - you just need to set up the credentials.

---

## ✅ Prerequisites

Before starting, ensure you have:
- A Google account (Gmail)
- Access to the Google Cloud Console
- Your application running locally (http://localhost:3000)

---

## 🚀 Step-by-Step Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click **"New Project"** button (top right)
4. Enter project name: `Sports Fest 2026`
5. Select your organization (if applicable)
6. Click **"Create"**

### Step 2: Enable Google+ API

1. In your project dashboard, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** (or "Google People API")
3. Click on **"Google People API"**
4. Click **"Enable"**
5. Wait for the API to be enabled

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** (for development) or **"Internal"** (if you have a G Suite account)
3. Fill in the required information:

   **App Information:**
   - App name: `Sports Fest 2026`
   - User support email: Your email
   - Developer contact email: Your email

   **App Domain:**
   - Application Homepage: `http://localhost:3000`
   - Application Privacy Policy: `http://localhost:3000/privacy`
   - Application Terms of Service: `http://localhost:3000/terms`

   **Authorized Domains:**
   - Add `localhost` (for development)
   - Add your production domain later

   **Developer Contact Information:**
   - Your email address

4. Click **"Save and Continue"**

### Step 4: Add Test Users (Optional but Recommended)

1. In the OAuth consent screen, go to **"Test users"**
2. Click **"Add users"**
3. Enter the email addresses of users who can test the app during development
4. Click **"Add"**

### Step 5: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
3. Fill in the form:

   **Application type:** Web application
   **Name:** `Sports Fest Web App`

   **Authorized JavaScript origins:**
   - `http://localhost:3000`

   **Authorized redirect URIs:**
   - `http://localhost:3000/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (add this twice if needed)

4. Click **"Create"**

### Step 6: Get Your Credentials

1. After creating credentials, you'll see your **Client ID** and **Client Secret**
2. Copy both values - you'll need them for the `.env` file
3. You can also download the credentials as JSON for backup

### Step 7: Update Environment Variables

1. Open your `.env` file
2. Add or update the following variables:

```env
# Google OAuth Credentials
GOOGLE_CLIENT_ID="your-client-id-from-google-cloud"
GOOGLE_CLIENT_SECRET="your-client-secret-from-google-cloud"

# NextAuth Configuration (ensure these are set)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
```

**Important Notes:**
- Replace `your-client-id-from-google-cloud` with your actual Client ID
- Replace `your-client-secret-from-google-cloud` with your actual Client Secret
- Ensure `NEXTAUTH_SECRET` is at least 32 characters long
- For production, update `NEXTAUTH_URL` to your production domain

### Step 8: Restart Your Application

1. Stop the development server (Ctrl+C)
2. Restart it:
```bash
npm run dev
```

### Step 9: Test Google Authentication

1. Open http://localhost:3000/auth/signin
2. Click **"Sign in with Google"** button
3. You should be redirected to Google's consent screen
4. Select your Google account
5. Grant permissions
6. You should be redirected back to the application

---

## 🔧 Troubleshooting

### Issue 1: "Invalid redirect URI" Error

**Problem:** Google rejects the redirect URI

**Solution:**
- Ensure `NEXTAUTH_URL` matches exactly with your authorized domain
- Check that the redirect URI is: `http://localhost:3000/api/auth/callback/google`
- For production, add your production domain to authorized domains in Google Cloud Console

### Issue 2: "Client ID not found" Error

**Problem:** Invalid or missing credentials

**Solution:**
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correctly set in `.env`
- Ensure there are no extra spaces or quotes
- Regenerate credentials if needed

### Issue 3: "Invalid client" Error

**Problem:** Credentials don't match the project

**Solution:**
- Make sure you're using credentials from the correct Google Cloud project
- Check that the OAuth consent screen is published (not in testing mode)
- Verify the project ID matches

### Issue 4: "Email already exists" Error

**Problem:** User signed up with credentials, now trying Google OAuth

**Solution:**
- This is expected behavior - the email is already registered
- Users can link their Google account to existing credentials account
- The system will handle this automatically

### Issue 5: "Invalid JWT" or "Invalid session" Error

**Problem:** NEXTAUTH_SECRET is not set or too short

**Solution:**
- Generate a strong secret: `openssl rand -base64 32`
- Add to `.env`: `NEXTAUTH_SECRET="your-generated-secret"`
- Restart the application

---

## 📝 Configuration Checklist

### Development (Local)
- [ ] Google Cloud Project created
- [ ] Google People API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 Client ID created
- [ ] `GOOGLE_CLIENT_ID` set in `.env`
- [ ] `GOOGLE_CLIENT_SECRET` set in `.env`
- [ ] `NEXTAUTH_URL` set to `http://localhost:3000`
- [ ] `NEXTAUTH_SECRET` set (min 32 chars)
- [ ] Application restarted
- [ ] Google sign-in tested successfully

### Production
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Add production domain to authorized domains in Google Cloud
- [ ] Add production redirect URI: `https://yourdomain.com/api/auth/callback/google`
- [ ] Update OAuth consent screen with production URLs
- [ ] Remove test users (or keep for internal testing)
- [ ] Consider changing consent screen to "Internal" (if using G Suite)
- [ ] Set up proper SSL/HTTPS
- [ ] Configure production database (PostgreSQL)

---

## 🔐 Security Best Practices

### 1. Keep Credentials Secure
- Never commit `.env` file to version control
- Use environment variables in production
- Rotate credentials periodically
- Use different credentials for dev/staging/production

### 2. OAuth Consent Screen
- Use "Internal" for G Suite organizations
- Provide clear privacy policy and terms of service
- Only request necessary scopes
- Clearly explain what data you're accessing

### 3. User Data
- Only request email and basic profile information
- Store only necessary user data
- Implement proper data retention policies
- Comply with GDPR/privacy regulations

### 4. Production Security
- Use HTTPS only
- Implement rate limiting
- Monitor for suspicious activity
- Regular security audits

---

## 🎯 How Google Authentication Works

### Flow Diagram
```
User clicks "Sign in with Google"
    ↓
Redirect to Google's OAuth page
    ↓
User grants permission
    ↓
Google redirects to /api/auth/callback/google
    ↓
NextAuth processes the callback
    ↓
Check if user exists in database
    ↓
If new user: Create account with Google data
    ↓
If existing user: Link Google account
    ↓
Create session and JWT token
    ↓
Redirect to callback URL (dashboard)
```

### Data Stored
When a user signs in with Google, the following data is stored:

**User Table:**
- `id` (auto-generated)
- `email` (from Google)
- `name` (from Google)
- `image` (from Google)
- `role` (default: PARTICIPANT)
- `emailVerified` (timestamp)

**Account Table:**
- `userId` (links to User)
- `provider` ("google")
- `providerAccountId` (Google's user ID)
- OAuth tokens (access_token, refresh_token, etc.)

---

## 📚 API Integration

### NextAuth Configuration
The Google provider is already configured in `src/lib/auth.ts`:

```typescript
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID || "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
}),
```

### Prisma Adapter
The Prisma adapter handles user creation and linking automatically:

```typescript
adapter: PrismaAdapter(db) as Adapter,
```

### Callbacks
Custom callbacks handle additional user data:

```typescript
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      const dbUser = await db.user.findUnique({
        where: { email: user.email! },
        select: { id: true, role: true, collegeId: true },
      });
      // Add custom data to token
    }
    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.collegeId = token.collegeId as string | null;
    }
    return session;
  },
}
```

---

## 🧪 Testing Google Authentication

### Manual Testing Steps

1. **Clear Browser Data**
   - Clear cookies and cache for localhost
   - This ensures a clean test

2. **Test Sign In Flow**
   ```bash
   npm run dev
   # Open http://localhost:3000/auth/signin
   # Click "Sign in with Google"
   ```

3. **Verify Database**
   ```bash
   npx prisma studio
   # Check User and Account tables
   ```

4. **Check Session**
   - After signing in, check browser console
   - Verify session data is correct
   - Check that user role is set

### Automated Testing
```bash
# Run the registration flow test
node test_registration_flow.js
```

---

## 📊 Monitoring & Analytics

### What to Monitor
- Number of Google sign-ins
- Success/failure rates
- User registration sources
- Error logs

### Recommended Tools
- **Sentry** - Error tracking
- **Google Analytics** - User behavior
- **Vercel Analytics** - Performance

---

## 🚀 Production Deployment Checklist

### Before Going Live
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Add production redirect URIs to Google Cloud
- [ ] Update OAuth consent screen with production URLs
- [ ] Switch to production database (PostgreSQL)
- [ ] Set up SSL/HTTPS
- [ ] Configure rate limiting
- [ ] Set up error monitoring
- [ ] Test end-to-end flow
- [ ] Update documentation

### Post-Deployment
- [ ] Monitor authentication logs
- [ ] Track user registration sources
- [ ] Set up alerts for errors
- [ ] Regular security audits

---

## 📞 Support

If you encounter issues:

1. **Check the logs** - Look for error messages in terminal
2. **Verify credentials** - Ensure `.env` variables are correct
3. **Check Google Cloud Console** - Verify project settings
4. **Review NextAuth docs** - [next-auth.js.org](https://next-auth.js.org)

---

## 🎉 Success Criteria

Google authentication is working correctly when:
- ✅ User can click "Sign in with Google"
- ✅ Google consent screen appears
- ✅ User can grant permissions
- ✅ User is redirected back to app
- ✅ User appears in database
- ✅ Session is created
- ✅ User can access protected routes

---

## 📝 Additional Resources

- [NextAuth Google Provider Documentation](https://next-auth.js.org/providers/google)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Documentation](https://oauth.net/2/)
- [Prisma Adapter Documentation](https://www.prisma.io/docs/orm/overview/authentication)

---

**Built with ❤️ for Rishihood University Sports Fest 2026**