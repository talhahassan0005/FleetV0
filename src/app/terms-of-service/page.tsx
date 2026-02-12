import { FileText, CheckCircle, Users, CreditCard, Shield, XCircle, RefreshCw, Scale, Mail } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 text-white py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FileText className="h-20 w-20 text-emerald-400 mx-auto mb-6 animate-pulse" />
          <h1 className="text-6xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">Please read these terms carefully before using our platform</p>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Commitment to You</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">FleetXchange provides transparent and fair terms for all users of our freight coordination platform.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-emerald-50 to-white p-8 rounded-2xl border border-emerald-200 hover:shadow-xl transition-all duration-300">
              <CheckCircle className="h-12 w-12 text-emerald-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Fair Terms</h3>
              <p className="text-gray-600">Clear and transparent terms that protect both shippers and transporters.</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border border-blue-200 hover:shadow-xl transition-all duration-300">
              <Shield className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Legal Protection</h3>
              <p className="text-gray-600">Governed by South African law with international freight regulations.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border border-purple-200 hover:shadow-xl transition-all duration-300">
              <Users className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">User Rights</h3>
              <p className="text-gray-600">Clear definition of rights and responsibilities for all parties.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Sections */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">1. Acceptance of Terms</h2>
                  <p className="text-gray-600">Agreement to use our services</p>
                </div>
              </div>
              <div className="border-l-4 border-emerald-500 pl-6">
                <p className="text-gray-700">By accessing and using FleetXchange services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform. Continued use constitutes acceptance of any updates to these terms.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">2. Service Description</h2>
                  <p className="text-gray-600">What we provide</p>
                </div>
              </div>
              <div className="border-l-4 border-blue-500 pl-6">
                <p className="text-gray-700">FleetXchange provides digital freight coordination services across Southern Africa, connecting shippers with verified transporters for cargo movement. We act as a coordination platform and facilitate communication between parties.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">3. User Responsibilities</h2>
                  <p className="text-gray-600">Your obligations as a user</p>
                </div>
              </div>
              <div className="border-l-4 border-purple-500 pl-6">
                <p className="text-gray-700 mb-4">Users agree to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of account credentials</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Not misuse or abuse the platform</li>
                  <li>Respect intellectual property rights</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <CreditCard className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">4. Payment Terms</h2>
                  <p className="text-gray-600">Financial arrangements</p>
                </div>
              </div>
              <div className="border-l-4 border-orange-500 pl-6">
                <p className="text-gray-700">Payment terms are agreed upon between parties. FleetXchange facilitates coordination but is not responsible for payment disputes between shippers and transporters. All financial transactions should be documented and agreed upon in writing.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-red-100 p-3 rounded-lg">
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">5. Liability Limitations</h2>
                  <p className="text-gray-600">Platform responsibilities</p>
                </div>
              </div>
              <div className="border-l-4 border-red-500 pl-6">
                <p className="text-gray-700">FleetXchange acts as a coordination platform. We are not liable for cargo damage, loss, delays, or disputes arising from freight services. Users should maintain appropriate insurance. We do not guarantee the performance of third-party transporters.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-pink-100 p-3 rounded-lg">
                  <XCircle className="h-8 w-8 text-pink-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">6. Termination</h2>
                  <p className="text-gray-600">Account suspension and closure</p>
                </div>
              </div>
              <div className="border-l-4 border-pink-500 pl-6">
                <p className="text-gray-700">We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activities. Users may also terminate their accounts at any time by contacting support.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <RefreshCw className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">7. Changes to Terms</h2>
                  <p className="text-gray-600">Updates and modifications</p>
                </div>
              </div>
              <div className="border-l-4 border-indigo-500 pl-6">
                <p className="text-gray-700">FleetXchange may update these terms at any time. Continued use of the platform constitutes acceptance of updated terms. We will notify users of significant changes via email or platform notifications.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-teal-100 p-3 rounded-lg">
                  <Scale className="h-8 w-8 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">8. Governing Law</h2>
                  <p className="text-gray-600">Legal jurisdiction</p>
                </div>
              </div>
              <div className="border-l-4 border-teal-500 pl-6">
                <p className="text-gray-700">These terms are governed by the laws of South Africa and applicable international freight regulations. Any disputes will be resolved in South African courts.</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-lg p-8 md:p-12 text-white">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">9. Contact Information</h2>
                  <p className="text-emerald-100">Questions about these terms</p>
                </div>
              </div>
              <p className="text-white/90 mb-4">For questions about these terms, contact:</p>
              <a href="mailto:mrtiger@fleetxchange.africa" className="inline-block bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors">
                mrtiger@fleetxchange.africa
              </a>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-8 mt-12 border-2 border-emerald-200 text-center">
            <p className="text-gray-700 font-medium">Last updated: January 2026</p>
          </div>
        </div>
      </section>
    </div>
  );
}
