export type SenderIdStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SenderId {
  id: string;
  tenantId: string;
  name: string;
  status: SenderIdStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterSenderIdRequest {
  name: string;
}
