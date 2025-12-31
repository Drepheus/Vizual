# ✅ Integration Complete - Final Setup Steps

## 🎉 What's Done

The subscription system is now **fully integrated** into your SplashPage! Here's what was added:

### Code Integration ✅
- ✅ Imported PaywallModal and usage tracking functions
- ✅ Added paywall state variables (showPaywall, paywallLimitType, paywallUsage)
- ✅ Created `checkAndShowPaywall()` helper function
- ✅ Added usage checks **BEFORE** video generation
- ✅ Added usage checks **BEFORE** image generation  
- ✅ Added usage checks **BEFORE** chat messages
- ✅ Added usage increment **AFTER** successful video generation
- ✅ Added usage increment **AFTER** successful image generation
- ✅ Added usage increment **AFTER** successful chat messages
- ✅ Added PaywallModal component to JSX
- ✅ Connected PaywallModal to Stripe checkout with user authentication

---

## 🔧 What You Need to Do Now

### Step 1: Set Up Database (5 minutes)

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and run the contents of `supabase-subscription-schema.sql`
4. Verify these tables/functions were created:
   - Table: `usage_tracking`
   - Function: `increment_usage()`
   - Function: `can_user_perform_action()`
   - Function: `get_user_usage()`
   - Updated: `users` table has new subscription columns

### Step 2: Create Stripe Account (5 minutes)

1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for an account
3. Complete account verification
4. **Stay in Test Mode** for now

### Step 3: Get Stripe API Keys (2 minutes)

1. In Stripe Dashboard, go to **Developers** → **API keys**
2. Copy these keys:
   - **Publishable key** (pk_test_...) - Not needed yet
   - **Secret key** (sk_test_...) - ⚠️ **Keep this secure!**

### Step 4: Set Up Stripe Webhook (5 minutes)

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://your-vercel-app.vercel.app/api/stripe-webhook
   ```
   Replace `your-vercel-app` with your actual Vercel domain

4. Select these events to listen for:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`

5. Click **Add endpoint**
6. Copy the **Signing secret** (whsec_...)

### Step 5: Add Environment Variables to Vercel (5 minutes)

1. Go to your **Vercel Dashboard**
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these three variables:

   **Variable 1:**
   ```
   Name: STRIPE_SECRET_KEY
   Value: sk_test_... (from Step 3)
   ```

   **Variable 2:**
   ```
   Name: STRIPE_WEBHOOK_SECRET
   Value: whsec_... (from Step 4)
   ```

   **Variable 3:**
   ```
   Name: SUPABASE_SERVICE_ROLE_KEY
   Value: (Get from Supabase Dashboard → Settings → API → service_role key)
   ```

5. **Important**: Make sure all variables are set for **Production**, **Preview**, and **Development**

6. Click **Save**

### Step 6: Redeploy (1 minute)

After adding environment variables, you need to redeploy:

1. In Vercel Dashboard, go to **Deployments**
2. Click the **...** menu on your latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete (~30 seconds)

---

## 🧪 Testing Your Setup

### Test 1: Free Tier Limits

1. Create a new test account or use an existing one
2. **Test Chat Limit:**
   - Send 15 chat messages
   - On the 16th message, paywall should appear ✅
   
3. **Test Image Limit:**
   - Activate Image Gen mode
   - Generate 10 images
   - On the 11th attempt, paywall should appear ✅
   
4. **Test Video Limit:**
   - Activate Video Gen mode
   - Generate 2 videos
   - On the 3rd attempt, paywall should appear ✅

### Test 2: Paywall Modal

When limit is hit, verify the modal shows:
- ✅ Correct icon (💬 for chat, ⚡ for image, 🎬 for video)
- ✅ Current usage count
- ✅ Timer for chat reset (if applicable)
- ✅ Pro plan features list
- ✅ $5/month pricing
- ✅ Golden "Upgrade to Vizual Pro" button

### Test 3: Stripe Checkout

