import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentVerificationQueue } from './DocumentVerificationQueue';
import { SettlementManager } from './SettlementManager';
import { ComplaintManager } from './ComplaintManager';
import { AdminSettings } from './AdminSettings';
import { AdminUsersDirectory } from './AdminUsersDirectory';
import { AdminBookingsMonitoring } from './AdminBookingsMonitoring';
import { 
  TrendingUp, Users, ShieldCheck, FileText, 
  Wallet, AlertTriangle, Settings, Truck, Navigation, 
  CheckCircle2, DollarSign, Activity 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    screen,
    setScreen,
    vehicles, 
    allBookings, 
    allEarnings, 
    allComplaints, 
    allDrivers,
    registeredUsers,
    adminSettings 
  } = useApp();
  
  const getTabFromScreen = (currentScreen: string): 'overview' | 'users' | 'bookings' | 'documents' | 'settlements' | 'complaints' | 'settings' => {
    if (currentScreen === 'admin_docs' || currentScreen === 'admin_documents') return 'documents';
    if (currentScreen === 'admin_settlements') return 'settlements';
    if (currentScreen === 'admin_complaints') return 'complaints';
    if (currentScreen === 'admin_users') return 'users';
    if (currentScreen === 'admin_bookings') return 'bookings';
    if (currentScreen === 'admin_settings') return 'settings';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'bookings' | 'documents' | 'settlements' | 'complaints' | 'settings'>(() => getTabFromScreen(screen));

  // Keep active tab in sync when header / bottom navigation changes the screen
  useEffect(() => {
    const matchedTab = getTabFromScreen(screen);
    setActiveTab(matchedTab);
  }, [screen]);

  // Synchronize internal tab switches with screen route state without triggering security guards
  const handleTabChange = (tab: 'overview' | 'users' | 'bookings' | 'documents' | 'settlements' | 'complaints' | 'settings') => {
    setActiveTab(tab);
    if (tab === 'documents') setScreen('admin_docs');
    else if (tab === 'settlements') setScreen('admin_settlements');
    else if (tab === 'complaints') setScreen('admin_complaints');
    else if (tab === 'users') setScreen('admin_users');
    else if (tab === 'bookings') setScreen('admin_bookings');
    else if (tab === 'settings') setScreen('admin_settings');
    else setScreen('admin_dashboard');
  };

  // Compute Platform Metrics
  const totalGMV = allBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalCommissionRevenue = allBookings
    .filter(b => b.status === 'completed' || b.status === 'delivered')
    .reduce((sum, b) => sum + b.adminCommissionAmount, 0);

  const pendingDocCount = vehicles.reduce((count, v) => 
    count + v.documents.filter(d => d.status === 'pending').length, 0
  );

  const openComplaintsCount = allComplaints.filter(c => c.status === 'open' || c.status === 'under_review').length;
  const activeTripsCount = allBookings.filter(b => ['trip_started', 'reached_pickup', 'loading_completed', 'in_transit', 'reached_destination'].includes(b.status)).length;

  // Breakdown by Commercial Vehicle Category
  const categoryCounts = vehicles.reduce<Record<string, number>>((acc, v) => {
    acc[v.vehicleType] = (acc[v.vehicleType] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Super Admin Console &amp; Operations Center
            </h1>
            <span className="bg-purple-100 text-purple-800 text-xs font-black px-2.5 py-0.5 rounded-full border border-purple-200 uppercase tracking-wider">
              Root Authority
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Transport Wala Headquarters • Audit users, RTO documents, GPS tracking, platform commission, and driver dispatches.
          </p>
        </div>

        {/* System Health Badge */}
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-2xl text-xs font-bold text-emerald-800">
          <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>Platform Active: 5% Commission &amp; 18% GST Engine Online</span>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex overflow-x-auto gap-2 pb-1 border-b border-slate-200 no-scrollbar">
        <button
          onClick={() => handleTabChange('overview')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition shrink-0 ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Platform Overview
        </button>

        <button
          onClick={() => handleTabChange('users')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition shrink-0 ${
            activeTab === 'users'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" /> Users Directory ({registeredUsers.length + allDrivers.length})
        </button>

        <button
          onClick={() => handleTabChange('bookings')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition shrink-0 ${
            activeTab === 'bookings'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Truck className="w-4 h-4" /> All Bookings &amp; GPS ({allBookings.length})
        </button>

        <button
          onClick={() => handleTabChange('documents')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition shrink-0 ${
            activeTab === 'documents'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" /> Document Queue
          {pendingDocCount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full ml-1">
              {pendingDocCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('settlements')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition shrink-0 ${
            activeTab === 'settlements'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Wallet className="w-4 h-4" /> Settlements &amp; Commission
        </button>

        <button
          onClick={() => handleTabChange('complaints')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition shrink-0 ${
            activeTab === 'complaints'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Complaints &amp; Disputes
          {openComplaintsCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full ml-1">
              {openComplaintsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('settings')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition shrink-0 ${
            activeTab === 'settings'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" /> System Settings
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Master Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
                <span>Total Platform GMV</span>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
                ₹{totalGMV.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                +18.4% month-on-month
              </span>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
                <span>5% Platform Commission</span>
                <Wallet className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-600 mt-2 font-mono">
                ₹{totalCommissionRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
              <span className="text-[11px] text-slate-500 mt-1 block">Retained on completed trips</span>
            </div>

            <div 
              onClick={() => handleTabChange('documents')}
              className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm cursor-pointer hover:border-amber-300 transition"
            >
              <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
                <span>Pending Doc Approvals</span>
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-amber-600 mt-2 font-mono">{pendingDocCount}</p>
              <span className="text-[11px] text-slate-500 mt-1 block">Require RTO verification</span>
            </div>

            <div 
              onClick={() => handleTabChange('bookings')}
              className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 transition"
            >
              <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
                <span>Live In-Transit Trucks</span>
                <Navigation className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-black text-indigo-600 mt-2 font-mono">{activeTripsCount}</p>
              <span className="text-[11px] text-slate-500 mt-1 block">Broadcasting GPS coordinates</span>
            </div>
          </div>

          {/* Fleet Distribution & Capacity Visualizer */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Commercial Fleet Category Distribution</h3>
                  <p className="text-xs text-slate-500">20ft, 30ft, 32ft Containers, Tata 407, Reefer &amp; Tenkor inventory</p>
                </div>
                <span className="font-bold text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-xl">
                  {vehicles.length} Vehicles
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(categoryCounts).map(([cat, count]) => {
                  const numCount = Number(count);
                  const percent = vehicles.length > 0 ? Math.round((numCount / vehicles.length) * 100) : 0;
                  return (
                    <div key={cat} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-800">{cat}</span>
                        <span className="font-bold text-blue-600 font-mono">{count} units</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full" 
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-500 block text-right">{percent}% of fleet</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick System Telemetry */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900">Security &amp; Authorization Telemetry</h3>
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-emerald-950">GST Compliance Engine</span>
                  </div>
                  <span className="text-emerald-700 font-bold">18% Auto Tax</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-2xl border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-blue-950">GPS Polling Frequency</span>
                  </div>
                  <span className="text-blue-700 font-bold">5s Telematics</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-2xl border border-purple-200">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-purple-950">Automated Settlements</span>
                  </div>
                  <span className="text-purple-700 font-bold">Daily Batch</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && <AdminUsersDirectory />}
      {activeTab === 'bookings' && <AdminBookingsMonitoring />}
      {activeTab === 'documents' && <DocumentVerificationQueue />}
      {activeTab === 'settlements' && <SettlementManager />}
      {activeTab === 'complaints' && <ComplaintManager />}
      {activeTab === 'settings' && <AdminSettings />}
    </div>
  );
};
