import { createServerFn } from "@tanstack/react-start";

export interface GasolinePriceData {
  average_price?: number | string;
  fetch_date?: string;
}

/**
 * Migrated from the Supabase edge function `gasoline-price`.
 * Proxies the public gasoline-price statistics JSON (avoids CORS on the client).
 */
export const fetchGasolinePrices = createServerFn({ method: "GET" }).handler(
  async (): Promise<GasolinePriceData> => {
    const res = await fetch("https://ichioak.com/stat/gasoline_prices.json");
    if (!res.ok) {
      throw new Error("Failed to fetch gasoline prices");
    }
    return (await res.json()) as GasolinePriceData;
  },
);
