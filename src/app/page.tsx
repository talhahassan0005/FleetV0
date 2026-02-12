'use client';

import { MapPin, Package, TrendingUp, Eye, Gauge, Shield } from 'lucide-react';
import FadeIn from "@/components/FadeIn";

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
            <FadeIn direction="up" delay={0} duration={800} distance={20} blur={true}>
              <div className="inline-block px-6 py-2.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-full mb-4 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                <span className="text-emerald-400 text-sm font-semibold tracking-wide">Africa&#39;s Largest Freight Hub</span>
              </div>
            </FadeIn>
            
            <FadeIn direction="up" delay={200} duration={900} distance={30} blur={true}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                We tell the story of
                <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mt-2 animate-pulse">
                  every shipment
                </span>
              </h1>
            </FadeIn>
            
            <FadeIn direction="up" delay={400} duration={900} distance={30} blur={true}>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Unified logistics visibility, predictive insights, and trusted compliance.
              </p>
            </FadeIn>
            
            <FadeIn direction="up" delay={600} duration={800} distance={20}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                <a href="/contact">
                  <button className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-lg px-8 py-3 rounded-md shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group">
                    Request a Demo
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform duration-300">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </button>
                </a>
                <a href="/about">
                  <button className="border-2 border-white/80 text-white hover:bg-white hover:text-slate-900 text-lg px-8 py-3 rounded-md transition-all duration-300 backdrop-blur-sm hover:scale-105">
                    Learn More
                  </button>
                </a>
              </div>
            </FadeIn>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* WHY WE TELL THE STORY SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Why We Tell The Story</h2>
          </FadeIn>
          
          <FadeIn direction="up" delay={200} duration={900} distance={20} blur={true}>
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p>
                When cargo moves across borders, <span className="font-semibold relative inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-emerald-400 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300">clarity becomes the difference between success and disruption.</span> At FleetXchange, we tell the story of every load — so our clients always know:
              </p>
            </div>
          </FadeIn>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              { icon: MapPin, color: "emerald", text: "where their cargo is" },
              { icon: Package, color: "blue", text: "what is happening" },
              { icon: TrendingUp, color: "pink", text: "what comes next" }
            ].map((item, index) => (
              <FadeIn 
                key={index}
                direction={index === 0 ? "left" : index === 1 ? "up" : "right"} 
                delay={300 + (index * 100)} 
                duration={800}
                distance={40}
                blur={true}
              >
                <div className={`rounded-2xl border-2 border-${item.color}-300 bg-${item.color}-50/60 p-8 space-y-3 cursor-pointer hover:border-${item.color}-500 hover:bg-${item.color}-100/80 hover:shadow-lg hover:shadow-${item.color}-200 transition-all duration-500 hover:-translate-y-3`}>
                  <item.icon className={`h-8 w-8 text-${item.color}-600 mx-auto animate-pulse`} />
                  <p className="font-bold text-slate-900">{item.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT WE DO SECTION */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-12">
          <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">What We Do</h2>
          </FadeIn>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Eye, color: "emerald", title: "Visibility", desc: "Milestone-based updates and live tracking where required" },
              { icon: Gauge, color: "blue", title: "Control", desc: "One coordination partner with defined escalation paths" },
              { icon: TrendingUp, color: "purple", title: "Efficiency", desc: "Faster access to capacity with less admin and fewer follow-ups" },
              { icon: Shield, color: "orange", title: "Accountability", desc: "Every load documented, monitored, and professionally managed" }
            ].map((item, index) => (
              <FadeIn 
                key={index}
                direction={index % 2 === 0 ? "left" : "right"} 
                delay={200 + (index * 150)} 
                duration={900}
                distance={50}
                blur={true}
              >
                <div className={`rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 bg-white p-8 group`}>
                  <div className={`h-16 w-16 rounded-full bg-${item.color}-100 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <item.icon className={`h-8 w-8 text-${item.color}-600 group-hover:scale-110 transition-transform duration-500`} />
                  </div>
                  <h3 className={`text-xl font-bold text-slate-900 mb-3 text-center group-hover:text-${item.color}-600 transition-colors duration-300`}>{item.title}</h3>
                  <p className="text-gray-600 text-center">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* WHO WE ARE SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-8">Who We Are</h2>
          </FadeIn>
          
          <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
            <FadeIn direction="up" delay={200} duration={900} distance={20} blur={true}>
              <p className="text-center font-semibold text-xl text-slate-900">
                FleetXchange is not a trucking company. We are a logistics coordination and oversight partner that connects businesses to a network of verified transporters across Southern Africa.
              </p>
            </FadeIn>
            
            <FadeIn direction="up" delay={300} duration={900} distance={20} blur={true}>
              <p>
                Instead of managing multiple transporters, drivers, and intermediaries, our clients work with one central partner responsible for overseeing the entire movement.
              </p>
            </FadeIn>
            
            <FadeIn direction="up" delay={500} duration={1000} distance={15}>
              <p className="font-semibold text-emerald-700 text-center text-xl pt-4 transform hover:scale-105 transition-transform duration-500">
                We don&#39;t just source trucks — we manage the process.<br />
                That&#39;s how we tell the story.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* WHERE WE OPERATE SECTION */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: "radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.4) 1px, transparent 0px)", backgroundSize: "40px 40px"}}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        
        <div className="relative max-w-full mx-auto px-4 sm:px-6 lg:px-12">
          <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">Where We Operate</h2>
          </FadeIn>
          
          <FadeIn direction="up" delay={200} duration={900} distance={20} blur={true}>
            <p className="text-lg text-center text-gray-300 mb-16">We support freight movements across key corridors in:</p>
          </FadeIn>
          
          <div className="grid md:grid-cols-5 gap-6 mb-8">
            {["South Africa", "Botswana", "Zimbabwe", "Zambia", "Democratic Republic of Congo (DRC)"].map((country, index) => (
              <FadeIn 
                key={index}
                direction="up" 
                delay={300 + (index * 100)} 
                duration={800}
                distance={30}
              >
                <div className="rounded-2xl border border-slate-700 bg-slate-800/40 backdrop-blur-sm p-8 text-center cursor-pointer hover:border-emerald-400 hover:bg-slate-800/60 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-500 hover:-translate-y-2 hover:scale-105">
                  <MapPin className="h-8 w-8 text-emerald-400 mx-auto mb-4 animate-bounce" />
                  <p className="font-semibold text-white">{country}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          
          <FadeIn direction="up" delay={800} duration={800} distance={20}>
            <p className="text-center text-gray-400">Across long-haul, regional, and cross-border routes.</p>
          </FadeIn>
        </div>
      </section>

      {/* HOW WE TELL THE STORY SECTION */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">How We Tell The Story</h2>
          </FadeIn>
          
          <FadeIn direction="up" delay={200} duration={900} distance={20} blur={true}>
            <p className="text-lg text-center text-gray-700 mb-12">The FleetXchange Story Flow:</p>
          </FadeIn>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { num: "01", text: "Connect your data", color: "emerald" },
              { num: "02", text: "Track in real time", color: "blue" },
              { num: "03", text: "Predict and act", color: "pink" },
              { num: "04", text: "Ensure compliance and trust", color: "orange" }
            ].map((item, index) => (
              <FadeIn 
                key={index}
                direction="up" 
                delay={300 + (index * 150)} 
                duration={900}
                distance={40}
                blur={true}
              >
                <div className={`bg-white rounded-xl shadow-md hover:shadow-xl hover:shadow-${item.color}-200 p-6 text-center cursor-pointer transition-all duration-500 hover:-translate-y-4 group`}>
                  <div className={`text-5xl font-bold text-${item.color}-500 mb-3 group-hover:scale-110 transition-transform duration-500`}>{item.num}</div>
                  <p className="text-gray-700 font-medium group-hover:text-slate-900 transition-colors duration-300">{item.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          
          <FadeIn direction="up" delay={900} duration={1000} distance={20}>
            <p className="text-center text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent pt-8 animate-pulse">
              Because when the story is clear, the outcome is predictable.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* KEY FEATURES SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">Key Features</h2>
          </FadeIn>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            {[
              { icon: Eye, color: "emerald", title: "Real-time Shipment Tracking", desc: "Live visibility into every movement across the supply chain." },
              { icon: Package, color: "blue", title: "Load & Transporter Management", desc: "Comprehensive management of loads and verified transporter networks." },
              { icon: TrendingUp, color: "purple", title: "Route Optimization & ETA Prediction", desc: "Intelligent routing and accurate delivery time estimations." },
              { icon: Gauge, color: "pink", title: "Analytics & Reporting", desc: "Comprehensive dashboards and actionable insights from your data." },
              { icon: Shield, color: "orange", title: "Compliance & Audit Ready", desc: "Built-in compliance frameworks and audit trail capabilities." }
            ].map((item, index) => (
              <FadeIn 
                key={index}
                direction={index % 2 === 0 ? "left" : "right"} 
                delay={200 + (index * 100)} 
                duration={800}
                distance={30}
                blur={true}
              >
                <div className={`rounded-2xl border-2 border-${item.color}-200 bg-white p-8 hover:border-${item.color}-500 hover:shadow-lg transition-all duration-500 hover:-translate-y-3 group`}>
                  <div className={`h-12 w-12 rounded-lg bg-${item.color}-100 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <item.icon className={`h-6 w-6 text-${item.color}-600`} />
                  </div>
                  <h3 className={`text-lg font-bold text-slate-900 mb-2 group-hover:text-${item.color}-600 transition-colors duration-300`}>{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* USE CASES SECTION */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">Use Cases</h2>
          </FadeIn>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { color: "emerald", title: "FMCG & Retail Distribution", desc: "Manage complex multi-point distribution networks across regions with real-time visibility and compliance." },
              { color: "blue", title: "Cross-Border Freight", desc: "Navigate complex regulatory requirements and coordinate movements across multiple countries seamlessly." },
              { color: "purple", title: "Enterprise Logistics Operations", desc: "Centralize control of diverse logistics operations with unified tracking and coordination." },
              { color: "pink", title: "High-Value & Regulated Cargo", desc: "Ensure complete traceability and compliance for sensitive shipments with enhanced security protocols." }
            ].map((item, index) => (
              <FadeIn 
                key={index}
                direction={index % 2 === 0 ? "left" : "right"} 
                delay={200 + (index * 150)} 
                duration={900}
                distance={40}
                blur={true}
              >
                <div className={`rounded-2xl border-l-4 border-${item.color}-500 bg-white p-10 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02]`}>
                  <h3 className={`text-2xl font-bold text-slate-900 mb-3 hover:text-${item.color}-600 transition-colors duration-300`}>{item.title}</h3>
                  <p className="text-gray-700 text-lg">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* INTEGRATIONS SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">Integrations</h2>
          </FadeIn>
          
          <FadeIn direction="up" delay={200} duration={900} distance={20} blur={true}>
            <p className="text-lg text-center text-gray-700 mb-12">FleetXchange integrates with your existing systems:</p>
          </FadeIn>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { gradient: "from-emerald-50 to-teal-50", border: "emerald", icon: "→", title: "Fleet Tracking Systems", desc: "Connect with GPS, telematics, and vehicle tracking platforms." },
              { gradient: "from-blue-50 to-purple-50", border: "blue", icon: "⚙", title: "APIs & ERP Systems", desc: "Seamless integration with enterprise resource planning and business systems." },
              { gradient: "from-orange-50 to-pink-50", border: "orange", icon: "📡", title: "Telematics & IoT Devices", desc: "Real-time data from sensors, IoT devices, and connected hardware." }
            ].map((item, index) => (
              <FadeIn 
                key={index}
                direction={index === 0 ? "left" : index === 1 ? "up" : "right"} 
                delay={300 + (index * 150)} 
                duration={900}
                distance={50}
                blur={true}
              >
                <div className={`rounded-2xl bg-gradient-to-br ${item.gradient} border-2 border-${item.border}-200 p-10 text-center hover:border-${item.border}-400 hover:shadow-lg transition-all duration-500 hover:-translate-y-3 hover:scale-105`}>
                  <div className={`text-4xl font-bold text-${item.border}-600 mb-3 animate-pulse`}>{item.icon}</div>
                  <h3 className={`text-xl font-bold text-slate-900 mb-2 hover:text-${item.border}-600 transition-colors duration-300`}>{item.title}</h3>
                  <p className="text-gray-700">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CASE STUDIES SECTION */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">Case Studies</h2>
          </FadeIn>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[0, 1].map((caseIndex) => (
              <FadeIn 
                key={caseIndex}
                direction={caseIndex === 0 ? "left" : "right"} 
                delay={200} 
                duration={900}
                distance={50}
                blur={true}
              >
                <div className="rounded-2xl bg-white border-2 border-slate-200 p-10 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-3">
                  <div className="space-y-6">
                    <FadeIn direction="up" delay={300} duration={600} distance={10}>
                      <div>
                        <h3 className="text-sm font-bold text-emerald-600 mb-2 uppercase tracking-wide">Challenge</h3>
                        <p className="text-gray-800 text-lg">
                          {caseIndex === 0 
                            ? "FMCG distributor managing 50+ weekly shipments across 5 countries with fragmented coordination and visibility gaps."
                            : "Enterprise logistics operator struggling with compliance documentation, audit readiness, and cross-border regulatory complexity."}
                        </p>
                      </div>
                    </FadeIn>
                    
                    <div className="h-px bg-gradient-to-r from-emerald-400 via-teal-400 to-transparent"></div>
                    
                    <FadeIn direction="up" delay={400} duration={600} distance={10}>
                      <div>
                        <h3 className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-wide">FleetXchange Solution</h3>
                        <p className="text-gray-800 text-lg">
                          {caseIndex === 0
                            ? "Unified platform for load coordination, real-time tracking, milestone updates, and proactive issue escalation."
                            : "Automated compliance frameworks, digital audit trails, regulatory requirement verification, and instant reporting capabilities."}
                        </p>
                      </div>
                    </FadeIn>
                    
                    <div className="h-px bg-gradient-to-r from-blue-400 via-purple-400 to-transparent"></div>
                    
                    <FadeIn direction="up" delay={500} duration={600} distance={10}>
                      <div>
                        <h3 className="text-sm font-bold text-orange-600 mb-2 uppercase tracking-wide">Business Impact</h3>
                        <p className="text-gray-800 text-lg font-semibold text-emerald-700">
                          {caseIndex === 0
                            ? "30% reduction in delivery delays • 40% fewer coordination touchpoints • 99% shipment visibility"
                            : "100% audit readiness • 60% faster compliance verification • Zero regulatory violations"}
                        </p>
                      </div>
                    </FadeIn>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-20 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.4) 1px, transparent 0px)", backgroundSize: "40px 40px"}}></div>
        
        {/* Animated glow effect */}
        <div className="absolute inset-0">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 blur-3xl animate-pulse"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="up" delay={0} duration={1000} distance={40} blur={true}>
            <h2 className="text-3xl md:text-5xl font-bold mb-8">Let&#39;s tell the story of your next load</h2>
          </FadeIn>
          
          <FadeIn direction="up" delay={300} duration={800} distance={20} once={true}>
            <a href="/contact">
              <button className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white text-lg px-12 py-2 rounded-md shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 relative overflow-hidden group">
                <span className="relative z-10">Request a Load Movement</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              </button>
            </a>
          </FadeIn>
        </div>
      </section>
      
      <div className="h-[80px] w-full bg-white"></div>
    </div>
  );
}