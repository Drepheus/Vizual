# 🚨 URGENT: Set Up Your Database (5 Minutes)

## Why This Is Needed

Your subscription system code is installed, but it **can't track usage** because the database tables don't exist yet. That's why users can generate unlimited videos right now.

---

## Step-by-Step Setup

### 1️⃣ Open Supabase (1 minute)

1. Go to **https://supabase.com**
2. Sign in with your account
3. Click on your **Vizual project** (or whatever you named it)

### 2️⃣ Open SQL Editor (30 seconds)

1. Look at the left sidebar in Supabase
2. Click **"SQL Editor"** (it has a database icon)
3. Click the **"+ New Query"** button at the top

### 3️⃣ Copy and Paste the SQL (1 minute)

1. Open the file **`supabase-subscription-schema.sql`** in this folder
2. **Select ALL the text** (Ctrl+A)
3. **Copy it** (Ctrl+C)
4. Go back to Supabase SQL Editor
5. **Paste it** into the editor (Ctrl+V)

### 4️⃣ Run the SQL (30 seconds)

1. Click the **"RUN"** button (or press Ctrl+Enter)
2. Wait 2-3 seconds
3. You should see **"Success. No rows returned"** ✅

### 5️⃣ Verify It Worked (1 minute)

1. In Supabase left sidebar, click **"Table Editor"**
2. You should now see these tables:
   - ✅ **users** (with new columns: subscription_tier, stripe_customer_id, etc.)
   - ✅ **usage_tracking** (brand new table)
3. Click on **users** table
4. You should see a new column called **subscription_tier** with value **"free"**

---

## ✅ Test It Now

After running the SQL:

1. **Refresh your Vizual website** (F5)
2. Try to generate **3 videos** in a row
3. On the **3rd video**, you should see the **paywall modal** pop up! 🎉

---

## What This SQL Does

- ✅ Adds subscription tracking to your users
- ✅ Creates a usage tracking table (counts video/image/chat usage)
- ✅ Sets up free tier limits (2 videos, 10 images, 15 chats/4hrs)
- ✅ Makes Pro users unlimited
- ✅ Creates automatic functions to check and increment usage

---

## 🆘 Troubleshooting

### "relation 'users' does not exist"
- You need to create the main users table first
- Go to SQL Editor and run your main schema file first

### "permission denied"
- Make sure you're signed in to Supabase
- You need to be the project owner

### Still see no paywall after 3 videos?
1. Open browser console (F12)
2. Check for errors from `/api/check-usage`
3. Make sure the SQL ran successfully
4. Try logging out and back in

---

## Next Steps After This Works

Once the paywall shows up:
1. Set up Stripe account (for payments)
2. Add Stripe keys to Vercel
3. Test the upgrade flow

But first, **let's get the database working!** 🚀
