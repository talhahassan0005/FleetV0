'use client';

import PageHero from "@/components/PageHero";
import FadeIn from "@/components/FadeIn";
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
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Subtle animated background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.2) 1px, transparent 0px)",
            backgroundSize: "40px 40px"
          }}></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">
              Why Clients Choose FleetXchange
            </h2>
          </FadeIn>
          
          <div className="space-y-8">
            {[
              { icon: Shield, color: "emerald", title: "Accountability", desc: "One coordination partner responsible for overseeing the entire movement." },
              { icon: Eye, color: "blue", title: "Visibility", desc: "Milestone-based updates and live tracking where required. We tell the story of every load." },
              { icon: Gauge, color: "purple", title: "Control", desc: "Clear execution structure with defined escalation paths and approvals." },
              { icon: TrendingUp, color: "orange", title: "Efficiency", desc: "Faster access to capacity, less admin, smoother execution." },
              { icon: CheckCircle2, color: "teal", title: "Integration", desc: "Works across industries, fits existing workflows, and scales across regions." }
            ].map((item, index) => (
              <FadeIn 
                key={index}
                direction={index % 2 === 0 ? "left" : "right"} 
                delay={200 + (index * 120)} 
                duration={800}
                distance={30}
                blur={true}
              >
                <div className={`group rounded-xl bg-white border-2 border-${item.color}-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 p-8 hover:border-${item.color}-400`}>
                  <div className="flex gap-6">
                    <div className="relative">
                      <div className={`p-2 rounded-lg bg-${item.color}-100 group-hover:bg-${item.color}-200 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                        <item.icon className={`h-8 w-8 text-${item.color}-600 group-hover:scale-110 transition-transform duration-500`} />
                      </div>
                      <span className={`absolute inset-0 rounded-lg bg-${item.color}-400/20 animate-ping opacity-0 group-hover:opacity-100`}></span>
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-2xl font-bold text-slate-900 mb-3 group-hover:text-${item.color}-600 transition-colors duration-300`}>
                        {item.title}
                      </h3>
                      <p className="text-lg text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* THE FLEETXCHANGE DIFFERENCE SECTION */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        {/* Animated pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(45deg, rgba(16, 185, 129, 0.1) 25%, transparent 25%, transparent 50%, rgba(16, 185, 129, 0.1) 50%, rgba(16, 185, 129, 0.1) 75%, transparent 75%, transparent)",
            backgroundSize: "30px 30px"
          }}></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">
              The FleetXchange Difference
            </h2>
          </FadeIn>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Single Point of Contact",
                items: [
                  "No more chasing multiple parties",
                  "Clear communication channels",
                  "Defined escalation procedures",
                  "One partner, full responsibility"
                ]
              },
              {
                title: "Structured Process",
                items: [
                  "Load Confirmation Sheets for every movement",
                  "Milestone-based tracking",
                  "Documented payment terms",
                  "Professional close-out procedures"
                ]
              },
              {
                title: "Risk Management",
                items: [
                  "Verified transporter network",
                  "Insurance validation",
                  "Enhanced tracking for high-value loads",
                  "Incident support and investigation"
                ]
              },
              {
                title: "Scalable Solutions",
                items: [
                  "One-off loads to regular routes",
                  "Multiple cargo types supported",
                  "Cross-industry experience",
                  "Regional expansion capability"
                ]
              }
            ].map((section, sectionIndex) => (
              <FadeIn 
                key={sectionIndex}
                direction={sectionIndex % 2 === 0 ? "left" : "right"} 
                delay={200 + (sectionIndex * 150)} 
                duration={900}
                distance={40}
                blur={true}
              >
                <div className="group rounded-xl border bg-white border-none shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 p-8 relative overflow-hidden">
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="relative">
                        <CheckCircle2 className="h-8 w-8 text-emerald-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" />
                        <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-0 group-hover:opacity-100"></span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors duration-300">
                        {section.title}
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <FadeIn 
                          key={itemIndex}
                          direction="up" 
                          delay={300 + (sectionIndex * 100) + (itemIndex * 80)} 
                          duration={500}
                          distance={10}
                        >
                          <li className="flex items-start gap-3 group/item">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0 group-hover/item:scale-125 group-hover/item:rotate-6 transition-all duration-300" />
                            <span className="text-gray-700 group-hover/item:text-gray-900 group-hover/item:font-medium transition-all duration-300">
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

      {/* BUILT FOR BUSINESSES SECTION */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-blue-50 relative overflow-hidden">
        {/* Animated glow effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Built for businesses that value certainty
            </h2>
          </FadeIn>
          
          <FadeIn direction="up" delay={200} duration={900} distance={20} blur={true}>
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              In logistics, the difference between success and failure often comes down to{' '}
              <span className="font-semibold text-emerald-700 relative inline-block group">
                knowing what&#39;s happening
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-300"></span>
              </span>{' '}
              and{' '}
              <span className="font-semibold text-emerald-700 relative inline-block group">
                having someone accountable
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-300"></span>
              </span>{' '}
              when things don&#39;t go to plan.
            </p>
          </FadeIn>
          
          <FadeIn direction="up" delay={300} duration={800} distance={20}>
            <div className="relative inline-block">
              <p className="text-lg text-slate-900 font-semibold relative z-10 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent animate-pulse">
                That&#39;s why we tell the story.
              </p>
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></span>
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
              Experience the FleetXchange advantage
            </h2>
          </FadeIn>
          
          <FadeIn direction="up" delay={200} duration={900} distance={30} blur={true}>
            <p className="text-xl text-gray-300 mb-8">
              Clear processes. Professional oversight. Predictable outcomes.
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