-- CreateEnum
CREATE TYPE "message_status" AS ENUM ('QUEUED', 'ROUTED', 'SUBMITTED', 'DELIVERED', 'FAILED', 'RETRYING', 'DEAD_LETTER');

-- CreateEnum
CREATE TYPE "attempt_status" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "message_status" NOT NULL DEFAULT 'QUEUED',
    "provider" TEXT,
    "idempotency_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_attempts" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "attempt_number" INTEGER NOT NULL,
    "status" "attempt_status" NOT NULL DEFAULT 'PENDING',
    "error_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "message_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "messages_idempotency_key_idx" ON "messages"("idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "message_attempts_message_id_attempt_number_key" ON "message_attempts"("message_id", "attempt_number");

-- AddForeignKey
ALTER TABLE "message_attempts" ADD CONSTRAINT "message_attempts_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
