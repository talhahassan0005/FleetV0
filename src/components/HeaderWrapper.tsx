'use client';

import { usePathname } from "next/navigation";
import Header from "@/components/Header";


export default function HeaderWrapper() {
  const pathname = usePathname();
  
  const isHiddenRoute = pathname && (
    pathname.startsWith('/admin') || 
    pathname.startsWith('/client') || 
    pathname.startsWith('/transporter/') ||  // Hide all /transporter/* portal, but NOT /transp
    pathname === '/login' || 
    pathname === '/register'
  );

  if (isHiddenRoute) {
    return null;
  }

  const isLandingPage = pathname === '/landing';

  // Debug: log to console to verify pathname
  if (typeof window !== 'undefined') {
    console.log('HeaderWrapper - pathname:', pathname, '- isLandingPage:', isLandingPage);
  }

 

  return <Header />;
}
