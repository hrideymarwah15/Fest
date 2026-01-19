# Vercel Deployment Issue Diagnosis

## Issue
"Failed to fetch sports" error on deployed Vercel site

## Root Cause
The `DATABASE_URL` environment variable is not set on Vercel, causing the Prisma client initialization to fail.

## Solution Steps

### 1. Add DATABASE_URL to Vercel

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your project (Sports Fest)
3. Click on "Settings" tab
4. Click on "Environment Variables" in the sidebar
5. Add new environment variable:
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://postgres.hdwkpakorrnqeyfwzuoh:rishihood%40123@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
   - **Environment**: Check all three boxes (Production, Preview, Development)
6. Click "Save"

### 2. Redeploy the Application

After adding the environment variable, you MUST redeploy:

**Option A: Trigger from Vercel Dashboard**
1. Go to "Deployments" tab
2. Find your latest deployment
3. Click the "..." menu (three dots)
4. Click "Redeploy"
5. Select "Redeploy" (NOT "Redeploy with existing Build Cache" - we want a fresh build)

**Option B: Trigger from Git**
1. Make any small change (like adding a space in README.md)
2. Commit and push:
   ```bash
   git add .
   git commit -m "Trigger redeploy with DATABASE_URL"
   git push
   ```

### 3. Verify the Fix

After redeployment completes:

1. Visit your deployed site
2. Go to /sports page
3. Check if sports are loading
4. If still not working, check browser console (F12) for errors

## Additional Environment Variables to Check

Make sure these are also set on Vercel:

1. `NEXTAUTH_URL` - Should be your production URL (e.g., `https://your-domain.vercel.app`)
2. `NEXTAUTH_SECRET` - Should match your local .env
3. `GOOGLE_CLIENT_ID` - For Google OAuth
4. `GOOGLE_CLIENT_SECRET` - For Google OAuth
5. `RAZORPAY_KEY_ID` - For payments
6. `RAZORPAY_KEY_SECRET` - For payments

## Why This Happened

1. The `/src/lib/db.ts` file requires `DATABASE_URL` to initialize Prisma
2. If `DATABASE_URL` is missing, it throws an error: "DATABASE_URL environment variable is not set"
3. This prevents the API routes from working
4. The client-side fetch to `/api/sports` fails with "Failed to fetch sports"

## Verification Commands

To verify your local environment still works:

```bash
# Start dev server
npm run dev

# In another terminal, test API
curl http://localhost:3000/api/sports
```

## Common Mistakes

❌ **Adding env var but not redeploying** - Env vars only apply to new deployments
❌ **Using wrong database URL format** - Must include `?pgbouncer=true` for Supabase
❌ **Not checking all environment options** - Must select Production, Preview, Development
❌ **Using "Redeploy with existing Build Cache"** - This might not pick up env var changes

## Need More Help?

If still not working after these steps:

1. Check Vercel deployment logs:
   - Go to Deployments → Click on latest deployment → View Function Logs
   - Look for DATABASE_URL errors

2. Check browser console:
   - F12 → Console tab
   - Look for network errors or API failures

3. Test the API directly:
   - Visit: `https://your-domain.vercel.app/api/sports`
   - Should return JSON array of sports

## Expected API Response

When working correctly, `/api/sports` should return:

```json
[
  {
    "id": "cmkir3udl000addv9nu9one58",
    "name": "Football",
    "slug": "football",
    "description": "...",
    "type": "TEAM",
    "gender": "OPEN",
    "minTeamSize": 11,
    "maxTeamSize": 15,
    "maxSlots": 16,
    "filledSlots": 0,
    "fee": 2000,
    "registrationOpen": true,
    "eventDate": "2025-02-15T00:00:00.000Z",
    "venue": "Main Ground"
  },
  // ... more sports
]
```
