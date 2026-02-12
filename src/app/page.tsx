import { MapPin, Package, TrendingUp, Eye, Gauge, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center space-y-8">
            <div className="inline-block px-6 py-2.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-full mb-4 backdrop-blur-sm">
              <span className="text-emerald-400 text-sm font-semibold tracking-wide">Africa&#39;s Largest Freight Hub</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              We tell the story of
              <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mt-2">every shipment</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Unified logistics visibility, predictive insights, and trusted compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <a href="/contact">
                <button className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-lg px-8 py-3 rounded-md shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  Request a Demo
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </button>
              </a>
              <a href="/about">
                <button className="border-2 border-white/80 text-white hover:bg-white hover:text-slate-900 text-lg px-8 py-3 rounded-md transition-all duration-300 backdrop-blur-sm">
                  Learn More
                </button>
              </a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* WHY WE TELL THE STORY SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Why We Tell The Story</h2>
          <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
            <p>
              When cargo moves across borders, <span className="font-semibold">clarity becomes the difference between success and disruption.</span> At FleetXchange, we tell the story of every load — so our clients always know:
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 p-8 space-y-3 cursor-pointer hover:border-emerald-500 hover:bg-emerald-100/80 hover:shadow-lg hover:shadow-emerald-200 transition-all duration-300 hover:-translate-y-2">
                <MapPin className="h-8 w-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-slate-900">where their cargo is</p>
              </div>
              <div className="rounded-2xl border-2 border-blue-300 bg-blue-50/60 p-8 space-y-3 cursor-pointer hover:border-blue-500 hover:bg-blue-100/80 hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 hover:-translate-y-2">
                <Package className="h-8 w-8 text-blue-600 mx-auto" />
                <p className="font-bold text-slate-900">what is happening</p>
              </div>
              <div className="rounded-2xl border-2 border-pink-300 bg-pink-50/60 p-8 space-y-3 cursor-pointer hover:border-pink-500 hover:bg-pink-100/80 hover:shadow-lg hover:shadow-pink-200 transition-all duration-300 hover:-translate-y-2">
                <TrendingUp className="h-8 w-8 text-pink-600 mx-auto" />
                <p className="font-bold text-slate-900">what comes next</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE DO SECTION */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">What We Do</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* VISIBILITY CARD */}
            <div className="rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white p-8">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4 mx-auto">
                <Eye className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">Visibility</h3>
              <p className="text-gray-600 text-center">Milestone-based updates and live tracking where required</p>
            </div>
            
            {/* CONTROL CARD */}
            <div className="rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white p-8">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 mx-auto">
                <Gauge className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">Control</h3>
              <p className="text-gray-600 text-center">One coordination partner with defined escalation paths</p>
            </div>
            
            {/* EFFICIENCY CARD */}
            <div className="rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white p-8">
              <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">Efficiency</h3>
              <p className="text-gray-600 text-center">Faster access to capacity with less admin and fewer follow-ups</p>
            </div>
            
            {/* ACCOUNTABILITY CARD */}
            <div className="rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white p-8">
              <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center mb-4 mx-auto">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">Accountability</h3>
              <p className="text-gray-600 text-center">Every load documented, monitored, and professionally managed</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHO WE ARE SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-8">Who We Are</h2>
          <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
            <p className="text-center font-semibold text-xl text-slate-900">
              FleetXchange is not a trucking company. We are a logistics coordination and oversight partner that connects businesses to a network of verified transporters across Southern Africa.
            </p>
            <p>
              Instead of managing multiple transporters, drivers, and intermediaries, our clients work with one central partner responsible for overseeing the entire movement.
            </p>
            <p className="font-semibold text-emerald-700 text-center text-xl pt-4">
              We don&#39;t just source trucks — we manage the process.<br />
              That&#39;s how we tell the story.
            </p>
          </div>
        </div>
      </section>

      {/* WHERE WE OPERATE SECTION */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: "radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.4) 1px, transparent 0px)", backgroundSize: "40px 40px"}}></div>
        <div className="relative max-w-full mx-auto px-4 sm:px-6 lg:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">Where We Operate</h2>
          <p className="text-lg text-center text-gray-300 mb-16">We support freight movements across key corridors in:</p>
          <div className="grid md:grid-cols-5 gap-6 mb-8">
            <div className="rounded-2xl border border-slate-700 bg-slate-800/40 backdrop-blur-sm p-8 text-center cursor-pointer hover:border-emerald-400 hover:bg-slate-800/60 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-1">
              <MapPin className="h-8 w-8 text-emerald-400 mx-auto mb-4" />
              <p className="font-semibold text-white">South Africa</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800/40 backdrop-blur-sm p-8 text-center cursor-pointer hover:border-emerald-400 hover:bg-slate-800/60 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-1">
              <MapPin className="h-8 w-8 text-emerald-400 mx-auto mb-4" />
              <p className="font-semibold text-white">Botswana</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800/40 backdrop-blur-sm p-8 text-center cursor-pointer hover:border-emerald-400 hover:bg-slate-800/60 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-1">
              <MapPin className="h-8 w-8 text-emerald-400 mx-auto mb-4" />
              <p className="font-semibold text-white">Zimbabwe</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800/40 backdrop-blur-sm p-8 text-center cursor-pointer hover:border-emerald-400 hover:bg-slate-800/60 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-1">
              <MapPin className="h-8 w-8 text-emerald-400 mx-auto mb-4" />
              <p className="font-semibold text-white">Zambia</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800/40 backdrop-blur-sm p-8 text-center cursor-pointer hover:border-emerald-400 hover:bg-slate-800/60 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-1">
              <MapPin className="h-8 w-8 text-emerald-400 mx-auto mb-4" />
              <p className="font-semibold text-white">Democratic Republic of Congo (DRC)</p>
            </div>
          </div>
          <p className="text-center text-gray-400">Across long-haul, regional, and cross-border routes.</p>
        </div>
      </section>

      {/* HOW WE TELL THE STORY SECTION */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">How We Tell The Story</h2>
          <div className="space-y-6">
            <p className="text-lg text-center text-gray-700 mb-12">The FleetXchange Story Flow:</p>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl hover:shadow-emerald-200 p-6 text-center cursor-pointer transition-all duration-300 hover:-translate-y-2">
                <div className="text-5xl font-bold text-emerald-500 mb-3">01</div>
                <p className="text-gray-700 font-medium">Connect your data</p>
              </div>
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl hover:shadow-blue-200 p-6 text-center cursor-pointer transition-all duration-300 hover:-translate-y-2">
                <div className="text-5xl font-bold text-blue-500 mb-3">02</div>
                <p className="text-gray-700 font-medium">Track in real time</p>
              </div>
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl hover:shadow-pink-200 p-6 text-center cursor-pointer transition-all duration-300 hover:-translate-y-2">
                <div className="text-5xl font-bold text-pink-500 mb-3">03</div>
                <p className="text-gray-700 font-medium">Predict and act</p>
              </div>
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl hover:shadow-orange-200 p-6 text-center cursor-pointer transition-all duration-300 hover:-translate-y-2">
                <div className="text-5xl font-bold text-orange-500 mb-3">04</div>
                <p className="text-gray-700 font-medium">Ensure compliance and trust</p>
              </div>
            </div>
            <p className="text-center text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent pt-8">
              Because when the story is clear, the outcome is predictable.
            </p>
          </div>
        </div>
      </section>

      {/* KEY FEATURES SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="rounded-2xl border-2 border-emerald-200 bg-white p-8 hover:border-emerald-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Real-time Shipment Tracking</h3>
              <p className="text-gray-600 text-sm">Live visibility into every movement across the supply chain.</p>
            </div>
            <div className="rounded-2xl border-2 border-blue-200 bg-white p-8 hover:border-blue-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Load & Transporter Management</h3>
              <p className="text-gray-600 text-sm">Comprehensive management of loads and verified transporter networks.</p>
            </div>
            <div className="rounded-2xl border-2 border-purple-200 bg-white p-8 hover:border-purple-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Route Optimization & ETA Prediction</h3>
              <p className="text-gray-600 text-sm">Intelligent routing and accurate delivery time estimations.</p>
            </div>
            <div className="rounded-2xl border-2 border-pink-200 bg-white p-8 hover:border-pink-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <div className="h-12 w-12 rounded-lg bg-pink-100 flex items-center justify-center mb-4">
                <Gauge className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Analytics & Reporting</h3>
              <p className="text-gray-600 text-sm">Comprehensive dashboards and actionable insights from your data.</p>
            </div>
            <div className="rounded-2xl border-2 border-orange-200 bg-white p-8 hover:border-orange-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Compliance & Audit Ready</h3>
              <p className="text-gray-600 text-sm">Built-in compliance frameworks and audit trail capabilities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* USE CASES SECTION */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-2xl border-l-4 border-emerald-500 bg-white p-10 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">FMCG & Retail Distribution</h3>
              <p className="text-gray-700 text-lg">Manage complex multi-point distribution networks across regions with real-time visibility and compliance.</p>
            </div>
            <div className="rounded-2xl border-l-4 border-blue-500 bg-white p-10 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Cross-Border Freight</h3>
              <p className="text-gray-700 text-lg">Navigate complex regulatory requirements and coordinate movements across multiple countries seamlessly.</p>
            </div>
            <div className="rounded-2xl border-l-4 border-purple-500 bg-white p-10 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Enterprise Logistics Operations</h3>
              <p className="text-gray-700 text-lg">Centralize control of diverse logistics operations with unified tracking and coordination.</p>
            </div>
            <div className="rounded-2xl border-l-4 border-pink-500 bg-white p-10 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">High-Value & Regulated Cargo</h3>
              <p className="text-gray-700 text-lg">Ensure complete traceability and compliance for sensitive shipments with enhanced security protocols.</p>
            </div>
          </div>
        </div>
      </section>

      {/* INTEGRATIONS SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">Integrations</h2>
          <p className="text-lg text-center text-gray-700 mb-12">FleetXchange integrates with your existing systems:</p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 p-10 text-center hover:border-emerald-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <div className="text-4xl font-bold text-emerald-600 mb-3">→</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Fleet Tracking Systems</h3>
              <p className="text-gray-700">Connect with GPS, telematics, and vehicle tracking platforms.</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 p-10 text-center hover:border-blue-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <div className="text-4xl font-bold text-blue-600 mb-3">⚙</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">APIs & ERP Systems</h3>
              <p className="text-gray-700">Seamless integration with enterprise resource planning and business systems.</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-200 p-10 text-center hover:border-orange-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <div className="text-4xl font-bold text-orange-600 mb-3">📡</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Telematics & IoT Devices</h3>
              <p className="text-gray-700">Real-time data from sensors, IoT devices, and connected hardware.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CASE STUDIES SECTION */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">Case Studies</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Case Study 1 */}
            <div className="rounded-2xl bg-white border-2 border-slate-200 p-10 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-emerald-600 mb-2 uppercase tracking-wide">Challenge</h3>
                  <p className="text-gray-800 text-lg">FMCG distributor managing 50+ weekly shipments across 5 countries with fragmented coordination and visibility gaps.</p>
                </div>
                <div className="h-px bg-gradient-to-r from-emerald-400 via-teal-400 to-transparent"></div>
                <div>
                  <h3 className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-wide">FleetXchange Solution</h3>
                  <p className="text-gray-800 text-lg">Unified platform for load coordination, real-time tracking, milestone updates, and proactive issue escalation.</p>
                </div>
                <div className="h-px bg-gradient-to-r from-blue-400 via-purple-400 to-transparent"></div>
                <div>
                  <h3 className="text-sm font-bold text-orange-600 mb-2 uppercase tracking-wide">Business Impact</h3>
                  <p className="text-gray-800 text-lg font-semibold text-emerald-700">30% reduction in delivery delays • 40% fewer coordination touchpoints • 99% shipment visibility</p>
                </div>
              </div>
            </div>

            {/* Case Study 2 */}
            <div className="rounded-2xl bg-white border-2 border-slate-200 p-10 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-emerald-600 mb-2 uppercase tracking-wide">Challenge</h3>
                  <p className="text-gray-800 text-lg">Enterprise logistics operator struggling with compliance documentation, audit readiness, and cross-border regulatory complexity.</p>
                </div>
                <div className="h-px bg-gradient-to-r from-emerald-400 via-teal-400 to-transparent"></div>
                <div>
                  <h3 className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-wide">FleetXchange Solution</h3>
                  <p className="text-gray-800 text-lg">Automated compliance frameworks, digital audit trails, regulatory requirement verification, and instant reporting capabilities.</p>
                </div>
                <div className="h-px bg-gradient-to-r from-blue-400 via-purple-400 to-transparent"></div>
                <div>
                  <h3 className="text-sm font-bold text-orange-600 mb-2 uppercase tracking-wide">Business Impact</h3>
                  <p className="text-gray-800 text-lg font-semibold text-emerald-700">100% audit readiness • 60% faster compliance verification • Zero regulatory violations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-20 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.4) 1px, transparent 0px)", backgroundSize: "40px 40px"}}></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Let&#39;s tell the story of your next load</h2>
          <a href="/contact">
            <button className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white text-lg px-12 py-2 rounded-md shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              Request a Load Movement
            </button>
          </a>
        </div>
      </section>
       <div className="h-[80px] w-full bg-white"></div>
    </div>
  );
}
