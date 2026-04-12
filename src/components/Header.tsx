"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [locationsOpen, setLocationsOpen] = useState(false);

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
            
            {/* Locations Dropdown */}
            <div className="relative group">
              <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50/50 flex items-center gap-1 transition-colors whitespace-nowrap">
                Locations
                <ChevronDown className="h-4 w-4 group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute left-0 mt-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">South Africa</div>
                  <Link href="/freight-johannesburg" className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">Johannesburg</Link>
                  <Link href="/freight-cape-town" className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">Cape Town</Link>
                  <Link href="/freight-durban" className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">Durban</Link>
                  
                  <div className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase border-t mt-2">International</div>
                  <Link href="/freight-zambia" className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">🇿🇲 Lusaka, Zambia</Link>
                  <Link href="/freight-botswana" className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">🇧🇼 Gaborone, Botswana</Link>
                  <Link href="/freight-zimbabwe" className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">🇿🇼 Harare, Zimbabwe</Link>
                </div>
              </div>
            </div>
            
            <Link href="/network" className={`px-4 py-2 rounded-lg font-medium border-b-2 transition-all duration-300 whitespace-nowrap ${pathname === '/network' ? 'text-emerald-600 border-emerald-600 text-base font-semibold' : 'text-gray-700 hover:text-emerald-600 border-transparent text-sm'}`}>Network</Link>
            <Link href="/why-choose-us" className={`px-4 py-2 rounded-lg font-medium border-b-2 transition-all duration-300 whitespace-nowrap ${pathname === '/why-choose-us' ? 'text-emerald-600 border-emerald-600 text-base font-semibold' : 'text-gray-700 hover:text-emerald-600 border-transparent text-sm'}`}>Why Choose Us</Link>
            <Link href="/transp" className={`px-4 py-2 rounded-lg font-medium border-b-2 transition-all duration-300 whitespace-nowrap ${pathname === '/transp' ? 'text-emerald-600 border-emerald-600 text-base font-semibold' : 'text-gray-700 hover:text-emerald-600 border-transparent text-sm'}`}>For Transporters</Link>
            <Link href="/compliance" className={`px-4 py-2 rounded-lg font-medium border-b-2 transition-all duration-300 whitespace-nowrap ${pathname === '/compliance' ? 'text-emerald-600 border-emerald-600 text-base font-semibold' : 'text-gray-700 hover:text-emerald-600 border-transparent text-sm'}`}>Compliance</Link>
          </div>
          
          <div>
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
            
            {/* Mobile Locations */}
            <button onClick={() => setLocationsOpen(!locationsOpen)} className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-emerald-50 flex items-center justify-between whitespace-nowrap">
              Locations
              <ChevronDown className={`h-4 w-4 transition-transform ${locationsOpen ? 'rotate-180' : ''}`} />
            </button>
            {locationsOpen && (
              <div className="pl-4 space-y-1 bg-emerald-50/50 rounded-lg py-2">
                <p className="px-4 py-1 text-xs font-semibold text-gray-600 uppercase">South Africa</p>
                <Link href="/freight-johannesburg" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:text-emerald-600">Johannesburg</Link>
                <Link href="/freight-cape-town" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:text-emerald-600">Cape Town</Link>
                <Link href="/freight-durban" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:text-emerald-600">Durban</Link>
                
                <p className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase border-t mt-2">International</p>
                <Link href="/freight-zambia" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:text-emerald-600">🇿🇲 Lusaka, Zambia</Link>
                <Link href="/freight-botswana" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:text-emerald-600">🇧🇼 Gaborone, Botswana</Link>
                <Link href="/freight-zimbabwe" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:text-emerald-600">🇿🇼 Harare, Zimbabwe</Link>
              </div>
            )}
            
            <Link href="/network" onClick={() => setIsOpen(false)} className={`block px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${pathname === '/network' ? 'text-white bg-emerald-600/80' : 'text-gray-700 hover:bg-emerald-50'}`}>Network</Link>
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
