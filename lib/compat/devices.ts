/**
 * eSIM compatibility knowledge base + pure detection helpers.
 *
 * No framework imports — safe to use on the edge, in route handlers, in the
 * browser, and in unit checks. The four checker methods (auto-detect, model
 * search, IMEI/EID, screenshot OCR) all funnel through the helpers here so the
 * verdict logic lives in exactly one place.
 */

export type CompatVerdict = "compatible" | "incompatible" | "unknown";

export interface CompatResult {
  verdict: CompatVerdict;
  /** Best human-readable device label we resolved, if any. */
  device?: string;
  /** Short reason shown to the customer. */
  reason: string;
  /** 0–1 confidence in the verdict. Low confidence → ask to confirm, never block. */
  confidence: number;
  /** Method that produced this verdict. */
  method: "auto" | "search" | "imei" | "ocr";
}

/**
 * Curated list of common eSIM-capable phone families. This is intentionally
 * pattern-based (not an exhaustive GSMA dump) so search/auto-detect can resolve
 * a model to a verdict instantly without a network call. Patterns are matched
 * case-insensitively against a normalized device string.
 */
export interface DeviceRule {
  /** Display name suggested in autocomplete. */
  label: string;
  /** Brand for grouping. */
  brand: string;
  /** Regexes that identify this family from a free-text model or UA string. */
  patterns: RegExp[];
  /** Whether the family supports eSIM. */
  esim: boolean;
  /** Optional note (e.g. region caveats). */
  note?: string;
}

// Models that are explicitly NOT eSIM-capable — checked first so we don't
// falsely greenlight, e.g., an iPhone older than the XR/XS line.
const INCOMPATIBLE_RULES: DeviceRule[] = [
  {
    label: "iPhone 6 / 7 / 8 / SE (1st gen)",
    brand: "Apple",
    patterns: [/iphone\s?(6|7|8)(\s|$|plus)/i, /iphone\s?se\b(?!.*2020|.*2022|.*3)/i],
    esim: false,
    note: "iPhones before the XR/XS (2018) have no eSIM.",
  },
  {
    label: "Samsung Galaxy S8 / S9 / Note 8 / Note 9",
    brand: "Samsung",
    patterns: [/galaxy\s?(s8|s9|note\s?8|note\s?9)\b/i],
    esim: false,
    note: "These Galaxy models predate Samsung eSIM support.",
  },
];

