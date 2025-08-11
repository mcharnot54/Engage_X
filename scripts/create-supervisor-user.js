const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSupervisorUser() {
  try {
    // Check if supervisor user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: 'supervisor-001' }
    });

    if (existingUser) {
      console.log('Supervisor user already exists:', existingUser.name);
      return existingUser;
    }

    // Create supervisor user
    const supervisorUser = await prisma.user.create({
      data: {
        id: 'supervisor-001',
        employeeId: 'emp009',
        name: 'Sarah Williams',
        email: 'sarah.williams@company.com',
        department: 'Operations',
        userType: 'Supervisor',
        role: 'Supervisor',
        observationGoalPerDay: 2,
        observationGoalPerWeek: 10,
        observationGoalPerMonth: 20,
        observationGoalPerQuarter: 60,
        observationGoalPerYear: 240,
        isActive: true,
      },
    });

    console.log('✅ Supervisor user created:', supervisorUser.name);
    
    // Also create or update the Supervisor role if it doesn't exist
    try {
      const supervisorRole = await prisma.role.upsert({
        where: { name: 'Supervisor' },
        update: {},
        create: {
          name: 'Supervisor',
          description: 'Supervisor role with observation and team management permissions',
          isActive: true,
        },
      });

      // Assign the supervisor role to the user if needed
      const existingUserRole = await prisma.userRole.findFirst({
        where: {
          userid: supervisorUser.id,
          roleid: supervisorRole.id,
        },
      });

      if (!existingUserRole) {
        await prisma.userRole.create({
          data: {
            userid: supervisorUser.id,
            roleid: supervisorRole.id,
          },
        });
        console.log('✅ Supervisor role assigned to user');
      }

    } catch (roleError) {
      console.log('Note: Role assignment failed, but user created successfully');
    }

    return supervisorUser;
  } catch (error) {
    console.error('❌ Error creating supervisor user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  createSupervisorUser()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createSupervisorUser };
