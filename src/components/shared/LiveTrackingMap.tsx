import React, { useState, useEffect } from 'react';
import { BookingOrder } from '../../types';
import { 
  Navigation, MapPin, Compass, Gauge, ShieldCheck, 
  Phone, Clock, ArrowRight, Radio, RefreshCw, AlertCircle 
} from 'lucide-react';

interface LiveTrackingMapProps {
  order: BookingOrder;
  onCallDriver?: () => void;
  onOpenChat?: () => void;
}

interface Waypoint {
  name: string;
  distanceKm: number;
  timeEstimate: string;
  passed: boolean;
  active?: boolean;
}

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({ order, onCallDriver, onOpenChat }) => {
  const [progress, setProgress] = useState<number>(35); // 35% on highway
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [currentSpeed, setCurrentSpeed] = useState<number>(order.currentGps?.speedKm || 58);
  const [mapViewMode, setMapViewMode] = useState<'route' | 'satellite'>('route');

  // Highway waypoints
  const waypoints: Waypoint[] = [
    { name: order.pickupLocation || 'Sanand GIDC, Ahmedabad', distanceKm: 0, timeEstimate: '01:15 PM', passed: true },
    { name: 'Vadodara Express Tollway', distanceKm: 110, timeEstimate: '03:10 PM', passed: true },
    { name: 'Bharuch Narmada Bridge (NH48)', distanceKm: 195, timeEstimate: '04:45 PM', passed: true, active: true },
    { name: 'Surat Ring Road Toll Plaza', distanceKm: 270, timeEstimate: '06:30 PM', passed: false },
    { name: 'Vapi Industrial Belt', distanceKm: 380, timeEstimate: '08:45 PM', passed: false },
    { name: order.deliveryLocation || 'JNPT Port, Mumbai', distanceKm: 530, timeEstimate: '11:30 PM', passed: false }
  ];

  // Subtle live progress animation
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98) return 98;
        return Number((prev + 0.15).toFixed(2));
      });
      // Vary speed randomly around 55-62 km/h
      setCurrentSpeed(Math.floor(54 + Math.random() * 8));
    }, 2000);
    return () => clearInterval(interval);
  }, [isSimulating]);

  const coveredKm = Math.round((progress / 100) * 530);
  const remainingKm = 530 - coveredKm;
  const remainingHours = (remainingKm / 55).toFixed(1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header Bar */}
      <div className="bg-slate-900 text-white p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white">{order.vehicleNumber}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                GPS LIVE
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {order.vehicleType} • Driver: <span className="text-white font-medium">{order.driverName || 'Suresh Kumar'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setMapViewMode(m => m === 'route' ? 'satellite' : 'route')}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            {mapViewMode === 'route' ? 'Satellite View' : 'Road Map'}
          </button>
          {onCallDriver && (
            <button 
              onClick={onCallDriver}
              className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-semibold shadow transition"
            >
              <Phone className="w-3.5 h-3.5" /> Call Driver
            </button>
          )}
        </div>
      </div>

      {/* Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-50 border-b border-slate-200 text-center divide-x divide-slate-200 py-3">
        <div className="px-2">
          <span className="text-xs text-slate-500 font-medium block">Current Speed</span>
          <span className="text-lg font-bold text-slate-900 flex items-center justify-center gap-1">
            <Gauge className="w-4 h-4 text-blue-600" /> {currentSpeed} <span className="text-xs font-normal text-slate-500">km/h</span>
          </span>
        </div>
        <div className="px-2">
          <span className="text-xs text-slate-500 font-medium block">Distance Covered</span>
          <span className="text-lg font-bold text-slate-900">
            {coveredKm} <span className="text-xs font-normal text-slate-500">/ 530 km</span>
          </span>
        </div>
        <div className="px-2">
          <span className="text-xs text-slate-500 font-medium block">Est. Time Remaining</span>
          <span className="text-lg font-bold text-indigo-600 flex items-center justify-center gap-1">
            <Clock className="w-4 h-4" /> ~{remainingHours} <span className="text-xs font-normal text-slate-500">hrs</span>
          </span>
        </div>
        <div className="px-2">
          <span className="text-xs text-slate-500 font-medium block">GPS Signal</span>
          <span className="text-lg font-bold text-emerald-600 flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4" /> 100% <span className="text-xs font-normal text-slate-500">Lock</span>
          </span>
        </div>
      </div>

      {/* Interactive Map Visualizer Canvas/SVG */}
      <div className={`relative h-64 sm:h-80 w-full overflow-hidden ${mapViewMode === 'satellite' ? 'bg-slate-950' : 'bg-slate-900'}`}>
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <svg className="w-full h-full" viewBox="0 0 800 320" preserveAspectRatio="none">
          {/* Main Highway Route Path */}
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="35%" stopColor="#3b82f6" />
              <stop offset="70%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Route line */}
          <path 
            d="M 60 80 Q 200 120 320 160 T 540 200 T 740 240" 
            fill="none" 
            stroke="#334155" 
            strokeWidth="12" 
            strokeLinecap="round"
          />

          {/* Traveled Route Glow line */}
          <path 
            d="M 60 80 Q 200 120 320 160 T 540 200 T 740 240" 
            fill="none" 
            stroke="url(#routeGradient)" 
            strokeWidth="6" 
            strokeLinecap="round"
            strokeDasharray="800"
            strokeDashoffset={800 - (800 * (progress / 100))}
            filter="url(#glow)"
          />

          {/* Waypoints along path */}
          {/* Origin */}
          <circle cx="60" cy="80" r="10" fill="#10b981" />
          <circle cx="60" cy="80" r="4" fill="#ffffff" />
          <text x="60" y="55" fill="#10b981" fontSize="12" fontWeight="bold" textAnchor="middle">
            {order.pickupLocation?.split('(')[0] || 'Ahmedabad'}
          </text>

          {/* Vadodara */}
          <circle cx="200" cy="118" r="6" fill="#3b82f6" />
          <text x="200" y="142" fill="#94a3b8" fontSize="10" textAnchor="middle">Vadodara</text>

          {/* Bharuch */}
          <circle cx="320" cy="160" r="6" fill="#60a5fa" />
          <text x="320" y="188" fill="#94a3b8" fontSize="10" textAnchor="middle">Bharuch</text>

          {/* Surat */}
          <circle cx="480" cy="190" r="6" fill="#64748b" />
          <text x="480" y="215" fill="#94a3b8" fontSize="10" textAnchor="middle">Surat</text>

          {/* Vapi */}
          <circle cx="610" cy="215" r="6" fill="#64748b" />
          <text x="610" y="240" fill="#94a3b8" fontSize="10" textAnchor="middle">Vapi</text>

          {/* Destination */}
          <circle cx="740" cy="240" r="10" fill="#a855f7" />
          <circle cx="740" cy="240" r="4" fill="#ffffff" />
          <text x="740" y="270" fill="#c084fc" fontSize="12" fontWeight="bold" textAnchor="middle">
            {order.deliveryLocation?.split('(')[0] || 'Mumbai'}
          </text>
        </svg>

        {/* Live Truck Marker positioned along route based on progress */}
        <div 
          className="absolute transition-all duration-1000 ease-linear pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${Math.min(Math.max(progress, 8), 92)}%`,
            top: `${25 + (progress * 0.5)}%`
          }}
        >
          <div className="relative flex flex-col items-center">
            {/* Radar wave */}
            <div className="absolute w-12 h-12 bg-blue-500/20 rounded-full animate-ping"></div>
            
            {/* Moving Truck Badge */}
            <div className="relative z-10 bg-blue-600 text-white p-2.5 rounded-xl shadow-lg border-2 border-white flex items-center gap-1.5">
              <Navigation className="w-5 h-5 transform rotate-45" />
              <span className="text-xs font-bold whitespace-nowrap">{currentSpeed} km/h</span>
            </div>

            {/* Location label */}
            <div className="mt-1 bg-slate-900/90 text-white text-[11px] font-medium px-2 py-0.5 rounded shadow border border-slate-700 whitespace-nowrap">
              NH48 near Bharuch
            </div>
          </div>
        </div>

        {/* Floating Controls in Map */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span>Heading: South-West (210°)</span>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button 
            onClick={() => setProgress(p => p < 90 ? p + 10 : 10)}
            className="bg-slate-800/90 hover:bg-slate-700 text-white text-xs px-2.5 py-1.5 rounded-md border border-slate-600 flex items-center gap-1 transition"
            title="Simulate Next Checkpoint"
          >
            <RefreshCw className="w-3 h-3 text-blue-400" /> Advance Demo
          </button>
        </div>
      </div>

      {/* Checkpoints Timeline */}
      <div className="p-4 bg-white">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Route Checkpoints & Waypoints
        </h4>

        <div className="space-y-3">
          {waypoints.map((wp, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  wp.passed ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                  wp.active ? 'bg-blue-600 text-white animate-pulse' :
                  'bg-slate-100 text-slate-400 border border-slate-300'
                }`}>
                  {wp.passed ? '✓' : idx + 1}
                </div>
                {idx < waypoints.length - 1 && (
                  <div className={`w-0.5 h-6 ${wp.passed ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                )}
              </div>

              <div className="flex-1 flex items-center justify-between pt-0.5">
                <div>
                  <p className={`text-sm font-semibold ${wp.active ? 'text-blue-600' : wp.passed ? 'text-slate-900' : 'text-slate-500'}`}>
                    {wp.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {wp.distanceKm} km from origin
                  </p>
                </div>
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${wp.active ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500'}`}>
                  {wp.timeEstimate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
