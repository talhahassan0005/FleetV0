import PageHero from "@/components/PageHero";
import { Shield, FileCheck, Camera, CheckCircle2 } from 'lucide-react';

export default function CompliancePage() {
  return (
    <div className="min-h-screen">
      <PageHero 
        title="Protecting the story" 
        subtitle="Structured controls and professional oversight to protect cargo, timelines, and commercial outcomes"
        badge="Risk Management"
      />
      
      {/* COMPLIANCE, RISK & VISIBILITY SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">Compliance, Risk & Visibility</h2>
          <div className="text-lg text-gray-700 leading-relaxed space-y-6 text-center max-w-3xl mx-auto">
            <p>
              We apply structured controls and enhanced oversight based on cargo value, route risk, and client requirements. Higher-value and higher-risk movements receive additional monitoring, documentation, and insurance validation.
            </p>
          </div>
        </div>
      </section>

      {/* SECURITY & COMPLIANCE FRAMEWORK SECTION */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">Our Security & Compliance Framework</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* ACTIVE TRACKING */}
            <div className="rounded-xl border border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-8">
              <Shield className="h-8 w-8 text-emerald-600 mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Active Tracking</h3>
              <p className="text-gray-700 leading-relaxed text-lg">Real-time GPS monitoring for high-value and sensitive loads</p>
            </div>

            {/* ENHANCED REPORTING */}
            <div className="rounded-xl border border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-8">
              <FileCheck className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Enhanced Reporting</h3>
              <p className="text-gray-700 leading-relaxed text-lg">Detailed documentation and milestone updates throughout transit</p>
            </div>

            {/* DASHCAM REQUIREMENTS */}
            <div className="rounded-xl border border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-8">
              <Camera className="h-8 w-8 text-purple-600 mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Dashcam Requirements</h3>
              <p className="text-gray-700 leading-relaxed text-lg">Video recording for high-risk or high-value loads</p>
            </div>

            {/* INSURANCE VERIFICATION */}
            <div className="rounded-xl border border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-8">
              <CheckCircle2 className="h-8 w-8 text-orange-600 mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Insurance Verification</h3>
              <p className="text-gray-700 leading-relaxed text-lg">Confirmed coverage before every movement</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY THESE MEASURES MATTER SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">Why These Measures Matter</h2>
          <p className="text-lg text-gray-700 text-center mb-12">These controls are designed to:</p>
          <div className="rounded-xl text-slate-900 border-2 border-emerald-200 shadow-xl bg-white p-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                <span className="text-lg text-gray-700">Reduce cargo risk through enhanced visibility</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                <span className="text-lg text-gray-700">Support insurance claims with documented evidence</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                <span className="text-lg text-gray-700">Enable faster incident investigation and resolution</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                <span className="text-lg text-gray-700">Provide clients with complete peace of mind</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                <span className="text-lg text-gray-700">Maintain accountability throughout the supply chain</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RISK-BASED APPROACH SECTION */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">Risk-Based Approach</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* STANDARD LOADS */}
            <div className="rounded-xl text-slate-900 border-2 shadow-lg hover:shadow-xl transition-all duration-300 bg-blue-50 p-8">
              <h3 className="text-xl font-bold mb-4 text-blue-900">Standard Loads</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Basic tracking</li>
                <li>• Milestone updates</li>
                <li>• Insurance verification</li>
                <li>• Standard documentation</li>
              </ul>
            </div>

            {/* HIGH-VALUE LOADS */}
            <div className="rounded-xl text-slate-900 border-2 shadow-lg hover:shadow-xl transition-all duration-300 bg-orange-50 p-8">
              <h3 className="text-xl font-bold mb-4 text-orange-900">High-Value Loads</h3>
              <ul className="space-y-2 text-sm text-orange-800">
                <li>• Active GPS tracking</li>
                <li>• Enhanced reporting</li>
                <li>• Additional insurance</li>
                <li>• Frequent check-ins</li>
              </ul>
            </div>

            {/* HIGH-RISK ROUTES */}
            <div className="rounded-xl text-slate-900 border-2 shadow-lg hover:shadow-xl transition-all duration-300 bg-red-50 p-8">
              <h3 className="text-xl font-bold mb-4 text-red-900">High-Risk Routes</h3>
              <ul className="space-y-2 text-sm text-red-800">
                <li>• Live tracking</li>
                <li>• Dashcam requirement</li>
                <li>• Security protocols</li>
                <li>• Real-time monitoring</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* RISK MANAGEMENT CLOSING SECTION */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Open & Transparent Risk Management</h2>
          <p className="text-xl text-gray-700 leading-relaxed mb-8">
            We don&#39;t hide risk — we manage it openly.
          </p>
          <p className="text-lg text-gray-600">
            Every client knows what controls are in place, why they matter, and how they protect their interests.
          </p>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-20 bg-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Move your cargo with confidence</h2>
          <p className="text-xl text-gray-300 mb-8">Professional oversight. Structured controls. Complete visibility.</p>
          <a href="/contact">
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-12 py-2 rounded-md shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              Request a Load Movement
            </button>
          </a>
        </div>
      </section>
        <div className="h-[80px] w-full bg-white"></div>
    </div>
  );
}
