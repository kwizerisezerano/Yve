-- Add webhook URL and secret to App table
ALTER TABLE "apps" ADD COLUMN IF NOT EXISTS "webhook_url" TEXT;
ALTER TABLE "apps" ADD COLUMN IF NOT EXISTS "webhook_secret" TEXT;
