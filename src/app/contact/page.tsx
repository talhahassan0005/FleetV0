"use client";

import PageHero from "@/components/PageHero";
import FadeIn from "@/components/FadeIn";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import { FileText, Package, MapPin, Clock, CheckCircle2, Truck, Building2 } from "lucide-react";

function ContactForm() {
  const searchParams = useSearchParams();
  const [formType, setFormType] = useState<'client' | 'transporter'>('client');
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
  const [transporterData, setTransporterData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    country: "",
    fleetSize: "",
    vehicleTypes: "",
    operatingRoutes: "",
    yearsInBusiness: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'transporter') {
      setFormType('transporter');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const endpoint = formType === 'client' ? '/api/contact' : '/api/transporter';
      const data = formType === 'client' ? formData : transporterData;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus({ type: 'success', message: result.message });
        if (formType === 'client') {
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
          setTransporterData({
            companyName: "",
            contactName: "",
            email: "",
            phone: "",
            country: "",
            fleetSize: "",
            vehicleTypes: "",
            operatingRoutes: "",
            yearsInBusiness: "",
            message: ""
          });
        }
      } else {
        setSubmitStatus({ type: 'error', message: result.message || 'Failed to submit request' });
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (formType === 'client') {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    } else {
      setTransporterData({ ...transporterData, [e.target.name]: e.target.value });
    }
  };

  return (
    <div className="min-h-screen">
      <PageHero 
        title="Let's tell the story" 
        subtitle="Tell us about your load and we'll come back with a structured proposal"
        badge="Get Started"
      />
      
      {/* FORM SECTION */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        {/* Subtle animated background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.2) 1px, transparent 0px)",
            backgroundSize: "40px 40px"
          }}></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Toggle Buttons */}
          <FadeIn direction="down" delay={0} duration={600} distance={20}>
            <div className="flex justify-center mb-8">
              <div className="inline-flex rounded-lg border-2 border-emerald-200 bg-white p-1 shadow-lg">
                <button
                  onClick={() => { setFormType('client'); setSubmitStatus(null); }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-md font-semibold transition-all duration-300 ${
                    formType === 'client'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-emerald-600'
                  }`}
                >
                  <Building2 className="h-5 w-5" />
                  Client Request
                </button>
                <button
                  onClick={() => { setFormType('transporter'); setSubmitStatus(null); }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-md font-semibold transition-all duration-300 ${
                    formType === 'transporter'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-emerald-600'
                  }`}
                >
                  <Truck className="h-5 w-5" />
                  Transporter Application
                </button>
              </div>
            </div>
          </FadeIn>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* FORM COLUMN */}
            <div className="lg:col-span-2">
              <FadeIn direction="left" delay={0} duration={800} distance={40} blur={true}>
                <div className="rounded-xl border border-none shadow-xl bg-white p-10 md:p-16 hover:shadow-2xl transition-all duration-500">
                  <h2 className="text-3xl font-bold text-slate-900 mb-10">
                    {formType === 'client' ? 'Request a Load Movement' : 'Apply as Transporter'}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {formType === 'client' ? (
                      <>
                    {/* COMPANY INFORMATION */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 flex items-center group">
                        <FileText className="h-5 w-5 mr-3 text-emerald-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
                        <span className="group-hover:text-emerald-600 transition-colors duration-300">Company Information</span>
                      </h3>
                      <div className="grid md:grid-cols-2 gap-5">
                        <FadeIn direction="up" delay={100} duration={600} distance={20}>
                          <input 
                            type="text" 
                            name="companyName"
                            required
                            value={formData.companyName}
                            onChange={handleChange}
                            placeholder="Company Name"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-300 hover:border-emerald-400"
                          />
                        </FadeIn>
                        <FadeIn direction="up" delay={150} duration={600} distance={20}>
                          <input 
                            type="text" 
                            name="contactPerson"
                            required
                            value={formData.contactPerson}
                            onChange={handleChange}
                            placeholder="Contact Person"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-300 hover:border-emerald-400"
                          />
                        </FadeIn>
                      </div>
                      <div className="grid md:grid-cols-2 gap-5">
                        <FadeIn direction="up" delay={200} duration={600} distance={20}>
                          <input 
                            type="email" 
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email Address"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-300 hover:border-emerald-400"
                          />
                        </FadeIn>
                        <FadeIn direction="up" delay={250} duration={600} distance={20}>
                          <input 
                            type="tel" 
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Phone Number"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-300 hover:border-emerald-400"
                          />
                        </FadeIn>
                      </div>
                    </div>

                    {/* CARGO DETAILS */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 flex items-center group">
                        <Package className="h-5 w-5 mr-3 text-emerald-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
                        <span className="group-hover:text-emerald-600 transition-colors duration-300">Cargo Details</span>
                      </h3>
                      <FadeIn direction="up" delay={300} duration={600} distance={20}>
                        <textarea 
                          name="cargoDetails"
                          required
                          value={formData.cargoDetails}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Describe your cargo (type, weight, volume, quantity, special handling requirements)"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-300 hover:border-emerald-400"
                        ></textarea>
                      </FadeIn>
                    </div>

                    {/* ROUTE & DESTINATION */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 flex items-center group">
                        <MapPin className="h-5 w-5 mr-3 text-emerald-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
                        <span className="group-hover:text-emerald-600 transition-colors duration-300">Route & Destination</span>
                      </h3>
                      <FadeIn direction="up" delay={350} duration={600} distance={20}>
                        <input 
                          type="text" 
                          name="route"
                          required
                          value={formData.route}
                          onChange={handleChange}
                          placeholder="From [City/Location] to [City/Location]"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-300 hover:border-emerald-400"
                        />
                      </FadeIn>
                    </div>

                    {/* TIMELINE */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 flex items-center group">
                        <Clock className="h-5 w-5 mr-3 text-emerald-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
                        <span className="group-hover:text-emerald-600 transition-colors duration-300">Timeline</span>
                      </h3>
                      <FadeIn direction="up" delay={400} duration={600} distance={20}>
                        <input 
                          type="text" 
                          name="timeline"
                          required
                          value={formData.timeline}
                          onChange={handleChange}
                          placeholder="e.g., Pickup on 15 Aug, delivery by 18 Aug"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-300 hover:border-emerald-400"
                        />
                      </FadeIn>
                    </div>

                    {/* SPECIAL REQUIREMENTS */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">Special Requirements</h3>
                      <FadeIn direction="up" delay={450} duration={600} distance={20}>
                        <textarea 
                          name="specialRequirements"
                          value={formData.specialRequirements}
                          onChange={handleChange}
                          rows={4}
                          placeholder="Any special requirements, handling instructions, insurance needs, or other important details"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-300 hover:border-emerald-400"
                        ></textarea>
                      </FadeIn>
                    </div>
                      </>
                    ) : (
                      /* TRANSPORTER FORM */
                      <>
                        {/* COMPANY INFORMATION */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-slate-900 flex items-center group">
                            <Truck className="h-5 w-5 mr-3 text-emerald-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
                            <span className="group-hover:text-emerald-600 transition-colors duration-300">Company Information</span>
                          </h3>
                          <div className="grid md:grid-cols-2 gap-5">
                            <FadeIn direction="up" delay={100} duration={600} distance={20}>
                              <input 
                                type="text" 
                                name="companyName"
                                required
                                value={transporterData.companyName}
                                onChange={handleChange}
                                placeholder="Company Name"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-300 hover:border-emerald-400"
                              />
                            </FadeIn>
                            <FadeIn direction="up" delay={150} duration={600} distance={20}>
                              <input 
                                type="text" 
                                name="contactName"
                                required
                                value={transporterData.contactName}
                                onChange={handleChange}
                                placeholder="Contact Person"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-300 hover:border-emerald-400"
                              />
                            </FadeIn>
                          </div>
                          <div className="grid md:grid-cols-2 gap-5">
                            <FadeIn direction="up" delay={200} duration={600} distance={20}>
                              <input 
                                type="email" 
                                name="email"
                                required
                                value={transporterData.email}
                                onChange={handleChange}
                                placeholder="Email Address"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-300 hover:border-emerald-400"
                              />
                            </FadeIn>
                            <FadeIn direction="up" delay={250} duration={600} distance={20}>
                              <input 
                                type="tel" 
                                name="phone"
                                required
                                value={transporterData.phone}
                                onChange={handleChange}
                                placeholder="Phone Number"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-300 hover:border-emerald-400"
                              />
                            </FadeIn>
                          </div>
                        </div>

                        {/* FLEET DETAILS */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-slate-900 flex items-center group">
                            <Package className="h-5 w-5 mr-3 text-emerald-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
                            <span className="group-hover:text-emerald-600 transition-colors duration-300">Fleet Details</span>
                          </h3>
                          <div className="grid md:grid-cols-2 gap-5">
                            <FadeIn direction="up" delay={300} duration={600} distance={20}>
                              <select
                                name="country"
                                required
                                value={transporterData.country}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 transition-all duration-300 hover:border-emerald-400"
                              >
                                <option value="">Select Country</option>
                                <option value="South Africa">South Africa</option>
                                <option value="Botswana">Botswana</option>
                                <option value="Zambia">Zambia</option>
                                <option value="Zimbabwe">Zimbabwe</option>
                                <option value="Namibia">Namibia</option>
                                <option value="Other">Other</option>
                              </select>
                            </FadeIn>
                            <FadeIn direction="up" delay={350} duration={600} distance={20}>
                              <input 
                                type="text" 
                                name="fleetSize"
                                required
                                value={transporterData.fleetSize}
                                onChange={handleChange}
                                placeholder="Fleet Size (e.g., 10 trucks)"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-300 hover:border-emerald-400"
                              />
                            </FadeIn>
                          </div>
                          <FadeIn direction="up" delay={400} duration={600} distance={20}>
                            <input 
                              type="text" 
                              name="vehicleTypes"
                              required
                              value={transporterData.vehicleTypes}
                              onChange={handleChange}
                              placeholder="Vehicle Types (e.g., Flatbed, Refrigerated, Tanker)"
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-300 hover:border-emerald-400"
                            />
                          </FadeIn>
                        </div>

                        {/* OPERATING DETAILS */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-slate-900 flex items-center group">
                            <MapPin className="h-5 w-5 mr-3 text-emerald-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
                            <span className="group-hover:text-emerald-600 transition-colors duration-300">Operating Details</span>
                          </h3>
                          <FadeIn direction="up" delay={450} duration={600} distance={20}>
                            <input 
                              type="text" 
                              name="operatingRoutes"
                              required
                              value={transporterData.operatingRoutes}
                              onChange={handleChange}
                              placeholder="Primary Operating Routes"
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-300 hover:border-emerald-400"
                            />
                          </FadeIn>
                          <FadeIn direction="up" delay={500} duration={600} distance={20}>
                            <input 
                              type="text" 
                              name="yearsInBusiness"
                              required
                              value={transporterData.yearsInBusiness}
                              onChange={handleChange}
                              placeholder="Years in Business"
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-300 hover:border-emerald-400"
                            />
                          </FadeIn>
                        </div>

                        {/* ADDITIONAL MESSAGE */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-slate-900">Additional Information</h3>
                          <FadeIn direction="up" delay={550} duration={600} distance={20}>
                            <textarea 
                              name="message"
                              value={transporterData.message}
                              onChange={handleChange}
                              rows={4}
                              placeholder="Tell us about your company, certifications, and why you want to join FleetXchange"
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-300 hover:border-emerald-400"
                            ></textarea>
                          </FadeIn>
                        </div>
                      </>
                    )}

                    <div className="pt-8">
                      {submitStatus && (
                        <FadeIn direction="up" delay={0} duration={500} distance={10}>
                          <div className={`mb-4 p-4 rounded-lg ${
                            submitStatus.type === 'success' 
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 animate-pulse' 
                              : 'bg-red-50 text-red-800 border border-red-200'
                          }`}>
                            {submitStatus.message}
                          </div>
                        </FadeIn>
                      )}
                      <FadeIn direction="up" delay={500} duration={800} distance={20}>
                        <button 
                          type="submit"
                          disabled={isSubmitting}
                          className="group relative w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-500 font-semibold text-base overflow-hidden"
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            {isSubmitting ? 'Submitting...' : (formType === 'client' ? 'Submit Load Request' : 'Submit Application')}
                            {!isSubmitting && (
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="20" 
                                height="20" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                                className="group-hover:translate-x-1 transition-transform duration-300"
                              >
                                <path d="M5 12h14"></path>
                                <path d="m12 5 7 7-7 7"></path>
                              </svg>
                            )}
                          </span>
                          <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></span>
                        </button>
                      </FadeIn>
                    </div>
                  </form>
                </div>
              </FadeIn>
            </div>

            {/* RIGHT COLUMN - WHAT HAPPENS NEXT & CONTACT INFO */}
            <div>
              {/* WHAT HAPPENS NEXT */}
              <FadeIn direction="right" delay={200} duration={800} distance={40} blur={true}>
                <div className="rounded-xl border border-none shadow-xl bg-white p-6 mb-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">What Happens Next?</h3>
                  
                  <div className="space-y-3">
                    {[
                      { step: "1", title: "Review", desc: "We assess your request within 24 hours" },
                      { step: "2", title: "Proposal", desc: "Receive pricing and timeline options" },
                      { step: "3", title: "Confirmation", desc: "Load Confirmation Sheet issued" },
                      { step: "4", title: "Execution", desc: "We coordinate and oversee the movement" }
                    ].map((item, index) => (
                      <FadeIn 
                        key={index}
                        direction="right" 
                        delay={300 + (index * 100)} 
                        duration={500}
                        distance={15}
                      >
                        <div className="flex gap-3 items-start group">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center h-7 w-7 rounded-full bg-emerald-500 text-white font-bold text-xs group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-300">
                              {item.step}
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors duration-300">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors duration-300">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      </FadeIn>
                    ))}
                  </div>
                </div>
              </FadeIn>

              {/* Contact Our Offices Box */}
              <FadeIn direction="right" delay={400} duration={800} distance={40} blur={true}>
                <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 border border-slate-700 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:border-emerald-500/30 relative overflow-hidden group">
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <div className="relative">
                    <h4 className="text-lg font-bold mb-8 flex items-center">
                      <MapPin className="h-5 w-5 text-emerald-400 mr-2 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" />
                      Contact Our Offices
                    </h4>
                    
                    <div className="space-y-6">
                      {/* South Africa */}
                      <div className="pb-6 border-b border-slate-700 group/country">
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="h-5 w-5 text-emerald-400 group-hover/country:scale-110 transition-transform duration-300" />
                          <p className="font-bold text-emerald-400 text-sm group-hover/country:text-emerald-300 transition-colors duration-300">South Africa</p>
                        </div>
                        <p className="text-sm text-gray-200 mb-2 font-medium">Johannesburg</p>
                        <p className="text-xs text-gray-400 mb-1">Email:</p>
                        <p className="text-sm text-gray-300 font-medium mb-3 group-hover/country:text-white transition-colors duration-300">mrtiger@fleetxchange.africa</p>
                        <p className="text-xs text-gray-400 mb-1">Phone:</p>
                        <p className="text-sm text-gray-300 font-medium group-hover/country:text-white transition-colors duration-300">+27 73 828 1478</p>
                      </div>

                      {/* Botswana */}
                      <div className="pb-6 border-b border-slate-700 group/country">
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="h-5 w-5 text-emerald-400 group-hover/country:scale-110 transition-transform duration-300" />
                          <p className="font-bold text-emerald-400 text-sm group-hover/country:text-emerald-300 transition-colors duration-300">Botswana</p>
                        </div>
                        <p className="text-sm text-gray-200 mb-2 font-medium">Gaborone</p>
                        <p className="text-xs text-gray-400 mb-1">Email:</p>
                        <p className="text-sm text-gray-300 font-medium mb-3 group-hover/country:text-white transition-colors duration-300">mrtiger@fleetxchange.africa</p>
                        <p className="text-xs text-gray-400 mb-1">Phone:</p>
                        <p className="text-sm text-gray-300 font-medium group-hover/country:text-white transition-colors duration-300">+267 76 666 598</p>
                      </div>

                      {/* Zambia */}
                      <div className="group/country">
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="h-5 w-5 text-emerald-400 group-hover/country:scale-110 transition-transform duration-300" />
                          <p className="font-bold text-emerald-400 text-sm group-hover/country:text-emerald-300 transition-colors duration-300">Zambia</p>
                        </div>
                        <p className="text-sm text-gray-200 mb-2 font-medium">Lusaka</p>
                        <p className="text-xs text-gray-400 mb-1">Email:</p>
                        <p className="text-sm text-gray-300 font-medium group-hover/country:text-white transition-colors duration-300">mrtiger@fleetxchange.africa</p>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-700 text-xs text-gray-400">
                      <p>Our team is available <span className="font-semibold text-gray-300 group-hover:text-white transition-colors duration-300">Monday to Friday, 8AM - 5PM SAST</span></p>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* BRAND STATEMENT SECTION */}
              <FadeIn direction="up" delay={500} duration={800} distance={30} blur={true}>
                <section className="py-12">
                  <div className="w-full">
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center hover:shadow-xl transition-all duration-500 hover:-translate-y-1 hover:border-emerald-300 group">
                      <div className="relative inline-block">
                        <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" />
                        <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-0 group-hover:opacity-100"></span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors duration-300">
                        We tell the story
                      </h3>
                      <p className="text-gray-700 text-sm group-hover:text-gray-900 transition-colors duration-300">
                        Professional freight coordination across Southern Africa
                      </p>
                    </div>
                  </div>
                </section>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING MESSAGE */}
      <section className="py-20 bg-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.15) 1px, transparent 0px)",
            backgroundSize: "30px 30px"
          }}></div>
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Every successful movement starts with a clear story
            </h2>
          </FadeIn>
          
          <FadeIn direction="up" delay={200} duration={800} distance={20} blur={true}>
            <p className="text-lg text-gray-700">
              Let FleetXchange be your single point of coordination for freight across Southern Africa.
            </p>
          </FadeIn>

          {/* Animated underline */}
          <FadeIn direction="up" delay={300} duration={600} distance={10}>
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mt-8 rounded-full overflow-hidden">
              <div className="w-full h-full bg-white transform -translate-x-full animate-[slide_2s_ease-in-out_infinite]"></div>
            </div>
          </FadeIn>
        </div>
      </section>

      <style jsx>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ContactForm />
    </Suspense>
  );
}