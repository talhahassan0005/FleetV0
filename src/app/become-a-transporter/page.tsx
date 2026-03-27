import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Verified Transporter | Grow Your Business | FleetXchange",
  description: "Join 500+ verified transporters and grow your logistics business. Get consistent loads, flexible scheduling, and competitive rates. Apply now.",
  keywords: "become transporter, transport jobs, freight operator, logistics work, truck transport jobs South Africa",
  openGraph: {
    title: "Become a Verified Transporter | FleetXchange",
    description: "Join 500+ verified transporters. Get consistent loads and grow your business.",
    type: "website",
  },
};

export default function BecomeTransporterPage() {
  return <BecomeTransporterContent />;
}

function BecomeTransporterContent() {
  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-blue-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Grow Your Transporter Business
            </h1>
            
            <p className="text-lg md:text-xl text-emerald-100 max-w-3xl mx-auto">
              Join 500+ verified transporters across South Africa. Get consistent loads, flexible scheduling, and competitive earnings.
            </p>

            {/* TRUST METRICS */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto py-8">
              <div>
                <p className="text-3xl font-bold text-emerald-300">500+</p>
                <p className="text-sm text-emerald-100">Active Transporters</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-300">50K+</p>
                <p className="text-sm text-emerald-100">Monthly Loads</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-300">24/7</p>
                <p className="text-sm text-emerald-100">Support Available</p>
              </div>
            </div>

            <a href="/contact?type=transporter&source=become-transporter" className="inline-block">
              <button className="bg-emerald-400 hover:bg-emerald-500 text-slate-900 font-bold px-8 py-4 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                🚚 Apply Now
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Benefits of Joining FleetXchange</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-md">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Consistent Loads</h3>
              <p className="text-gray-600">Get access to 50,000+ monthly loads from verified customers across South Africa.</p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-md">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Competitive Earnings</h3>
              <p className="text-gray-600">Fair pricing and transparent rates. Keep more of what you earn with minimal commissions.</p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-md">
              <div className="text-3xl mb-3">⏰</div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Flexible Scheduling</h3>
              <p className="text-gray-600">Choose your own hours. Accept or decline loads based on your availability and routes.</p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-md">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Protected Business</h3>
              <p className="text-gray-600">Payment protection, dispute resolution, and insurance coverage for every job.</p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-md">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Easy-to-Use Platform</h3>
              <p className="text-gray-600">Mobile app and web dashboard. Accept loads, track earnings, manage invoices in one place.</p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-md">
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Dedicated Support</h3>
              <p className="text-gray-600">24/7 customer support team ready to help. WhatsApp, email, and phone support available.</p>
            </div>
          </div>
        </div>
      </section>

      {/* REQUIREMENTS */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Transporter Requirements</h2>
          
          <div className="max-w-3xl mx-auto bg-emerald-50 rounded-lg p-8 border border-emerald-200">
            <ul className="space-y-4">
              {[
                "Valid driver's license (PDP or higher)",
                "Professional operating license (POL) or Code 14",
                "Roadworthy certificate for your vehicle",
                "Professional indemnity insurance",
                "Business/trading name registration",
                "Tax clearance certificate or ITR",
                "CIDB grading (for larger contracts, optional)"
              ].map((req, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-emerald-600 font-bold text-lg">✓</span>
                  <span className="text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* APPLICATION PROCESS */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Simple Application Process</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { num: "1", title: "Apply Online", desc: "Fill in your details and vehicle information" },
              { num: "2", title: "Verification", desc: "We verify your documents and credentials" },
              { num: "3", title: "Approval", desc: "Get approved within 24-48 hours" },
              { num: "4", title: "Start Earning", desc: "Start accepting loads and earning money" }
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

      {/* FINAL CTA */}
      <section className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join 500+ verified transporters. Access consistent loads and grow your earnings with FleetXchange.
          </p>
          <a href="/contact?type=transporter&source=become-transporter" className="inline-block">
            <button className="bg-white text-emerald-600 font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors text-lg shadow-lg">
              🚚 Apply to Become a Transporter
            </button>
          </a>
        </div>
      </section>
    </div>
  );
}
