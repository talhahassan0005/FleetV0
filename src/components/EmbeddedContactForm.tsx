'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, Package, MapPin, Clock, Truck, Building2 } from "lucide-react";
import FadeIn from "@/components/FadeIn";

interface EmbeddedContactFormProps {
  compact?: boolean;
  title?: string;
  subtitle?: string;
}

export default function EmbeddedContactForm({ 
  compact = false,
  title = "Tell us about your needs",
  subtitle = "We'll get back to you within 1 hour"
}: EmbeddedContactFormProps) {
  const router = useRouter();
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
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    if (type === 'transporter') {
      setFormType('transporter');
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (formType === 'client') {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    } else {
      setTransporterData({ ...transporterData, [e.target.name]: e.target.value });
    }
  };

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
        setTimeout(() => {
          router.push('/thank-you');
        }, 1000);
      } else {
        setSubmitStatus({ type: 'error', message: result.message || 'Failed to submit request' });
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (compact) {
    return (
      <section className="py-12 bg-gradient-to-r from-emerald-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="down" delay={0} duration={600} distance={20}>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">{title}</h2>
              <p className="text-sm text-gray-600">{subtitle}</p>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={100} duration={600} distance={20}>
            <div className="bg-white rounded-lg shadow-lg p-6 border border-emerald-100">
              {/* Toggle Buttons */}
              <div className="flex justify-center mb-6 gap-2">
                <button
                  onClick={() => { setFormType('client'); setSubmitStatus(null); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    formType === 'client'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  Ship Freight
                </button>
                <button
                  onClick={() => { setFormType('transporter'); setSubmitStatus(null); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    formType === 'transporter'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Truck className="h-4 w-4" />
                  Be a Transporter
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {submitStatus && (
                  <div className={`p-2 rounded text-sm font-medium ${
                    submitStatus.type === 'success' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {submitStatus.message}
                  </div>
                )}

                {formType === 'client' ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="text" 
                        name="companyName"
                        required
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Company"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                      />
                      <input 
                        type="text" 
                        name="contactPerson"
                        required
                        value={formData.contactPerson}
                        onChange={handleChange}
                        placeholder="Contact Person"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="email" 
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                      />
                      <input 
                        type="tel" 
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Phone"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                      />
                    </div>

                    <textarea 
                      name="cargoDetails"
                      required
                      value={formData.cargoDetails}
                      onChange={handleChange}
                      rows={2}
                      placeholder="What are you shipping? (type, weight, quantity)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                    ></textarea>

                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="text" 
                        name="route"
                        required
                        value={formData.route}
                        onChange={handleChange}
                        placeholder="From → To"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                      />
                      <input 
                        type="text" 
                        name="timeline"
                        required
                        value={formData.timeline}
                        onChange={handleChange}
                        placeholder="When needed?"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                      />
                    </div>

                    <input 
                      type="text" 
                      name="specialRequirements"
                      value={formData.specialRequirements}
                      onChange={handleChange}
                      placeholder="Any special requirements (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                    />
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="text" 
                        name="companyName"
                        required
                        value={transporterData.companyName}
                        onChange={handleChange}
                        placeholder="Company Name"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                      />
                      <input 
                        type="text" 
                        name="contactName"
                        required
                        value={transporterData.contactName}
                        onChange={handleChange}
                        placeholder="Contact Person"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="email" 
                        name="email"
                        required
                        value={transporterData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                      />
                      <input 
                        type="tel" 
                        name="phone"
                        required
                        value={transporterData.phone}
                        onChange={handleChange}
                        placeholder="Phone"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <select
                        name="country"
                        required
                        value={transporterData.country}
                        onChange={handleChange}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      >
                        <option value="">Country</option>
                        <option value="South Africa">South Africa</option>
                        <option value="Botswana">Botswana</option>
                        <option value="Zambia">Zambia</option>
                        <option value="Zimbabwe">Zimbabwe</option>
                        <option value="Namibia">Namibia</option>
                      </select>
                      <input 
                        type="text" 
                        name="fleetSize"
                        required
                        value={transporterData.fleetSize}
                        onChange={handleChange}
                        placeholder="Fleet Size"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="text" 
                        name="vehicleTypes"
                        required
                        value={transporterData.vehicleTypes}
                        onChange={handleChange}
                        placeholder="Vehicle Types"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      />
                      <input 
                        type="text" 
                        name="yearsInBusiness"
                        required
                        value={transporterData.yearsInBusiness}
                        onChange={handleChange}
                        placeholder="Years in Business"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      />
                    </div>

                    <textarea 
                      name="message"
                      value={transporterData.message}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Tell us about your company"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                    ></textarea>
                  </>
                )}

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-all text-sm"
                >
                  {isSubmitting ? 'Submitting...' : (formType === 'client' ? 'Get Quote' : 'Apply Now')}
                </button>
              </form>
            </div>
          </FadeIn>
        </div>
      </section>
    );
  }

  // Full version (for contact page)
  return (
    <div className="rounded-xl border border-none shadow-xl bg-white p-10 md:p-16 hover:shadow-2xl transition-all duration-500" style={{ color: '#111827' }}>
      <h2 className="text-3xl font-bold text-slate-900 mb-10">
        {formType === 'client' ? 'Request a Load Movement' : 'Apply as Transporter'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Toggle Buttons */}
        <div className="flex justify-start mb-8">
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

        {formType === 'client' ? (
          <>
            {/* COMPANY INFORMATION */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center group">
                <FileText className="h-5 w-5 mr-3 text-emerald-600" />
                Company Information
              </h3>
              <div className="grid md:grid-cols-2 gap-5">
                <input 
                  type="text" 
                  name="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Company Name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                />
                <input 
                  type="text" 
                  name="contactPerson"
                  required
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="Contact Person"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                />
                <input 
                  type="tel" 
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                />
              </div>
            </div>

            {/* CARGO DETAILS */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center group">
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
              ></textarea>
            </div>

            {/* ROUTE */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center group">
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
              />
            </div>

            {/* TIMELINE */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center group">
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
              ></textarea>
            </div>
          </>
        ) : (
          <>
            {/* TRANSPORTER FORM */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center group">
                <Truck className="h-5 w-5 mr-3 text-emerald-600" />
                Company Information
              </h3>
              <div className="grid md:grid-cols-2 gap-5">
                <input 
                  type="text" 
                  name="companyName"
                  required
                  value={transporterData.companyName}
                  onChange={handleChange}
                  placeholder="Company Name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                />
                <input 
                  type="text" 
                  name="contactName"
                  required
                  value={transporterData.contactName}
                  onChange={handleChange}
                  placeholder="Contact Person"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <input 
                  type="email" 
                  name="email"
                  required
                  value={transporterData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                />
                <input 
                  type="tel" 
                  name="phone"
                  required
                  value={transporterData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                />
              </div>
            </div>

            {/* FLEET DETAILS */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center group">
                <Package className="h-5 w-5 mr-3 text-emerald-600" />
                Fleet Details
              </h3>
              <div className="grid md:grid-cols-2 gap-5">
                <select
                  name="country"
                  required
                  value={transporterData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                >
                  <option value="">Select Country</option>
                  <option value="South Africa">South Africa</option>
                  <option value="Botswana">Botswana</option>
                  <option value="Zambia">Zambia</option>
                  <option value="Zimbabwe">Zimbabwe</option>
                  <option value="Namibia">Namibia</option>
                </select>
                <input 
                  type="text" 
                  name="fleetSize"
                  required
                  value={transporterData.fleetSize}
                  onChange={handleChange}
                  placeholder="Fleet Size (e.g., 10 trucks)"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
                />
              </div>
              <input 
                type="text" 
                name="vehicleTypes"
                required
                value={transporterData.vehicleTypes}
                onChange={handleChange}
                placeholder="Vehicle Types (e.g., Flatbed, Refrigerated, Tanker)"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
              />
            </div>

            {/* OPERATING DETAILS */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center group">
                <MapPin className="h-5 w-5 mr-3 text-emerald-600" />
                Operating Details
              </h3>
              <input 
                type="text" 
                name="operatingRoutes"
                required
                value={transporterData.operatingRoutes}
                onChange={handleChange}
                placeholder="Primary Operating Routes"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
              />
              <input 
                type="text" 
                name="yearsInBusiness"
                required
                value={transporterData.yearsInBusiness}
                onChange={handleChange}
                placeholder="Years in Business"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
              />
            </div>

            {/* MESSAGE */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Additional Information</h3>
              <textarea 
                name="message"
                value={transporterData.message}
                onChange={handleChange}
                rows={4}
                placeholder="Tell us about your company, certifications, and why you want to join FleetXchange"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
              ></textarea>
            </div>
          </>
        )}

        <div className="pt-8">
          {submitStatus && (
            <div className={`mb-4 p-4 rounded-lg ${
              submitStatus.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 animate-pulse' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {submitStatus.message}
            </div>
          )}
          <button 
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-500 font-semibold text-base overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isSubmitting ? 'Submitting...' : (formType === 'client' ? 'Submit Load Request' : 'Submit Application')}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
