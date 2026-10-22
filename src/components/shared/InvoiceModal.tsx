import React from 'react';
import { BookingOrder } from '../../types';
import { X, Printer, Download, ShieldCheck, Truck, Building2, Phone } from 'lucide-react';

interface InvoiceModalProps {
  order: BookingOrder;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${order.id.replace('ORD-', '')}`;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Modal Top Actions */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Tax Invoice / Bilty</span>
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              {invoiceNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white font-medium px-3 py-1.5 rounded-lg transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Container */}
        <div className="p-8 text-slate-900 font-sans" id="printable-invoice">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b-2 border-slate-900 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow">
                  TW
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900">
                    Transport Wala
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Commercial Vehicle Booking & Transport Marketplace
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                <strong>Platform Operator:</strong> Transport Wala Technologies Pvt Ltd<br />
                <strong>Developer & Lead:</strong> Jayesh Patel | <strong>Helpdesk:</strong> +91 9725506630 | <strong>Email:</strong> support@transportswala.com<br />
                <strong>GSTIN:</strong> 24AAACT9920K1ZX | <strong>SAC Code:</strong> 996511 (Goods Transport Agency)
              </p>
            </div>

            <div className="text-right sm:self-center">
              <span className="inline-block bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold px-3 py-1 rounded uppercase tracking-wider mb-1">
                ORIGINAL FOR RECIPIENT
              </span>
              <p className="text-xs text-slate-500">Invoice No: <strong className="text-slate-800">{invoiceNumber}</strong></p>
              <p className="text-xs text-slate-500">Invoice Date: <strong className="text-slate-800">{invoiceDate}</strong></p>
              <p className="text-xs text-slate-500">Order ID: <strong className="text-slate-800">{order.id}</strong></p>
            </div>
          </div>

          {/* Consignor & Consignee / Transporter Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" /> Billed To (Customer / Consignor)
              </h3>
              <p className="font-semibold text-slate-900 text-sm">{order.customerCompany || order.customerName}</p>
              <p className="text-slate-600 mt-0.5">Contact: {order.customerName} ({order.customerPhone})</p>
              <p className="text-slate-600">Pickup: {order.pickupLocation}</p>
              <p className="text-slate-600">Destination: {order.deliveryLocation}</p>
              <p className="text-slate-600 font-mono mt-1">GSTIN: 24AAACP1234F1Z8</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-600" /> Carrier / Transporter Details
              </h3>
              <p className="font-semibold text-slate-900 text-sm">{order.transporterName}</p>
              <p className="text-slate-600 mt-0.5">Contact: {order.transporterPhone}</p>
              <p className="text-slate-600">Vehicle No: <span className="font-bold font-mono text-slate-900">{order.vehicleNumber}</span> ({order.vehicleType})</p>
              <p className="text-slate-600">Assigned Driver: {order.driverName} ({order.driverPhone})</p>
              <p className="text-slate-600 font-mono mt-1">Status: GST Verified Carrier</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto my-6">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-900 text-white font-semibold">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Description of Freight Services</th>
                  <th className="p-3">SAC</th>
                  <th className="p-3">Route / Details</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                <tr>
                  <td className="p-3 font-medium">1</td>
                  <td className="p-3 font-semibold">
                    Commercial Vehicle Freight ({order.vehicleType})
                    <p className="text-[11px] text-slate-500 font-normal">Dedicated transport, sealed container with GPS tracking</p>
                  </td>
                  <td className="p-3 font-mono">996511</td>
                  <td className="p-3">{order.pickupLocation} → {order.deliveryLocation}</td>
                  <td className="p-3 text-right font-mono font-medium">{order.baseFare.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">2</td>
                  <td className="p-3">Loading Assistance Charges</td>
                  <td className="p-3 font-mono">996511</td>
                  <td className="p-3">Origin Warehouse Ground Crew</td>
                  <td className="p-3 text-right font-mono font-medium">{order.loadingCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">3</td>
                  <td className="p-3">Unloading Assistance Charges</td>
                  <td className="p-3 font-mono">996511</td>
                  <td className="p-3">Destination Delivery Bay</td>
                  <td className="p-3 text-right font-mono font-medium">{order.unloadingCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">4</td>
                  <td className="p-3">National Highway Toll & Green Cess</td>
                  <td className="p-3 font-mono">996511</td>
                  <td className="p-3">FASTag Toll Plazas (NH48)</td>
                  <td className="p-3 text-right font-mono font-medium">{order.tollCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Calculations & Total */}
          <div className="flex flex-col sm:flex-row justify-between items-start pt-2 gap-6">
            <div className="text-xs text-slate-600 max-w-sm">
              <h4 className="font-bold text-slate-900 mb-1">Declaration & Terms:</h4>
              <p className="text-[11px] leading-relaxed">
                1. Freight charges are inclusive of standard in-transit safety provisions.<br />
                2. Goods carried at owner's risk unless covered under separate cargo insurance.<br />
                3. Disputes subject to Ahmedabad Jurisdiction.<br />
                <strong>Crafted for Transport Wala by Jayesh Patel (Contact: 9725506630)</strong>
              </p>
            </div>

            <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-medium text-slate-900">
                  ₹{(order.baseFare + order.loadingCharges + order.unloadingCharges + order.tollCharges).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>CGST (9%):</span>
                <span className="font-mono text-slate-800">
                  ₹{(order.gstAmount / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST (9%):</span>
                <span className="font-mono text-slate-800">
                  ₹{(order.gstAmount / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="border-t border-slate-300 pt-2 flex justify-between font-bold text-sm text-slate-900">
                <span>Total Amount Paid:</span>
                <span className="font-mono text-blue-700">
                  ₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="pt-1 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Payment Status: PAID (Txn: {order.paymentTxnId || 'ONLINE_PAID'})
              </div>
            </div>
          </div>

          {/* Authorized Signature */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
            <div>
              <p>Generated electronically by <strong>Transport Wala Portal</strong></p>
              <p>Certified Digital Tax Document</p>
            </div>
            <div className="text-right">
              <div className="inline-block border-b border-slate-400 pb-1 mb-1 w-44 font-script text-slate-800 font-bold text-sm">
                Jayesh Patel
              </div>
              <p className="font-semibold text-slate-800">Authorized Signatory</p>
              <p className="text-[11px]">Transport Wala</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
