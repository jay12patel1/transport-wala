import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VehicleDocument, DocType } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';
import { 
  FileText, Upload, ShieldCheck, ShieldAlert, 
  AlertTriangle, Calendar, CheckCircle2, Clock, 
  Plus, RefreshCw, X, Eye 
} from 'lucide-react';

export const MyDocuments: React.FC = () => {
  const { user, vehicles, uploadDocument, showToast } = useApp();

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docType, setDocType] = useState<DocType>('RC');
  const [docNumber, setDocNumber] = useState('');
  const [issueDate, setIssueDate] = useState('2024-01-01');
  const [expiryDate, setExpiryDate] = useState('2027-01-01');
  const [fileName, setFileName] = useState('');
  const [viewingDoc, setViewingDoc] = useState<VehicleDocument | null>(null);

  // Get current transporter's vehicles
  const myVehicles = vehicles.filter(v => v.ownerId === user.id);
  const activeVehicle = myVehicles.find(v => v.id === selectedVehicleId) || myVehicles[0];

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVehicle || !docNumber.trim()) return;

    uploadDocument(activeVehicle.id, {
      docType,
      docNumber: docNumber.toUpperCase().trim(),
      issueDate,
      expiryDate,
      fileName: fileName || `${docType}_Document.pdf`,
      fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'
    });

    setShowUploadModal(false);
    setDocNumber('');
  };

  const docTypesList: DocType[] = ['RC', 'Insurance', 'Fitness', 'Permit', 'PUC', 'GST', 'Other'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Vehicle & Compliance Documents
          </h1>
          <p className="text-xs text-slate-500">
            Manage RC certificates, commercial insurance, fitness, and national permits to keep your fleet active & verified.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          disabled={!activeVehicle}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition"
        >
          <Upload className="w-4 h-4" /> Upload / Renew Document
        </button>
      </div>

      {/* Vehicle Selector Tabs */}
      {myVehicles.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800">No vehicles registered yet</h3>
          <p className="text-xs text-slate-500 mt-1">Add your commercial vehicle first to manage its compliance documents.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            {myVehicles.map(v => (
              <button
                key={v.id}
                onClick={() => setSelectedVehicleId(v.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                  activeVehicle?.id === v.id
                    ? 'bg-slate-900 text-white shadow'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{v.vehicleNumber}</span>
                <span className="text-[10px] opacity-75 font-normal">({v.vehicleType})</span>
                {v.isVerified ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                )}
              </button>
            ))}
          </div>

          {/* Active Vehicle Document Overview Card */}
          {activeVehicle && (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              {/* Vehicle Title Strip */}
              <div className="bg-slate-900 text-white p-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-white">{activeVehicle.vehicleNumber}</h3>
                      <StatusBadge status={activeVehicle.isVerified ? 'verified' : 'pending'} size="sm" />
                    </div>
                    <p className="text-xs text-slate-300">
                      {activeVehicle.vehicleType} • Location: {activeVehicle.currentLocation}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl font-bold transition shadow"
                  >
                    + Add New Doc
                  </button>
                </div>
              </div>

              {/* Document Cards Grid */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeVehicle.documents.length === 0 ? (
                    <div className="col-span-full py-8 text-center text-xs text-slate-400">
                      No documents uploaded for this vehicle yet. Click Upload to submit RC & Insurance.
                    </div>
                  ) : (
                    activeVehicle.documents.map(doc => (
                      <div
                        key={doc.id}
                        className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 ${
                          doc.status === 'verified' ? 'bg-emerald-50/40 border-emerald-200' :
                          doc.status === 'rejected' ? 'bg-rose-50/50 border-rose-200' :
                          doc.status === 'expired' ? 'bg-red-50/60 border-red-200' :
                          'bg-amber-50/40 border-amber-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Document Type
                            </span>
                            <h4 className="font-black text-base text-slate-900">{doc.docType} Certificate</h4>
                            <p className="text-xs font-mono font-semibold text-slate-700 mt-0.5">{doc.docNumber}</p>
                          </div>
                          <StatusBadge status={doc.status} size="sm" />
                        </div>

                        <div className="text-xs text-slate-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Issue Date:</span>
                            <span className="font-medium text-slate-800">{doc.issueDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Expiry Date:</span>
                            <span className={`font-semibold ${doc.status === 'expired' ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>
                              {doc.expiryDate}
                            </span>
                          </div>
                        </div>

                        {/* Rejection notice if applicable */}
                        {doc.status === 'rejected' && doc.rejectionReason && (
                          <div className="p-2.5 bg-rose-100/70 border border-rose-200 rounded-xl text-[11px] text-rose-900">
                            <strong>Reason:</strong> {doc.rejectionReason}
                          </div>
                        )}

                        {/* Expiry Warning */}
                        {doc.status === 'expired' && (
                          <div className="p-2 bg-red-100 border border-red-300 rounded-xl text-[11px] text-red-900 font-semibold flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            <span>Expired. Please upload renewed certificate.</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                          <button
                            onClick={() => setViewingDoc(doc)}
                            className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Certificate
                          </button>

                          <button
                            onClick={() => {
                              setDocType(doc.docType);
                              setDocNumber(doc.docNumber);
                              setShowUploadModal(true);
                            }}
                            className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" /> Replace
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Upload / Renew Vehicle Document</h3>
              <button onClick={() => setShowUploadModal(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-5 space-y-4 text-xs sm:text-sm text-slate-800">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Document Category</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as DocType)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {docTypesList.map(dt => (
                    <option key={dt} value={dt}>{dt} Certificate</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document / Certificate Number *</label>
                <input
                  type="text"
                  required
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder="e.g. GJ01AX9944RC / POL-88992"
                  className="w-full uppercase font-mono bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Simulated File upload button */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Upload Scanned PDF / Image</label>
                <div 
                  onClick={() => {
                    setFileName(`${docType}_Certified_Copy.pdf`);
                    showToast('Document file attached successfully.');
                  }}
                  className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center cursor-pointer hover:bg-slate-50 transition"
                >
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs text-slate-600 font-semibold block">
                    {fileName || 'Click to select RC / Insurance PDF'}
                  </span>
                  <span className="text-[10px] text-slate-400">Supported: PDF, JPG, PNG (Max 10MB)</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow"
                >
                  Submit for Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Document Modal Preview */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">{viewingDoc.docType} Certificate</h3>
                <p className="text-xs text-slate-300 font-mono">{viewingDoc.docNumber}</p>
              </div>
              <button onClick={() => setViewingDoc(null)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-2xl border border-slate-200 overflow-hidden h-64 bg-slate-100">
                <img
                  src={viewingDoc.fileUrl}
                  alt={viewingDoc.docType}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span>File Name:</span>
                  <span className="font-mono font-medium text-slate-900">{viewingDoc.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <StatusBadge status={viewingDoc.status} size="sm" />
                </div>
                <div className="flex justify-between">
                  <span>Valid Until:</span>
                  <span className="font-semibold text-slate-900">{viewingDoc.expiryDate}</span>
                </div>
              </div>

              <button
                onClick={() => setViewingDoc(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
