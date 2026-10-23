import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookingOrder, OrderStatus } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';
import { AddVehicleModal } from './AddVehicleModal';
import { LiveTrackingMap } from '../shared/LiveTrackingMap';
import { ChatModal } from '../shared/ChatModal';
import { 
  Truck, PlusCircle, FileText, Wallet, CheckCircle2, 
  XCircle, Clock, MapPin, Phone, MessageSquare, 
  Navigation, ShieldCheck, ArrowRight, User, Briefcase,
  PackageCheck, IndianRupee, Send
} from 'lucide-react';

export const TransporterDashboard: React.FC = () => {
  const { 
    user, vehicles, bookings, earnings, 
    updateOrderStatus, setScreen, showToast,
    jobVacancies, jobApplications,
    freightRequirements, updateFreightRequirementStatus
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<BookingOrder | null>(null);
  const [activeChatOrder, setActiveChatOrder] = useState<BookingOrder | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);

  const myJobVacancies = jobVacancies.filter(j => j.transporterId === user.id);
  const myReceivedApps = jobApplications.filter(a => myJobVacancies.some(v => v.id === a.jobId) || a.jobId.includes(user.id));

  // Transporter specific data
  const myVehicles = vehicles.filter(v => v.ownerId === user.id);
  const myBookings = bookings.filter(b => b.transporterId === user.id);
  const myEarnings = earnings.filter(e => e.transporterId === user.id);

  const pendingRequests = myBookings.filter(b => b.status === 'requested');
  const activeTrips = myBookings.filter(b => 
    ['accepted', 'assigned', 'trip_started', 'reached_pickup', 'loading_completed', 'in_transit', 'reached_destination'].includes(b.status)
  );
  const openRequirements = freightRequirements.filter(r => r.status === 'open');

  const totalEarnings = myEarnings.reduce((acc, curr) => acc + curr.netEarnings, 0);

  const handleAccept = (orderId: string) => {
    updateOrderStatus(orderId, 'accepted');
  };

  const handleReject = (orderId: string) => {
    updateOrderStatus(orderId, 'rejected', rejectReason || 'Vehicle unavailable');
    setRejectingOrderId(null);
    setRejectReason('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner with Fleet Operator Profile */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Fleet Operator Control Hub
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> GST Verified Partner
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{user.companyName}</h1>
          <p className="text-xs text-slate-300 mt-1">
            Transporter Lead: <strong>{user.fullName}</strong> • Phone: {user.phone} • GST: {user.gstNumber}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setScreen('my_drivers')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow flex items-center gap-1.5 transition"
          >
            <Briefcase className="w-4 h-4" /> Post Driver Vacancy
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition"
          >
            <PlusCircle className="w-4 h-4" /> Add Vehicle
          </button>
          <button
            onClick={() => setScreen('my_documents')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <FileText className="w-4 h-4" /> Compliance Docs
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setScreen('my_vehicles')}
          className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-300 transition"
        >
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Fleet Vehicles</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{myVehicles.length}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {myVehicles.filter(v => v.status === 'available').length} Available Now
          </span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Booking Requests</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{pendingRequests.length}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Pending approval</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Active Trips</span>
            <Navigation className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-indigo-600 mt-2">{activeTrips.length}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">GPS broadcasting</span>
        </div>

        <div 
          onClick={() => setScreen('earnings')}
          className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm cursor-pointer hover:border-emerald-300 transition"
        >
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Total Net Payouts</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2 font-mono">
            ₹{totalEarnings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">5% Platform split applied</span>
        </div>
      </div>

      {/* Commercial Driver Recruitment & Vacancy Card */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/60 rounded-3xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-slate-900">Commercial Driver Recruitment &amp; Vacancies</h3>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                {myJobVacancies.filter(v => v.status === 'open').length} Active Ads
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {myReceivedApps.length} driver resumes received • Post hiring vacancies for 32ft Containers, Flatbed Trailers, and Tankers.
            </p>
          </div>
        </div>

        <button
          onClick={() => setScreen('my_drivers')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition"
        >
          <span>View Resumes &amp; Vacancies</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Marketplace Load Inquiries / Customer Bulk Requirements Section */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 bg-gradient-to-r from-amber-900 via-slate-900 to-amber-950 text-white flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-sm text-white">
              Marketplace Load Inquiries / Customer Requirements ({openRequirements.length})
            </h3>
          </div>
          <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-full">
            Real-Time Shipper Demands
          </span>
        </div>

        <div className="p-5 divide-y divide-slate-100">
          {openRequirements.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No open customer load inquiries at the moment. As shippers post bulk truck demands, they will broadcast here for immediate fleet allocation.
            </div>
          ) : (
            openRequirements.map(req => (
              <div key={req.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">{req.id}</span>
                    <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold">
                      {req.quantityRequired}x {req.vehicleType}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-700 font-bold">
                    Shipper: {req.customerName} • <span className="text-slate-400 font-mono">+91 XXXXX-XXXXX (Revealed on acceptance)</span>
                  </p>
                  <p className="text-slate-600 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <strong>Route:</strong> {req.pickupLocation} → {req.deliveryLocation} (Pickup: {req.pickupDate})
                  </p>
                  <p className="text-slate-500 text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-100 mt-1">
                    <strong>Cargo:</strong> {req.goodsDescription}
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Target Budget</span>
                    <span className="font-mono font-black text-emerald-600 text-base">
                      {req.targetBudgetPerVehicle ? `₹${req.targetBudgetPerVehicle.toLocaleString('en-IN')}/trk` : 'Negotiable'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      updateFreightRequirementStatus(req.id, 'fulfilled');
                      showToast(`Accepted inquiry ${req.id} for ${req.quantityRequired}x ${req.vehicleType}! Dedicated fleet allocated.`);
                    }}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition whitespace-nowrap"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Quote / Accept Request</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Booking Requests Queue */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-sm text-white">
              Incoming Customer Booking Requests ({pendingRequests.length})
            </h3>
          </div>
        </div>

        <div className="p-5 divide-y divide-slate-100">
          {pendingRequests.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No new booking requests at the moment. Your available vehicles are visible in customer search.
            </div>
          ) : (
            pendingRequests.map(req => (
              <div key={req.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">{req.id}</span>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold">
                      {req.vehicleType}
                    </span>
                  </div>
                  <p className="text-slate-600 font-semibold mt-1">
                    Customer: {req.customerName} ({req.customerCompany}) • <span className="text-slate-400 font-mono">+91 XXXXX-XXXXX (Hidden until approval)</span>
                  </p>
                  <p className="text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <strong>Route:</strong> {req.pickupLocation} → {req.deliveryLocation} (Pickup: {req.pickupDate})
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Net Payout</span>
                    <span className="font-mono font-black text-emerald-600 text-base">
                      ₹{req.transporterPayableAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(req.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1 shadow"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button
                      onClick={() => setRejectingOrderId(req.id)}
                      className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl font-semibold"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Active Trips Dispatch & Tracking Panel */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-400" />
            <h3 className="font-extrabold text-sm text-white">
              Active Trips & Fleet Dispatch ({activeTrips.length})
            </h3>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {activeTrips.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No active trips right now. Accept pending requests to start dispatches.
            </div>
          ) : (
            activeTrips.map(trip => (
              <div 
                key={trip.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 text-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">{trip.id}</span>
                    <span className="font-bold text-slate-700">({trip.vehicleNumber})</span>
                    <StatusBadge status={trip.status} size="sm" />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTrackingOrder(trip)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-sm"
                    >
                      <Navigation className="w-3.5 h-3.5" /> View GPS Telematics
                    </button>
                    <button
                      onClick={() => setActiveChatOrder(trip)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg font-bold flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" /> Chat Customer
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Customer</span>
                    <span className="font-semibold text-slate-900">{trip.customerName} ({trip.customerPhone})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Assigned Driver</span>
                    <span className="font-semibold text-slate-900">{trip.driverName || 'Suresh'} ({trip.driverPhone})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Route</span>
                    <span className="font-semibold text-slate-900 truncate block">{trip.pickupLocation} → {trip.deliveryLocation}</span>
                  </div>
                </div>

                {/* Transporter Lifecycle Progression Quick Actions */}
                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Update Status:</span>

                  {trip.status === 'accepted' && (
                    <button
                      onClick={() => updateOrderStatus(trip.id, 'trip_started')}
                      className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold text-xs"
                    >
                      Start Trip
                    </button>
                  )}

                  {trip.status === 'trip_started' && (
                    <button
                      onClick={() => updateOrderStatus(trip.id, 'reached_pickup')}
                      className="px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold text-xs"
                    >
                      Vehicle At Pickup
                    </button>
                  )}

                  {trip.status === 'reached_pickup' && (
                    <button
                      onClick={() => updateOrderStatus(trip.id, 'loading_completed')}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs"
                    >
                      Loading Done
                    </button>
                  )}

                  {trip.status === 'loading_completed' && (
                    <button
                      onClick={() => updateOrderStatus(trip.id, 'in_transit')}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs"
                    >
                      In-Transit (NH48 Highway)
                    </button>
                  )}

                  {trip.status === 'in_transit' && (
                    <button
                      onClick={() => updateOrderStatus(trip.id, 'reached_destination')}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs"
                    >
                      At Destination Port/Hub
                    </button>
                  )}

                  {trip.status === 'reached_destination' && (
                    <button
                      onClick={() => updateOrderStatus(trip.id, 'delivered')}
                      className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs"
                    >
                      Goods Delivered
                    </button>
                  )}

                  {trip.status === 'delivered' && (
                    <button
                      onClick={() => updateOrderStatus(trip.id, 'completed')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow"
                    >
                      Complete Order & Generate Payout
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingOrderId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Reason for rejecting booking</h3>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Vehicle already committed for return load / driver unavailable"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
            />
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setRejectingOrderId(null)}
                className="flex-1 py-2 border rounded-xl font-bold text-xs text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectingOrderId)}
                className="flex-1 py-2 bg-rose-600 text-white rounded-xl font-bold text-xs"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && <AddVehicleModal onClose={() => setShowAddModal(false)} />}

      {/* Tracking Modal */}
      {activeTrackingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Live Highway GPS Telematics</h3>
              <button 
                onClick={() => setActiveTrackingOrder(null)}
                className="px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-700"
              >
                Close
              </button>
            </div>
            <LiveTrackingMap order={activeTrackingOrder} />
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {activeChatOrder && (
        <ChatModal order={activeChatOrder} onClose={() => setActiveChatOrder(null)} />
      )}
    </div>
  );
};
