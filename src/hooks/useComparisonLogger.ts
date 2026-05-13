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
  donationConfirmed: boolean;
  donationAmount: number | null;
}

interface AccessInfo {
  referrer: string | null;
  referrer_domain: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  landing_path: string | null;
  device_type: string | null;
  browser: string | null;
  screen_width: number | null;
  language: string | null;
  timezone: string | null;
  has_url_params: boolean;
}

function detectDeviceType(): string {
  const ua = navigator.userAgent;
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua))) {
    return "tablet";
  }
  if (/Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";
  return "Other";
}

function collectAccessInfo(): AccessInfo {
  try {
    const params = new URLSearchParams(window.location.search);
    const referrer = document.referrer || null;
    let referrer_domain: string | null = null;
    if (referrer) {
      try {
        referrer_domain = new URL(referrer).hostname;
      } catch {}
    }
    return {
      referrer,
      referrer_domain,
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      landing_path: (window.location.pathname || "") + (window.location.search || "") || null,
      device_type: detectDeviceType(),
      browser: detectBrowser(),
      screen_width: window.innerWidth || null,
      language: navigator.language || null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
      has_url_params: !!window.location.search && window.location.search.length > 1,
    };
  } catch {
    return {
      referrer: null, referrer_domain: null,
      utm_source: null, utm_medium: null, utm_campaign: null,
      landing_path: null, device_type: null, browser: null,
      screen_width: null, language: null, timezone: null,
      has_url_params: false,
    };
  }
}

function isExcludedSource(): boolean {
  try {
    const host = window.location.hostname.toLowerCase();
    const refDomain = (() => {
      try {
        return document.referrer ? new URL(document.referrer).hostname.toLowerCase() : "";
      } catch {
        return "";
      }
    })();
    // Lovableプレビュー/エディタからのアクセスは計測対象外
    const isLovable = (d: string) => /(^|\.)lovable\.(app|dev)$/.test(d) || /lovableproject\.com$/.test(d);
    return isLovable(host) || (!!refDomain && isLovable(refDomain));
  } catch {
    return false;
  }
}

interface LoggerState {
  sessionId: string;
  timer?: ReturnType<typeof setTimeout>;
  hasLogged: boolean;
  accessInfo: AccessInfo;
  excluded: boolean;
}

export function useComparisonLogger(data: ComparisonLogData) {
  const { isAdmin } = useAuth();
  const stateRef = useRef<LoggerState | null>(null);
  if (stateRef.current === null) {
    stateRef.current = {
      sessionId: crypto.randomUUID(),
      hasLogged: false,
      accessInfo: collectAccessInfo(),
      excluded: isExcludedSource(),
    };
  }
  const state = stateRef.current;

  useEffect(() => {
    if (isAdmin) return;
    if (state.excluded) return;
    if (state.timer) clearTimeout(state.timer);

    state.timer = setTimeout(async () => {
      try {
        const access = state.accessInfo;
        await supabase.rpc("upsert_comparison_log", {
          p_session_id: state.sessionId,
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
          p_referrer: access.referrer,
          p_referrer_domain: access.referrer_domain,
          p_utm_source: access.utm_source,
          p_utm_medium: access.utm_medium,
          p_utm_campaign: access.utm_campaign,
          p_landing_path: access.landing_path,
          p_device_type: access.device_type,
          p_browser: access.browser,
          p_screen_width: access.screen_width,
          p_language: access.language,
          p_timezone: access.timezone,
          p_has_url_params: access.has_url_params,
        });
        state.hasLogged = true;
      } catch {
        // Silent fail - analytics should not break the app
      }
    }, 3000);

    return () => {
      if (state.timer) clearTimeout(state.timer);
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
