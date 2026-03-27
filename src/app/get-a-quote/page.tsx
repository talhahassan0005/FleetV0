import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get a Freight Quote | Instant Quotes South Africa | FleetXchange",
  description: "Get an instant quote for your freight. Compare rates from verified transporters in South Africa. Fast, transparent, no hidden fees.",
  keywords: "freight quote, transport quote, truck transport cost, freight cost calculator, logistics quote",
  openGraph: {
    title: "Get a Freight Quote | FleetXchange",
    description: "Get instant quotes from verified transporters. Compare rates and save money.",
    type: "website",
  },
};

export default function GetAQuotePage() {
  return <GetAQuoteContent />;
}

function GetAQuoteContent() {
  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Get Your Instant Freight Quote
            </h1>
            
            <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto">
              No hidden fees. No surprises. Get competitive rates from verified transporters in 5 minutes.
            </p>

            {/* HIGHLIGHT BADGES */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto py-8">
              <div>
                <p className="text-3xl font-bold text-emerald-300">&lt;5 min</p>
                <p className="text-sm text-gray-300">Quote Time</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-300">0%</p>
                <p className="text-sm text-gray-300">Hidden Fees</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-300">3+</p>
                <p className="text-sm text-gray-300">Quotes Min</p>
              </div>
            </div>

            <a href="/contact?type=quote&source=get-a-quote" className="inline-block">
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                💰 Get Your Quote
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* WHY GET A QUOTE */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Why Get a Quote from FleetXchange?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: "⚡", 
                title: "Lightning Fast", 
                desc: "Get multiple quotes in under 5 minutes. No lengthy application process." 
              },
              { 
                icon: "💵", 
                title: "Save Money", 
                desc: "Compare rates from 3+ verified transporters and choose the best value." 
              },
              { 
                icon: "🔒", 
                title: "No Commitment", 
                desc: "Get quotes without any obligation to book. See all costs upfront." 
              },
              { 
                icon: "✓", 
                title: "Verified Quotes", 
                desc: "All quotes come from verified, insured transporters with track records." 
              },
              { 
                icon: "📱", 
                title: "Easy to Compare", 
                desc: "Side-by-side comparison of rates, timing, and transporter ratings." 
              },
              { 
                icon: "🎯", 
                title: "Tailored Options", 
                desc: "Get quotes based on your specific route, cargo type, and timeline." 
              }
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">How to Get a Quote</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { num: "1", title: "Tell Us Your Freight", desc: "Size, weight, cargo type, pickup & drop locations" },
              { num: "2", title: "Set Your Timeline", desc: "When do you need transport? ASAP, tomorrow, or specific date" },
              { num: "3", title: "Receive Quotes", desc: "Get 3+ quotes from verified transporters within 5 minutes" },
              { num: "4", title: "Book or Compare", desc: "Book immediately or compare further. No rush!" }
            ].map((step, i) => (
              <div key={i} className="bg-emerald-50 rounded-lg p-6 border border-emerald-200 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-600 text-white font-bold text-lg mb-4">
                  {step.num}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING GUARANTEE */}
      <section className="py-16 md:py-20 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Transparent Pricing Guarantee</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl text-emerald-600 mb-3">✓</div>
              <h3 className="font-bold text-slate-900 mb-2">No Hidden Fees</h3>
              <p className="text-gray-600 text-sm">What you see in the quote is what you pay. Period.</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl text-emerald-600 mb-3">✓</div>
              <h3 className="font-bold text-slate-900 mb-2">Price Lock</h3>
              <p className="text-gray-600 text-sm">Quotes are valid for 24 hours. Lock in your rate.</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl text-emerald-600 mb-3">✓</div>
              <h3 className="font-bold text-slate-900 mb-2">Quality Service</h3>
              <p className="text-gray-600 text-sm">All transporters are verified, insured, and rated.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Common Questions About Quotes</h2>
          
          <div className="space-y-6">
            {[
              {
                q: "How long does it take to get a quote?",
                a: "Typically under 5 minutes from the time you submit your details. You'll receive quotes directly on the platform."
              },
              {
                q: "Can I request multiple quotes?",
                a: "Yes! You'll get 3-5 quotes from different transporters for the same route. Compare rates and choose the best one."
              },
              {
                q: "Are the quotes binding?",
                a: "No. A quote is an estimate. Once you book, you'll confirm the final details with the transporter."
              },
              {
                q: "What if I need a rush quote?",
                a: "We offer express quotes for ASAP shipments. Contact our team via WhatsApp: +27738281478"
              },
              {
                q: "Do you cover all of South Africa?",
                a: "Yes, we cover all major cities and can arrange cross-border transport across Southern Africa."
              }
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold text-slate-900 mb-2 text-lg">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-800 to-emerald-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Get Your Quote Today</h2>
          <p className="text-lg text-gray-100 mb-8 max-w-2xl mx-auto">
            No delays. No hidden surprises. Just honest, competitive pricing from verified transporters.
          </p>
          <a href="/contact?type=quote&source=get-a-quote" className="inline-block">
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              💰 Get Your Quote in 5 Minutes
            </button>
          </a>
        </div>
      </section>
    </div>
  );
}
