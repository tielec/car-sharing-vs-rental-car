
-- Drop the overly permissive UPDATE policy
DROP POLICY IF EXISTS "Anyone can update comparison logs" ON comparison_logs;

-- Create a SECURITY DEFINER function to handle upsert safely
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
  p_donation_amount integer DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO comparison_logs (
    session_id, vehicle_type, total_hours, distance, toll_fee,
    has_refuel, has_wash, has_car_share_insurance, is_member,
    insurance_type, cheaper_service, has_interacted,
    donation_clicked, donation_amount
  ) VALUES (
    p_session_id, p_vehicle_type, p_total_hours, p_distance, p_toll_fee,
    p_has_refuel, p_has_wash, p_has_car_share_insurance, p_is_member,
    p_insurance_type, p_cheaper_service, p_has_interacted,
    p_donation_clicked, p_donation_amount
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
    updated_at = now();
END;
$$;

-- Allow anon and authenticated to call this function
GRANT EXECUTE ON FUNCTION public.upsert_comparison_log TO anon, authenticated;
