import { prisma } from "./prisma";

// Organization operations
export async function createOrganization(data: {
  name: string;
  code: string;
  logo?: string;
}) {
  return prisma.organization.create({
    data,
  });
}

export async function getOrganizations() {
  return prisma.organization.findMany({
    orderBy: { name: "asc" },
    include: {
      facilities: true,
    },
  });
}

export async function updateOrganization(
  id: number,
  data: {
    name?: string;
    code?: string;
    logo?: string;
  },
) {
  return prisma.organization.update({
    where: { id },
    data,
  });
}

// Facility operations
export async function createFacility(data: {
  name: string;
  organizationId: number;
  ref?: string;
  city?: string;
}) {
  return prisma.facility.create({
    data,
    include: {
      organization: true,
    },
  });
}

export async function getFacilities() {
  return prisma.facility.findMany({
    orderBy: { name: "asc" },
    include: {
      organization: true,
    },
  });
}

export async function getFacilitiesByOrganization(organizationId: number) {
  return prisma.facility.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
    include: {
      organization: true,
    },
  });
}

export async function updateFacility(
  id: number,
  data: {
    name?: string;
    organizationId?: number;
    ref?: string;
    city?: string;
  },
) {
  return prisma.facility.update({
    where: { id },
    data,
    include: {
      organization: true,
    },
  });
}

// Department operations
export async function createDepartment(data: {
  name: string;
  facilityId: number;
}) {
  return prisma.department.create({
    data,
    include: {
      facility: true,
    },
  });
}

