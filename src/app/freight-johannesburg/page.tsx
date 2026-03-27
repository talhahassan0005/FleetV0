'use client';

import { MapPin, Truck, CheckCircle2, Clock } from 'lucide-react';
import { useState, useRef } from 'react';
import FadeIn from "@/components/FadeIn";

export default function FreightJohannesburg() {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 pt-20">
        <div className="abstract inset-0 opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/50"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center space-y-6">
            <FadeIn direction="up" delay={0} duration={800} distance={20} blur={true}>
              <div className="inline-block px-6 py-2.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-full">
                <span className="text-emerald-400 text-sm font-semibold">Fast Freight Booking in Johannesburg</span>
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={150} duration={900} distance={30} blur={true}>
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                Book Freight from Johannesburg
              </h1>
            </FadeIn>

            <FadeIn direction="up" delay={300} duration={900} distance={30} blur={true}>
              <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
                connect with verified transporters across Johannesburg, Cape Town, Durban, Pretoria & beyond.
              </p>
            </FadeIn>

            <FadeIn direction="up" delay={450} duration={800} distance={20}>
              <button
                onClick={scrollToForm}
                className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold rounded-lg transition-all duration-300 hover:shadow-xl"
              >
                📦 Get Instant Quote
              </button>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ROUTES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Popular Routes from Johannesburg
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { from: "Johannesburg", to: "Cape Town", hours: "~20 hrs" },
              { from: "Johannesburg", to: "Durban", hours: "~6 hrs" },
              { from: "Johannesburg", to: "Pretoria", hours: "~1 hr" },
              { from: "Johannesburg", to: "Bloemfontein", hours: "~6 hrs" }
            ].map((route, i) => (
              <FadeIn key={i} direction="up" delay={i * 100} duration={800} distance={30}>
                <div className="rounded-lg p-6 border-2 border-emerald-200 bg-emerald-50">
                  <MapPin className="h-6 w-6 text-emerald-600 mb-3" />
                  <p className="font-bold text-slate-900">{route.from} → {route.to}</p>
                  <p className="text-sm text-gray-600">{route.hours} drive time</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE FORM */}
      <section ref={formRef} className="py-20 bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Get Your Quote from JNB
          </h2>

          <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-xl p-8">
            <QuoteForm />
          </div>
        </div>
      </section>

      {/* FLOATING */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-30">
        <a href="https://wa.me/27738281478" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500 text-white">
          <span>💬</span>
        </a>
      </div>

      {/* MOBILE CTA */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-emerald-600 p-4">
        <button onClick={scrollToForm} className="w-full py-3 bg-white text-emerald-600 font-bold rounded-lg">
          📦 Quote Now
        </button>
      </div>
    </div>
  );
}

function QuoteForm() {
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    pickupLocation: "Johannesburg",
    dropLocation: "",
    cargoDetails: "",
    timeline: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" name="companyName" placeholder="Company" value={formData.companyName} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg" />
      <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg" />
      <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg" />
      <input type="text" name="dropLocation" placeholder="Drop Location" value={formData.dropLocation} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg" />
      <textarea name="cargoDetails" placeholder="Cargo Details" value={formData.cargoDetails} onChange={handleChange} required rows={3} className="w-full px-4 py-3 border rounded-lg"></textarea>
      <input type="text" name="timeline" placeholder="Timeline" value={formData.timeline} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg" />
      <button type="submit" disabled={submitting} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-lg hover:bg-emerald-700">{submitting ? "Sending..." : "📦 Get Quote"}</button>
    </form>
  );
}
