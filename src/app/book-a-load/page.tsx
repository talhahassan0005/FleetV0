import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Load | Freight Booking South Africa | FleetXchange",
  description: "Post your freight load and get matched with verified transporters in minutes. Real-time tracking included. Book trucks across South Africa now.",
  keywords: "book freight, freight booking South Africa, truck hire, transport booking, load posting",
  openGraph: {
    title: "Book a Load | Freight Booking South Africa | FleetXchange",
    description: "Post your freight load and get matched with verified transporters in minutes.",
    type: "website",
  },
};

export default function BookALoadPage() {
  return (
    <div>
      <BookALoadContent />
    </div>
  );
}

function BookALoadContent() {
  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-emerald-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Post Your Freight Load in Minutes
            </h1>
            
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
              Get matched with verified transporters instantly. Track your shipment in real-time across South Africa.
            </p>

            {/* TRUST METRICS */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto py-8">
              <div>
                <p className="text-3xl font-bold text-emerald-300">500+</p>
                <p className="text-sm text-blue-100">Verified Transporters</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-300">&lt;5 min</p>
                <p className="text-sm text-blue-100">Average Quote Time</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-300">4.9★</p>
                <p className="text-sm text-blue-100">User Rating</p>
              </div>
            </div>

            <a href="/login?type=shipper&source=book-a-load" className="inline-block">
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                📦 Post Your Load Now
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">How Freight Booking Works</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { num: "1", title: "Post Your Load", desc: "Add freight details, pickup, destination, timeline" },
              { num: "2", title: "Get Quotes", desc: "Receive quotes from verified transporters in minutes" },
              { num: "3", title: "Select & Book", desc: "Choose the best option and confirm booking instantly" },
              { num: "4", title: "Track & Confirm", desc: "Real-time tracking until delivery with proof of delivery" }
            ].map((step, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 font-bold text-lg mb-4">
                  {step.num}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY FLEETXCHANGE */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Why Choose FleetXchange?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "✓", title: "Verified Transporters", desc: "100% screened and background checked professionals" },
              { icon: "📍", title: "Real-Time Tracking", desc: "Know exactly where your load is 24/7" },
              { icon: "💰", title: "Competitive Pricing", desc: "Get multiple quotes and choose the best option" },
              { icon: "🛡️", title: "Secure & Reliable", desc: "Insurance coverage on every shipment" },
              { icon: "⏱️", title: "Fast Service", desc: "Quotes in minutes, not hours or days" },
              { icon: "📱", title: "Mobile Friendly", desc: "Book and track from anywhere anytime" }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Book Your Freight?</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Post your load in 2 minutes. Get quotes from verified transporters in 5 minutes. Save time and money.
          </p>
          <a href="/login?type=shipper&source=book-a-load" className="inline-block">
            <button className="bg-white text-blue-600 font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors text-lg shadow-lg">
              📦 Post Your Load Now
            </button>
          </a>
        </div>
      </section>
    </div>
  );
}
