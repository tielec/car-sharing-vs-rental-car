import { useState, useEffect } from "react";
import { settings } from "@/config";
import { supabase } from "@/integrations/supabase/client";

const CACHE_KEY = "gasolineAveragePrice";
const CACHE_DATE_KEY = "gasolinePriceUpdatedAt";
const CACHE_FETCH_DATE_KEY = "gasolinePriceFetchDate";
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface GasolinePriceResult {
  price: number;
  isLoading: boolean;
  updatedAt: string | null;
  fetchDate: string | null;
  isOverridden: boolean;
}

function getCachedPrice(): { price: number; updatedAt: string; fetchDate: string; timestamp: number } | null {
  try {
    const price = localStorage.getItem(CACHE_KEY);
    const updatedAt = localStorage.getItem(CACHE_DATE_KEY);
    const fetchDate = localStorage.getItem(CACHE_FETCH_DATE_KEY);
    if (price && updatedAt) {
      return {
        price: Number(price),
        updatedAt,
        fetchDate: fetchDate || updatedAt,
        timestamp: new Date(updatedAt).getTime(),
      };
    }
  } catch {}
  return null;
}

function isCacheValid(): boolean {
  const cached = getCachedPrice();
  if (!cached) return false;
  return Date.now() - cached.timestamp < CACHE_DURATION_MS;
}

export function useGasolinePrice(): GasolinePriceResult {
  const cached = getCachedPrice();
  const [price, setPrice] = useState(cached?.price ?? settings.defaults.fuelPrice);
  const [isLoading, setIsLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(cached?.updatedAt ?? null);
  const [fetchDate, setFetchDate] = useState(cached?.fetchDate ?? null);
  const [isOverridden, setIsOverridden] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // 1. Check for active manual override
      try {
        const { data: override } = await supabase
          .from("gasoline_price_overrides")
          .select("price, created_at")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!cancelled && override) {
          setPrice(Math.round(Number(override.price)));
          setUpdatedAt(override.created_at);
          setIsOverridden(true);
          setIsLoading(false);
          return;
        }
      } catch {}

      // 2. Use cached API price if valid
      if (isCacheValid()) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      // 3. Fetch from API via edge function
      try {
        const { data, error } = await supabase.functions.invoke("gasoline-price", { method: "GET" });
        if (cancelled) return;
        if (error || !data) throw new Error("fetch failed");
        const avg = Math.round(Number(data.average_price));
        if (avg > 0) {
          const now = new Date().toISOString();
          localStorage.setItem(CACHE_KEY, String(avg));
          localStorage.setItem(CACHE_DATE_KEY, now);
          localStorage.setItem(CACHE_FETCH_DATE_KEY, data.fetch_date || "");
          setPrice(avg);
          setUpdatedAt(now);
          setFetchDate(data.fetch_date || null);
        }
      } catch {}

      if (!cancelled) setIsLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { price, isLoading, updatedAt, fetchDate, isOverridden };
}
