"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
}

// ---- Magnetic Button Effect ----
export function createMagneticEffect(el: HTMLElement, strength = 0.4) {
  const handleMouseMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * strength;
    const dy = (e.clientY - cy) * strength;

    gsap.to(el, { x: dx, y: dy, duration: 0.4, ease: "power2.out" });
  };

  const handleMouseLeave = () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
  };

  el.addEventListener("mousemove", handleMouseMove);
  el.addEventListener("mouseleave", handleMouseLeave);

  return () => {
    el.removeEventListener("mousemove", handleMouseMove);
    el.removeEventListener("mouseleave", handleMouseLeave);
  };
}

// ---- Scroll Reveal ----
export function createScrollReveal(
  elements: HTMLElement | HTMLElement[] | NodeListOf<Element>,
  options: {
    y?: number;
    opacity?: number;
    duration?: number;
    stagger?: number;
    delay?: number;
    scrub?: boolean;
  } = {}
) {
  const {
    y = 60,
    opacity = 0,
    duration = 0.8,
    stagger = 0.1,
    delay = 0,
    scrub = false,
  } = options;

  return gsap.fromTo(
    elements,
    { y, opacity, filter: "blur(8px)" },
    {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      duration,
      stagger,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: elements instanceof NodeList ? elements[0] : elements,
        start: "top 85%",
        end: scrub ? "top 30%" : undefined,
        scrub: scrub ? 1 : false,
        toggleActions: scrub ? undefined : "play none none none",
      },
    }
  );
}

// ---- Parallax ----
export function createParallax(el: HTMLElement, speed = 0.3) {
  return gsap.to(el, {
    yPercent: speed * 100,
    ease: "none",
    scrollTrigger: {
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });
}

// ---- Counter Animation ----
export function animateCounter(
  el: HTMLElement,
  target: number,
  suffix = "",
  duration = 2
) {
  const obj = { value: 0 };

  return gsap.to(obj, {
    value: target,
    duration,
    ease: "power2.out",
    scrollTrigger: {
      trigger: el,
      start: "top 85%",
      toggleActions: "play none none none",
    },
    onUpdate() {
      el.textContent =
        Math.round(obj.value).toLocaleString() + suffix;
    },
  });
}

// ---- Text Scramble ----
export function animateTextScramble(el: HTMLElement, finalText: string, duration = 1.5) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let iterations = 0;
  const totalIterations = 15;
  const interval = (duration * 1000) / totalIterations;

  const tick = setInterval(() => {
    el.textContent = finalText
      .split("")
      .map((char, i) => {
        if (i < iterations) return char;
        if (char === " ") return " ";
        return chars[Math.floor(Math.random() * chars.length)];
      })
      .join("");

    if (iterations >= finalText.length) clearInterval(tick);
    iterations += 1 / 2;
  }, interval);

  return () => clearInterval(tick);
}

// ---- Horizontal Scroll ----
export function createHorizontalScroll(container: HTMLElement, track: HTMLElement) {
  const totalWidth = track.scrollWidth - container.offsetWidth;

  return gsap.to(track, {
    x: -totalWidth,
    ease: "none",
    scrollTrigger: {
      trigger: container,
      start: "top top",
      end: `+=${totalWidth}`,
      scrub: 1,
      pin: true,
    },
  });
}

export { gsap, ScrollTrigger };
