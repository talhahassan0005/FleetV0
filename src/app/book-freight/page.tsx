'use client';

import { Truck, CheckCircle2, MapPin, Clock, Shield, Phone, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { useState, useRef } from 'react';
import FadeIn from "@/components/FadeIn";

export default function BookFreightPage() {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 pt-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/50"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center space-y-6">
            <FadeIn direction="up" delay={0} duration={800} distance={20} blur={true}>
              <div className="inline-block px-6 py-2.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-full backdrop-blur-sm">
                <span className="text-emerald-400 text-sm font-semibold tracking-wide">Fast & Reliable Freight Booking</span>
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={150} duration={900} distance={30} blur={true}>
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                Book Your Freight Now
              </h1>
            </FadeIn>

            <FadeIn direction="up" delay={300} duration={900} distance={30} blur={true}>
              <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
                Get connected with 500+ verified transporters. Instant quotes. Real-time tracking.
              </p>
            </FadeIn>

            <FadeIn direction="up" delay={450} duration={800} distance={20}>
              <button
                onClick={scrollToForm}
                className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold rounded-lg transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/50 transform hover:-translate-y-1 text-lg"
              >
                📦 Get Instant Quote
              </button>
            </FadeIn>

            <FadeIn direction="up" delay={600} duration={900} distance={40} blur={true}>
              <div className="grid grid-cols-3 gap-6 pt-12 mt-8 border-t border-blue-800/30">
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-emerald-400">500+</p>
                  <p className="text-blue-200 text-sm mt-2">Verified Transporters</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-emerald-400">&lt;5 min</p>
                  <p className="text-blue-200 text-sm mt-2">Get Quotes</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-emerald-400">4.9★</p>
                  <p className="text-blue-200 text-sm mt-2">Rating</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="bg-gradient-to-r from-emerald-600 to-blue-600 py-12 text-white text-center">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-3xl font-bold">50K+</p>
              <p className="text-emerald-100 text-sm mt-2">Shipments Tracked</p>
            </div>
            <div>
              <p className="text-3xl font-bold">99%</p>
              <p className="text-emerald-100 text-sm mt-2">Visibility</p>
            </div>
            <div>
              <p className="text-3xl font-bold">200+</p>
              <p className="text-emerald-100 text-sm mt-2">Companies</p>
            </div>
          </div>
        </div>
      </section>

      {/* FORM SECTION */}
      <section ref={formRef} className="relative py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="up" delay={0} duration={800} distance={30} blur={true}>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">
              Get Your Quote in 2 Minutes
            </h2>
          </FadeIn>

          <FadeIn direction="up" delay={200} duration={900} distance={40} blur={true}>
            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-xl p-8 md:p-12">
              <QuoteForm />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="up" delay={0} duration={800} distance={30}>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">
              Why FleetXchange?
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: CheckCircle2, title: "Verified Transporters", desc: "All checked & rated" },
              { icon: Clock, title: "Instant Quotes", desc: "<5 min from request" },
              { icon: Shield, title: "100% Secure", desc: "Data encrypted" },
              { icon: Truck, title: "Live Tracking", desc: "Real-time updates" },
              { icon: MapPin, title: "Nationwide Coverage", desc: "Across South Africa" },
              { icon: MessageCircle, title: "24/7 Support", desc: "Always here to help" }
            ].map((item, i) => (
              <FadeIn key={i} direction="up" delay={i * 100} duration={800} distance={30}>
                <div className="rounded-2xl p-6 border-2 border-gray-200 bg-white hover:border-emerald-300 hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
                  <item.icon className="h-8 w-8 text-emerald-600 mb-4" />
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-gray-700 text-sm">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FLOATING ACTION BUTTONS */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-30">
        <a
          href="https://wa.me/27738281478?text=Hi%20FleetXchange%2C%20I%20need%20a%20freight%20quote"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
          title="Chat on WhatsApp"
        >
          <MessageCircle className="h-7 w-7" />
        </a>
        <a
          href="tel:+27738281478"
          className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
          title="Call us"
        >
          <Phone className="h-7 w-7" />
        </a>
      </div>

      {/* STICKY MOBILE CTA */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 shadow-lg">
        <button
          onClick={scrollToForm}
          className="w-full px-6 py-3 bg-white text-emerald-600 font-bold rounded-lg transition-all duration-300"
        >
          📦 Get Quote Now
        </button>
      </div>
    </div>
  );
}

function QuoteForm() {
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
          placeholder="Contact Person"
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
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone"
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
          placeholder="Pickup Location"
          value={formData.pickupLocation}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <input
          type="text"
          name="dropLocation"
          placeholder="Drop Location"
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
        placeholder="When? (ASAP, tomorrow, specific date)"
        value={formData.timeline}
        onChange={handleChange}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
      />

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl"
      >
        {submitting ? "⏳ Sending..." : "📦 Get Quote Now"}
      </button>
    </form>
  );
}
