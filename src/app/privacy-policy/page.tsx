import { Shield, Lock, Eye, Share2, UserCheck, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 text-white py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="h-20 w-20 text-emerald-400 mx-auto mb-6 animate-pulse" />
          <h1 className="text-6xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">Your privacy is important to us. We are committed to protecting your personal information.</p>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How We Protect Your Data</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">FleetXchange is committed to maintaining the highest standards of data protection and privacy.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-emerald-50 to-white p-8 rounded-2xl border border-emerald-200 hover:shadow-xl transition-all duration-300">
              <Lock className="h-12 w-12 text-emerald-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Secure Storage</h3>
              <p className="text-gray-600">All data is encrypted and stored on secure servers with industry-standard protection.</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border border-blue-200 hover:shadow-xl transition-all duration-300">
              <Eye className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Transparency</h3>
              <p className="text-gray-600">We are transparent about what data we collect and how we use it.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border border-purple-200 hover:shadow-xl transition-all duration-300">
              <UserCheck className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Your Control</h3>
              <p className="text-gray-600">You have full control over your data with rights to access, modify, or delete.</p>
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
                  <Share2 className="h-8 w-8 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">1. Information We Collect</h2>
                  <p className="text-gray-600">Data necessary for freight coordination services</p>
                </div>
              </div>
              <div className="border-l-4 border-emerald-500 pl-6">
                <p className="text-gray-700 mb-4">FleetXchange collects information necessary to provide freight coordination services across Southern Africa. This includes:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Contact information (name, email, phone number)</li>
                  <li>Company details and business information</li>
                  <li>Shipment and cargo details</li>
                  <li>Location data for tracking purposes</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">2. How We Use Your Information</h2>
                  <p className="text-gray-600">Purposes for data processing</p>
                </div>
              </div>
              <div className="border-l-4 border-blue-500 pl-6">
                <p className="text-gray-700 mb-4">We use collected information to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Coordinate and manage freight services</li>
                  <li>Communicate with clients and transporters</li>
                  <li>Improve our platform and services</li>
                  <li>Ensure compliance with regulations</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Lock className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">3. Data Security</h2>
                  <p className="text-gray-600">Industry-standard protection measures</p>
                </div>
              </div>
              <div className="border-l-4 border-purple-500 pl-6">
                <p className="text-gray-700">We implement industry-standard security measures to protect your data. All information is encrypted and stored securely on our servers with regular security audits and compliance checks.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Share2 className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">4. Data Sharing</h2>
                  <p className="text-gray-600">Limited sharing with authorized partners</p>
                </div>
              </div>
              <div className="border-l-4 border-orange-500 pl-6">
                <p className="text-gray-700">We do not sell your personal information. Data is only shared with authorized transporters and partners necessary to fulfill freight services. All partners are vetted and bound by confidentiality agreements.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-green-100 p-3 rounded-lg">
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">5. Your Rights</h2>
                  <p className="text-gray-600">Control over your personal data</p>
                </div>
              </div>
              <div className="border-l-4 border-green-500 pl-6">
                <p className="text-gray-700 mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Access your personal data at any time</li>
                  <li>Request corrections to your information</li>
                  <li>Request deletion of your data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Export your data in a portable format</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-lg p-8 md:p-12 text-white">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">6. Contact Us</h2>
                  <p className="text-emerald-100">Questions about your privacy</p>
                </div>
              </div>
              <p className="text-white/90 mb-4">For privacy-related inquiries, contact us at:</p>
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
