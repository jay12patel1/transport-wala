import React from 'react';
import { Vehicle } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';
import { VehicleImage } from '../shared/VehicleImage';
import { 
  X, CheckCircle2, ShieldCheck, Truck, Scale, MapPin, 
  ThermometerSnowflake, Star, Info, ArrowRight, ShieldAlert 
} from 'lucide-react';

interface VehicleDetailsModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onProceedBooking: (v: Vehicle) => void;
}

export const VehicleDetailsModal: React.FC<VehicleDetailsModalProps> = ({ 
  vehicle, 
  onClose, 
  onProceedBooking 
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header Image & Close */}
        <div className="relative h-56 sm:h-64 bg-slate-900 overflow-hidden">
          <VehicleImage 
            src={vehicle.imageUrl} 
            alt={vehicle.vehicleType} 
            vehicleType={vehicle.vehicleType}
            vehicleCategory={vehicle.vehicleCategory}
            isRefrigerated={vehicle.isRefrigerated}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>

          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <StatusBadge status={vehicle.status} />
              {vehicle.isVerified ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% RTO & GST Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500 text-white">
                  <ShieldAlert className="w-3.5 h-3.5" /> Verification In Progress
                </span>
              )}
              {vehicle.isRefrigerated && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-500 text-white shadow">
                  <ThermometerSnowflake className="w-3.5 h-3.5" /> Cold Chain (-20°C)
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-white">{vehicle.vehicleType}</h2>
            <p className="text-xs text-slate-300 font-mono">Reg No: {vehicle.vehicleNumber} • Category: {vehicle.vehicleCategory}</p>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-6">
          {/* Key Specifications Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Vehicle Capacity & Dimension Specifications
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 font-medium block">Payload Capacity</span>
                <span className="text-base font-bold text-slate-900">{vehicle.capacityTon} Tons</span>
                <span className="text-[10px] text-slate-500 block">({vehicle.capacityKg.toLocaleString()} kg max)</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 font-medium block">Dimensions / Size</span>
                <span className="text-xs font-bold text-slate-900 line-clamp-2">{vehicle.vehicleSize}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 font-medium block">Base Station</span>
                <span className="text-sm font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" /> {vehicle.currentLocation}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 font-medium block">Preferred Route</span>
                <span className="text-xs font-bold text-blue-700">{vehicle.preferredRoute || 'Anywhere in India'}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {vehicle.description && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900 block mb-1">Vehicle & Transporter Notes:</span>
              {vehicle.description}
            </div>
          )}

          {/* Verified Document Compliance (Privacy Preserving) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Compliance & Verified Credentials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="flex items-center gap-2 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-950">RC Certificate</p>
                  <p className="text-[11px] text-emerald-700">RTO Verified by Admin</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-950">Comprehensive Insurance</p>
                  <p className="text-[11px] text-emerald-700">Active Cargo Coverage</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-950">GPS Live Telematics</p>
                  <p className="text-[11px] text-emerald-700">Real-time Route Tracking</p>
                </div>
              </div>
            </div>
          </div>

          {/* Transporter Profile Strip */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block">Fleet Operator</span>
              <h4 className="text-base font-bold text-white">{vehicle.transporterName}</h4>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                <span className="flex items-center gap-1 font-bold text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {vehicle.transporterRating} / 5.0
                </span>
                <span>•</span>
                <span>Trusted Transporter</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Est. Base Freight</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                ₹{vehicle.baseFare.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 block">+ GST & Standard Tolls</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition text-sm"
            >
              Back to Search
            </button>
            <button
              onClick={() => onProceedBooking(vehicle)}
              disabled={vehicle.status !== 'available'}
              className="flex-2 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition"
            >
              <span>{vehicle.status === 'available' ? 'Proceed to Book Vehicle' : 'Currently Unavailable'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
