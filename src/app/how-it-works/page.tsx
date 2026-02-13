'use client';

import PageHero from "@/components/PageHero";
import FadeIn from "@/components/FadeIn";
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
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.2) 1px, transparent 0px)",
            backgroundSize: "40px 40px"
          }}></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Timeline connector animation */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-emerald-300 via-blue-300 to-teal-300 opacity-30 hidden lg:block"></div>
          
          <div className="space-y-6">
            {/* STEP 1 */}
            <FadeIn direction="left" delay={100} duration={800} distance={40} blur={true}>
              <div className="group relative border-l-4 border-emerald-500 bg-white rounded-xl p-10 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer hover:border-emerald-600">
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 group-hover:bg-emerald-200">
                      <FileText className="h-7 w-7 text-emerald-600 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    {/* Pulse effect */}
                    <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-0 group-hover:opacity-100"></span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors duration-300">
                      Step 01: Load Request
                    </h3>
                    <p className="text-gray-700 text-base leading-relaxed group-hover:text-gray-900 transition-colors duration-300">
                      You submit your cargo details, route, timelines, and any special requirements.
                    </p>
                  </div>
                </div>
                {/* Step number indicator */}
                <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </FadeIn>

            {/* STEP 2 */}
            <FadeIn direction="right" delay={200} duration={800} distance={40} blur={true}>
              <div className="group relative border-l-4 border-blue-500 bg-white rounded-xl p-10 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer hover:border-blue-600">
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 group-hover:bg-blue-200">
                      <DollarSign className="h-7 w-7 text-blue-600 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <span className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping opacity-0 group-hover:opacity-100"></span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      Step 02: Pricing & Planning
                    </h3>
                    <p className="text-gray-700 text-base mb-4 leading-relaxed group-hover:text-gray-900 transition-colors duration-300">
                      We assess the request and identify suitable verified transporters. You receive pricing options, proposed timelines, and operational requirements.
                    </p>
                    
                    <FadeIn direction="up" delay={300} duration={600} distance={20}>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 group-hover:bg-blue-100 group-hover:border-blue-300 transition-all duration-300">
                        <p className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                          This ensures clarity before commitment:
                        </p>
                        <div className="space-y-1 text-sm text-gray-700">
                          {["pricing options", "proposed timelines", "operational/security requirements"].map((item, index) => (
                            <div key={index} className="flex items-center gap-2 group/item">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full group-hover/item:scale-150 transition-transform duration-300"></span>
                              <span className="group-hover/item:text-blue-700 transition-colors duration-300">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </FadeIn>
                  </div>
                </div>
                <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </FadeIn>

            {/* STEP 3 */}
            <FadeIn direction="left" delay={300} duration={800} distance={40} blur={true}>
              <div className="group relative border-l-4 border-purple-500 bg-white rounded-xl p-10 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer hover:border-purple-600">
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 group-hover:bg-purple-200">
                      <CheckCircle className="h-7 w-7 text-purple-600 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <span className="absolute inset-0 rounded-full bg-purple-400/20 animate-ping opacity-0 group-hover:opacity-100"></span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">
                      Step 03: Load Confirmation
                    </h3>
                    <p className="text-gray-700 text-base mb-4 leading-relaxed group-hover:text-gray-900 transition-colors duration-300">
                      Once terms are agreed, FleetXchange issues a Load Confirmation Sheet defining all key parameters.
                    </p>
                    
                    <FadeIn direction="up" delay={400} duration={600} distance={20}>
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 mb-4 group-hover:bg-purple-100 group-hover:border-purple-300 transition-all duration-300">
                        <p className="text-xs font-semibold text-purple-900 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                          This ensures clarity before commitment:
                        </p>
                        <div className="space-y-1 text-sm text-gray-700">
                          {["agreed pricing", "route and timelines", "tracking and reporting requirements"].map((item, index) => (
                            <div key={index} className="flex items-center gap-2 group/item">
                              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full group-hover/item:scale-150 transition-transform duration-300"></span>
                              <span className="group-hover/item:text-purple-700 transition-colors duration-300">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </FadeIn>
                    
                    <FadeIn direction="up" delay={500} duration={600} distance={20}>
                      <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 group-hover:bg-yellow-100 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/10 to-yellow-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <p className="text-yellow-800 text-sm font-semibold flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-yellow-600 group-hover:scale-110 transition-transform duration-300" />
                          ✓ This is where the story is formally written.
                        </p>
                      </div>
                    </FadeIn>
                  </div>
                </div>
                <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-purple-500 rounded-full border-4 border-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </FadeIn>

            {/* STEP 4 */}
            <FadeIn direction="right" delay={400} duration={800} distance={40} blur={true}>
              <div className="group relative border-l-4 border-orange-500 bg-white rounded-xl p-10 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer hover:border-orange-600">
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 group-hover:bg-orange-200">
                      <Truck className="h-7 w-7 text-orange-600 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <span className="absolute inset-0 rounded-full bg-orange-400/20 animate-ping opacity-0 group-hover:opacity-100"></span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors duration-300">
                      Step 04: Execution & Oversight
                    </h3>
                    <p className="text-gray-700 text-base leading-relaxed group-hover:text-gray-900 transition-colors duration-300">
                      We coordinate the movement, monitor progress, and provide updates while managing communication and escalation throughout transit.
                    </p>
                  </div>
                </div>
                <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-orange-500 rounded-full border-4 border-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </FadeIn>

            {/* STEP 5 */}
            <FadeIn direction="left" delay={500} duration={800} distance={40} blur={true}>
              <div className="group relative border-l-4 border-teal-500 bg-white rounded-xl p-10 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer hover:border-teal-600">
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 group-hover:bg-teal-200">
                      <Package className="h-7 w-7 text-teal-600 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <span className="absolute inset-0 rounded-full bg-teal-400/20 animate-ping opacity-0 group-hover:opacity-100"></span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors duration-300">
                      Step 05: Delivery & Close-Out
                    </h3>
                    <p className="text-gray-700 text-base leading-relaxed group-hover:text-gray-900 transition-colors duration-300">
                      Delivery is confirmed, milestones are closed, and the load is completed in line with agreed terms.
                    </p>
                    
                    {/* Completion badge */}
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-teal-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                      <span className="text-xs font-semibold text-teal-700">Process Complete</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-teal-500 rounded-full border-4 border-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CLOSING MESSAGE SECTION */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-blue-50 relative overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              From confirmation to delivery
            </h2>
          </FadeIn>
          
          <FadeIn direction="up" delay={200} duration={900} distance={20} blur={true}>
            <p className="text-xl text-gray-700 leading-relaxed relative">
              <span className="relative inline-block">
                We tell the story so you always know what&#39;s happening and why.
                <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></span>
              </span>
            </p>
          </FadeIn>

          {/* Animated underline */}
          <FadeIn direction="up" delay={400} duration={600} distance={10}>
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 mx-auto mt-6 rounded-full overflow-hidden">
              <div className="w-full h-full bg-white transform -translate-x-full animate-[slide_2s_ease-in-out_infinite]"></div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-20 bg-slate-900 text-white text-center relative overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.5) 1px, transparent 0px)",
            backgroundSize: "40px 40px"
          }}></div>
        </div>

        {/* Animated glow effect */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="up" delay={0} duration={1000} distance={40} blur={true}>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Ready to experience the difference?
            </h2>
          </FadeIn>
          
          <FadeIn direction="up" delay={200} duration={900} distance={30} blur={true}>
            <p className="text-xl text-gray-300 mb-8">
              Start your structured journey today.
            </p>
          </FadeIn>
          
          <FadeIn direction="up" delay={400} duration={800} distance={20} once={true}>
            <a href="/contact">
              <button className="group relative bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-lg px-8 py-3 rounded-md shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Request a Load Movement
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
                </span>
                <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></span>
              </button>
            </a>
          </FadeIn>
        </div>

        {/* Animated bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-slide"></div>
      </section>
      
      {/* <div className="h-[80px] w-full bg-white"></div> */}

      <style jsx>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-slide {
          animation: slide 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}