'use client';

import type { Metadata } from "next";
import { CheckCircle2, ArrowRight, Mail, Phone, MessageSquare } from 'lucide-react';
import FadeIn from "@/components/FadeIn";
import { useEffect } from 'react';

// Note: Metadata must be exported from a server component
// This file uses 'use client' for animations, but metadata is handled at layout level
// For metadata, see: src/app/layout.tsx

export default function ThankYouPage() {
  useEffect(() => {
    // Track conversion in Google Ads
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        'send_to': 'AW-10808030018/C_EgCM_w55QDELuBnYko'
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50">
      {/* THANK YOU SECTION */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
        </div>

        <div className="relative max-w-2xl w-full mx-auto">
          <FadeIn direction="down" delay={0} duration={800} distance={40} blur={true}>
            <div className="text-center">
              {/* Success Icon */}
              <div className="mb-8 inline-block">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-400 rounded-full blur opacity-50 animate-pulse"></div>
                  <div className="relative bg-white rounded-full p-6 shadow-2xl">
                    <CheckCircle2 className="h-16 w-16 text-emerald-600 animate-bounce" />
                  </div>
                </div>
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                Request Received!
              </h1>

              {/* Subheadline */}
              <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
                Thanks for reaching out. We&apos;ve received your request and our team is reviewing it now.
              </p>

              {/* Confirmation Message */}
              <FadeIn direction="up" delay={200} duration={800} distance={20}>
                <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/80 backdrop-blur-sm p-8 mb-12">
                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                    <div className="text-left">
                      <p className="font-semibold text-slate-900 mb-2">Confirmation email sent</p>
                      <p className="text-gray-700">
                        Check your inbox for a confirmation email with your request details. We&apos;ll be in touch within 24 hours.
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Next Steps */}
              <FadeIn direction="up" delay={300} duration={800} distance={20}>
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-slate-900 mb-8">What Happens Next?</h2>
                  <div className="space-y-6">
                    {[
                      { num: "1", title: "Review", desc: "Our logistics team reviews your request" },
                      { num: "2", title: "Matching", desc: "We match you with verified transporters" },
                      { num: "3", title: "Proposal", desc: "Receive a detailed quote and logistics plan" },
                      { num: "4", title: "Execution", desc: "Seamless coordination and real-time tracking" }
                    ].map((step, index) => (
                      <FadeIn key={index} direction="up" delay={400 + (index * 100)} duration={700} distance={20}>
                        <div className="flex items-center gap-4 text-left">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 text-white font-bold">
                              {step.num}
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{step.title}</p>
                            <p className="text-gray-600">{step.desc}</p>
                          </div>
                        </div>
                      </FadeIn>
                    ))}
                  </div>
                </div>
              </FadeIn>

              {/* Contact Information */}
              <FadeIn direction="up" delay={700} duration={800} distance={20}>
                <div className="rounded-xl border border-gray-200 bg-white p-8 mb-12">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">Have Questions?</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <a href="mailto:info@fleetxchange.com" className="flex items-center gap-3 text-left hover:text-emerald-600 transition-colors duration-300 group">
                      <Mail className="h-6 w-6 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold text-slate-900">info@fleetxchange.com</p>
                      </div>
                    </a>
                    <a href="tel:+27738281478" className="flex items-center gap-3 text-left hover:text-emerald-600 transition-colors duration-300 group">
                      <Phone className="h-6 w-6 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-semibold text-slate-900">+27 (0) 73 828 1478</p>
                      </div>
                    </a>
                  </div>
                </div>
              </FadeIn>

              {/* CTA Buttons */}
              <FadeIn direction="up" delay={800} duration={800} distance={20}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <a href="/">
                    <button className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-lg px-8 py-3 rounded-md shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group">
                      Back to Home
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </a>
                  <a href="/why-choose-us">
                    <button className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white text-lg px-8 py-3 rounded-md transition-all duration-300 hover:scale-105">
                      Learn More About Us
                    </button>
                  </a>
                </div>
              </FadeIn>

              {/* Trust Statement */}
              <FadeIn direction="up" delay={900} duration={800} distance={20}>
                <div className="mt-16 pt-8 border-t border-gray-300">
                  <p className="text-gray-600 text-sm">
                    <span className="font-semibold text-emerald-600">Trusted by logistics businesses</span> across South Africa, Botswana, Zimbabwe, Zambia, and beyond.
                  </p>
                </div>
              </FadeIn>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
