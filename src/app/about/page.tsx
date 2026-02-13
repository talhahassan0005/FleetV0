'use client';

import PageHero from "@/components/PageHero";
import FadeIn from "@/components/FadeIn";
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
          <FadeIn 
            direction="up" 
            delay={0}
            duration={800}
            blur={true}
            distance={30}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">Our Story</h2>
          </FadeIn>
          
          <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
            <FadeIn direction="up" delay={200} duration={900} distance={20} blur={true}>
              <p>
                Moving freight across borders in Southern Africa involves multiple parties, fragmented communication, and unclear accountability. Too many different stakeholders are involved in every movement, making it difficult for clients to know what&#39;s happening, who&#39;s responsible, and how to respond when issues arise.
              </p>
            </FadeIn>
            
            <FadeIn direction="up" delay={300} duration={900} distance={20} blur={true}>
              <p>
                FleetXchange exists to bring coordination and accountability to this fragmented landscape. We act as the single point of contact between our clients and their transporters, taking responsibility for overseeing the entire movement from start to finish.
              </p>
            </FadeIn>
            
            <FadeIn 
              direction="up" 
              delay={500} 
              duration={1000} 
              distance={15}
              blur={false}
            >
              <p className="font-semibold text-emerald-700 text-xl text-center pt-6 transform hover:scale-105 transition-transform duration-300">
                We tell the story so our clients don&#39;t have to chase it.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* OUR VISION SECTION */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn 
            direction="down" 
            delay={0} 
            duration={800}
            blur={true}
            distance={30}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">Our Vision</h2>
          </FadeIn>
          
          <FadeIn 
            direction="up" 
            delay={200} 
            duration={1000}
            blur={true}
            distance={40}
          >
            <div className="rounded-2xl bg-white border-2 border-emerald-300 p-12 shadow-lg hover:shadow-2xl transition-shadow duration-500">
              <p className="text-xl md:text-2xl text-gray-800 leading-relaxed font-semibold">
                FleetXchange exists to bring <span className="text-emerald-600 relative inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-emerald-200 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300">clarity, transparency, and accountability</span> to logistics through <span className="text-emerald-600 relative inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-emerald-200 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300">storytelling powered by data</span>.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* WHAT MAKES US DIFFERENT SECTION */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn 
            direction="left" 
            delay={0} 
            duration={800}
            blur={true}
            distance={50}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">What Makes Us Different</h2>
          </FadeIn>
          
          <FadeIn 
            direction="right" 
            delay={200} 
            duration={1000}
            blur={true}
            distance={50}
          >
            <div className="rounded-xl border border-none shadow-xl bg-white p-8 md:p-12 hover:shadow-2xl transition-shadow duration-500">
              <div className="space-y-8">
                {/* PROBLEMS */}
                <div>
                  <p className="text-lg text-gray-700 font-medium mb-6">Most logistics issues don&#39;t happen because there is no truck. They happen because:</p>
                  <div className="space-y-3">
                    {[
                      "responsibilities are unclear",
                      "information is scattered",
                      "issues are escalated too late"
                    ].map((text, index) => (
                      <FadeIn 
                        key={index}
                        direction="left" 
                        delay={300 + (index * 100)} 
                        duration={600}
                        distance={20}
                      >
                        <li className="flex items-start space-x-3 list-none">
                          <XCircle className="h-6 w-6 text-red-500 mt-0 flex-shrink-0 p-0.5 bg-red-100 rounded-full hover:rotate-12 transition-transform duration-300" />
                          <span className="text-gray-700">{text}</span>
                        </li>
                      </FadeIn>
                    ))}
                  </div>
                </div>

                {/* SOLUTION */}
                <FadeIn 
                  direction="up" 
                  delay={600} 
                  duration={800}
                  distance={30}
                  blur={true}
                >
                  <div className="p-8 bg-emerald-50 rounded-xl border-2 border-emerald-300 hover:bg-emerald-100 transition-colors duration-500">
                    <p className="text-lg font-semibold text-emerald-900">
                      FleetXchange solves this by acting as the coordination layer — ensuring every party involved is aligned to one documented plan.
                    </p>
                  </div>
                </FadeIn>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* OUR ROLE SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-12">
          <FadeIn 
            direction="down" 
            delay={0} 
            duration={800}
            blur={true}
            distance={30}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">
              Our Role
              <span className="block text-lg font-normal text-gray-600 mt-2">Clear & Transparent</span>
            </h2>
          </FadeIn>
          
          <div className="grid md:grid-cols-2 gap-12">
            <FadeIn 
              direction="left" 
              delay={200} 
              duration={900}
              distance={60}
              blur={true}
            >
              <div className="rounded-xl border border-none shadow-lg p-8 md:p-12 bg-red-50 hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">FleetXchange Does NOT:</h3>
                <ul className="space-y-3">
                  {[
                    "Operate vehicles or fleets",
                    "Employ drivers",
                    "Take physical custody of cargo"
                  ].map((text, index) => (
                    <FadeIn 
                      key={index}
                      direction="left" 
                      delay={300 + (index * 100)} 
                      duration={600}
                      distance={15}
                    >
                      <li className="flex items-start space-x-3">
                        <XCircle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0 hover:scale-125 transition-transform duration-300" />
                        <span className="text-gray-700">{text}</span>
                      </li>
                    </FadeIn>
                  ))}
                </ul>
              </div>
            </FadeIn>
            
            <FadeIn 
              direction="right" 
              delay={300} 
              duration={900}
              distance={60}
              blur={true}
            >
              <div className="rounded-xl border border-none shadow-lg p-8 md:p-12 bg-emerald-50 hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Instead We:</h3>
                <ul className="space-y-3">
                  {[
                    "Coordinate the movement end-to-end",
                    "Oversee transporters and service providers",
                    "Monitor progress and milestones",
                    "Communicate status to all parties",
                    "Escalate issues proactively"
                  ].map((text, index) => (
                    <FadeIn 
                      key={index}
                      direction="right" 
                      delay={400 + (index * 100)} 
                      duration={600}
                      distance={15}
                    >
                      <li className="flex items-start space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0 hover:scale-125 transition-transform duration-300" />
                        <span className="text-gray-700">{text}</span>
                      </li>
                    </FadeIn>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white text-center relative overflow-hidden">
        {/* Animated background effect */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 blur-3xl animate-pulse"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeIn 
            direction="up" 
            delay={0} 
            duration={1000}
            distance={40}
            blur={true}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to work with a partner you can trust?</h2>
          </FadeIn>
          
          <FadeIn 
            direction="up" 
            delay={200} 
            duration={900}
            distance={30}
            blur={true}
          >
            <p className="text-xl text-gray-300 mb-8">Let&#39;s tell the story of your cargo together.</p>
          </FadeIn>
          
          <FadeIn 
            direction="up" 
            delay={400} 
            duration={800}
            distance={20}
            once={true}
          >
            <a href="/contact">
              <button className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-lg px-8 py-2 rounded-md shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95">
                Request a Load Movement
              </button>
            </a>
          </FadeIn>
        </div>
      </section>
      
      {/* <div className="h-[80px] w-full bg-white"></div> */}
    </div>
  );
}