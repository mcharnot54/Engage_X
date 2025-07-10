-- Migration to fix notes field for existing standards
-- Update any existing standards that might have NULL or empty notes
UPDATE "standards" 
SET "notes" = 'Standard notes not provided' 
WHERE "notes" IS NULL OR "notes" = '';

-- Ensure the notes column has proper constraint
ALTER TABLE "standards" 
ALTER COLUMN "notes" SET NOT NULL,
ALTER COLUMN "notes" SET DEFAULT 'Standard notes not provided';
