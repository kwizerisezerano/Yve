-- Add webhook-related fields to Message table
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "error_code" VARCHAR(50);
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "error_message" TEXT;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "failed_at" TIMESTAMP;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP DEFAULT NOW();

-- Add index for provider_id lookups (for webhook processing)
CREATE INDEX IF NOT EXISTS "messages_provider_id_idx" ON "messages"("provider_id");

-- Add webhook_url to MessageBatch for callback URL
ALTER TABLE "message_batches" ADD COLUMN IF NOT EXISTS "webhook_url" TEXT;
