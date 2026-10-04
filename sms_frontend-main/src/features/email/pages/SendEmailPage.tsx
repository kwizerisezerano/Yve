import { useState } from "react";

export function SendEmailPage() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "your-api-key", // Replace with actual API key
        },
        body: JSON.stringify({
          to: [{ email: to }],
          from: "noreply@yourdomain.com",
          subject,
          html,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: "Failed to send email" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Send Email</h1>

      <form onSubmit={sendEmail} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">To (Email)</label>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="recipient@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="Email subject"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">HTML Body</label>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            className="w-full p-3 border rounded-lg h-64"
            placeholder="<h1>Hello</h1><p>Your message here</p>"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-[rgba(200,16,46)] text-white px-6 py-3 rounded-lg hover:bg-[rgba(180,14,41)] disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Email"}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <h3 className="font-bold mb-2">Result:</h3>
          <pre className="text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
