-- Application is removed: a tenant now authenticates directly with its own
-- api key. Existing tenants/applications predate this model and cannot carry
-- a meaningful api key forward (an application's key belonged to the
-- application, not the tenant, and a tenant could have had several), so
-- dependent rows are cleared before the new NOT NULL/UNIQUE columns are added.
DELETE FROM routing_decisions WHERE message_id IN (SELECT id FROM messages);
DELETE FROM message_attempts;
DELETE FROM messages;
DELETE FROM applications;
DELETE FROM tenants;

-- DropTable
DROP TABLE "applications";

-- DropEnum
DROP TYPE "application_status";

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN "api_key_hash" TEXT;
ALTER TABLE "tenants" ADD COLUMN "default_sender" TEXT;
ALTER TABLE "tenants" ALTER COLUMN "api_key_hash" SET NOT NULL;
ALTER TABLE "tenants" ALTER COLUMN "default_sender" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tenants_api_key_hash_key" ON "tenants"("api_key_hash");
