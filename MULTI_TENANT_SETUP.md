# Multi-Tenant SaaS Architecture

This document outlines the multi-tenant SaaS structure implemented for the application, ensuring proper organization-level data isolation and role-based access control.

## 🏗️ Architecture Overview

### Tenant Isolation Model

- **Organization-based tenancy**: Each tenant is represented by an Organization
- **System Superuser**: Special role that can access multiple organizations
- **Data isolation**: All user data is filtered by organization membership
- **Role-based permissions**: Granular permissions within organizations

## 📊 Database Schema Changes

### New Tables Added

#### `roles`

- Organization-scoped roles (e.g., "Organization Admin", "Manager", "Observer")
- System roles (e.g., "System Superuser") with `isSystemRole = true`
- Each organization gets default roles automatically

#### `permissions`

- System-wide permissions like "manage_standards", "view_observations"
- Resource + action based (e.g., "standards" + "create")

#### `role_permissions`

- Junction table linking roles to permissions

#### `user_roles`

- Junction table linking users to roles within organizations
- Users can have different roles in different organizations

### Updated Tables

#### `users`

- Added `organizationId` - links user to their primary organization
- System Superusers have `organizationId = NULL`

#### `organizations`

- Enhanced with relationships to users, roles, and facilities

## 🔐 Access Control System

### User Types

1. **System Superuser**
   - Can access all organizations
   - Can create/manage organizations
   - Has all permissions across the system
   - Not tied to any specific organization

2. **Organization Admin**
   - Full access within their organization
   - Can manage users, facilities, standards, observations
   - Cannot access other organizations

3. **Manager**
   - Can manage standards and observations
   - Can view all data within organization
   - Cannot manage users or organizational settings

4. **Observer**
   - Read-only access to standards and observations
   - Can create their own observations
   - Cannot modify existing data

### Permission Structure

```typescript
interface Permission {
  name: string; // e.g., "manage_standards"
  resource: string; // e.g., "standards"
  action: string; // e.g., "create", "read", "update", "delete", "all"
  description: string;
}
```

### Key Permissions

- `manage_system` - Full system administration
- `manage_organizations` - Create/manage organizations
- `manage_users` - User management within organization
- `manage_standards` - Standard management within organization
- `manage_observations` - Observation management within organization
- `view_*` - Read-only access to various resources

## 🛠️ Implementation Details

### Tenant Context

Every operation includes a `TenantContext`:

```typescript
interface TenantContext {
  userId: string;
  organizationId: number | null;
  isSystemSuperuser: boolean;
  allowedOrganizations: number[];
}
```

### Data Filtering

All database operations are automatically filtered:

1. **Direct Organization Relations** (Users, Facilities):

   ```sql
   WHERE organizationId = userOrganizationId
   ```

2. **Indirect Relations** (Standards, Observations):

   ```sql
   WHERE facility.organizationId = userOrganizationId
   ```

3. **System Superuser Exception**:
   - No filtering applied
   - Can access all data across organizations

### API Route Protection

All API routes use tenant-aware functions:

```typescript
// Old approach (not tenant-aware)
const standards = await getStandards();

// New approach (tenant-aware)
const tenantContext = await getCurrentUserTenantContext();
const standards = await getStandards(tenantContext);
```

## 🚀 Usage Guide

### For Developers

#### 1. Use Tenant-Aware Database Operations

```typescript
import { getStandards, createStandard } from "@/lib/db-operations-tenant";
import { getCurrentUserTenantContext } from "@/lib/auth-utils";

// In API routes
const tenantContext = await getCurrentUserTenantContext();
const standards = await getStandards(tenantContext);
```

#### 2. Check Permissions

```typescript
import { hasPermission } from "@/lib/auth-utils";

if (await hasPermission("manage_standards", organizationId)) {
  // Allow operation
}
```

#### 3. Handle Organization Access

```typescript
import { validateOrganizationAccess } from "@/lib/auth-utils";

if (await validateOrganizationAccess(organizationId)) {
  // User can access this organization
}
```

