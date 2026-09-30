import { useState, type FormEvent } from "react";
import { useParams, Link } from "react-router";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { Button } from "../../../shared/ui/Button";
import { Badge } from "../../../shared/ui/Badge";
import { useApp } from "../hooks/useApps";
import { useSendMessage, useMessageBatches } from "../hooks/useMessaging";
import { useToast } from "../../../shared/ui/useToast";
import { useSmsPrice } from "../../../shared/hooks/useSystemSettings";
import { useSenderIds } from "../../sender-ids/hooks/useSenderIds";
import { formatMoney } from "../../../shared/lib/format-money";

export function SendMessagePage() {
  const { appId } = useParams<{ appId: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [recipients, setRecipients] = useState("");
  const [message, setMessage] = useState("");
  const [senderId, setSenderId] = useState("");
  const [errors, setErrors] = useState<{ recipients?: string; message?: string; senderId?: string }>({});

  const appQuery = useApp(appId!);
  const sendMutation = useSendMessage();
  const batchesQuery = useMessageBatches(appId!, currentPage, 5);
  const senderIdsQuery = useSenderIds();
  const { showToast } = useToast();
  const smsPrice = useSmsPrice(); 

  const messageLength = message.length;
  
  // Calculate SMS count based on GSM-7 vs Unicode
  const isUnicode = /[^\x00-\x7F]/.test(message);
  let smsCount: number;
  if (messageLength === 0) {
    smsCount = 1;
  } else if (isUnicode) {
    // Unicode: 70 chars for single, 67 per segment for multi-part
    smsCount = messageLength <= 70 ? 1 : Math.ceil(messageLength / 67);
  } else {
    // GSM-7: 160 chars for single, 153 per segment for multi-part
    smsCount = messageLength <= 160 ? 1 : Math.ceil(messageLength / 153);
  }
  
  const recipientCount = recipients
    .split(/[,\n]/)
    .map((p) => p.trim())
    .filter(Boolean).length;
  const estimatedCost = recipientCount * smsCount * (smsPrice || 0);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const newErrors: typeof errors = {};
    const phoneNumbers = recipients
      .split(/[,\n]/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (phoneNumbers.length === 0) {
      newErrors.recipients = "At least one phone number is required";
    }

    // Validate phone number format - must start with + and country code
    const invalidNumbers = phoneNumbers.filter(
      (phone) => !/^\+[1-9]\d{1,14}$/.test(phone)
    );
    if (invalidNumbers.length > 0) {
      newErrors.recipients = `Phone numbers must include country code (e.g., +250788123456). Invalid: ${invalidNumbers.join(', ')}`;
    }

    if (!message.trim()) {
      newErrors.message = "Message is required";
    }

    // Require sender ID
    if (!senderId.trim()) {
      newErrors.senderId = "Sender ID is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    sendMutation.mutate(
      {
        appId: appId!,
        dto: {
          to: phoneNumbers,
          message: message.trim(),
          from: senderId.trim(),
        },
      },
      {
        onSuccess: (batch) => {
          const successCount = batch.successCount ?? batch.totalMessages;
          showToast({
            title: "Messages sent successfully",
            description: `${successCount} of ${batch.totalMessages} messages ${batch.status === 'SENT' ? 'sent' : 'queued'}`,
            variant: "success",
          });
          setRecipients("");
          setMessage("");
          setSenderId("");
          setErrors({});
        },
        onError: (error: any) => {
          showToast({
            title: "Failed to send messages",
            description: error?.message || "An error occurred",
            variant: "danger",
          });
        },
      }
    );
  }

  if (appQuery.isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[rgba(200,16,46)]" />
            <p className="mt-4 text-sm text-slate-600">Loading...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (appQuery.isError || !appQuery.data) {
    return (
      <PageContainer>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">Failed to load app details</p>
        </div>
      </PageContainer>
    );
  }

  const app = appQuery.data;
  const batches = batchesQuery.data || [];
  const approvedSenderIds = (senderIdsQuery.data || []).filter(
    (sender) => sender.status === "APPROVED"
  );

  return (
    <PageContainer>
      <div className="mb-6">
        <Link
          to={`/app/apps/${app.id}`}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to {app.name}
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Send Message</h1>
          <Badge variant={app.status === "ACTIVE" ? "success" : "warning"}>
            {app.status}
          </Badge>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Send SMS messages using {app.name}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Message Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-6 text-lg font-bold text-slate-900">Compose Message</h2>

            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="recipients" className="text-sm font-medium text-slate-700">
                  Recipients *
                </label>
                <textarea
                  id="recipients"
                  value={recipients}
                  onChange={(e) => {
                    setRecipients(e.target.value);
                    setErrors({ ...errors, recipients: undefined });
                  }}
                  placeholder="Enter phone numbers with country code (one per line or comma-separated)&#10;Examples: +250788123456, +254712345678, +1234567890"
                  rows={4}
                  className={[
                    "rounded-md border px-3 py-2 text-sm text-slate-900",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(200,16,46)]",
                    errors.recipients ? "border-red-500" : "border-slate-300",
                  ].join(" ")}
                />
                {errors.recipients && (
                  <p className="text-sm text-red-600">{errors.recipients}</p>
                )}
                <p className="text-xs text-slate-500">
                  {recipientCount} recipient{recipientCount !== 1 ? "s" : ""}
                </p>
              </div>

              <div>
                <label htmlFor="senderId" className="block text-sm font-medium text-slate-700 mb-1">
                  Sender ID (optional)
                </label>
                {senderIdsQuery.isLoading ? (
                  <div className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-[rgba(200,16,46)]" />
                    <span className="text-sm text-slate-500">Loading sender IDs...</span>
                  </div>
                ) : approvedSenderIds.length === 0 ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      id="senderId"
                      value={senderId}
                      onChange={(e) => setSenderId(e.target.value)}
                      placeholder="e.g., INGOGA or your brand name"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(200,16,46)]"
                    />
                    <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                      <p className="text-xs text-amber-800">
                        ⚠️ You don't have any approved sender IDs. <Link to="/app/sender-ids" className="font-medium underline">Register one here</Link>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <select
                      id="senderId"
                      value={senderId}
                      onChange={(e) => setSenderId(e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(200,16,46)]"
                    >
                      <option value="">-- Select Sender ID --</option>
                      {approvedSenderIds.map((sender) => (
                        <option key={sender.id} value={sender.name}>
                          {sender.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500">
                      💡 Select from your approved sender IDs or leave empty
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="message" className="text-sm font-medium text-slate-700">
                  Message *
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setErrors({ ...errors, message: undefined });
                  }}
                  placeholder="Type your message here..."
                  rows={6}
                  className={[
                    "rounded-md border px-3 py-2 text-sm text-slate-900",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(200,16,46)]",
                    errors.message ? "border-red-500" : "border-slate-300",
                  ].join(" ")}
                />
                {errors.message && (
                  <p className="text-sm text-red-600">{errors.message}</p>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    {messageLength} / {isUnicode ? (messageLength <= 70 ? "70" : "67/part") : (messageLength <= 160 ? "160" : "153/part")} characters
                    {isUnicode && <span className="ml-1 text-amber-600">(Unicode)</span>}
                  </span>
                  <span className="font-medium text-slate-700">{smsCount} SMS</span>
                </div>
              </div>

              {/* Cost Estimate */}
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">Estimated Cost</p>
                    <p className="mt-1 text-xs text-slate-600">
                      {recipientCount} recipient{recipientCount !== 1 ? "s" : ""} × {smsCount} SMS × {formatMoney(smsPrice || 0, "RWF")}
                    </p>
                    {isUnicode && (
                      <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Unicode detected: reduced character limit
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">
                      {formatMoney(estimatedCost, "RWF")}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={sendMutation.isPending || app.status !== "ACTIVE"}
                className="w-full"
              >
                {sendMutation.isPending ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Recent Batches */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Recent Batches</h2>

            {batchesQuery.isLoading && (
              <div className="py-8 text-center">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-[rgba(200,16,46)]" />
              </div>
            )}

            {batchesQuery.isSuccess && batches.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">
                No messages sent yet
              </p>
            )}

            {batchesQuery.isSuccess && batches.length > 0 && (
              <div className="space-y-3">
                {batches.slice(0, 5).map((batch) => {
                  const successCount = batch.successCount ?? 0;
                  const failedCount = batch.failedCount ?? 0;
                  return (
                    <div
                      key={batch.batchId}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="flex items-center justify-between">
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
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-slate-500">Total</p>
                          <p className="font-semibold text-slate-900">{batch.totalMessages}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Success</p>
                          <p className="font-semibold text-green-600">{successCount}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Failed</p>
                          <p className="font-semibold text-red-600">{failedCount}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Cost</p>
                          <p className="font-semibold text-slate-900">{formatMoney(batch.totalCost, "RWF")}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
           
          {/* Quick Tips */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-3 text-sm font-bold text-slate-900">SMS Pricing Info</h3>
            <div className="mb-3 rounded-lg bg-blue-50 border border-blue-200 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">Price per SMS</span>
                <span className="text-sm font-bold text-slate-900">{formatMoney(smsPrice || 0, "RWF")}</span>
              </div>
            </div>
            <h3 className="mb-3 text-sm font-bold text-slate-900">Quick Tips</h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex gap-2">
                <span className="text-[rgba(200,16,46)]">•</span>
                <span>Always include country code: +250 (Rwanda), +254 (Kenya), etc.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[rgba(200,16,46)]">•</span>
                <span>Format: +[country code][number] (e.g., +250788123456)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[rgba(200,16,46)]">•</span>
                <span>Standard SMS: 160 chars (single), 153 chars/part (multi-part)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[rgba(200,16,46)]">•</span>
                <span>Unicode SMS: 70 chars (single), 67 chars/part (multi-part)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[rgba(200,16,46)]">•</span>
                <span>Emojis and special characters trigger Unicode encoding</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
