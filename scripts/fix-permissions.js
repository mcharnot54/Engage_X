const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixPermissions() {
  console.log("🔧 Fixing permissions...");

  try {
    // Check if permissions exist
    const existingPermissions = await prisma.permission.findMany();
    console.log(`Found ${existingPermissions.length} existing permissions`);

    if (existingPermissions.length === 0) {
      console.log("Creating permissions...");

      const permissions = [
        {
          name: "manage_system",
          resource: "system",
          action: "all",
          description: "Full system administration access",
        },
        {
          name: "manage_organizations",
          resource: "organizations",
          action: "all",
          description: "Manage all organizations",
        },
        {
          name: "view_all_data",
          resource: "data",
          action: "read",
          description: "View data across all organizations",
        },
        {
          name: "manage_users",
          resource: "users",
          action: "all",
          description: "Manage users within organization",
        },
        {
          name: "manage_standards",
          resource: "standards",
          action: "all",
          description: "Manage standards within organization",
        },
        {
          name: "manage_observations",
          resource: "observations",
          action: "all",
          description: "Manage observations within organization",
        },
        {
          name: "view_standards",
          resource: "standards",
          action: "read",
          description: "View standards within organization",
        },
        {
          name: "create_observations",
          resource: "observations",
          action: "create",
          description: "Create new observations",
        },
        {
          name: "view_observations",
          resource: "observations",
          action: "read",
          description: "View observations within organization",
        },
        {
          name: "manage_facilities",
          resource: "facilities",
          action: "all",
          description: "Manage facilities within organization",
        },
        {
          name: "view_facilities",
          resource: "facilities",
          action: "read",
          description: "View facilities within organization",
        },
      ];

      for (const permission of permissions) {
        await prisma.permission.create({
          data: permission,
        });
        console.log(`  ✅ Created permission: ${permission.name}`);
      }

      console.log("🎉 Permissions created successfully!");
    }

    // Check for System Superuser role
    let systemSuperuser = await prisma.role.findFirst({
      where: {
        name: "System Superuser",
        isSystemRole: true,
      },
    });

    if (!systemSuperuser) {
      console.log("Creating System Superuser role...");
      systemSuperuser = await prisma.role.create({
        data: {
          name: "System Superuser",
          description: "Full system access across all organizations",
          organizationId: null,
          isSystemRole: true,
        },
      });
      console.log("  ✅ Created System Superuser role");
    }

    // Assign all permissions to System Superuser
    const allPermissions = await prisma.permission.findMany();
    const existingRolePermissions = await prisma.rolePermission.findMany({
      where: { roleId: systemSuperuser.id },
    });

    console.log(
      `System Superuser has ${existingRolePermissions.length} permissions, should have ${allPermissions.length}`,
    );

    if (existingRolePermissions.length < allPermissions.length) {
      console.log("Assigning permissions to System Superuser...");

      for (const permission of allPermissions) {
        const exists = existingRolePermissions.some(
          (rp) => rp.permissionId === permission.id,
        );
        if (!exists) {
          await prisma.rolePermission.create({
            data: {
              roleId: systemSuperuser.id,
              permissionId: permission.id,
            },
          });
          console.log(`  ✅ Assigned permission: ${permission.name}`);
        }
      }
    }

    console.log("🎉 Permissions setup completed!");
  } catch (error) {
    console.error("❌ Error fixing permissions:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPermissions().catch(console.error);
