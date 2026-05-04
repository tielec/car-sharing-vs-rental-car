import { useEffect, useState, useCallback } from "react";

const KEY = "ctaUnlocked";

/**
 * Soft gate for Next-Action CTAs.
 * NOTE: client-side only. Bypassable via devtools — this is a UX nudge, not a paywall.
 */
export function useDonationUnlock() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    try {
      setUnlocked(localStorage.getItem(KEY) === "1");
    } catch {
      // ignore
    }
  }, []);

  const unlock = useCallback(() => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // ignore
    }
    setUnlocked(true);
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
    setUnlocked(false);
  }, []);

  return { unlocked, unlock, reset };
}
