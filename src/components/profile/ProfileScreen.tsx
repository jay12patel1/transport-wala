import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile, UserRole, Language } from '../../types';
import { 
  User as UserIcon, Building, Phone, Mail, FileText, 
  MapPin, ShieldCheck, Globe, Save, RefreshCw, LogOut, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { formatDisplayIndianPhone } from '../../lib/supabase';

export const ProfileScreen: React.FC = () => {
  const { user, setUser, role, setRole, language, setLanguage, adminSettings, t, showToast, logout, setScreen } = useApp();

  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone);
  const [companyName, setCompanyName] = useState(user.companyName);
  const [email, setEmail] = useState(user.email);
  const [gstNumber, setGstNumber] = useState(user.gstNumber);
  const [address, setAddress] = useState(user.address);

  const isPhoneVerified = Boolean(user.phone_verified || user.phoneVerified || user.isVerified);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUser(prev => ({
      ...prev,
      fullName,
      phone,
      companyName,
      email,
      gstNumber,
      address
    }));
    showToast('Profile credentials updated successfully.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Profile Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 border-2 border-blue-400/40 flex items-center justify-center text-white text-2xl font-black shadow-lg">
            {user.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{user.fullName}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                {role}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">{user.companyName} • {formatDisplayIndianPhone(user.phone)}</p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-2 flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-blue-400 ml-1.5" />
          <div className="flex gap-1">
            {[
              { code: 'en', label: 'English' },
              { code: 'gu', label: 'ગુજરાતી' },
              { code: 'hi', label: 'हिन्दी' }
            ].map(lang => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as Language);
                  showToast(`Language set to ${lang.label}`);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                  language === lang.code ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Verified Mobile Number Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
              Mobile Number
            </span>
            <strong className="text-base sm:text-lg font-black text-slate-900 font-mono">
              {formatDisplayIndianPhone(user.phone)}
            </strong>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isPhoneVerified ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ✓ Mobile Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Verification Pending
            </span>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <UserIcon className="w-5 h-5 text-blue-600" />
          <h3 className="font-extrabold text-sm text-slate-900">Commercial Account Profile & GST Details</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Registered Mobile Number (Verified)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Business / Firm / Enterprise Name</label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">GSTIN Number (Optional)</label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                placeholder="24AAACP1234F1Z8"
                className="w-full uppercase font-mono bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Commercial Billing Address</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Plot No. 44, GIDC Sanand, Ahmedabad"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              logout();
              setScreen('login');
            }}
            className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold flex items-center justify-center gap-1.5 transition text-xs shadow-xs"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Sign Out / Logout</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-1.5 transition text-xs"
          >
            <Save className="w-4 h-4" /> Save Profile Details
          </button>
        </div>
      </form>

      {/* Developer and Support Credentials Card */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-slate-700">
        <div>
          <span className="font-extrabold text-slate-900 text-sm block">
            {adminSettings.appName} v2.4 Enterprise
          </span>
          <p className="mt-1">
            Commercial Transport Management & Fleet Telematics Platform.
          </p>
          <p className="mt-0.5 text-slate-500">
            Developed & Engineered with precision by <strong>{adminSettings.developerName}</strong> ({adminSettings.contactNumber}).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono bg-white px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-700">
            All India Freight Protocol
          </span>
        </div>
      </div>
    </div>
  );
};