const COMPATIBLE_RULES: DeviceRule[] = [
  {
    label: "iPhone (XR / XS and newer)",
    brand: "Apple",
    patterns: [
      /iphone\s?(x[rs]|11|12|13|14|15|16|17)\b/i,
      /iphone\s?se\b.*(2020|2022|3)/i,
    ],
    esim: true,
  },
  {
    label: "Samsung Galaxy S20 / S21 / S22 / S23 / S24 / S25",
    brand: "Samsung",
    patterns: [/galaxy\s?s(2[0-5]|fe)\b/i],
    esim: true,
  },
  {
    label: "Samsung Galaxy Z Fold / Z Flip",
    brand: "Samsung",
    patterns: [/galaxy\s?z\s?(fold|flip)/i],
    esim: true,
  },
  {
    label: "Samsung Galaxy Note 20",
    brand: "Samsung",
    patterns: [/galaxy\s?note\s?20/i],
    esim: true,
  },
  {
    label: "Google Pixel 3 and newer",
    brand: "Google",
    patterns: [/pixel\s?([3-9]|10)\b/i],
    esim: true,
    note: "Pixel 3 eSIM may be carrier-limited in some regions.",
  },
  {
    label: "Google Pixel Fold",
    brand: "Google",
    patterns: [/pixel\s?fold/i],
    esim: true,
  },
  {
    label: "OnePlus 11 / 12 / 13 / Open",
    brand: "OnePlus",
    patterns: [/oneplus\s?(1[1-9]|open)/i],
    esim: true,
  },
  {
    label: "Nothing Phone (2) / (2a) / (3)",
    brand: "Nothing",
    patterns: [/nothing\s?phone\s?\(?(2|2a|3)/i],
    esim: true,
  },
  {
    label: "Motorola Edge / Razr (2023+)",
    brand: "Motorola",
    patterns: [/motorola\s?(edge|razr)/i, /\bmoto\s?(edge|razr)/i],
    esim: true,
  },
  {
    label: "iPad (Wi-Fi + Cellular)",
    brand: "Apple",
    patterns: [/ipad/i],
    esim: true,
  },
];

const ALL_RULES = [...INCOMPATIBLE_RULES, ...COMPATIBLE_RULES];

/**
 * Autocomplete catalog — concrete popular models so typing "iPhone 14" or
 * "Galaxy S24" surfaces a suggestion. The verdict still comes from matchDevice,
 * so this list only needs to cover what people actually type.
 */
export const DEVICE_CATALOG: { label: string; brand: string; esim: boolean }[] = [
  // Apple
  ...["iPhone 17 Pro Max", "iPhone 17", "iPhone 16 Pro", "iPhone 16", "iPhone 15 Pro", "iPhone 15",
    "iPhone 14 Pro", "iPhone 14", "iPhone 13 Pro", "iPhone 13", "iPhone 12", "iPhone 11",
    "iPhone XR", "iPhone XS", "iPhone SE (2022)", "iPad Pro", "iPad Air"]
    .map((label) => ({ label, brand: "Apple", esim: true })),
  // Samsung
  ...["Galaxy S25 Ultra", "Galaxy S25", "Galaxy S24 Ultra", "Galaxy S24", "Galaxy S23",
    "Galaxy S22", "Galaxy S21", "Galaxy S20", "Galaxy Z Fold 6", "Galaxy Z Flip 6", "Galaxy Note 20"]
    .map((label) => ({ label, brand: "Samsung", esim: true })),
  // Google
  ...["Pixel 10 Pro", "Pixel 9 Pro", "Pixel 9", "Pixel 8", "Pixel 7", "Pixel 6", "Pixel Fold"]
    .map((label) => ({ label, brand: "Google", esim: true })),
  // Others
  { label: "OnePlus 13", brand: "OnePlus", esim: true },
  { label: "OnePlus 12", brand: "OnePlus", esim: true },
  { label: "OnePlus Open", brand: "OnePlus", esim: true },
  { label: "Nothing Phone (3)", brand: "Nothing", esim: true },
  { label: "Nothing Phone (2)", brand: "Nothing", esim: true },
  { label: "Motorola Edge 50", brand: "Motorola", esim: true },
  { label: "Motorola Razr 2024", brand: "Motorola", esim: true },
];

function normalize(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/** Resolve a free-text device/model string to a verdict via the rule patterns. */
export function matchDevice(input: string): CompatResult {
  const text = normalize(input);
  if (!text) {
    return { verdict: "unknown", reason: "No device provided.", confidence: 0, method: "search" };
  }

  // Incompatible families take precedence to avoid false positives.
  for (const rule of INCOMPATIBLE_RULES) {
    if (rule.patterns.some((p) => p.test(text))) {
      return {
        verdict: "incompatible",
        device: rule.label,
        reason: rule.note ?? `${rule.label} does not support eSIM.`,
        confidence: 0.9,
        method: "search",
      };
    }
  }
  for (const rule of COMPATIBLE_RULES) {
    if (rule.patterns.some((p) => p.test(text))) {
      return {
        verdict: "compatible",
        device: rule.label,
        reason: rule.note ?? `${rule.label} supports eSIM.`,
        confidence: 0.9,
        method: "search",
      };
    }
  }
  return {
    verdict: "unknown",
    reason: "We couldn't match that model. You can still continue — most phones from 2019 onward support eSIM.",
    confidence: 0.2,
    method: "search",
  };
}

/** Search the catalog for autocomplete suggestions. */
export function searchDevices(query: string, limit = 8): typeof DEVICE_CATALOG {
  const q = normalize(query).toLowerCase();
  if (!q) return DEVICE_CATALOG.slice(0, limit);
  return DEVICE_CATALOG.filter(
    (d) => d.label.toLowerCase().includes(q) || d.brand.toLowerCase().includes(q)
  ).slice(0, limit);
}

/**
 * Auto-detect from a User-Agent string. Mobile UAs rarely expose the exact
 * model, so a positive match is high-value but a miss is "unknown", never a
 * rejection.
 */
export function detectFromUserAgent(ua: string): CompatResult {
  const text = normalize(ua);
  if (!text) {
    return { verdict: "unknown", reason: "Couldn't read your device.", confidence: 0, method: "auto" };
  }

  // iOS: the UA says "iPhone" but not the exact model. iOS 12.1+ (2018) is the
  // eSIM era and all current iPhones report iOS 16/17/18 in the UA, so treat modern
  // iOS iPhones as compatible with medium confidence.
  if (/\biphone\b/i.test(text)) {
    const iosMatch = text.match(/os (\d+)_/i);
    const major = iosMatch ? parseInt(iosMatch[1], 10) : 0;
    if (major >= 13) {
      return {
        verdict: "compatible",
        device: "iPhone (modern iOS)",
        reason: "Your iPhone is running a modern iOS version with eSIM support.",
        confidence: 0.7,
        method: "auto",
      };
    }
    return {
      verdict: "unknown",
      device: "iPhone",
      reason: "We detected an iPhone but couldn't confirm the model. Try the model search to be sure.",
      confidence: 0.3,
      method: "auto",
    };
  }
  if (/\bipad\b/i.test(text)) {
    return {
      verdict: "compatible",
      device: "iPad",
      reason: "Cellular iPads support eSIM. Wi-Fi-only iPads cannot use mobile data.",
      confidence: 0.6,
      method: "auto",
    };
  }

  // Android: try to pull the model token, then run it through the rules.
  const androidModel = text.match(/android[^;]*;\s*([^;)]+?)\s*(?:build|\))/i)?.[1];
  if (androidModel) {
    const r = matchDevice(androidModel);
    if (r.verdict !== "unknown") return { ...r, method: "auto", confidence: Math.min(r.confidence, 0.8) };
    return {
      verdict: "unknown",
      device: normalize(androidModel),
      reason: "We detected an Android device but couldn't confirm eSIM support. Try the model search.",
      confidence: 0.3,
      method: "auto",
    };
  }

  if (/android/i.test(text)) {
    return {
      verdict: "unknown",
      device: "Android device",
      reason: "We detected Android but not the exact model. Try the model search.",
      confidence: 0.3,
      method: "auto",
    };
  }

  return {
    verdict: "unknown",
    reason: "We couldn't identify your device from the browser. Try one of the other checks.",
    confidence: 0.1,
    method: "auto",
  };
}

