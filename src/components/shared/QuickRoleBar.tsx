import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { User, Truck, Navigation, ShieldCheck, Sparkles, LogOut, KeyRound } from 'lucide-react';

export const QuickRoleBar: React.FC = () => {
  const { role, user, switchUser, logout, isAuthenticated } = useApp();

  const roles: { key: UserRole; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'customer', label: 'Customer', icon: <User className="w-3.5 h-3.5" />, color: 'blue' },
    { key: 'transporter', label: 'Transporter', icon: <Truck className="w-3.5 h-3.5" />, color: 'emerald' },
    { key: 'driver', label: 'Driver', icon: <Navigation className="w-3.5 h-3.5" />, color: 'amber' },
    { key: 'admin', label: 'Super Admin', icon: <ShieldCheck className="w-3.5 h-3.5" />, color: 'purple' },
  ];

  if (!isAuthenticated) return null;

  return (
    <div className="bg-slate-950 border-b border-slate-800 text-white px-3 py-1.5 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] text-slate-400">Authenticated:</span>
            <strong className="text-white text-[11px]">{user.fullName || 'User'}</strong>
            <span className={`text-[10px] font-black uppercase px-2 py-0.2 rounded-md ${
              role === 'customer' ? 'bg-blue-900/80 text-blue-300 border border-blue-700' :
              role === 'transporter' ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700' :
              role === 'driver' ? 'bg-amber-900/80 text-amber-300 border border-amber-700' :
              'bg-purple-900/80 text-purple-300 border border-purple-700'
            }`}>
              {role}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Switch Role:</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {roles.map(r => {
            const isActive = role === r.key;
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => switchUser(r.key)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  isActive 
                    ? 'bg-white text-slate-900 shadow-sm font-bold ring-1 ring-white' 
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                {r.icon}
                <span>{r.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1 px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 rounded-lg text-xs font-semibold transition ml-1"
            title="Log out from current workspace"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
