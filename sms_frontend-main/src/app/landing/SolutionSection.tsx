interface SolutionSectionProps {
  onGetStarted: () => void;
}

export function SolutionSection({ onGetStarted }: SolutionSectionProps) {
  const solutions = [
    {
      title: "E-Commerce",
      description: "Order confirmations, shipping updates, and abandoned cart recovery via SMS",
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      features: ["Order notifications", "Delivery tracking", "Customer support"],
    },
    {
      title: "Finance & Banking",
      description: "Transaction alerts, fraud prevention, and two-factor authentication",
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      features: ["2FA security", "Balance alerts", "Payment confirmations"],
    },
    {
      title: "Healthcare",
      description: "Appointment reminders, test results, and patient communication",
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      features: ["Appointment reminders", "Prescription alerts", "Health tips"],
    },
    {
      title: "Education",
      description: "Student notifications, attendance alerts, and exam schedules",
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      features: ["Assignment reminders", "Grade notifications", "Event alerts"],
    },
    {
      title: "Logistics & Delivery",
      description: "Real-time tracking, driver updates, and delivery confirmations",
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
      features: ["Shipment tracking", "Delivery ETA", "Driver communication"],
    },
    {
      title: "Marketing & CRM",
      description: "Promotional campaigns, customer engagement, and loyalty programs",
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
      features: ["Bulk campaigns", "Segmentation", "Analytics"],
    },
  ];

  return (
    <section id="solution" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[rgba(200,16,46)]/10 px-4 py-2 text-sm font-semibold text-[rgba(200,16,46)]">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            Industry Solutions
          </div>
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
            Built for Your Industry
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Tailored communication solutions that meet the unique needs of your business sector
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((solution) => (
            <div
              key={solution.title}
              className="group rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-[rgba(200,16,46)] hover:shadow-lg"
            >
              <div className="mb-4 inline-flex rounded-lg bg-[rgba(200,16,46)]/10 p-3 text-[rgba(200,16,46)] transition-colors group-hover:bg-[rgba(200,16,46)] group-hover:text-white">
                {solution.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {solution.title}
              </h3>
              <p className="mt-3 text-sm text-slate-600">
                {solution.description}
              </p>
              <ul className="mt-4 space-y-2">
                {solution.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                    <svg className="h-4 w-4 flex-shrink-0 text-[rgba(200,16,46)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={onGetStarted}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[rgba(200,16,46)] transition-colors hover:text-[rgba(180,14,41)]"
              >
                Get Started
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 gap-8 lg:grid-cols-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-[rgba(200,16,46)]">99.9%</div>
            <div className="mt-2 text-sm text-slate-600">Uptime SLA</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[rgba(200,16,46)]">190+</div>
            <div className="mt-2 text-sm text-slate-600">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[rgba(200,16,46)]">5B+</div>
            <div className="mt-2 text-sm text-slate-600">Messages Sent</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[rgba(200,16,46)]">10K+</div>
            <div className="mt-2 text-sm text-slate-600">Active Customers</div>
          </div>
        </div>
      </div>
    </section>
  );
}
