import { useEffect, useRef } from "react";
import type { VehicleType, InsuranceType } from "@/lib/pricing";

export interface UrlState {
  vehicleType: VehicleType;
  totalHours: number;
  distance: number;
  tollFee: number;
  hasRefuel: boolean;
  hasWash: boolean;
  hasCarShareInsurance: boolean;
  isMember: boolean;
  insuranceType: InsuranceType;
}

const VEHICLES: VehicleType[] = ["compact", "compactMinivan", "minivan"];
const INSURANCES: InsuranceType[] = ["none", "basic", "premium"];

export function readUrlState(): Partial<UrlState> {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const out: Partial<UrlState> = {};
  const v = p.get("v");
  if (v && VEHICLES.includes(v as VehicleType)) out.vehicleType = v as VehicleType;
  const h = Number(p.get("h"));
  if (Number.isFinite(h) && h > 0 && h <= 240) out.totalHours = Math.round(h);
  const d = Number(p.get("d"));
  if (Number.isFinite(d) && d >= 0 && d <= 3000) out.distance = Math.round(d);
  const t = Number(p.get("t"));
  if (Number.isFinite(t) && t >= 0 && t <= 100000) out.tollFee = Math.round(t);
  if (p.has("r")) out.hasRefuel = p.get("r") === "1";
  if (p.has("w")) out.hasWash = p.get("w") === "1";
  if (p.has("ci")) out.hasCarShareInsurance = p.get("ci") === "1";
  if (p.has("m")) out.isMember = p.get("m") === "1";
  const i = p.get("i");
  if (i && INSURANCES.includes(i as InsuranceType)) out.insuranceType = i as InsuranceType;
  return out;
}

/** Keeps URL query params in sync with state (debounced, replaceState). */
export function useUrlSync(state: UrlState, debounceMs = 500) {
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const handle = setTimeout(() => {
      const p = new URLSearchParams();
      p.set("v", state.vehicleType);
      p.set("h", String(state.totalHours));
      p.set("d", String(state.distance));
      p.set("t", String(state.tollFee));
      p.set("r", state.hasRefuel ? "1" : "0");
      p.set("w", state.hasWash ? "1" : "0");
      p.set("ci", state.hasCarShareInsurance ? "1" : "0");
      p.set("m", state.isMember ? "1" : "0");
      p.set("i", state.insuranceType);
      const newUrl = `${window.location.pathname}?${p.toString()}${window.location.hash}`;
      window.history.replaceState(null, "", newUrl);
    }, debounceMs);
    return () => clearTimeout(handle);
  }, [
    state.vehicleType,
    state.totalHours,
    state.distance,
    state.tollFee,
    state.hasRefuel,
    state.hasWash,
    state.hasCarShareInsurance,
    state.isMember,
    state.insuranceType,
    debounceMs,
  ]);
}
