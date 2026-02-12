import PageHero from "@/components/PageHero";
import { Shield, Eye, Gauge, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function WhyChooseUsPage() {
  return (
    <div className="min-h-screen">
      <PageHero 
        title="Why we tell the story" 
        subtitle="Moving freight across Southern Africa involves borders, regulations, and risk. FleetXchange exists to remove uncertainty and give clients confidence throughout the transport process."
        badge="Why FleetXchange"
      />
      
      {/* WHY CLIENTS CHOOSE US SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">Why Clients Choose FleetXchange</h2>
          <div className="space-y-8">
            {/* ACCOUNTABILITY */}
            <div className="rounded-xl bg-white border-2 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-8">
              <div className="flex gap-6">
                <Shield className="h-8 w-8 text-emerald-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Accountability</h3>
                  <p className="text-lg text-gray-700">One coordination partner responsible for overseeing the entire movement.</p>
                </div>
              </div>
            </div>

            {/* VISIBILITY */}
            <div className="rounded-xl bg-white border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-8">
              <div className="flex gap-6">
                <Eye className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Visibility</h3>
                  <p className="text-lg text-gray-700">Milestone-based updates and live tracking where required. We tell the story of every load.</p>
                </div>
              </div>
            </div>

            {/* CONTROL */}
            <div className="rounded-xl bg-white border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-8">
              <div className="flex gap-6">
                <Gauge className="h-8 w-8 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Control</h3>
                  <p className="text-lg text-gray-700">Clear execution structure with defined escalation paths and approvals.</p>
                </div>
              </div>
            </div>

            {/* EFFICIENCY */}
            <div className="rounded-xl bg-white border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-8">
              <div className="flex gap-6">
                <TrendingUp className="h-8 w-8 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Efficiency</h3>
                  <p className="text-lg text-gray-700">Faster access to capacity, less admin, smoother execution.</p>
                </div>
              </div>
            </div>

            {/* INTEGRATION */}
            <div className="rounded-xl bg-white border-2 border-teal-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-8">
              <div className="flex gap-6">
                <CheckCircle2 className="h-8 w-8 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Integration</h3>
                  <p className="text-lg text-gray-700">Works across industries, fits existing workflows, and scales across regions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE FLEETXCHANGE DIFFERENCE SECTION */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">The FleetXchange Difference</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* SINGLE POINT OF CONTACT */}
            <div className="rounded-xl border bg-white border-none shadow-lg hover:shadow-xl transition-all duration-300 p-8">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Single Point of Contact</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">No more chasing multiple parties</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Clear communication channels</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Defined escalation procedures</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">One partner, full responsibility</span>
                </li>
              </ul>
            </div>

            {/* STRUCTURED PROCESS */}
            <div className="rounded-xl border bg-white border-none shadow-lg hover:shadow-xl transition-all duration-300 p-8">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Structured Process</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Load Confirmation Sheets for every movement</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Milestone-based tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Documented payment terms</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Professional close-out procedures</span>
                </li>
              </ul>
            </div>

            {/* RISK MANAGEMENT */}
            <div className="rounded-xl border bg-white border-none shadow-lg hover:shadow-xl transition-all duration-300 p-8">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Risk Management</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Verified transporter network</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Insurance validation</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Enhanced tracking for high-value loads</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Incident support and investigation</span>
                </li>
              </ul>
            </div>

            {/* SCALABLE SOLUTIONS */}
            <div className="rounded-xl border bg-white border-none shadow-lg hover:shadow-xl transition-all duration-300 p-8">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Scalable Solutions</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">One-off loads to regular routes</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Multiple cargo types supported</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Cross-industry experience</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Regional expansion capability</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* BUILT FOR BUSINESSES SECTION */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Built for businesses that value certainty</h2>
          <p className="text-xl text-gray-700 leading-relaxed mb-8">
            In logistics, the difference between success and failure often comes down to <span className="font-semibold text-emerald-700">knowing what&#39;s happening</span> and <span className="font-semibold text-emerald-700">having someone accountable</span> when things don&#39;t go to plan.
          </p>
          <p className="text-lg text-slate-900 font-semibold">That&#39;s why we tell the story.</p>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-20 bg-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Experience the FleetXchange advantage</h2>
          <p className="text-xl text-gray-300 mb-8">Clear processes. Professional oversight. Predictable outcomes.</p>
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