### For System Administrators

#### Create Organizations

```typescript
// Only System Superuser can create organizations
const org = await createOrganization(
  {
    name: "New Company",
    code: "NEWCO",
  },
  tenantContext,
);

// This automatically creates default roles for the organization
```

#### Assign Roles to Users

```typescript
import { assignRoleToUser } from "@/lib/tenant-utils";

await assignRoleToUser(userId, roleId, organizationId);
```

## 🔧 Configuration

### Environment Variables

Ensure your database connection is properly configured:

```bash
DATABASE_URL="postgresql://username:password@host:port/database"
```

### Setup Commands

1. Apply database schema:

   ```bash
   npx prisma db push
   ```

2. Setup multi-tenant structure:
   ```bash
   npm run setup-multi-tenant
   ```

## 📋 Default Roles Created

For each organization, these roles are automatically created:

### Organization Admin

**Permissions:**

- manage_users, manage_standards, manage_observations
- manage*facilities, view*\* (all view permissions)

### Manager

**Permissions:**

- manage_standards, manage_observations
- view_standards, view_observations, view_facilities
- create_observations

### Observer

**Permissions:**

- view_standards, view_observations, view_facilities
- create_observations

## 🛡️ Security Features

### Data Isolation

- **Automatic filtering**: All queries automatically filter by organization
- **No data leakage**: Users cannot access other organizations' data
- **System boundaries**: Clear separation between organizations

### Access Control

- **Role-based permissions**: Granular control over actions
- **Organization scoping**: Permissions only apply within user's organization
- **System override**: System Superuser can bypass organization restrictions

### Error Handling

- **Access denied errors**: Clear error messages for unauthorized access
- **Tenant validation**: All operations validate organization access
- **Audit trail**: Track user actions within organizations

## 🔄 Migration Path

### From Single-Tenant to Multi-Tenant

1. All existing users are assigned to their organization
2. Default Observer role is assigned to existing users
3. System Superuser account is created for administration
4. API routes are updated to use tenant-aware operations

### Backwards Compatibility

- Existing data structure is preserved
- Users maintain access to their data
- Gradual migration of API routes to tenant-aware versions

## 📈 Benefits

### For SaaS Business

- **True multi-tenancy**: Complete data isolation between customers
- **Scalable architecture**: Easy to add new organizations
- **Role-based billing**: Different permission levels for different tiers
- **System administration**: Central management of all tenants

### For Users

- **Data security**: Cannot access other organizations' data
- **Role clarity**: Clear understanding of permissions
- **Organization focus**: Only see relevant data for their organization
- **Professional structure**: Proper enterprise-grade access control

## 🔍 Testing the Setup

### Verify Multi-Tenant Structure

1. **Check organizations**: Each should have default roles
2. **Test user access**: Users should only see their organization's data
3. **Verify System Superuser**: Should access all organizations
4. **Test API routes**: Should enforce tenant isolation

### Sample Test Cases

```typescript
// Test 1: User can only see their organization's standards
const userTenantContext = await getTenantContext(regularUserId);
const standards = await getStandards(userTenantContext);
// Should only return standards from user's organization

// Test 2: System Superuser sees all standards
const systemTenantContext = await getTenantContext(systemUserId);
const allStandards = await getStandards(systemTenantContext);
// Should return standards from all organizations

// Test 3: Cross-organization access denied
await expect(
  createStandard({ facilityId: otherOrgFacilityId }, userTenantContext),
).rejects.toThrow("Access denied");
```

## 🚧 Next Steps

1. **Authentication Integration**: Integrate with your chosen auth provider
2. **Frontend Updates**: Update UI to show organization context
3. **API Migration**: Convert remaining API routes to tenant-aware
4. **Testing**: Comprehensive testing of multi-tenant features
5. **Documentation**: Update user guides for new role structure

This multi-tenant architecture provides a solid foundation for a SaaS application with proper data isolation, security, and scalability.
