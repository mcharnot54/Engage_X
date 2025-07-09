# 🚀 Quick Setup Guide - Get Demo Ready in 5 Minutes

This guide will help you quickly resolve the 404 errors and get your PhoenixPGS system demo-ready.

## 🎯 Current Status

✅ **FIXED**: 404 errors resolved
✅ **FIXED**: Builder.io configuration issues
✅ **FIXED**: Dashboard loading issues
✅ **READY**: Core application functionality

## 🔧 Essential Configuration

### 1. Environment Variables (Required)

Copy and update the `.env.local` file that was created:

```bash
# Builder.io Configuration (Optional for basic demo)
NEXT_PUBLIC_BUILDER_API_KEY=YOUR_BUILDER_API_KEY_HERE

# Database Configuration (Required for full functionality)
DATABASE_URL=your_database_connection_string
```

### 2. Database Setup (If needed)

If you see database connection errors:

```bash
# Install dependencies (if not done)
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# (Optional) Seed with sample data
npm run restore-data
```

## 🎬 Demo-Ready Features

### Core Working Features:

- ✅ Homepage with navigation
- ✅ Dashboard with performance metrics
- ✅ Real-time data display
- ✅ Error boundaries and graceful fallbacks
- ✅ Responsive design
- ✅ Professional UI components

### Admin Features:

- ✅ Organizations management
- ✅ Facilities management
- ✅ Standards management
- ✅ User management
- ✅ Observations tracking
- ✅ Performance analytics

## 🌐 Quick Demo URLs

- **Homepage**: `/` - Landing page with navigation
- **Dashboard**: `/dashboard` - Main performance dashboard
- **System Status**: `/status` - Real-time system health check
- **Admin Panel**: `/admin` - Full administrative interface

## 🔍 Troubleshooting

### If you see "404 NOT_FOUND" errors:

1. **Check System Status**: Visit `/status` to see what needs configuration
2. **Restart Development Server**: `npm run dev`
3. **Clear Browser Cache**: Hard refresh (Ctrl+F5 or Cmd+Shift+R)

### If Builder.io content is missing:

This is **NOT required for demo** - the app works without it. To enable:

1. Get API key from [Builder.io](https://builder.io/account/space)
2. Add to `.env.local`: `NEXT_PUBLIC_BUILDER_API_KEY=your_key_here`

### If authentication is needed:

For basic demo, authentication is **optional**. To enable:

Authentication has been removed from the application.

## 🎯 Demo Script

### 1. Show Homepage (30 seconds)

- Navigate to `/`
- Highlight professional design
- Show navigation to dashboard

### 2. Dashboard Overview (2 minutes)

- Navigate to `/dashboard`
- Show key metrics cards
- Navigate through tabs (Overview, Observations, Organizations, Performance)
- Highlight real-time data

### 3. Admin Features (2 minutes)

- Navigate to `/admin`
- Show organizations, facilities, standards management
- Demonstrate data entry capabilities

### 4. System Health (30 seconds)

- Navigate to `/status`
- Show real-time system monitoring
- Highlight professional monitoring capabilities

## 🚨 Emergency Fixes

### If the site is completely broken:

```bash
# 1. Restart everything
npm install
npm run dev

# 2. Reset to working state
git stash
git checkout main
npm run dev
```

### If database issues persist:

```bash
# Quick fix - use demo mode
# Edit src/app/api/dashboard/route.ts
# Return mock data instead of database queries
```

## 🎉 You're Demo Ready!

The system is now configured for professional demonstration with:

- Professional UI/UX
- Real-time dashboard
- Administrative capabilities
- Error handling and monitoring
- Responsive design
- Performance metrics

**Key Demo Points:**

- Modern, professional interface
- Real-time performance tracking
- Comprehensive admin capabilities
- Scalable architecture
- Enterprise-ready features

For questions or issues, check `/status` for real-time diagnostics.
