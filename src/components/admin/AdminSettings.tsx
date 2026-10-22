import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminSecuritySettings } from './AdminSecuritySettings';
import { 
  Settings, ShieldCheck, DollarSign, Percent, 
  Phone, User, Save, RefreshCw, Lock, Sparkles 
} from 'lucide-react';

interface AdminSettingsProps {
  defaultSection?: 'security' | 'financial' | 'branding';
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ defaultSection = 'security' }) => {
  const { adminSettings, updateAdminSettings, showToast } = useApp();
  const [activeSection, setActiveSection] = useState<'security' | 'financial' | 'branding'>(defaultSection);
  const [settings, setSettings] = useState(adminSettings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdminSettings(settings);
    showToast('Platform operational settings saved.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600" />
            Platform Configuration &amp; Settings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage Super Admin security credentials, financial rates, GST parameters, and platform branding.
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveSection('security')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeSection === 'security'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Security &amp; Auth
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('financial')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeSection === 'financial'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Financial Rates
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('branding')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeSection === 'branding'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Branding
          </button>
        </div>
      </div>

      {/* Render Active Section */}
      {activeSection === 'security' && (
        <AdminSecuritySettings />
      )}

      {activeSection === 'financial' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Financial & Commission Parameters */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <h3 className="font-extrabold text-sm text-slate-900">Financial Rates &amp; Commission Parameters</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Platform Commission Rate (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={settings.commissionPercentage}
                    onChange={(e) => setSettings(s => ({ ...s, commissionPercentage: Number(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 font-bold">%</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Deducted on trip completion (Default 5%)</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Goods &amp; Services Tax (GST %)</label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={28}
                    value={settings.gstPercentage}
                    onChange={(e) => setSettings(s => ({ ...s, gstPercentage: Number(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 font-bold">%</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Standard commercial transport GST (18%)</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Loading Assistance Base (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={settings.loadingChargeDefault}
                  onChange={(e) => setSettings(s => ({ ...s, loadingChargeDefault: Number(e.target.value) }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Default crew loading fee</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">National Toll / FASTag (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={settings.tollChargeEstimated}
                  onChange={(e) => setSettings(s => ({ ...s, tollChargeEstimated: Number(e.target.value) }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Estimated highway toll transit</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition text-xs sm:text-sm"
            >
              <Save className="w-4 h-4" /> Save Financial Settings
            </button>
          </div>
        </form>
      )}

      {activeSection === 'branding' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-sm text-slate-900">App Branding &amp; Official Ownership</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lead Developer / Headquarters Credit</label>
                <input
                  type="text"
                  value={settings.appDeveloper}
                  onChange={(e) => setSettings(s => ({ ...s, appDeveloper: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Support Helpline</label>
                <input
                  type="text"
                  value={settings.appContactNumber}
                  onChange={(e) => setSettings(s => ({ ...s, appContactNumber: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail || 'support@transportswala.com'}
                  onChange={(e) => setSettings(s => ({ ...s, supportEmail: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-lg shadow-slate-900/25 flex items-center gap-2 transition text-xs sm:text-sm"
            >
              <Save className="w-4 h-4" /> Save Branding Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

