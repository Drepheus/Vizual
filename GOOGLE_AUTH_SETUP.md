# Google OAuth Setup Guide for Omi AI

## Problem
Cannot log in with Google account - OAuth is not fully configured.

## Solution: Complete Google Cloud Console Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a Project" → "New Project"
3. Name it "Omi AI" or similar
4. Click "Create"

### Step 2: Enable Google OAuth
1. In your project, go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace)
3. Click **Create**

#### Configure OAuth Consent Screen:
- **App name**: `Omi AI`
- **User support email**: Your email
- **Developer contact email**: Your email
- Click **Save and Continue**

#### Scopes:
- Click **Add or Remove Scopes**
- Add these scopes:
  - `.../auth/userinfo.email`
  - `.../auth/userinfo.profile`
- Click **Update** → **Save and Continue**

#### Test Users (Optional for development):
- Add your email address as a test user
- Click **Save and Continue**

### Step 3: Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
3. Choose **Web application**
4. Name it "Omi AI Web Client"

#### Configure Authorized URIs:

**Authorized JavaScript origins:**
```
http://localhost:5175
http://localhost:3000
https://cnysdbjajxnpmrugnpme.supabase.co
```

**Authorized redirect URIs:**
```
http://localhost:5175
http://localhost:5175/
http://localhost:3000
https://cnysdbjajxnpmrugnpme.supabase.co/auth/v1/callback
```

*(When you deploy to Vercel, you'll add your Vercel URLs here too)*

5. Click **Create**
6. **IMPORTANT**: Copy the **Client ID** and **Client Secret** - you'll need these!

### Step 4: Configure Supabase
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **Google** and click to enable it

#### Enter your Google OAuth credentials:
- **Client ID**: Paste the Client ID from Step 3
- **Client Secret**: Paste the Client Secret from Step 3
- **Redirect URL** (should be pre-filled): `https://cnvsdbjsjwqmpugmpmap.supabase.co/auth/v1/callback`
- Click **Save**

### Step 5: Configure Supabase URL Configuration
1. In Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:5175` (for development)
3. Add **Redirect URLs**:
   ```
   http://localhost:5175
   http://localhost:5175/**
   http://localhost:3000
   http://localhost:3000/**
   ```

### Step 6: Test the Login
1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:5175` in your browser
3. Click "Start" → "Continue with Google"
4. You should see the Google OAuth consent screen
5. Sign in with your Google account
6. You should be redirected back to the app and logged in!

---

## Fixing "Try Again" Screen

If you see a "try again" screen after clicking Google login, follow these steps:

### 1. Check Google Cloud Console URLs
The most common cause is mismatched redirect URIs. In Google Cloud Console:

- Go to **APIs & Services** → **Credentials** → Your OAuth Client
- Under **Authorized redirect URIs**, make sure you have **EXACTLY**:
  ```
  https://cnysdbjajxnpmrugnpme.supabase.co/auth/v1/callback
  ```
  (Note: This is the Supabase callback URL, NOT your app URL)

- Under **Authorized JavaScript origins**, add:
  ```
  http://localhost:5175
  https://cnysdbjajxnpmrugnpme.supabase.co
  ```

### 2. Verify Supabase Configuration
In your Supabase Dashboard:

- Go to **Authentication** → **Providers** → **Google**
- Make sure **Enabled** is toggled ON
- Verify your Client ID and Client Secret are entered correctly
- Click **Save** (even if you didn't change anything)

### 3. Check Supabase URL Configuration
- Go to **Authentication** → **URL Configuration**
- Site URL should be: `http://localhost:5175`
- Redirect URLs should include:
  ```
  http://localhost:5175
  http://localhost:5175/**
  ```

### 4. Clear Browser Cache
- Clear your browser cookies and cache
- Or try in an incognito/private window
- Close all browser tabs and restart

### 5. Check Browser Console
Open browser console (F12) and look for errors:
- "redirect_uri_mismatch" → Fix Google Cloud Console URLs
- "Invalid redirect URL" → Fix Supabase URL Configuration
- Network errors → Check Supabase credentials in .env.local

### 6. Wait a Few Minutes
Sometimes Google Cloud Console changes take 1-5 minutes to propagate. Wait a bit and try again.

---

## After Deployment to Vercel

When you deploy to Vercel, you'll need to:

### 1. Update Google Cloud Console:
Add your Vercel URLs to **Authorized JavaScript origins** and **Authorized redirect URIs**:
```
https://your-app.vercel.app
https://your-app.vercel.app/auth/callback
```

### 2. Update Supabase URL Configuration:
Add your Vercel URL to **Site URL** and **Redirect URLs**:
```
https://your-app.vercel.app
https://your-app.vercel.app/**
```

---

## Common Issues & Solutions

### Issue: "Access blocked: This app's request is invalid"
**Solution**: Make sure the redirect URI in Google Cloud Console exactly matches the one Supabase uses.

### Issue: "Error 400: redirect_uri_mismatch"
**Solution**: Check that all URLs in Google Cloud Console match your current environment (localhost for dev, Vercel URL for production).

### Issue: Google OAuth screen shows "This app isn't verified"
**Solution**: This is normal for development. Click "Advanced" → "Go to Omi AI (unsafe)" to continue. For production, you can submit for verification.

### Issue: Still can't log in
**Solution**: 
1. Check browser console for errors (F12 → Console tab)
2. Verify environment variables in `.env.local` are correct
3. Make sure Supabase project URL and anon key are correct
4. Try clearing browser cache and cookies

---

## Quick Test Command
Run this to check if your environment variables are loaded:
```bash
npm run dev
```
Then check the browser console - you should NOT see "Missing Supabase environment variables" error.
