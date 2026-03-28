'use client';

import { MapPin } from 'lucide-react';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import FadeIn from "@/components/FadeIn";

export default function FreightDurban() {
  const formRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/50"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center space-y-6">
            <FadeIn direction="up" delay={0} duration={800} distance={20} blur={true}>
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                Book Freight from Durban
              </h1>
            </FadeIn>

            <FadeIn direction="up" delay={150} duration={900} distance={30} blur={true}>
              <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
                Connect with verified transporters across Southern Africa. Quick quotes. Real-time tracking.
              </p>
            </FadeIn>

            <FadeIn direction="up" delay={450} duration={800} distance={20}>
              <button onClick={() => formRef.current?.scrollIntoView()} className="px-10 py-4 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700">
                📦 Get Instant Quote
              </button>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Routes from Durban</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { to: "Johannesburg", hours: "~6 hrs" },
              { to: "Cape Town", hours: "~26 hrs" },
              { to: "Pietermaritzburg", hours: "~1.5 hrs" },
              { to: "Richards Bay", hours: "~2 hrs" }
            ].map((route, i) => (
              <div key={i} className="rounded-lg p-6 border-2 border-emerald-200 bg-emerald-50">
                <MapPin className="h-6 w-6 text-emerald-600 mb-3" />
                <p className="font-bold">Durban → {route.to}</p>
                <p className="text-sm text-gray-600">{route.hours} drive time</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={formRef} className="py-20 bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Get Your Quote from Durban</h2>
          <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 shadow-xl">
            <QuoteForm defaultPickup="Durban" />
          </div>
        </div>
      </section>

      <div className="fixed bottom-4 right-4 flex flex-col gap-3">
        <a href="https://wa.me/27738281478" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500 text-white">
          💬
        </a>
      </div>

      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-emerald-600 p-4">
        <button onClick={() => formRef.current?.scrollIntoView()} className="w-full py-3 bg-white text-emerald-600 font-bold rounded-lg">
          📦 Quote Now
        </button>
      </div>
    </div>
  );
}

function QuoteForm({ defaultPickup }: { defaultPickup: string }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    cargoDetails: "",
    route: defaultPickup,
    timeline: "",
    specialRequirements: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/thank-you');
        }, 1500);
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
        <div className="bg-emerald-100 border-2 border-emerald-400 text-emerald-800 px-4 py-3 rounded-lg font-semibold text-center">
          ✓ Got it! Redirecting to confirmation page...
        </div>
      )}
      <input type="text" name="companyName" placeholder="Company Name" value={formData.companyName} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg text-gray-900" />
      <input type="text" name="contactPerson" placeholder="Contact Person" value={formData.contactPerson} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg text-gray-900" />
      <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg text-gray-900" />
      <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg text-gray-900" />
      <textarea name="cargoDetails" placeholder="Cargo Details" value={formData.cargoDetails} onChange={handleChange} required rows={3} className="w-full px-4 py-3 border rounded-lg text-gray-900"></textarea>
      <input type="text" name="timeline" placeholder="Timeline" value={formData.timeline} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg text-gray-900" />
      <input type="text" name="specialRequirements" placeholder="Special Requirements (optional)" value={formData.specialRequirements} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg text-gray-900" />
      <button type="submit" disabled={submitting || success} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-lg hover:bg-emerald-700 disabled:opacity-50">{submitting ? "Sending..." : success ? "✓ Sent!" : "📦 Get Quote"}</button>
    </form>
  );
}
