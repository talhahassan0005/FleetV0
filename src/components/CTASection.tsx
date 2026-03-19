import { ArrowRight, Truck, FileText } from 'lucide-react';
import FadeIn from "./FadeIn";

interface CTASectionProps {
  title?: string;
  subtitle?: string;
  primaryCTA?: {
    text: string;
    href: string;
    icon?: React.ReactNode;
  };
  secondaryCTA?: {
    text: string;
    href: string;
    icon?: React.ReactNode;
  };
  variant?: 'default' | 'dark' | 'light';
}

export default function CTASection({
  title = "Ready to Simplify Your Logistics?",
  subtitle = "Join hundreds of businesses saving time and money with FleetXchange.",
  primaryCTA = {
    text: "Book Your First Load",
    href: "/contact",
    icon: <Truck className="h-5 w-5" />
  },
  secondaryCTA = {
    text: "Request a Demo",
    href: "/contact?type=demo",
    icon: <FileText className="h-5 w-5" />
  },
  variant = 'default'
}: CTASectionProps) {
  const bgClasses = {
    default: "bg-gradient-to-br from-emerald-600 to-teal-600 text-white",
    dark: "bg-gradient-to-br from-slate-900 to-slate-800 text-white",
    light: "bg-gradient-to-br from-emerald-50 to-blue-50 text-slate-900"
  };

  const textClasses = {
    default: "text-white",
    dark: "text-white",
    light: "text-slate-900"
  };

  const subTextClasses = {
    default: "text-emerald-100",
    dark: "text-gray-400",
    light: "text-gray-600"
  };

  return (
    <section className={`py-16 md:py-24 ${bgClasses[variant]} relative overflow-hidden`}>
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.2) 1px, transparent 0px)",
          backgroundSize: "40px 40px"
        }}></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="down" delay={0} duration={800} distance={30} blur={true}>
          <div className="text-center">
            <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold ${textClasses[variant]} mb-4`}>
              {title}
            </h2>
            <p className={`text-lg md:text-xl ${subTextClasses[variant]} mb-8 max-w-2xl mx-auto leading-relaxed`}>
              {subtitle}
            </p>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={200} duration={800} distance={30}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <a href={primaryCTA.href}>
              <button className={`inline-flex items-center gap-2 ${
                variant === 'light'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white'
                  : 'bg-white text-emerald-600 hover:bg-gray-100'
              } font-semibold px-8 py-4 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group text-lg`}>
                {primaryCTA.icon || <Truck className="h-5 w-5" />}
                {primaryCTA.text}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </a>
            <a href={secondaryCTA.href}>
              <button className={`inline-flex items-center gap-2 border-2 ${
                variant === 'light'
                  ? 'border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                  : 'border-white text-white hover:bg-white hover:text-emerald-600'
              } font-semibold px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105 text-lg backdrop-blur-sm`}>
                {secondaryCTA.icon || <FileText className="h-5 w-5" />}
                {secondaryCTA.text}
              </button>
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
