import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Vehicle } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';
import { VehicleDetailsModal } from './VehicleDetailsModal';
import { BookingCheckoutModal } from './BookingCheckoutModal';
import { VehicleImage } from '../shared/VehicleImage';
import { VEHICLE_TYPE_CATALOG, VehicleTypeSpec } from '../../utils/vehicleImages';
import { 
  Search, MapPin, Calendar, Truck, Filter, 
  ArrowUpDown, ShieldCheck, ThermometerSnowflake, Star, 
  CheckCircle2, Sparkles, Scale, Info, ArrowRight, Layers, RotateCcw
} from 'lucide-react';

export const CustomerHome: React.FC = () => {
  const { 
    vehicles, searchQuery, setSearchQuery, 
    selectedVehicle, setSelectedVehicle, setScreen, t, showToast 
  } = useApp();

  const [activeModal, setActiveModal] = useState<'details' | 'checkout' | null>(null);
  const [targetVehicle, setTargetVehicle] = useState<Vehicle | null>(null);
  
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

      // 2. Destination Matching (preferredRoute or currentLocation, with flexible corridors)
      const destQuery = searchQuery.destination?.trim().toLowerCase();
      if (destQuery) {
        const routeText = (v.preferredRoute || '').toLowerCase();
        const locText = (v.currentLocation || '').toLowerCase();
        const matchesRoute = routeText.includes(destQuery);
        const matchesLocation = locText.includes(destQuery);
        const isFlexibleRoute = 
          routeText.includes('all india') || 
          routeText.includes('all-india') || 
          routeText.includes('all gujarat') || 
          routeText.includes('western freight') ||
          routeText.includes('national permit');

        if (!matchesRoute && !matchesLocation && !isFlexibleRoute) {
          return false;
        }
      }

      // 3. Date Matching (vehicle must be available on or before requested trip date)
      if (searchQuery.date && v.availableFromDate) {
        if (v.availableFromDate > searchQuery.date) {
          return false;
        }
      }

      // 4. Vehicle Type Matching (exact or partial semantic category match)
      const typeQuery = searchQuery.vehicleType?.trim().toLowerCase();
      if (typeQuery) {
        const vType = (v.vehicleType || '').toLowerCase();
        const vCat = (v.vehicleCategory || '').toLowerCase();
        const vSize = (v.vehicleSize || '').toLowerCase();

        const directMatch = 
          vType === typeQuery || 
          vType.includes(typeQuery) || 
          typeQuery.includes(vType) ||
          vCat === typeQuery ||
          vCat.includes(typeQuery) ||
          typeQuery.includes(vCat) ||
          vSize.includes(typeQuery);

        const isReefer = typeQuery.includes('refer') || typeQuery.includes('refrigerated');
        const isTanker = typeQuery.includes('tanker') || typeQuery.includes('tencor') || typeQuery.includes('tenkor') || typeQuery.includes('milk');
        const isContainer = typeQuery.includes('container');
        const isTrailer = typeQuery.includes('trailer');
        const is407 = typeQuery.includes('407');
        const isLoading = typeQuery.includes('loading') || typeQuery.includes('open');

        const semanticMatch = 
          (isReefer && (v.isRefrigerated || vCat === 'special' || vType.includes('refer') || vType.includes('reefer'))) ||
          (isTanker && (vCat === 'tanker' || vCat === 'special' || vType.includes('tanker') || vType.includes('tencor') || vType.includes('milk'))) ||
          (isContainer && (vCat === 'container' || vCat === 'closed body' || vType.includes('container') || vType.includes('ft'))) ||
          (isTrailer && (vCat === 'trailer' || vType.includes('trailer') || vType.includes('flatbed'))) ||
          (is407 && (vType.includes('407') || vSize.includes('407') || vCat === 'open truck')) ||
          (isLoading && (vCat === 'open truck' || vCat === 'closed body' || vType.includes('truck')));

        if (!directMatch && !semanticMatch) {
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
      if (sortBy === 'price_asc') return a.baseFare - b.baseFare;
      if (sortBy === 'price_desc') return b.baseFare - a.baseFare;
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

  // Quick Book by specific Vehicle Category or Specification
  const handleCategoryQuickBook = (catSpecOrName: string | VehicleTypeSpec) => {
    const catName = typeof catSpecOrName === 'string' ? catSpecOrName : catSpecOrName.name;
    const catSpec = typeof catSpecOrName === 'object' 
      ? catSpecOrName 
      : (
          VEHICLE_TYPE_CATALOG.find(c => 
            c.name.toLowerCase() === catName.toLowerCase() ||
            c.name.toLowerCase().includes(catName.toLowerCase()) ||
            catName.toLowerCase().includes(c.name.toLowerCase()) ||
            c.category.toLowerCase() === catName.toLowerCase()
          ) || VEHICLE_TYPE_CATALOG[0]
        );

    // 1. Look for matching available vehicle in live vehicles list
    const matched = vehicles.find(v => 
      v.status === 'available' && (
        v.vehicleType.toLowerCase().includes(catName.toLowerCase()) || 
        catName.toLowerCase().includes(v.vehicleType.toLowerCase()) ||
        v.vehicleCategory?.toLowerCase() === catSpec.category?.toLowerCase()
      )
    );

    if (matched) {
      setTargetVehicle(matched);
      setActiveModal('checkout');
      showToast(`Selected ${matched.vehicleType} (${matched.vehicleNumber}) for immediate booking`);
      return;
    }

    // 2. If no available vehicle exists in the database/list (clean state or all booked),
    // create a temporary on-demand vehicle object from the category specification
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const todayStr = new Date().toISOString().split('T')[0];

    const onDemandVehicle: Vehicle = {
      id: `tw-ondemand-${catSpec.id || 'fleet'}-${Date.now()}`,
      ownerId: 'tr_network_fleet',
      transporterName: 'TransportWala Network Fleet',
      transporterPhone: '+91 97255 06630',
      transporterRating: 4.9,
      vehicleNumber: `GJ-01-TW-${randomSuffix}`,
      vehicleType: catSpec.name,
      vehicleCategory: catSpec.category,
      vehicleSize: catSpec.defaultSize || `${catSpec.defaultCapacityTon} Ton Commercial Body`,
      capacityKg: catSpec.defaultCapacityKg || (catSpec.defaultCapacityTon * 1000),
      capacityTon: catSpec.defaultCapacityTon || 15,
      currentLocation: searchQuery.pickup?.trim() || 'Ahmedabad Logistics Park, Gujarat',
      preferredRoute: searchQuery.pickup && searchQuery.destination 
        ? `${searchQuery.pickup} to ${searchQuery.destination}` 
        : 'All Gujarat & Western Freight Corridors',
      availableFromDate: searchQuery.date || todayStr,
      isRefrigerated: Boolean(catSpec.isRefrigerated || catSpec.name.toLowerCase().includes('refer') || catSpec.name.toLowerCase().includes('reefer')),
      status: 'available',
      baseFare: catSpec.defaultFare || 18000,
      perKmRate: catSpec.defaultPerKm || 40,
      driverName: 'Assigned Senior Fleet Captain',
      driverPhone: '+91 98980 12345',
      imageUrl: catSpec.image,
      description: `${catSpec.name} - Verified on-demand commercial freight allocation with complete transit coverage.`,
      isVerified: true,
      documents: [
        {
          id: `doc_rc_${Date.now()}`,
          vehicleId: `tw-ondemand-${Date.now()}`,
          ownerId: 'tr_network_fleet',
          docType: 'RC',
          docNumber: `GJ01-RC-${randomSuffix}`,
          issueDate: '2023-01-15',
          expiryDate: '2030-01-15',
          fileUrl: '#',
          fileName: 'rc_smart_card.pdf',
          status: 'verified',
          uploadedAt: todayStr
        },
        {
          id: `doc_ins_${Date.now()}`,
          vehicleId: `tw-ondemand-${Date.now()}`,
          ownerId: 'tr_network_fleet',
          docType: 'Insurance',
          docNumber: `POL-TW-${randomSuffix}`,
          issueDate: '2025-01-01',
          expiryDate: '2027-12-31',
          fileUrl: '#',
          fileName: 'commercial_transit_insurance.pdf',
          status: 'verified',
          uploadedAt: todayStr
        },
        {
          id: `doc_fit_${Date.now()}`,
          vehicleId: `tw-ondemand-${Date.now()}`,
          ownerId: 'tr_network_fleet',
          docType: 'Fitness',
          docNumber: `FIT-GJ-${randomSuffix}`,
          issueDate: '2025-03-01',
          expiryDate: '2027-03-01',
          fileUrl: '#',
          fileName: 'rto_fitness_certificate.pdf',
          status: 'verified',
          uploadedAt: todayStr
        }
      ]
    };

    // Immediately open the BookingCheckoutModal for this vehicle
    setTargetVehicle(onDemandVehicle);
    setActiveModal('checkout');
    showToast(`Instant booking initiated for ${catSpec.name}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="max-w-2xl mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Verified Commercial Freight Booking
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Commercial Freight & Logistics
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Direct connection with verified fleet owners. 20ft/30ft/32ft Containers, Milk Tankers, Loading Trucks, Trailers & Reefer units.
          </p>
        </div>

        {/* Search Filter Form */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 text-slate-800 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Pickup */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Pickup City / Hub
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery.pickup}
                  onChange={(e) => setSearchQuery(prev => ({ ...prev, pickup: e.target.value }))}
                  placeholder="e.g. Ahmedabad, Anand, Mehsana"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Destination */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Delivery City / Port
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-rose-600 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery.destination}
                  onChange={(e) => setSearchQuery(prev => ({ ...prev, destination: e.target.value }))}
                  placeholder="e.g. Mumbai, JNPT Port, Surat"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

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
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800"
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

      {/* ========================================================================= */}
      {/* VEHICLE CATEGORIES SECTION (Requirement 12: Name, Image, Capacity, Availability, Book Now) */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Commercial Vehicle Categories
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Select verified commercial freight vehicles tailored for heavy goods, container logistics, dairy tankers, and cold chain.
            </p>
          </div>

          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 shrink-0 self-start sm:self-auto">
            9 Specialized Fleet Types
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {VEHICLE_TYPE_CATALOG.map((catSpec) => {
            // Calculate active available fleet count for this category
            const count = vehicles.filter(v => 
              v.vehicleType.toLowerCase().includes(catSpec.name.toLowerCase()) || 
              catSpec.name.toLowerCase().includes(v.vehicleType.toLowerCase())
            ).length;

            return (
              <div 
                key={catSpec.id || catSpec.name}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* Vehicle Category Image Header */}
                <div className="relative h-48 bg-slate-950 overflow-hidden">
                  <VehicleImage
                    src={catSpec.image}
                    alt={catSpec.name}
                    vehicleType={catSpec.name}
                    vehicleCategory={catSpec.category}
                    isRefrigerated={catSpec.isRefrigerated}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur border border-slate-700">
                      {catSpec.category}
                    </span>
                    {catSpec.isRefrigerated && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-600 text-white shadow flex items-center gap-1">
                        <ThermometerSnowflake className="w-3 h-3" /> Cold Chain
                      </span>
                    )}
                  </div>

                  {/* Availability Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow">
                      <CheckCircle2 className="w-3 h-3" /> {count > 0 ? `${count} Available` : 'Available on Demand'}
                    </span>
                  </div>

                  {/* Vehicle Name on Card */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-lg font-black text-white leading-tight">{catSpec.name}</h3>
                    <p className="text-[11px] text-slate-300 font-medium line-clamp-1">{catSpec.popularFor}</p>
                  </div>
                </div>

                {/* Card Info & Capacity */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                  <div className="space-y-2">
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {catSpec.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Payload Capacity</span>
                        <span className="text-sm font-extrabold text-slate-900">{catSpec.defaultCapacityTon} Tons</span>
                        <span className="text-[10px] text-slate-500 block font-mono">({catSpec.defaultCapacityKg.toLocaleString()} kg)</span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated Freight</span>
                        <span className="text-sm font-extrabold text-emerald-700 font-mono">₹{catSpec.defaultFare.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-slate-500 block">₹{catSpec.defaultPerKm}/km standard</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action: Book Now & View Details */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSearchQuery(prev => ({ ...prev, vehicleType: catSpec.name }));
                        setSelectedCategory('all');
                        showToast(`Filtered fleet for ${catSpec.name}`);
                      }}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition text-center"
                    >
                      Filter Fleet
                    </button>

                    <button
                      onClick={() => handleCategoryQuickBook(catSpec)}
                      className="flex-1 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-black text-white shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-1.5 group-hover:bg-blue-700"
                    >
                      <span>Book Now</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Available Fleet Grid Header */}
      <section className="space-y-4 pt-4 border-t border-slate-200">
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
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <Truck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-800">
                {vehicles.length === 0 ? 'No commercial vehicles listed yet' : 'No matching commercial vehicles found'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                {vehicles.length === 0 
                  ? 'Transporters and fleet owners can register and add commercial vehicles (20ft, 30ft, 32ft Containers, Milk Tankers, Reefer trucks) to start accepting shipper bookings.'
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

              {vehicles.length === 0 && (
                <button
                  onClick={() => setScreen('transporter_dashboard')}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Transporter Fleet Dashboard
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedVehicles.map(vehicle => (
              <div 
                key={vehicle.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* Card Image Banner */}
                <div className="relative h-48 bg-slate-950 overflow-hidden">
                  <VehicleImage 
                    src={vehicle.imageUrl} 
                    alt={vehicle.vehicleType}
                    vehicleType={vehicle.vehicleType}
                    vehicleCategory={vehicle.vehicleCategory}
                    isRefrigerated={vehicle.isRefrigerated}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent"></div>

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
                      Details & Docs
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
