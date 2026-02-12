import PageHero from "@/components/PageHero";
import { CheckCircle2, XCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <PageHero 
        title="We tell the story" 
        subtitle="Built to bring clarity, accountability, and control to freight movement across Southern Africa"
        badge="About FleetXchange"
      />
      
      {/* OUR STORY SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">Our Story</h2>
          <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
            <p>
              Moving freight across borders in Southern Africa involves multiple parties, fragmented communication, and unclear accountability. Too many different stakeholders are involved in every movement, making it difficult for clients to know what&#39;s happening, who&#39;s responsible, and how to respond when issues arise.
            </p>
            <p>
              FleetXchange exists to bring coordination and accountability to this fragmented landscape. We act as the single point of contact between our clients and their transporters, taking responsibility for overseeing the entire movement from start to finish.
            </p>
            <p className="font-semibold text-emerald-700 text-xl text-center pt-6">
              We tell the story so our clients don&#39;t have to chase it.
            </p>
          </div>
        </div>
      </section>

      {/* OUR VISION SECTION */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">Our Vision</h2>
          <div className="rounded-2xl bg-white border-2 border-emerald-300 p-12 shadow-lg">
            <p className="text-xl md:text-2xl text-gray-800 leading-relaxed font-semibold">
              FleetXchange exists to bring <span className="text-emerald-600">clarity, transparency, and accountability</span> to logistics through <span className="text-emerald-600">storytelling powered by data</span>.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT MAKES US DIFFERENT SECTION */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">What Makes Us Different</h2>
          <div className="rounded-xl border border-none shadow-xl bg-white p-8 md:p-12">
            <div className="space-y-8">
              {/* PROBLEMS */}
              <div>
                <p className="text-lg text-gray-700 font-medium mb-6">Most logistics issues don&#39;t happen because there is no truck. They happen because:</p>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <XCircle className="h-6 w-6 text-red-500 mt-0 flex-shrink-0 p-0.5 bg-red-100 rounded-full" />
                    <span className="text-gray-700">responsibilities are unclear</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <XCircle className="h-6 w-6 text-red-500 mt-0 flex-shrink-0 p-0.5 bg-red-100 rounded-full" />
                    <span className="text-gray-700">information is scattered</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <XCircle className="h-6 w-6 text-red-500 mt-0 flex-shrink-0 p-0.5 bg-red-100 rounded-full" />
                    <span className="text-gray-700">issues are escalated too late</span>
                  </li>
                </ul>
              </div>

              {/* SOLUTION */}
              <div>
                <div className="p-8 bg-emerald-50 rounded-xl border-2 border-emerald-300">
                  <p className="text-lg font-semibold text-emerald-900">
                    FleetXchange solves this by acting as the coordination layer — ensuring every party involved is aligned to one documented plan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR ROLE SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">
            Our Role
            <span className="block text-lg font-normal text-gray-600 mt-2">Clear & Transparent</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            {/* WHAT WE DON'T DO */}
            <div className="rounded-xl border border-none shadow-lg p-8 md:p-12 bg-red-50">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">FleetXchange Does NOT:</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Operate vehicles or fleets</span>
                </li>
                <li className="flex items-start space-x-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Employ drivers</span>
                </li>
                <li className="flex items-start space-x-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Take physical custody of cargo</span>
                </li>
              </ul>
            </div>

            {/* WHAT WE DO */}
            <div className="rounded-xl border border-none shadow-lg p-8 md:p-12 bg-emerald-50">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Instead We:</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Coordinate the movement end-to-end</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Oversee transporters and service providers</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Monitor progress and milestones</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Communicate status to all parties</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Escalate issues proactively</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to work with a partner you can trust?</h2>
          <p className="text-xl text-gray-300 mb-8">Let&#39;s tell the story of your cargo together.</p>
          <a href="/contact">
            <button className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-lg px-8 py-2 rounded-md shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              Request a Load Movement
            </button>
          </a>
        </div>
      </section>
       <div className="h-[80px] w-full bg-white"></div>
    </div>
  );
}
