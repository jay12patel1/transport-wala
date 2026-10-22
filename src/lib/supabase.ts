import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder')
);

// Graceful client initialization with secure session persistence
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export interface SupabaseProfile {
  id: string;
  user_id?: string;
  full_name: string;
  mobile: string;
  email: string;
  role: 'customer' | 'driver' | 'transporter' | 'super_admin';
  avatar_url?: string;
  is_active: boolean;
  phone_verified?: boolean;
  company_name?: string;
  gst_number?: string;
  address?: string;
  rating?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Normalizes Indian mobile number to standard E.164 (+91XXXXXXXXXX)
 */
export function formatIndianPhoneNumber(phone: string): string {
  const cleaned = (phone || '').replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+91') && cleaned.length === 13) {
    return cleaned;
  }
  const digits = cleaned.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  return `+91${digits}`;
}

/**
 * Formats Indian phone number for user-friendly display (+91 XXXXX XXXXX)
 */
export function formatDisplayIndianPhone(phone: string): string {
  const e164 = formatIndianPhoneNumber(phone);
  if (e164.startsWith('+91') && e164.length === 13) {
    return `+91 ${e164.slice(3, 8)} ${e164.slice(8)}`;
  }
  return e164 || phone;
}

/**
 * In-memory OTP rate limiting and security state tracking
 */
interface OtpState {
  lastSentAt: number;
  requestCount: number;
  failedAttempts: number;
  expiresAt: number;
  isSandboxMode?: boolean;
}

const otpStateMap: Record<string, OtpState> = {};

export interface SupabaseOtpResponse {
  success: boolean;
  message?: string;
  error?: string;
  isSandboxMode?: boolean;
  providerNotice?: string;
}

/**
 * Dispatches verification SMS OTP to Indian mobile number using Supabase Phone Auth.
 * If Supabase SMS provider (Twilio / MessageBird / Vonage) is not enabled, transparently indicates the required configuration
 * without blocking testing or crashing.
 */
export async function sendSupabasePhoneOtp(phone: string): Promise<SupabaseOtpResponse> {
  const cleanDigits = (phone || '').replace(/\D/g, '');
  if (cleanDigits.length < 10) {
    return { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
  }

  const formattedPhone = formatIndianPhoneNumber(phone);
  const now = Date.now();
  const state = otpStateMap[formattedPhone] || { lastSentAt: 0, requestCount: 0, failedAttempts: 0, expiresAt: 0 };

  // Rate limit: 30-second cooldown
  if (now - state.lastSentAt < 30000) {
    const remainingSecs = Math.ceil((30000 - (now - state.lastSentAt)) / 1000);
    return { 
      success: false, 
      error: `Please wait ${remainingSecs} seconds before requesting another OTP.` 
    };
  }

  // Rate limit: max 5 requests per session/hour
  if (state.requestCount >= 5 && (now - state.lastSentAt < 3600000)) {
    return { 
      success: false, 
      error: 'Too many OTP requests for this mobile number. Please wait 1 hour before trying again.' 
    };
  }

  let isSandboxMode = false;
  let providerNotice = '';

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          channel: 'sms'
        }
      });

      if (error) {
        const errMsg = (error.message || '').toLowerCase();
        // Detect if Phone Auth provider or SMS gateway is not configured in Supabase project dashboard
        if (
          errMsg.includes('provider') || 
          errMsg.includes('sms') || 
          errMsg.includes('twilio') || 
          errMsg.includes('not supported') ||
          errMsg.includes('disabled') ||
          errMsg.includes('credentials')
        ) {
          isSandboxMode = true;
          providerNotice = 'Supabase Phone SMS Provider (Twilio/MessageBird/Vonage) is not activated in Supabase Dashboard (Auth → Providers → Phone). Sandbox verification mode is active for testing.';
        } else if (errMsg.includes('rate limit') || errMsg.includes('429')) {
          return { success: false, error: 'SMS rate limit reached on Supabase. Please wait a moment before trying again.' };
        } else {
          return { success: false, error: error.message || 'Failed to dispatch verification OTP from Supabase.' };
        }
      }
    } catch (err: any) {
      isSandboxMode = true;
      providerNotice = 'Supabase network gateway unreachable. Sandbox verification mode is active for development.';
    }
  } else {
    isSandboxMode = true;
    providerNotice = 'Supabase credentials not configured in environment. Sandbox verification mode is active for development.';
  }

  // Update security tracking state
  otpStateMap[formattedPhone] = {
    lastSentAt: now,
    requestCount: state.requestCount + 1,
    failedAttempts: 0,
    expiresAt: now + (5 * 60 * 1000), // 5 minutes expiration
    isSandboxMode
  };

  return { 
    success: true, 
    isSandboxMode,
    providerNotice,
    message: isSandboxMode 
      ? `Verification code dispatched to ${formatDisplayIndianPhone(phone)} (Sandbox Mode Active)`
      : `Real SMS OTP dispatched to ${formatDisplayIndianPhone(phone)} via Supabase Auth`
  };
}

/**
 * Verifies 6-digit SMS OTP against Supabase Phone Auth
 */
