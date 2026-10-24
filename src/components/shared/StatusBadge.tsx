import React from 'react';
import { VehicleStatus, DocStatus, OrderStatus, PaymentStatus, SettlementStatus, ComplaintStatus } from '../../types';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Truck, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';

interface StatusBadgeProps {
  status: VehicleStatus | DocStatus | OrderStatus | PaymentStatus | SettlementStatus | ComplaintStatus | string;
  type?: 'vehicle' | 'document' | 'order' | 'payment' | 'settlement' | 'complaint';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let icon = <Clock className="w-3.5 h-3.5" />;
  let label = status.toString().replace('_', ' ');

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-bold px-3 py-1.5 gap-2'
  }[size];

  switch (status) {
    // Vehicles
    case 'available':
    case 'approved':
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      label = 'Approved & Live';
      break;
    case 'booked':
      bg = 'bg-amber-50 text-amber-700 border-amber-200';
      icon = <Clock className="w-3.5 h-3.5 text-amber-600" />;
      label = 'Booked';
      break;
    case 'on_trip':
    case 'in_transit':
      bg = 'bg-blue-50 text-blue-700 border-blue-200';
      icon = <Truck className="w-3.5 h-3.5 text-blue-600 animate-bounce" />;
      label = 'In Transit';
      break;
    case 'maintenance':
      bg = 'bg-rose-50 text-rose-700 border-rose-200';
      icon = <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />;
      label = 'Under Maintenance';
      break;

    // Documents
    case 'verified':
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-300';
      icon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
      label = 'Verified';
      break;
    case 'pending':
      bg = 'bg-amber-50 text-amber-800 border-amber-300';
      icon = <Clock className="w-3.5 h-3.5 text-amber-600" />;
      label = 'Pending Review';
      break;
    case 'rejected':
      bg = 'bg-rose-50 text-rose-800 border-rose-300';
      icon = <XCircle className="w-3.5 h-3.5 text-rose-600" />;
      label = 'Rejected';
      break;
    case 'expired':
      bg = 'bg-red-100 text-red-900 border-red-300 font-bold';
      icon = <ShieldAlert className="w-3.5 h-3.5 text-red-600" />;
      label = 'Expired';
      break;

    // Orders
    case 'requested':
      bg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      icon = <Clock className="w-3.5 h-3.5 text-indigo-600" />;
      label = 'Requested';
      break;
    case 'accepted':
      bg = 'bg-teal-50 text-teal-700 border-teal-200';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />;
      label = 'Accepted';
      break;
    case 'assigned':
      bg = 'bg-cyan-50 text-cyan-700 border-cyan-200';
      icon = <Truck className="w-3.5 h-3.5 text-cyan-600" />;
      label = 'Driver Assigned';
      break;
    case 'trip_started':
      bg = 'bg-sky-50 text-sky-700 border-sky-200';
      icon = <Truck className="w-3.5 h-3.5 text-sky-600 animate-pulse" />;
      label = 'Trip Started';
      break;
    case 'reached_pickup':
      bg = 'bg-violet-50 text-violet-700 border-violet-200';
      label = 'At Pickup Point';
      break;
    case 'loading_completed':
      bg = 'bg-purple-50 text-purple-700 border-purple-200';
      label = 'Loading Done';
      break;
    case 'reached_destination':
      bg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      label = 'At Destination';
      break;
    case 'delivered':
    case 'completed':
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-300';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      label = 'Completed';
      break;
    case 'cancelled':
      bg = 'bg-slate-100 text-slate-600 border-slate-300 line-through';
      icon = <XCircle className="w-3.5 h-3.5 text-slate-500" />;
      label = 'Cancelled';
      break;

    // Payments
    case 'paid':
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      icon = <Sparkles className="w-3.5 h-3.5 text-emerald-600" />;
      label = 'Paid';
      break;
    case 'open':
      bg = 'bg-amber-50 text-amber-700 border-amber-200';
      label = 'Open';
      break;
    case 'resolved':
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      label = 'Resolved';
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center rounded-full border tracking-wide uppercase ${sizeClasses} ${bg} ${className}`}>
      {icon}
      <span>{label}</span>
    </span>
  );
};