export async function getDepartmentsByFacility(facilityId: number) {
  return prisma.department.findMany({
    where: { facilityId },
    include: {
      facility: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function updateDepartment(
  id: number,
  data: {
    name?: string;
    facilityId?: number;
  },
) {
  return prisma.department.update({
    where: { id },
    data,
    include: {
      facility: true,
    },
  });
}

// Area operations
export async function createArea(data: { name: string; departmentId: number }) {
  return prisma.area.create({
    data,
    include: {
      department: {
        include: {
          facility: true,
        },
      },
    },
  });
}

export async function getAreasByDepartment(departmentId: number) {
  return prisma.area.findMany({
    where: { departmentId },
    include: {
      department: {
        include: {
          facility: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function updateArea(
  id: number,
  data: {
    name?: string;
    departmentId?: number;
  },
) {
  return prisma.area.update({
    where: { id },
    data,
    include: {
      department: {
        include: {
          facility: true,
        },
      },
    },
  });
}

// Standard operations
export async function createStandard(data: {
  name: string;
  facilityId: number;
  departmentId: number;
  areaId: number;
  bestPractices: string[];
  processOpportunities: string[];
  notes: string;
  uomEntries: {
    uom: string;
    description: string;
    samValue: number;
    tags?: string[];
  }[];
}) {
  const { uomEntries, ...standardData } = data;

  return prisma.standard.create({
    data: {
      ...standardData,
      uomEntries: {
        create: uomEntries,
      },
    },
    include: {
      facility: {
        include: {
          organization: true,
        },
      },
      department: true,
      area: true,
      uomEntries: true,
    },
  });
}

export async function getStandards() {
  return prisma.standard.findMany({
    where: { isActive: true, isCurrentVersion: true },
    include: {
      facility: {
        include: {
          organization: true,
        },
      },
      department: true,
      area: true,
      uomEntries: true,
      versions: {
        orderBy: { version: "desc" },
        include: {
          uomEntries: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getStandardById(id: number) {
  return prisma.standard.findUnique({
    where: { id },
    include: {
      facility: {
        include: {
          organization: true,
        },
      },
      department: true,
      area: true,
      uomEntries: true,
    },
  });
}

export async function getStandardsByArea(areaId: number) {
  return prisma.standard.findMany({
    where: { areaId, isActive: true },
    include: {
      facility: {
        include: {
          organization: true,
        },
      },
      department: true,
      area: true,
      uomEntries: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function updateStandard(
  id: number,
  data: {
    name?: string;
    facilityId?: number;
    departmentId?: number;
    areaId?: number;
    bestPractices?: string[];
    processOpportunities?: string[];
    isActive?: boolean;
  },
) {
  return prisma.standard.update({
    where: { id },
    data,
    include: {
      facility: {
        include: {
          organization: true,
        },
      },
      department: true,
      area: true,
      uomEntries: true,
    },
  });
}

export async function createStandardVersion(
  originalStandardId: number,
  data: {
    name?: string;
    facilityId?: number;
    departmentId?: number;
    areaId?: number;
    bestPractices?: string[];
    processOpportunities?: string[];
    versionNotes?: string;
    createdBy?: string;
    uomEntries?: {
      uom: string;
      description: string;
      samValue: number;
      tags?: string[];
    }[];
  },
) {
  return prisma.$transaction(async (tx) => {
    // Get the original standard with all its data
    const originalStandard = await tx.standard.findUnique({
      where: { id: originalStandardId },
      include: {
        uomEntries: true,
      },
    });

    if (!originalStandard) {
      throw new Error("Original standard not found");
    }

    // Get the current highest version number for this standard group
    const baseId = originalStandard.baseStandardId || originalStandardId;
    const latestVersion = await tx.standard.findFirst({
      where: {
        OR: [{ id: baseId }, { baseStandardId: baseId }],
      },
      orderBy: { version: "desc" },
    });

    const newVersion = (latestVersion?.version || 1) + 1;

    // Mark current version as not current
    await tx.standard.updateMany({
      where: {
        OR: [{ id: baseId }, { baseStandardId: baseId }],
        isCurrentVersion: true,
      },
      data: { isCurrentVersion: false },
    });

    // Create new version with updated data
    const newStandard = await tx.standard.create({
      data: {
        name: data.name || originalStandard.name,
        facilityId: data.facilityId || originalStandard.facilityId,
        departmentId: data.departmentId || originalStandard.departmentId,
        areaId: data.areaId || originalStandard.areaId,
        bestPractices: data.bestPractices || originalStandard.bestPractices,
        processOpportunities:
          data.processOpportunities || originalStandard.processOpportunities,
        version: newVersion,
        baseStandardId: baseId,
        isCurrentVersion: true,
        isActive: true,
        versionNotes: data.versionNotes,
        createdBy: data.createdBy,
        uomEntries: {
          create:
            data.uomEntries ||
            originalStandard.uomEntries.map((entry) => ({
              uom: entry.uom,
              description: entry.description,
              samValue: entry.samValue,
              tags: entry.tags,
            })),
        },
      },
      include: {
        facility: {
          include: {
            organization: true,
          },
        },
        department: true,
        area: true,
        uomEntries: true,
        baseStandard: true,
        versions: {
          orderBy: { version: "desc" },
          include: {
            uomEntries: true,
          },
        },
      },
    });

    return newStandard;
  });
}

export async function getStandardVersionHistory(standardId: number) {
  const standard = await prisma.standard.findUnique({
    where: { id: standardId },
  });

  if (!standard) {
    throw new Error("Standard not found");
  }

  const baseId = standard.baseStandardId || standardId;

  return prisma.standard.findMany({
    where: {
      OR: [{ id: baseId }, { baseStandardId: baseId }],
    },
    include: {
      facility: {
        include: {
          organization: true,
        },
      },
      department: true,
      area: true,
      uomEntries: true,
    },
    orderBy: { version: "desc" },
  });
}

// User operations
export async function createUser(data: {
  employeeId: string;
  employeeNumber?: string;
  name: string;
  email?: string;
  department?: string;
  role?: string;
  roleId?: string;
  isActive?: boolean;
  externalSource?: string;
  lastSyncAt?: Date;
}) {
  return prisma.user.create({
    data,
    include: {
      user_roles: {
        include: {
          roles: true,
        },
      },
    },
  });
}

export async function updateUser(
  id: string,
  data: {
    employeeId?: string;
    employeeNumber?: string;
    name?: string;
    email?: string;
    department?: string;
    role?: string;
    roleId?: string;
    isActive?: boolean;
    externalSource?: string;
    lastSyncAt?: Date;
  },
) {
  return prisma.user.update({
    where: { id },
    data,
    include: {
      user_roles: {
        include: {
          roles: true,
        },
      },
    },
  });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({
    where: { id },
  });
}

export async function getUserByEmployeeId(employeeId: string) {
  return prisma.user.findUnique({
    where: { employeeId },
    include: {
      user_roles: {
        include: {
          roles: true,
        },
      },
    },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      user_roles: {
        include: {
          roles: true,
        },
      },
    },
  });
}

export async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    include: {
      user_roles: {
        include: {
          roles: true,
        },
      },
      roles: true, // Direct role relationship
    },
  });

  // Manually fetch organization data for each user
  const usersWithOrganizations = await Promise.all(
    users.map(async (user) => {
      if (user.organizationid) {
        const organization = await prisma.organization.findUnique({
          where: { id: user.organizationid },
          select: { id: true, name: true, code: true },
        });
        return { ...user, organization };
      }
      return { ...user, organization: null };
    }),
  );

  return usersWithOrganizations;
}

export async function syncUserFromExternal(data: {
  employeeId: string;
  employeeNumber?: string;
  name: string;
  email?: string;
  department?: string;
  externalSource: string;
}) {
  const existingUser = await getUserByEmployeeId(data.employeeId);

  const userData = {
    ...data,
    lastSyncAt: new Date(),
    isActive: true,
  };

  if (existingUser) {
    return updateUser(existingUser.id, userData);
  } else {
    return createUser(userData);
  }
}

// Role operations
export async function getRoles() {
  return prisma.role.findMany({
    orderBy: { name: "asc" },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
      _count: {
        select: {
          user_roles: true,
        },
      },
    },
  });
}

export async function getRoleById(id: string | number) {
  return prisma.role.findUnique({
    where: { id: id.toString() },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
      _count: {
        select: {
          user_roles: true,
        },
      },
    },
  });
}

export async function createRole(data: {
  name: string;
  description?: string;
  permissionIds?: string[];
}) {
  const { permissionIds, ...roleData } = data;

  return prisma.role.create({
    data: {
      ...roleData,
      rolePermissions: permissionIds
        ? {
            create: permissionIds.map((permissionId) => ({
              permissionId: permissionId,
            })),
          }
        : undefined,
    },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
      _count: {
        select: {
          user_roles: true,
        },
      },
    },
  });
}

export async function updateRole(
  id: string | number,
  data: {
    name?: string;
    description?: string;
    isActive?: boolean;
    permissionIds?: string[];
  },
) {
  const { permissionIds, ...roleData } = data;
  const roleId = id.toString();

  return prisma.$transaction(async (tx) => {
    // Update the role
    const updatedRole = await tx.role.update({
      where: { id: roleId },
      data: roleData,
    });

    // If permissionIds are provided, update role permissions
    if (permissionIds !== undefined) {
      // Delete existing permissions
      await tx.rolePermission.deleteMany({
        where: { roleId },
      });

      // Create new permissions
      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId,
            permissionId,
          })),
        });
      }
    }

    // Return the updated role with permissions
    return tx.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            user_roles: true,
          },
        },
      },
    });
  });
}

export async function deleteRole(id: string | number) {
  const roleId = id.toString();
  return prisma.role.delete({
    where: { id: roleId },
  });
}

// Permission operations
export async function getPermissions() {
  return prisma.permission.findMany({
    orderBy: [{ module: "asc" }, { action: "asc" }],
  });
}

// Observation operations
export async function createObservation(data: {
  userId: string;
  standardId: number;
  timeObserved: number;
  totalSams: number;
  observedPerformance: number;
  pumpScore: number;
  pace: number;
  utilization: number;
  methods: number;
  comments?: string;
  aiNotes?: string;
  supervisorSignature?: string;
  teamMemberSignature?: string;
  bestPracticesChecked: string[];
  processAdherenceChecked: string[];
  delays: any[];
  observationReason: string;
  observationStartTime?: Date;
  observationEndTime?: Date;
  isFinalized: boolean;
  observationData: {
    uom: string;
    description: string;
    quantity: number;
    samValue: number;
    totalSams: number;
  }[];
}) {
  const { observationData, ...observationFields } = data;

  return prisma.observation.create({
    data: {
      ...observationFields,
      observationData: {
        create: observationData,
      },
    },
    include: {
      user: true,
      standard: {
        include: {
          facility: true,
          department: true,
          area: true,
          uomEntries: true,
        },
      },
      observationData: true,
    },
  });
}

export async function getObservationsByUser(userId: string) {
  return prisma.observation.findMany({
    where: { userId },
    include: {
      user: true,
      standard: {
        include: {
          facility: {
            include: {
              organization: true,
            },
          },
          department: true,
          area: true,
        },
      },
      observationData: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getObservationsByStandard(standardId: number) {
  return prisma.observation.findMany({
    where: { standardId },
    include: {
      user: true,
      standard: {
        include: {
          facility: {
            include: {
              organization: true,
            },
          },
          department: true,
          area: true,
        },
      },
      observationData: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRecentObservations(limit: number = 10) {
  return prisma.observation.findMany({
    take: limit,
    include: {
      user: true,
      standard: {
        include: {
          facility: {
            include: {
              organization: true,
            },
          },
          department: true,
          area: true,
        },
      },
      observationData: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

// User Role operations
export async function getUserRoles(filters?: {
  userId?: string;
  roleId?: number;
  organizationId?: number;
}) {
  return prisma.userRole.findMany({
    where: {
      userId: filters?.userId,
      roleId: filters?.roleId,
      organizationId: filters?.organizationId,
    },
    include: {
      user: true,
      role: true,
      organization: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createUserRole(data: {
  userId: string;
  roleId: number;
  organizationId?: number;
}) {
  return prisma.userRole.create({
    data,
    include: {
      user: true,
      role: true,
      organization: true,
    },
  });
}

export async function deleteUserRole(id: number) {
  return prisma.userRole.delete({
    where: { id },
  });
}

// Delay Reason operations
export async function getDelayReasons() {
  return prisma.delayReason.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createDelayReason(data: {
  name: string;
  description?: string;
}) {
  return prisma.delayReason.create({
    data,
  });
}

export async function updateDelayReason(
  id: number,
  data: {
    name?: string;
    description?: string;
    isActive?: boolean;
  },
) {
  return prisma.delayReason.update({
    where: { id },
    data,
  });
}

export async function deleteDelayReason(id: number) {
  return prisma.delayReason.update({
    where: { id },
    data: { isActive: false },
  });
}

// Observation Reason operations
export async function getObservationReasons() {
  return prisma.observationReason.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createObservationReason(data: {
  name: string;
  description?: string;
  externalApiUrl?: string;
}) {
  return prisma.observationReason.create({
    data,
  });
}

export async function updateObservationReason(
  id: string,
  data: {
    name?: string;
    description?: string;
    externalApiUrl?: string;
    isActive?: boolean;
  },
) {
  return prisma.observationReason.update({
    where: { id },
    data,
  });
}

export async function deleteObservationReason(id: string) {
  return prisma.observationReason.update({
    where: { id },
    data: { isActive: false },
  });
}
