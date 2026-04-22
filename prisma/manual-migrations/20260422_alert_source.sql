ALTER TABLE "Alert"
ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'third_party_api';

UPDATE "Alert"
SET "source" = 'user_report'
WHERE COALESCE("notes", '') = 'Generated via Aegis System';

UPDATE "Alert"
SET "source" = 'third_party_api'
WHERE "source" IS NULL
   OR "source" NOT IN ('third_party_api', 'user_report');
