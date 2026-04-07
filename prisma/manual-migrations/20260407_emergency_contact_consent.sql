ALTER TABLE "RescueCard"
ADD COLUMN IF NOT EXISTS "emergencyContactGmail" TEXT;

CREATE TABLE IF NOT EXISTS "EmergencyContactConsentRequest" (
  "id" TEXT NOT NULL,
  "requesterUserId" TEXT NOT NULL,
  "requesterEmail" TEXT NOT NULL,
  "requesterName" TEXT,
  "emergencyContactName" TEXT,
  "pendingEmail" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "approvedAt" TIMESTAMP(3),
  "declinedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmergencyContactConsentRequest_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "EmergencyContactConsentRequest_requesterUserId_fkey" FOREIGN KEY ("requesterUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "EmergencyContactConsentRequest_token_key" ON "EmergencyContactConsentRequest"("token");
CREATE INDEX IF NOT EXISTS "EmergencyContactConsentRequest_requesterUserId_status_idx" ON "EmergencyContactConsentRequest"("requesterUserId", "status");
