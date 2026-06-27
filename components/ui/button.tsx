"use client";

import { forwardRef, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 overflow-hidden",
    "font-semibold whitespace-nowrap select-none cursor-pointer",
    "transition-all duration-300 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // Primary — black with glow
        primary: [
          "bg-black text-white rounded-full",
          "shadow-[0_1px_2px_rgba(0,0,0,0.3)]",
          "hover:shadow-[0_4px_20px_rgba(0,0,0,0.25)]",
          "hover:-translate-y-0.5",
          "active:translate-y-0",
        ].join(" "),

        // Gradient — blue-to-purple
        gradient: [
          "bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 text-white rounded-full",
          "bg-[length:200%_100%] bg-left",
          "hover:bg-right hover:shadow-[0_4px_24px_rgba(59,130,246,0.4)]",
          "hover:-translate-y-0.5",
          "transition-all duration-500",
        ].join(" "),

        // Outline
        outline: [
          "bg-transparent text-black rounded-full",
          "border border-black/10",
          "hover:bg-black/[0.03] hover:border-black/20",
          "hover:-translate-y-0.5",
        ].join(" "),

        // Ghost
        ghost: [
          "bg-transparent text-black/70 rounded-full",
          "hover:text-black hover:bg-black/[0.04]",
        ].join(" "),

        // Glass
        glass: [
          "glass text-black rounded-full",
          "hover:bg-white/90 hover:-translate-y-0.5",
          "hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]",
        ].join(" "),

        // Destructive
        destructive: [
          "bg-red-500 text-white rounded-full",
          "hover:bg-red-600 hover:-translate-y-0.5",
          "hover:shadow-[0_4px_20px_rgba(239,68,68,0.3)]",
        ].join(" "),
      },
      size: {
        xs: "h-7 px-3 text-xs [&_svg]:size-3",
        sm: "h-8 px-4 text-sm [&_svg]:size-3.5",
        default: "h-10 px-5 text-sm [&_svg]:size-4",
        lg: "h-12 px-7 text-base [&_svg]:size-4.5",
        xl: "h-14 px-8 text-lg [&_svg]:size-5",
        icon: "size-10 [&_svg]:size-4",
        "icon-sm": "size-8 [&_svg]:size-3.5",
        "icon-lg": "size-12 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  ripple?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      ripple = true,
      children,
      onClick,
      disabled,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();
        setRipples((prev) => [...prev, { x, y, id }]);
        setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
      }
      onClick?.(e);
    };

    return (
      <button
        ref={(node) => {
          (buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {/* Ripple effect */}
        <AnimatePresence>
          {ripples.map((r) => (
            <motion.span
              key={r.id}
              className="pointer-events-none absolute rounded-full bg-white/20"
              style={{ left: r.x, top: r.y }}
              initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.5 }}
              animate={{ width: 200, height: 200, x: -100, y: -100, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>

        {/* Loading spinner */}
        {loading && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Loader2 className="animate-spin" />
          </motion.span>
        )}

        {/* Content */}
        <motion.span
          className="relative flex items-center gap-2"
          animate={{ opacity: loading ? 0 : 1 }}
          transition={{ duration: 0.15 }}
        >
          {children}
        </motion.span>
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