/**
 * Evaluate an IMEI/EID entry. Per spec: presence of an EID strongly implies an
 * eSIM; a missing EID is "unknown" (never an outright rejection).
 */
export function evaluateImeiEid(input: { imei?: string; imei2?: string; eid?: string }): CompatResult {
  const eid = (input.eid ?? "").replace(/\s/g, "");
  const imei = (input.imei ?? "").replace(/\s/g, "");

  // EID is a 32-digit identifier unique to an eSIM chip.
  if (eid) {
    if (/^\d{32}$/.test(eid)) {
      return {
        verdict: "compatible",
        reason: "Your device reports an EID, which means it has an eSIM chip. You're good to go.",
        confidence: 0.95,
        method: "imei",
      };
    }
    return {
      verdict: "unknown",
      reason: "That EID doesn't look complete (it should be 32 digits). Double-check, or upload a screenshot.",
      confidence: 0.3,
      method: "imei",
    };
  }

  // A dual-IMEI device (IMEI + IMEI2) very often has an eSIM as the second line.
  if (imei && input.imei2) {
    return {
      verdict: "unknown",
      reason: "Two IMEIs detected — your phone likely supports eSIM, but we couldn't confirm. Upload a screenshot to be sure.",
      confidence: 0.4,
      method: "imei",
    };
  }

  if (imei) {
    return {
      verdict: "unknown",
      reason: "No EID found. Many phones still support eSIM — upload a settings screenshot so we can confirm.",
      confidence: 0.2,
      method: "imei",
    };
  }

  return { verdict: "unknown", reason: "Enter your EID (best) or IMEI to check.", confidence: 0, method: "imei" };
}

/**
 * Pull device identifiers out of OCR'd text from a *#06# / Settings / SIM
 * Manager screenshot. Returns whatever we could find plus a verdict; low
 * confidence means the UI should ask the customer to confirm, not block.
 */
export function parseOcrText(raw: string): CompatResult & { extracted: { imei?: string; eid?: string; device?: string } } {
  const text = raw.replace(/[Oo](?=\d)/g, "0"); // common OCR confusion O→0 before digits
  const eid = text.match(/\b\d{32}\b/)?.[0];
  const imei = text.match(/\b\d{15}\b/)?.[0];

  // Try to find a known model name in the text.
  const model = matchDevice(text);

  if (eid) {
    return {
      ...evaluateImeiEid({ eid }),
      method: "ocr",
      extracted: { eid, imei, device: model.device },
    };
  }
  if (model.verdict === "compatible") {
    return {
      verdict: "compatible",
      device: model.device,
      reason: `We read "${model.device}" from your screenshot — it supports eSIM.`,
      confidence: 0.7,
      method: "ocr",
      extracted: { imei, device: model.device },
    };
  }
  if (imei) {
    return {
      verdict: "unknown",
      reason: "We read your IMEI but not an EID. Confirm your phone model below so we can verify.",
      confidence: 0.3,
      method: "ocr",
      extracted: { imei },
    };
  }
  return {
    verdict: "unknown",
    reason: "We couldn't read the details clearly. Confirm your phone model below.",
    confidence: 0.1,
    method: "ocr",
    extracted: {},
  };
}
