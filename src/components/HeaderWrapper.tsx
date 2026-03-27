'use client';

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import LandingHeader from "@/components/LandingHeader";

export default function HeaderWrapper() {
  const pathname = usePathname();
  const isLandingPage = pathname === '/landing';

  if (isLandingPage) {
    return <LandingHeader />;
  }

  return <Header />;
}
