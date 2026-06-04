import { serviceInfo } from "@/data/service";

const highlights = ["Free", "Standard", "Business"];
const recommended = "Standard";

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">
          チームの規模に合わせて選べる料金プラン
        </h2>
        <p className="text-gray-500 text-center mb-14 text-sm">
          Standard / Businessプランは14日間無料でお試しいただけます。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {serviceInfo.pricing.map((plan) => {
            const isRecommended = plan.name === recommended;
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-7 flex flex-col ${
                  isRecommended
                    ? "border-indigo-500 shadow-lg ring-1 ring-indigo-500"
                    : "border-gray-200"
                }`}
              >
                {isRecommended && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    おすすめ
                  </span>
                )}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-indigo-600 mb-1">{plan.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{plan.price}</p>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                </div>
                <ul className="space-y-2.5 flex-1 mb-7">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href="#"
                  className={`text-center text-sm font-medium py-2.5 rounded-lg transition-colors ${
                    isRecommended
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {plan.name === "Free" ? "無料で始める" : "14日間無料で試す"}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
