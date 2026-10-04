import { useState, type FormEvent } from "react";
import { useParams, Link } from "react-router";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { Button } from "../../../shared/ui/Button";
import { useApp } from "../../apps/hooks/useApps";
import { useSendMessage, useMessageBatches } from "../../messaging/hooks/useMessaging";
import { useToast } from "../../../shared/ui/useToast";
import { useSmsPrice } from "../../../shared/hooks/useSystemSettings";
import { useSenderIds } from "../../sender-ids/hooks/useSenderIds";
import { formatMoney } from "../../../shared/lib/format-money";

export function SendPage() {
  const { appId } = useParams<{ appId: string }>();
  const [serviceType, setServiceType] = useState<"SMS" | "EMAIL">("SMS");
  const [currentPage] = useState(1);

  // SMS state
  const [smsRecipients, setSmsRecipients] = useState("");
  const [message, setMessage] = useState("");
  const [senderId, setSenderId] = useState("");
  const [smsErrors, setSmsErrors] = useState<{ recipients?: string; message?: string; senderId?: string }>({});

  // Email state
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailHtml, setEmailHtml] = useState("");
  const [emailFrom, setEmailFrom] = useState("noreply@yourdomain.com");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailResult, setEmailResult] = useState<any>(null);

  const appQuery = useApp(appId!);
  const sendSmsMutation = useSendMessage();
  const batchesQuery = useMessageBatches(currentPage);
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
    smsCount = messageLength <= 70 ? 1 : Math.ceil(messageLength / 67);
  } else {
    smsCount = messageLength <= 160 ? 1 : Math.ceil(messageLength / 153);
  }

  const recipientCount = smsRecipients
    .split(/[,\n]/)
    .map((p) => p.trim())
    .filter(Boolean).length;
  const estimatedSmsCost = recipientCount * smsCount * (smsPrice || 0);

  function handleSmsSubmit(e: FormEvent) {
    e.preventDefault();

    const newErrors: typeof smsErrors = {};
    const phoneNumbers = smsRecipients
      .split(/[,\n]/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (phoneNumbers.length === 0) {
      newErrors.recipients = "At least one phone number is required";
    }

    const invalidNumbers = phoneNumbers.filter(
      (phone) => !/^\+[1-9]\d{1,14}$/.test(phone)
    );
    if (invalidNumbers.length > 0) {
      newErrors.recipients = `Phone numbers must include country code (e.g., +250788123456). Invalid: ${invalidNumbers.join(', ')}`;
    }

    if (!message.trim()) {
      newErrors.message = "Message is required";
    }

    if (!senderId.trim()) {
      newErrors.senderId = "Sender ID is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setSmsErrors(newErrors);
      return;
    }

    sendSmsMutation.mutate(
      {
        to: phoneNumbers,
        message: message.trim(),
        from: senderId.trim(),
      },
      {
        onSuccess: (batch: any) => {
          const successCount = batch.successCount ?? batch.totalMessages;
          showToast({
            title: "Messages sent successfully",
            description: `${successCount} of ${batch.totalMessages} messages ${batch.status === 'SENT' ? 'sent' : 'queued'}`,
            variant: "success",
          });
          setSmsRecipients("");
          setMessage("");
          setSenderId("");
          setSmsErrors({});
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

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailLoading(true);
    setEmailResult(null);

    try {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "your-api-key",
        },
        body: JSON.stringify({
          to: [{ email: emailTo }],
          from: emailFrom,
          subject: emailSubject,
          html: emailHtml,
        }),
      });

      const data = await response.json();
      setEmailResult(data);
      showToast({
        title: "Email sent successfully",
        description: data.totalEmails ? `${data.totalEmails} email(s) queued` : "Email queued",
        variant: "success",
      });
      setEmailTo("");
      setEmailSubject("");
      setEmailHtml("");
    } catch (error) {
      setEmailResult({ error: "Failed to send email" });
      showToast({
        title: "Failed to send email",
        description: "An error occurred while sending email",
        variant: "danger",
      });
    } finally {
      setEmailLoading(false);
    }
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
  const batches = batchesQuery.data?.batches || [];
  const approvedSenderIds = (senderIdsQuery.data || []).filter(
    (sender: any) => sender.status === "APPROVED"
  );

  return (
    <PageContainer>
      <div className="mb-6">
        <Link
          to="/app/apps"
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
        >
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Apps
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Send {serviceType}</h1>
        <p className="text-sm text-slate-500 mt-1">
          App: {app.name}
        </p>
      </div>

      {/* Service Type Selector */}
      <div className="mb-6">
        <div className="flex rounded-lg bg-slate-100 p-1 w-fit">
          <button
            onClick={() => setServiceType("SMS")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              serviceType === "SMS"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            SMS
          </button>
          <button
            onClick={() => setServiceType("EMAIL")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              serviceType === "EMAIL"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Email
          </button>
        </div>
      </div>

      {serviceType === "SMS" ? (
        /* SMS Form */
        <div className="space-y-6">
          <form onSubmit={handleSmsSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Recipients (phone numbers)
              </label>
              <textarea
                value={smsRecipients}
                onChange={(e) => setSmsRecipients(e.target.value)}
                placeholder="+250788123456, +250788123457"
                className={`w-full p-3 border rounded-lg ${
                  smsErrors.recipients ? "border-red-500" : "border-slate-300"
                }`}
                rows={3}
              />
              {smsErrors.recipients && (
                <p className="mt-1 text-sm text-red-600">{smsErrors.recipients}</p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Separate multiple numbers with commas or new lines. Include country code (e.g., +250)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sender ID
              </label>
              <select
                value={senderId}
                onChange={(e) => setSenderId(e.target.value)}
                className={`w-full p-3 border rounded-lg ${
                  smsErrors.senderId ? "border-red-500" : "border-slate-300"
                }`}
              >
                <option value="">Select sender ID</option>
                {approvedSenderIds.map((sender: any) => (
                  <option key={sender.id} value={sender.senderId}>
                    {sender.senderId}
                  </option>
                ))}
              </select>
              {smsErrors.senderId && (
                <p className="mt-1 text-sm text-red-600">{smsErrors.senderId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message here..."
                className={`w-full p-3 border rounded-lg ${
                  smsErrors.message ? "border-red-500" : "border-slate-300"
                }`}
                rows={4}
              />
              {smsErrors.message && (
                <p className="mt-1 text-sm text-red-600">{smsErrors.message}</p>
              )}
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>{messageLength} characters, {smsCount} SMS segment(s)</span>
                <span>
                  {recipientCount} recipient(s) × {smsCount} SMS × {smsPrice || 0} RWF ={" "}
                  {formatMoney(estimatedSmsCost, "RWF")}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={sendSmsMutation.isPending}
              className="w-full"
            >
              {sendSmsMutation.isPending ? "Sending..." : "Send SMS"}
            </Button>
          </form>

          {/* Recent Batches */}
          {batches.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Recent SMS Batches</h3>
              <div className="space-y-2">
                {batches.slice(0, 5).map((batch: any) => {
                  const successCount = batch.successCount ?? 0;
                  const failedCount = batch.failedCount ?? 0;
                  return (
                    <div
                      key={batch.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {batch.totalMessages} messages
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(batch.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-green-600">
                          {successCount} sent
                        </span>
                        {failedCount > 0 && (
                          <span className="text-xs text-red-600">
                            {failedCount} failed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Email Form */
        <div className="space-y-6">
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                From Email
              </label>
              <input
                type="email"
                value={emailFrom}
                onChange={(e) => setEmailFrom(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg"
                placeholder="noreply@yourdomain.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                To (Email)
              </label>
              <input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg"
                placeholder="recipient@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg"
                placeholder="Email subject"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                HTML Body
              </label>
              <textarea
                value={emailHtml}
                onChange={(e) => setEmailHtml(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg h-64"
                placeholder="<h1>Hello</h1><p>Your message here</p>"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={emailLoading}
              className="w-full"
            >
              {emailLoading ? "Sending..." : "Send Email"}
            </Button>
          </form>

          {emailResult && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="font-bold mb-2">Result:</h3>
              <pre className="text-sm overflow-auto">{JSON.stringify(emailResult, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
