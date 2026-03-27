"use client";

import PageHero from "@/components/PageHero";
import FadeIn from "@/components/FadeIn";
import { MapPin, CheckCircle2 } from "lucide-react";
import EmbeddedContactForm from "@/components/EmbeddedContactForm";

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <PageHero 
        title="Let's tell the story" 
        subtitle="Tell us about your load and we'll come back with a structured proposal"
        badge="Get Started"
      />
      
      {/* FORM SECTION */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.2) 1px, transparent 0px)",
            backgroundSize: "40px 40px"
          }}></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* FORM COLUMN */}
            <div className="lg:col-span-2">
              <FadeIn direction="left" delay={0} duration={800} distance={40} blur={true}>
                <EmbeddedContactForm />
              </FadeIn>
            </div>

            {/* RIGHT COLUMN - INFO */}
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
                        <p className="text-sm text-gray-300 font-medium mb-3 group-hover/country:text-white transition-colors duration-300">Info@fleetxchange.africa</p>
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
                        <p className="text-sm text-gray-300 font-medium mb-3 group-hover/country:text-white transition-colors duration-300">Info@fleetxchange.africa</p>
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
                        <p className="text-sm text-gray-300 font-medium group-hover/country:text-white transition-colors duration-300">Info@fleetxchange.africa</p>
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
            backgroundSize: "40px 40px"
          }}></div>
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="up" delay={0} duration={800} distance={40} blur={true}>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8">
              Every successful movement starts with a clear story
            </h2>
          </FadeIn>
          
          <FadeIn direction="up" delay={200} duration={800} distance={20} blur={true}>
            <p className="text-lg text-gray-700">
              Let FleetXchange be your single point of coordination for freight across Southern Africa.
            </p>
          </FadeIn>

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
