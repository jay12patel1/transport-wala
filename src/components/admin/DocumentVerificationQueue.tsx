import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VehicleDocument } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';
import { 
  FileText, ShieldCheck, XCircle, CheckCircle2, 
  Eye, AlertTriangle, Clock, Truck, User, X 
} from 'lucide-react';

export const DocumentVerificationQueue: React.FC = () => {
  const { vehicles, verifyDocument, showToast } = useApp();
  const [selectedDoc, setSelectedDoc] = useState<{ vehicleId: string; doc: VehicleDocument } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Flatten all documents across all vehicles
  const allDocs = vehicles.flatMap(v => 
    v.documents.map(d => ({
      vehicleId: v.id,
      vehicleNumber: v.vehicleNumber,
      vehicleType: v.vehicleType,
      transporterName: v.transporterName,
      transporterPhone: v.transporterPhone,
      doc: d
    }))
  );

  const pendingDocs = allDocs.filter(item => item.doc.status === 'pending');
  const reviewedDocs = allDocs.filter(item => item.doc.status !== 'pending');

  const handleApprove = (vehicleId: string, docId: string) => {
    verifyDocument(vehicleId, docId, 'verified');
    if (selectedDoc?.doc.id === docId) setSelectedDoc(null);
  };

  const handleRejectConfirm = () => {
    if (!selectedDoc) return;
    verifyDocument(
      selectedDoc.vehicleId, 
      selectedDoc.doc.id, 
      'rejected', 
      rejectReason || 'Document details mismatch or illegible copy'
    );
    setShowRejectModal(false);
    setSelectedDoc(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            Document Verification Queue ({pendingDocs.length} Pending)
          </h2>
          <p className="text-xs text-slate-500">
            Audit RC Books, Insurance Policies, Fitness, and Permits before vehicles go live on the customer marketplace.
          </p>
        </div>
      </div>

      {/* Pending Reviews Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-sm text-white">
              Pending Document Review Requests ({pendingDocs.length})
            </h3>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {pendingDocs.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="font-bold text-slate-700">All vehicle documents are verified!</p>
              <span className="text-[11px]">No pending submissions in the queue.</span>
            </div>
          ) : (
            pendingDocs.map(item => (
              <div key={item.doc.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/80 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">{item.vehicleNumber}</span>
                    <span className="text-slate-600 font-medium">({item.vehicleType})</span>
                    <StatusBadge status={item.doc.status} size="sm" />
                  </div>
                  <p className="text-slate-700 font-semibold">
                    {item.doc.docType} Certificate: <span className="font-mono text-blue-700">{item.doc.docNumber}</span>
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Transporter: <strong>{item.transporterName}</strong> ({item.transporterPhone}) • Submitted: {item.doc.uploadedAt}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Validity: {item.doc.issueDate} to <strong className="text-slate-800">{item.doc.expiryDate}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                  <button
                    onClick={() => setSelectedDoc({ vehicleId: item.vehicleId, doc: item.doc })}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl font-bold text-slate-700 flex items-center gap-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" /> View Document
                  </button>

                  <button
                    onClick={() => handleApprove(item.vehicleId, item.doc.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1 shadow transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Approve
                  </button>

                  <button
                    onClick={() => {
                      setSelectedDoc({ vehicleId: item.vehicleId, doc: item.doc });
                      setShowRejectModal(true);
                    }}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold transition"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Previously Audited Documents */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 bg-slate-900 text-white">
          <h3 className="font-extrabold text-sm text-white">
            Audit Trail & Verified Fleet Documents ({reviewedDocs.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Transporter</th>
                <th className="p-4">Doc Type</th>
                <th className="p-4">Doc Number</th>
                <th className="p-4">Expiry Date</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {reviewedDocs.map(item => (
                <tr key={item.doc.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 font-mono font-bold text-slate-900">{item.vehicleNumber}</td>
                  <td className="p-4">{item.transporterName}</td>
                  <td className="p-4 font-semibold text-slate-800">{item.doc.docType}</td>
                  <td className="p-4 font-mono">{item.doc.docNumber}</td>
                  <td className="p-4">{item.doc.expiryDate}</td>
                  <td className="p-4 text-center">
                    <StatusBadge status={item.doc.status} size="sm" />
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedDoc({ vehicleId: item.vehicleId, doc: item.doc })}
                      className="text-blue-600 hover:text-blue-800 font-bold"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document View Modal */}
      {selectedDoc && !showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">{selectedDoc.doc.docType} Certificate Review</h3>
                <p className="text-xs text-slate-300 font-mono">{selectedDoc.doc.docNumber}</p>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-2xl border border-slate-200 overflow-hidden h-64 bg-slate-100">
                <img
                  src={selectedDoc.doc.fileUrl}
                  alt={selectedDoc.doc.docType}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span>File Name:</span>
                  <span className="font-mono font-medium text-slate-900">{selectedDoc.doc.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Issue Date:</span>
                  <span className="font-semibold text-slate-900">{selectedDoc.doc.issueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expiry Date:</span>
                  <span className="font-semibold text-slate-900">{selectedDoc.doc.expiryDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <StatusBadge status={selectedDoc.doc.status} size="sm" />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleApprove(selectedDoc.vehicleId, selectedDoc.doc.id)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow flex items-center justify-center gap-1"
                >
                  <ShieldCheck className="w-4 h-4" /> Approve Document
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow flex items-center justify-center gap-1"
                >
                  <XCircle className="w-4 h-4" /> Reject with Reason
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Specify Rejection Reason</h3>
            <p className="text-xs text-slate-500">
              The transporter will see this feedback in their Documents console to upload a corrected copy.
            </p>
            <textarea
              rows={3}
              required
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Scanned copy is blur, or insurance policy expired on 31-May-2026."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
            />
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2 border rounded-xl font-bold text-xs text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="flex-1 py-2 bg-rose-600 text-white rounded-xl font-bold text-xs"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
