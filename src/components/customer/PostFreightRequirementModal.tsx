import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, Truck, MapPin, Calendar, Scale, 
  IndianRupee, Send, Sparkles, CheckCircle2, AlertCircle 
} from 'lucide-react';

interface PostFreightRequirementModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const PostFreightRequirementModal: React.FC<PostFreightRequirementModalProps> = ({ 
  onClose,
  onSuccess 
}) => {
  const { user, addFreightRequirement, showToast } = useApp();

  const [pickupLocation, setPickupLocation] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [vehicleType, setVehicleType] = useState('32 ft Container');
  const [quantityRequired, setQuantityRequired] = useState(1);
  const [goodsDescription, setGoodsDescription] = useState('');
  const [targetBudgetPerVehicle, setTargetBudgetPerVehicle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vehicleOptions = [
    '32 ft Container',
    '30 ft Container',
    '20 ft Container',
    'Milk Tanker / Milk Tencor',
    'Loading Truck',
    'Refer Vehicle / Refrigerated Vehicle',
    'Trailer',
    'Tata 407',
    'Tencor / Tenkor',
    'Open Flatbed Truck'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pickupLocation.trim()) {
      setError('Please specify the pickup city or loading point.');
      return;
    }
    if (!deliveryLocation.trim()) {
      setError('Please specify the delivery destination or unloading point.');
      return;
    }
    if (!pickupDate) {
      setError('Please select the required pickup date.');
      return;
    }
    if (quantityRequired < 1) {
      setError('Number of trucks required must be at least 1.');
      return;
    }
    if (!goodsDescription.trim()) {
      setError('Please provide a brief cargo description (e.g. FMCG cartons, ceramic tiles, dairy, steel coils).');
      return;
    }

    setSubmitting(true);
    try {
      addFreightRequirement({
        customerId: user.id,
        customerName: user.fullName || 'Shipper Cargo Owner',
        customerPhone: user.phone || '+91 97255 06630',
        pickupLocation: pickupLocation.trim(),
        deliveryLocation: deliveryLocation.trim(),
        pickupDate: pickupDate,
        vehicleType: vehicleType,
        quantityRequired: Number(quantityRequired),
        goodsDescription: goodsDescription.trim(),
        targetBudgetPerVehicle: targetBudgetPerVehicle ? Number(targetBudgetPerVehicle) : undefined
      });

      showToast(`Bulk requirement for ${quantityRequired} ${vehicleType} broadcasted to all registered transporters!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to broadcast freight requirement.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-6 rounded-t-3xl relative">
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Bulk Load Broadcast
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Post Freight Requirement
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Broadcast customized freight &amp; bulk truck requirements across all verified transporters.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Route: Pickup & Delivery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Pickup City / Hub <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="e.g. Ahmedabad, Anand, Morbi"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Delivery Destination <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-rose-600 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="e.g. Mumbai, JNPT Port, Delhi NCR"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Date & Vehicle Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Required Pickup Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-blue-600 absolute left-3 top-3" />
                <input
                  type="date"
                  required
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Vehicle Category <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Truck className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {vehicleOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quantity & Target Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Quantity of Trucks Needed <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Scale className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={quantityRequired}
                  onChange={(e) => setQuantityRequired(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">e.g. 5 Container trucks for factory dispatch</span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Target Budget Per Vehicle (₹) <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                <input
                  type="number"
                  min={1000}
                  step={500}
                  value={targetBudgetPerVehicle}
                  onChange={(e) => setTargetBudgetPerVehicle(e.target.value)}
                  placeholder="e.g. 28000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Suggested freight rate per vehicle</span>
            </div>
          </div>

          {/* Cargo / Goods Description */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Cargo &amp; Material Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={goodsDescription}
              onChange={(e) => setGoodsDescription(e.target.value)}
              placeholder="e.g. 400 cardboard cartons of FMCG food items, total approx 12 Tons. Requires covered body and clean dry floor."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Privacy Note */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl text-blue-900 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Verified Transporter Broadcast:</strong> Your freight requirement will be instantly notified to all registered transporters on Transport Wala. Transporters can accept and dedicate fleet to fulfill your order.
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-lg shadow-blue-500/20 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? 'Broadcasting...' : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Broadcast Load to Transporters</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
