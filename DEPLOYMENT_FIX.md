# Fixing 500 Error on Vercel Deployment

## Issue

Your app is getting a 500 error because required environment variables are missing on Vercel.

## Solution

You need to configure the following environment variables in your Vercel project:

### Required Environment Variables

1. **Database Configuration**

   ```
   DATABASE_URL=postgresql://username:password@hostname:port/database?sslmode=require
   ```

2. **Stack Auth Configuration** (Required for authentication)

   ```
   NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
   NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_stack_publishable_key
   STACK_SECRET_SERVER_KEY=your_stack_secret_key
   ```

3. **Builder.io Configuration** (Optional)
   ```
   NEXT_PUBLIC_BUILDER_API_KEY=your_builder_api_key
   ```

### How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project (`engage-x-bi19-3vlrfqalp`)
3. Go to Settings → Environment Variables
4. Add each environment variable listed above

### Quick Fix (Minimal Setup)

If you want to deploy quickly without full authentication setup, you can:

1. Set only the `DATABASE_URL` if you have a database
2. Leave Stack Auth variables empty - the app will now gracefully handle missing auth config
3. Leave Builder.io API key empty - the app will work without it

### What Changed

I've updated your code to be more resilient:

- **Stack Auth**: Now gracefully handles missing environment variables
- **Layout**: Conditionally uses Stack providers only when configured
- **Middleware**: Allows access when Stack Auth is not configured
- **Login/Handler pages**: Show helpful messages when auth is not configured

### After Setting Environment Variables

1. Redeploy your Vercel app (it should trigger automatically)
2. The app should now load without 500 errors
3. Authentication features will work if you've configured Stack Auth properly

### Testing Locally

1. Copy `.env.example` to `.env.local`
2. Fill in your actual environment variable values
3. Run `npm run dev` to test locally

## Need Help?

If you need help with:

- Setting up a Neon database → I can help you create one
- Configuring Stack Auth → I can guide you through the setup
- Setting up Builder.io → I can help configure the CMS

Just let me know what you need!