1. Click **"Upgrade to Vizual Pro"** in the paywall
2. Should redirect to Stripe checkout page ✅
3. Use Stripe test card:
   ```
   Card: 4242 4242 4242 4242
   Expiry: Any future date (e.g., 12/25)
   CVC: Any 3 digits (e.g., 123)
   ZIP: Any 5 digits (e.g., 12345)
   ```
4. Complete checkout ✅
5. Should redirect back to your dashboard ✅

### Test 4: Pro Upgrade Verification

After completing checkout:
1. Check Supabase database:
   - User's `subscription_tier` should be `'pro'` ✅
   - User's `subscription_status` should be `'active'` ✅
   
2. Try using the app:
   - Send 50+ chat messages (no limit) ✅
   - Generate 20+ images (no limit) ✅
   - Generate 10+ videos (no limit) ✅
   - Should never see paywall ✅

### Test 5: Webhook Events

1. Check your Vercel logs for webhook processing
2. Look for these log messages:
   - "User {userId} upgraded to Pro" ✅
   - "Subscription updated for user..." ✅

---

## 🚨 Troubleshooting

### Paywall Doesn't Show
- Check browser console for errors
- Verify user is logged in (guests bypass limits)
- Check Supabase database connection

### Checkout Fails
- Verify `STRIPE_SECRET_KEY` is set correctly
- Check Vercel logs for API errors
- Ensure user email exists in Supabase

### Webhook Not Working
- Verify webhook URL is correct
- Check `STRIPE_WEBHOOK_SECRET` matches Stripe
- Look at Stripe Dashboard → Webhooks → Events for errors
- Check Vercel function logs

### User Still Seeing Limits After Upgrade
- Check Supabase `users` table
- Verify `subscription_tier` is `'pro'`
- Clear browser cache and refresh

---

## 📊 Monitoring & Management

### View Subscriptions
- Go to **Stripe Dashboard** → **Customers**
- See all subscribers and their status
- View payment history

### View Usage
- Check Supabase `usage_tracking` table
- Query: `SELECT * FROM usage_tracking WHERE user_id = 'USER_ID' ORDER BY created_at DESC;`

### Cancel Subscription (Manual)
In Supabase, run:
```sql
UPDATE users 
SET subscription_tier = 'free', 
    subscription_status = 'cancelled'
WHERE id = 'USER_ID';
```

---

## 🚀 Going to Production

When ready to accept real payments:

1. **Switch Stripe to Live Mode**
   - In Stripe Dashboard, toggle from Test to Live
   - Get new live API keys (sk_live_...)
   
2. **Update Vercel Environment Variables**
   - Replace `STRIPE_SECRET_KEY` with live key
   - Update webhook secret with live webhook
   
3. **Create Live Webhook**
   - Same events as test mode
   - Point to production URL
   
4. **Test End-to-End**
   - Use real card for one test
   - Verify everything works
   - Immediately cancel test subscription

5. **Monitor**
   - Watch Stripe Dashboard for payments
   - Check Vercel logs for errors
   - Monitor user feedback

---

## 📞 Need Help?

If something isn't working:

1. **Check the logs:**
   - Vercel logs for API errors
   - Browser console for frontend errors
   - Stripe webhook events for payment issues

2. **Verify setup:**
   - All environment variables set ✅
   - SQL schema ran successfully ✅
   - Webhook endpoint correct ✅

3. **Common fixes:**
   - Redeploy after adding env variables
   - Clear browser cache
   - Check Supabase RLS policies
   - Verify user is authenticated

---

## 🎯 Summary

**Your subscription system is fully coded and ready!**

You just need to:
1. ✅ Run SQL in Supabase (5 min)
2. ✅ Set up Stripe account + webhook (10 min)
3. ✅ Add environment variables to Vercel (5 min)
4. ✅ Redeploy (1 min)
5. ✅ Test with Stripe test card (5 min)

**Total time to go live: ~30 minutes** 🚀

Everything is production-ready and fully integrated!
