CREATE TYPE "UserRole" AS ENUM ('CITIZEN', 'SUPER_ADMIN');
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE');
CREATE TYPE "ModerationState" AS ENUM ('PENDING', 'PUBLISHED', 'HIDDEN', 'REMOVED');
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'ACKNOWLEDGED', 'WORK_STARTED', 'RESOLVED', 'VERIFIED', 'CLOSED', 'REOPENED');
CREATE TYPE "LocationSource" AS ENUM ('GPS', 'MANUAL');
CREATE TYPE "ActivityType" AS ENUM ('CREATED', 'FIELD_CHANGED', 'STATUS_CHANGED', 'VISIBILITY_CHANGED', 'MODERATION_CHANGED', 'ROUTING_SNAPSHOTTED', 'MEDIA_ADDED');

CREATE TABLE "User" ("id" TEXT NOT NULL, "firebaseUid" TEXT NOT NULL, "role" "UserRole" NOT NULL DEFAULT 'CITIZEN', "locale" TEXT NOT NULL DEFAULT 'en-IN', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "User_pkey" PRIMARY KEY ("id"));
CREATE TABLE "GeographyScope" ("id" TEXT NOT NULL, "country" TEXT NOT NULL DEFAULT 'India', "state" TEXT, "city" TEXT, "constituency" TEXT, "locality" TEXT, "isLaunchArea" BOOLEAN NOT NULL DEFAULT false, CONSTRAINT "GeographyScope_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Category" ("id" TEXT NOT NULL, "slug" TEXT NOT NULL, "name" TEXT NOT NULL, "formRules" JSONB NOT NULL, "active" BOOLEAN NOT NULL DEFAULT true, "sortOrder" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Category_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Department" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, CONSTRAINT "Department_pkey" PRIMARY KEY ("id"));
CREATE TABLE "OfficialChannel" ("id" TEXT NOT NULL, "departmentId" TEXT NOT NULL, "label" TEXT NOT NULL, "instructions" TEXT NOT NULL, "url" TEXT, "phone" TEXT, "lastVerifiedAt" TIMESTAMP(3) NOT NULL, "active" BOOLEAN NOT NULL DEFAULT true, CONSTRAINT "OfficialChannel_pkey" PRIMARY KEY ("id"));
CREATE TABLE "RoutingRule" ("id" TEXT NOT NULL, "categoryId" TEXT NOT NULL, "departmentId" TEXT NOT NULL, "geographyScopeId" TEXT, "confidence" INTEGER NOT NULL, "explanation" TEXT NOT NULL, "priority" INTEGER NOT NULL DEFAULT 0, "active" BOOLEAN NOT NULL DEFAULT true, CONSTRAINT "RoutingRule_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Report" ("id" TEXT NOT NULL, "ownerId" TEXT NOT NULL, "categoryId" TEXT NOT NULL, "description" TEXT NOT NULL, "manualLocation" TEXT, "latitude" DECIMAL(9,6), "longitude" DECIMAL(9,6), "publicLatitude" DECIMAL(9,4), "publicLongitude" DECIMAL(9,4), "locationSource" "LocationSource", "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC', "moderationState" "ModerationState" NOT NULL DEFAULT 'PENDING', "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT', "complaintReference" TEXT, "routingSnapshot" JSONB, "version" INTEGER NOT NULL DEFAULT 1, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Report_pkey" PRIMARY KEY ("id"));
CREATE TABLE "ReportMedia" ("id" TEXT NOT NULL, "reportId" TEXT NOT NULL, "cloudinaryPublicId" TEXT NOT NULL, "secureUrl" TEXT NOT NULL, "contentType" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ReportMedia_pkey" PRIMARY KEY ("id"));
CREATE TABLE "ReportActivity" ("id" TEXT NOT NULL, "reportId" TEXT NOT NULL, "actorId" TEXT, "type" "ActivityType" NOT NULL, "payload" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ReportActivity_pkey" PRIMARY KEY ("id"));
CREATE TABLE "OfflineSyncReceipt" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "idempotencyKey" TEXT NOT NULL, "reportId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "OfflineSyncReceipt_pkey" PRIMARY KEY ("id"));

CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");
CREATE INDEX "GeographyScope_country_state_city_constituency_idx" ON "GeographyScope"("country", "state", "city", "constituency");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");
CREATE INDEX "Report_ownerId_updatedAt_idx" ON "Report"("ownerId", "updatedAt");
CREATE INDEX "Report_visibility_moderationState_publicLatitude_publicLong_idx" ON "Report"("visibility", "moderationState", "publicLatitude", "publicLongitude");
CREATE UNIQUE INDEX "ReportMedia_cloudinaryPublicId_key" ON "ReportMedia"("cloudinaryPublicId");
CREATE INDEX "ReportActivity_reportId_createdAt_idx" ON "ReportActivity"("reportId", "createdAt");
CREATE UNIQUE INDEX "OfflineSyncReceipt_userId_idempotencyKey_key" ON "OfflineSyncReceipt"("userId", "idempotencyKey");

ALTER TABLE "OfficialChannel" ADD CONSTRAINT "OfficialChannel_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RoutingRule" ADD CONSTRAINT "RoutingRule_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RoutingRule" ADD CONSTRAINT "RoutingRule_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RoutingRule" ADD CONSTRAINT "RoutingRule_geographyScopeId_fkey" FOREIGN KEY ("geographyScopeId") REFERENCES "GeographyScope"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReportMedia" ADD CONSTRAINT "ReportMedia_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReportActivity" ADD CONSTRAINT "ReportActivity_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReportActivity" ADD CONSTRAINT "ReportActivity_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
