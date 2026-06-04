"use client";

import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="#" className="text-xl font-bold text-indigo-600">
          Taskmate
        </a>

        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
          >
            Pricing
          </a>
          <a
            href="#faq"
            className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
          >
            FAQ
          </a>
          <a
            href="#"
            className="bg-indigo-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            無料で始める
          </a>
        </nav>

        <button
          className="md:hidden p-2 text-gray-500"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="メニュー"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-4">
          <a href="#features" className="text-sm text-gray-600" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#pricing" className="text-sm text-gray-600" onClick={() => setMenuOpen(false)}>Pricing</a>
          <a href="#faq" className="text-sm text-gray-600" onClick={() => setMenuOpen(false)}>FAQ</a>
          <a
            href="#"
            className="bg-indigo-600 text-white text-sm px-5 py-2 rounded-lg text-center"
            onClick={() => setMenuOpen(false)}
          >
            無料で始める
          </a>
        </div>
      )}
    </header>
  );
}
