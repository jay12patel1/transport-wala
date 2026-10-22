import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VehicleImage } from '../shared/VehicleImage';
import { 
  Truck, ShieldCheck, User, Building2, Navigation, 
  Search, Phone, Calendar, ArrowRight, CheckCircle2, 
  MapPin, Clock, Award, FileText, ChevronRight, Globe, Lock
} from 'lucide-react';

interface PublicLandingProps {
  onOpenLogin: (roleHint?: string) => void;
  onOpenSignup: (roleHint?: string) => void;
}

export const PublicLanding: React.FC<PublicLandingProps> = ({ onOpenLogin, onOpenSignup }) => {
  const { 
    allMarketplaceVehicles, 
    searchQuery, 
    setSearchQuery, 
    adminSettings, 
    language, 
    setLanguage, 
    showToast 
  } = useApp();

  const [pickupCity, setPickupCity] = useState(searchQuery.pickup || 'Ahmedabad');
  const [dropCity, setDropCity] = useState(searchQuery.destination || 'Mumbai');
  const [tripDate, setTripDate] = useState(searchQuery.date || '2026-08-25');
  const [truckType, setTruckType] = useState(searchQuery.vehicleType || 'all');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(prev => ({
      ...prev,
      pickup: pickupCity,
      destination: dropCity,
      date: tripDate,
      vehicleType: truckType === 'all' ? '' : truckType
    }));
    showToast(`Found ${allMarketplaceVehicles.length} verified commercial vehicles available.`);
    // Prompt login/signup to complete booking
    onOpenLogin('customer');
  };

  const filteredPreviewVehicles = allMarketplaceVehicles.filter(v => {
    if (truckType === 'all' || !truckType) return true;
    return v.vehicleType.toLowerCase().includes(truckType.toLowerCase()) || v.vehicleCategory.toLowerCase().includes(truckType.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block leading-none">
                TRANSPORT WALA
              </span>
              <span className="text-[11px] text-amber-400 font-semibold tracking-wide">
                Reliable Transport. Easy Booking.
              </span>
            </div>
          </div>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-300">
            <a href="#find-vehicle" className="hover:text-blue-400 transition">Find Vehicle</a>
            <a href="#fleet" className="hover:text-blue-400 transition">Fleet Categories</a>
            <a href="#become-transporter" className="hover:text-emerald-400 transition">Become a Transporter</a>
            <a href="#become-driver" className="hover:text-amber-400 transition">Become a Driver</a>
          </div>

          {/* Actions & Contacts */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-400 mr-1" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="en" className="bg-slate-900 text-white">English</option>
                <option value="gu" className="bg-slate-900 text-white">ગુજરાતી</option>
                <option value="hi" className="bg-slate-900 text-white">हिन्दी</option>
              </select>
            </div>

            {/* Login & Sign Up Buttons */}
            <button
              onClick={() => onOpenLogin()}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-extrabold border border-slate-700 transition shadow-sm"
            >
              Login
            </button>

            <button
              onClick={() => onOpenSignup('customer')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5"
            >
              <span>Sign Up</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section id="find-vehicle" className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 border-b border-slate-800">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-950/80 border border-blue-800 rounded-full text-xs font-bold text-blue-300">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Gujarat &amp; All India Commercial Freight Network</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Reliable Transport. Easy Booking.
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto font-normal">
              Book verified 20ft–32ft Containers, Tata 407, Reefer Cold Chain, and Trailers with transparent rates, live GPS tracking, and GST e-invoices.
            </p>
          </div>

          {/* Quick Search Engine */}
          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl space-y-4">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Pickup Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={pickupCity}
                    onChange={(e) => setPickupCity(e.target.value)}
                    placeholder="e.g. Ahmedabad, Surat, Rajkot"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Delivery Destination
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-rose-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={dropCity}
                    onChange={(e) => setDropCity(e.target.value)}
                    placeholder="e.g. Mumbai, Delhi, JNPT"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Dispatch Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-blue-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    required
                    value={tripDate}
                    onChange={(e) => setTripDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Vehicle Type
                </label>
                <select
                  value={truckType}
                  onChange={(e) => setTruckType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="all">All Fleet Types</option>
                  <option value="Milk Tanker">Milk Tanker / Milk Tencor (18 Ton)</option>
                  <option value="Loading Truck">Loading Truck (7.5 Ton)</option>
                  <option value="20 ft">20 ft Closed Container (9.5 Ton)</option>
                  <option value="30 ft">30 ft Container (15 Ton)</option>
                  <option value="32 ft">32 ft Multi-Axle Container (18 Ton)</option>
                  <option value="Reefer">Refer / Refrigerated (-20°C)</option>
                  <option value="Trailer">40 ft Flatbed Trailer (35 Ton)</option>
                  <option value="Tencor">Tencor / Tenkor 10-Wheel (16 Ton)</option>
                  <option value="Tata 407">Tata 407 LCV (2.5 Ton)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5 transition"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Vehicle</span>
                </button>
              </div>
            </form>

            {/* Quick Action Badges */}
            <div className="pt-3 border-t border-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% Verified RTO Documents
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Live GPS Highway Telematics
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Transparent 5% Commission
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenSignup('transporter')}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline"
                >
                  List Your Fleet →
                </button>
              </div>
            </div>
          </div>

          {/* Quick CTA 3-Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div 
              onClick={() => onOpenSignup('customer')}
              className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-blue-900/60 hover:border-blue-500/80 cursor-pointer transition group shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-3">
                <User className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-white text-base group-hover:text-blue-400 transition">
                For Shippers &amp; Businesses
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Book full truckloads (FTL) with instant digital invoices, live GPS tracking, and dedicated driver support.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 mt-3">
                Book Transport Now <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

            <div 
              id="become-transporter"
              onClick={() => onOpenSignup('transporter')}
              className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-emerald-900/60 hover:border-emerald-500/80 cursor-pointer transition group shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-white text-base group-hover:text-emerald-400 transition">
                Become a Transporter
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Attach your fleet (Containers, Tata 407, Trailers). Receive daily booking loads and automated net settlements.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 mt-3">
                Register Fleet <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

            <div 
              id="become-driver"
              onClick={() => onOpenSignup('driver')}
              className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-amber-900/60 hover:border-amber-500/80 cursor-pointer transition group shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-3">
                <Navigation className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-white text-base group-hover:text-amber-400 transition">
                Become a Driver
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Join our verified driver network. Access assigned highway trips, live GPS telematics, and in-cab navigation console.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 mt-3">
                Join Driver Roster <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Fleet Categories Preview */}
      <section id="fleet" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Verified Commercial Inventory
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Commercial Fleet Available Across All Routes
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              RTO certified commercial freight vehicles with verified RC, Fitness, Insurance &amp; All-India Permits.
            </p>
          </div>

          <button
            onClick={() => onOpenLogin('customer')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition"
          >
            View All {allMarketplaceVehicles.length} Commercial Trucks →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPreviewVehicles.slice(0, 6).map(vehicle => (
            <div 
              key={vehicle.id}
              className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-lg hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 bg-slate-900 overflow-hidden">
                  <VehicleImage 
                    src={vehicle.imageUrl} 
                    alt={vehicle.vehicleType}
                    vehicleType={vehicle.vehicleType}
                    vehicleCategory={vehicle.vehicleCategory}
                    isRefrigerated={vehicle.isRefrigerated}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold text-white border border-slate-700">
                    {vehicle.vehicleCategory}
                  </div>
                  <div className="absolute top-3 right-3 bg-emerald-950/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-extrabold text-emerald-400 border border-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> RTO Verified
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-extrabold text-white text-base">{vehicle.vehicleType}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{vehicle.transporterName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Payload Capacity</span>
                      <strong className="text-slate-200">{vehicle.capacityTon} Ton ({vehicle.capacityKg} kg)</strong>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Current Location</span>
                      <strong className="text-slate-200">{vehicle.currentLocation}</strong>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {vehicle.description || `High-performance commercial vehicle suited for industrial and commercial logistics.`}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-900 mt-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">Base Freight Fare</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    ₹{vehicle.baseFare.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  onClick={() => onOpenLogin('customer')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/30 transition flex items-center gap-1"
                >
                  <span>Book Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Value Pillars */}
      <section className="py-14 bg-slate-950 border-t border-b border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Why Transport Wala?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Transforming Indian logistics with digital verification, transparent pricing, and direct settlements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-white text-sm">100% RTO Verified</h3>
              <p className="text-xs text-slate-400">
                Every vehicle RC, Fitness certificate, National Permit &amp; Insurance is audited by platform compliance.
              </p>
            </div>

            <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <Navigation className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-white text-sm">Live GPS Telematics</h3>
              <p className="text-xs text-slate-400">
                Track container consignments on national highways in real-time with speed, distance, and accurate ETAs.
              </p>
            </div>

            <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-white text-sm">GST Tax Invoices</h3>
              <p className="text-xs text-slate-400">
                Instant digital e-way bill ready invoices with automated 18% GST calculation and itemized breakdown.
              </p>
            </div>

            <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-white text-sm">Secure Settlements</h3>
              <p className="text-xs text-slate-400">
                Transporters receive direct payouts after delivery confirmation with a transparent flat 5% platform fee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 py-10 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Truck className="w-4 h-4" />
              </div>
              <span className="text-base font-black text-white">TRANSPORT WALA</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              India&apos;s leading commercial logistics platform for verified containers, trucks, and multi-axle freight.
            </p>
            <p className="text-[11px] text-slate-500">
              Headquarters: Ahmedabad, Gujarat, India
            </p>
          </div>

          <div>
            <h4 className="font-extrabold text-white uppercase tracking-wider mb-3">Roles &amp; Access</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onOpenLogin('customer')} className="hover:text-white">Customer / Shipper Portal</button></li>
              <li><button onClick={() => onOpenLogin('transporter')} className="hover:text-white">Transporter &amp; Fleet Owner</button></li>
              <li><button onClick={() => onOpenLogin('driver')} className="hover:text-white">In-Cab Driver Console</button></li>
              <li><button onClick={() => onOpenLogin('admin')} className="hover:text-white">Super Admin Operations</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-white uppercase tracking-wider mb-3">Fleet Coverage</h4>
            <ul className="space-y-2">
              <li><span>20 ft Closed Containers (7.5 Ton)</span></li>
              <li><span>32 ft Multi-Axle Containers (15 Ton)</span></li>
              <li><span>Tata 407 &amp; Eicher 14ft (2.5 Ton)</span></li>
              <li><span>Reefer Cold Chain (-20°C)</span></li>
              <li><span>40 ft Flatbed Trailers (25 Ton)</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-white uppercase tracking-wider mb-3">Direct Contact &amp; Support</h4>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-blue-400" />
                <span className="font-mono font-bold">{adminSettings.appContactNumber || '9725506630'}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] space-y-1">
                <span className="text-slate-400 block">Lead Platform Architect:</span>
                <strong className="text-white block font-bold text-xs">{adminSettings.appDeveloper || 'Jayesh Patel'}</strong>
                <span className="text-emerald-400 block font-mono">Contact: {adminSettings.appContactNumber || '9725506630'}</span>
              </div>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-slate-500">
          <div>
            © 2026 Transport Wala. All rights reserved. • Built with Enterprise Supabase Auth &amp; RLS Protection.
          </div>
          <div className="flex items-center gap-2">
            <span>Developed by <strong className="text-slate-300 font-bold">{adminSettings.appDeveloper || 'Jayesh Patel'}</strong> ({adminSettings.appContactNumber || '9725506630'})</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
