"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { FiArrowRight, FiCheck, FiStar, FiCode, FiShare2, FiShield } from "react-icons/fi";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
            <span className="text-yellow-500">&#9733;</span> ReviewHub
          </h1>
          <div className="flex items-center gap-4">
            {session ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-5 py-2.5 text-gray-700 font-medium hover:text-indigo-600 transition-all">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-indigo-50 py-20 lg:py-32">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-40 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-40 w-80 h-80 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
            <FiShield className="w-4 h-4" /> Trusted by 1,000+ businesses
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight">
            Collect & Display<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Customer Reviews
            </span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Build trust with verified customer reviews. Create beautiful review forms, collect feedback, and display testimonials on your website with embeddable widgets.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center gap-2"
            >
              Start Collecting Reviews <FiArrowRight />
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><FiCheck className="text-green-500" /> Free to start</span>
            <span className="flex items-center gap-1.5"><FiCheck className="text-green-500" /> No credit card</span>
            <span className="flex items-center gap-1.5"><FiCheck className="text-green-500" /> Embed anywhere</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Everything you need to manage reviews</h2>
            <p className="mt-4 text-lg text-gray-500">Simple, powerful tools to collect, manage, and display customer reviews</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <FiStar className="w-7 h-7" />,
                title: "Custom Review Forms",
                desc: "Create branded review forms with your logo, colors, and custom fields. Share via link or embed on your site.",
              },
              {
                icon: <FiCode className="w-7 h-7" />,
                title: "Embeddable Widgets",
                desc: "Display reviews on your website with popup, button, or chatbot-style widgets. Full customization included.",
              },
              {
                icon: <FiShare2 className="w-7 h-7" />,
                title: "Multiple Share Options",
                desc: "Share review forms via direct links, embed as buttons, or use popup widgets on your website.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50 transition-all group"
              >
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to build trust with your customers?</h2>
          <p className="text-xl text-indigo-200 mb-10">
            Join thousands of businesses using ReviewHub to collect and display verified reviews.
          </p>
          <Link
            href="/register"
            className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-semibold text-lg hover:bg-gray-50 transition-all shadow-xl inline-flex items-center gap-2"
          >
            Get Started Free <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2 mb-4">
            <span className="text-yellow-500">&#9733;</span> ReviewHub
          </h3>
          <p className="text-sm">&copy; 2024 ReviewHub. Professional customer review management platform.</p>
        </div>
      </footer>
    </div>
  );
}
