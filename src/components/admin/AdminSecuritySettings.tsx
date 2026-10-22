import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, Lock, Mail, KeyRound, CheckCircle2, 
  AlertCircle, Eye, EyeOff, RefreshCw, LogOut, 
  Database, ShieldAlert, Fingerprint, Sparkles, Check
} from 'lucide-react';

export const AdminSecuritySettings: React.FC = () => {
  const { 
    user, 
    adminSecurityInfo, 
    changeAdminPassword, 
    changeAdminEmail, 
    logout, 
    showToast 
  } = useApp();

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  // Change Email Form State
  const [newEmail, setNewEmail] = useState('');
  const [emailPasswordConfirm, setEmailPasswordConfirm] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  // Password Strength Calculator
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Not set', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1: return { score: 25, label: 'Weak', color: 'bg-rose-500' };
      case 2: return { score: 50, label: 'Fair', color: 'bg-amber-500' };
      case 3: return { score: 75, label: 'Strong', color: 'bg-blue-500' };
      case 4: return { score: 100, label: 'Very Secure', color: 'bg-emerald-500' };
      default: return { score: 10, label: 'Too short', color: 'bg-rose-400' };
    }
  };

  const strength = getPasswordStrength(newPassword);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    setPwdLoading(true);
    try {
      const res = await changeAdminPassword(currentPassword, newPassword);
      if (res.success) {
        setPwdSuccess('Password changed successfully! New credentials are now active for future logins.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwdError(res.message || 'Failed to change password.');
      }
    } catch (err: any) {
      setPwdError(err.message || 'An unexpected error occurred.');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(null);

    if (!newEmail || !newEmail.includes('@')) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    if (newEmail.trim().toLowerCase() === adminSecurityInfo.email.toLowerCase()) {
      setEmailError('New email is the same as your current login email.');
      return;
    }

    setEmailLoading(true);
    try {
      const res = await changeAdminEmail(newEmail, emailPasswordConfirm);
      if (res.success) {
        setEmailSuccess(`Super Admin email updated to ${newEmail}! Use this new email for future logins.`);
        setNewEmail('');
        setEmailPasswordConfirm('');
      } else {
        setEmailError(res.message || 'Failed to update email.');
      }
    } catch (err: any) {
      setEmailError(err.message || 'An unexpected error occurred.');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div id="admin-security-settings-panel" className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 p-2.5 rounded-2xl">
        <span className="text-slate-900 font-bold">Admin Dashboard</span>
        <span>→</span>
        <span className="text-slate-900 font-bold">Settings</span>
        <span>→</span>
        <span className="text-purple-700 font-black flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Security
        </span>
      </div>

      {/* Security Engine Status Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                <Fingerprint className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-white">
                Super Admin Security &amp; Credentials Center
              </h3>
              <span className="bg-purple-500/20 text-purple-200 border border-purple-400/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Root Access
              </span>
            </div>
            <p className="text-xs text-purple-200/80 max-w-2xl">
              Owner credentials are securely synchronized with Supabase Auth. Passwords are encrypted and never stored in frontend code or standard profiles tables.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shrink-0 text-xs">
            <div className="text-right">
              <span className="text-[10px] text-purple-200 uppercase font-bold block">Auth Provider</span>
              <span className="font-extrabold text-white">
                {adminSecurityInfo.isSupabaseConnected ? 'Supabase Auth (Cloud Engine)' : 'Local Secure Session Engine'}
              </span>
            </div>
            <div className={`w-3 h-3 rounded-full ${adminSecurityInfo.isSupabaseConnected ? 'bg-emerald-400 animate-ping' : 'bg-blue-400'}`} />
          </div>
        </div>

        {/* Quick Identity Overview */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-[10px] text-purple-300 font-semibold block">Active Super Admin Email</span>
            <span className="font-mono font-bold text-white text-sm">{adminSecurityInfo.email}</span>
          </div>
          <div>
            <span className="text-[10px] text-purple-300 font-semibold block">Last Credential Update</span>
            <span className="font-mono font-bold text-white text-sm">
              {new Date(adminSecurityInfo.lastPasswordChange).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-purple-300 font-semibold block">Owner Account</span>
            <span className="font-bold text-white text-sm">Jayesh Patel (Headquarters)</span>
          </div>
        </div>
      </div>

      {/* Forms Grid: Change Password & Change Email */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 1: CHANGE PASSWORD */}
        <div id="change-password-card" className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Change Password</h4>
                  <p className="text-[11px] text-slate-500">Update Super Admin master authentication passkey</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                Supabase Auth
              </span>
            </div>

            {pwdSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{pwdSuccess}</span>
              </div>
            )}

            {pwdError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-800 font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{pwdError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Current Super Admin Password <span className="text-slate-400 font-normal">(if previously set)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-mono text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Secure Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters (recommended: 8+ with special char)"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-mono text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-none transition"
                />

                {/* Password Strength Meter */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>Strength: {strength.label}</span>
                      <span>{strength.score}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-mono text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-none transition"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="w-full py-3 bg-purple-700 hover:bg-purple-800 active:scale-[0.99] text-white font-extrabold rounded-2xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {pwdLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Updating Password in Supabase Auth...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Apply New Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>New credentials take effect immediately across all sessions.</span>
          </div>
        </div>

        {/* SECTION 2: CHANGE LOGIN EMAIL */}
        <div id="change-email-card" className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Change Login Email</h4>
                  <p className="text-[11px] text-slate-500">Update Super Admin primary identifier &amp; notification inbox</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                Primary ID
              </span>
            </div>

            {emailSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{emailSuccess}</span>
              </div>
            )}

            {emailError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-800 font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{emailError}</span>
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Active Admin Email</label>
                <div className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 font-mono text-slate-600 flex items-center justify-between">
                  <span>{adminSecurityInfo.email}</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Super Admin Login Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. jay12patel1@gmail.com or support@transportswala.com"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-mono text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Forgot password recovery links and critical platform alerts will be sent here.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Confirm Admin Password <span className="text-slate-400 font-normal">(Required for security)</span>
                </label>
                <input
                  type="password"
                  value={emailPasswordConfirm}
                  onChange={(e) => setEmailPasswordConfirm(e.target.value)}
                  placeholder="Enter your current password to verify identity"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-mono text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {emailLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Updating Login Email in Supabase Auth...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Update Super Admin Email
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400">
            <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Immediately updates the registered admin profile and session identity.</span>
          </div>
        </div>
      </div>

      {/* SECTION 3: SESSION TERMINATION & SECURITY AUDIT */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            Secure Session Management
          </h4>
          <p className="text-xs text-slate-500">
            Terminating the Super Admin session purges all cached authorization tokens and returns to the public landing page.
          </p>
        </div>

        <button
          onClick={logout}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold rounded-2xl shadow-md shadow-rose-600/20 flex items-center gap-2 text-xs transition"
        >
          <LogOut className="w-4 h-4" />
          End Super Admin Session
        </button>
      </div>
    </div>
  );
};
