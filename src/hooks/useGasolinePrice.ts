import { useState, useEffect } from "react";
import { settings } from "@/config";

const CACHE_KEY = "gasolineAveragePrice";
const CACHE_DATE_KEY = "gasolinePriceUpdatedAt";
const CACHE_FETCH_DATE_KEY = "gasolinePriceFetchDate";
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface GasolinePriceResult {
  price: number;
  isLoading: boolean;
  updatedAt: string | null;
  fetchDate: string | null;
}

interface GasolineApiResponse {
  fetch_date: string;
  date: string;
  average_price: string;
  data: Array<{ price: number }>;
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
  const [isLoading, setIsLoading] = useState(!isCacheValid());
  const [updatedAt, setUpdatedAt] = useState(cached?.updatedAt ?? null);
  const [fetchDate, setFetchDate] = useState(cached?.fetchDate ?? null);

  useEffect(() => {
    if (isCacheValid()) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    const apiUrl = "https://ichioak.com/stat/gasoline_prices.json";
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;

    fetch(proxyUrl, { signal: controller.signal })
      .then((res) => res.json())
      .then((data: GasolineApiResponse) => {
        const avg = Math.round(Number(data.average_price));
        if (avg > 0) {
          const now = new Date().toISOString();
          localStorage.setItem(CACHE_KEY, String(avg));
          localStorage.setItem(CACHE_DATE_KEY, now);
          localStorage.setItem(CACHE_FETCH_DATE_KEY, data.fetch_date);
          setPrice(avg);
          setUpdatedAt(now);
          setFetchDate(data.fetch_date);
        }
      })
      .catch(() => {
        // fallback: use cache or YAML default (already set in initial state)
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, []);

  return { price, isLoading, updatedAt, fetchDate };
}
