import { useState } from "react";
import { PublicNavbar } from "../../shared/components/PublicNavbar";
import { PublicFooter } from "../../shared/components/PublicFooter";
import {
  AuthModal,
  type AuthMode,
} from "../../features/auth/components/AuthModal";

type DocSection = 'sms-getting-started' | 'sms-api' | 'sms-webhooks' | 'email-getting-started' | 'email-domains' | 'email-api' | 'email-smtp' | 'email-webhooks';

export function ApiDocsPage() {
  const [activeSection, setActiveSection] = useState<DocSection>('sms-getting-started');
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  function openAuth(mode: AuthMode) {
    setAuthMode(mode);
    setAuthOpen(true);
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar
        onLoginClick={() => openAuth("login")}
        onSignupClick={() => openAuth("signup")}
      />
      <div className="max-w-7xl mx-auto px-6 py-12 flex gap-8">
        {/* Vertical Sidebar Navigation */}
        <aside className="w-64 flex-shrink-0">
          <nav className="sticky top-8">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">SMS</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setActiveSection('sms-getting-started')}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      activeSection === 'sms-getting-started'
                        ? "bg-[rgba(200,16,46)] text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Getting Started
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection('sms-api')}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      activeSection === 'sms-api'
                        ? "bg-[rgba(200,16,46)] text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    SMS API
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection('sms-webhooks')}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      activeSection === 'sms-webhooks'
                        ? "bg-[rgba(200,16,46)] text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Webhooks
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Email</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setActiveSection('email-getting-started')}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      activeSection === 'email-getting-started'
                        ? "bg-[rgba(200,16,46)] text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Getting Started
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection('email-domains')}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      activeSection === 'email-domains'
                        ? "bg-[rgba(200,16,46)] text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Domains
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection('email-api')}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      activeSection === 'email-api'
                        ? "bg-[rgba(200,16,46)] text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Email API
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection('email-smtp')}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      activeSection === 'email-smtp'
                        ? "bg-[rgba(200,16,46)] text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    SMTP
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection('email-webhooks')}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      activeSection === 'email-webhooks'
                        ? "bg-[rgba(200,16,46)] text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Webhooks
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {activeSection === 'sms-getting-started' && (
            <div className="space-y-8">
              <h1 className="text-4xl font-bold mb-4">SMS Getting Started</h1>
              <p className="text-lg text-slate-600 mb-8">
                Get started with Notify SMS service. This page will guide you through setting up your account, adding API keys, and sending your first SMS message.
              </p>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Console</h2>
                <p className="text-slate-600 mb-4">
                  Console is where you can manage your projects, API keys, and view SMS analytics. Upon first login, you'll be prompted to create a project to begin.
                </p>
              </section>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Project</h2>
                <p className="text-slate-600 mb-4">
                  A project is an organizational unit that contains API keys, settings, and other configurations. One account can have multiple projects. Generally, you would create a project for each application you want to send SMS from.
                </p>
              </section>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">API Keys</h2>
                <p className="text-slate-600 mb-4">
                  To send SMS messages, you need to create an API key. Go to <strong>Console → API Keys</strong> and create an API key with the <strong>sms.send</strong> scope. Make sure to store the key securely, as it will not be shown again.
                </p>
              </section>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Send Your First SMS</h2>
                <p className="text-slate-600 mb-4">
                  Once you have a project and an API key, you can start sending SMS messages. Visit the <strong>SMS API</strong> documentation page for detailed guides on how to send SMS using the API.
                </p>
              </section>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">View Logs</h2>
                <p className="text-slate-600 mb-4">
                  At <strong>Console → Logs</strong>, you can view the logs of the SMS messages you send. The overview section shows the key details of each send and delivery status.
                </p>
              </section>
            </div>
          )}

          {activeSection === 'sms-api' && (
            <div className="space-y-8">
              <h1 className="text-4xl font-bold mb-4">SMS API</h1>
              <p className="text-lg text-slate-600 mb-8">
                Complete API reference for sending SMS messages via Notify.
              </p>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">API Usage</h2>
                <ul className="list-disc list-inside space-y-2 text-slate-600">
                  <li><strong>API URL:</strong> <code>https://api.notify.com/v1</code></li>
                  <li><strong>Content-Type:</strong> <code>application/json</code></li>
                  <li><strong>Authentication:</strong> <code>X-API-Key: your-api-key</code></li>
                </ul>
              </section>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Send SMS</h2>
                <p className="text-slate-600 mb-4">
                  <strong>Endpoint:</strong> <code>POST /sms/send</code> (scope: <strong>sms.send</strong>)
                </p>
                <pre className="bg-slate-800 text-slate-200 p-4 rounded overflow-auto mb-4">
{`{
  "to": ["+250788123456", "+250788123457"],
  "from": "Notify",
  "message": "Hello from Notify! Your verification code is 123456.",
  "encoding": "GSM7"
}`}
                </pre>
                <pre className="bg-slate-800 text-slate-200 p-4 rounded overflow-auto">
{`{
  "batchId": "batch_1234567890_abc123",
  "totalMessages": 2,
  "totalCost": 30,
  "smsCost": 15,
  "status": "SENT",
  "messages": [...]
}`}
                </pre>
              </section>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Get SMS Batches</h2>
                <p className="text-slate-600 mb-4">
                  <strong>Endpoint:</strong> <code>GET /sms/batches</code> (scope: <strong>sms.read</strong>)
                </p>
              </section>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Rate Limiting</h2>
                <p className="text-slate-600 mb-4">
                  The rate limit for SMS sending is <strong>50 requests per second</strong> (per API key).
                </p>
              </section>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Limits</h2>
                <ul className="list-disc list-inside space-y-2 text-slate-600">
                  <li><strong>Recipients per request:</strong> 100 phone numbers maximum</li>
                  <li><strong>Message length:</strong> 1600 characters maximum (GSM7) or 1400 characters (UCS2)</li>
                  <li><strong>Sender ID:</strong> 11 characters maximum (alphanumeric)</li>
                </ul>
              </section>
            </div>
          )}

          {activeSection === 'sms-webhooks' && (
            <div className="space-y-8">
              <h1 className="text-4xl font-bold mb-4">SMS Webhooks</h1>
              <p className="text-lg text-slate-600 mb-8">
                Receive real-time delivery status updates for your SMS messages.
              </p>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">SMS Webhook Events</h2>
                <ul className="list-disc list-inside space-y-2 text-slate-600 mb-4">
                  <li><code>sms.sent</code> - SMS was sent successfully</li>
                  <li><code>sms.delivered</code> - SMS was delivered to the recipient</li>
                  <li><code>sms.failed</code> - SMS delivery failed</li>
                </ul>
              </section>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Webhook Payload Example</h2>
                <pre className="bg-slate-800 text-slate-200 p-4 rounded overflow-auto">
{`{
  "event": "sms.delivered",
  "timestamp": "2024-01-15T10:35:00Z",
  "data": {
    "messageId": "msg_001",
    "batchId": "batch_1234567890_abc123",
    "to": "+250788123456",
    "from": "Notify",
    "status": "delivered",
    "deliveredAt": "2024-01-15T10:35:00Z"
  }
}`}
                </pre>
              </section>
            </div>
          )}

          {activeSection === 'email-getting-started' && (
            <div className="space-y-8">
              <h1 className="text-4xl font-bold mb-4">Email Getting Started</h1>
              <p className="text-lg text-slate-600 mb-8">
                Get started with Notify Email service. This page will guide you through setting up your account, verifying domains, and sending your first email.
              </p>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Console</h2>
                <p className="text-slate-600 mb-4">
                  Console is where you can manage your projects, API keys, domains, and view email analytics. Upon first login, you'll be prompted to create a project to begin.
                </p>
              </section>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Project</h2>
                <p className="text-slate-600 mb-4">
                  A project is an organizational unit that contains API keys, domains, and other configurations. One account can have multiple projects. Generally, you would create a project for each application you want to send emails from.
                </p>
              </section>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">API Keys</h2>
                <p className="text-slate-600 mb-4">
                  To send emails, you need to create an API key. Go to <strong>Console → API Keys</strong> and create an API key with the <strong>email.send</strong> scope. Make sure to store the key securely, as it will not be shown again.
                </p>
              </section>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Domain Verification</h2>
                <p className="text-slate-600 mb-4">
                  Before sending emails, you need to verify your domain. Visit the <strong>Domains</strong> documentation page for detailed instructions on domain verification and DKIM configuration.
                </p>
              </section>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Send Your First Email</h2>
                <p className="text-slate-600 mb-4">
                  Once you have a project, API key, and verified domain, you can start sending emails. Visit the <strong>Email API</strong> documentation page for detailed guides on how to send emails using the API.
                </p>
              </section>
            </div>
          )}

          {activeSection === 'email-domains' && (
            <div className="space-y-8">
              <h1 className="text-4xl font-bold mb-4">Domains</h1>
              <p className="text-lg text-slate-600 mb-8">
                To send emails, you need to add a domain to your project. This page explains how to verify your domain and configure DNS settings.
              </p>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Adding a Domain</h2>
                <p className="text-slate-600 mb-4">
                  Go to <strong>Console → Domains</strong> and add a domain. You will be asked to add a TXT record to your domain's DNS settings to verify ownership.
                </p>
              </section>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Domain Verification</h2>
                <p className="text-slate-600 mb-4">
                  After adding the TXT record to your DNS, click "Verify" in the Console. The verification process may take a few minutes to propagate.
                </p>
              </section>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">DKIM</h2>
                <p className="text-slate-600 mb-4">
                  DKIM (DomainKeys Identified Mail) is automatically configured when you add a domain. The system generates DKIM keys and provides the DNS records you need to add to your domain.
                </p>
              </section>
            </div>
          )}

          {activeSection === 'email-api' && (
            <div className="space-y-8">
              <h1 className="text-4xl font-bold mb-4">Email API</h1>
              <p className="text-lg text-slate-600 mb-8">
                Complete API reference for sending emails via Notify.
              </p>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">API Usage</h2>
                <ul className="list-disc list-inside space-y-2 text-slate-600">
                  <li><strong>API URL:</strong> <code>https://api.notify.com/v1</code></li>
                  <li><strong>Content-Type:</strong> <code>application/json</code></li>
                  <li><strong>Authentication:</strong> <code>X-API-Key: your-api-key</code></li>
                </ul>
              </section>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Send Email</h2>
                <p className="text-slate-600 mb-4">
                  <strong>Endpoint:</strong> <code>POST /email/send</code> (scope: <strong>email.send</strong>)
                </p>
                <pre className="bg-slate-800 text-slate-200 p-4 rounded overflow-auto mb-4">
{`{
  "to": [{"email": "user@example.com", "name": "John Doe"}],
  "from": "noreply@yourdomain.com",
  "subject": "Welcome to Notify",
  "html": "<h1>Hello!</h1><p>Welcome to Notify.</p>",
  "text": "Hello! Welcome to Notify."
}`}
                </pre>
                <pre className="bg-slate-800 text-slate-200 p-4 rounded overflow-auto">
{`{
  "batchId": "email_batch_1234567890_abc123",
  "totalEmails": 1,
  "totalCost": 5,
  "emailCost": 5,
  "status": "SENT",
  "emails": [...]
}`}
                </pre>
              </section>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Get Email Batches</h2>
                <p className="text-slate-600 mb-4">
                  <strong>Endpoint:</strong> <code>GET /email/batches</code> (scope: <strong>email.read</strong>)
                </p>
              </section>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Rate Limiting</h2>
                <p className="text-slate-600 mb-4">
                  The rate limit for email sending is <strong>10 requests per second</strong> (per API key).
                </p>
              </section>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Limits</h2>
                <ul className="list-disc list-inside space-y-2 text-slate-600">
                  <li><strong>Recipients per request:</strong> 20 email addresses maximum</li>
                  <li><strong>Total email size:</strong> 10MB maximum</li>
                  <li><strong>HTML body size:</strong> 2MB maximum</li>
                  <li><strong>Plain text body size:</strong> 2MB maximum</li>
                  <li><strong>Subject length:</strong> 998 characters maximum</li>
                  <li><strong>Attachments:</strong> 10 attachments maximum per email</li>
                </ul>
              </section>
            </div>
          )}

          {activeSection === 'email-smtp' && (
            <div className="space-y-8">
              <h1 className="text-4xl font-bold mb-4">SMTP</h1>
              <p className="text-lg text-slate-600 mb-8">
                Send emails using SMTP. This is useful if you want to use existing email clients or integrate with applications that support SMTP.
              </p>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">SMTP Configuration</h2>
                <p className="text-slate-600 mb-4">
                  <strong>Host:</strong> smtp.notify.com<br />
                  <strong>Port:</strong> 587 (TLS)<br />
                  <strong>Username:</strong> Your API key<br />
                  <strong>Password:</strong> Your API key secret
                </p>
              </section>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Example Configuration</h2>
                <pre className="bg-slate-800 text-slate-200 p-4 rounded overflow-auto">
{`// Nodemailer example
const transporter = nodemailer.createTransport({
  host: 'smtp.notify.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-api-key',
    pass: 'your-api-secret'
  }
});`}
                </pre>
              </section>
            </div>
          )}

          {activeSection === 'email-webhooks' && (
            <div className="space-y-8">
              <h1 className="text-4xl font-bold mb-4">Email Webhooks</h1>
              <p className="text-lg text-slate-600 mb-8">
                Receive real-time delivery status updates for your emails.
              </p>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Email Webhook Events</h2>
                <ul className="list-disc list-inside space-y-2 text-slate-600 mb-4">
                  <li><code>email.sent</code> - Email was sent successfully</li>
                  <li><code>email.delivered</code> - Email was delivered to recipient's inbox</li>
                  <li><code>email.opened</code> - Recipient opened the email</li>
                  <li><code>email.clicked</code> - Recipient clicked a link in the email</li>
                  <li><code>email.bounced</code> - Email bounced (hard or soft bounce)</li>
                  <li><code>email.failed</code> - Email delivery failed</li>
                </ul>
              </section>

              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Webhook Payload Example</h2>
                <pre className="bg-slate-800 text-slate-200 p-4 rounded overflow-auto">
{`{
  "event": "email.delivered",
  "timestamp": "2024-01-15T10:35:00Z",
  "data": {
    "emailId": "email_001",
    "batchId": "email_batch_1234567890_abc123",
    "to": "user@example.com",
    "from": "noreply@yourdomain.com",
    "subject": "Welcome to Notify",
    "status": "delivered",
    "deliveredAt": "2024-01-15T10:35:00Z"
  }
}`}
                </pre>
              </section>
            </div>
          )}
        </main>
      </div>
      <PublicFooter />
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
