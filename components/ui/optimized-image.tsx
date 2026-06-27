"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImageProps, "onLoad"> {
  /** Aspect ratio wrapper class, e.g. "aspect-video" or "aspect-square" */
  aspectClass?: string;
  /** Show a shimmer skeleton while loading (default: true) */
  shimmer?: boolean;
  /** Rounded corners */
  rounded?: string;
}

/**
 * Drop-in next/image wrapper that:
 * - Shows a shimmer skeleton while the image loads
 * - Fades in smoothly once loaded
 * - Wraps in an aspect-ratio container when aspectClass is provided
 */
export function OptimizedImage({
  src,
  alt,
  className,
  aspectClass,
  shimmer = true,
  rounded = "rounded-xl",
  fill,
  ...props
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);

  const img = (
    <div className={cn("relative overflow-hidden", rounded, aspectClass)}>
      {/* Shimmer placeholder */}
      {shimmer && !loaded && (
        <div className="absolute inset-0 animate-pulse bg-black/6" />
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill ?? !!aspectClass}
        className={cn(
          "object-cover transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
          !aspectClass && className
        )}
        onLoad={() => setLoaded(true)}
        {...props}
      />
    </div>
  );

  if (aspectClass) {
    return <div className={cn("relative", rounded, className)}>{img}</div>;
  }

  return img;
}
