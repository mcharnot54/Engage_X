import { prisma } from "./prisma";
import {
  addTenantFilter,
  addFacilityTenantFilter,
  TenantContext,
} from "./tenant-utils";

// =========================
// TENANT-AWARE OPERATIONS
// =========================

// Organization operations (System Superuser only)
export async function createOrganization(
  data: {
    name: string;
    code: string;
    logo?: string;
  },
  tenantContext: TenantContext,
) {
  // Only System Superuser can create organizations
  if (!tenantContext.isSystemSuperuser) {
    throw new Error("Access denied: System superuser required");
  }

  return prisma.organization.create({
    data,
  });
}

export async function getOrganizations(tenantContext: TenantContext) {
  // System Superuser can see all organizations
  if (tenantContext.isSystemSuperuser) {
    return prisma.organization.findMany({
      orderBy: { name: "asc" },
      include: {
        facilities: true,
        _count: {
          select: {
            users: true,
            facilities: true,
          },
        },
      },
    });
  }

  // Regular users can only see their organization
  if (!tenantContext.organizationId) {
    return [];
  }

  return prisma.organization.findMany({
    where: { id: tenantContext.organizationId },
    orderBy: { name: "asc" },
    include: {
      facilities: true,
      _count: {
        select: {
          users: true,
          facilities: true,
        },
      },
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
  tenantContext: TenantContext,
) {
  // System Superuser can update any organization
  if (tenantContext.isSystemSuperuser) {
    return prisma.organization.update({
      where: { id },
      data,
    });
  }

  // Regular users can only update their own organization
  if (tenantContext.organizationId !== id) {
    throw new Error("Access denied: Cannot update other organizations");
  }

  return prisma.organization.update({
    where: { id },
    data,
  });
}

// Facility operations
export async function createFacility(
  data: {
    name: string;
    organizationId: number;
    ref?: string;
    city?: string;
  },
  tenantContext: TenantContext,
) {
  // Validate access to the organization
  if (!tenantContext.allowedOrganizations.includes(data.organizationId)) {
    throw new Error(
      "Access denied: Cannot create facility in this organization",
    );
  }

  return prisma.facility.create({
    data,
    include: {
      organization: true,
    },
  });
}

export async function getFacilities(tenantContext: TenantContext) {
  const where = addTenantFilter(tenantContext);

  return prisma.facility.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      organization: true,
      _count: {
        select: {
          departments: true,
          standards: true,
        },
      },
    },
  });
}

