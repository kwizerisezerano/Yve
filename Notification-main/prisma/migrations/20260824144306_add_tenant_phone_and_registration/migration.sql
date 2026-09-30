-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "phone" TEXT;

-- Backfill existing rows with a placeholder, since phone was not tracked before this migration.
UPDATE "tenants" SET "phone" = 'unknown' WHERE "phone" IS NULL;

-- AlterTable
ALTER TABLE "tenants" ALTER COLUMN "phone" SET NOT NULL;
