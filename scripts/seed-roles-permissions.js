const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedRolesAndPermissions() {
  try {
    console.log("🔄 Seeding roles and permissions...");

    // Define default permissions
    const permissions = [
      // User Management
      { name: "View Users", module: "users", action: "read" },
      { name: "Create Users", module: "users", action: "create" },
      { name: "Edit Users", module: "users", action: "update" },
      { name: "Delete Users", module: "users", action: "delete" },

      // Roles & Permissions
      { name: "View Roles", module: "roles", action: "read" },
      { name: "Create Roles", module: "roles", action: "create" },
      { name: "Edit Roles", module: "roles", action: "update" },
      { name: "Delete Roles", module: "roles", action: "delete" },

      // Observations
      { name: "View Observations", module: "observations", action: "read" },
      { name: "Create Observations", module: "observations", action: "create" },
      { name: "Edit Observations", module: "observations", action: "update" },
      { name: "Delete Observations", module: "observations", action: "delete" },

      // Organizations
      { name: "View Organizations", module: "organizations", action: "read" },
      {
        name: "Create Organizations",
        module: "organizations",
        action: "create",
      },
      { name: "Edit Organizations", module: "organizations", action: "update" },
      {
        name: "Delete Organizations",
        module: "organizations",
        action: "delete",
      },

      // Facilities
      { name: "View Facilities", module: "facilities", action: "read" },
      { name: "Create Facilities", module: "facilities", action: "create" },
      { name: "Edit Facilities", module: "facilities", action: "update" },
      { name: "Delete Facilities", module: "facilities", action: "delete" },

      // Departments
      { name: "View Departments", module: "departments", action: "read" },
      { name: "Create Departments", module: "departments", action: "create" },
      { name: "Edit Departments", module: "departments", action: "update" },
      { name: "Delete Departments", module: "departments", action: "delete" },

      // Areas
      { name: "View Areas", module: "areas", action: "read" },
      { name: "Create Areas", module: "areas", action: "create" },
      { name: "Edit Areas", module: "areas", action: "update" },
      { name: "Delete Areas", module: "areas", action: "delete" },

      // Standards
      { name: "View Standards", module: "standards", action: "read" },
      { name: "Create Standards", module: "standards", action: "create" },
      { name: "Edit Standards", module: "standards", action: "update" },
      { name: "Delete Standards", module: "standards", action: "delete" },

      // Admin
      { name: "Admin Access", module: "admin", action: "access" },
      { name: "System Settings", module: "admin", action: "settings" },
    ];

    // Create permissions
    const createdPermissions = [];
    for (const permission of permissions) {
      const result = await prisma.permission.upsert({
        where: { name: permission.name },
        update: {
          module: permission.module,
          action: permission.action,
          isActive: true,
        },
        create: {
          name: permission.name,
          module: permission.module,
          action: permission.action,
          isActive: true,
        },
      });
      createdPermissions.push(result);
      console.log(`✅ Created/Updated permission: ${result.name}`);
    }

    // Define default roles
    const roles = [
      {
        name: "Super Administrator",
        description: "Full system access with all permissions",
        permissions: createdPermissions.map((p) => p.id), // All permissions
      },
      {
        name: "Site Administrator",
        description: "Site-level administration with most permissions",
        permissions: createdPermissions
          .filter(
            (p) =>
              !["Delete Users", "Delete Roles", "System Settings"].includes(
                p.name,
              ),
          )
          .map((p) => p.id),
      },
      {
        name: "Observer",
        description: "Can create and manage observations",
        permissions: createdPermissions
          .filter((p) => p.module === "observations" || p.name === "View Users")
          .map((p) => p.id),
      },
      {
        name: "Viewer",
        description: "Read-only access to most system data",
        permissions: createdPermissions
          .filter((p) => p.action === "read")
          .map((p) => p.id),
      },
    ];

    // Create roles
    for (const role of roles) {
      const result = await prisma.role.upsert({
        where: { name: role.name },
        update: {
          description: role.description,
          isActive: true,
          permissions: {
            deleteMany: {},
            create: role.permissions.map((permissionId) => ({
              permissionId,
              granted: true,
            })),
          },
        },
        create: {
          name: role.name,
          description: role.description,
          isActive: true,
          permissions: {
            create: role.permissions.map((permissionId) => ({
              permissionId,
              granted: true,
            })),
          },
        },
        include: {
          permissions: true,
        },
      });

      console.log(
        `✅ Created/Updated role: ${result.name} with ${result.permissions.length} permissions`,
      );
    }

    console.log("🎉 Successfully seeded roles and permissions!");
  } catch (error) {
    console.error("❌ Error seeding roles and permissions:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedRolesAndPermissions();
