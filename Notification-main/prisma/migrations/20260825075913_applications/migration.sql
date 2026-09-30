-- CreateEnum
CREATE TYPE "application_status" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "api_key_hash" TEXT NOT NULL,
    "default_sender" TEXT NOT NULL,
    "status" "application_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "applications_api_key_hash_key" ON "applications"("api_key_hash");

-- CreateIndex
CREATE INDEX "applications_tenant_id_idx" ON "applications"("tenant_id");

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill: every existing tenant already has an api key and default sender
-- directly on the tenants row (from before this migration). Move that into
-- one "Default" application per tenant, so existing keys keep working.
INSERT INTO "applications" ("id", "tenant_id", "name", "api_key_hash", "default_sender", "status", "created_at", "updated_at")
SELECT gen_random_uuid(), "id", 'Default', "api_key_hash", "default_sender", "status"::text::"application_status", "created_at", "updated_at"
FROM "tenants";

-- DropIndex (implicit, dropped with the column below)
ALTER TABLE "tenants" DROP COLUMN "api_key_hash";
ALTER TABLE "tenants" DROP COLUMN "default_sender";
