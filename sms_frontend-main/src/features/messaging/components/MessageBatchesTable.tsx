import { useState } from "react";
import * as React from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { Badge } from "../../../shared/ui/Badge";
import { Button } from "../../../shared/ui/Button";
import { formatMoney } from "../../../shared/lib/format-money";
import type { MessageBatchesResponse } from "../types/messaging.types";

interface MessageBatchesTableProps {
  batchesQuery: UseQueryResult<MessageBatchesResponse, Error>;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function MessageBatchesTable({
  batchesQuery,
  onPageChange,
}: MessageBatchesTableProps) {
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);

  if (batchesQuery.isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Recent Messages</h2>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[rgba(200,16,46)]" />
            <p className="mt-4 text-sm text-slate-600">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  if (batchesQuery.isError) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Recent Messages</h2>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">Failed to load message history</p>
        </div>
      </div>
    );
  }

  const data = batchesQuery.data!;
  const { batches, total, page, totalPages } = data;

  const toggleBatchExpansion = (batchId: string) => {
    setExpandedBatchId(expandedBatchId === batchId ? null : batchId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Recent Messages</h2>
        <p className="text-sm text-slate-600">
          {total} total batch{total !== 1 ? "es" : ""}
        </p>
      </div>

      {batches.length === 0 ? (
        <div className="py-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <p className="mt-4 text-sm text-slate-600">No messages sent yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Your sent messages will appear here
          </p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                    Batch ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                    App
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                    Recipients
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                    Cost
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {batches.map((batch) => {
                  const isExpanded = expandedBatchId === batch.batchId;
                  const successCount = batch.successCount ?? 0;
                  const failedCount = batch.failedCount ?? 0;

                  return (
                    <React.Fragment key={batch.batchId}>
                      <tr className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-mono text-slate-700">
                          {batch.batchId.substring(0, 20)}...
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {batch.appName || "Unknown"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          <div>
                            <span className="font-medium">{batch.totalMessages}</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {successCount > 0 && (
                              <span className="text-green-600">{successCount} sent</span>
                            )}
                            {successCount > 0 && failedCount > 0 && <span> · </span>}
                            {failedCount > 0 && (
                              <span className="text-red-600">{failedCount} failed</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              batch.status === "COMPLETED" || batch.status === "SENT"
                                ? "success"
                                : batch.status === "FAILED"
                                ? "danger"
                                : "warning"
                            }
                          >
                            {batch.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {formatMoney(batch.totalCost, "RWF")}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {batch.createdAt ? formatDate(batch.createdAt) : "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleBatchExpansion(batch.batchId)}
                            className="text-sm text-[rgba(200,16,46)] hover:underline"
                          >
                            {isExpanded ? "Hide" : "View"} Details
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="px-4 py-4 bg-slate-50">
                            <div className="space-y-3">
                              <h4 className="text-sm font-bold text-slate-900">
                                Individual Messages
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead className="border-b border-slate-300">
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">
                                        To
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">
                                        From
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">
                                        Message
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">
                                        SMS Count
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">
                                        Cost
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">
                                        Status
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-200">
                                    {batch.messages.map((msg) => (
                                      <tr key={msg.id} className="text-xs">
                                        <td className="px-3 py-2 font-mono text-slate-700">
                                          {msg.to}
                                        </td>
                                        <td className="px-3 py-2 text-slate-700">{msg.from}</td>
                                        <td className="px-3 py-2 text-slate-700 max-w-xs truncate">
                                          {msg.message}
                                        </td>
                                        <td className="px-3 py-2 text-slate-700">
                                          {msg.smsCount}
                                        </td>
                                        <td className="px-3 py-2 text-slate-700">
                                          {formatMoney(msg.cost, "RWF")}
                                        </td>
                                        <td className="px-3 py-2">
                                          <Badge
                                            variant={
                                              msg.status === "SENT" || msg.status === "DELIVERED"
                                                ? "success"
                                                : msg.status === "FAILED"
                                                ? "danger"
                                                : "warning"
                                            }
                                          >
                                            {msg.status}
                                          </Badge>
                                          {msg.errorMessage && (
                                            <p className="mt-1 text-xs text-red-600">
                                              {msg.errorMessage}
                                            </p>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
            <div className="text-sm text-slate-600">
              Page {page} of {totalPages} • Showing {batches.length} of {total} batch{total !== 1 ? "es" : ""}
            </div>
            {totalPages > 1 && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page === 1}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
