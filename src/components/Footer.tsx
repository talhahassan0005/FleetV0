import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0f1729] text-gray-300">
      {/* Main Footer Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info - Column 1 */}
          <div className="space-y-4">
            <div>
              <Image src="/images/logo-green.png" alt="FleetXchange" width={180} height={60} className="h-14 w-auto" />
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