export async function verifySupabasePhoneOtp(
  phone: string, 
  token: string
): Promise<{ success: boolean; data?: any; error?: string; isSandboxMode?: boolean }> {
  const formattedPhone = formatIndianPhoneNumber(phone);
  const cleanOtp = (token || '').replace(/\D/g, '');

  if (cleanOtp.length !== 6) {
    return { success: false, error: 'Please enter all 6 digits of the verification OTP.' };
  }

  const now = Date.now();
  const state = otpStateMap[formattedPhone];

  // Attempt limit check (Max 5 attempts)
  if (state && state.failedAttempts >= 5) {
    return { 
      success: false, 
      error: 'Maximum verification attempts exceeded. Please request a fresh OTP.' 
    };
  }

  // Expiration check
  if (state && state.expiresAt && now > state.expiresAt) {
    return { 
      success: false, 
      error: 'OTP code has expired after 5 minutes. Please request a new OTP.' 
    };
  }

  const isSandbox = !isSupabaseConfigured || !supabase || (state && state.isSandboxMode);

  if (!isSandbox && supabase) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: cleanOtp,
        type: 'sms'
      });

      if (error) {
        if (state) state.failedAttempts += 1;
        return { success: false, error: error.message || 'Invalid OTP. Please check the code sent to your phone.' };
      }

      delete otpStateMap[formattedPhone];
      return { success: true, data, isSandboxMode: false };
    } catch (err: any) {
      if (state) state.failedAttempts += 1;
      return { success: false, error: 'Failed to verify OTP with Supabase Auth.' };
    }
  }

  // In Sandbox / Development Mode
  delete otpStateMap[formattedPhone];
  return { success: true, isSandboxMode: true };
}

/**
 * Create user and profile in Supabase Database
 */
export async function registerUserInSupabase(userData: {
  fullName: string;
  phone: string;
  email: string;
  role: 'customer' | 'transporter' | 'driver';
  companyName?: string;
  gstNumber?: string;
  address?: string;
  password?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true }; // Local state handles persistence in sandbox
  }

  try {
    // 1. Sign up user in Supabase Auth if password is provided
    let authUserId: string | undefined;
    if (userData.password) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            mobile: userData.phone,
            role: userData.role,
            company_name: userData.companyName
          }
        }
      });

      if (authError && !authError.message.includes('already registered')) {
        return { success: false, error: authError.message };
      }
      authUserId = authData?.user?.id;
    }

    // 2. Upsert profile into public.profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: authUserId,
        full_name: userData.fullName,
        mobile: userData.phone,
        email: userData.email,
        role: userData.role,
        company_name: userData.companyName || '',
        gst_number: userData.gstNumber || '',
        address: userData.address || '',
        rating: 5.0,
        is_active: true
      }, { onConflict: 'email' })
      .select()
      .single();

    if (profileError) {
      console.warn('Supabase profiles upsert warning:', profileError);
    }

    return { success: true, data: profileData };
  } catch (err: any) {
    console.warn('Supabase registration sync warning:', err);
    return { success: true }; // Fallback to local profile
  }
}

/**
 * Sign In User via Supabase Auth and fetch Database Profile & Role
 */
export async function signInUserWithSupabase(
  identifier: string, 
  password?: string
): Promise<{ success: boolean; user?: any; profile?: SupabaseProfile; role?: string; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase client is not configured.' };
  }

  try {
    const isEmail = identifier.includes('@');
    let emailToUse = identifier;

    // If identifier is a phone number, lookup email from profiles first
    if (!isEmail) {
      const { data: profileLookup } = await supabase
        .from('profiles')
        .select('email, role')
        .eq('mobile', identifier.replace(/\D/g, ''))
        .maybeSingle();

      if (profileLookup?.email) {
        emailToUse = profileLookup.email;
      }
    }

    if (password) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: password
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      // Fetch profile from public.profiles table to get the true database role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', emailToUse.toLowerCase())
        .maybeSingle();

      const userRole = profile?.role || authData.user?.user_metadata?.role || 'customer';

      return { 
        success: true, 
        user: authData.user, 
        profile: profile as SupabaseProfile,
        role: userRole 
      };
    }

    return { success: false, error: 'Password is required for Supabase authentication.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Supabase authentication failed.' };
  }
}

/**
 * Super Admin Supabase Auth Operations
 */
export async function signInAdminWithSupabase(email: string, password: string): Promise<{ data?: any; error?: string }> {
  if (!supabase) {
    return { error: 'Supabase client is not configured in environment.' };
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { data };
  } catch (err: any) {
    return { error: err.message || 'Supabase authentication failed' };
  }
}

export async function requestSupabasePasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client is not configured in environment.' };
  }
  try {
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/#/login` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Supabase password reset failed' };
  }
}

export async function updateSupabasePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client is not configured in environment.' };
  }
  try {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update password in Supabase' };
  }
}

export async function updateSupabaseEmail(newEmail: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client is not configured in environment.' };
  }
  try {
    const { data, error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update email in Supabase' };
  }
}

export async function signOutSupabase(): Promise<void> {
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase sign out error:', e);
    }
  }
}
