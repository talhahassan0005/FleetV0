'use client';

import PageHero from "@/components/PageHero";
import FadeIn from "@/components/FadeIn";
import { ClipboardList, TrendingUp, Users, Flag, CheckCircle } from 'lucide-react';

export default function TransportersPage() {
  return (
    <div className="min-h-screen">
      <PageHero 
        title="For Transporters" 
        subtitle="Grow your business with consistent loads and fair rates"
        badge="Join Our Network"
      />
      
      {/* Why Partner With FleetXchange Section */}
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
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Why Partner With FleetXchange?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We&#39;re building a network of trusted partners who understand that sustainable business is built on clear processes, professional conduct, and mutual accountability.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: ClipboardList,
                title: "Clear Load Confirmation Sheets",
                desc: "Every load comes with detailed documentation outlining requirements, timelines, and expectations.",
                color: "emerald"
              },
              {
                icon: TrendingUp,
                title: "Transparent Payment Milestones",
                desc: "Know exactly when and how you'll be paid. No surprises, no delays, no confusion.",
                color: "emerald"
              },
              {
                icon: Users,
                title: "Consistent Communication",
                desc: "Regular updates, clear points of contact, and professional coordination throughout.",
                color: "emerald"
              },
              {
                icon: Flag,
                title: "Performance-Based Allocation",
                desc: "Reliable partners get consistent work. Quality and professionalism are rewarded.",
                color: "emerald"
              }
            ].map((item, index) => (
              <FadeIn 
                key={index}
                direction={index % 2 === 0 ? "left" : "right"} 
                delay={200 + (index * 150)} 
                duration={800}
                distance={40}
                blur={true}
              >
                <div className="group rounded-2xl bg-white border border-gray-200 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 p-8 hover:border-emerald-300">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 group-hover:bg-emerald-200 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                          <item.icon className="h-8 w-8 text-emerald-600 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-0 group-hover:opacity-100"></span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors duration-300">
                        {item.title}
                      </h3>
                      <p className="text-gray-700 text-lg group-hover:text-gray-900 transition-colors duration-300">
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

      {/* What We Look For Section */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(45deg, rgba(16, 185, 129, 0.1) 25%, transparent 25%, transparent 50%, rgba(16, 185, 129, 0.1) 50%, rgba(16, 185, 129, 0.1) 75%, transparent 75%, transparent)",
            backgroundSize: "30px 30px"
          }}></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                What We Look For
              </h2>
              <p className="text-xl text-gray-600">
                Professional transporters who meet these standards:
              </p>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={200} duration={900} distance={40} blur={true}>
            <div className="rounded-3xl border-2 border-emerald-400 bg-white p-12 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-5">
                  {[
                    "Valid operating licenses and permits",
                    "Well-maintained vehicle fleet",
                    "Compliance with cross-border regulations",
                    "Transparent communication practices"
                  ].map((item, index) => (
                    <FadeIn 
                      key={index}
                      direction="left" 
                      delay={300 + (index * 100)} 
                      duration={600}
                      distance={20}
                    >
                      <div className="flex items-start gap-4 group">
                        <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1 group-hover:scale-125 group-hover:rotate-6 transition-all duration-300" />
                        <p className="text-lg text-gray-800 font-medium group-hover:text-emerald-700 transition-colors duration-300">
                          {item}
                        </p>
                      </div>
                    </FadeIn>
                  ))}
                </div>

                {/* Right Column */}
                <div className="space-y-5">
                  {[
                    "Comprehensive insurance coverage",
                    "Professional driver standards",
                    "Commitment to documentation and reporting",
                    "Proven track record of reliability"
                  ].map((item, index) => (
                    <FadeIn 
                      key={index}
                      direction="right" 
                      delay={350 + (index * 100)} 
                      duration={600}
                      distance={20}
                    >
                      <div className="flex items-start gap-4 group">
                        <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1 group-hover:scale-125 group-hover:rotate-6 transition-all duration-300" />
                        <p className="text-lg text-gray-800 font-medium group-hover:text-emerald-700 transition-colors duration-300">
                          {item}
                        </p>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Built on Trust Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Animated glow effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-0 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/2 right-0 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              Built on Trust
            </h2>
          </FadeIn>
          
          <FadeIn direction="up" delay={200} duration={900} distance={20} blur={true}>
            <p className="text-xl text-gray-700 mb-6">
              We believe strong stories are built on{' '}
              <span className="text-emerald-600 font-semibold relative inline-block group">
                trust
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-300"></span>
              </span>
              ,{' '}
              <span className="text-emerald-600 font-semibold relative inline-block group">
                compliance
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-300"></span>
              </span>
              , and{' '}
              <span className="text-emerald-600 font-semibold relative inline-block group">
                accountability
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-300"></span>
              </span>
              .
            </p>
          </FadeIn>

          <FadeIn direction="up" delay={300} duration={900} distance={20} blur={true}>
            <p className="text-lg text-gray-700 mb-12">
              FleetXchange isn&#39;t looking for one-time partnerships. We&#39;re building a network of{' '}
              <span className="text-emerald-600 font-semibold">reliable transporters</span>{' '}
              who want to grow with us as we expand across Southern Africa.
            </p>
          </FadeIn>

          <FadeIn direction="up" delay={400} duration={1000} distance={40} blur={true}>
            <div className="rounded-3xl bg-emerald-50 border-2 border-emerald-300 p-12 hover:shadow-xl hover:border-emerald-400 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden group">
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 group-hover:text-emerald-700 transition-colors duration-300">
                Performance = Opportunity
              </h3>
              <p className="text-lg text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                Transporters who consistently deliver quality service receive priority load allocation, repeat business, and access to our growing client base.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Ready to Join CTA Section */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
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

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn direction="down" delay={0} duration={1000} distance={40} blur={true}>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Ready to join our network?
            </h2>
          </FadeIn>
          
          <FadeIn direction="up" delay={200} duration={900} distance={30} blur={true}>
            <p className="text-xl text-gray-300 mb-12">
              Get in touch to start the vetting process and become part of the FleetXchange story.
            </p>
          </FadeIn>

          <FadeIn direction="up" delay={400} duration={800} distance={20} once={true}>
            <a href="/contact">
              <button className="group relative bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all duration-500 hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl inline-flex items-center gap-2 overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Apply as Transporter 
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </span>
                <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></span>
              </button>
            </a>
          </FadeIn>

          {/* Animated underline */}
          <FadeIn direction="up" delay={500} duration={600} distance={10}>
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mt-12 rounded-full overflow-hidden">
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