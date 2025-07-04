# Stack Auth Integration Guide

## Overview

Your application now uses Stack Auth for secure user authentication while maintaining your existing authorization system with roles and permissions.

## What's Been Implemented

### 1. Authentication Layer

- **Stack Auth Integration**: Handles user sign-in, sign-up, and session management
- **Custom Login Page**: Replaced hardcoded credentials with Stack Auth components
- **Middleware Protection**: Automatic redirect to login for unauthenticated users
- **User Sync**: Automatic synchronization between Stack Auth and your database

### 2. Authorization Layer (Preserved)

- **Existing Role System**: Your Prisma-based roles and permissions remain unchanged
- **Permission Checking**: Granular permission control per user action
- **Protected Routes**: Component-level access control

### 3. Key Files Created/Modified

#### New Files:

- `stack.ts` - Stack Auth configuration
- `middleware.ts` - Authentication middleware
- `lib/auth-utils.ts` - User sync and permission utilities
- `components/ProtectedRoute.tsx` - Route protection component
- `src/app/handler/[...stack]/page.tsx` - Auth handler routes
- `src/app/loading.tsx` - Loading component

#### Modified Files:

- `src/app/layout.tsx` - Added Stack providers
- `src/app/login/page.tsx` - Replaced with Stack Auth SignIn
- `src/app/admin/page.tsx` - Added authentication protection

## Setup Instructions

### 1. Get Stack Auth Credentials

1. Visit [Stack Auth Dashboard](https://app.stack-auth.com/)
2. Create a new project or use existing one
3. Get your credentials:
   - Project ID
   - Publishable Client Key
   - Secret Server Key

### 2. Configure Environment Variables

Create a `.env.local` file with:

```env
# Stack Auth Configuration
NEXT_PUBLIC_STACK_PROJECT_ID="your_project_id_here"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="your_publishable_key_here"
STACK_SECRET_SERVER_KEY="your_secret_key_here"

# Your existing database URL
DATABASE_URL="your_existing_database_url"
```

### 3. Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to `/login` - you should see the new Stack Auth login
3. Sign up for a new account or sign in
4. Check that users are created in your database automatically

## How It Works

### Authentication Flow

1. Users access your app
2. Middleware checks if they're authenticated via Stack Auth
3. If not authenticated → redirect to `/handler/sign-in`
4. If authenticated → allow access + sync user to your database

### Authorization Flow

1. User makes a request to a protected resource
2. System checks their role and permissions in your database
3. Access granted/denied based on your existing permission system

### User Synchronization

- When a user signs in via Stack Auth, they're automatically created/updated in your database
- Stack Auth handles the authentication, your database handles the authorization
- Users maintain their existing roles and permissions

## Managing Users and Permissions

### Adding Roles to New Users

New users from Stack Auth need roles assigned:

```sql
-- Example: Assign a role to a new user
UPDATE users
SET "roleId" = (SELECT id FROM roles WHERE name = 'Observer')
WHERE email = 'user@example.com';
```

### Creating Admin Users

To give admin access:

```sql
-- Create admin role if not exists
INSERT INTO roles (name, description) VALUES ('Admin', 'System Administrator');

-- Assign admin role to user
UPDATE users
SET "roleId" = (SELECT id FROM roles WHERE name = 'Admin')
WHERE email = 'admin@example.com';
```

## Benefits

1. **Security**: Professional-grade authentication with built-in security features
2. **User Experience**: Modern sign-in/sign-up flows with password reset, etc.
3. **Scalability**: Stack Auth handles authentication infrastructure
4. **Compliance**: Built-in security compliance and best practices
5. **Integration**: Seamless integration with your existing authorization system

## Protected Routes

Use the `ProtectedRoute` component to protect pages:

```tsx
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminPage() {
  return (
    <ProtectedRoute requiredPermission={{ module: "admin", action: "read" }}>
      {/* Your admin content */}
    </ProtectedRoute>
  );
}
```

## Next Steps

1. Set up your Stack Auth project and configure environment variables
2. Test the authentication flow
3. Create initial admin users and assign roles
4. Apply `ProtectedRoute` to other admin pages as needed
5. Customize the login page styling to match your brand

## Support

- Stack Auth Documentation: https://docs.stack-auth.com/
- Your existing role/permission system remains fully functional
- All admin pages now require authentication before access
