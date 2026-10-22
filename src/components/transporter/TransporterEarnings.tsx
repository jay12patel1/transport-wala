import React from 'react';
import { useApp } from '../../context/AppContext';
import { TransporterEarning, Settlement } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';
import { 
  Wallet, DollarSign, ArrowUpRight, ShieldCheck, 
  Clock, Download, CheckCircle2, TrendingUp, FileText 
} from 'lucide-react';

export const TransporterEarnings: React.FC = () => {
  const { user, earnings, settlements, t, showToast } = useApp();

  const myEarnings = earnings.filter(e => e.transporterId === user.id);
  const mySettlements = settlements.filter(s => s.transporterId === user.id);

  const totalGross = myEarnings.reduce((acc, curr) => acc + curr.grossAmount, 0);
  const totalCommission = myEarnings.reduce((acc, curr) => acc + curr.commissionDeducted, 0);
  const totalNet = myEarnings.reduce((acc, curr) => acc + curr.netEarnings, 0);

  const pendingSettlementAmount = myEarnings
    .filter(e => e.status === 'pending_settlement')
    .reduce((acc, curr) => acc + curr.netEarnings, 0);

  const settledAmount = totalNet - pendingSettlementAmount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Transporter Earnings & Payout Settlements
        </h1>
        <p className="text-xs text-slate-500">
          Track trip earnings, platform commission deductions, and direct bank settlement records.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Gross Revenue</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            ₹{totalGross.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">From completed trips</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Net Transporter Payout</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><Wallet className="w-4 h-4" /></div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2 font-mono">
            ₹{totalNet.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <span className="text-[11px] text-emerald-700 mt-1 block font-medium">After 5% platform fee</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Pending Payout</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600"><Clock className="w-4 h-4" /></div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2 font-mono">
            ₹{pendingSettlementAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Scheduled for next batch</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Settled Payouts</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600"><ShieldCheck className="w-4 h-4" /></div>
          </div>
          <p className="text-2xl font-black text-purple-600 mt-2 font-mono">
            ₹{settledAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Transferred via NEFT/RTGS</span>
        </div>
      </div>

      {/* Payout Settlements History */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-sm text-white">Bank Payout Settlements ({mySettlements.length})</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Settlement Ref</th>
                <th className="p-4">Date</th>
                <th className="p-4">Orders Included</th>
                <th className="p-4 text-right">Gross Total</th>
                <th className="p-4 text-right">Commission (5%)</th>
                <th className="p-4 text-right">Net Transferred</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {mySettlements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No settlements processed yet. Completed orders will appear in the next cycle.
                  </td>
                </tr>
              ) : (
                mySettlements.map(sett => (
                  <tr key={sett.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-mono font-bold text-slate-900">{sett.paymentReference}</td>
                    <td className="p-4 text-slate-500">{new Date(sett.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="p-4">{sett.orderIds.join(', ')}</td>
                    <td className="p-4 text-right font-mono font-medium">₹{sett.totalGrossAmount.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-right font-mono text-slate-500">-₹{sett.totalCommission.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-right font-mono font-bold text-emerald-600">₹{sett.netPayableAmount.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-center">
                      <StatusBadge status={sett.status} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Completed Trips Earning Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
          <h3 className="font-extrabold text-sm text-white">Trip-by-Trip Earning Records ({myEarnings.length})</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {myEarnings.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Complete active trips to generate verifiable earnings.
            </div>
          ) : (
            myEarnings.map(e => (
              <div key={e.id} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                <div>
                  <span className="font-mono font-bold text-slate-900 text-sm">{e.orderId}</span>
                  <p className="text-slate-500 mt-0.5">
                    Completed on {new Date(e.completedAt).toLocaleDateString('en-IN')}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Gross Freight</span>
                    <span className="font-mono font-semibold text-slate-800">₹{e.grossAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">5% Platform</span>
                    <span className="font-mono text-rose-600">-₹{e.commissionDeducted.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Net Payout</span>
                    <span className="font-mono font-bold text-emerald-600 text-sm">₹{e.netEarnings.toLocaleString('en-IN')}</span>
                  </div>
                  <StatusBadge status={e.status === 'settled' ? 'paid' : 'pending'} size="sm" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
