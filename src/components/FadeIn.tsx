"use client";

import { useEffect, useRef, useState } from "react";

export default function FadeIn({ 
  children, 
  delay = 0,
  direction = "up",
  duration = 1000,
  distance = 30,
  once = true,
  blur = false,
  threshold = 0.1
}: { 
  children: React.ReactNode; 
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  distance?: number;
  once?: boolean;
  blur?: boolean;
  threshold?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (once && hasAnimated) return;
          
          setTimeout(() => {
            setIsVisible(true);
            setHasAnimated(true);
          }, delay);
        } else {
          if (!once) {
            setIsVisible(false);
          }
        }
      },
      { threshold, rootMargin: "20px" }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay, once, hasAnimated, threshold]);

  const getTransform = () => {
    if (!isVisible) {
      switch (direction) {
        case "up": return `translateY(${distance}px)`;
        case "down": return `translateY(-${distance}px)`;
        case "left": return `translateX(${distance}px)`;
        case "right": return `translateX(-${distance}px)`;
        case "none": return "none";
        default: return `translateY(${distance}px)`;
      }
    }
    return "translate(0)";
  };

  return (
    <div
      ref={ref}
      style={{
        transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        filter: blur && !isVisible ? "blur(8px)" : "blur(0)",
        willChange: "transform, opacity, filter"
      }}
    >
      {children}
    </div>
  );
}