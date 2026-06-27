"use client";

import { useEffect, useRef, useState } from "react";

interface UseIntersectionOptions extends IntersectionObserverInit {
  /** Once true, never re-evaluate (default: true for lazy-load use cases) */
  freezeOnceVisible?: boolean;
}

/**
 * Returns a [ref, isVisible] tuple. Attach `ref` to any DOM element;
 * `isVisible` becomes true when that element enters the viewport.
 *
 * Great for:
 * - Triggering animations only when in view
 * - Lazy-mounting expensive components
 * - Infinite scroll sentinels
 *
 * @example
 * const [ref, visible] = useIntersection({ threshold: 0.1 });
 * return <div ref={ref}>{visible && <HeavyComponent />}</div>;
 */
export function useIntersection<T extends Element = HTMLDivElement>(
  options: UseIntersectionOptions = {}
): [React.MutableRefObject<T | null>, boolean] {
  const { freezeOnceVisible = true, threshold = 0, rootMargin = "0px", root = null } = options;
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (freezeOnceVisible && isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold, rootMargin, root }
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold, rootMargin, root, freezeOnceVisible]);

  return [ref, isVisible];
}
