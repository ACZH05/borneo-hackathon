-- DropForeignKey
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "EmergencyPlan" DROP CONSTRAINT "EmergencyPlan_userId_fkey";

-- DropForeignKey
ALTER TABLE "IncidentReport" DROP CONSTRAINT "IncidentReport_userId_fkey";

-- DropForeignKey
ALTER TABLE "LessonCompletion" DROP CONSTRAINT "LessonCompletion_userId_fkey";

-- DropForeignKey
ALTER TABLE "RescueCard" DROP CONSTRAINT "RescueCard_userId_fkey";

-- AlterTable
ALTER TABLE "Alert" DROP COLUMN "createdBy",
ADD COLUMN     "createdBy" UUID NOT NULL;

-- AlterTable
ALTER TABLE "EmergencyPlan" DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "IncidentReport" DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "LessonCompletion" DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "RescueCard" DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "LessonCompletion_userId_lessonId_key" ON "LessonCompletion"("userId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "RescueCard_userId_key" ON "RescueCard"("userId");

-- AddForeignKey
ALTER TABLE "IncidentReport" ADD CONSTRAINT "IncidentReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RescueCard" ADD CONSTRAINT "RescueCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyPlan" ADD CONSTRAINT "EmergencyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonCompletion" ADD CONSTRAINT "LessonCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

