"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-3 transition-transform hover:scale-105 duration-300">
            <Image src="/images/logo.png" alt="FleetXchange" width={180} height={50} className="h-12 w-auto" />
          </Link>
          <div className="hidden lg:flex items-center space-x-1">
            <Link href="/" className={`px-4 py-2 rounded-lg text-sm font-medium ${pathname === '/' ? 'text-white bg-emerald-200' : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50/50'}`}>Home</Link>
            <Link href="/about" className={`px-4 py-2 rounded-lg text-sm font-medium ${pathname === '/about' ? 'text-white bg-emerald-200' : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50/50'}`}>About</Link>
            <Link href="/how-it-works" className={`px-4 py-2 rounded-lg text-sm font-medium ${pathname === '/how-it-works' ? 'text-white bg-emerald-200' : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50/50'}`}>How It Works</Link>
            <Link href="/network" className={`px-4 py-2 rounded-lg text-sm font-medium ${pathname === '/network' ? 'text-white bg-emerald-200' : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50/50'}`}>Network</Link>
            <Link href="/why-choose-us" className={`px-4 py-2 rounded-lg text-sm font-medium ${pathname === '/why-choose-us' ? 'text-white bg-emerald-200' : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50/50'}`}>Why Choose Us</Link>
            <Link href="/transporters" className={`px-4 py-2 rounded-lg text-sm font-medium ${pathname === '/transporters' ? 'text-white bg-emerald-200' : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50/50'}`}>For Transporters</Link>
            <Link href="/compliance" className={`px-4 py-2 rounded-lg text-sm font-medium ${pathname === '/compliance' ? 'text-white bg-emerald-200' : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50/50'}`}>Compliance</Link>
          </div>
          <div className="hidden lg:flex items-center space-x-4">
            <Link href="/contact">
              <button className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white px-4 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-300">
                Request a Load
              </button>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
