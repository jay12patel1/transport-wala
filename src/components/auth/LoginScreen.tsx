import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { 
  Truck, ShieldCheck, User, Building2, 
  Lock, ArrowRight, ShieldAlert, 
  Navigation, ArrowLeft, Eye, EyeOff, CheckCircle2, 
  KeyRound, X
} from 'lucide-react';

interface LoginScreenProps {
  initialRole?: UserRole;
  onSwitchToSignup: (roleHint?: UserRole) => void;
  onBackToHome: () => void;
}

interface RoleConfig {
  id: UserRole;
  label: string;
  tabTitle: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  activeTabClass: string;
  activeRingClass: string;
  badgeClass: string;
  buttonClass: string;
  bannerClass: string;
  defaultMobile: string;
  defaultPass: string;
  demoAccountName: string;
}

const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  driver: {
    id: 'driver',
    label: 'Driver Login',
    tabTitle: 'Driver',
    badge: 'In-Cab Commercial Crew',
    description: 'Highway trip progression, live GPS location dispatch, and delivery confirmation.',
    icon: Navigation,
    accentColor: 'text-amber-400',
    activeTabClass: 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 ring-2 ring-amber-400',
    activeRingClass: 'border-amber-500 focus-within:border-amber-400 focus-within:ring-amber-500/20',
    badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-800',
    buttonClass: 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30',
    bannerClass: 'bg-amber-950/40 border-amber-800/60 text-amber-200',
    defaultMobile: '',
    defaultPass: '',
    demoAccountName: 'Commercial Driver'
  },
  transporter: {
    id: 'transporter',
    label: 'Transporter Login',
    tabTitle: 'Transporter',
    badge: 'Fleet Owner & Agency',
    description: 'Manage commercial vehicles, assign drivers, approve booking orders, and track payouts.',
    icon: Building2,
    accentColor: 'text-emerald-400',
    activeTabClass: 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400',
    activeRingClass: 'border-emerald-500 focus-within:border-emerald-400 focus-within:ring-emerald-500/20',
    badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30',
    bannerClass: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200',
    defaultMobile: '',
    defaultPass: '',
    demoAccountName: 'Fleet Owner'
  },
  customer: {
    id: 'customer',
    label: 'Customer Login',
    tabTitle: 'Customer',
    badge: 'Shipper & Cargo Owner',
    description: 'Instant search for 20ft–32ft containers, Tata 407, Reefer vans with real-time GPS tracking.',
    icon: User,
    accentColor: 'text-blue-400',
    activeTabClass: 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400',
    activeRingClass: 'border-blue-500 focus-within:border-blue-400 focus-within:ring-blue-500/20',
    badgeClass: 'bg-blue-950/80 text-blue-300 border-blue-800',
    buttonClass: 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30',
    bannerClass: 'bg-blue-950/40 border-blue-800/60 text-blue-200',
    defaultMobile: '',
    defaultPass: '',
    demoAccountName: 'Cargo Shipper'
  },
  admin: {
    id: 'admin',
    label: 'Super Admin Login',
    tabTitle: 'Super Admin',
    badge: 'Master Control & Audits',
    description: 'Compliance verification, vehicle RC/Insurance audits, dispute resolution, and commission control.',
    icon: ShieldCheck,
    accentColor: 'text-purple-400',
    activeTabClass: 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400',
    activeRingClass: 'border-purple-500 focus-within:border-purple-400 focus-within:ring-purple-500/20',
    badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-800',
    buttonClass: 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30',
    bannerClass: 'bg-purple-950/40 border-purple-800/60 text-purple-200',
    defaultMobile: '',
    defaultPass: '',
    demoAccountName: 'Jayesh Patel (Headquarters Admin)'
  }
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ 
  initialRole = 'customer',
  onSwitchToSignup,
  onBackToHome
}) => {
  const { 
    login, 
    showToast, 
    requestAdminPasswordReset, 
    confirmAdminPasswordReset 
  } = useApp();

  const [activeTab, setActiveTab] = useState<UserRole>(initialRole);
  
  // Mobile & Password Authentication Fields - Start completely blank
  const currentConfig = ROLE_CONFIGS[activeTab];
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Status & Error
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Password Recovery Modal
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmailOrPhone, setForgotEmailOrPhone] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'verify'>('request');
  const [resetCode, setResetCode] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  const handleTabChange = (role: UserRole) => {
    setActiveTab(role);
    setErrorMessage(null);
    setMobileNumber('');
    setPassword('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanDigits = mobileNumber.replace(/\D/g, '');
    if (!cleanDigits) {
      setErrorMessage('Please enter your 10-digit registered mobile number.');
      return;
    }

    if (cleanDigits.length < 10 && !mobileNumber.includes('@')) {
      setErrorMessage('Mobile number must be a valid 10-digit Indian number.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(activeTab, {
        identifier: mobileNumber.trim(),
        phone: cleanDigits,
        password: password.trim()
      });

      if (!res.success) {
        setErrorMessage(res.message || 'Login failed. Please verify mobile number and password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    if (!forgotEmailOrPhone.trim()) {
      setForgotError('Please enter your registered mobile number or email address.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await requestAdminPasswordReset(forgotEmailOrPhone);
      if (res.success) {
        setForgotSuccess(res.message || 'Reset verification token generated successfully.');
        setForgotStep('verify');
      } else {
        setForgotError(res.message || 'Failed to dispatch password recovery instructions.');
      }
    } catch (err: any) {
      setForgotError(err.message || 'Failed to dispatch reset instructions.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (newResetPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }
    if (newResetPassword !== confirmResetPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await confirmAdminPasswordReset(forgotEmailOrPhone, resetCode, newResetPassword);
      if (res.success) {
        setForgotSuccess('Password updated successfully! You can now log in.');
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotStep('request');
          setForgotError(null);
          setForgotSuccess(null);
          setPassword(newResetPassword);
        }, 1200);
      } else {
        setForgotError(res.message || 'Invalid reset token or password update failed.');
      }
    } catch (err: any) {
      setForgotError(err.message || 'Password update failed.');
    } finally {
      setForgotLoading(false);
    }
  };

  const ActiveIcon = currentConfig.icon;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 px-4 py-3 sticky top-0 z-30">
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSwitchToSignup(activeTab !== 'admin' ? activeTab : 'customer')}
              className="text-xs font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-800 transition"
            >
              New here? <span className="text-blue-400 font-extrabold ml-1">Create Account</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-xl mx-auto px-4 py-8 w-full my-auto">
        <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
          
          {/* Header Title */}
          <div className="p-6 sm:p-7 border-b border-slate-800/80 text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Direct Role-Based Authentication
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Sign In to Your Workspace
            </h1>
            <p className="text-xs text-slate-400">
              Enter your registered 10-digit mobile number and password to log in.
            </p>
          </div>

          {/* 1. ROLE-BASED LOGIN TABS (All 4 dedicated roles) */}
          <div className="p-4 sm:p-6 pb-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Select Your Access Role:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['driver', 'transporter', 'customer', 'admin'] as UserRole[]).map((roleKey) => {
                const cfg = ROLE_CONFIGS[roleKey];
                const Icon = cfg.icon;
                const isActive = activeTab === roleKey;
                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => handleTabChange(roleKey)}
                    className={`py-3 px-2 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition text-xs font-bold border ${
                      isActive 
                        ? cfg.activeTabClass 
                        : 'bg-slate-900 hover:bg-slate-800/80 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{cfg.tabTitle}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role Status & Description Bar */}
          <div className="px-6 py-2">
            <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${currentConfig.bannerClass}`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl bg-slate-900/60 border border-slate-700/50 ${currentConfig.accentColor}`}>
                  <ActiveIcon className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-white font-extrabold">{currentConfig.label}</strong>
                  <span className="text-[11px] opacity-80">{currentConfig.description}</span>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 font-bold ${currentConfig.badgeClass}`}>
                {currentConfig.badge}
              </span>
            </div>
          </div>

          {/* 2. SIMPLE MOBILE NUMBER AND PASSWORD AUTHENTICATION */}
          <div className="p-6 pt-3 space-y-4">
            
            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-2xl text-xs text-rose-200 flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} autoComplete="off" className="space-y-4 text-xs">
              
              {/* Input 1: Registered Mobile Number (Accepts 10-digit mobile number) */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Registered Mobile Number <span className="text-rose-400">*</span>
                </label>
                <div className={`flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 transition focus-within:border-blue-500`}>
                  <div className="flex items-center gap-1.5 pr-2.5 border-r border-slate-800 text-slate-400 font-bold text-xs select-none">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    autoComplete="off"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={15}
                    className="w-full bg-transparent pl-3 text-white placeholder:text-slate-600 focus:outline-none font-medium tracking-wide"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {activeTab === 'driver' ? 'Enter your fleet-registered driver mobile number' :
                   activeTab === 'admin' ? 'Super Admin mobile (9725506630) or admin email' :
                   `Enter your 10-digit mobile registered on Transport Wala as a ${currentConfig.tabTitle}`}
                </span>
              </div>

              {/* Input 2: Password with Visibility Toggle */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-slate-300 font-bold">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  {activeTab === 'admin' && (
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-[11px] text-slate-400 hover:text-blue-400 transition"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 transition focus-within:border-blue-500">
                  <Lock className="w-4 h-4 text-slate-500 shrink-0 mr-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="off"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full bg-transparent text-white placeholder:text-slate-600 focus:outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-200 transition p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Direct Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-black text-sm text-white shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50 ${currentConfig.buttonClass}`}
              >
                {loading ? (
                  'Authenticating...'
                ) : (
                  <>
                    <span>Login as {currentConfig.tabTitle}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Don't have an account link */}
            {activeTab !== 'admin' && (
              <div className="text-center pt-2 text-xs text-slate-400">
                Don&apos;t have a {currentConfig.tabTitle} account yet?{' '}
                <button
                  type="button"
                  onClick={() => onSwitchToSignup(activeTab)}
                  className="font-bold text-blue-400 hover:text-blue-300 underline underline-offset-2 ml-1"
                >
                  Register here
                </button>
              </div>
            )}

          </div>

        </div>
      </main>

      {/* Forgot Password Modal (Admin) */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl relative">
            <button 
              onClick={() => {
                setShowForgotPassword(false);
                setForgotStep('request');
                setForgotError(null);
                setForgotSuccess(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-black text-white">Reset Super Admin Password</h3>
              </div>
              <p className="text-xs text-slate-400">
                {forgotStep === 'request'
                  ? 'Enter your registered mobile number (9725506630) or admin email to generate recovery token.'
                  : 'Enter the recovery verification code and configure your new active login password.'}
              </p>
            </div>

            {forgotSuccess && (
              <div className="p-3 bg-emerald-950/70 border border-emerald-800 rounded-2xl text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotError && (
              <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-2xl text-xs text-rose-200 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotStep === 'request' ? (
              <form onSubmit={handleRequestPasswordReset} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Registered Mobile Number or Email
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotEmailOrPhone}
                    onChange={(e) => setForgotEmailOrPhone(e.target.value)}
                    placeholder="9725506630 or support@transportswala.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-md shadow-purple-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {forgotLoading ? 'Processing Request...' : 'Send Recovery Token'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmPasswordReset} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Recovery Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="Enter reset code"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    New Secure Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newResetPassword}
                    onChange={(e) => setNewResetPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmResetPassword}
                    onChange={(e) => setConfirmResetPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotStep('request')}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl font-bold transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md shadow-emerald-600/30 transition disabled:opacity-50"
                  >
                    {forgotLoading ? 'Updating...' : 'Save & Activate Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-3 text-center text-xs text-slate-500">
        Transport Wala • Commercial Vehicle Booking &amp; Fleet Management Platform • Ahmedabad, Gujarat
      </footer>
    </div>
  );
};
