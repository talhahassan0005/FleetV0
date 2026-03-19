import { CheckCircle2, Award, Shield, Zap } from 'lucide-react';
import FadeIn from "./FadeIn";

export default function TrustSection() {
  return (
    <section className="py-16 md:py-24 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full mb-4">
              <span className="text-emerald-700 text-sm font-semibold">Why Choose Us</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Why Logistics Businesses Trust FleetXchange
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're not just a platform — we're your logistics partner built on trust, reliability, and proven results.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: CheckCircle2,
              color: "emerald",
              title: "Verified Transporters",
              desc: "All transporters in our network are screened, verified, and monitored for compliance and reliability."
            },
            {
              icon: Zap,
              color: "blue",
              title: "Fast Delivery",
              desc: "Get matched with the right transporter in hours, not days. Real-time coordination for faster turnarounds."
            },
            {
              icon: Shield,
              color: "orange",
              title: "Secure & Reliable",
              desc: "End-to-end tracking, real-time updates, and full accountability for every shipment on every route."
            },
            {
              icon: Award,
              color: "purple",
              title: "Industry Leading",
              desc: "Trusted by FMCG, retail, manufacturing, and logistics business across Southern Africa for years."
            }
          ].map((item, index) => (
            <FadeIn
              key={index}
              direction={index % 2 === 0 ? "left" : "right"}
              delay={200 + (index * 100)}
              duration={800}
              distance={40}
              blur={true}
            >
              <div className="relative p-8 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100 transition-all duration-500 hover:-translate-y-2 group">
                <div className={`h-14 w-14 rounded-lg bg-${item.color}-100 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500`}>
                  <item.icon className={`h-7 w-7 text-${item.color}-600`} />
                </div>
                <h3 className={`text-lg font-bold text-slate-900 mb-3 group-hover:text-${item.color}-600 transition-colors duration-300`}>
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
