"use client";

import { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface TiltProps {
  children: React.ReactNode;
  maxTilt?: number;
  scale?: number;
  className?: string;
  glare?: boolean;
}

export function Tilt({
  children,
  maxTilt = 8,
  scale = 1.02,
  className,
  glare = true,
}: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]), {
    stiffness: 300,
    damping: 30,
  });

  const glareX = useTransform(mouseX, [-0.5, 0.5], ["-30%", "130%"]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ["-30%", "130%"]);
  const glareOpacity = useTransform(
    mouseX,
    [-0.5, 0, 0.5],
    [0.15, 0, 0.15]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <div className={`perspective ${className}`}>
      <motion.div
        ref={ref}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={{ scale }}
        transition={{ scale: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-full"
      >
        {children}

        {/* Glare overlay */}
        {glare && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden"
            style={{ opacity: glareOpacity }}
          >
            <motion.div
              className="absolute w-[60%] h-[60%] rounded-full"
              style={{
                left: glareX,
                top: glareY,
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)",
                transform: "translate(-50%, -50%)",
              }}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
