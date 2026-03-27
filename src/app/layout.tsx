import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import HeaderWrapper from "@/components/HeaderWrapper";
import Footer from "@/components/Footer";
import GTMClient from "@/components/GTMClient";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "FleetXchange | Freight Booking South Africa",
  description: "Book trucks in minutes. Connect with 500+ verified transporters. Instant quotes, real-time tracking across South Africa.",
  keywords: "freight booking, truck transport, logistics platform, South Africa, transporters, cross-border",
  authors: [{ name: "FleetXchange" }],
  openGraph: {
    title: "FleetXchange | Freight Booking South Africa",
    description: "Book trucks in minutes. Connect with 500+ verified transporters. Instant quotes, real-time tracking across South Africa.",
    type: "website",
    url: "https://fleetxchange.africa/",
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
        
        {/* Schema.org Markup for Google */}
        <Script id="org-schema" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "FleetXchange",
            "url": "https://fleetxchange.africa",
            "logo": "https://fleetxchange.africa/images/logo.png",
            "description": "South Africa's leading freight coordination platform",
            "sameAs": [
              "https://www.linkedin.com/company/fleetxchange",
              "https://www.facebook.com/fleetxchange"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+27-73-828-1478",
              "contactType": "Customer Service"
            }
          })}
        </Script>

        <Script id="service-schema" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Freight Booking & Truck Transport",
            "description": "Book reliable trucks and connect with verified transporters across South Africa",
            "provider": {
              "@type": "Organization",
              "name": "FleetXchange"
            },
            "areaServed": [
              "ZA",
              "BW",
              "ZM",
              "ZW",
              "NA"
            ],
            "serviceType": "Freight Transport Coordination"
          })}
        </Script>

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
        {/* Google Ads (Conversion Tracking) */}
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
        {/* GTM noscript */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
      </head>
      <body className="antialiased">
        <GTMClient />
        <HeaderWrapper />
        {children}
        <Footer />
      </body>
    </html>
  );
}
