import { useQuery } from "@tanstack/react-query";
import { listSenderIds } from "../api/sender-id.api";

export function useSenderIds() {
  return useQuery({
    queryKey: ["sender-ids"],
    queryFn: listSenderIds,
  });
}
