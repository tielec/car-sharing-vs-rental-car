import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
  donationClicked: boolean;
  donationAmount: number | null;
}

export function useComparisonLogger(data: ComparisonLogData) {
  const { isAdmin } = useAuth();
  const sessionIdRef = useRef(crypto.randomUUID());
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const hasLoggedRef = useRef(false);

  useEffect(() => {
    if (isAdmin) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        await supabase.rpc("upsert_comparison_log", {
          p_session_id: sessionIdRef.current,
          p_vehicle_type: data.vehicleType,
          p_total_hours: data.totalHours,
          p_distance: data.distance,
          p_toll_fee: data.tollFee,
          p_has_refuel: data.hasRefuel,
          p_has_wash: data.hasWash,
          p_has_car_share_insurance: data.hasCarShareInsurance,
          p_is_member: data.isMember,
          p_insurance_type: data.insuranceType,
          p_cheaper_service: data.cheaperService,
          p_has_interacted: data.hasInteracted,
          p_donation_clicked: data.donationClicked,
          p_donation_amount: data.donationAmount,
        });
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
    data.donationClicked,
    data.donationAmount,
  ]);
}
