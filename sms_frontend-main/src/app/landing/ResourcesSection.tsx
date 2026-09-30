interface ResourcesSectionProps {
  onGetStarted: () => void;
}

export function ResourcesSection({ onGetStarted }: ResourcesSectionProps) {
  const resources = [
    {
      category: "Documentation",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: "API Documentation",
      description: "Comprehensive guides for all our APIs with code examples",
      link: "Browse Docs",
    },
    {
      category: "Tutorials",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      title: "Video Tutorials",
      description: "Step-by-step video guides to get you started quickly",
      link: "Watch Now",
    },
    {
      category: "Blog",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      title: "Technical Blog",
      description: "Best practices, tips, and industry insights",
      link: "Read Articles",
    },
    {
      category: "Support",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: "24/7 Support",
      description: "Get help from our expert support team anytime",
      link: "Contact Support",
    },
  ];

  return (
    <section id="resources" className="bg-gradient-to-b from-gray-50 to-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[rgba(200,16,46)]/10 px-4 py-2 text-sm font-semibold text-[rgba(200,16,46)]">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Resources
          </div>
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
            Everything You Need to Succeed
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Access comprehensive documentation, tutorials, and support to help you build amazing communication solutions
          </p>
        </div>

        {/* Resources Grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {resources.map((resource) => (
            <div
              key={resource.title}
              className="group rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-[rgba(200,16,46)] hover:shadow-lg"
            >
              <div className="mb-4 inline-flex rounded-lg bg-[rgba(200,16,46)]/10 p-3 text-[rgba(200,16,46)] transition-colors group-hover:bg-[rgba(200,16,46)] group-hover:text-white">
                {resource.icon}
              </div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {resource.category}
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {resource.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {resource.description}
              </p>
              <button
                type="button"
                onClick={onGetStarted}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[rgba(200,16,46)] transition-colors hover:text-[rgba(180,14,41)]"
              >
                {resource.link}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-16 rounded-2xl bg-gradient-to-r from-[rgba(200,16,46)] to-[rgba(180,14,41)] p-8 text-center text-white lg:p-12">
          <h3 className="text-2xl font-bold lg:text-3xl">
            Ready to Get Started?
          </h3>
          <p className="mt-3 text-lg opacity-90">
            Join thousands of developers building with our platform
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={onGetStarted}
              className="rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-[rgba(200,16,46)] transition-colors hover:bg-gray-100"
            >
              Create Free Account
            </button>
            <button
              type="button"
              onClick={() => window.location.href = "mailto:sales@ingoga.com"}
              className="rounded-lg border-2 border-white bg-transparent px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
