import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, X, ArrowRight, Lock } from 'lucide-react';

export const SecurityAlertBanner: React.FC = () => {
  const { securityAlert, dismissSecurityAlert, role, user } = useApp();

  if (!securityAlert) return null;

  return (
    <div className="bg-rose-900 text-white px-4 py-3 border-b-2 border-rose-500 shadow-lg animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="p-1.5 bg-rose-800 rounded-lg shrink-0">
            <ShieldAlert className="w-5 h-5 text-rose-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold uppercase tracking-wider text-[11px] bg-rose-950 px-2 py-0.5 rounded text-rose-300">
                Authorization Guard
              </span>
              <span className="font-bold text-white text-sm">{securityAlert.title}</span>
            </div>
            <p className="text-rose-200 mt-0.5">
              {securityAlert.message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span className="text-[11px] text-rose-300 font-mono">
            Redirected to: <strong className="text-white">{securityAlert.redirectedPath}</strong>
          </span>
          <button
            onClick={dismissSecurityAlert}
            className="p-1 hover:bg-rose-800 rounded-lg text-rose-300 hover:text-white transition"
            title="Dismiss security alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
