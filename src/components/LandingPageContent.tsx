'use client';

import { Phone, MessageCircle, CheckCircle2, Clock, Truck, Shield, MapPin, Globe } from 'lucide-react';
import { useState, useRef } from 'react';
import Image from 'next/image';
import FadeIn from "@/components/FadeIn";

export default function LandingPageContent() {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white pb-16 md:pb-0">
      {/* MINIMAL HEADER - Matching website style */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <Image src="/images/logo.png" alt="FleetXchange" width={180} height={50} className="h-12 w-auto" />
          <div className="flex gap-3">
            <a href="tel:+27738281478" className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-all duration-300 hover:shadow-lg shadow-md">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Call +27 738 281 478</span>
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION - Website style with animations */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/50"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center space-y-6">
            {/* BADGE */}
            <FadeIn direction="up" delay={0} duration={800} distance={20} blur={true}>
              <div className="inline-block px-6 py-2.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-full mb-4 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                <span className="text-emerald-400 text-sm font-semibold tracking-wide">Fast Freight Booking Platform</span>
              </div>
            </FadeIn>

            {/* MAIN HEADLINE */}
            <FadeIn direction="up" delay={150} duration={900} distance={30} blur={true}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Book Your Freight in Minutes
              </h1>
            </FadeIn>

            {/* SUBHEADLINE */}
            <FadeIn direction="up" delay={300} duration={900} distance={30} blur={true}>
              <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
                Connect with 500+ verified transporters. Get instant quotes. Track shipments real-time.
              </p>
            </FadeIn>

            {/* TRUST METRICS */}
            <FadeIn direction="up" delay={450} duration={900} distance={40} blur={true}>
              <div className="grid grid-cols-3 gap-6 pt-8 mt-8 border-t border-blue-800/30">
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-emerald-400">500+</p>
                  <p className="text-blue-200 text-sm mt-2">Verified Transporters</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-emerald-400">&lt;5 min</p>
                  <p className="text-blue-200 text-sm mt-2">Get Instant Quotes</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-emerald-400">4.9★</p>
                  <p className="text-blue-200 text-sm mt-2">Average Rating</p>
                </div>
              </div>
            </FadeIn>

            {/* CTA BUTTONS */}
            <FadeIn direction="up" delay={600} duration={900} distance={50} blur={true}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <button
                  onClick={scrollToForm}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold rounded-lg transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/50 transform hover:-translate-y-1"
                >
                  📦 Get Instant Quote
                </button>
                <a
                  href="https://wa.me/27738281478?text=Hi%20FleetXchange%2C%20I%20need%20a%20freight%20quote"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-white/10 border-2 border-white text-white font-bold rounded-lg hover:bg-white/20 transition-all duration-300"
                >
                  💬 Chat on WhatsApp
                </a>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FORM SECTION */}
      <section ref={formRef} className="relative py-16 md:py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="up" delay={0} duration={800} distance={30} blur={true}>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">
              Get Your Instant Quote
            </h2>
          </FadeIn>

          <FadeIn direction="up" delay={200} duration={900} distance={40} blur={true}>
            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-xl p-8 md:p-10">
              <QuickQuoteForm />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="up" delay={0} duration={800} distance={30}>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">
              How It Works
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-4 gap-6 md:gap-4">
            {[
              { num: 1, title: "Post Your Load", desc: "Enter pickup, destination & cargo details" },
              { num: 2, title: "Get Quotes", desc: "Receive bids from verified transporters" },
              { num: 3, title: "Compare & Book", desc: "Pick the best rate and confirm" },
              { num: 4, title: "Track Live", desc: "Monitor shipment in real-time" }
            ].map((step, i) => (
              <FadeIn key={i} direction={i % 2 === 0 ? "left" : "right"} delay={i * 100} duration={800} distance={30}>
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border-2 border-blue-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 flex items-center justify-center text-white font-bold text-lg mb-4">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST & CREDIBILITY */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="up" delay={0} duration={800} distance={30}>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">
              Why Choose FleetXchange?
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: CheckCircle2, title: "Verified Network", desc: "All transporters checked & rated", highlight: true },
              { icon: Clock, title: "<5 Min Quotes", desc: "Instant pricing from multiple sources", highlight: true },
              { icon: Shield, title: "100% Secure", desc: "Data encrypted, payments protected" },
              { icon: Truck, title: "Live Tracking", desc: "Know exactly where your shipment is" },
              { icon: MapPin, title: "Nationwide", desc: "Coverage across Southern Africa" },
              { icon: Globe, title: "24/7 Support", desc: "Always available to help" }
            ].map((item, i) => (
              <FadeIn key={i} direction="up" delay={i * 100} duration={800} distance={30}>
                <div className={`rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                  item.highlight
                    ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-300'
                    : 'bg-white border-gray-200'
                }`}>
                  <item.icon className={`h-8 w-8 mb-4 ${item.highlight ? 'text-emerald-600' : 'text-blue-600'}`} />
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-gray-700 text-sm">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* LOCATION CONTENT */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {[
              { city: "Johannesburg", routes: "Jo'burg → Cape Town, Durban, Pretoria" },
              { city: "Durban", routes: "Durban → Jo'burg, Port Elizabeth, Richards Bay" },
              { city: "Cape Town", routes: "Cape Town → Jo'burg, Durban, Stellenbosch" },
              { city: "Nationwide", routes: "All major routes across South Africa & region" }
            ].map((loc, i) => (
              <FadeIn key={i} direction={i % 2 === 0 ? "left" : "right"} delay={i * 150} duration={800} distance={40}>
                <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-8 border-2 border-emerald-200">
                  <MapPin className="h-6 w-6 text-emerald-600 mb-3" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{loc.city}</h3>
                  <p className="text-gray-700">{loc.routes}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA REINFORCEMENT */}
      <FadeIn direction="up" delay={0} duration={800} distance={40}>
        <section className="bg-gradient-to-r from-emerald-600 via-green-500 to-blue-600 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              📦 Ready to Book Your Freight?
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Get instant quotes from verified transporters. No hidden fees. Fast & secure.
            </p>
            <button
              onClick={scrollToForm}
              className="px-10 py-4 bg-white text-emerald-600 font-bold rounded-lg hover:bg-blue-50 transition-all duration-300 hover:shadow-xl hover:shadow-white/30 transform hover:-translate-y-1"
            >
              Get Your Quote Now →
            </button>
          </div>
        </section>
      </FadeIn>

      {/* STICKY MOBILE CTA */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 shadow-lg border-t-2 border-emerald-700">
        <button
          onClick={scrollToForm}
          className="w-full px-6 py-3 bg-white text-emerald-600 font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          📦 Quote Now
        </button>
      </div>

      {/* FLOATING ACTION BUTTONS */}
      <FloatingActionButtons />

      {/* FOOTER MINIMAL */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 FleetXchange. All rights reserved. | 
            <a href="/privacy-policy" className="text-emerald-400 hover:underline ml-2">Privacy</a> | 
            <a href="/terms-of-service" className="text-emerald-400 hover:underline ml-2">Terms</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

// QUICK QUOTE FORM
function QuickQuoteForm() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    pickupLocation: "",
    dropLocation: "",
    cargoDetails: "",
    timeline: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({
          companyName: "",
          contactPerson: "",
          email: "",
          phone: "",
          pickupLocation: "",
          dropLocation: "",
          cargoDetails: "",
          timeline: ""
        });
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="bg-emerald-100 border-2 border-emerald-400 text-emerald-800 px-4 py-4 rounded-lg font-semibold">
          ✓ Got it! A transporter will contact you within minutes.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <input
          type="text"
          name="companyName"
          placeholder="Company Name"
          value={formData.companyName}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <input
          type="text"
          name="contactPerson"
          placeholder="Contact Person Name"
          value={formData.contactPerson}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <input
          type="email"
          name="email"
          placeholder="📧 Email (where we send quote)"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <input
          type="tel"
          name="phone"
          placeholder="📱 Phone +27..."
          value={formData.phone}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <input
          type="text"
          name="pickupLocation"
          placeholder="📍 Pickup Location (e.g. Johannesburg)"
          value={formData.pickupLocation}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <input
          type="text"
          name="dropLocation"
          placeholder="📍 Drop Location (Destination)"
          value={formData.dropLocation}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      <textarea
        name="cargoDetails"
        placeholder="Cargo Details (weight, dimensions, type)"
        value={formData.cargoDetails}
        onChange={handleChange}
        rows={3}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
      ></textarea>

      <input
        type="text"
        name="timeline"
        placeholder="⏰ When? (ASAP, tomorrow, specific date)"
        value={formData.timeline}
        onChange={handleChange}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
      />

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        {submitting ? "⏳ Sending..." : "📦 Get Instant Quote"}
      </button>
    </form>
  );
}

// FLOATING ACTION BUTTONS
function FloatingActionButtons() {
  return (
    <div className="fixed bottom-20 right-4 flex flex-col gap-3 z-30 md:bottom-4">
      {/* WhatsApp Button */}
      <a
        href="https://wa.me/27738281478?text=Hi%20FleetXchange%2C%20I%20need%20a%20freight%20quote"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="h-6 w-6 md:h-7 md:w-7" />
      </a>

      {/* Call Button */}
      <a
        href="tel:+27738281478"
        className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
        title="Call us"
      >
        <Phone className="h-6 w-6 md:h-7 md:w-7" />
      </a>
    </div>
  );
}
