-- ==============================================================================
-- TRANSPORT WALA - SUPABASE / POSTGRESQL PRODUCTION DATABASE SCHEMA & RLS POLICIES
-- Multi-Role Commercial Vehicle Booking & Fleet Management Platform
-- Supported Roles: 'customer', 'transporter', 'driver', 'super_admin'
-- Contact: 9725506630 | Developer: Jayesh Patel
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Custom ENUM Types
CREATE TYPE user_role_enum AS ENUM ('customer', 'transporter', 'driver', 'super_admin');
CREATE TYPE vehicle_status_enum AS ENUM ('available', 'booked', 'on_trip', 'maintenance', 'inactive', 'pending', 'rejected', 'approved');
CREATE TYPE doc_type_enum AS ENUM ('RC', 'Insurance', 'Fitness', 'Permit', 'PUC', 'GST', 'Other');
CREATE TYPE doc_status_enum AS ENUM ('pending', 'verified', 'rejected', 'expired');
CREATE TYPE order_status_enum AS ENUM (
  'requested', 'accepted', 'rejected', 'assigned', 
  'trip_started', 'reached_pickup', 'loading_completed', 
  'in_transit', 'reached_destination', 'delivered', 
  'completed', 'cancelled'
);
CREATE TYPE payment_status_enum AS ENUM ('pending', 'initiated', 'paid', 'partially_paid', 'failed', 'refunded', 'cash');
CREATE TYPE settlement_status_enum AS ENUM ('pending', 'approved', 'processing', 'paid', 'failed');
CREATE TYPE complaint_status_enum AS ENUM ('open', 'under_review', 'resolved', 'closed');

