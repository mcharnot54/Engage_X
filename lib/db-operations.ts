import { prisma } from "./prisma";

// Facility operations
export async function createFacility(data: {
  name: string;
  ref?: string;
  city?: string;
}) {
  return prisma.facility.create({
    data,
  });
}

export async function getFacilities() {
  return prisma.facility.findMany({
    orderBy: { name: "asc" },
  });
}

export async function updateFacility(
  id: number,
  data: {
    name?: string;
    ref?: string;
    city?: string;
  },
) {
  return prisma.facility.update({
    where: { id },
    data,
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
  uomEntries: {
    uom: string;
    description: string;
    samValue: number;
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
      facility: true,
      department: true,
      area: true,
      uomEntries: true,
    },
  });
}

export async function getStandards() {
  return prisma.standard.findMany({
    where: { isActive: true },
    include: {
      facility: true,
      department: true,
      area: true,
      uomEntries: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getStandardById(id: number) {
  return prisma.standard.findUnique({
    where: { id },
    include: {
      facility: true,
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
      facility: true,
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
      facility: true,
      department: true,
      area: true,
      uomEntries: true,
    },
  });
}

// User operations
export async function createUser(data: {
  employeeId: string;
  name: string;
  email?: string;
  department?: string;
  role?: string;
}) {
  return prisma.user.create({
    data,
  });
}

export async function getUserByEmployeeId(employeeId: string) {
  return prisma.user.findUnique({
    where: { employeeId },
  });
}

export async function getUsers() {
  return prisma.user.findMany({
    orderBy: { name: "asc" },
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
          facility: true,
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
          facility: true,
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
          facility: true,
          department: true,
          area: true,
        },
      },
      observationData: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
