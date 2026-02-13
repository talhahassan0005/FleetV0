'use client';

import PageHero from "@/components/PageHero";
import FadeIn from "@/components/FadeIn";
import { Truck, Shield, CheckCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/NetworkMap'), {
  ssr: false
});

export default function NetworkPage() {
  return (
    <div className="min-h-screen">
      <PageHero 
        title="Telling the story together" 
        subtitle="A verified network spanning Southern Africa's key corridors"
        badge="Our Network"
      />
      
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.2) 1px, transparent 0px)",
            backgroundSize: "40px 40px"
          }}></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Our Network & Coverage
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                FleetXchange works with a large network of vetted and verified transporters, giving clients access to reliable capacity without the risk of sourcing independently.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: Truck, color: "emerald", title: "Long-haul Routes", desc: "Cross-border and corridor-based movements" },
              { icon: Shield, color: "blue", title: "Regional Coverage", desc: "Diverse cargo types and operational environments" },
              { icon: CheckCircle, color: "purple", title: "Verified Partners", desc: "Vetted transporters reducing client risk" }
            ].map((item, index) => (
              <FadeIn 
                key={index}
                direction={index === 0 ? "left" : index === 1 ? "up" : "right"} 
                delay={200 + (index * 150)} 
                duration={800}
                distance={40}
                blur={true}
              >
                <div className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 p-8 text-center cursor-pointer border-t-4 border-emerald-500 hover:border-emerald-600">
                  <div className="relative">
                    <div className={`w-16 h-16 bg-${item.color}-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      <item.icon className={`w-8 h-8 text-${item.color}-600 group-hover:scale-110 transition-transform duration-500`} />
                    </div>
                    <span className={`absolute inset-0 rounded-full bg-${item.color}-400/20 animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></span>
                  </div>
                  <h3 className={`text-xl font-bold text-slate-900 mb-3 group-hover:text-${item.color}-600 transition-colors duration-300`}>
                    {item.title}
                  </h3>
                  <p className="text-gray-600 group-hover:text-gray-900 transition-colors duration-300">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* MAP SECTION */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.3) 1px, transparent 0px)",
            backgroundSize: "30px 30px"
          }}></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">
              Countries We Service
            </h2>
          </FadeIn>
          
          <FadeIn direction="up" delay={200} duration={1000} distance={40} blur={true}>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 hover:shadow-2xl transition-all duration-500">
              <MapComponent />
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'South Africa', color: 'bg-emerald-500', delay: 300 },
              { name: 'Botswana', color: 'bg-emerald-500', delay: 400 },
              { name: 'Zimbabwe', color: 'bg-emerald-500', delay: 500 },
              { name: 'Zambia', color: 'bg-emerald-500', delay: 600 },
              { name: 'DRC', color: 'bg-emerald-500', delay: 700 }
            ].map((country, index) => (
              <FadeIn 
                key={country.name}
                direction="up" 
                delay={country.delay} 
                duration={600}
                distance={20}
              >
                <div className="group bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                  <div className="relative inline-block">
                    <div className={`w-3 h-3 rounded-full ${country.color} mx-auto mb-3 group-hover:scale-150 transition-transform duration-500`}></div>
                    <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-0 group-hover:opacity-100"></span>
                  </div>
                  <p className="text-slate-900 font-semibold group-hover:text-emerald-600 transition-colors duration-300">
                    {country.name}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* REDUCING YOUR RISK SECTION */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(45deg, rgba(16, 185, 129, 0.1) 25%, transparent 25%, transparent 50%, rgba(16, 185, 129, 0.1) 50%, rgba(16, 185, 129, 0.1) 75%, transparent 75%, transparent)",
            backgroundSize: "20px 20px"
          }}></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 text-center">
              Reducing Your Risk
            </h2>
          </FadeIn>
          
          <FadeIn direction="up" delay={200} duration={800} distance={20} blur={true}>
            <p className="text-lg text-gray-700 text-center mb-12">
              Transporters are vetted to reduce client exposure to:
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { title: "Unreliable Carriers", desc: "Verified track records and performance history" },
              { title: "Non-compliant Vehicles", desc: "Proper licensing, documentation, and insurance" },
              { title: "Undocumented Operations", desc: "Full transparency and accountability" }
            ].map((item, index) => (
              <FadeIn 
                key={index}
                direction={index === 0 ? "left" : index === 1 ? "up" : "right"} 
                delay={300 + (index * 150)} 
                duration={800}
                distance={40}
                blur={true}
              >
                <div className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 p-8 text-center border border-gray-200 hover:border-emerald-300">
                  <div className="relative">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 group-hover:bg-emerald-200">
                      <Shield className="w-8 h-8 text-emerald-600 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-0 group-hover:opacity-100"></span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 group-hover:text-gray-900 transition-colors duration-300">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn direction="up" delay={700} duration={1000} distance={20}>
            <div className="relative">
              <p className="text-lg font-semibold text-emerald-700 text-center relative inline-block w-full">
                <span className="relative z-10 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent animate-pulse">
                  Because the story is only as strong as the people telling it.
                </span>
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:w-full transition-all duration-500"></span>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>
      
      {/* <div className="h-[80px] w-full bg-white"></div> */}
    </div>
  );
}