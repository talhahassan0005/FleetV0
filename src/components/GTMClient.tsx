'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GTMClient() {
  useEffect(() => {
    // Initialize GTM data layer
    (window as any).dataLayer = (window as any).dataLayer || [];
    
    // Track page views
    function trackPageView() {
      (window as any).dataLayer.push({
        event: 'pageview',
        'page_path': window.location.pathname,
        'page_title': document.title,
      });
    }
    
    trackPageView();
    
    // Listen for route changes
    const handleRouteChange = () => {
      setTimeout(trackPageView, 100);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return null;
}

// Export function to track conversions from components
export function trackConversion(conversionId: string, value: number = 1) {
  if (typeof window !== 'undefined') {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: 'conversion',
      'conversion_id': conversionId,
      'conversion_value': value,
      'conversion_currency': 'ZAR'
    });
    
    // Also send to Google Ads
    if ((window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        'send_to': 'AW-10808030018/' + conversionId,
        'value': value,
        'currency': 'ZAR'
      });
    }
  }
}
