'use client';

import PageHero from "@/components/PageHero";
import FadeIn from "@/components/FadeIn";
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
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Subtle animated background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.2) 1px, transparent 0px)",
            backgroundSize: "40px 40px"
          }}></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">
              Compliance, Risk & Visibility
            </h2>
          </FadeIn>
          
          <FadeIn direction="up" delay={200} duration={900} distance={20} blur={true}>
            <div className="text-lg text-gray-700 leading-relaxed space-y-6 text-center max-w-3xl mx-auto">
              <p>
                We apply structured controls and enhanced oversight based on cargo value, route risk, and client requirements. Higher-value and higher-risk movements receive additional monitoring, documentation, and insurance validation.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* SECURITY & COMPLIANCE FRAMEWORK SECTION */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        {/* Animated pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(45deg, rgba(16, 185, 129, 0.1) 25%, transparent 25%, transparent 50%, rgba(16, 185, 129, 0.1) 50%, rgba(16, 185, 129, 0.1) 75%, transparent 75%, transparent)",
            backgroundSize: "30px 30px"
          }}></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">
              Our Security & Compliance Framework
            </h2>
          </FadeIn>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: Shield, color: "emerald", title: "Active Tracking", desc: "Real-time GPS monitoring for high-value and sensitive loads" },
              { icon: FileCheck, color: "blue", title: "Enhanced Reporting", desc: "Detailed documentation and milestone updates throughout transit" },
              { icon: Camera, color: "purple", title: "Dashcam Requirements", desc: "Video recording for high-risk or high-value loads" },
              { icon: CheckCircle2, color: "orange", title: "Insurance Verification", desc: "Confirmed coverage before every movement" }
            ].map((item, index) => (
              <FadeIn 
                key={index}
                direction={index % 2 === 0 ? "left" : "right"} 
                delay={200 + (index * 150)} 
                duration={800}
                distance={40}
                blur={true}
              >
                <div className={`group rounded-xl border border-none shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 p-8 bg-white relative overflow-hidden`}>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <div className="relative">
                    <div className="relative inline-block">
                      <div className={`p-3 rounded-lg bg-${item.color}-100 group-hover:bg-${item.color}-200 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                        <item.icon className={`h-8 w-8 text-${item.color}-600 group-hover:scale-110 transition-transform duration-500`} />
                      </div>
                      <span className={`absolute inset-0 rounded-lg bg-${item.color}-400/20 animate-ping opacity-0 group-hover:opacity-100`}></span>
                    </div>
                    <h3 className={`text-2xl font-bold text-slate-900 mb-3 mt-4 group-hover:text-${item.color}-600 transition-colors duration-300`}>
                      {item.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-lg group-hover:text-gray-900 transition-colors duration-300">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* WHY THESE MEASURES MATTER SECTION */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.15) 1px, transparent 0px)",
            backgroundSize: "30px 30px"
          }}></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">
              Why These Measures Matter
            </h2>
          </FadeIn>
          
          <FadeIn direction="up" delay={200} duration={800} distance={20} blur={true}>
            <p className="text-lg text-gray-700 text-center mb-12">
              These controls are designed to:
            </p>
          </FadeIn>
          
          <FadeIn direction="up" delay={300} duration={900} distance={30} blur={true}>
            <div className="rounded-xl text-slate-900 border-2 border-emerald-200 shadow-xl bg-white p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:border-emerald-300">
              <div className="space-y-4">
                {[
                  "Reduce cargo risk through enhanced visibility",
                  "Support insurance claims with documented evidence",
                  "Enable faster incident investigation and resolution",
                  "Provide clients with complete peace of mind",
                  "Maintain accountability throughout the supply chain"
                ].map((item, index) => (
                  <FadeIn 
                    key={index}
                    direction="left" 
                    delay={400 + (index * 100)} 
                    duration={600}
                    distance={15}
                  >
                    <div className="flex items-start gap-3 group">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0 group-hover:scale-125 group-hover:rotate-6 transition-all duration-300" />
                      <span className="text-lg text-gray-700 group-hover:text-gray-900 group-hover:font-medium transition-all duration-300">
                        {item}
                      </span>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* RISK-BASED APPROACH SECTION */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.2) 1px, transparent 0px)",
            backgroundSize: "35px 35px"
          }}></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">
              Risk-Based Approach
            </h2>
          </FadeIn>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Standard Loads",
                color: "blue",
                items: ["Basic tracking", "Milestone updates", "Insurance verification", "Standard documentation"]
              },
              {
                title: "High-Value Loads",
                color: "orange",
                items: ["Active GPS tracking", "Enhanced reporting", "Additional insurance", "Frequent check-ins"]
              },
              {
                title: "High-Risk Routes",
                color: "red",
                items: ["Live tracking", "Dashcam requirement", "Security protocols", "Real-time monitoring"]
              }
            ].map((category, index) => (
              <FadeIn 
                key={index}
                direction={index === 0 ? "left" : index === 1 ? "up" : "right"} 
                delay={200 + (index * 150)} 
                duration={800}
                distance={40}
                blur={true}
              >
                <div className={`group rounded-xl text-slate-900 border-2 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 bg-${category.color}-50 p-8 hover:border-${category.color}-400 relative overflow-hidden`}>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <div className="relative">
                    <h3 className={`text-xl font-bold mb-4 text-${category.color}-900 group-hover:text-${category.color}-800 transition-colors duration-300`}>
                      {category.title}
                    </h3>
                    <ul className="space-y-2 text-sm">
                      {category.items.map((item, itemIndex) => (
                        <FadeIn 
                          key={itemIndex}
                          direction="up" 
                          delay={300 + (index * 100) + (itemIndex * 70)} 
                          duration={500}
                          distance={10}
                        >
                          <li className="flex items-center gap-2 group/item">
                            <span className={`w-1.5 h-1.5 bg-${category.color}-500 rounded-full group-hover/item:scale-150 group-hover/item:bg-${category.color}-600 transition-all duration-300`}></span>
                            <span className={`text-${category.color}-800 group-hover/item:text-${category.color}-900 group-hover/item:font-medium transition-all duration-300`}>
                              {item}
                            </span>
                          </li>
                        </FadeIn>
                      ))}
                    </ul>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* RISK MANAGEMENT CLOSING SECTION */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-blue-50 relative overflow-hidden">
        {/* Animated glow effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Open & Transparent Risk Management
            </h2>
          </FadeIn>
          
          <FadeIn direction="up" delay={200} duration={900} distance={20} blur={true}>
            <p className="text-xl text-gray-700 leading-relaxed mb-8 relative inline-block group">
              We don&#39;t hide risk — we manage it openly.
              <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-500"></span>
            </p>
          </FadeIn>
          
          <FadeIn direction="up" delay={300} duration={800} distance={20}>
            <p className="text-lg text-gray-600">
              Every client knows what controls are in place, why they matter, and how they protect their interests.
            </p>
          </FadeIn>

          {/* Animated underline */}
          <FadeIn direction="up" delay={400} duration={600} distance={10}>
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 mx-auto mt-8 rounded-full overflow-hidden">
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
          <FadeIn direction="down" delay={0} duration={1000} distance={40} blur={true}>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Move your cargo with confidence
            </h2>
          </FadeIn>
          
          <FadeIn direction="up" delay={200} duration={900} distance={30} blur={true}>
            <p className="text-xl text-gray-300 mb-8">
              Professional oversight. Structured controls. Complete visibility.
            </p>
          </FadeIn>
          
          <FadeIn direction="up" delay={400} duration={800} distance={20} once={true}>
            <a href="/contact">
              <button className="group relative bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-12 py-2 rounded-md shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 overflow-hidden">
                <span className="relative z-10 flex items-center gap-2 justify-center">
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

          {/* Animated bottom border */}
          <FadeIn direction="up" delay={500} duration={600} distance={10}>
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mt-12 rounded-full overflow-hidden">
              <div className="w-full h-full bg-white transform -translate-x-full animate-[slide_2s_ease-in-out_infinite]"></div>
            </div>
          </FadeIn>
        </div>
      </section>
      
      <div className="h-[80px] w-full bg-white"></div>

      <style jsx>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}