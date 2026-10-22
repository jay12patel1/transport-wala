import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Vehicle, VehicleStatus } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';
import { VehicleImage } from '../shared/VehicleImage';
import { AddVehicleModal } from './AddVehicleModal';
import { 
  Truck, Plus, MapPin, Scale, ShieldCheck, 
  ShieldAlert, ThermometerSnowflake, Settings, ToggleLeft, ToggleRight, FileText 
} from 'lucide-react';

export const MyVehicles: React.FC = () => {
  const { user, vehicles, updateVehicleStatus, setScreen } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter vehicles owned by current transporter
  const myVehicles = vehicles.filter(v => v.ownerId === user.id);

  const handleStatusToggle = (vehicle: Vehicle, newStatus: VehicleStatus) => {
    updateVehicleStatus(vehicle.id, newStatus);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            My Commercial Fleet ({myVehicles.length})
          </h1>
          <p className="text-xs text-slate-500">
            Manage vehicle availability, update status, track driver assignments, and inspect document verification.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" /> Add Commercial Vehicle
        </button>
      </div>

      {/* Fleet Cards Grid */}
      {myVehicles.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800">No vehicles in your fleet yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Register your 20ft/30ft container, Tata 407, Reefer or Tenkor truck to start receiving commercial transport bookings.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
          >
            Add Your First Vehicle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myVehicles.map(vehicle => (
            <div
              key={vehicle.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              {/* Image & Header */}
              <div className="relative h-44 bg-slate-900 overflow-hidden">
                <VehicleImage
                  src={vehicle.imageUrl}
                  alt={vehicle.vehicleType}
                  vehicleType={vehicle.vehicleType}
                  vehicleCategory={vehicle.vehicleCategory}
                  isRefrigerated={vehicle.isRefrigerated}
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <StatusBadge status={vehicle.status} size="sm" />
                  {vehicle.isVerified ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow">
                      <ShieldAlert className="w-3 h-3" /> Docs Pending
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-extrabold text-base">{vehicle.vehicleType}</h3>
                  <p className="text-xs text-slate-300 font-mono">{vehicle.vehicleNumber}</p>
                </div>
              </div>

              {/* Specs & Status Control */}
              <div className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium block">Payload Tonnage</span>
                    <span className="font-bold text-slate-900 text-sm">{vehicle.capacityTon} Tons</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium block">Base Freight</span>
                    <span className="font-bold text-emerald-600 text-sm font-mono">₹{vehicle.baseFare.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="space-y-1 text-slate-600">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <strong>Location:</strong> {vehicle.currentLocation}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <strong>Driver:</strong> {vehicle.driverName || 'Not Assigned'} ({vehicle.driverPhone || 'N/A'})
                  </p>
                </div>

                {/* Status Switcher Selector */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                    Live Operational Status
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleStatusToggle(vehicle, 'available')}
                      className={`py-1.5 rounded-lg font-bold text-[11px] transition ${
                        vehicle.status === 'available'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      Available
                    </button>
                    <button
                      onClick={() => handleStatusToggle(vehicle, 'booked')}
                      className={`py-1.5 rounded-lg font-bold text-[11px] transition ${
                        vehicle.status === 'booked'
                          ? 'bg-amber-600 text-white shadow'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      Booked
                    </button>
                    <button
                      onClick={() => handleStatusToggle(vehicle, 'maintenance')}
                      className={`py-1.5 rounded-lg font-bold text-[11px] transition ${
                        vehicle.status === 'maintenance'
                          ? 'bg-rose-600 text-white shadow'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      Repair
                    </button>
                  </div>
                </div>

                {/* Document management quick link */}
                <button
                  onClick={() => setScreen('my_documents')}
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 flex items-center justify-center gap-1.5 transition text-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> View RC & Insurance Docs ({vehicle.documents.length})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && <AddVehicleModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
};