-- ==============================================================================
-- 3. PROFILES TABLE (Linked with auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  mobile VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  role user_role_enum NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  company_name VARCHAR(200),
  gst_number VARCHAR(20),
  address TEXT,
  rating NUMERIC(3, 2) DEFAULT 5.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on user_id, email, mobile for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_mobile ON public.profiles(mobile);

-- ==============================================================================
-- 4. VEHICLES TABLE (Owned by Transporters)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  transporter_name VARCHAR(200) NOT NULL,
  transporter_phone VARCHAR(20) NOT NULL,
  vehicle_number VARCHAR(30) NOT NULL UNIQUE,
  vehicle_type VARCHAR(100) NOT NULL, -- e.g. 20 ft Container, 32 ft Container, Tata 407, Reefer, Trailer
  vehicle_category VARCHAR(100) NOT NULL,
  vehicle_size VARCHAR(100),
  capacity_kg NUMERIC(10, 2) NOT NULL,
  capacity_ton NUMERIC(6, 2) NOT NULL,
  current_location VARCHAR(150) NOT NULL,
  preferred_route VARCHAR(200),
  available_from_date DATE DEFAULT CURRENT_DATE,
  is_refrigerated BOOLEAN DEFAULT FALSE,
  status vehicle_status_enum DEFAULT 'pending',
  base_fare NUMERIC(12, 2) NOT NULL,
  per_km_rate NUMERIC(8, 2) DEFAULT 50.00,
  driver_name VARCHAR(150),
  driver_phone VARCHAR(20),
  image_url TEXT,
  description TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. VEHICLE DOCUMENTS TABLE (RC, Insurance, Fitness, Permit, PUC)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.vehicle_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doc_type doc_type_enum NOT NULL,
  doc_number VARCHAR(100) NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  status doc_status_enum DEFAULT 'pending',
  rejection_reason TEXT,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. DRIVERS TABLE (Managed by Transporters)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(150),
  license_number VARCHAR(50) NOT NULL UNIQUE,
  experience_years INT DEFAULT 5,
  assigned_vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  status VARCHAR(30) DEFAULT 'active',
  rating NUMERIC(3, 2) DEFAULT 5.00,
  joined_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. BOOKINGS & ORDERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id VARCHAR(50) PRIMARY KEY, -- e.g. ORD-2026-000123
  customer_id UUID NOT NULL REFERENCES public.profiles(id),
  customer_name VARCHAR(150) NOT NULL,
  customer_company VARCHAR(200),
  customer_phone VARCHAR(20) NOT NULL,
  transporter_id UUID NOT NULL REFERENCES public.profiles(id),
  transporter_name VARCHAR(200) NOT NULL,
  transporter_phone VARCHAR(20) NOT NULL,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id),
  vehicle_type VARCHAR(100) NOT NULL,
  vehicle_number VARCHAR(30) NOT NULL,
  driver_id UUID REFERENCES public.drivers(id),
  driver_name VARCHAR(150),
  driver_phone VARCHAR(20),
  pickup_location TEXT NOT NULL,
  delivery_location TEXT NOT NULL,
  pickup_date DATE NOT NULL,
  required_capacity_ton NUMERIC(6, 2),
  is_refrigerated_req BOOLEAN DEFAULT FALSE,
  base_fare NUMERIC(12, 2) NOT NULL,
  loading_charges NUMERIC(10, 2) DEFAULT 0,
  unloading_charges NUMERIC(10, 2) DEFAULT 0,
  toll_charges NUMERIC(10, 2) DEFAULT 0,
  other_charges NUMERIC(10, 2) DEFAULT 0,
  gst_amount NUMERIC(10, 2) NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  admin_commission_amount NUMERIC(10, 2) NOT NULL,
  transporter_payable_amount NUMERIC(12, 2) NOT NULL,
  payment_status payment_status_enum DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT 'online',
  payment_txn_id VARCHAR(100),
  status order_status_enum DEFAULT 'requested',
  notes TEXT,
  gps_lat NUMERIC(10, 6) DEFAULT 23.0225,
  gps_lng NUMERIC(10, 6) DEFAULT 72.5714,
  gps_speed_km INT DEFAULT 0,
  gps_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. ORDER EVENTS / MILESTONE AUDIT LOG
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.order_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id VARCHAR(50) NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  status order_status_enum NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  location VARCHAR(150),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. CHAT MESSAGES TABLE (Booking-specific communication)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id VARCHAR(50) NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  sender_name VARCHAR(150) NOT NULL,
  sender_role user_role_enum NOT NULL,
  content TEXT NOT NULL,
  message_type VARCHAR(30) DEFAULT 'text',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 10. NOTIFICATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'general',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 11. COMPLAINTS & DISPUTES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.complaints (
  id VARCHAR(50) PRIMARY KEY,
  booking_id VARCHAR(50) REFERENCES public.bookings(id),
  order_id VARCHAR(50),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  user_name VARCHAR(150) NOT NULL,
  user_role user_role_enum NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  status complaint_status_enum DEFAULT 'open',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ==============================================================================
-- 12. TRANSPORTER EARNINGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.transporter_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id VARCHAR(50) NOT NULL REFERENCES public.bookings(id),
  order_id VARCHAR(50) NOT NULL,
  gross_amount NUMERIC(12, 2) NOT NULL,
  commission_deducted NUMERIC(10, 2) NOT NULL,
  net_earnings NUMERIC(12, 2) NOT NULL,
  status VARCHAR(30) DEFAULT 'pending_settlement',
  settlement_id VARCHAR(50),
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 13. SETTLEMENTS & PAYOUTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.settlements (
  id VARCHAR(50) PRIMARY KEY,
  transporter_id UUID NOT NULL REFERENCES public.profiles(id),
  transporter_name VARCHAR(200) NOT NULL,
  earning_ids TEXT[] NOT NULL,
  order_ids TEXT[] NOT NULL,
  total_gross_amount NUMERIC(12, 2) NOT NULL,
  total_commission NUMERIC(10, 2) NOT NULL,
  net_payable_amount NUMERIC(12, 2) NOT NULL,
  payment_reference VARCHAR(100) NOT NULL,
  status settlement_status_enum DEFAULT 'paid',
  settled_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 14. ADMIN SETTINGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id INT PRIMARY KEY DEFAULT 1,
  commission_percentage NUMERIC(5, 2) DEFAULT 5.00,
  gst_percentage NUMERIC(5, 2) DEFAULT 18.00,
  cancellation_fee_percentage NUMERIC(5, 2) DEFAULT 2.00,
  minimum_booking_amount NUMERIC(10, 2) DEFAULT 2500.00,
  loading_charge_default NUMERIC(10, 2) DEFAULT 800.00,
  unloading_charge_default NUMERIC(10, 2) DEFAULT 800.00,
  toll_charge_estimated NUMERIC(10, 2) DEFAULT 1200.00,
  app_contact_number VARCHAR(30) DEFAULT '9725506630',
  app_developer VARCHAR(100) DEFAULT 'Jayesh Patel',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 15. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transporter_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to extract user role from profiles using auth.uid()
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS user_role_enum AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- A. PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- Users can read their own profile; Super Admins can read all profiles
CREATE POLICY "Users read own profile" 
  ON public.profiles FOR SELECT 
  USING (user_id = auth.uid() OR id = auth.uid() OR public.get_auth_role() = 'super_admin');

-- Users can update their own profile fields, but CANNOT elevate their role
CREATE POLICY "Users update own profile (no role escalation)" 
  ON public.profiles FOR UPDATE 
  USING (user_id = auth.uid() OR id = auth.uid())
  WITH CHECK (
    (user_id = auth.uid() OR id = auth.uid()) AND
    (role = (SELECT role FROM public.profiles WHERE id = auth.uid() OR user_id = auth.uid()))
  );

-- Super Admin has full management over all profiles
CREATE POLICY "Super Admins manage all profiles"
  ON public.profiles FOR ALL
  USING (public.get_auth_role() = 'super_admin');

-- Public insert policy for signup (only customer, transporter, driver)
CREATE POLICY "Public signup allowed for standard roles"
  ON public.profiles FOR INSERT
  WITH CHECK (role IN ('customer', 'transporter', 'driver'));

-- ------------------------------------------------------------------------------
-- B. VEHICLES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Public & customers view available verified vehicles"
  ON public.vehicles FOR SELECT
  USING (
    (status = 'available' AND is_verified = TRUE)
    OR (owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid()))
    OR (public.get_auth_role() = 'super_admin')
  );

CREATE POLICY "Transporters insert and edit own vehicles"
  ON public.vehicles FOR ALL
  USING (
    owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid())
    OR public.get_auth_role() = 'super_admin'
  );

