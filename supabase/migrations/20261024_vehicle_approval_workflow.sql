-- ==============================================================================
-- MIGRATION: ENFORCE ADMIN APPROVAL WORKFLOW FOR TRANSPORTER VEHICLES
-- Migration Date: 2026-10-24
-- Description:
-- 1. Alters vehicles.status default value to 'pending'.
-- 2. Ensures 'pending', 'rejected', and 'approved' are valid status values.
-- 3. Sets is_verified DEFAULT FALSE so newly added vehicles do not go live automatically.
-- 4. Excludes pending / unverified vehicles from public customer search results.
-- ==============================================================================

-- 1. Safely add 'pending', 'rejected', and 'approved' values to vehicle_status_enum if not present
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_status_enum') THEN
    BEGIN
      ALTER TYPE vehicle_status_enum ADD VALUE IF NOT EXISTS 'pending';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER TYPE vehicle_status_enum ADD VALUE IF NOT EXISTS 'rejected';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER TYPE vehicle_status_enum ADD VALUE IF NOT EXISTS 'approved';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- 2. Alter vehicles table column defaults
ALTER TABLE public.vehicles 
  ALTER COLUMN status SET DEFAULT 'pending',
  ALTER COLUMN is_verified SET DEFAULT FALSE;

-- Optional snake_case compatibility columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'vehicles' 
      AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE public.vehicles ADD COLUMN approval_status VARCHAR(50) DEFAULT 'pending';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'vehicles' 
      AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE public.vehicles ADD COLUMN rejection_reason TEXT;
  END IF;
END $$;

-- 3. Row-Level Security Policy for Customer Public Search:
-- Only vehicles where is_verified = TRUE and status IN ('available', 'approved') can be queried publicly.
DROP POLICY IF EXISTS "Public can view verified available vehicles" ON public.vehicles;
CREATE POLICY "Public can view verified available vehicles" ON public.vehicles
  FOR SELECT
  USING (
    is_verified = TRUE 
    AND status IN ('available', 'approved')
    AND status NOT IN ('pending', 'rejected')
  );

-- Transporters can view and monitor all their own vehicles including pending
DROP POLICY IF EXISTS "Transporters can view all their own fleet" ON public.vehicles;
CREATE POLICY "Transporters can view all their own fleet" ON public.vehicles
  FOR SELECT
  USING (
    auth.uid() = owner_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE public.profiles.id = public.vehicles.owner_id 
      AND public.profiles.user_id = auth.uid()
    )
  );