export async function getFacilitiesByOrganization(
  organizationId: number,
  tenantContext: TenantContext,
) {
  // Validate access to the organization
  if (!tenantContext.allowedOrganizations.includes(organizationId)) {
    throw new Error(
      "Access denied: Cannot view facilities for this organization",
    );
  }

  return prisma.facility.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
    include: {
      organization: true,
      _count: {
        select: {
          departments: true,
          standards: true,
        },
      },
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
  tenantContext: TenantContext,
) {
  // First check if user can access the current facility
  const facility = await prisma.facility.findUnique({
    where: { id },
    select: { organizationId: true },
  });

  if (
    !facility ||
    !tenantContext.allowedOrganizations.includes(facility.organizationId)
  ) {
    throw new Error("Access denied: Cannot update this facility");
  }

  // If changing organizationId, validate access to new organization
  if (
    data.organizationId &&
    !tenantContext.allowedOrganizations.includes(data.organizationId)
  ) {
    throw new Error("Access denied: Cannot move facility to this organization");
  }

  return prisma.facility.update({
    where: { id },
    data,
    include: {
      organization: true,
    },
  });
}

// Department operations
export async function createDepartment(
  data: {
    name: string;
    facilityId: number;
  },
  tenantContext: TenantContext,
) {
  // Check access to facility
  const facility = await prisma.facility.findUnique({
    where: { id: data.facilityId },
    select: { organizationId: true },
  });

  if (
    !facility ||
    !tenantContext.allowedOrganizations.includes(facility.organizationId)
  ) {
    throw new Error("Access denied: Cannot create department in this facility");
  }

  return prisma.department.create({
    data,
    include: {
      facility: {
        include: {
          organization: true,
        },
      },
    },
  });
}

export async function getDepartmentsByFacility(
  facilityId: number,
  tenantContext: TenantContext,
) {
  // Check access to facility
  const facility = await prisma.facility.findUnique({
    where: { id: facilityId },
    select: { organizationId: true },
  });

  if (
    !facility ||
    !tenantContext.allowedOrganizations.includes(facility.organizationId)
  ) {
    throw new Error("Access denied: Cannot view departments for this facility");
  }

  return prisma.department.findMany({
    where: { facilityId },
    include: {
      facility: {
        include: {
          organization: true,
        },
      },
      _count: {
        select: {
          areas: true,
          standards: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

// Standards operations (tenant-aware)
export async function getStandards(tenantContext: TenantContext) {
  const where = addFacilityTenantFilter(tenantContext);

  return prisma.standard.findMany({
    where,
    include: {
      facility: {
        include: {
          organization: true,
        },
      },
      department: true,
      area: true,
      _count: {
        select: {
          observations: true,
          uomEntries: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getStandardsByFacility(
  facilityId: number,
  tenantContext: TenantContext,
) {
  // Check access to facility
  const facility = await prisma.facility.findUnique({
    where: { id: facilityId },
    select: { organizationId: true },
  });

  if (
    !facility ||
    !tenantContext.allowedOrganizations.includes(facility.organizationId)
  ) {
    throw new Error("Access denied: Cannot view standards for this facility");
  }

  return prisma.standard.findMany({
    where: { facilityId },
    include: {
      facility: {
        include: {
          organization: true,
        },
      },
      department: true,
      area: true,
      _count: {
        select: {
          observations: true,
          uomEntries: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function createStandard(
  data: {
    name: string;
    facilityId: number;
    departmentId: number;
    areaId: number;
    notes: string;
    bestPractices?: string[];
    processOpportunities?: string[];
  },
  tenantContext: TenantContext,
) {
  // Check access to facility
  const facility = await prisma.facility.findUnique({
    where: { id: data.facilityId },
    select: { organizationId: true },
  });

  if (
    !facility ||
    !tenantContext.allowedOrganizations.includes(facility.organizationId)
  ) {
    throw new Error("Access denied: Cannot create standard in this facility");
  }

  return prisma.standard.create({
    data,
    include: {
      facility: {
        include: {
          organization: true,
        },
      },
      department: true,
      area: true,
    },
  });
}

// Observations operations (tenant-aware)
export async function getObservations(tenantContext: TenantContext) {
  const where = addFacilityTenantFilter(tenantContext, {
    standard: {},
  });

  return prisma.observation.findMany({
    where,
    include: {
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
      user: true,
      observationData: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createObservation(
  data: {
    observationReason: string;
    standardId: number;
    timeObserved: number;
    observationStartTime?: Date;
    observationEndTime?: Date;
    totalSams: number;
    observedPerformance: number;
    pace: number;
    utilization: number;
    methods: number;
    pumpScore: number;
    comments?: string;
    userId: string;
    bestPracticesChecked?: string[];
    delays?: any[];
    processAdherenceChecked?: string[];
  },
  tenantContext: TenantContext,
) {
  // Check access to standard (and its facility)
  const standard = await prisma.standard.findUnique({
    where: { id: data.standardId },
    include: {
      facility: true,
    },
  });

  if (
    !standard ||
    !tenantContext.allowedOrganizations.includes(
      standard.facility.organizationId,
    )
  ) {
    throw new Error(
      "Access denied: Cannot create observation for this standard",
    );
  }

  return prisma.observation.create({
    data,
    include: {
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
      user: true,
    },
  });
}

// User operations (tenant-aware)
export async function getUsers(tenantContext: TenantContext) {
  if (tenantContext.isSystemSuperuser) {
    // System superuser can see all users
    return prisma.user.findMany({
      include: {
        organization: true,
        userRoles: {
          include: {
            role: true,
          },
        },
        _count: {
          select: {
            observations: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  // Regular users can only see users in their organization
  const where = addTenantFilter(tenantContext);

  return prisma.user.findMany({
    where,
    include: {
      organization: true,
      userRoles: {
        include: {
          role: true,
        },
      },
      _count: {
        select: {
          observations: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function createUser(
  data: {
    employeeId: string;
    name: string;
    email?: string;
    department?: string;
    role?: string;
    organizationId: number;
  },
  tenantContext: TenantContext,
) {
  // Validate access to the organization
  if (!tenantContext.allowedOrganizations.includes(data.organizationId)) {
    throw new Error("Access denied: Cannot create user in this organization");
  }

  return prisma.user.create({
    data,
    include: {
      organization: true,
    },
  });
}

// Role operations (tenant-aware)
export async function getRoles(tenantContext: TenantContext) {
  if (tenantContext.isSystemSuperuser) {
    // System superuser can see all roles
    return prisma.role.findMany({
      include: {
        organization: true,
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  // Regular users can only see roles in their organization + system roles
  return prisma.role.findMany({
    where: {
      OR: [
        { organizationId: tenantContext.organizationId },
        { isSystemRole: true },
      ],
    },
    include: {
      organization: true,
      rolePermissions: {
        include: {
          permission: true,
        },
      },
      _count: {
        select: {
          userRoles: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function createRole(
  data: {
    name: string;
    description?: string;
    organizationId?: number;
    isSystemRole?: boolean;
  },
  tenantContext: TenantContext,
) {
  // Only system superuser can create system roles
  if (data.isSystemRole && !tenantContext.isSystemSuperuser) {
    throw new Error(
      "Access denied: Only system superuser can create system roles",
    );
  }

  // Validate access to organization for non-system roles
  if (!data.isSystemRole && data.organizationId) {
    if (!tenantContext.allowedOrganizations.includes(data.organizationId)) {
      throw new Error("Access denied: Cannot create role in this organization");
    }
  }

  return prisma.role.create({
    data,
    include: {
      organization: true,
    },
  });
}
