"use client";

import { useEffect, useState } from "react";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export default function PageHero({ title, subtitle, badge }: PageHeroProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 py-20">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
      </div>
      <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-1200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {badge && (
          <div className="inline-block px-6 py-2.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-full mb-6 backdrop-blur-sm">
            <span className="text-emerald-400 text-sm font-semibold tracking-wide">{badge}</span>
          </div>
        )}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">{title}</h1>
        {subtitle && <p className="text-xl text-gray-300 max-w-3xl mx-auto">{subtitle}</p>}
      </div>
    </section>
  );
}
