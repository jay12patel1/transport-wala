import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookingOrder, OrderStatus } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';
import { LiveTrackingMap } from '../shared/LiveTrackingMap';
import { ChatModal } from '../shared/ChatModal';
import { InvoiceModal } from '../shared/InvoiceModal';
import { ComplaintModal } from '../shared/ComplaintModal';
import { 
  Navigation, MessageSquare, FileText, AlertTriangle, 
  MapPin, Calendar, Clock, Phone, ChevronRight, CheckCircle2, 
  Truck, ArrowRight, ShieldCheck 
} from 'lucide-react';

export const CustomerBookings: React.FC = () => {
  const { bookings, user, t, setScreen, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  
  // Modals state
  const [trackingOrder, setTrackingOrder] = useState<BookingOrder | null>(null);
  const [chatOrder, setChatOrder] = useState<BookingOrder | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<BookingOrder | null>(null);
  const [complaintOrder, setComplaintOrder] = useState<BookingOrder | null>(null);

  // Filter bookings for current customer
  const customerBookings = bookings.filter(b => b.customerId === user.id);

  const filteredBookings = customerBookings.filter(b => {
    if (activeTab === 'active') {
      return ['requested', 'accepted', 'assigned', 'trip_started', 'reached_pickup', 'loading_completed', 'in_transit', 'reached_destination'].includes(b.status);
    }
    if (activeTab === 'completed') {
      return ['delivered', 'completed'].includes(b.status);
    }
    if (activeTab === 'cancelled') {
      return ['rejected', 'cancelled'].includes(b.status);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            My Freight Bookings & Orders
          </h1>
          <p className="text-xs text-slate-500">
            Track live vehicle GPS, chat with transporters, view GST invoices, and inspect full order activity logs.
          </p>
        </div>

        <button
          onClick={() => setScreen('home')}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition"
        >
          <Truck className="w-4 h-4" /> Book New Commercial Vehicle
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
        {[
          { key: 'all', label: `All Orders (${customerBookings.length})` },
          { key: 'active', label: `Active & In-Transit (${customerBookings.filter(b => !['delivered', 'completed', 'cancelled', 'rejected'].includes(b.status)).length})` },
          { key: 'completed', label: `Completed (${customerBookings.filter(b => ['delivered', 'completed'].includes(b.status)).length})` },
          { key: 'cancelled', label: `Cancelled (${customerBookings.filter(b => ['cancelled', 'rejected'].includes(b.status)).length})` }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === tab.key 
                ? 'bg-slate-900 text-white shadow' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800">No bookings found in this view</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Search for available commercial vehicles to place your first dispatch booking.
          </p>
          <button
            onClick={() => setScreen('home')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
          >
            Find Vehicles
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBookings.map(order => {
            const isLive = ['trip_started', 'reached_pickup', 'loading_completed', 'in_transit'].includes(order.status);
            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition"
              >
                {/* Order Top Bar */}
                <div className="bg-slate-900 text-white p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-white">{order.id}</span>
                        <StatusBadge status={order.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-300">
                        {order.vehicleType} ({order.vehicleNumber}) • {order.transporterName}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Amount</span>
                    <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-emerald-300 block font-semibold">
                      ✓ GST & Toll Included
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 sm:p-6 space-y-5">
                  {/* Route & Timing details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-slate-500 font-medium block">Pickup Point</span>
                      <p className="font-bold text-slate-900 mt-1 flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{order.pickupLocation}</span>
                      </p>
                      <span className="text-[11px] text-slate-500 block mt-1">Date: {order.pickupDate}</span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-slate-500 font-medium block">Delivery Destination</span>
                      <p className="font-bold text-slate-900 mt-1 flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{order.deliveryLocation}</span>
                      </p>
                      <span className="text-[11px] text-slate-500 block mt-1">Dedicated Transport</span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-slate-500 font-medium block">Driver &amp; Telematics</span>
                      <p className="font-bold text-slate-900 mt-1">
                        {order.driverName || 'Driver Assigned'}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Phone: {['accepted', 'assigned', 'trip_started', 'reached_pickup', 'loading_completed', 'in_transit', 'reached_destination', 'delivered', 'completed'].includes(order.status)
                          ? (order.driverPhone || order.transporterPhone)
                          : '+91 XXXXX-XXXXX (Hidden until approval)'}
                      </p>
                      {isLive && (
                        <span className="inline-block text-[10px] font-bold text-blue-600 animate-pulse mt-1">
                          ● GPS Live Telematics Broadcasting
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 12-Step Activity Timeline Preview */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Order Journey Timeline
                    </h4>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 divide-y divide-slate-200 text-xs">
                      {order.events.map((ev, idx) => (
                        <div key={ev.id || idx} className="py-2 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-slate-900">{ev.title}</span>
                              <p className="text-[11px] text-slate-600">{ev.description}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">{ev.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                    {/* Live Track Button */}
                    <button
                      onClick={() => setTrackingOrder(order)}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow transition"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Live GPS Tracking
                    </button>

                    {/* Chat Button */}
                    <button
                      onClick={() => setChatOrder(order)}
                      className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl font-bold flex items-center gap-1.5 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" /> Chat Transporter
                    </button>

                    {/* Call Driver */}
                    {['accepted', 'assigned', 'trip_started', 'reached_pickup', 'loading_completed', 'in_transit', 'reached_destination', 'delivered', 'completed'].includes(order.status) ? (
                      <button
                        onClick={() => showToast(`Dialing Driver (${order.driverPhone || order.transporterPhone})...`)}
                        className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl font-bold flex items-center gap-1.5 transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" /> Call Driver
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-3.5 py-2.5 bg-slate-100 border border-slate-200 text-slate-400 rounded-xl font-bold flex items-center gap-1.5 cursor-not-allowed"
                        title="Contact numbers will be visible after booking approval"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> Available after approval
                      </button>
                    )}

                    {/* Tax Invoice */}
                    <button
                      onClick={() => setInvoiceOrder(order)}
                      className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl font-bold flex items-center gap-1.5 transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" /> GST Tax Invoice
                    </button>

                    {/* Raise Complaint */}
                    <button
                      onClick={() => setComplaintOrder(order)}
                      className="px-3 py-2.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl font-bold flex items-center gap-1.5 transition ml-auto"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Raise Issue
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Live Highway Telematics</h3>
                <p className="text-xs text-slate-500">Order: {trackingOrder.id} • {trackingOrder.vehicleNumber}</p>
              </div>
              <button 
                onClick={() => setTrackingOrder(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
              >
                Close
              </button>
            </div>

            <LiveTrackingMap 
              order={trackingOrder} 
              onCallDriver={() => showToast(`Calling ${trackingOrder.driverName}...`)}
              onOpenChat={() => {
                const o = trackingOrder;
                setTrackingOrder(null);
                setChatOrder(o);
              }}
            />
          </div>
        </div>
      )}

      {chatOrder && (
        <ChatModal order={chatOrder} onClose={() => setChatOrder(null)} />
      )}

      {invoiceOrder && (
        <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />
      )}

      {complaintOrder && (
        <ComplaintModal order={complaintOrder} onClose={() => setComplaintOrder(null)} />
      )}
    </div>
  );
};
