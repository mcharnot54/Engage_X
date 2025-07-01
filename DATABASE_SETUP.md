# Database Setup Instructions

## Problem

The application is currently showing "Failed to fetch organizations" and "Failed to fetch standards" errors because the `DATABASE_URL` environment variable is not configured.

## Quick Fix Options

### Option 1: Use a Free Cloud Database (Recommended)

1. **Supabase** (Easiest):

   - Go to [supabase.com](https://supabase.com)
   - Create a free account and new project
   - Go to Settings > Database
   - Copy the connection string
   - Update `.env.local` with your DATABASE_URL

2. **Neon** (Good alternative):
   - Go to [neon.tech](https://neon.tech)
   - Create a free account and database
   - Copy the connection string
   - Update `.env.local` with your DATABASE_URL

### Option 2: Local PostgreSQL

If you have PostgreSQL installed locally:

1. Create a database: `createdb builder_app`
2. Update `.env.local` with your local connection string
3. Example: `DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/builder_app"`

## Setup Steps

1. Update `.env.local` with your actual DATABASE_URL
2. Run database migrations:
   ```bash
   npx prisma db push
   ```
3. (Optional) Seed the database:
   ```bash
   npx prisma db seed
   ```
4. Restart the development server

## Current Error Details

The errors you're seeing:

- `Error [PrismaClientInitializationError]: Environment variable not found: DATABASE_URL`
- API endpoints `/api/organizations` and `/api/standards` returning 500 errors

These will be resolved once you configure a valid DATABASE_URL.
