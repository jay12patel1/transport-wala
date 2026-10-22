import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Complaint } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';
import { 
  AlertTriangle, CheckCircle2, Clock, MessageSquare, 
  Send, User, Phone, FileText, X 
} from 'lucide-react';

export const ComplaintManager: React.FC = () => {
  const { complaints, updateComplaintStatus, showToast } = useApp();
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const handleResolve = (complaintId: string) => {
    updateComplaintStatus(
      complaintId,
      'resolved',
      resolutionNotes || 'Grievance reviewed and resolved in consultation with transporter and customer.'
    );
    setSelectedComplaint(null);
    setResolutionNotes('');
  };

  const handleUnderReview = (complaintId: string) => {
    updateComplaintStatus(complaintId, 'under_review');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900">
          Dispute Resolution & Grievance Manager ({complaints.length})
        </h2>
        <p className="text-xs text-slate-500">
          Monitor customer reports regarding transit delays, cargo safety, and driver conduct to ensure platform quality.
        </p>
      </div>

      {/* Complaints List */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h3 className="font-extrabold text-sm text-white">Active Grievances Queue</h3>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {complaints.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="font-bold text-slate-700">Zero open complaints!</p>
              <span className="text-[11px]">All disputes have been resolved successfully.</span>
            </div>
          ) : (
            complaints.map(c => (
              <div key={c.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/80 transition">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">{c.id}</span>
                    <span className="font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] uppercase">
                      {c.category}
                    </span>
                    <StatusBadge status={c.status} size="sm" />
                  </div>

                  <p className="font-bold text-slate-900 text-sm">{c.subject}</p>
                  <p className="text-slate-600 text-xs">{c.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span>Raised by: <strong>{c.userName}</strong> ({c.userRole})</span>
                    <span>• Order ID: <strong className="font-mono">{c.orderId}</strong></span>
                    <span>• Filed on: {c.createdAt}</span>
                  </div>

                  {c.adminNotes && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 mt-1">
                      <strong>Admin Resolution Note:</strong> {c.adminNotes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                  {c.status === 'open' && (
                    <button
                      onClick={() => handleUnderReview(c.id)}
                      className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl font-bold transition"
                    >
                      Take Under Review
                    </button>
                  )}

                  {c.status !== 'resolved' && (
                    <button
                      onClick={() => {
                        setSelectedComplaint(c);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow flex items-center gap-1 transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Resolve Issue
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Resolution Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Resolve Complaint {selectedComplaint.id}</h3>
              <button onClick={() => setSelectedComplaint(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p><strong>Customer:</strong> {selectedComplaint.userName}</p>
              <p><strong>Subject:</strong> {selectedComplaint.subject}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Resolution Summary & Action Taken *
              </label>
              <textarea
                rows={3}
                required
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="e.g. Discussed with fleet coordinator; driver arrived at alternate loading bay; toll reimbursement credit issued."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="flex-1 py-2.5 border rounded-xl font-semibold text-slate-700 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolve(selectedComplaint.id)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow"
              >
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
