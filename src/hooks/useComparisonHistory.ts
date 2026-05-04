import { useEffect, useState, useCallback, useRef } from "react";
import type { VehicleType, InsuranceType } from "@/lib/pricing";

const KEY = "comparisonHistory";
const MAX = 10;

export interface HistoryEntry {
  id: string;
  ts: number;
  vehicleType: VehicleType;
  totalHours: number;
  distance: number;
  tollFee: number;
  hasRefuel: boolean;
  hasWash: boolean;
  hasCarShareInsurance: boolean;
  isMember: boolean;
  insuranceType: InsuranceType;
  cheaper: "carShare" | "rentalCar" | "same" | null;
  difference: number;
}

function load(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(items: HistoryEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function useComparisonHistory() {
  const [items, setItems] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setItems(load());
  }, []);

  const add = useCallback((entry: Omit<HistoryEntry, "id" | "ts">) => {
    setItems((prev) => {
      const last = prev[0];
      // Skip if identical to most recent
      if (
        last &&
        last.vehicleType === entry.vehicleType &&
        last.totalHours === entry.totalHours &&
        last.distance === entry.distance &&
        last.tollFee === entry.tollFee &&
        last.hasRefuel === entry.hasRefuel &&
        last.hasWash === entry.hasWash &&
        last.hasCarShareInsurance === entry.hasCarShareInsurance &&
        last.isMember === entry.isMember &&
        last.insuranceType === entry.insuranceType
      ) {
        return prev;
      }
      const next: HistoryEntry[] = [
        { ...entry, id: crypto.randomUUID(), ts: Date.now() },
        ...prev,
      ].slice(0, MAX);
      save(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      save(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    save([]);
    setItems([]);
  }, []);

  return { items, add, remove, clear };
}

/** Debounced auto-save trigger */
export function useAutoHistorySave(
  enabled: boolean,
  entry: Omit<HistoryEntry, "id" | "ts">,
  add: (e: Omit<HistoryEntry, "id" | "ts">) => void,
  delay = 3000
) {
  const ref = useRef(entry);
  ref.current = entry;

  useEffect(() => {
    if (!enabled) return;
    const t = setTimeout(() => add(ref.current), delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enabled,
    entry.vehicleType,
    entry.totalHours,
    entry.distance,
    entry.tollFee,
    entry.hasRefuel,
    entry.hasWash,
    entry.hasCarShareInsurance,
    entry.isMember,
    entry.insuranceType,
    delay,
    add,
  ]);
}
