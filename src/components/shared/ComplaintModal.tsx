import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookingOrder, Complaint } from '../../types';
import { X, AlertCircle, Send, ShieldAlert } from 'lucide-react';

interface ComplaintModalProps {
  order: BookingOrder;
  onClose: () => void;
}

export const ComplaintModal: React.FC<ComplaintModalProps> = ({ order, onClose }) => {
  const { createComplaint } = useApp();
  const [category, setCategory] = useState<Complaint['category']>('Delay');
  const [description, setDescription] = useState('');

  const categories: Complaint['category'][] = [
    'Delay',
    'Vehicle Issue',
    'Driver Issue',
    'Fare Dispute',
    'Damage / Loss',
    'Payment Issue',
    'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    createComplaint(order.id, order.id, category, description.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600/30 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Raise Issue / Complaint</h3>
              <p className="text-xs text-slate-300">Order: {order.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Issue Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Complaint['category'])}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Describe the problem in detail</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details (e.g. driver arrival time, cargo condition, toll receipt issue)..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Transport Wala grievance cell reviews all tickets within 2 business hours. For urgent escalation, call <strong>9725506630</strong>.</span>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!description.trim()}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-1.5 shadow transition"
            >
              <Send className="w-3.5 h-3.5" /> Submit Complaint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
