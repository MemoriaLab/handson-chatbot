"use client";

import { useState } from "react";
import { faqs } from "@/data/faq";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">
          よくある質問
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-left"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="font-medium text-gray-800 text-sm leading-snug pr-4">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
