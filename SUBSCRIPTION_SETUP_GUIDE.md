# Subscription & Rate Limiting Setup Guide

This guide explains how to set up the subscription and rate limiting system for Vizual AI.

## Overview

The system implements:
- **Free Tier**: 15 chat prompts per 4 hours, 10 image generations (lifetime), 2 video generations (lifetime)
- **Pro Tier ($5/month)**: Unlimited everything
- Modern paywall modal that appears when limits are reached
- Stripe integration for payments
- Automatic usage tracking

## 1. Database Setup

### Run SQL Scripts in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. First, ensure the main schema is set up by running `supabase-schema.sql`
4. Then run `supabase-subscription-schema.sql` to add subscription features

### Verify Tables Created

Check that these tables exist:
- `users` (with new subscription fields)
- `usage_tracking`

And these functions:
- `get_user_usage()`
- `increment_usage()`
- `can_user_perform_action()`

## 2. Stripe Setup

### Create Stripe Account
1. Go to [https://stripe.com](https://stripe.com) and create an account
2. Complete account verification

### Get API Keys
1. In Stripe Dashboard, go to **Developers** → **API keys**
2. Copy your **Publishable key** (starts with `pk_`)
3. Copy your **Secret key** (starts with `sk_`)
4. In **Developers** → **Webhooks**, create a webhook endpoint pointing to:
   ```
   https://your-domain.vercel.app/api/stripe-webhook
   ```
5. Select these events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
6. Copy the **Signing secret** (starts with `whsec_`)

### Add to Vercel Environment Variables

In your Vercel project settings, add these environment variables:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Important**: The `SUPABASE_SERVICE_ROLE_KEY` is different from the anon key. Get it from Supabase Dashboard → Settings → API → service_role key.

## 3. Install Dependencies

Run in your project directory:

```bash
npm install stripe
```

This adds Stripe to your project for payment processing.

## 4. Integrate into SplashPage.tsx

Add these imports at the top:

```typescript
import PaywallModal from './PaywallModal';
import { checkUsageLimit, incrementUsage, UsageType } from './usageTracking';
```

Add state for paywall modal after other useState declarations:

```typescript
const [showPaywall, setShowPaywall] = useState(false);
const [paywallLimitType, setPaywallLimitType] = useState<'chat' | 'image' | 'video'>('chat');
const [paywallUsage, setPaywallUsage] = useState({ current: 0, limit: 15, resetAt: null });
```

Create a helper function to check and show paywall:

```typescript
const checkAndShowPaywall = async (usageType: UsageType) => {
  if (!user) return true; // Allow guests to use without limits for now
  
  try {
    const result = await checkUsageLimit(user.id, usageType);
    
    if (!result.canPerform) {
      setPaywallLimitType(usageType === 'chat' ? 'chat' : usageType === 'image_gen' ? 'image' : 'video');
      setPaywallUsage({
        current: result.currentUsage,
        limit: result.usageLimit,
        resetAt: result.resetAt
      });
      setShowPaywall(true);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking usage limit:', error);
    return true; // Allow on error to not block user
  }
};
```

## 5. Update handleSubmit Function

Modify the `handleSubmit` function to check limits before actions:

**For Video Generation** (add before the video gen logic):
```typescript
if (isVideoGenActive) {
  // Check usage limit
  const canProceed = await checkAndShowPaywall('video_gen');
  if (!canProceed) return;
  
  console.log('Generating video with prompt:', input.trim());
  setIsGeneratingVideo(true);
  // ... rest of video generation code
  
  // After successful generation, increment usage
  if (user && data.videoUrl) {
    await incrementUsage(user.id, 'video_gen');
  }
}
```

**For Image Generation** (add before the image gen logic):
```typescript
if (isInstantGenActive) {
  // Check usage limit
  const canProceed = await checkAndShowPaywall('image_gen');
  if (!canProceed) return;
  
  console.log('Generating image with prompt:', input.trim());
  setIsGeneratingImage(true);
  // ... rest of image generation code
  
  // After successful generation, increment usage
  if (user && data.imageUrl) {
    await incrementUsage(user.id, 'image_gen');
  }
}
```

**For Chat** (add before sending chat message):
```typescript
// Before calling sendMessage
const canProceed = await checkAndShowPaywall('chat');
if (!canProceed) return;

// Call sendMessage
const result = await sendMessage({ text: input.trim() });

// After successful message, increment usage
if (user && result) {
  await incrementUsage(user.id, 'chat');
}
```

## 6. Add PaywallModal to JSX

Near the end of the component's return statement, before the closing `</div>`:

```typescript
{/* Paywall Modal */}
<PaywallModal
  isOpen={showPaywall}
  onClose={() => setShowPaywall(false)}
  limitType={paywallLimitType}
  currentUsage={paywallUsage.current}
  usageLimit={paywallUsage.limit}
  resetAt={paywallUsage.resetAt}
/>
```

## 7. Update Checkout Session API

The `/api/create-checkout-session` endpoint needs the user's email. Update the PaywallModal component to pass user info:

Modify `PaywallModal.tsx` handleUpgrade function:

```typescript
const handleUpgrade = async () => {
  try {
    // Get user from Supabase
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert('Please log in to upgrade');
      return;
    }
    
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: user.id, 
        email: user.email 
      }),
    });
    
    const data = await response.json();
    
    if (data.url) {
      window.location.href = data.url;
    }
  } catch (error) {
    console.error('Error creating checkout:', error);
    alert('Failed to start checkout. Please try again.');
  }
};
```

And add this import at the top of `PaywallModal.tsx`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

## 8. Test the System

### Testing Free Tier Limits

1. Create a new account or use test account
2. Send 15 chat messages - the 16th should trigger paywall
3. Generate 10 images - the 11th should trigger paywall
4. Generate 2 videos - the 3rd should trigger paywall

### Testing Chat Reset

Wait 4 hours or manually update the `reset_at` timestamp in the database to test chat limit reset.

### Testing Stripe Checkout

1. Click "Upgrade to Vizual Pro" in the paywall modal
2. Use Stripe test card: `4242 4242 4242 4242`
3. Use any future expiry date and any CVC
4. Complete checkout
5. Verify in Supabase that your `subscription_tier` changed to `'pro'`
6. Try using features - no limits should apply

### Testing Webhook

Use Stripe CLI for local testing:

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
stripe trigger checkout.session.completed
```

## 9. Production Checklist

- [ ] Switch Stripe keys from test to live mode
- [ ] Update `STRIPE_SECRET_KEY` in Vercel to live key
- [ ] Update `STRIPE_WEBHOOK_SECRET` to production webhook
- [ ] Test entire flow in production
- [ ] Set up monitoring for failed payments
- [ ] Add cancellation flow (optional)
- [ ] Add billing portal (optional, use Stripe Customer Portal)

## 10. Adding Billing Portal (Optional)

To let users manage their subscription, add this API endpoint:

Create `/api/create-portal-session.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerId } = req.body;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${req.headers.origin}/dashboard`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Portal session error:', error);
    return res.status(500).json({ error: 'Failed to create portal session' });
  }
}
```

Then add a "Manage Subscription" button in your dashboard for Pro users.

## Support

If you encounter issues:
1. Check Vercel logs for API errors
2. Check Supabase logs for database errors  
3. Check Stripe Dashboard → Events for webhook issues
4. Verify all environment variables are set correctly

## Security Notes

- Never expose `STRIPE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in client code
- All usage checks are done server-side
- Webhook signature verification prevents fake events
- Row Level Security (RLS) in Supabase protects user data
