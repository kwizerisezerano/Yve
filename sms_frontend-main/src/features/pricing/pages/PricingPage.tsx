import { PageContainer } from "../../../shared/ui/PageContainer";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { Card } from "../../../shared/ui/Card";
import { useSmsPrice } from "../../../shared/hooks/useSystemSettings";
import { calculateSmsCredits } from "../../../shared/lib/sms-credits";

export function PricingPage() {
  const smsPrice = useSmsPrice();

  // Show loading state while fetching price from backend
  if (!smsPrice) {
    return (
      <PageContainer>
        <PageHeader
          title="SMS Pricing"
          description="Simple, transparent pricing with no hidden fees or monthly commitments."
        />
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
            <p className="mt-4 text-sm text-slate-600">Loading pricing information...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const topUpExamples = [
    { amount: 1000, label: "1,000" },
    { amount: 5000, label: "5,000" },
    { amount: 10000, label: "10,000" },
    { amount: 25000, label: "25,000" },
    { amount: 50000, label: "50,000" },
    { amount: 100000, label: "100,000" },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="SMS Pricing"
        description="Simple, transparent pricing with no hidden fees or monthly commitments."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Current Pricing */}
        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Current SMS Price
              </h2>
              <p className="text-sm text-slate-600">
                Pay only for what you use with our straightforward pricing model.
              </p>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-red-200 to-red-500 p-8 text-center text-white">
              <p className="text-sm font-medium text-red-100 mb-2">
                Price per SMS
              </p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold">{smsPrice}</span>
                <span className="text-xl text-red-100">RWF</span>
              </div>
              <p className="mt-4 text-sm text-red-100">
                No monthly fees • No commitments • Credits never expire
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">
                How It Works
              </h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-semibold text-red-700">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Top up your wallet</p>
                    <p className="text-xs text-slate-600">Add funds via Mobile Money (minimum RWF 1,000)</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-semibold text-red-700">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Get SMS credits instantly</p>
                    <p className="text-xs text-slate-600">Your balance converts to SMS credits at {smsPrice} RWF each</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-semibold text-red-700">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Start sending</p>
                    <p className="text-xs text-slate-600">Credits deduct automatically with each message sent</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex gap-3">
                <svg className="h-5 w-5 shrink-0 text-slate-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-slate-700">
                  <p className="font-medium mb-1">Good to know:</p>
                  <ul className="space-y-0.5 text-slate-600">
                    <li>• Your credits never expire</li>
                    <li>• No minimum monthly spend required</li>
                    <li>• Real-time balance updates</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 2: Pricing Calculator */}
        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Pricing Calculator
              </h2>
              <p className="text-sm text-slate-600">
                See how many SMS messages you'll get for different top-up amounts.
              </p>
            </div>

            <div className="space-y-2">
              {topUpExamples.map((example) => {
                const smsCount = calculateSmsCredits(example.amount, smsPrice);
                return (
                  <div
                    key={example.amount}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3.5 transition-colors hover:border-red-200 hover:bg-red-50"
                  >
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-medium text-slate-600">RWF</span>
                      <span className="text-lg font-semibold text-slate-900">
                        {example.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">=</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-red-600">
                          {smsCount.toLocaleString()}
                        </span>
                        <span className="text-xs font-medium text-slate-600">SMS</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="text-sm font-semibold text-red-900 mb-2">
                What's Included
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-xs text-red-800">
                  <svg className="h-4 w-4 shrink-0 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Access to full SMS API and dashboard</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-red-800">
                  <svg className="h-4 w-4 shrink-0 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Custom sender IDs for your brand</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-red-800">
                  <svg className="h-4 w-4 shrink-0 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Real-time delivery reports and analytics</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-red-800">
                  <svg className="h-4 w-4 shrink-0 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Secure payment via Mobile Money</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-red-800">
                  <svg className="h-4 w-4 shrink-0 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Detailed transaction history and ledger</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-red-800">
                  <svg className="h-4 w-4 shrink-0 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Email and webhook notifications</span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs font-medium text-slate-700 mb-1">
                Need higher volumes?
              </p>
              <p className="text-xs text-slate-600">
                Contact us for volume discounts on 100K+ messages per month.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
