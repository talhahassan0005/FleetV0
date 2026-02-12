import Link from "next/link";
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0f1729] text-gray-300">
      {/* Main Footer Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info - Column 1 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-500/10 rounded flex items-center justify-center">
                <div className="w-5 h-5 text-emerald-500">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  </svg>
                </div>
              </div>
              <span className="text-xl font-bold text-white">FleetXchange</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Digital freight coordination platform managing cargo movement
              across Southern Africa.
            </p>
            <p className="text-emerald-500 font-medium">
              We tell the story.
            </p>
          </div>

          {/* South Africa - Column 2 */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <h4 className="text-white font-semibold">South Africa</h4>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-400">Johannesburg</p>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-emerald-500" />
                <a 
                  href="mailto:mrtiger@fleetxchange.africa"
                  className="hover:text-emerald-500 transition-colors"
                >
                  mrtiger@fleetxchange.africa
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-500" />
                <a 
                  href="tel:+27738281478"
                  className="hover:text-emerald-500 transition-colors"
                >
                  +27738281478
                </a>
              </div>
            </div>
          </div>

          {/* Botswana - Column 3 */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <h4 className="text-white font-semibold">Botswana</h4>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-400">Botswana</p>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-emerald-500" />
                <a 
                  href="mailto:mrtiger@fleetxchange.africa"
                  className="hover:text-emerald-500 transition-colors"
                >
                  mrtiger@fleetxchange.africa
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-500" />
                <a 
                  href="tel:+26776666598"
                  className="hover:text-emerald-500 transition-colors"
                >
                  +26776666598
                </a>
              </div>
            </div>
          </div>

          {/* Zambia - Column 4 */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <h4 className="text-white font-semibold">Zambia</h4>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-400">Lusaka</p>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-emerald-500" />
                <a 
                  href="mailto:mulenga@fleetxchange.africa"
                  className="hover:text-emerald-500 transition-colors"
                >
                  mulenga@fleetxchange.africa
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-700 mt-12 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="text-gray-400">
              © 2026 FleetXchange. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link 
                href="/privacy-policy"
                className="text-gray-400 hover:text-emerald-500 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms-of-service"
                className="text-gray-400 hover:text-emerald-500 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}