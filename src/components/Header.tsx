import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';
import { 
  Truck, Bell, Globe, User, Shield, Info, 
  Menu, X, CheckCircle2, ChevronDown, Phone, LogOut 
} from 'lucide-react';
import { AboutModal } from './shared/AboutModal';

interface HeaderProps {
  onOpenAbout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAbout }) => {
  const { 
    user, role, screen, setScreen, language, setLanguage, 
    notifications, unreadNotificationCount, markAllNotificationsRead, t, logout 
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'gu', label: 'ગુજરાતી' },
    { code: 'hi', label: 'हिन्दी' }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Tagline */}
          <div 
            onClick={() => {
              if (role === 'customer') setScreen('home');
              else if (role === 'transporter') setScreen('transporter_dashboard');
              else if (role === 'driver') setScreen('driver_mode');
              else if (role === 'admin') setScreen('admin_dashboard');
            }}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 group-hover:bg-blue-700 text-white flex items-center justify-center font-black text-xl shadow-md transition transform group-hover:scale-105">
              TW
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Transport Wala
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {role}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Commercial Logistics & Vehicle Booking
              </p>
            </div>
          </div>

          {/* Desktop Navigation / Quick Links based on Role */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
            {role === 'customer' && (
              <>
                <button 
                  onClick={() => setScreen('home')}
                  className={`px-3 py-2 rounded-lg transition ${screen === 'home' || screen === 'search_results' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100'}`}
                >
                  {t('searchVehicles')}
                </button>
                <button 
                  onClick={() => setScreen('bookings')}
                  className={`px-3 py-2 rounded-lg transition ${screen === 'bookings' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100'}`}
                >
                  {t('navMyBookings')}
                </button>
              </>
            )}

            {role === 'transporter' && (
              <>
                <button 
                  onClick={() => setScreen('transporter_dashboard')}
                  className={`px-3 py-2 rounded-lg transition ${screen === 'transporter_dashboard' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100'}`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => setScreen('my_vehicles')}
                  className={`px-3 py-2 rounded-lg transition ${screen === 'my_vehicles' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100'}`}
                >
                  {t('navMyVehicles')}
                </button>
                <button 
                  onClick={() => setScreen('my_drivers')}
                  className={`px-3 py-2 rounded-lg transition ${screen === 'my_drivers' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100'}`}
                >
                  Fleet Drivers
                </button>
                <button 
                  onClick={() => setScreen('my_documents')}
                  className={`px-3 py-2 rounded-lg transition ${screen === 'my_documents' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100'}`}
                >
                  {t('navDocuments')}
                </button>
                <button 
                  onClick={() => setScreen('earnings')}
                  className={`px-3 py-2 rounded-lg transition ${screen === 'earnings' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100'}`}
                >
                  {t('navEarnings')}
                </button>
              </>
            )}

            {role === 'driver' && (
              <button 
                onClick={() => setScreen('driver_mode')}
                className={`px-3 py-2 rounded-lg transition ${screen === 'driver_mode' ? 'bg-amber-50 text-amber-700 font-bold' : 'hover:bg-slate-100'}`}
              >
                {t('navDriverMode')}
              </button>
            )}

            {role === 'admin' && (
              <>
                <button 
                  onClick={() => setScreen('admin_dashboard')}
                  className={`px-3 py-2 rounded-lg transition ${screen === 'admin_dashboard' ? 'bg-purple-50 text-purple-700 font-bold' : 'hover:bg-slate-100'}`}
                >
                  Analytics & Overview
                </button>
                <button 
                  onClick={() => setScreen('admin_docs')}
                  className={`px-3 py-2 rounded-lg transition ${(screen === 'admin_docs' || screen === 'admin_documents') ? 'bg-purple-50 text-purple-700 font-bold' : 'hover:bg-slate-100'}`}
                >
                  Verify Documents
                </button>
                <button 
                  onClick={() => setScreen('admin_settlements')}
                  className={`px-3 py-2 rounded-lg transition ${screen === 'admin_settlements' ? 'bg-purple-50 text-purple-700 font-bold' : 'hover:bg-slate-100'}`}
                >
                  Settlements
                </button>
                <button 
                  onClick={() => setScreen('admin_complaints')}
                  className={`px-3 py-2 rounded-lg transition ${screen === 'admin_complaints' ? 'bg-purple-50 text-purple-700 font-bold' : 'hover:bg-slate-100'}`}
                >
                  Complaints
                </button>
              </>
            )}
          </nav>

          {/* Right Action Icons: Language, Notifications, About, User Profile */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>{languages.find(l => l.code === language)?.label}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-xl border border-slate-200 py-1 hidden group-hover:block z-50">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-blue-50 ${language === lang.code ? 'font-bold text-blue-600' : 'text-slate-700'}`}
                  >
                    <span>{lang.label}</span>
                    {language === lang.code && <CheckCircle2 className="w-3 h-3 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white animate-pulse">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                  <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-400" />
                      <span className="font-bold text-xs">Notifications</span>
                    </div>
                    {unreadNotificationCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-blue-300 hover:text-white underline font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <p className="p-6 text-center text-xs text-slate-400">No notifications yet.</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-3 text-xs transition ${n.isRead ? 'bg-white' : 'bg-blue-50/60'}`}>
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="font-bold text-slate-900">{n.title}</span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{n.createdAt}</span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">{n.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* About / Developer Credit Button */}
            <button
              onClick={() => setShowAbout(true)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
              title="Support: support@transportswala.com • Helpline: 9725506630"
            >
              <Info className="w-4 h-4 text-slate-600" />
            </button>

            {/* User Profile Pill */}
            <div 
              onClick={() => setScreen('profile')}
              className="flex items-center gap-2 pl-2 cursor-pointer hover:opacity-80 transition"
              title="View & Edit Profile"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 overflow-hidden flex items-center justify-center">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-slate-600" />
                )}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">{user.fullName.split(' ')[0]}</p>
                <p className="text-[10px] text-slate-500 capitalize">{role}</p>
              </div>
            </div>

            {/* Prominent Red-Accented Logout Button */}
            <button
              onClick={() => {
                logout();
                setScreen('login');
              }}
              title="Sign Out / Logout"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition shadow-xs active:scale-95 ml-1"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* About Modal */}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </>
  );
};
