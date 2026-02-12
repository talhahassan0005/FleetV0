'use client';
import FadeIn from "@/components/FadeIn";
import { FileText, CheckCircle, Users, CreditCard, Shield, XCircle, RefreshCw, Scale, Mail } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 text-white py-24 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.5) 1px, transparent 0px)",
            backgroundSize: "40px 40px"
          }}></div>
        </div>
        
        {/* Animated glow effect */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn direction="down" delay={0} duration={1000} distance={40} blur={true}>
            <div className="relative inline-block">
              <FileText className="h-20 w-20 text-emerald-400 mx-auto mb-6 animate-pulse group-hover:scale-110 transition-transform duration-500" />
              <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-0 group-hover:opacity-100"></span>
            </div>
          </FadeIn>
          
          <FadeIn direction="up" delay={200} duration={900} distance={30} blur={true}>
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Terms of Service
            </h1>
          </FadeIn>
          
          <FadeIn direction="up" delay={400} duration={800} distance={20} blur={true}>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Please read these terms carefully before using our platform
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.2) 1px, transparent 0px)",
            backgroundSize: "40px 40px"
          }}></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Commitment to You</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">FleetXchange provides transparent and fair terms for all users of our freight coordination platform.</p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: CheckCircle, color: "emerald", title: "Fair Terms", desc: "Clear and transparent terms that protect both shippers and transporters." },
              { icon: Shield, color: "blue", title: "Legal Protection", desc: "Governed by South African law with international freight regulations." },
              { icon: Users, color: "purple", title: "User Rights", desc: "Clear definition of rights and responsibilities for all parties." }
            ].map((item, index) => (
              <FadeIn 
                key={index}
                direction={index === 0 ? "left" : index === 1 ? "up" : "right"} 
                delay={200 + (index * 150)} 
                duration={800}
                distance={40}
                blur={true}
              >
                <div className={`group bg-gradient-to-br from-${item.color}-50 to-white p-8 rounded-2xl border border-${item.color}-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="relative">
                    <div className="relative inline-block">
                      <div className={`p-3 rounded-lg bg-${item.color}-100 group-hover:bg-${item.color}-200 transition-all duration-500`}>
                        <item.icon className={`h-12 w-12 text-${item.color}-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`} />
                      </div>
                      <span className={`absolute inset-0 rounded-lg bg-${item.color}-400/20 animate-ping opacity-0 group-hover:opacity-100`}></span>
                    </div>
                    <h3 className={`text-xl font-bold text-slate-900 mb-2 mt-4 group-hover:text-${item.color}-700 transition-colors duration-300`}>
                      {item.title}
                    </h3>
                    <p className="text-gray-600 group-hover:text-gray-900 transition-colors duration-300">{item.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Sections */}
      <section className="py-16 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(45deg, rgba(16, 185, 129, 0.1) 25%, transparent 25%, transparent 50%, rgba(16, 185, 129, 0.1) 50%, rgba(16, 185, 129, 0.1) 75%, transparent 75%, transparent)",
            backgroundSize: "30px 30px"
          }}></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {[
              {
                icon: CheckCircle,
                color: "emerald",
                title: "1. Acceptance of Terms",
                subtitle: "Agreement to use our services",
                desc: "By accessing and using FleetXchange services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform. Continued use constitutes acceptance of any updates to these terms."
              },
              {
                icon: FileText,
                color: "blue",
                title: "2. Service Description",
                subtitle: "What we provide",
                desc: "FleetXchange provides digital freight coordination services across Southern Africa, connecting shippers with verified transporters for cargo movement. We act as a coordination platform and facilitate communication between parties."
              },
              {
                icon: Users,
                color: "purple",
                title: "3. User Responsibilities",
                subtitle: "Your obligations as a user",
                desc: null,
                list: [
                  "Provide accurate and complete information",
                  "Maintain the security of account credentials",
                  "Comply with all applicable laws and regulations",
                  "Not misuse or abuse the platform",
                  "Respect intellectual property rights"
                ]
              },
              {
                icon: CreditCard,
                color: "orange",
                title: "4. Payment Terms",
                subtitle: "Financial arrangements",
                desc: "Payment terms are agreed upon between parties. FleetXchange facilitates coordination but is not responsible for payment disputes between shippers and transporters. All financial transactions should be documented and agreed upon in writing."
              },
              {
                icon: Shield,
                color: "red",
                title: "5. Liability Limitations",
                subtitle: "Platform responsibilities",
                desc: "FleetXchange acts as a coordination platform. We are not liable for cargo damage, loss, delays, or disputes arising from freight services. Users should maintain appropriate insurance. We do not guarantee the performance of third-party transporters."
              },
              {
                icon: XCircle,
                color: "pink",
                title: "6. Termination",
                subtitle: "Account suspension and closure",
                desc: "We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activities. Users may also terminate their accounts at any time by contacting support."
              },
              {
                icon: RefreshCw,
                color: "indigo",
                title: "7. Changes to Terms",
                subtitle: "Updates and modifications",
                desc: "FleetXchange may update these terms at any time. Continued use of the platform constitutes acceptance of updated terms. We will notify users of significant changes via email or platform notifications."
              },
              {
                icon: Scale,
                color: "teal",
                title: "8. Governing Law",
                subtitle: "Legal jurisdiction",
                desc: "These terms are governed by the laws of South Africa and applicable international freight regulations. Any disputes will be resolved in South African courts."
              }
            ].map((section, index) => (
              <FadeIn 
                key={index}
                direction="left" 
                delay={100 + (index * 100)} 
                duration={800}
                distance={30}
                blur={true}
              >
                <div className={`group bg-white rounded-2xl shadow-lg p-8 md:p-12 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <div className="relative">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="relative">
                        <div className={`bg-${section.color}-100 p-3 rounded-lg group-hover:bg-${section.color}-200 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                          <section.icon className={`h-8 w-8 text-${section.color}-600 group-hover:scale-110 transition-transform duration-500`} />
                        </div>
                        <span className={`absolute inset-0 rounded-lg bg-${section.color}-400/20 animate-ping opacity-0 group-hover:opacity-100`}></span>
                      </div>
                      <div>
                        <h2 className={`text-3xl font-bold text-slate-900 mb-2 group-hover:text-${section.color}-700 transition-colors duration-300`}>
                          {section.title}
                        </h2>
                        <p className="text-gray-600 group-hover:text-gray-900 transition-colors duration-300">{section.subtitle}</p>
                      </div>
                    </div>
                    
                    <div className={`border-l-4 border-${section.color}-500 pl-6`}>
                      {section.desc && (
                        <p className="text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                          {section.desc}
                        </p>
                      )}
                      {section.list && (
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                          {section.list.map((item, itemIndex) => (
                            <FadeIn 
                              key={itemIndex}
                              direction="up" 
                              delay={200 + (index * 100) + (itemIndex * 70)} 
                              duration={500}
                              distance={10}
                            >
                              <li className="group/item flex items-start gap-2">
                                <span className={`w-1.5 h-1.5 bg-${section.color}-500 rounded-full mt-2 group-hover/item:scale-150 transition-transform duration-300`}></span>
                                <span className="group-hover/item:text-gray-900 group-hover/item:font-medium transition-all duration-300">
                                  {item}
                                </span>
                              </li>
                            </FadeIn>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}

            {/* Contact Section */}
            <FadeIn direction="up" delay={900} duration={900} distance={40} blur={true}>
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-lg p-8 md:p-12 text-white relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <div className="relative">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="relative">
                      <div className="bg-white/20 p-3 rounded-lg group-hover:bg-white/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        <Mail className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <span className="absolute inset-0 rounded-lg bg-white/20 animate-ping opacity-0 group-hover:opacity-100"></span>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold mb-2 group-hover:text-white transition-colors duration-300">9. Contact Information</h2>
                      <p className="text-emerald-100 group-hover:text-white/90 transition-colors duration-300">Questions about these terms</p>
                    </div>
                  </div>
                  
                  <p className="text-white/90 mb-4 group-hover:text-white transition-colors duration-300">For questions about these terms, contact:</p>
                  
                  <a 
                    href="mailto:mrtiger@fleetxchange.africa" 
                    className="inline-block bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-all duration-500 hover:scale-110 hover:shadow-xl relative overflow-hidden group/btn"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      mrtiger@fleetxchange.africa
                      <Mail className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-emerald-50 transform -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500"></span>
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Last Updated */}
          <FadeIn direction="up" delay={1000} duration={600} distance={20}>
            <div className="bg-emerald-50 rounded-2xl p-8 mt-12 border-2 border-emerald-200 text-center group hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
              <p className="text-gray-700 font-medium group-hover:text-emerald-700 transition-colors duration-300">
                Last updated: January 2026
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mt-4 rounded-full overflow-hidden">
                <div className="w-full h-full bg-white transform -translate-x-full animate-[slide_2s_ease-in-out_infinite]"></div>
              </div>
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