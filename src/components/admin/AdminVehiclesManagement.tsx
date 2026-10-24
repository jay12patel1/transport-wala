import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Vehicle } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';
import { VehicleImage } from '../shared/VehicleImage';
import { 
  Truck, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, 
  ShieldAlert, Search, Filter, Phone, MapPin, Scale, Calendar,
  FileText, ExternalLink, RefreshCw, Eye
} from 'lucide-react';

export const AdminVehiclesManagement: React.FC = () => {
  const { vehicles, approveVehicle, rejectVehicle, showToast, setScreen } = useApp();
  
  const [filterTab, setFilterTab] = useState<'pending' | 'approved' | 'all' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicleForReject, setSelectedVehicleForReject] = useState<Vehicle | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Filter vehicles
  const pendingVehicles = vehicles.filter(v => v.status === 'pending' || !v.isVerified || v.approvalStatus === 'pending');
  const approvedVehicles = vehicles.filter(v => (v.status === 'available' || v.status === 'approved' || v.status === 'booked' || v.status === 'on_trip') && v.isVerified);
  const rejectedVehicles = vehicles.filter(v => v.status === 'rejected' || v.approvalStatus === 'rejected');

  const displayedVehicles = vehicles.filter(v => {
    // Tab filter
    if (filterTab === 'pending') {
      if (v.status !== 'pending' && v.isVerified && v.approvalStatus !== 'pending') return false;
    } else if (filterTab === 'approved') {
      if (!v.isVerified || v.status === 'pending' || v.status === 'rejected') return false;
    } else if (filterTab === 'rejected') {
      if (v.status !== 'rejected' && v.approvalStatus !== 'rejected') return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchPlate = v.vehicleNumber.toLowerCase().includes(q);
      const matchTransporter = v.transporterName.toLowerCase().includes(q);
      const matchPhone = v.transporterPhone.includes(q);
      const matchType = v.vehicleType.toLowerCase().includes(q);
      const matchLoc = v.currentLocation.toLowerCase().includes(q);
      if (!matchPlate && !matchTransporter && !matchPhone && !matchType && !matchLoc) {
        return false;
      }
    }

    return true;
  });

  const handleApprove = async (vehicle: Vehicle) => {
    setIsProcessing(vehicle.id);
    try {
      await approveVehicle(vehicle.id);
    } catch (e: any) {
      showToast(`Error approving vehicle: ${e?.message || 'Failed'}`);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleOpenRejectModal = (vehicle: Vehicle) => {
    setSelectedVehicleForReject(vehicle);
    setRejectReason('RC / Insurance compliance document verification incomplete or failed safety criteria.');
  };

  const handleConfirmReject = async () => {
    if (!selectedVehicleForReject) return;
    setIsProcessing(selectedVehicleForReject.id);
    try {
      await rejectVehicle(selectedVehicleForReject.id, rejectReason.trim());
      setSelectedVehicleForReject(null);
      setRejectReason('');
    } catch (e: any) {
      showToast(`Error rejecting vehicle: ${e?.message || 'Failed'}`);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => setFilterTab('pending')}
          className={`p-5 rounded-3xl border transition cursor-pointer ${
            filterTab === 'pending' 
              ? 'bg-amber-500 text-white border-amber-600 shadow-md' 
              : 'bg-white text-slate-800 border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex justify-between items-center text-xs font-semibold">
            <span>Pending Approvals</span>
            <ClockIcon className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black mt-2 font-mono">{pendingVehicles.length}</p>
          <span className={`text-[11px] font-medium mt-1 block ${filterTab === 'pending' ? 'text-amber-100' : 'text-amber-600'}`}>
            Requires Admin Review
          </span>
        </div>

        <div 
          onClick={() => setFilterTab('approved')}
          className={`p-5 rounded-3xl border transition cursor-pointer ${
            filterTab === 'approved' 
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md' 
              : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex justify-between items-center text-xs font-semibold">
            <span>Active Marketplace Fleet</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black mt-2 font-mono">{approvedVehicles.length}</p>
          <span className={`text-[11px] font-medium mt-1 block ${filterTab === 'approved' ? 'text-emerald-100' : 'text-emerald-600'}`}>
            Live for Customer Booking
          </span>
        </div>

        <div 
          onClick={() => setFilterTab('rejected')}
          className={`p-5 rounded-3xl border transition cursor-pointer ${
            filterTab === 'rejected' 
              ? 'bg-rose-600 text-white border-rose-700 shadow-md' 
              : 'bg-white text-slate-800 border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="flex justify-between items-center text-xs font-semibold">
            <span>Rejected / Compliance Hold</span>
            <XCircle className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black mt-2 font-mono">{rejectedVehicles.length}</p>
          <span className={`text-[11px] font-medium mt-1 block ${filterTab === 'rejected' ? 'text-rose-100' : 'text-rose-600'}`}>
            Blocked from Marketplace
          </span>
        </div>

        <div 
          onClick={() => setFilterTab('all')}
          className={`p-5 rounded-3xl border transition cursor-pointer ${
            filterTab === 'all' 
              ? 'bg-slate-900 text-white border-slate-950 shadow-md' 
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400'
          }`}
        >
          <div className="flex justify-between items-center text-xs font-semibold">
            <span>Total Registered Fleet</span>
            <Truck className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black mt-2 font-mono">{vehicles.length}</p>
          <span className={`text-[11px] font-medium mt-1 block ${filterTab === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
            All vehicles in cloud database
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterTab('pending')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
              filterTab === 'pending'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Pending Vehicle Approvals</span>
            <span className="bg-white text-amber-700 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold">
              {pendingVehicles.length}
            </span>
          </button>

          <button
            onClick={() => setFilterTab('approved')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
              filterTab === 'approved'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Active & Approved ({approvedVehicles.length})</span>
          </button>

          <button
            onClick={() => setFilterTab('rejected')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
              filterTab === 'rejected'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Rejected ({rejectedVehicles.length})</span>
          </button>

          <button
            onClick={() => setFilterTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
              filterTab === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>All Fleet ({vehicles.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plate, transporter, type..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Vehicles Grid / Queue */}
      {displayedVehicles.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800">
            {filterTab === 'pending' ? 'No vehicles awaiting approval' : 'No matching vehicles found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {filterTab === 'pending'
              ? 'All transporter vehicle registrations have been inspected and processed.'
              : 'Try clearing your search query or switching to another filter tab.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedVehicles.map(vehicle => {
            const isPending = vehicle.status === 'pending' || !vehicle.isVerified || vehicle.approvalStatus === 'pending';
            const isRejected = vehicle.status === 'rejected' || vehicle.approvalStatus === 'rejected';

            return (
              <div 
                key={vehicle.id} 
                className={`bg-white rounded-3xl border overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between ${
                  isPending 
                    ? 'border-amber-300 ring-2 ring-amber-400/20' 
                    : isRejected
                    ? 'border-rose-200 opacity-90'
                    : 'border-slate-200'
                }`}
              >
                {/* Image Header with Verification Badges */}
                <div className="relative h-44 bg-slate-900 overflow-hidden">
                  <VehicleImage
                    src={vehicle.imageUrl}
                    alt={vehicle.vehicleType}
                    vehicleType={vehicle.vehicleType}
                    vehicleCategory={vehicle.vehicleCategory}
                    isRefrigerated={vehicle.isRefrigerated}
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent"></div>

                  {/* Status Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {isPending ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-md">
                        <ClockIcon className="w-3 h-3" /> Pending Admin Approval
                      </span>
                    ) : isRejected ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-rose-600 text-white shadow-md">
                        <XCircle className="w-3 h-3" /> Rejected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-md">
                        <ShieldCheck className="w-3 h-3" /> Approved & Live
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-slate-200 backdrop-blur-sm">
                      {vehicle.vehicleCategory}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-extrabold text-base leading-tight">{vehicle.vehicleType}</h3>
                    <p className="text-xs text-amber-300 font-mono font-bold tracking-wider mt-0.5">
                      {vehicle.vehicleNumber}
                    </p>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-4 text-xs">
                  {/* Transporter Details */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Transporter Owner</span>
                      <span className="text-emerald-700 font-extrabold text-[11px]">⭐ {vehicle.transporterRating.toFixed(1)}</span>
                    </div>
                    <p className="font-extrabold text-slate-900 text-sm">{vehicle.transporterName}</p>
                    <div className="flex items-center gap-3 text-slate-600 text-[11px] pt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-blue-600" /> {vehicle.transporterPhone || 'No phone'}
                      </span>
                    </div>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-medium block">Payload Capacity</span>
                      <span className="font-bold text-slate-900 text-xs font-mono">{vehicle.capacityTon} Tons ({vehicle.capacityKg} kg)</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-medium block">Base Freight Fare</span>
                      <span className="font-bold text-emerald-600 text-xs font-mono">₹{vehicle.baseFare.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-slate-600">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <strong>Base Location:</strong> {vehicle.currentLocation}
                    </p>
                    {vehicle.preferredRoute && (
                      <p className="flex items-center gap-1.5 text-slate-500">
                        <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <strong>Route:</strong> {vehicle.preferredRoute}
                      </p>
                    )}
                    {vehicle.driverName && (
                      <p className="text-[11px] text-slate-500">
                        <strong>Driver:</strong> {vehicle.driverName} ({vehicle.driverPhone})
                      </p>
                    )}
                  </div>

                  {/* Rejection Notice if rejected */}
                  {isRejected && vehicle.rejectionReason && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-[11px] text-rose-800 space-y-1">
                      <span className="font-bold flex items-center gap-1 text-rose-900">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Rejection Rationale:
                      </span>
                      <p>{vehicle.rejectionReason}</p>
                    </div>
                  )}

                  {/* Admin Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex gap-2">
                    {isPending ? (
                      <>
                        <button
                          disabled={isProcessing === vehicle.id}
                          onClick={() => handleApprove(vehicle)}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isProcessing === vehicle.id ? 'Approving...' : 'Approve Vehicle'}</span>
                        </button>

                        <button
                          disabled={isProcessing === vehicle.id}
                          onClick={() => handleOpenRejectModal(vehicle)}
                          className="px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </>
                    ) : isRejected ? (
                      <button
                        disabled={isProcessing === vehicle.id}
                        onClick={() => handleApprove(vehicle)}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Re-Verify &amp; Approve Vehicle</span>
                      </button>
                    ) : (
                      <div className="w-full flex items-center justify-between text-slate-500">
                        <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Live in Customer Search
                        </span>
                        <button
                          onClick={() => handleOpenRejectModal(vehicle)}
                          className="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline"
                        >
                          Revoke Approval
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {selectedVehicleForReject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Reject Vehicle Verification</h3>
                <p className="text-xs text-slate-500">
                  {selectedVehicleForReject.vehicleNumber} • {selectedVehicleForReject.transporterName}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Provide the compliance or verification failure reason. The transporter will receive an instant notification with this feedback.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rejection Reason *</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                placeholder="e.g. RC copy blurry, Insurance expired, vehicle tonnage mismatch..."
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedVehicleForReject(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
