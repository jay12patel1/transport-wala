import React from 'react';
import { X, ShieldCheck, Truck, Phone, Mail, User, Code, Heart, Award } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-lg border border-blue-400/30">
              TW
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Transport Wala</h2>
              <p className="text-xs text-blue-300 font-medium">Commercial Vehicle Booking & Fleet Management Platform</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-[11px] bg-blue-500/20 text-blue-200 border border-blue-400/30 px-2.5 py-1 rounded-full font-semibold">
              v2.5 Production Build
            </span>
            <span className="text-[11px] bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> GST & RTO Verified Fleet
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-slate-700 text-xs sm:text-sm">
          {/* Developer Spotlight Card */}
          <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-blue-700 tracking-wider">Creator & Developer</p>
              <h4 className="text-base font-extrabold text-slate-900">Jayesh Patel</h4>
              <p className="text-xs text-slate-600 mt-0.5">Commercial Logistics & Transportation Systems Architect</p>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-800">
                <a href="tel:9725506630" className="flex items-center gap-1.5 text-blue-700 hover:underline">
                  <Phone className="w-3.5 h-3.5" /> 9725506630
                </a>
                <span className="text-slate-400">•</span>
                <a href="mailto:support@transportswala.com" className="flex items-center gap-1.5 text-blue-700 hover:underline">
                  <Mail className="w-3.5 h-3.5" /> support@transportswala.com
                </a>
              </div>
            </div>
          </div>

          {/* Supported Commercial Fleet */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-600" /> Supported Commercial Vehicles
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">• 20 ft & 30 ft Containers</div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">• 32 ft Multi-Axle Containers</div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">• Tata 407 & Mini Cargo</div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">• Tencor / Tenkor 10-Wheelers</div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">• 40 ft High-Tonnage Trailers</div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">• Reefer / Cold-Chain (-20°C)</div>
            </div>
          </div>

          {/* Compliance & Guarantees */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <p className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600 shrink-0" />
              <strong>Double-Booking Prevention:</strong> Atomic booking locks guarantee vehicle reservation.
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <strong>Automated Settlements:</strong> Verified transporter payouts with transparent 5% platform fee.
            </p>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition shadow-lg"
            >
              Back to Transport Wala
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
