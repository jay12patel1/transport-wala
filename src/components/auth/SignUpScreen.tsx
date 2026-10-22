import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { 
  Truck, User, Building2, Navigation, 
  ArrowRight, ShieldAlert, CheckCircle2, Lock, 
  Phone, Mail, ArrowLeft, Eye, EyeOff
} from 'lucide-react';

interface SignUpScreenProps {
  initialRole?: UserRole;
  onSwitchToLogin: (roleHint?: UserRole) => void;
  onBackToHome: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ 
  initialRole = 'customer', 
  onSwitchToLogin,
  onBackToHome 
}) => {
  const { register, showToast } = useApp();

  // Public allowed roles (Super Admin explicitly blocked from public signup)
  const [selectedRole, setSelectedRole] = useState<'customer' | 'transporter' | 'driver'>(
    (initialRole === 'admin' ? 'customer' : initialRole) as 'customer' | 'transporter' | 'driver'
  );

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Role-Specific optional fields
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [address, setAddress] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  // Status & Validation
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Direct Account Registration (Strictly Password-Only, No OTP verification)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic Validations
    if (!fullName.trim() || !mobile.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all mandatory fields (Name, Mobile, Email, and Password).');
      return;
    }

    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    // Explicit check to prevent any illegal role parameter injection
    if ((selectedRole as any) === 'admin' || (selectedRole as any) === 'super_admin') {
      setErrorMessage('Security Violation: Super Admin accounts cannot be registered publicly.');
      return;
    }

    setLoading(true);

    try {
      // Save the account immediately without requiring any OTP verification step
      const registerRes = register(selectedRole as UserRole, {
        fullName: fullName.trim(),
        phone: cleanMobile,
        email: email.trim().toLowerCase(),
        companyName: companyName.trim() || (selectedRole === 'driver' ? 'Independent Commercial Driver' : `${fullName.trim()} Logistics`),
        gstNumber: gstNumber.trim().toUpperCase() || undefined,
        address: address.trim() || 'Ahmedabad, Gujarat',
        password
      });

      if (!registerRes.success) {
        setErrorMessage(registerRes.message || 'Registration failed. Please check the information provided.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during account creation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <div className="border-b border-slate-800 bg-slate-950/80 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition mr-1"
              title="Back to Landing Page"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-white block">TRANSPORT WALA</span>
              <span className="text-[10px] text-amber-400 font-semibold">Reliable Transport. Easy Booking.</span>
            </div>
          </div>

          <button
            onClick={() => onSwitchToLogin(selectedRole as UserRole)}
            className="text-xs font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-800 transition"
          >
            Already have an account? <span className="text-blue-400 font-extrabold ml-1">Sign In</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-2xl mx-auto px-4 py-8 w-full my-auto">
        <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
          
          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
              New Account Registration
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Create Your Transport Wala Account
            </h1>
            <p className="text-xs text-slate-400">
              Quick registration with mobile number and password. No OTP verification required.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-2xl flex items-center gap-2.5 text-xs text-rose-200">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Role Selection Tabs */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
              Select Your Role <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              
              {/* Customer */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('customer');
                  setErrorMessage(null);
                }}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  selectedRole === 'customer'
                    ? 'bg-blue-950/70 border-blue-500 ring-2 ring-blue-500/40 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-2">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-xs font-extrabold block text-white">Customer</strong>
                  <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">Book vehicles &amp; loads</span>
                </div>
              </button>

              {/* Transporter */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('transporter');
                  setErrorMessage(null);
                }}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  selectedRole === 'transporter'
                    ? 'bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-500/40 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-2">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-xs font-extrabold block text-white">Transporter</strong>
                  <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">Fleet owner &amp; loads</span>
                </div>
              </button>

              {/* Driver */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('driver');
                  setErrorMessage(null);
                }}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  selectedRole === 'driver'
                    ? 'bg-amber-950/70 border-amber-500 ring-2 ring-amber-500/40 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-2">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-xs font-extrabold block text-white">Driver</strong>
                  <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">Commercial vehicle driver</span>
                </div>
              </button>

            </div>

            <p className="text-[11px] text-slate-500 pt-1">
              🔒 <em>Super Admin accounts are restricted and protected by master security policies.</em>
            </p>
          </div>

          {/* Form Content - Strictly Password-Only Direct Registration */}
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
            
            {/* Full Name & Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Full Legal Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Registered Mobile Number <span className="text-rose-400">*</span>
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-800 bg-slate-900/90 text-slate-400 font-bold text-xs">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full bg-slate-900 border border-slate-800 rounded-r-xl px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-medium tracking-wide"
                  />
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Password (Min. 6 chars) <span className="text-rose-400">*</span>
                </label>
                <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 focus-within:border-blue-500">
                  <Lock className="w-4 h-4 text-slate-500 shrink-0 mr-2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-white placeholder:text-slate-600 focus:outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-200 transition p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Confirm Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 focus-within:border-blue-500">
                  <Lock className="w-4 h-4 text-slate-500 shrink-0 mr-2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-white placeholder:text-slate-600 focus:outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-slate-200 transition p-0.5"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Optional Role Specifics */}
            {selectedRole === 'transporter' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Transport Fleet / Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Gujarat Express Freightways"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    GST Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                    placeholder="24AAACP1234F1Z8"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white uppercase placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {selectedRole === 'driver' && (
              <div className="pt-1 border-t border-slate-800/80">
                <label className="block text-slate-300 font-bold mb-1">
                  Commercial Driving License (DL) Number
                </label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                  placeholder="GJ01-2020-0098765"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white uppercase placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Operating City / Hub Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Narol Transport Hub, Ahmedabad, Gujarat"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Instant Direct Account Creation Notice */}
            <div className="flex items-center gap-2 pt-1 text-slate-400 text-[11px]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Direct registration: your account will be activated immediately upon clicking below.</span>
            </div>

            {/* Direct Create Account Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-black text-sm text-white shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50 ${
                selectedRole === 'customer'
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                  : selectedRole === 'transporter'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                  : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
              }`}
            >
              {loading ? (
                'Creating Your Account...'
              ) : (
                <>
                  <span>Create {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-3 text-center text-xs text-slate-500">
        Transport Wala • Commercial Vehicle Booking &amp; Fleet Management Platform • Ahmedabad, Gujarat
      </footer>
    </div>
  );
};
