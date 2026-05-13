
ALTER TABLE public.comparison_logs
  ADD COLUMN IF NOT EXISTS donation_confirmed boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.upsert_comparison_log(
  p_session_id text,
  p_vehicle_type text DEFAULT NULL,
  p_total_hours integer DEFAULT NULL,
  p_distance integer DEFAULT NULL,
  p_toll_fee integer DEFAULT NULL,
  p_has_refuel boolean DEFAULT false,
  p_has_wash boolean DEFAULT false,
  p_has_car_share_insurance boolean DEFAULT false,
  p_is_member boolean DEFAULT false,
  p_insurance_type text DEFAULT NULL,
  p_cheaper_service text DEFAULT NULL,
  p_has_interacted boolean DEFAULT false,
  p_donation_clicked boolean DEFAULT false,
  p_donation_amount integer DEFAULT NULL,
  p_referrer text DEFAULT NULL,
  p_referrer_domain text DEFAULT NULL,
  p_utm_source text DEFAULT NULL,
  p_utm_medium text DEFAULT NULL,
  p_utm_campaign text DEFAULT NULL,
  p_landing_path text DEFAULT NULL,
  p_device_type text DEFAULT NULL,
  p_browser text DEFAULT NULL,
  p_screen_width integer DEFAULT NULL,
  p_language text DEFAULT NULL,
  p_timezone text DEFAULT NULL,
  p_has_url_params boolean DEFAULT false,
  p_donation_confirmed boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO comparison_logs (
    session_id, vehicle_type, total_hours, distance, toll_fee,
    has_refuel, has_wash, has_car_share_insurance, is_member,
    insurance_type, cheaper_service, has_interacted,
    donation_clicked, donation_amount, donation_confirmed,
    referrer, referrer_domain, utm_source, utm_medium, utm_campaign,
    landing_path, device_type, browser, screen_width, language, timezone,
    has_url_params
  ) VALUES (
    p_session_id, p_vehicle_type, p_total_hours, p_distance, p_toll_fee,
    p_has_refuel, p_has_wash, p_has_car_share_insurance, p_is_member,
    p_insurance_type, p_cheaper_service, p_has_interacted,
    p_donation_clicked, p_donation_amount, p_donation_confirmed,
    p_referrer, p_referrer_domain, p_utm_source, p_utm_medium, p_utm_campaign,
    p_landing_path, p_device_type, p_browser, p_screen_width, p_language, p_timezone,
    p_has_url_params
  )
  ON CONFLICT (session_id) DO UPDATE SET
    vehicle_type = EXCLUDED.vehicle_type,
    total_hours = EXCLUDED.total_hours,
    distance = EXCLUDED.distance,
    toll_fee = EXCLUDED.toll_fee,
    has_refuel = EXCLUDED.has_refuel,
    has_wash = EXCLUDED.has_wash,
    has_car_share_insurance = EXCLUDED.has_car_share_insurance,
    is_member = EXCLUDED.is_member,
    insurance_type = EXCLUDED.insurance_type,
    cheaper_service = EXCLUDED.cheaper_service,
    has_interacted = EXCLUDED.has_interacted,
    donation_clicked = EXCLUDED.donation_clicked,
    donation_amount = EXCLUDED.donation_amount,
    donation_confirmed = EXCLUDED.donation_confirmed,
    updated_at = now();
END;
$function$;
