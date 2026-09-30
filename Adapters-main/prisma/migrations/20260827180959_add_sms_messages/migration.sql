-- CreateEnum
CREATE TYPE "SmsStatus" AS ENUM ('RECEIVED', 'SENT_TO_OPCO', 'DELIVERED', 'FAILED');

-- CreateTable
CREATE TABLE "sms_messages" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "coreMessageId" TEXT NOT NULL,
    "msisdn" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "coreCallbackUrl" TEXT NOT NULL,
    "status" "SmsStatus" NOT NULL DEFAULT 'RECEIVED',
    "opcoReference" TEXT,
    "opcoResponse" JSONB,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sms_messages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sms_messages" ADD CONSTRAINT "sms_messages_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
