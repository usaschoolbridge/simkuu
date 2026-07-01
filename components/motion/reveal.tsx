"use client";

import { motion, Variants } from "framer-motion";
import { fadeUp, fadeIn, fadeLeft, fadeRight, scaleIn, staggerContainer } from "@/animations/variants";

interface RevealProps {
  children: React.ReactNode;
  variant?: "fadeUp" | "fadeIn" | "fadeLeft" | "fadeRight" | "scaleIn";
  delay?: number;
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

/**
 * Reveal — uses whileInView directly (no useAnimation / useEffect / useRef overhead).
 * whileInView is internally backed by IntersectionObserver and is more efficient
 * than manually wiring useInView → useAnimation → useEffect.
 */
export function Reveal({
  children,
  variant = "fadeUp",
  delay = 0,
  className,
  once = true,
  threshold = 0.1,
}: RevealProps) {
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
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
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
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.05 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08, delayChildren: delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
