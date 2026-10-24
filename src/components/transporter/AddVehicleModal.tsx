import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Vehicle } from '../../types';
import { 
  X, Truck, FileText, Upload, ShieldCheck, 
  MapPin, Scale, PlusCircle, ThermometerSnowflake,
  Image as ImageIcon, CheckCircle2
} from 'lucide-react';
import { VEHICLE_TYPE_CATALOG, getVehicleImage } from '../../utils/vehicleImages';
import { VehicleImage } from '../shared/VehicleImage';

interface AddVehicleModalProps {
  onClose: () => void;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ onClose }) => {
  const { addVehicle } = useApp();

  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('30 ft Container');
  const [vehicleCategory, setVehicleCategory] = useState<Vehicle['vehicleCategory']>('Container');
  const [vehicleSize, setVehicleSize] = useState('30 ft x 8 ft x 8.5 ft High Cube Container');
  const [capacityTon, setCapacityTon] = useState<number>(15);
  const [currentLocation, setCurrentLocation] = useState('Ahmedabad');
  const [preferredRoute, setPreferredRoute] = useState('Ahmedabad → Mumbai / Pune');
  const [baseFare, setBaseFare] = useState<number>(28500);
  const [perKmRate, setPerKmRate] = useState<number>(52);
  const [isRefrigerated, setIsRefrigerated] = useState(false);
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [description, setDescription] = useState('');

  // Handle vehicle type selection to auto-fill realistic parameters and authentic vehicle image
  const handleVehicleTypeChange = (selectedTypeName: string) => {
    setVehicleType(selectedTypeName);
    const spec = VEHICLE_TYPE_CATALOG.find(v => v.name === selectedTypeName);
    if (spec) {
      setVehicleCategory(spec.category);
      setVehicleSize(spec.defaultSize);
      setCapacityTon(spec.defaultCapacityTon);
      setBaseFare(spec.defaultFare);
      setPerKmRate(spec.defaultPerKm);
      setIsRefrigerated(spec.isRefrigerated);
      if (!description || description.startsWith('High-performance')) {
        setDescription(spec.description);
      }
    }
  };

  const previewImage = customImageUrl.trim() || getVehicleImage(vehicleType, vehicleCategory, isRefrigerated);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNumber.trim()) return;

    addVehicle({
      vehicleNumber: vehicleNumber.toUpperCase().trim(),
      vehicleType,
      vehicleCategory,
      vehicleSize,
      capacityTon: Number(capacityTon),
      capacityKg: Number(capacityTon) * 1000,
      currentLocation,
      preferredRoute,
      baseFare: Number(baseFare),
      perKmRate: Number(perKmRate),
      isRefrigerated,
      status: 'pending',
      isVerified: false,
      approvalStatus: 'pending',
      driverName: driverName || 'Designated Fleet Driver',
      driverPhone: driverPhone || '9825012345',
      imageUrl: previewImage,
      description: description || `RTO verified ${vehicleType} commercial freight vehicle.`
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Add New Commercial Vehicle</h3>
              <p className="text-xs text-slate-300">Submit vehicle details & authentic image for Admin verification</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs sm:text-sm text-slate-800">
          
          {/* Vehicle Type & Live Image Preview Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-600" /> Commercial Vehicle Category & Image
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {vehicleCategory}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Vehicle Type *</label>
                <select
                  value={vehicleType}
                  onChange={(e) => handleVehicleTypeChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {VEHICLE_TYPE_CATALOG.map(spec => (
                    <option key={spec.name} value={spec.name}>
                      {spec.name} ({spec.defaultCapacityTon} Ton)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  Choosing a type automatically assigns the verified commercial transport image and standard payload specifications.
                </p>
              </div>

              {/* Verified Image Preview Card */}
              <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-950 h-28 shadow-inner group">
                <VehicleImage 
                  src={previewImage} 
                  alt={vehicleType}
                  vehicleType={vehicleType}
                  vehicleCategory={vehicleCategory}
                  isRefrigerated={isRefrigerated}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end justify-between p-2.5">
                  <div className="text-white">
                    <span className="text-[11px] font-extrabold block leading-tight">{vehicleType}</span>
                    <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Authentic Verified Photo
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Number & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Registration Number *</label>
              <input
                type="text"
                required
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="e.g. GJ-01-AX-9944"
                className="w-full uppercase font-mono bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Category</label>
              <select
                value={vehicleCategory}
                onChange={(e) => setVehicleCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Container">Container</option>
                <option value="Tanker">Tanker (Milk / Liquid)</option>
                <option value="Open Truck">Open Truck / Loading</option>
                <option value="Closed Body">Closed Body</option>
                <option value="Trailer">Trailer</option>
                <option value="Special">Special / Cold Chain</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payload Capacity (Tons)</label>
              <input
                type="number"
                required
                min={1}
                max={60}
                value={capacityTon}
                onChange={(e) => setCapacityTon(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Base Location / Hub</label>
              <input
                type="text"
                required
                value={currentLocation}
                onChange={(e) => setCurrentLocation(e.target.value)}
                placeholder="e.g. Ahmedabad, Surat"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Base Freight Rate (₹)</label>
              <input
                type="number"
                required
                min={1000}
                value={baseFare}
                onChange={(e) => setBaseFare(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Transit Route</label>
              <input
                type="text"
                value={preferredRoute}
                onChange={(e) => setPreferredRoute(e.target.value)}
                placeholder="e.g. Ahmedabad → Mumbai / JNPT"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dimensions / Physical Size</label>
              <input
                type="text"
                value={vehicleSize}
                onChange={(e) => setVehicleSize(e.target.value)}
                placeholder="e.g. 30 ft x 8 ft x 8.5 ft HQ"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Refrigerated toggle */}
          <div className="p-3.5 bg-cyan-50/60 rounded-2xl border border-cyan-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ThermometerSnowflake className="w-5 h-5 text-cyan-700" />
              <div>
                <p className="font-bold text-xs text-cyan-950">Is this a Refrigerated / Reefer Vehicle?</p>
                <p className="text-[11px] text-cyan-700">Digital temperature control (-20°C to +15°C) for pharma/dairy</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isRefrigerated}
              onChange={(e) => setIsRefrigerated(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
          </div>

          {/* Driver Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Designated Driver Name</label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="e.g. Suresh Kumar"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Driver Contact Phone</label>
              <input
                type="tel"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                placeholder="e.g. 9898054321"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Documents Notice */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Mandatory Compliance:
            </span>
            <p>Upon submission, initial RC and Insurance digital attachments will be auto-generated and submitted into the Admin Verification Queue. You can upload updated PDFs anytime from My Documents.</p>
          </div>

          {/* Submit */}
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
              className="flex-2 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition"
            >
              <PlusCircle className="w-4 h-4" /> Add Vehicle & Submit for Verification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

