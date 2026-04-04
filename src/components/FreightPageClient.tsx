'use client';

import { MapPin, Truck, CheckCircle2, Clock } from 'lucide-react';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trackConversion } from "@/components/GTMClient";

interface FreightPageClientProps {
  city: string;
  defaultPickup: string;
  description: string;
  routes: Array<{ from?: string; to: string; hours: string }>;
  otherLocations?: Array<{ city: string; flag: string; href: string; desc: string }>;
}

export default function FreightPageClient({ 
  city, 
  defaultPickup, 
  description, 
  routes,
  otherLocations 
}: FreightPageClientProps) {
  const scrollToForm = () => {
    // Track CTA button click and go to full request form
    trackConversion('quote_cta_button_click', 1);
    if (typeof window !== 'undefined') {
      window.location.href = '/contact';
    }
  };

  return (
    <div key={city} className="min-h-screen bg-white" suppressHydrationWarning>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 pt-20">
        <div className="abstract inset-0 opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/50"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-48">
          <div className="text-center space-y-6">
            <div>
              <div className="inline-block px-6 py-2.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-full">
                <span className="text-emerald-400 text-sm font-semibold">Fast Freight Booking in {city}</span>
              </div>
            </div>

            <div>
              <h1 className="text-5xl md:text-7xl font-bold text-white">
                Book Freight from {city}
              </h1>
            </div>

            <div>
              <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
                {description}
              </p>
            </div>

            <div>
              <button
                onClick={scrollToForm}
                className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold rounded-lg transition-all duration-300 hover:shadow-xl"
              >
                📦 Get Instant Quote
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ROUTES */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">
            Popular Routes from {city}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {routes.map((route, i) => (
              <div key={i}>
                <div className="rounded-lg p-6 border-2 border-emerald-200 bg-emerald-50">
                  <MapPin className="h-6 w-6 text-emerald-600 mb-3" />
                  <p className="font-bold text-slate-900">
                    {route.from || city} → {route.to}
                  </p>
                  <p className="text-sm text-gray-600">{route.hours} drive time</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OTHER LOCATIONS SECTION */}
      {otherLocations && (
        <section className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center text-slate-900 mb-6">Start Freight from Other Locations</h2>
            <p className="text-center text-gray-600 mb-16 text-lg">Need freight from a different city? We cover all of Southern Africa</p>

            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {otherLocations.map((location, i) => (
                <div key={i}>
                  <a href={location.href}>
                    <div
                      className="rounded-xl border-2 border-gray-200 bg-white p-6 h-full cursor-pointer hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-1 group text-center"
                      onClick={() => trackConversion('cross_border_link_click', 1)}
                    >
                      <div className="text-4xl mb-3">{location.flag}</div>
                      <h3 className="font-bold text-gray-900 mb-1">{location.city}</h3>
                      <p className="text-xs text-gray-500 mb-3">{location.desc}</p>
                      <div className="text-emerald-600 font-semibold text-sm group-hover:text-emerald-700">Get Quote →</div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FLOATING */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-30">
        <a 
          href="https://wa.me/27738281478" 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={() => trackConversion('whatsapp_click', 1)}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500 text-white hover:bg-green-600 transition-all"
        >
          <span>💬</span>
        </a>
      </div>

      {/* MOBILE CTA */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-emerald-600 p-4">
        <button 
          onClick={scrollToForm}
          className="w-full py-3 bg-white text-emerald-600 font-bold rounded-lg hover:bg-gray-100 transition-all"
        >
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
        // Track conversion
        trackConversion('form_submission', 50);
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
