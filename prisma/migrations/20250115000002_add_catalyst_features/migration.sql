-- Add goal settings and new employee features

-- Add new columns to users table
ALTER TABLE "users" ADD COLUMN "startDate" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "isNewEmployee" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "newEmployeePeriodDays" INTEGER DEFAULT 90;
ALTER TABLE "users" ADD COLUMN "observationGoalPerDay" INTEGER DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "observationGoalPerWeek" INTEGER DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "observationGoalPerMonth" INTEGER DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "observationGoalPerQuarter" INTEGER DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "observationGoalPerYear" INTEGER DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "observationReceiveGoalPeriod" VARCHAR(20) DEFAULT 'month';
ALTER TABLE "users" ADD COLUMN "observationReceiveGoalCount" INTEGER DEFAULT 4;
ALTER TABLE "users" ADD COLUMN "userType" VARCHAR(50) DEFAULT 'Team Member';

-- Create a new table for scheduled observations
CREATE TABLE "scheduled_observations" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "standardId" INTEGER NOT NULL,
  "scheduledDate" TIMESTAMP(3) NOT NULL,
  "scheduledTime" TEXT NOT NULL,
  "notes" TEXT,
  "isCompleted" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT NOT NULL,

  CONSTRAINT "scheduled_observations_pkey" PRIMARY KEY ("id")
);

-- Create foreign key constraints
ALTER TABLE "scheduled_observations" ADD CONSTRAINT "scheduled_observations_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "scheduled_observations" ADD CONSTRAINT "scheduled_observations_standardId_fkey" 
  FOREIGN KEY ("standardId") REFERENCES "standards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "scheduled_observations" ADD CONSTRAINT "scheduled_observations_createdBy_fkey" 
  FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
