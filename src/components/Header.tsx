"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Don't render header on landing page, auth pages, or portal pages
  if (pathname === '/landing' || 
      pathname === '/login' || 
      pathname === '/register' ||
      pathname === '/transporter' ||
      pathname.startsWith('/transporter/') ||
      pathname === '/client' ||
      pathname.startsWith('/client/') ||
      pathname === '/admin' ||
      pathname.startsWith('/admin/')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-3 transition-transform hover:scale-105 duration-300">
            <Image src="/images/logo.png" alt="FleetXchange" width={180} height={50} className="h-12 w-auto" />
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link href="/" className={`px-4 py-2 rounded-lg font-medium border-b-2 transition-all duration-300 whitespace-nowrap ${pathname === '/' ? 'text-emerald-600 border-emerald-600 text-base font-semibold' : 'text-gray-700 hover:text-emerald-600 border-transparent text-sm'}`}>Home</Link>
            <Link href="/about" className={`px-4 py-2 rounded-lg font-medium border-b-2 transition-all duration-300 whitespace-nowrap ${pathname === '/about' ? 'text-emerald-600 border-emerald-600 text-base font-semibold' : 'text-gray-700 hover:text-emerald-600 border-transparent text-sm'}`}>About</Link>
            <Link href="/how-it-works" className={`px-4 py-2 rounded-lg font-medium border-b-2 transition-all duration-300 whitespace-nowrap ${pathname === '/how-it-works' ? 'text-emerald-600 border-emerald-600 text-base font-semibold' : 'text-gray-700 hover:text-emerald-600 border-transparent text-sm'}`}>How It Works</Link>
            <Link href="/network" className={`px-4 py-2 rounded-lg font-medium border-b-2 transition-all duration-300 whitespace-nowrap ${pathname === '/network' ? 'text-emerald-600 border-emerald-600 text-base font-semibold' : 'text-gray-700 hover:text-emerald-600 border-transparent text-sm'}`}>Our Network</Link>
            <Link href="/why-choose-us" className={`px-4 py-2 rounded-lg font-medium border-b-2 transition-all duration-300 whitespace-nowrap ${pathname === '/why-choose-us' ? 'text-emerald-600 border-emerald-600 text-base font-semibold' : 'text-gray-700 hover:text-emerald-600 border-transparent text-sm'}`}>Why Choose Us</Link>
            <Link href="/transp" className={`px-4 py-2 rounded-lg font-medium border-b-2 transition-all duration-300 whitespace-nowrap ${pathname === '/transp' ? 'text-emerald-600 border-emerald-600 text-base font-semibold' : 'text-gray-700 hover:text-emerald-600 border-transparent text-sm'}`}>For Transporters</Link>
            <Link href="/compliance" className={`px-4 py-2 rounded-lg font-medium border-b-2 transition-all duration-300 whitespace-nowrap ${pathname === '/compliance' ? 'text-emerald-600 border-emerald-600 text-base font-semibold' : 'text-gray-700 hover:text-emerald-600 border-transparent text-sm'}`}>Compliance</Link>
          </div>
          
          <div className="hidden lg:block">
            <Link href="/login">
              <button className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white px-4 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-300 whitespace-nowrap">
                Login / Portal
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden py-4 space-y-2 border-t border-gray-200">
            <Link href="/" onClick={() => setIsOpen(false)} className={`block px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${pathname === '/' ? 'text-white bg-emerald-600/80' : 'text-gray-700 hover:bg-emerald-50'}`}>Home</Link>
            <Link href="/about" onClick={() => setIsOpen(false)} className={`block px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${pathname === '/about' ? 'text-white bg-emerald-600/80' : 'text-gray-700 hover:bg-emerald-50'}`}>About</Link>
            <Link href="/how-it-works" onClick={() => setIsOpen(false)} className={`block px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${pathname === '/how-it-works' ? 'text-white bg-emerald-600/80' : 'text-gray-700 hover:bg-emerald-50'}`}>How It Works</Link>
            <Link href="/network" onClick={() => setIsOpen(false)} className={`block px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${pathname === '/network' ? 'text-white bg-emerald-600/80' : 'text-gray-700 hover:bg-emerald-50'}`}>Our Network</Link>
            <Link href="/why-choose-us" onClick={() => setIsOpen(false)} className={`block px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${pathname === '/why-choose-us' ? 'text-white bg-emerald-600/80' : 'text-gray-700 hover:bg-emerald-50'}`}>Why Choose Us</Link>
            <Link href="/transp" onClick={() => setIsOpen(false)} className={`block px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${pathname === '/transp' ? 'text-white bg-emerald-600/80' : 'text-gray-700 hover:bg-emerald-50'}`}>For Transporters</Link>
            <Link href="/compliance" onClick={() => setIsOpen(false)} className={`block px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${pathname === '/compliance' ? 'text-white bg-emerald-600/80' : 'text-gray-700 hover:bg-emerald-50'}`}>Compliance</Link>
            <Link href="/login" onClick={() => setIsOpen(false)}>
              <button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-2 rounded-md shadow-md mt-2 whitespace-nowrap">
                Login / Portal
              </button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
