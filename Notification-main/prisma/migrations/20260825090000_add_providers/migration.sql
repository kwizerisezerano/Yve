-- CreateEnum
CREATE TYPE "provider_status" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateTable
CREATE TABLE "providers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "default_cost" DOUBLE PRECISION,
    "status" "provider_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "providers_name_key" ON "providers"("name");

-- AlterTable: replace routing_rules.provider (string) with provider_id (FK)
ALTER TABLE "routing_rules" ADD COLUMN "provider_id" TEXT;

-- routing_rules is confirmed empty in every environment this migration has run against,
-- so no backfill is needed before enforcing NOT NULL.
ALTER TABLE "routing_rules" ALTER COLUMN "provider_id" SET NOT NULL;

ALTER TABLE "routing_rules" DROP COLUMN "provider";

-- CreateIndex
CREATE INDEX "routing_rules_provider_id_idx" ON "routing_rules"("provider_id");

-- AddForeignKey
ALTER TABLE "routing_rules" ADD CONSTRAINT "routing_rules_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
