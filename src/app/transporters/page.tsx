import PageHero from "@/components/PageHero";
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
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Partner With FleetXchange?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We&#39;re building a network of trusted partners who understand that sustainable business is built on clear processes, professional conduct, and mutual accountability.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Clear Load Confirmation Sheets */}
            <div className="rounded-2xl bg-white border border-gray-200 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 p-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100">
                    <ClipboardList className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Clear Load Confirmation Sheets</h3>
                  <p className="text-gray-700 text-lg">Every load comes with detailed documentation outlining requirements, timelines, and expectations.</p>
                </div>
              </div>
            </div>

            {/* Transparent Payment Milestones */}
            <div className="rounded-2xl bg-white border border-gray-200 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 p-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100">
                    <TrendingUp className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Transparent Payment Milestones</h3>
                  <p className="text-gray-700 text-lg">Know exactly when and how you&#39;ll be paid. No surprises, no delays, no confusion.</p>
                </div>
              </div>
            </div>

            {/* Consistent Communication */}
            <div className="rounded-2xl bg-white border border-gray-200 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 p-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100">
                    <Users className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Consistent Communication</h3>
                  <p className="text-gray-700 text-lg">Regular updates, clear points of contact, and professional coordination throughout.</p>
                </div>
              </div>
            </div>

            {/* Performance-Based Allocation */}
            <div className="rounded-2xl bg-white border border-gray-200 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 p-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100">
                    <Flag className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Performance-Based Allocation</h3>
                  <p className="text-gray-700 text-lg">Reliable partners get consistent work. Quality and professionalism are rewarded.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Look For Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What We Look For
            </h2>
            <p className="text-xl text-gray-600">
              Professional transporters who meet these standards:
            </p>
          </div>

          <div className="rounded-3xl border-2 border-emerald-400 bg-white p-12 shadow-lg">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <p className="text-lg text-gray-800 font-medium">Valid operating licenses and permits</p>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <p className="text-lg text-gray-800 font-medium">Well-maintained vehicle fleet</p>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <p className="text-lg text-gray-800 font-medium">Compliance with cross-border regulations</p>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <p className="text-lg text-gray-800 font-medium">Transparent communication practices</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <p className="text-lg text-gray-800 font-medium">Comprehensive insurance coverage</p>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <p className="text-lg text-gray-800 font-medium">Professional driver standards</p>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <p className="text-lg text-gray-800 font-medium">Commitment to documentation and reporting</p>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <p className="text-lg text-gray-800 font-medium">Proven track record of reliability</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Built on Trust Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            Built on Trust
          </h2>
          
          <p className="text-xl text-gray-700 mb-6">
            We believe strong stories are built on <span className="text-emerald-600 font-semibold">trust</span>, <span className="text-emerald-600 font-semibold">compliance</span>, and <span className="text-emerald-600 font-semibold">accountability</span>.
          </p>

          <p className="text-lg text-gray-700 mb-12">
            FleetXchange isn&#39;t looking for one-time partnerships. We&#39;re building a network of <span className="text-emerald-600 font-semibold">reliable transporters</span> who want to grow with us as we expand across Southern Africa.
          </p>

          <div className="rounded-3xl bg-emerald-50 border-2 border-emerald-300 p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Performance = Opportunity
            </h3>
            <p className="text-lg text-gray-700">
              Transporters who consistently deliver quality service receive priority load allocation, repeat business, and access to our growing client base.
            </p>
          </div>
        </div>
      </section>

      {/* Ready to Join CTA Section */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Ready to join our network?
          </h2>
          
          <p className="text-xl text-gray-300 mb-12">
            Get in touch to start the vetting process and become part of the FleetXchange story.
          </p>

          <a href="/contact">
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center gap-2">
              Apply as Transporter <span>→</span>
            </button>
          </a>
        </div>
      </section>
    </div>
  );
}