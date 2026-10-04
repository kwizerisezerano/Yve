import { useState } from "react";

interface PricingSectionProps {
  onGetStarted: () => void;
}

export function PricingSection({ onGetStarted }: PricingSectionProps) {
  const [serviceType, setServiceType] = useState<"SMS" | "Email">("SMS");

  const smsPlans = [
    {
      name: "Starter",
      price: "$0.05",
      unit: "per SMS",
      description: "Perfect for small businesses and startups",
      features: [
        "Pay as you go pricing",
        "No monthly fees",
        "Basic SMS API",
        "Email support",
        "99.5% uptime SLA",
        "Basic analytics",
        "Minimum top-up: $10",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Business",
      price: "$0.03",
      unit: "per SMS",
      description: "For growing businesses with higher volume",
      features: [
        "Volume discount pricing",
        "All SMS features",
        "Priority support",
        "99.9% uptime SLA",
        "Advanced analytics",
        "Custom sender ID",
        "Webhooks & API",
        "Dedicated account manager",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      unit: "pricing",
      description: "For large organizations with custom needs",
      features: [
        "Best rates per SMS",
        "Dedicated infrastructure",
        "24/7 phone support",
        "99.99% uptime SLA",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantees",
        "Volume discounts",
        "Custom contracts",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  const emailPlans = [
    {
      name: "Starter",
      price: "$0.01",
      unit: "per email",
      description: "Perfect for small businesses and startups",
      features: [
        "Pay as you go pricing",
        "No monthly fees",
        "Basic Email API",
        "Email support",
        "99.5% uptime SLA",
        "Basic analytics",
        "Email templates",
        "Minimum top-up: $10",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Business",
      price: "$0.005",
      unit: "per email",
      description: "For growing businesses with higher volume",
      features: [
        "Volume discount pricing",
        "All Email features",
        "Priority support",
        "99.9% uptime SLA",
        "Advanced analytics",
        "Custom templates",
        "Webhooks & API",
        "Dedicated account manager",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      unit: "pricing",
      description: "For large organizations with custom needs",
      features: [
        "Best rates per email",
        "Dedicated infrastructure",
        "24/7 phone support",
        "99.99% uptime SLA",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantees",
        "Volume discounts",
        "Custom contracts",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  const plans = serviceType === "SMS" ? smsPlans : emailPlans;

  return (
    <section id="pricing" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[rgba(200,16,46)]/10 px-4 py-2 text-sm font-semibold text-[rgba(200,16,46)]">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
            Pricing Plans
          </div>
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Choose the perfect plan for your business. All plans include a 14-day free trial.
          </p>

          {/* Service Type Toggle */}
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setServiceType("SMS")}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                serviceType === "SMS"
                  ? "bg-[rgba(200,16,46)] text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              SMS Pricing
            </button>
            <button
              onClick={() => setServiceType("Email")}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                serviceType === "Email"
                  ? "bg-[rgba(200,16,46)] text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Email Pricing
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border-2 p-8 ${
                plan.popular
                  ? "border-[rgba(200,16,46)] shadow-xl"
                  : "border-slate-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[rgba(200,16,46)] px-4 py-1 text-sm font-semibold text-white">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900">
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-slate-900">
                    {plan.price}
                  </span>
                  <span className="text-lg text-slate-600">/{plan.unit}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {plan.description}
                </p>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-[rgba(200,16,46)]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => {
                  if (plan.cta === "Contact Sales") {
                    window.location.href = "mailto:sales@ingoga.com";
                  } else {
                    onGetStarted();
                  }
                }}
                className={`mt-8 w-full rounded-lg px-6 py-3 text-base font-semibold transition-colors ${
                  plan.popular
                    ? "bg-[rgba(200,16,46)] text-white hover:bg-[rgba(180,14,41)]"
                    : "border-2 border-slate-300 bg-white text-slate-900 hover:border-[rgba(200,16,46)] hover:text-[rgba(200,16,46)]"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Pay As You Go */}
        <div className="mt-12 rounded-xl border border-slate-200 bg-gradient-to-r from-gray-50 to-white p-8 text-center">
          <h3 className="text-xl font-bold text-slate-900">
            Volume Discounts Available
          </h3>
          <p className="mt-2 text-slate-600">
            The more you send, the less you pay. Get better rates with higher volumes starting from 100,000 {serviceType.toLowerCase()} per month.
          </p>
          <button
            type="button"
            onClick={() => window.location.href = "mailto:sales@notify.com"}
            className="mt-4 rounded-lg border-2 border-[rgba(200,16,46)] px-6 py-2.5 text-sm font-semibold text-[rgba(200,16,46)] transition-colors hover:bg-red-50"
          >
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  );
}
