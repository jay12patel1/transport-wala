import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, UserProfile } from '../../types';
import { 
  Users, Building2, User, Navigation, ShieldCheck, 
  Search, Phone, Mail, MapPin, CheckCircle2, XCircle, Star 
} from 'lucide-react';

export const AdminUsersDirectory: React.FC = () => {
  const { registeredUsers, allDrivers, showToast } = useApp();
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Combined Directory List
  const allUsersWithDrivers: Array<UserProfile & { licenseNumber?: string; experienceYears?: number }> = [
    ...registeredUsers,
    ...allDrivers
      .filter(d => !registeredUsers.some(u => u.id === d.id))
      .map(d => ({
        id: d.id,
        role: 'driver' as UserRole,
        fullName: d.fullName,
        companyName: d.transporterName,
        phone: d.phone,
        email: d.email || `driver.${d.phone}@transportswala.com`,
        address: 'Driver Roster, Gujarat',
        rating: d.rating,
        isVerified: true,
        licenseNumber: d.licenseNumber,
        experienceYears: d.experienceYears,
        status: 'active' as const,
        createdAt: d.joinedAt
      }))
  ];

  const filteredUsers = allUsersWithDrivers.filter(u => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch = 
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const customerCount = allUsersWithDrivers.filter(u => u.role === 'customer').length;
  const transporterCount = allUsersWithDrivers.filter(u => u.role === 'transporter').length;
  const driverCount = allUsersWithDrivers.filter(u => u.role === 'driver').length;

  return (
    <div className="space-y-6">
      {/* Directory Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setRoleFilter('customer')}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            roleFilter === 'customer' 
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-600">Shippers &amp; Customers</span>
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-700 mt-1">{customerCount}</p>
          <span className="text-[10px] text-slate-400">Verified commercial buyers</span>
        </div>

        <div 
          onClick={() => setRoleFilter('transporter')}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            roleFilter === 'transporter' 
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-600">Fleet Transporters</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-1">{transporterCount}</p>
          <span className="text-[10px] text-slate-400">Verified fleet owners</span>
        </div>

        <div 
          onClick={() => setRoleFilter('driver')}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            roleFilter === 'driver' 
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-600">Commercial Drivers</span>
            <Navigation className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700 mt-1">{driverCount}</p>
          <span className="text-[10px] text-slate-400">Authorized in-cab operators</span>
        </div>
      </div>

      {/* Filter and Search Input */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              roleFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Accounts ({allUsersWithDrivers.length})
          </button>
          <button
            onClick={() => setRoleFilter('customer')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              roleFilter === 'customer' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => setRoleFilter('transporter')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              roleFilter === 'transporter' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Transporters
          </button>
          <button
            onClick={() => setRoleFilter('driver')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              roleFilter === 'driver' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Drivers
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone, GST..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3">User &amp; Organization</th>
                <th className="px-5 py-3">Role &amp; Credentials</th>
                <th className="px-5 py-3">Contact Details</th>
                <th className="px-5 py-3">GST / DL Identifier</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 text-sm">No registered user accounts found</p>
                    <span className="text-[11px] text-slate-500">Accounts created by customers, transporters, and drivers will appear here automatically.</span>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 shrink-0">
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">{u.fullName}</span>
                        <span className="text-[11px] text-slate-500">{u.companyName}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      u.role === 'customer' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      u.role === 'transporter' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      u.role === 'driver' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      {u.role}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono mt-0.5">{u.id}</span>
                  </td>

                  <td className="px-5 py-4 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span className="font-mono">{u.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{u.email}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4 font-mono text-[11px]">
                    {u.gstNumber ? (
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">
                        GST: {u.gstNumber}
                      </span>
                    ) : u.licenseNumber ? (
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">
                        DL: {u.licenseNumber}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Not applicable</span>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => showToast(`Audit details for ${u.fullName} (${u.role.toUpperCase()})`)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold text-[11px]"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
