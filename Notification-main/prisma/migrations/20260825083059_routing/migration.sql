-- CreateEnum
CREATE TYPE "routing_rule_action" AS ENUM ('ALLOW', 'BLOCK');

-- CreateEnum
CREATE TYPE "routing_rule_status" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "routing_decision_status" AS ENUM ('SELECTED', 'ELIGIBLE', 'REJECTED');

-- CreateTable
CREATE TABLE "routing_rules" (
    "id" TEXT NOT NULL,
    "country" TEXT,
    "operator" TEXT,
    "type" TEXT,
    "provider" TEXT NOT NULL,
    "action" "routing_rule_action" NOT NULL DEFAULT 'ALLOW',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "cost" DOUBLE PRECISION,
    "status" "routing_rule_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routing_decisions" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" "routing_decision_status" NOT NULL,
    "reason" TEXT,
    "cost" DOUBLE PRECISION,
    "health" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routing_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "routing_rules_status_type_idx" ON "routing_rules"("status", "type");

-- CreateIndex
CREATE INDEX "routing_decisions_message_id_idx" ON "routing_decisions"("message_id");

-- AddForeignKey
ALTER TABLE "routing_decisions" ADD CONSTRAINT "routing_decisions_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
