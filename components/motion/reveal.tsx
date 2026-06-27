"use client";

import { useRef, useEffect } from "react";
import { motion, useInView, useAnimation, Variants } from "framer-motion";
import { fadeUp, fadeIn, fadeLeft, fadeRight, scaleIn, staggerContainer } from "@/animations/variants";

interface RevealProps {
  children: React.ReactNode;
  variant?: "fadeUp" | "fadeIn" | "fadeLeft" | "fadeRight" | "scaleIn";
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  threshold?: number;
}

const VARIANTS_MAP: Record<string, Variants> = {
  fadeUp,
  fadeIn,
  fadeLeft,
  fadeRight,
  scaleIn,
};

export function Reveal({
  children,
  variant = "fadeUp",
  delay = 0,
  className,
  once = true,
  threshold = 0.1,
}: RevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    } else if (!once) {
      controls.start("hidden");
    }
  }, [isInView, controls, once]);

  const vars = VARIANTS_MAP[variant];
  const delayedVars: Variants = {
    hidden: vars.hidden,
    visible: {
      ...(typeof vars.visible === "object" ? vars.visible : {}),
      transition: {
        ...((typeof vars.visible === "object" && "transition" in vars.visible)
          ? (vars.visible as { transition?: object }).transition
          : {}),
        delay,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={delayedVars}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerRevealProps {
  children: React.ReactNode;
  className?: string;
  once?: boolean;
  delay?: number;
}

export function StaggerReveal({ children, className, once = true, delay = 0 }: StaggerRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: 0.1 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) controls.start("visible");
    else if (!once) controls.start("hidden");
  }, [isInView, controls, once]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1, delayChildren: delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
