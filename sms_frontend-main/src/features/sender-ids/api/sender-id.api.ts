import { httpClient } from "../../../shared/api/http-client";
import { mockRequest } from "../../../shared/api/mock";
import { ApiError } from "../../../shared/api/api-error";
import type { RegisterSenderIdRequest, SenderId } from "../types/sender-id.types";

const BACKEND_READY = true;

let mockSenderIds: SenderId[] = [
  {
    id: "sid-001",
    tenantId: "seed-tenant-001",
    name: "INGOGA",
    status: "APPROVED",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "sid-002",
    tenantId: "seed-tenant-001",
    name: "ACME-ALERT",
    status: "PENDING",
    createdAt: "2026-08-20T14:00:00.000Z",
    updatedAt: "2026-08-20T14:00:00.000Z",
  },
];

export function listSenderIds(): Promise<SenderId[]> {
  if (!BACKEND_READY) return mockRequest([...mockSenderIds]);
  return httpClient.get<SenderId[]>("/sender-ids");
}

export function registerSenderId(
  input: RegisterSenderIdRequest,
): Promise<SenderId> {
  if (!BACKEND_READY) {
    const existing = mockSenderIds.find(
      (s) => s.name.toUpperCase() === input.name.toUpperCase(),
    );
    if (existing) {
      return Promise.reject(new ApiError("Sender ID already registered", 409));
    }
    const newSender: SenderId = {
      id: `sid-${Date.now()}`,
      tenantId: "seed-tenant-001",
      name: input.name.toUpperCase(),
      status: "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockSenderIds = [newSender, ...mockSenderIds];
    return mockRequest(newSender);
  }
  return httpClient.post<SenderId>("/sender-ids", input);
}

export function approveSenderId(id: string): Promise<SenderId> {
  if (!BACKEND_READY) {
    const sender = mockSenderIds.find((s) => s.id === id);
    if (!sender) return Promise.reject(new ApiError("Sender ID not found", 404));
    sender.status = "APPROVED";
    sender.updatedAt = new Date().toISOString();
    return mockRequest({ ...sender });
  }
  return httpClient.patch<SenderId>(`/sender-ids/${id}/approve`);
}
