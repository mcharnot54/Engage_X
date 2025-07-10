-- Migration to implement multi-tenant SaaS structure
-- This migration adds proper organization-level tenant isolation

-- Step 1: Add organizationId to Users table
ALTER TABLE "users" ADD COLUMN "organizationId" INTEGER;

-- Step 2: Create roles table with organization scope
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" INTEGER,
    "isSystemRole" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- Step 3: Create permissions table
CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- Step 4: Create role_permissions junction table
CREATE TABLE "role_permissions" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- Step 5: Create user_roles junction table (users can have multiple roles across organizations)
CREATE TABLE "user_roles" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "organizationId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- Step 6: Add foreign key constraints
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "roles" ADD CONSTRAINT "roles_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 7: Create unique constraints
CREATE UNIQUE INDEX "roles_name_organizationId_key" ON "roles"("name", "organizationId");
CREATE UNIQUE INDEX "permissions_name_resource_action_key" ON "permissions"("name", "resource", "action");
CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON "role_permissions"("roleId", "permissionId");
CREATE UNIQUE INDEX "user_roles_userId_roleId_organizationId_key" ON "user_roles"("userId", "roleId", "organizationId");

-- Step 8: Insert system-level permissions
INSERT INTO "permissions" ("name", "resource", "action", "description") VALUES
('manage_system', 'system', 'all', 'Full system administration access'),
('manage_organizations', 'organizations', 'all', 'Manage all organizations'),
('view_all_data', 'data', 'read', 'View data across all organizations'),
('manage_users', 'users', 'all', 'Manage users within organization'),
('manage_standards', 'standards', 'all', 'Manage standards within organization'),
('manage_observations', 'observations', 'all', 'Manage observations within organization'),
('view_standards', 'standards', 'read', 'View standards within organization'),
('create_observations', 'observations', 'create', 'Create new observations'),
('view_observations', 'observations', 'read', 'View observations within organization'),
('manage_facilities', 'facilities', 'all', 'Manage facilities within organization'),
('view_facilities', 'facilities', 'read', 'View facilities within organization');

-- Step 9: Create System Superuser role (not tied to any organization)
INSERT INTO "roles" ("name", "description", "organizationId", "isSystemRole") VALUES
('System Superuser', 'Full system access across all organizations', NULL, true);

-- Step 10: Assign all permissions to System Superuser role
INSERT INTO "role_permissions" ("roleId", "permissionId")
SELECT r.id, p.id
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.name = 'System Superuser' AND r."isSystemRole" = true;

-- Step 11: Create default organization-level roles template
-- These will be created for each organization when organizations are set up
-- For now, we just document the structure

-- Organization Admin role template (will be created per organization)
-- 'Organization Admin' - Full access within organization
-- Permissions: manage_users, manage_standards, manage_observations, manage_facilities, view_* permissions

-- Manager role template (will be created per organization)  
-- 'Manager' - Management access within organization
-- Permissions: manage_standards, manage_observations, view_* permissions

-- Observer role template (will be created per organization)
-- 'Observer' - Read-only access within organization
-- Permissions: view_standards, view_observations, view_facilities

-- Step 12: Update existing data to maintain referential integrity
-- Set all existing users to first organization if they don't have one
UPDATE "users" 
SET "organizationId" = (SELECT MIN(id) FROM "organizations") 
WHERE "organizationId" IS NULL AND EXISTS (SELECT 1 FROM "organizations");
