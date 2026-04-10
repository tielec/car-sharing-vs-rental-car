import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { VehicleType, InsuranceType } from "@/lib/pricing";

interface ComparisonLogData {
  vehicleType: VehicleType;
  totalHours: number;
  distance: number;
  tollFee: number;
  hasRefuel: boolean;
  hasWash: boolean;
  hasCarShareInsurance: boolean;
  isMember: boolean;
  insuranceType: InsuranceType;
  cheaperService: string | null;
  hasInteracted: boolean;
}

export function useComparisonLogger(data: ComparisonLogData) {
  const sessionIdRef = useRef(crypto.randomUUID());
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const hasLoggedRef = useRef(false);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        await supabase.from("comparison_logs").upsert(
          {
            session_id: sessionIdRef.current,
            vehicle_type: data.vehicleType,
            total_hours: data.totalHours,
            distance: data.distance,
            toll_fee: data.tollFee,
            has_refuel: data.hasRefuel,
            has_wash: data.hasWash,
            has_car_share_insurance: data.hasCarShareInsurance,
            is_member: data.isMember,
            insurance_type: data.insuranceType,
            cheaper_service: data.cheaperService,
            has_interacted: data.hasInteracted,
          },
          { onConflict: "session_id" }
        );
        hasLoggedRef.current = true;
      } catch {
        // Silent fail - analytics should not break the app
      }
    }, 3000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [
    data.vehicleType,
    data.totalHours,
    data.distance,
    data.tollFee,
    data.hasRefuel,
    data.hasWash,
    data.hasCarShareInsurance,
    data.isMember,
    data.insuranceType,
    data.cheaperService,
  ]);
}
