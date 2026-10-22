import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../shared/StatusBadge';
import { 
  Wallet, ShieldCheck, CheckCircle2, DollarSign, 
  ArrowUpRight, Building, FileText, Send 
} from 'lucide-react';

export const SettlementManager: React.FC = () => {
  const { earnings, settlements, processSettlement, showToast } = useApp();
  const [selectedEarnings, setSelectedEarnings] = useState<string[]>([]);
  const [targetTransporterId, setTargetTransporterId] = useState<string>('transporter_1');
  const [paymentReference, setPaymentReference] = useState('');

  const pendingEarnings = earnings.filter(e => e.status === 'pending_settlement');
  
  // Calculate aggregate pending
  const totalPendingGross = pendingEarnings.reduce((acc, curr) => acc + curr.grossAmount, 0);
  const totalPendingCommission = pendingEarnings.reduce((acc, curr) => acc + curr.commissionDeducted, 0);
  const totalPendingNet = pendingEarnings.reduce((acc, curr) => acc + curr.netEarnings, 0);

  const handleProcessBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const orderIds = pendingEarnings
      .filter(e => e.transporterId === targetTransporterId)
      .map(e => e.orderId);

    if (orderIds.length === 0) {
      showToast('No pending earnings for selected transporter.');
      return;
    }

    processSettlement(
      targetTransporterId,
      orderIds,
      paymentReference || `NEFT-SBI-${Math.floor(100000 + Math.random() * 900000)}`
    );

    setPaymentReference('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900">
          Transporter Payouts & Commission Settlements
        </h2>
        <p className="text-xs text-slate-500">
          Reconcile completed trips, automatically deduct the 5% platform commission, and execute direct NEFT/RTGS bank transfers.
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 text-xs font-semibold">Total Completed Trip Gross</span>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            ₹{totalPendingGross.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Awaiting batch reconciliation</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 text-xs font-semibold">Platform Commission Retained (5%)</span>
          <p className="text-2xl font-black text-blue-600 mt-2 font-mono">
            ₹{totalPendingCommission.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <span className="text-[11px] text-blue-700 mt-1 block font-medium">Net platform revenue</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 text-xs font-semibold">Net Transporter Payout Due</span>
          <p className="text-2xl font-black text-emerald-600 mt-2 font-mono">
            ₹{totalPendingNet.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <span className="text-[11px] text-emerald-700 mt-1 block font-semibold">Direct NEFT/RTGS payable</span>
        </div>
      </div>

      {/* Process Payout Batch Action Card */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl text-white p-6 shadow-xl border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Building className="w-5 h-5 text-emerald-400" />
          <h3 className="font-extrabold text-base text-white">Execute Direct Bank Payout Batch</h3>
        </div>

        <form onSubmit={handleProcessBatch} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Select Transporter Partner</label>
            <select
              value={targetTransporterId}
              onChange={(e) => setTargetTransporterId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="transporter_1">Patel Roadlines & Logistics (Ahmedabad)</option>
              <option value="transporter_2">Gujarat Interstate Carriers (Surat)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">NEFT / UTR / IMPS Bank Reference</label>
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="e.g. UTR-HDFC-99882211"
              className="w-full uppercase font-mono bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-1.5 transition"
            >
              <Send className="w-4 h-4" /> Transfer & Settle Payout
            </button>
          </div>
        </form>
      </div>

      {/* Historical Settlements Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
          <h3 className="font-extrabold text-sm text-white">Settlement Batch Log ({settlements.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Settlement ID</th>
                <th className="p-4">Transporter</th>
                <th className="p-4">Bank Reference</th>
                <th className="p-4">Orders</th>
                <th className="p-4 text-right">Gross Total</th>
                <th className="p-4 text-right">5% Commission</th>
                <th className="p-4 text-right">Net Transferred</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {settlements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <Wallet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">No payout settlements processed yet</p>
                    <span className="text-[11px] text-slate-500">Transporter trip payout reconciliations will be archived here upon executing NEFT transfers.</span>
                  </td>
                </tr>
              ) : (
                settlements.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-mono font-bold text-slate-900">{s.id}</td>
                    <td className="p-4 font-semibold text-slate-800">{s.transporterName}</td>
                    <td className="p-4 font-mono text-blue-700">{s.paymentReference}</td>
                    <td className="p-4 font-mono text-slate-600">{s.orderIds.join(', ')}</td>
                    <td className="p-4 text-right font-mono">₹{s.totalGrossAmount.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-right font-mono text-slate-500">-₹{s.totalCommission.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-right font-mono font-bold text-emerald-600">₹{s.netPayableAmount.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-center">
                      <StatusBadge status={s.status} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
