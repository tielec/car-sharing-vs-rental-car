-- Enable extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create app_settings KV table
CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can view settings"
ON public.app_settings FOR SELECT
USING (true);

-- Only admins can insert
CREATE POLICY "Admins can insert settings"
ON public.app_settings FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update
CREATE POLICY "Admins can update settings"
ON public.app_settings FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default setting
INSERT INTO public.app_settings (key, value) VALUES ('auto_fetch_gasoline_price', 'false');