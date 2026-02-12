"use client";

import PageHero from "@/components/PageHero";
import { useState } from "react";
import { FileText, Package, MapPin, Clock, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    cargoDetails: "",
    route: "",
    timeline: "",
    specialRequirements: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus({ type: 'success', message: data.message });
        setFormData({
          companyName: "",
          contactPerson: "",
          email: "",
          phone: "",
          cargoDetails: "",
          route: "",
          timeline: "",
          specialRequirements: ""
        });
      } else {
        setSubmitStatus({ type: 'error', message: data.message || 'Failed to submit request' });
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen">
      <PageHero 
        title="Let's tell the story" 
        subtitle="Tell us about your load and we'll come back with a structured proposal"
        badge="Get Started"
      />
      
      {/* FORM SECTION */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-none shadow-xl bg-white p-10 md:p-16">
                <h2 className="text-3xl font-bold text-slate-900 mb-10">Request a Load Movement</h2>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* COMPANY INFORMATION */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                      <FileText className="h-5 w-5 mr-3 text-emerald-600" />
                      Company Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <input 
                          type="text" 
                          name="companyName"
                          required
                          value={formData.companyName}
                          onChange={handleChange}
                          placeholder="Company Name"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                      <div>
                        <input 
                          type="text" 
                          name="contactPerson"
                          required
                          value={formData.contactPerson}
                          onChange={handleChange}
                          placeholder="Contact Person"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <input 
                          type="email" 
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Email Address"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                      <div>
                        <input 
                          type="tel" 
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Phone Number"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CARGO DETAILS */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                      <Package className="h-5 w-5 mr-3 text-emerald-600" />
                      Cargo Details
                    </h3>
                    <textarea 
                      name="cargoDetails"
                      required
                      value={formData.cargoDetails}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Describe your cargo (type, weight, volume, quantity, special handling requirements)"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400"
                    ></textarea>
                  </div>

                  {/* ROUTE & DESTINATION */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                      <MapPin className="h-5 w-5 mr-3 text-emerald-600" />
                      Route & Destination
                    </h3>
                    <input 
                      type="text" 
                      name="route"
                      required
                      value={formData.route}
                      onChange={handleChange}
                      placeholder="From [City/Location] to [City/Location]"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400"
                    />
                  </div>

                  {/* TIMELINE */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                      <Clock className="h-5 w-5 mr-3 text-emerald-600" />
                      Timeline
                    </h3>
                    <input 
                      type="text" 
                      name="timeline"
                      required
                      value={formData.timeline}
                      onChange={handleChange}
                      placeholder="e.g., Pickup on 15 Aug, delivery by 18 Aug"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400"
                    />
                  </div>

                  {/* SPECIAL REQUIREMENTS */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">Special Requirements</h3>
                    <textarea 
                      name="specialRequirements"
                      value={formData.specialRequirements}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Any special requirements, handling instructions, insurance needs, or other important details"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400"
                    ></textarea>
                  </div>

                  <div className="pt-8">
                    {submitStatus && (
                      <div className={`mb-4 p-4 rounded-lg ${submitStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                        {submitStatus.message}
                      </div>
                    )}
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-base"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Load Request'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* WHAT HAPPENS NEXT */}
            <div>
            <div className="rounded-xl border border-none shadow-xl bg-white p-6 mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">What Happens Next?</h3>
              
              <div className="space-y-3">
                {/* Step 1 */}
                <div className="flex gap-3 items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-emerald-500 text-white font-bold text-xs">
                      1
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Review</p>
                    <p className="text-xs text-gray-600">We assess your request within 24 hours</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3 items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-emerald-500 text-white font-bold text-xs">
                      2
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Proposal</p>
                    <p className="text-xs text-gray-600">Receive pricing and timeline options</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3 items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-emerald-500 text-white font-bold text-xs">
                      3
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Confirmation</p>
                    <p className="text-xs text-gray-600">Load Confirmation Sheet issued</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-3 items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-emerald-500 text-white font-bold text-xs">
                      4
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Execution</p>
                    <p className="text-xs text-gray-600">We coordinate and oversee the movement</p>
                  </div>
                </div>

              </div>
            </div>

              {/* Contact Our Offices Box */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 border border-slate-700">
                <h4 className="text-lg font-bold mb-8">Contact Our Offices</h4>
                
                <div className="space-y-6">
                  {/* South Africa */}
                  <div className="pb-6 border-b border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-5 w-5 text-emerald-400" />
                      <p className="font-bold text-emerald-400 text-sm">South Africa</p>
                    </div>
                    <p className="text-sm text-gray-200 mb-2 font-medium">Johannesburg</p>
                    <p className="text-xs text-gray-400 mb-1">Email:</p>
                    <p className="text-sm text-gray-300 font-medium mb-3">mrtiger@fleetxchange.africa</p>
                    <p className="text-xs text-gray-400 mb-1">Phone:</p>
                    <p className="text-sm text-gray-300 font-medium">+27 73 828 1478</p>
                  </div>

                  {/* Botswana */}
                  <div className="pb-6 border-b border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-5 w-5 text-emerald-400" />
                      <p className="font-bold text-emerald-400 text-sm">Botswana</p>
                    </div>
                    <p className="text-sm text-gray-200 mb-2 font-medium">Gaborone</p>
                    <p className="text-xs text-gray-400 mb-1">Email:</p>
                    <p className="text-sm text-gray-300 font-medium mb-3">mrtiger@fleetxchange.africa</p>
                    <p className="text-xs text-gray-400 mb-1">Phone:</p>
                    <p className="text-sm text-gray-300 font-medium">+267 76 666 598</p>
                  </div>

                  {/* Zambia */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-5 w-5 text-emerald-400" />
                      <p className="font-bold text-emerald-400 text-sm">Zambia</p>
                    </div>
                    <p className="text-sm text-gray-200 mb-2 font-medium">Lusaka</p>
                    <p className="text-xs text-gray-400 mb-1">Email:</p>
                    <p className="text-sm text-gray-300 font-medium">mrtiger@fleetxchange.africa</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-700 text-xs text-gray-400">
                  <p>Our team is available <span className="font-semibold text-gray-300">Monday to Friday, 8AM - 5PM SAST</span></p>
                </div>
              </div>
                {/* BRAND STATEMENT SECTION */}
                <section className="py-12">
                  <div className="w-full">
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center">
                      <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">We tell the story</h3>
                      <p className="text-gray-700 text-sm">Professional freight coordination across Southern Africa</p>
                    </div>
                  </div>
                </section>
            </div>
          </div>
        </div>
      </section>

    

      {/* CLOSING MESSAGE */}
      <section className="py-20 bg-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Every successful movement starts with a clear story</h2>
          <p className="text-lg text-gray-700">
            Let FleetXchange be your single point of coordination for freight across Southern Africa.
          </p>
        </div>
      </section>
    </div>
  );
}
