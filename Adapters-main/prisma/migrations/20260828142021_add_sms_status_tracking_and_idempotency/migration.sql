-- AlterTable
ALTER TABLE "sms_messages" ADD COLUMN IF NOT EXISTS "coreCallbackError" TEXT,
ADD COLUMN IF NOT EXISTS "coreCallbackSentAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "opcoCallbackPayload" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "sms_messages_accountId_coreMessageId_key" ON "sms_messages"("accountId", "coreMessageId");