-- ------------------------------------------------------------------------------
-- C. VEHICLE DOCUMENTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Transporters view own vehicle docs"
  ON public.vehicle_documents FOR SELECT
  USING (
    owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid())
    OR public.get_auth_role() = 'super_admin'
  );

CREATE POLICY "Transporters upload own vehicle docs"
  ON public.vehicle_documents FOR INSERT
  WITH CHECK (owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid()));

CREATE POLICY "Super Admin verify docs"
  ON public.vehicle_documents FOR UPDATE
  USING (public.get_auth_role() = 'super_admin');

-- ------------------------------------------------------------------------------
-- D. DRIVERS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Transporters manage own drivers"
  ON public.drivers FOR ALL
  USING (
    transporter_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid())
    OR profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid())
    OR public.get_auth_role() = 'super_admin'
  );

-- ------------------------------------------------------------------------------
-- E. BOOKINGS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Role-isolated bookings select"
  ON public.bookings FOR SELECT
  USING (
    customer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid())
    OR transporter_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid())
    OR driver_id IN (SELECT id FROM public.drivers WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid()))
    OR public.get_auth_role() = 'super_admin'
  );

CREATE POLICY "Customers create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (
    customer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid())
  );

CREATE POLICY "Transporters and drivers update assigned bookings"
  ON public.bookings FOR UPDATE
  USING (
    transporter_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid())
    OR driver_id IN (SELECT id FROM public.drivers WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid()))
    OR public.get_auth_role() = 'super_admin'
  );

-- ------------------------------------------------------------------------------
-- F. CHAT, NOTIFICATIONS, SETTLEMENTS & COMPLAINTS
-- ------------------------------------------------------------------------------
CREATE POLICY "Order participants view and send chat"
  ON public.chat_messages FOR ALL
  USING (
    booking_id IN (
      SELECT id FROM public.bookings 
      WHERE customer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid())
         OR transporter_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid())
    )
    OR public.get_auth_role() = 'super_admin'
  );

CREATE POLICY "Users access own notifications"
  ON public.notifications FOR ALL
  USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid()));

CREATE POLICY "Transporters view own earnings"
  ON public.transporter_earnings FOR SELECT
  USING (
    transporter_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid())
    OR public.get_auth_role() = 'super_admin'
  );

CREATE POLICY "Transporters view own settlements"
  ON public.settlements FOR SELECT
  USING (
    transporter_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid())
    OR public.get_auth_role() = 'super_admin'
  );

CREATE POLICY "Super Admins manage all settlements"
  ON public.settlements FOR ALL
  USING (public.get_auth_role() = 'super_admin');

CREATE POLICY "Users create and view own complaints"
  ON public.complaints FOR SELECT
  USING (
    user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid())
    OR public.get_auth_role() = 'super_admin'
  );

CREATE POLICY "Users insert complaints"
  ON public.complaints FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid()));

CREATE POLICY "Super Admin manage complaints"
  ON public.complaints FOR UPDATE
  USING (public.get_auth_role() = 'super_admin');

CREATE POLICY "Public read admin settings"
  ON public.admin_settings FOR SELECT
  USING (TRUE);

CREATE POLICY "Super admin update admin settings"
  ON public.admin_settings FOR UPDATE
  USING (public.get_auth_role() = 'super_admin');

-- ==============================================================================
-- SCHEMA REPAIR MIGRATION: available_from_date
-- ==============================================================================
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS available_from_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS "availableFromDate" DATE DEFAULT CURRENT_DATE;
NOTIFY pgrst, 'reload schema';

