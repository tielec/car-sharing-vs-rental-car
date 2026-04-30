ALTER TABLE public.gasoline_price_overrides ALTER COLUMN set_by DROP NOT NULL;
ALTER TABLE public.gasoline_price_overrides DROP CONSTRAINT IF EXISTS gasoline_price_overrides_set_by_fkey;