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
  const [isVisible, setIsVisible] = useState(true); // enforce visible to avoid blank-screen during hydration
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      // Browser does not support IntersectionObserver, keep visible
      setIsVisible(true);
      return;
    }

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

    if (ref.current) {
      observer.observe(ref.current);
    } else {
      setIsVisible(true);
    }

    const fallbackTimer = window.setTimeout(() => {
      if (!isVisible) setIsVisible(true);
    }, Math.max(500, delay + 200));

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, [delay, once, hasAnimated, threshold, isVisible]);

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
        opacity: 1,
        transform: "translate(0)",
        filter: "none",
        willChange: "transform, opacity, filter"
      }}
    >
      {children}
    </div>
  );
}