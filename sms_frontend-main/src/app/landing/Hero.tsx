interface HeroProps {
  onTryForFreeClick: () => void;
}

export function Hero({ onTryForFreeClick }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large circle blur effect top left */}
        <div className="absolute -left-32 top-0 h-[500px] w-[500px] rounded-full bg-[rgba(200,16,46)]/10 blur-3xl" />
        {/* Large circle blur effect bottom right */}
        <div className="absolute -right-32 bottom-0 h-[500px] w-[500px] rounded-full bg-[rgba(200,16,46)]/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left content */}
          <div className="z-10 space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(200,16,46)]/10 px-4 py-2 text-sm font-semibold text-[rgba(200,16,46)]">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Your Unified Communication Platform
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-bold leading-[1.15] text-slate-900 sm:text-5xl lg:text-6xl">
              Send SMS & Email to{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Customers</span>
                <span className="absolute bottom-2 left-0 -z-0 h-3 w-full bg-[rgba(200,16,46)]/30" />
              </span>{" "}
              Worldwide
            </h1>

            {/* Description */}
            <p className="max-w-xl text-base leading-relaxed text-slate-600 lg:text-lg">
              Reach customers instantly with our unified SMS and Email API. Send OTPs, 
              notifications, alerts, and marketing messages through a reliable 
              platform with 99.9% uptime. Pay only for what you use with wallet-based billing.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={onTryForFreeClick}
                className="rounded-lg bg-[rgba(200,16,46)] px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-[rgba(180,14,41)] hover:shadow-xl"
              >
                Get Started Free
              </button>
              <button
                type="button"
                className="rounded-lg border-2 border-slate-300 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 transition-all hover:border-[rgba(200,16,46)] hover:text-[rgba(200,16,46)]"
                onClick={() => {
                  const pricingSection = document.querySelector('#pricing');
                  if (pricingSection) {
                    pricingSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                View Pricing
              </button>
            </div>

            {/* Features badges */}
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="h-5 w-5 text-[rgba(200,16,46)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">No Setup Fees</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="h-5 w-5 text-[rgba(200,16,46)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Pay As You Go</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="h-5 w-5 text-[rgba(200,16,46)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Right side - Hero image */}
          <div className="relative z-10 -mt-36 flex items-center justify-center lg:justify-end">
            <div className="relative w-full">
              {/* Floating decoration elements */}
              <div className="absolute -right-4 top-10 hidden h-16 w-16 animate-bounce rounded-lg bg-[rgba(200,16,46)]/20 blur-xl lg:block" style={{ animationDuration: '3s' }} />
              <div className="absolute -left-4 bottom-20 hidden h-12 w-12 animate-bounce rounded-lg bg-slate-500/20 blur-xl delay-75 lg:block" style={{ animationDuration: '4s' }} />
              
              <img
                src="/image2.png.png"
                alt="SMS Gateway Platform Interface"
                className="relative h-auto w-full drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
