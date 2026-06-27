"use client";

import { useEffect, useState } from "react";

/**
 * Debounce a rapidly-changing value (e.g. search input) by `delay` ms.
 * The returned value only updates after `delay` ms of no new changes.
 *
 * @example
 * const [query, setQuery] = useState("");
 * const debouncedQuery = useDebounce(query, 300);
 * // fire API call only when debouncedQuery changes
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
