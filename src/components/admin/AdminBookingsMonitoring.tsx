import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookingOrder, OrderStatus } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';
import { LiveTrackingMap } from '../shared/LiveTrackingMap';
import { 
  Truck, Navigation, MapPin, Calendar, Phone, 
  Search, ShieldCheck, Clock, CheckCircle2, X 
} from 'lucide-react';

export const AdminBookingsMonitoring: React.FC = () => {
  const { allBookings, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [trackingOrder, setTrackingOrder] = useState<BookingOrder | null>(null);

  const filtered = allBookings.filter(b => {
    const matchesSearch = 
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.transporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.driverName && b.driverName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'active') {
      return matchesSearch && ['requested', 'accepted', 'assigned', 'trip_started', 'reached_pickup', 'loading_completed', 'in_transit', 'reached_destination'].includes(b.status);
    }
    if (statusFilter === 'completed') {
      return matchesSearch && ['delivered', 'completed'].includes(b.status);
    }
    return matchesSearch && b.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Bookings ({allBookings.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              statusFilter === 'active' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Live In-Transit Trips
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              statusFilter === 'completed' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Completed Orders
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search booking, truck number, driver..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3">Order ID &amp; Vehicle</th>
                <th className="px-5 py-3">Shipper / Customer</th>
                <th className="px-5 py-3">Transporter &amp; Driver</th>
                <th className="px-5 py-3">Route &amp; Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Gross / Net</th>
                <th className="px-5 py-3 text-right">GPS Telematics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 text-sm">No commercial bookings found</p>
                    <span className="text-[11px] text-slate-500">Commercial loads and vehicle dispatch bookings will be monitored here in real-time.</span>
                  </td>
                </tr>
              ) : (
                filtered.map(b => (
                <tr key={b.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-4">
                    <span className="font-mono font-bold text-slate-900 block text-xs">{b.id}</span>
                    <span className="text-[11px] text-blue-600 font-semibold">{b.vehicleType}</span>
                    <span className="font-mono text-[10px] text-slate-400 block">{b.vehicleNumber}</span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-bold text-slate-900 block">{b.customerName}</span>
                    <span className="text-[11px] text-slate-500">{b.customerCompany}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">{b.customerPhone}</span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-bold text-slate-900 block">{b.transporterName}</span>
                    <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-0.5">
                      <Navigation className="w-3 h-3 text-indigo-600" />
                      <span>Driver: <strong>{b.driverName || 'Assigned'}</strong> ({b.driverPhone})</span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-xs text-slate-800 font-bold block">{b.pickupLocation} → {b.deliveryLocation}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-400" /> Pickup: {b.pickupDate}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={b.status} size="sm" />
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-mono font-black text-slate-900 block">₹{b.totalAmount.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold block">
                      Payout: ₹{b.transporterPayableAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Comm (5%): ₹{b.adminCommissionAmount.toLocaleString('en-IN')}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setTrackingOrder(b)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[11px] inline-flex items-center gap-1 shadow-sm transition"
                    >
                      <Navigation className="w-3 h-3" /> Live GPS
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GPS Modal */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Live Highway GPS Telematics: {trackingOrder.id}
                </h3>
                <p className="text-xs text-slate-500">
                  Vehicle: {trackingOrder.vehicleNumber} ({trackingOrder.vehicleType}) • Driver: {trackingOrder.driverName}
                </p>
              </div>
              <button 
                onClick={() => setTrackingOrder(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                Close
              </button>
            </div>
            <LiveTrackingMap order={trackingOrder} />
          </div>
        </div>
      )}
    </div>
  );
};
