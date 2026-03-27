'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import FadeIn from './FadeIn';

export default function QuickQuoteForm() {
  const [formData, setFormData] = useState({
    company: '',
    email: '',
    description: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: formData.company,
          contactPerson: formData.company,
          email: formData.email,
          phone: formData.phone,
          cargoDetails: formData.description,
          route: 'TBD',
          timeline: 'ASAP',
          specialRequirements: 'Quick Quote Request'
        })
      });

      if (response.ok) {
        setSubmitted(true);
        // Track conversion
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'conversion', {
            'conversion_id': 'AW-10808030018',
            'conversion_label': 'quote_request'
          });
        }
        setFormData({ company: '', email: '', description: '', phone: '' });
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (error) {
      console.error('Error submitting quote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-600 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.2) 1px, transparent 0px)",
          backgroundSize: "40px 40px"
        }}></div>
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="down" delay={0} duration={600} distance={20}>
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Get Your Instant Quote
            </h2>
            <p className="text-emerald-100 text-sm">
              Fill in your details and get a quote within 5 minutes
            </p>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={100} duration={600} distance={20}>
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl p-6 md:p-8">
            {submitted && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium">
                ✓ Quote request received! We&apos;ll contact you within 1 hour.
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {/* Company Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="company"
                  required
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Your Company"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+27 73 828 1478"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Cargo Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  What are you shipping? *
                </label>
                <input
                  type="text"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="e.g., Electronics, FMCG, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 text-sm"
            >
              {isSubmitting ? 'Getting Quote...' : 'Get Instant Quote'}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              We&apos;ll respond within 1 hour. No spam, just quotes.
            </p>
          </form>
        </FadeIn>
      </div>
    </section>
  );
}
