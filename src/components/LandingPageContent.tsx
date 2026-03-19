'use client';

import { Phone, MessageCircle, CheckCircle2, Clock, Truck, Shield, MapPin, Globe } from 'lucide-react';
import { useState, useRef } from 'react';
import FadeIn from "@/components/FadeIn";

export default function LandingPageContent() {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white pb-16 md:pb-0">
      {/* MINIMAL HEADER - No full navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="text-xl font-bold text-slate-900">FleetXchange</div>
          <div className="flex gap-2">
            <a href="tel:+27738281478" className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Call Now</span>
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION - CONVERSION FOCUSED */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.2) 1px, transparent 0px)", backgroundSize: "40px 40px"}}></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center space-y-4">
            {/* MAIN HEADLINE */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Freight Services & Truck Booking Across South Africa
            </h1>

            {/* SUBHEADLINE */}
            <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Get matched with verified transporters for fast, secure, and reliable delivery.
            </p>

            {/* URGENCY TEXT */}
            <div className="flex items-center justify-center gap-2 text-emerald-300 font-semibold">
              <Clock className="h-5 w-5" />
              <span>Get a response within minutes</span>
            </div>

            {/* CTA BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
              <button
                onClick={scrollToForm}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-lg"
              >
                <Truck className="h-6 w-6" />
                Book Your Transport
              </button>
              <button
                onClick={scrollToForm}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 py-4 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-lg"
              >
                Get Instant Quote
              </button>
            </div>

            {/* TRUST BADGES */}
          <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto pt-8 text-sm">
              {[
                { icon: CheckCircle2, text: "✓ Verified" },
                { icon: Clock, text: "⚡ Minutes" },
                { icon: Shield, text: "🔒 Secure" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2 bg-white bg-opacity-10 rounded-lg py-3 px-2">
                  <span className="text-base font-bold text-emerald-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FORM SECTION - ABOVE THE FOLD */}
      <section ref={formRef} className="bg-white py-12 md:py-16 border-t-4 border-emerald-500">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              Get Your Instant Quote
            </h2>
            <p className="text-gray-600">Submit your details below. Get matched with verified transporters in minutes.</p>
          </div>

          {/* SIMPLIFIED FORM */}
          <div className="bg-gray-50 rounded-xl p-6 md:p-8 border border-gray-200">
            <QuickQuoteForm />
          </div>

          {/* URGENCY & TRUST TEXT */}
          <div className="text-center mt-6 space-y-2">
            <div className="inline-block bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">
              <p className="text-sm font-semibold text-emerald-700">⚡ Limited transporter availability today</p>
            </div>
            <p className="text-xs text-gray-600">✓ We respect your privacy. No spam. No hidden fees. No quotas.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            How It Works - 3 Easy Steps
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: "1",
                title: "Submit Your Request",
                desc: "Tell us pickup, destination, and cargo. Takes 2 minutes.",
                icon: Truck
              },
              {
                num: "2",
                title: "Get Matched Instantly",
                desc: "We find verified transporters who fit your needs perfectly.",
                icon: CheckCircle2
              },
              {
                num: "3",
                title: "Book & Track Now",
                desc: "Confirm your booking and track your load in real-time.",
                icon: MapPin
              }
            ].map((step, i) => (
              <FadeIn key={i} direction={i === 1 ? "up" : i === 0 ? "left" : "right"} delay={i * 100} duration={800} distance={30}>
                <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 text-xl font-bold mb-4 mx-auto">
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST & CREDIBILITY SECTION */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Why Logistics Companies Trust FleetXchange
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { 
                icon: CheckCircle2, 
                title: "Verified Transporters", 
                desc: "100% screened & verified professionals",
                highlight: true
              },
              { 
                icon: Clock, 
                title: "Minutes, Not Hours", 
                desc: "Get quotes and responses fast",
                highlight: true
              },
              { 
                icon: Globe, 
                title: "Cross-Border Expert", 
                desc: "Coverage across Southern Africa",
                highlight: false
              },
              { 
                icon: Shield, 
                title: "Secure & Reliable", 
                desc: "Full accountability & insurance",
                highlight: false
              }
            ].map((item, i) => (
              <div key={i} className={`${item.highlight ? 'bg-gradient-to-br from-emerald-100 to-green-100 border-2 border-emerald-400 shadow-md' : 'bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-200'} rounded-xl p-6 hover:shadow-lg transition-shadow`}>
                <item.icon className={`h-8 w-8 ${item.highlight ? 'text-emerald-700' : 'text-emerald-600'} mb-3`} />
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCATION-BASED SEO CONTENT */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">
            Freight Services Across South Africa
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
                Johannesburg Freight Services
              </h3>
              <p className="text-gray-600 mb-4">
                Fast, reliable freight booking for Johannesburg, Pretoria, Gauteng. Same-day delivery available. Connect with verified truck transporters.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Globe className="h-5 w-5 text-emerald-600" />
                Cross-Border Africa Logistics
              </h3>
              <p className="text-gray-600 mb-4">
                Expertise in cross-border freight across South Africa, Botswana, Zimbabwe, Zambia & beyond. We handle customs, documentation, compliance.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Truck className="h-5 w-5 text-emerald-600" />
                Local & Regional Transport
              </h3>
              <p className="text-gray-600">
                Coverage across Cape Town, Durban, Bloemfontein, and all major cities in South Africa. From small packages to full truckloads.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-600" />
                Specialized Cargo Handling
              </h3>
              <p className="text-gray-600">
                Temperature-controlled, refrigerated, hazmat, and high-value cargo transport with full insurance coverage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA REINFORCEMENT SECTION - High Conversion */}
      <section className="bg-gradient-to-r from-emerald-600 via-green-500 to-blue-600 text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Ready to Book Your Freight?</h2>
          <p className="text-lg text-emerald-50 mb-2 max-w-2xl mx-auto">
            ⚡ Fast quotes. Verified transporters. No hidden fees.
          </p>
          <p className="text-sm text-emerald-100 mb-8 max-w-2xl mx-auto font-semibold">
            🕐 Average response time: 3-5 minutes
          </p>
          <button
            onClick={scrollToForm}
            className="inline-flex items-center gap-2 bg-white text-emerald-600 font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 text-lg shadow-2xl"
          >
            <Truck className="h-6 w-6" />
            Get Your Quote Now
          </button>
        </div>
      </section>

      {/* STICKY MOBILE CTA - Always Visible */}
      <div className="fixed bottom-0 left-0 right-0 bg-emerald-600 text-white p-3 shadow-2xl z-20 md:hidden">
        <button
          onClick={scrollToForm}
          className="w-full font-bold py-3 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 transition-colors text-lg flex items-center justify-center gap-2"
        >
          <Truck className="h-5 w-5" />
          Get Quote Now
        </button>
      </div>

      {/* STICKY MOBILE CTA - Always Visible */}
      <div className="fixed bottom-0 left-0 right-0 bg-emerald-600 text-white p-3 shadow-2xl z-20 md:hidden">
        <button
          onClick={scrollToForm}
          className="w-full font-bold py-3 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 transition-colors text-lg flex items-center justify-center gap-2"
        >
          <Truck className="h-5 w-5" />
          Get Quote Now
        </button>
      </div>

      {/* FOOTER MINIMAL */}
      <footer className="bg-slate-900 text-white py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 FleetXchange. All rights reserved. | 
            <a href="/privacy-policy" className="text-emerald-400 hover:underline ml-1">Privacy</a> | 
            <a href="/terms-of-service" className="text-emerald-400 hover:underline ml-1">Terms</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

// QUICK QUOTE FORM - SIMPLIFIED
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
          ✓ Got it! A transporter will contact you within minutes. Your reference sent to email.
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
