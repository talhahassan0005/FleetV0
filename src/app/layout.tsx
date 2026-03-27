import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import HeaderWrapper from "@/components/HeaderWrapper";
import Footer from "@/components/Footer";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "FleetXchange | Freight Booking & Truck Transport South Africa",
  description: "FleetXchange is South Africa's leading freight coordination platform. Book reliable trucks, connect with verified transporters, and manage logistics with real-time tracking across Southern Africa.",
  keywords: "freight booking, truck transport, logistics platform, South Africa, transporters, cross-border",
  authors: [{ name: "FleetXchange" }],
  openGraph: {
    title: "FleetXchange | Freight Booking & Truck Transport South Africa",
    description: "Connect with verified transporters for instant freight booking, real-time tracking, and efficient logistics solutions.",
    type: "website",
    url: "http://fleetxchange.africa/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        {/* Google Tag Manager */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-90274WEQY5"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-90274WEQY5');`}
        </Script>
        {/* Google Ads Conversion Tracking */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-10808030018"
          strategy="afterInteractive"
        />
        <Script id="google-ads-conversion" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-10808030018');`}
        </Script>
      </head>
      <body className="antialiased">
        <HeaderWrapper />
        {children}
        <Footer />
      </body>
    </html>
  );
}
