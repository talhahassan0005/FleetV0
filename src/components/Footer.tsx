import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0f1729] text-gray-300">
      {/* Main Footer Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Company Info - Column 1 */}
          <div className="space-y-4">
            <div>
              <Image src="/images/logo-white.png" alt="FleetXchange" width={180} height={60} className="h-14 w-auto" />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Digital freight coordination platform managing cargo movement
              across Southern Africa.
            </p>
            <p className="text-emerald-500 font-medium">
              We tell the story.
            </p>
          </div>

          {/* Freight Locations - Column 2 */}
          <div>
            <h4 className="text-white font-semibold mb-3">South Africa</h4>
            <div className="space-y-2 text-sm">
              <Link href="/freight-johannesburg" className="block text-gray-400 hover:text-emerald-500 transition-colors cursor-pointer">→ Johannesburg</Link>
              <Link href="/freight-cape-town" className="block text-gray-400 hover:text-emerald-500 transition-colors cursor-pointer">→ Cape Town</Link>
              <Link href="/freight-durban" className="block text-gray-400 hover:text-emerald-500 transition-colors cursor-pointer">→ Durban</Link>
            </div>
          </div>

          {/* International Locations - Column 3 */}
          <div>
            <h4 className="text-white font-semibold mb-3">International</h4>
            <div className="space-y-2 text-sm">
              <Link href="/freight-zambia" className="block text-gray-400 hover:text-emerald-500 transition-colors cursor-pointer">🇿🇲 Lusaka, Zambia</Link>
              <Link href="/freight-botswana" className="block text-gray-400 hover:text-emerald-500 transition-colors cursor-pointer">🇧🇼 Gaborone, Botswana</Link>
              <Link href="/freight-zimbabwe" className="block text-gray-400 hover:text-emerald-500 transition-colors cursor-pointer">🇿🇼 Harare, Zimbabwe</Link>
            </div>
          </div>

          {/* South Africa Contact - Column 4 */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <h4 className="text-white font-semibold">South Africa</h4>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-emerald-400 font-medium">Johannesburg</p>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-emerald-500" />
                <a
                  href="mailto:Info@fleetxchange.africa"
                  className="hover:text-emerald-500 transition-colors"
                >
                  Info@fleetxchange.africa
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

          {/* Regional Contacts - Column 5 */}
          <div>
            <h4 className="text-white font-semibold mb-3">Regional Offices</h4>
            <div className="space-y-4 text-sm">
              {/* Botswana */}
              <div>
                <p className="text-emerald-400 font-medium mb-2">Botswana</p>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-emerald-500" />
                    <a
                      href="mailto:Info@fleetxchange.africa"
                      className="hover:text-emerald-500 transition-colors"
                    >
                      Info@fleetxchange.africa
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

              {/* Zambia */}
              <div>
                <p className="text-emerald-400 font-medium mb-2">Zambia</p>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-emerald-500" />
                    <a
                      href="mailto:Info@fleetxchange.africa"
                      className="hover:text-emerald-500 transition-colors"
                    >
                      Info@fleetxchange.africa
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