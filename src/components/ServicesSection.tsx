import { Truck, Package, MapPin, BarChart3 } from 'lucide-react';
import FadeIn from "./FadeIn";

export default function ServicesSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-slate-50 to-blue-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-4">
              <span className="text-blue-700 text-sm font-semibold">Our Core Services</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Comprehensive Logistics Solutions for South Africa
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From freight booking to cross-border logistics, we handle the complexity so you can focus on your business.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              icon: Package,
              color: "emerald",
              title: "Freight Booking Made Easy",
              desc: "Post your load requirements and get instant access to a verified network of transporters across South Africa and Southern Africa. No more phone calls, no hidden costs.",
              features: ["Real-time availability", "Instant pricing", "Direct communication"]
            },
            {
              icon: Truck,
              color: "blue",
              title: "Truck & Transporter Matching",
              desc: "Our intelligent matching system pairs your cargo with the perfect transporter based on route, capacity, service level, and reliability rating.",
              features: ["AI-powered matching", "Quality verified suppliers", "Rating & reviews"]
            },
            {
              icon: MapPin,
              color: "orange",
              title: "Live Tracking & Visibility",
              desc: "Know exactly where your shipment is, every step of the way. Real-time GPS tracking, milestone updates, and instant notifications.",
              features: ["GPS tracking", "Live updates", "Milestone alerts"]
            },
            {
              icon: BarChart3,
              color: "purple",
              title: "Logistics Coordination & Compliance",
              desc: "One central partner handles all coordination, documentation, customs clearance, and compliance — especially for cross-border freight movements.",
              features: ["End-to-end coordination", "Customs support", "Compliance ready"]
            }
          ].map((service, index) => (
            <FadeIn
              key={index}
              direction={index % 2 === 0 ? "left" : "right"}
              delay={200 + (index * 150)}
              duration={900}
              distance={50}
              blur={true}
            >
              <div className={`group rounded-2xl border-2 border-gray-200 bg-white p-8 hover:border-${service.color}-300 hover:shadow-xl hover:shadow-${service.color}-100 transition-all duration-500 hover:-translate-y-3`}>
                <div className={`h-16 w-16 rounded-xl bg-${service.color}-100 flex items-center justify-center mb-6 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500`}>
                  <service.icon className={`h-8 w-8 text-${service.color}-600`} />
                </div>
                <h3 className={`text-2xl font-bold text-slate-900 mb-3 group-hover:text-${service.color}-600 transition-colors duration-300`}>
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.desc}
                </p>
                <div className="space-y-2">
                  {service.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <svg className={`h-4 w-4 text-${service.color}-600 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
