import { Star, MessageSquare } from 'lucide-react';
import FadeIn from "./FadeIn";

export default function SocialProof() {
  return (
    <section className="py-16 md:py-24 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-amber-50 border border-amber-200 rounded-full mb-4">
              <span className="text-amber-700 text-sm font-semibold">Testimonials</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Trusted by Logistics Businesses Across Africa
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join hundreds of companies already saving time and money with FleetXchange.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            {
              name: "FMCG Distribution Manager",
              company: "Leading Retail Chain",
              quote: "FleetXchange cut our logistics coordination time in half. Instead of calling multiple transporters, we have one reliable partner.",
              rating: 5
            },
            {
              name: "Supply Chain Director",
              company: "Manufacturing Company",
              quote: "Real-time tracking changed the game for us. We can now give customers accurate ETAs and manage inventory more efficiently.",
              rating: 5
            },
            {
              name: "Operations Manager",
              company: "Cross-Border Logistics",
              quote: "Navigating customs and compliance across borders is complex. FleetXchange handles it seamlessly. Worth every cent.",
              rating: 5
            }
          ].map((testimonial, index) => (
            <FadeIn
              key={index}
              direction={index === 0 ? "left" : index === 1 ? "up" : "right"}
              delay={200 + (index * 150)}
              duration={900}
              distance={50}
              blur={true}
            >
              <div className="rounded-xl border-2 border-gray-200 bg-gradient-to-br from-white to-slate-50 p-8 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100 transition-all duration-500 hover:-translate-y-3 group">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform duration-300" />
                  ))}
                </div>

                {/* Quote */}
                <div className="mb-6">
                  <MessageSquare className="h-6 w-6 text-emerald-400 mb-4 opacity-50" />
                  <p className="text-gray-700 font-medium leading-relaxed">
                    &quot;{testimonial.quote}&quot;
                  </p>
                </div>

                {/* Author */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="font-semibold text-slate-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.company}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Stats Section */}
        <FadeIn direction="up" delay={600} duration={800} distance={40}>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { num: "500+", label: "Active Users" },
              { num: "1000+", label: "Shipments Monthly" },
              { num: "5 Countries", label: "Operational Reach" },
              { num: "98%", label: "On-Time Delivery" }
            ].map((stat, index) => (
              <FadeIn
                key={index}
                direction="up"
                delay={700 + (index * 100)}
                duration={700}
                distance={30}
              >
                <div className="text-center p-6 rounded-xl border border-gray-200 bg-gradient-to-br from-emerald-50 to-blue-50 hover:border-emerald-300 hover:shadow-lg transition-all duration-500">
                  <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">{stat.num}</div>
                  <p className="text-gray-700 font-medium">{stat.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
