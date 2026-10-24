import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Vehicle } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';
import { VehicleDetailsModal } from './VehicleDetailsModal';
import { BookingCheckoutModal } from './BookingCheckoutModal';
import { PostFreightRequirementModal } from './PostFreightRequirementModal';
import { VehicleImage } from '../shared/VehicleImage';
import { CurrentLocationButton } from '../shared/CurrentLocationButton';
import { PlacesAutocompleteInput } from '../shared/PlacesAutocompleteInput';
import { 
  Search, MapPin, Calendar, Truck, Filter, 
  ArrowUpDown, ShieldCheck, ThermometerSnowflake, Star, 
  CheckCircle2, Sparkles, Scale, Info, ArrowRight, RotateCcw,
  Send, PackageCheck, Clock, Layers
} from 'lucide-react';

export const CustomerHome: React.FC = () => {
  const { 
    vehicles, searchQuery, setSearchQuery, 
    setScreen, t, showToast, freightRequirements, user 
  } = useApp();

  const [activeModal, setActiveModal] = useState<'details' | 'checkout' | null>(null);
  const [targetVehicle, setTargetVehicle] = useState<Vehicle | null>(null);
  const [showPostReqModal, setShowPostReqModal] = useState<boolean>(false);
  
  // Filter & Sort State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating' | 'capacity'>('price_asc');

  const vehicleTypes = [
    'Milk Tanker / Milk Tencor',
    'Loading Truck',
    '20 ft Container',
    '30 ft Container',
    '32 ft Container',
    'Refer Vehicle / Refrigerated Vehicle',
    'Trailer',
    'Tencor / Tenkor',
    'Tata 407'
  ];

  // Customer's own bulk freight requirements
  const myFreightRequirements = useMemo(() => {
    return freightRequirements.filter(r => r.customerId === user.id);
  }, [freightRequirements, user.id]);

  // Filtering Logic - Directly reacts to search inputs
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      // 1. Pickup Matching (currentLocation or preferredRoute)
      const pickupQuery = searchQuery.pickup?.trim().toLowerCase();
      if (pickupQuery) {
        const matchesLocation = v.currentLocation?.toLowerCase().includes(pickupQuery);
        const matchesRoute = v.preferredRoute?.toLowerCase().includes(pickupQuery);
        if (!matchesLocation && !matchesRoute) {
          return false;
        }
      }

      // 2. Destination Matching (preferredRoute or currentLocation)
      const destQuery = searchQuery.destination?.trim().toLowerCase();
      if (destQuery) {
        const routeText = (v.preferredRoute || '').toLowerCase();
        const locText = (v.currentLocation || '').toLowerCase();
        const matchesRoute = routeText.includes(destQuery);
        const matchesLocation = locText.includes(destQuery);
        const isFlexibleCorridor = 
          routeText.includes('all india') || 
          routeText.includes('all-india') || 
          routeText.includes('all gujarat') || 
          routeText.includes('western freight') ||
          routeText.includes('national permit');

        if (!matchesRoute && !matchesLocation && !isFlexibleCorridor) {
          return false;
        }
      }

      // 3. Date Matching (vehicle must be available on or before requested trip date)
      if (searchQuery.date && v.availableFromDate) {
        if (v.availableFromDate > searchQuery.date) {
          return false;
        }
      }

      // 4. Vehicle Type Matching (strict match)
      if (searchQuery.vehicleType?.trim()) {
        const queryType = searchQuery.vehicleType.trim().toLowerCase();
        const vType = (v.vehicleType || '').trim().toLowerCase();
        const vCat = (v.vehicleCategory || '').trim().toLowerCase();
        
        const isMatch = 
          vType === queryType || 
          vType.includes(queryType) || 
          queryType.includes(vType) ||
          (vCat && queryType.includes(vCat));

        if (!isMatch) {
          return false;
        }
      }

      // 5. Refrigerated Toggle Filter
      if (searchQuery.isRefrigerated && !v.isRefrigerated) {
        return false;
      }

      // 6. Minimum Capacity Filter
      if (searchQuery.minCapacityTon > 0 && v.capacityTon < searchQuery.minCapacityTon) {
        return false;
      }

      // 7. Verified Only Filter
      if (verifiedOnly && !v.isVerified) {
        return false;
      }

      // 8. Category Filter Pills
      if (selectedCategory !== 'all') {
        const catQuery = selectedCategory.toLowerCase();
        const vCat = (v.vehicleCategory || '').toLowerCase();
        const vType = (v.vehicleType || '').toLowerCase();
        if (vCat !== catQuery && !vType.includes(catQuery)) {
          return false;
        }
      }

      return true;
    });
  }, [
    vehicles,
    searchQuery.pickup,
    searchQuery.destination,
    searchQuery.date,
    searchQuery.vehicleType,
    searchQuery.isRefrigerated,
    searchQuery.minCapacityTon,
    verifiedOnly,
    selectedCategory
  ]);

  // Sorting
  const sortedVehicles = useMemo(() => {
    return [...filteredVehicles].sort((a, b) => {
      if (sortBy === 'price_asc') return (a.baseFare || 0) - (b.baseFare || 0);
      if (sortBy === 'price_desc') return (b.baseFare || 0) - (a.baseFare || 0);
      if (sortBy === 'rating') return (b.transporterRating || 0) - (a.transporterRating || 0);
      if (sortBy === 'capacity') return (b.capacityTon || 0) - (a.capacityTon || 0);
      return 0;
    });
  }, [filteredVehicles, sortBy]);

  const handleOpenDetails = (v: Vehicle) => {
    setTargetVehicle(v);
    setActiveModal('details');
  };

  const handleOpenCheckout = (v: Vehicle) => {
    setTargetVehicle(v);
    setActiveModal('checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Verified Commercial Freight Booking
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Commercial Freight &amp; Logistics
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              Direct connection with verified fleet owners. 20ft/30ft/32ft Containers, Milk Tankers, Loading Trucks, Trailers &amp; Reefer units.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => setShowPostReqModal(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 transition flex items-center justify-center gap-2 border border-amber-300/40"
            >
              <Send className="w-4 h-4 text-slate-950" />
              <span>Post Freight Requirement / Bulk Load</span>
            </button>
          </div>
        </div>

        {/* Search Filter Form */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 text-slate-800 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Pickup with Current Location & Places Autocomplete */}
            <PlacesAutocompleteInput
              label="Pickup City / Hub"
              value={searchQuery.pickup}
              isPickup={true}
              iconColor="emerald"
              placeholder="e.g. Ahmedabad, Sanand GIDC, Anand"
              onChange={(address) => setSearchQuery(prev => ({ ...prev, pickup: address }))}
            />

            {/* Delivery Destination with Places Autocomplete */}
            <PlacesAutocompleteInput
              label="Delivery City / Port"
              value={searchQuery.destination}
              isPickup={false}
              iconColor="rose"
              placeholder="e.g. Mumbai, JNPT Port, Surat, Delhi"
              onChange={(address) => setSearchQuery(prev => ({ ...prev, destination: address }))}
            />

            {/* Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Pickup Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-blue-600 absolute left-3 top-3" />
                <input
                  type="date"
                  value={searchQuery.date}
                  onChange={(e) => setSearchQuery(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Vehicle Type Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Vehicle Category
              </label>
              <div className="relative">
                <Truck className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <select
                  value={searchQuery.vehicleType}
                  onChange={(e) => setSearchQuery(prev => ({ ...prev, vehicleType: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">All Categories ({vehicles.length} trucks)</option>
                  {vehicleTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Toggle Filters */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSearchQuery(prev => ({ ...prev, isRefrigerated: !prev.isRefrigerated }))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition ${
                  searchQuery.isRefrigerated 
                    ? 'bg-cyan-50 border-cyan-400 text-cyan-800 font-bold' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ThermometerSnowflake className="w-3.5 h-3.5 text-cyan-600" />
                <span>Reefer / Refrigerated (-20°C)</span>
              </button>

              <button
                type="button"
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition ${
                  verifiedOnly 
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Vehicles Only</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="price_asc">Lowest Fare First</option>
                <option value="price_desc">Highest Fare First</option>
                <option value="rating">Top Rated Transporter</option>
                <option value="capacity">Highest Tonnage (Tons)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Customer's Active Posted Bulk Requirements */}
      {myFreightRequirements.length > 0 && (
        <section className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-amber-600" />
              <h3 className="font-extrabold text-sm text-slate-900">
                My Posted Bulk Load Inquiries ({myFreightRequirements.length})
              </h3>
            </div>
            <button
              onClick={() => setShowPostReqModal(true)}
              className="text-xs font-bold text-amber-800 hover:text-amber-900 underline"
            >
              + Post Another Requirement
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {myFreightRequirements.map(req => (
              <div key={req.id} className="p-3.5 bg-white rounded-2xl border border-amber-100 shadow-sm text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 text-xs">{req.id}</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                    req.status === 'open' 
                      ? 'bg-amber-100 text-amber-800' 
                      : req.status === 'fulfilled' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {req.status}
                  </span>
                </div>
                <p className="font-extrabold text-slate-900">
                  {req.quantityRequired}x {req.vehicleType}
                </p>
                <p className="text-slate-600 flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{req.pickupLocation} → {req.deliveryLocation}</span>
                </p>
                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>Pickup: {req.pickupDate}</span>
                  {req.targetBudgetPerVehicle && (
                    <span className="font-bold text-emerald-700 font-mono">₹{req.targetBudgetPerVehicle.toLocaleString('en-IN')}/trk</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Available Fleet Grid Header */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              Live Available Commercial Fleet ({sortedVehicles.length})
            </h2>
            <p className="text-xs text-slate-500">
              Ready for immediate dispatch across Gujarat and all-India corridors.
            </p>
          </div>
          
          {/* Active Filters Clear Button */}
          {(searchQuery.pickup || searchQuery.destination || searchQuery.vehicleType || searchQuery.isRefrigerated || verifiedOnly || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery({
                  pickup: '',
                  destination: '',
                  date: new Date().toISOString().split('T')[0],
                  vehicleType: '',
                  size: '',
                  minCapacityTon: 0,
                  isRefrigerated: false
                });
                setVerifiedOnly(false);
                setSelectedCategory('all');
                showToast('All search filters reset.');
              }}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Vehicle Grid Cards */}
        {sortedVehicles.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200 shadow-sm space-y-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Truck className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg sm:text-xl text-slate-800">
                {vehicles.length === 0 ? 'No commercial vehicles listed yet. Transporters need to add vehicles.' : 'No matching commercial vehicles found'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                {vehicles.length === 0 
                  ? 'Real commercial vehicles registered and added by verified fleet owners will appear here automatically.'
                  : 'No fleet vehicles match your current pickup location, destination, date, or vehicle category criteria. Try resetting your search filters.'}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery({
                    pickup: '',
                    destination: '',
                    date: new Date().toISOString().split('T')[0],
                    vehicleType: '',
                    size: '',
                    minCapacityTon: 0,
                    isRefrigerated: false
                  });
                  setVerifiedOnly(false);
                  setSelectedCategory('all');
                  showToast('All filters reset. Showing entire available fleet.');
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> Reset Filters
              </button>

              <button
                onClick={() => setScreen('transporter_dashboard')}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>Switch to Transporter Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setShowPostReqModal(true)}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Bulk Load Request</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedVehicles.map(vehicle => (
              <div
                key={vehicle.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
              >
                {/* Vehicle Image Header */}
                <div className="relative h-48 bg-slate-900 overflow-hidden">
                  <VehicleImage
                    src={vehicle.imageUrl}
                    alt={vehicle.vehicleType}
                    vehicleType={vehicle.vehicleType}
                    vehicleCategory={vehicle.vehicleCategory}
                    isRefrigerated={vehicle.isRefrigerated}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <StatusBadge status={vehicle.status} size="sm" />
                    {vehicle.isVerified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>

                  {vehicle.isRefrigerated && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-600 text-white shadow">
                        <ThermometerSnowflake className="w-3 h-3" /> Reefer (-20°C)
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    <div>
                      <h3 className="font-extrabold text-base text-white">{vehicle.vehicleType}</h3>
                      <p className="text-[11px] text-slate-300 font-mono">{vehicle.vehicleNumber}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-300 block">Base Freight</span>
                      <span className="text-base font-black text-emerald-400 font-mono">
                        ₹{vehicle.baseFare.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-medium block">Payload Capacity</span>
                      <span className="font-bold text-slate-900">{vehicle.capacityTon} Tons</span>
                    </div>

                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-medium block">Location</span>
                      <span className="font-bold text-slate-900 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-blue-600 shrink-0" /> {vehicle.currentLocation}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 line-clamp-1">
                    <strong>Size:</strong> {vehicle.vehicleSize}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Fleet Operator</span>
                      <span className="font-bold text-slate-800 truncate block max-w-[140px]">
                        {vehicle.transporterName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{vehicle.transporterRating}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => handleOpenDetails(vehicle)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition text-xs"
                    >
                      Details &amp; Docs
                    </button>
                    <button
                      onClick={() => handleOpenCheckout(vehicle)}
                      disabled={vehicle.status !== 'available'}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold transition text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-1"
                    >
                      <span>{vehicle.status === 'available' ? 'Book Vehicle' : 'Unavailable'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      {showPostReqModal && (
        <PostFreightRequirementModal
          onClose={() => setShowPostReqModal(false)}
          onSuccess={() => {
            showToast('Freight requirement posted to marketplace!');
          }}
        />
      )}

      {activeModal === 'details' && targetVehicle && (
        <VehicleDetailsModal
          vehicle={targetVehicle}
          onClose={() => setActiveModal(null)}
          onProceedBooking={(v) => {
            setActiveModal('checkout');
          }}
        />
      )}

      {activeModal === 'checkout' && targetVehicle && (
        <BookingCheckoutModal
          vehicle={targetVehicle}
          onClose={() => setActiveModal(null)}
          onBookingSuccess={(order) => {
            setActiveModal(null);
            setScreen('bookings');
          }}
        />
      )}
    </div>
  );
};
