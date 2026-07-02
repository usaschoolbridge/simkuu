"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const ACTIVITIES = [
  { name: "Arjun M.", location: "New York", plan: "USA Unlimited Plan", time: "2 min ago" },
  { name: "Priya S.", location: "Texas", plan: "USA 15GB Plan", time: "5 min ago" },
  { name: "Rahul K.", location: "California", plan: "USA Unlimited Plan", time: "8 min ago" },
  { name: "Divya P.", location: "Florida", plan: "USA Premium Plan", time: "11 min ago" },
  { name: "Vikram N.", location: "Illinois", plan: "USA Value Plan", time: "14 min ago" },
  { name: "Ananya R.", location: "Washington", plan: "USA 10GB Plan", time: "17 min ago" },
];

export function LiveActivity() {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // Show first notification after 5 seconds
    const initialTimer = setTimeout(() => {
      setVisible(true);
      setShown(true);
    }, 5000);

    return () => clearTimeout(initialTimer);
  }, []);

  useEffect(() => {
    if (!shown) return;

    // Auto-hide after 4 seconds
    const hideTimer = setTimeout(() => setVisible(false), 4000);

    // Show next after 12 seconds
    const nextTimer = setTimeout(() => {
      setCurrent((c) => (c + 1) % ACTIVITIES.length);
      setVisible(true);
    }, 12000);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [current, shown]);

  const activity = ACTIVITIES[current];

  return (
    // On mobile the StickyCTA occupies the bottom edge (z-40). Sit this toast
    // ABOVE it (offset clears the ~76px bar + iOS safe area) so it never covers
    // the "Get Your USA Number" button. On desktop there's no bar, so bottom-6.
    <div className="fixed left-4 md:left-6 z-30 md:z-50 pointer-events-none bottom-[calc(6rem_+_env(safe-area-inset-bottom))] md:bottom-6">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, x: -60, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -40, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white shadow-2xl border border-black/[0.06] max-w-[280px]"
            style={{ pointerEvents: "none" }}
          >
            <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #3B82F6, #7C3AED)" }}
            >
              {activity.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="text-xs font-semibold text-black truncate">{activity.name} from {activity.location}</span>
              </div>
              <div className="text-[11px] text-black/50 mt-0.5 truncate">
                Just bought <span className="font-medium text-black/70">{activity.plan}</span>
              </div>
            </div>
            <div className="text-[10px] text-black/30 shrink-0">{activity.time}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
