import PageHero from "@/components/PageHero";
import { FileText, DollarSign, CheckCircle, Truck, Package } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      <PageHero 
        title="How we tell the story" 
        subtitle="A clear, structured journey from request to delivery"
        badge="Our Process"
      />
      
      {/* PROCESS STEPS SECTION */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* STEP 1 */}
            <div className="border-l-4 border-emerald-500 bg-white rounded-xl p-10 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <FileText className="h-7 w-7 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Step 01: Load Request</h3>
                  <p className="text-gray-700 text-base leading-relaxed">
                    You submit your cargo details, route, timelines, and any special requirements.
                  </p>
                </div>
              </div>
            </div>

            {/* STEP 2 */}
            <div className="border-l-4 border-blue-500 bg-white rounded-xl p-10 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <DollarSign className="h-7 w-7 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Step 02: Pricing & Planning</h3>
                  <p className="text-gray-700 text-base mb-4 leading-relaxed">
                    We assess the request and identify suitable verified transporters. You receive pricing options, proposed timelines, and operational requirements.
                  </p>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-2">This ensures clarity before commitment:</p>
                    <div className="space-y-1 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        pricing options
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        proposed timelines
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        operational/security requirements
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3 */}
            <div className="border-l-4 border-purple-500 bg-white rounded-xl p-10 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-7 w-7 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Step 03: Load Confirmation</h3>
                  <p className="text-gray-700 text-base mb-4 leading-relaxed">
                    Once terms are agreed, FleetXchange issues a Load Confirmation Sheet defining all key parameters.
                  </p>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 mb-4">
                    <p className="text-xs font-semibold text-purple-900 mb-2">This ensures clarity before commitment:</p>
                    <div className="space-y-1 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                        agreed pricing
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                        route and timelines
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                        tracking and reporting requirements
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400">
                    <p className="text-yellow-800 text-sm font-semibold">✓ This is where the story is formally written.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 4 */}
            <div className="border-l-4 border-orange-500 bg-white rounded-xl p-10 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Truck className="h-7 w-7 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Step 04: Execution & Oversight</h3>
                  <p className="text-gray-700 text-base leading-relaxed">
                    We coordinate the movement, monitor progress, and provide updates while managing communication and escalation throughout transit.
                  </p>
                </div>
              </div>
            </div>

            {/* STEP 5 */}
            <div className="border-l-4 border-teal-500 bg-white rounded-xl p-10 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Package className="h-7 w-7 text-teal-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Step 05: Delivery & Close-Out</h3>
                  <p className="text-gray-700 text-base leading-relaxed">
                    Delivery is confirmed, milestones are closed, and the load is completed in line with agreed terms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING MESSAGE SECTION */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">From confirmation to delivery</h2>
          <p className="text-xl text-gray-700 leading-relaxed">
            We tell the story so you always know what&#39;s happening and why.
          </p>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-20 bg-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to experience the difference?</h2>
          <p className="text-xl text-gray-300 mb-8">Start your structured journey today.</p>
          <a href="/contact">
            <button className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-lg px-8 py-3 rounded-md shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              Request a Load Movement
            </button>
          </a>
        </div>
      </section>
       <div className="h-[80px] w-full bg-white"></div>
    </div>
  );
}
