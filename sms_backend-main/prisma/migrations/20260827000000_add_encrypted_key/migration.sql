-- AlterTable
ALTER TABLE "api_keys" ADD COLUMN "encrypted_key" TEXT NOT NULL DEFAULT '';

-- Update existing keys with a placeholder (they won't work anymore and need to be regenerated)
UPDATE "api_keys" SET "encrypted_key" = 'MIGRATION_PLACEHOLDER_REGENERATE_KEY';
