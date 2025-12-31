# Setup Usage Tracking Database Functions

## The Problem
When users try to send messages, the app fails with a 500 error because the database functions for usage tracking aren't set up yet.

## Solution: Run the SQL Schema

You need to run the `supabase-subscription-schema.sql` file in your Supabase database.

### Steps:

1. **Go to Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project: **Vizual-AI**

2. **Open SQL Editor**
   - Click on **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Copy and Paste the Schema**
   - Open the file: `supabase-subscription-schema.sql`
   - Copy **ALL** the content
   - Paste it into the SQL Editor

4. **Run the Query**
   - Click **Run** (or press Ctrl+Enter)
   - Wait for "Success. No rows returned" message

## What This Creates:

✅ `usage_tracking` table - Tracks user usage for chat, image, video
✅ `subscription_tier` column in users table - Tracks free vs pro
✅ `can_user_perform_action()` function - Checks if user can perform action
✅ `increment_usage()` function - Increments usage count
✅ `get_user_usage()` function - Gets current usage stats

## After Running:

1. **Clear your browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh the page** (Ctrl+Shift+R)
3. **Try sending a message again**

## Verification:

To verify it worked, run this query in SQL Editor:
```sql
SELECT * FROM pg_proc WHERE proname = 'can_user_perform_action';
```

You should see the function listed.

## Still Not Working?

If you still get errors after running the SQL, check the Supabase logs:
1. Go to **Logs** in the left sidebar
2. Click **Postgres Logs**
3. Look for any error messages about the `can_user_perform_action` function

Let me know if you see any errors and I'll help fix them!
