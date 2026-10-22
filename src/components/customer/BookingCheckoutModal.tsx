import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Vehicle, BookingOrder } from '../../types';
import { 
  X, ShieldCheck, Truck, MapPin, Calendar, CreditCard, 
  CheckCircle2, ArrowRight, Info, AlertTriangle, FileText 
} from 'lucide-react';

interface BookingCheckoutModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onBookingSuccess: (order: BookingOrder) => void;
}

export const BookingCheckoutModal: React.FC<BookingCheckoutModalProps> = ({ 
  vehicle, 
  onClose, 
  onBookingSuccess 
}) => {
  const { user, searchQuery, adminSettings, createBooking } = useApp();

  const [pickup, setPickup] = useState(searchQuery.pickup || 'Ahmedabad');
  const [destination, setDestination] = useState(searchQuery.destination || 'Mumbai');
  const [date, setDate] = useState(searchQuery.date || new Date().toISOString().split('T')[0]);
  const [goodsDescription, setGoodsDescription] = useState('Industrial Goods & Machinery Parts');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash' | 'neft'>('online');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Financial calculations
  const base = vehicle.baseFare;
  const loading = adminSettings.loadingChargeDefault;
  const unloading = adminSettings.unloadingChargeDefault;
  const toll = adminSettings.tollChargeEstimated;
  const subtotal = base + loading + unloading + toll;
  const gst = Math.round(subtotal * (adminSettings.gstPercentage / 100));
  const total = subtotal + gst;

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup.trim() || !destination.trim() || !date) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const order = createBooking(
        vehicle, 
        pickup.trim(), 
        destination.trim(), 
        date, 
        goodsDescription
      );
      setIsSubmitting(false);
      onBookingSuccess(order);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Confirm Booking & Checkout</h3>
              <p className="text-xs text-slate-300">
                {vehicle.vehicleType} • {vehicle.transporterName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirmBooking} className="p-6 space-y-5 text-xs sm:text-sm text-slate-800">
          {/* Pickup & Drop Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Pickup Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="e.g. Sanand GIDC, Ahmedabad"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Delivery Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-rose-600 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. JNPT Port, Mumbai"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Pickup Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-blue-600 absolute left-3 top-3" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Consignment / Goods Type</label>
              <input
                type="text"
                required
                value={goodsDescription}
                onChange={(e) => setGoodsDescription(e.target.value)}
                placeholder="e.g. FMCG cartons / Auto components"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Transparent Fare Breakdown Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
              Transparent Fare Calculation
            </h4>

            <div className="flex justify-between text-xs text-slate-600">
              <span>Base Freight ({vehicle.vehicleType}):</span>
              <span className="font-mono font-semibold text-slate-900">₹{base.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between text-xs text-slate-600">
              <span>Loading Crew Assistance:</span>
              <span className="font-mono text-slate-900">₹{loading.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between text-xs text-slate-600">
              <span>Unloading Crew Assistance:</span>
              <span className="font-mono text-slate-900">₹{unloading.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between text-xs text-slate-600">
              <span>National Highway Toll & FASTag:</span>
              <span className="font-mono text-slate-900">₹{toll.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between text-xs text-slate-600 pt-1 border-t border-slate-200">
              <span>GST ({adminSettings.gstPercentage}%):</span>
              <span className="font-mono text-slate-900">₹{gst.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
              <span>Total Payable Amount:</span>
              <span className="font-mono text-blue-700 text-base">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Payment Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                  paymentMethod === 'online' ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span className="text-xs">UPI / NetBanking</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('neft')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                  paymentMethod === 'neft' ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-xs">Corporate RTGS</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                  paymentMethod === 'cash' ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <Truck className="w-4 h-4 text-blue-600" />
                <span className="text-xs">Pay on Loading</span>
              </button>
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="terms" className="text-[11px] text-slate-600 leading-tight">
              I agree to the commercial transit terms, verified driver telematics logging, and cancellation policy.
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!agreedTerms || isSubmitting}
              className="flex-2 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition"
            >
              {isSubmitting ? (
                <span>Securing Booking...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Pay & Confirm (₹{total.toLocaleString('en-IN')})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
