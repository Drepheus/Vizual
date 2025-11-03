# Admin Dashboard Setup Guide

## 🚀 Quick Setup

### Step 1: Run the SQL Script in Supabase

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `setup-admin-dashboard.sql`
5. Click **Run** to execute

This will create:
- `is_admin_user()` function - Checks if current user is admin
- `get_admin_user_stats()` function - Returns all user data with usage stats
- Updated RLS policies to allow admin access to all data
- Sets andregreengp@gmail.com to PRO tier automatically

**Note:** This script is designed to work with your existing database schema:
- Uses existing `users` table (with `subscription_tier` column)
- Uses existing `usage_tracking` table (with `usage_type` and `count` columns)
- Uses existing `api_logs` table

### Step 2: Verify Your Admin Account

The admin dashboard is accessible only to the account:
- **Email:** andregreengp@gmail.com
- **Access:** Full read/write permissions on all user data

### Step 3: Access the Dashboard

1. Log into the app with your admin account (andregreengp@gmail.com)
2. Click on your email in the top right corner
3. Click the **"👑 Admin Dashboard"** button
4. You'll be redirected to `/admin`

---

## 📊 Dashboard Features

### **Overview Tab**
- Real-time system metrics (total users, active today, revenue, API calls)
- Recent activity feed (last 10 API calls)
- Top users by activity
- Live stats with auto-refresh every 30 seconds

### **Users Tab**
- Searchable user table with all registered users
- View user details:
  - Email, User ID, Current tier
  - Stripe Customer ID
  - Usage stats (chats, images, videos, web tasks)
  - Join date and last active timestamp
- Admin actions:
  - **Upgrade to Pro** - Manually upgrade user to Pro tier
  - **Upgrade to Ultra** - Manually upgrade user to Ultra tier
  - **Reset Usage** - Reset all usage counters to 0
  - **Delete User** - Permanently delete user account

### **Logs Tab**
- Real-time API logs from all endpoints
- Filter by: All, Success (200-399), Errors (400+)
- View detailed request/response data
- Color-coded by status (green = success, red = error)
- Shows: Status code, endpoint, user email, timestamp

### **Analytics Tab**
- Feature usage breakdown with percentage bars
- Conversion funnel (Visitors → Sign Ups → Pro → Ultra)
- Usage statistics for each feature

### **Control Panel Tab**
- Database management tools
- Security & auth controls
- Billing & subscriptions shortcuts
- System alerts and monitoring
- Danger zone for critical operations

---

## 🎨 Dashboard Design

The admin dashboard features:
- **Dark theme** with purple gradient accents
- **Glassmorphism UI** with backdrop blur effects
- **Framer Motion animations** for smooth transitions
- **GSAP entrance animations** for element reveals
- **Floating particle effects** for visual interest
- **Fully responsive** - works on desktop, tablet, and mobile

---

## 🔒 Security

The dashboard has multiple layers of security:

1. **Email-based Admin Check**
   - Only andregreengp@gmail.com can access `/admin` route
   - Automatic redirect if non-admin tries to access

2. **Supabase RLS Policies**
   - `is_admin_user()` function verifies admin status server-side
   - Admin can view ALL user data (api_logs, usage_tracking, user_subscriptions)
   - Regular users can only view their own data

3. **Function-Level Security**
   - `get_admin_user_stats()` has `SECURITY DEFINER` and checks admin status
   - Raises exception if called by non-admin user

---

## 🛠️ Admin Actions Available

### Upgrade User Tier
```typescript
await supabase
  .from('user_subscriptions')
  .upsert({
    user_id: userId,
    tier: 'pro' | 'ultra',
    status: 'active',
  });
```

### Reset User Usage
```typescript
await supabase
  .from('usage_tracking')
  .update({
    chats: 0,
    images: 0,
    videos: 0,
    web_searches: 0,
  })
  .eq('user_id', userId);
```

### Delete User
```typescript
await supabase.auth.admin.deleteUser(userId);
```

---

## 📱 Mobile Responsive

The dashboard adapts to all screen sizes:
- **Desktop (1024px+)**: 4-column metric grid, full table view
- **Tablet (768-1024px)**: 2-column grid, scrollable tables
- **Mobile (<768px)**: Single column, stacked layout, condensed tables

---

## 🔄 Auto-Refresh

The dashboard auto-refreshes data every 30 seconds:
- System metrics (user counts, revenue, API calls)
- API logs (latest 100 entries)
- Can be toggled on/off via header switch
- Manual refresh button available

---

## 🎯 Key Metrics Tracked

1. **Total Users** - Breakdown by tier (Free/Pro/Ultra)
2. **Active Today** - Users who made API calls today
3. **Monthly Revenue** - Estimated from Pro ($4.99) + Ultra ($19.99)
4. **Total API Calls** - All-time API requests
5. **Average Response Time** - API performance metric

---

## 🚀 Performance

The dashboard is optimized for speed:
- React 19.1.1 with concurrent features
- Efficient Supabase queries with RLS
- Client-side caching of user data
- Lazy loading of log details
- Debounced search inputs

---

## 📦 Dependencies

Required packages (already installed):
- `framer-motion@12.23.21` - Animations
- `gsap@3.12.2` - Advanced animations
- `react-router-dom@7.5.0` - Routing
- `@supabase/supabase-js` - Database client

---

## 🐛 Troubleshooting

### "Unauthorized: Admin access only" error
- Ensure you're logged in with andregreengp@gmail.com
- Run `supabase-admin-functions.sql` to set up admin functions

### Admin button not showing in settings
- Verify your logged-in email is exactly `andregreengp@gmail.com`
- Check browser console for React errors

### Dashboard shows "Loading..." forever
- Check Supabase connection
- Verify SQL functions were created successfully
- Check browser console for errors

### User actions not working
- Ensure RLS policies are updated for admin
- Check that `is_admin_user()` function exists
- Verify you have `ADMIN` role in Supabase

---

## 📝 Notes

- The dashboard is read-only for most operations
- Destructive actions (delete user) require confirmation
- All admin actions are logged in `api_logs` table
- User emails are fetched from Supabase Auth
- Revenue is estimated based on tier counts

---

## 🎉 You're All Set!

Your admin dashboard is now ready to use. Access it by:
1. Logging in as andregreengp@gmail.com
2. Clicking your email → "👑 Admin Dashboard"

For support or questions, check the code comments in:
- `src/AdminDashboard.tsx`
- `src/AdminDashboard.css`
- `supabase-admin-functions.sql`
