import { FileText } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FileText className="h-16 w-16 text-emerald-400 mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-300">Please read these terms carefully</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
            <div className="border-l-4 border-emerald-500 pl-6">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-700">By accessing and using FleetXchange services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.</p>
            </div>

            <div className="border-l-4 border-emerald-500 pl-6">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">2. Service Description</h2>
              <p className="text-gray-700">FleetXchange provides digital freight coordination services across Southern Africa, connecting shippers with verified transporters for cargo movement.</p>
            </div>

            <div className="border-l-4 border-emerald-500 pl-6">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">3. User Responsibilities</h2>
              <p className="text-gray-700 mb-4">Users agree to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of account credentials</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not misuse or abuse the platform</li>
              </ul>
            </div>

            <div className="border-l-4 border-emerald-500 pl-6">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">4. Payment Terms</h2>
              <p className="text-gray-700">Payment terms are agreed upon between parties. FleetXchange facilitates coordination but is not responsible for payment disputes between shippers and transporters.</p>
            </div>

            <div className="border-l-4 border-emerald-500 pl-6">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">5. Liability Limitations</h2>
              <p className="text-gray-700">FleetXchange acts as a coordination platform. We are not liable for cargo damage, loss, delays, or disputes arising from freight services. Users should maintain appropriate insurance.</p>
            </div>

            <div className="border-l-4 border-emerald-500 pl-6">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">6. Termination</h2>
              <p className="text-gray-700">We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activities.</p>
            </div>

            <div className="border-l-4 border-emerald-500 pl-6">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">7. Changes to Terms</h2>
              <p className="text-gray-700">FleetXchange may update these terms at any time. Continued use of the platform constitutes acceptance of updated terms.</p>
            </div>

            <div className="border-l-4 border-emerald-500 pl-6">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">8. Governing Law</h2>
              <p className="text-gray-700">These terms are governed by the laws of South Africa and applicable international freight regulations.</p>
            </div>

            <div className="border-l-4 border-emerald-500 pl-6">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">9. Contact Information</h2>
              <p className="text-gray-700">For questions about these terms, contact:</p>
              <a href="mailto:mrtiger@fleetxchange.africa" className="inline-block mt-3 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
                mrtiger@fleetxchange.africa
              </a>
            </div>

            <div className="bg-emerald-50 rounded-lg p-6 mt-8 border border-emerald-200">
              <p className="text-sm text-gray-600">Last updated: January 2026</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
