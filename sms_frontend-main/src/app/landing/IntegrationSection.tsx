interface IntegrationSectionProps {
  onGetStarted: () => void;
}

export function IntegrationSection({ onGetStarted }: IntegrationSectionProps) {
  const integrations = [
    { name: "Python", logo: "🐍" },
    { name: "Node.js", logo: "🟢" },
    { name: "PHP", logo: "🐘" },
    { name: "Java", logo: "☕" },
    { name: "Ruby", logo: "💎" },
    { name: "C#", logo: "#️⃣" },
    { name: "Go", logo: "🔵" },
    { name: "REST API", logo: "🔌" },
  ];

  return (
    <section id="integration" className="bg-gradient-to-b from-gray-50 to-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[rgba(200,16,46)]/10 px-4 py-2 text-sm font-semibold text-[rgba(200,16,46)]">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Easy Integration
            </div>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
              Integrate in Minutes, Not Days
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Our developer-friendly APIs work with any programming language. Get started quickly with comprehensive documentation and code examples.
            </p>
            
            <ul className="mt-8 space-y-4">
              <li className="flex items-start gap-3">
                <svg className="mt-1 h-5 w-5 flex-shrink-0 text-[rgba(200,16,46)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold text-slate-900">RESTful API</p>
                  <p className="text-sm text-slate-600">Simple HTTP requests with JSON responses</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg className="mt-1 h-5 w-5 flex-shrink-0 text-[rgba(200,16,46)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold text-slate-900">SDK Libraries</p>
                  <p className="text-sm text-slate-600">Official libraries for popular languages</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg className="mt-1 h-5 w-5 flex-shrink-0 text-[rgba(200,16,46)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold text-slate-900">Webhooks</p>
                  <p className="text-sm text-slate-600">Real-time delivery status updates</p>
                </div>
              </li>
            </ul>

            <button
              type="button"
              onClick={onGetStarted}
              className="mt-8 rounded-lg bg-[rgba(200,16,46)] px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[rgba(180,14,41)]"
            >
              Get Started
            </button>
          </div>

          {/* Right Content - Code Example */}
          <div className="relative">
            <div className="rounded-xl border border-slate-200 bg-slate-900 p-6 shadow-2xl">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-slate-500" />
                <span className="ml-4 text-sm text-slate-400">send_sms.py</span>
              </div>
              <pre className="overflow-x-auto text-sm">
                <code className="text-gray-300">
{`import requests

url = "https://api.ingoga.com/v1/sms"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

payload = {
    "to": "+1234567890",
    "message": "Hello from Ingoga!",
    "from": "YourBrand"
}

response = requests.post(
    url, 
    json=payload, 
    headers=headers
)

print(response.json())`}
                </code>
              </pre>
            </div>

            {/* Language badges */}
            <div className="mt-6 flex flex-wrap gap-3">
              {integrations.map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
                >
                  <span className="text-lg">{integration.logo}</span>
                  {integration.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
