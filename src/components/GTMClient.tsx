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

// Export function to track conversions and user interactions from components
export function trackConversion(action: string, value: number = 1) {
  if (typeof window !== 'undefined') {
    (window as any).dataLayer = (window as any).dataLayer || [];
    
    // Track in dataLayer
    (window as any).dataLayer.push({
      event: 'user_interaction',
      'interaction_type': action,
      'interaction_value': value,
      'page_path': window.location.pathname,
      'timestamp': new Date().toISOString()
    });
    
    // Map actions to Google Ads conversion IDs
    const conversionMap: Record<string, string> = {
      'quote_cta_button_click': 'AW-10808030018/quote_cta',
      'form_submission': 'AW-10808030018/form_submit',
      'whatsapp_click': 'AW-10808030018/whatsapp',
      'cross_border_link_click': 'AW-10808030018/cross_border'
    };
    
    // Send to Google Ads
    if ((window as any).gtag) {
      const conversionId = conversionMap[action] || 'AW-10808030018/generic';
      (window as any).gtag('event', 'conversion', {
        'send_to': conversionId,
        'value': value,
        'currency': 'ZAR'
      });
    }
  }
}
