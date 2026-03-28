'use client';

import dynamic from 'next/dynamic';
import { MapPin, Package, TrendingUp, Eye, Gauge, Shield, Truck, Zap, Award, CheckCircle2 } from 'lucide-react';
import FadeIn from "@/components/FadeIn";
import EmbeddedContactForm from "@/components/EmbeddedContactForm";

// Lazy load heavy components (improves initial page load)
const TrustSection = dynamic(() => import("@/components/TrustSection"), { loading: () => <div className="h-32" /> });
const ServicesSection = dynamic(() => import("@/components/ServicesSection"), { loading: () => <div className="h-32" /> });
const CTASection = dynamic(() => import("@/components/CTASection"), { loading: () => <div className="h-32" /> });
const SocialProof = dynamic(() => import("@/components/SocialProof"), { loading: () => <div className="h-32" /> });

export default function HomeContent() {
  return (
    <div className="min-h-screen">
      {/* HERO SECTION - CONVERSION OPTIMIZED */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center space-y-6">
            <FadeIn direction="up" delay={0} duration={800} distance={20} blur={true}>
              <div className="inline-block px-6 py-2.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-full mb-4 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                <span className="text-emerald-400 text-sm font-semibold tracking-wide">South Africa&apos;s #1 Freight Platform</span>
              </div>
            </FadeIn>
            
            <FadeIn direction="up" delay={150} duration={900} distance={30} blur={true}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Book Reliable Freight & Trucks Across South Africa
              </h1>
            </FadeIn>
            
            <FadeIn direction="up" delay={300} duration={900} distance={30} blur={true}>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Book trucks in minutes. Track shipments in real-time. Connect with 500+ verified transporters across South Africa.
              </p>
            </FadeIn>
            
            <FadeIn direction="up" delay={450} duration={800} distance={20}>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-6">
                <a href="/contact">
                  <button className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold px-7 py-3 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group text-base">
                    <Truck className="h-5 w-5" />
                    Book Your Load
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform duration-300">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </button>
                </a>
                <a href="/contact?type=demo">
                  <button className="border-2 border-white/80 text-white hover:bg-white hover:text-slate-900 font-semibold px-7 py-3 rounded-lg transition-all duration-300 backdrop-blur-sm hover:scale-105 text-base">
                    Get Instant Quote
                  </button>
                </a>
              </div>
            </FadeIn>

            {/* Trust Icons Below Hero with Metrics */}
            <FadeIn direction="up" delay={600} duration={800} distance={30}>
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-8 pt-4 border-t border-white/10">
                {[
                  { icon: CheckCircle2, label: "Verified Transporters", metric: "500+" },
                  { icon: Zap, label: "Fast Quotes", metric: "<5 min" },
                  { icon: Shield, label: "Trusted By", metric: "200+" }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <p className="font-bold text-emerald-300 text-lg">{item.metric}</p>
                    <item.icon className="h-6 w-6 text-emerald-400" />
                    <p className="text-xs md:text-sm text-gray-300">{item.label}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* SOCIAL PROOF BANNER */}
      <section className="bg-gradient-to-r from-emerald-600 to-blue-600 py-12 text-white text-center">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <FadeIn direction="up" delay={0} duration={800} distance={15}>
              <div>
                <p className="text-4xl md:text-5xl font-bold">50K+</p>
                <p className="text-emerald-100 text-sm mt-2">Shipments Tracked</p>
              </div>
            </FadeIn>
            <FadeIn direction="up" delay={150} duration={800} distance={15}>
              <div>
                <p className="text-4xl md:text-5xl font-bold">99%</p>
                <p className="text-emerald-100 text-sm mt-2">Visibility Rate</p>
              </div>
            </FadeIn>
            <FadeIn direction="up" delay={300} duration={800} distance={15}>
              <div>
                <p className="text-4xl md:text-5xl font-bold">4.9★</p>
                <p className="text-emerald-100 text-sm mt-2">User Rating</p>
              </div>
            </FadeIn>
            <FadeIn direction="up" delay={450} duration={800} distance={15}>
              <div>
                <p className="text-4xl md:text-5xl font-bold">200+</p>
                <p className="text-emerald-100 text-sm mt-2">Companies</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* EMBEDDED CONTACT FORM - COMPACT VERSION */}
      <EmbeddedContactForm 
        compact={true}
        title="Get Your Free Quote"
        subtitle="Fill your details below and get a quote within 5 minutes"
      />

      {/* TRUST SECTION */}
      <TrustSection />

      {/* SERVICES SECTION */}
      <ServicesSection />

      {/* CTA SECTION - AFTER SERVICES */}
      <CTASection
        title="Book Your Freight in Minutes"
        subtitle="No complicated process. Post your load and get matched instantly with verified transporters."
        variant="dark"
      />

      {/* SOCIAL PROOF SECTION */}
      <SocialProof />

      {/* CTA SECTION - BEFORE LOCATION */}
      <CTASection
        title="Track Your Freight Across South Africa"
        subtitle="Real-time updates on every shipment. Know exactly where your load is, 24/7."
        variant="default"
      />

      {/* WHERE WE OPERATE SECTION - LOCATION CONTENT */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: "radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.4) 1px, transparent 0px)", backgroundSize: "40px 40px"}}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        
        <div className="relative max-w-full mx-auto px-4 sm:px-6 lg:px-12">
          <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">South Africa Freight Services Across All Regions</h2>
          </FadeIn>
          
          <FadeIn direction="up" delay={200} duration={900} distance={20} blur={true}>
            <p className="text-lg text-center text-gray-300 mb-16">We support freight movements, truck transport, and cross-border logistics across:</p>
          </FadeIn>
          
          <div className="grid md:grid-cols-6 gap-6 mb-8">
            {["Johannesburg Transport", "Cape Town Logistics", "Durban Freight", "Pretoria Hub", "Gaborone – Johannesburg Corridor", "Cross-Border Africa"].map((route, index) => (
              <FadeIn 
                key={index}
                direction="up" 
                delay={300 + (index * 100)} 
                duration={800}
                distance={30}
              >
                <div className="rounded-2xl border border-slate-700 bg-slate-800/40 backdrop-blur-sm p-8 text-center cursor-pointer hover:border-emerald-400 hover:bg-slate-800/60 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-500 hover:-translate-y-2 hover:scale-105">
                  <MapPin className="h-8 w-8 text-emerald-400 mx-auto mb-4 animate-bounce" />
                  <p className="font-semibold text-white">{route}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          
          <FadeIn direction="up" delay={800} duration={800} distance={20}>
            <p className="text-center text-gray-400">And across Southern Africa: South Africa, Botswana, Zimbabwe, Zambia, Namibia, and beyond.</p>
          </FadeIn>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="py-20 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-8">About FleetXchange</h2>
          </FadeIn>
          
          <div className="space-y-6 text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
            <FadeIn direction="up" delay={200} duration={900} distance={20} blur={true}>
              <p className="text-center font-semibold text-xl text-slate-900">
                FleetXchange is a freight booking platform. Post your load → get matched → book → track in real-time.
              </p>
            </FadeIn>
            
            <FadeIn direction="up" delay={300} duration={900} distance={20} blur={true}>
              <p>
                No more juggling multiple transporters or unclear pricing. FleetXchange connects you with verified transporters, provides real-time tracking, and handles everything seamlessly.
              </p>
            </FadeIn>
            
            <FadeIn direction="up" delay={500} duration={1000} distance={15}>
              <div className="pt-8 border-t border-gray-200 text-center">
                <p className="font-semibold text-slate-900 mb-6">Trusted by 200+ Leading Companies</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-sm font-semibold text-gray-700">FMCG Leaders</div>
                  <div className="text-sm font-semibold text-gray-700">Major Retailers</div>
                  <div className="text-sm font-semibold text-gray-700">Manufacturers</div>
                  <div className="text-sm font-semibold text-gray-700">Logistics Firms</div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <CTASection
        title="Start Booking Freight Today"
        subtitle="Post your load and get matched with verified transporters. Or apply to become a transporter and grow your business."
        primaryCTA={{
          text: "Book Your Freight",
          href: "/contact",
          icon: <Truck className="h-5 w-5" />
        }}
        secondaryCTA={{
          text: "Become a Transporter",
          href: "/contact?type=transporter",
          icon: <Truck className="h-5 w-5" />
        }}
        variant="light"
      />
    </div>
  );
}
