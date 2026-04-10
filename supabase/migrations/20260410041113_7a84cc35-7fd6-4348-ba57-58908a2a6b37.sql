ALTER TABLE public.comparison_logs
  ADD COLUMN donation_clicked boolean NOT NULL DEFAULT false,
  ADD COLUMN donation_amount integer;