'use client';

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import LandingHeader from "@/components/LandingHeader";

export default function HeaderWrapper() {
  const pathname = usePathname();
  const isLandingPage = pathname === '/landing' || pathname === '/';

  // Debug: log to console to verify pathname
  if (typeof window !== 'undefined') {
    console.log('HeaderWrapper - pathname:', pathname, '- isLandingPage:', isLandingPage);
  }

  if (isLandingPage) {
    return <LandingHeader />;
  }

  return <Header />;
}
