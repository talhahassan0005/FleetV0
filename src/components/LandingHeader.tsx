'use client';

import { Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
          <Image src="/images/logo.png" alt="FleetXchange" width={180} height={50} className="h-12 w-auto" />
        </Link>
        <div className="flex gap-3">
          <a href="tel:+27738281478" className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-all duration-300 hover:shadow-lg shadow-md">
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Call +27 738 281 478</span>
          </a>
        </div>
      </div>
    </header>
  );
}
