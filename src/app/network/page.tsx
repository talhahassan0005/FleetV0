'use client';

import PageHero from "@/components/PageHero";
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
      
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Our Network & Coverage
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              FleetXchange works with a large network of vetted and verified transporters, giving clients access to reliable capacity without the risk of sourcing independently.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 p-8 text-center cursor-pointer border-t-4 border-emerald-500">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Long-haul Routes</h3>
              <p className="text-gray-600">Cross-border and corridor-based movements</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 p-8 text-center cursor-pointer border-t-4 border-blue-500">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Regional Coverage</h3>
              <p className="text-gray-600">Diverse cargo types and operational environments</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 p-8 text-center cursor-pointer border-t-4 border-purple-500">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Verified Partners</h3>
              <p className="text-gray-600">Vetted transporters reducing client risk</p>
            </div>
          </div>
        </div>
      </section>

      {/* MAP SECTION */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">
            Countries We Service
          </h2>
          
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <MapComponent />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'South Africa', color: 'bg-emerald-500' },
              { name: 'Botswana', color: 'bg-emerald-500' },
              { name: 'Zimbabwe', color: 'bg-emerald-500' },
              { name: 'Zambia', color: 'bg-emerald-500' },
              { name: 'DRC', color: 'bg-emerald-500' }
            ].map((country) => (
              <div key={country.name} className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all duration-300">
                <div className={`w-3 h-3 rounded-full ${country.color} mx-auto mb-3`}></div>
                <p className="text-slate-900 font-semibold">{country.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REDUCING YOUR RISK SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 text-center">
            Reducing Your Risk
          </h2>
          <p className="text-lg text-gray-700 text-center mb-12">
            Transporters are vetted to reduce client exposure to:
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 p-8 text-center border border-gray-200">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Unreliable Carriers</h3>
              <p className="text-gray-600">Verified track records and performance history</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 p-8 text-center border border-gray-200">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Non-compliant Vehicles</h3>
              <p className="text-gray-600">Proper licensing, documentation, and insurance</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 p-8 text-center border border-gray-200">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Undocumented Operations</h3>
              <p className="text-gray-600">Full transparency and accountability</p>
            </div>
          </div>

          <p className="text-lg font-semibold text-emerald-700 text-center">
            Because the story is only as strong as the people telling it.
          </p>
        </div>
      </section>
       <div className="h-[80px] w-full bg-white"></div>
    </div>
  );
}
