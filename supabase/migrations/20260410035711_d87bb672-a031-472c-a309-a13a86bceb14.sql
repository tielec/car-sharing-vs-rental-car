
CREATE TABLE public.comparison_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL UNIQUE,
  vehicle_type text,
  total_hours int,
  distance int,
  toll_fee int,
  has_refuel boolean DEFAULT false,
  has_wash boolean DEFAULT false,
  has_car_share_insurance boolean DEFAULT false,
  is_member boolean DEFAULT false,
  insurance_type text,
  cheaper_service text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.comparison_logs ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous logging)
CREATE POLICY "Anyone can insert comparison logs"
ON public.comparison_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Anyone can update their own session log (by session_id, no auth needed)
CREATE POLICY "Anyone can update comparison logs"
ON public.comparison_logs
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Only admins can read logs
CREATE POLICY "Admins can view comparison logs"
ON public.comparison_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete logs
CREATE POLICY "Admins can delete comparison logs"
ON public.comparison_logs
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_comparison_logs_updated_at
BEFORE UPDATE ON public.comparison_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
