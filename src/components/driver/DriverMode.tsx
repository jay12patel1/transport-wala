import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookingOrder, DriverJobVacancy } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';
import { LiveTrackingMap } from '../shared/LiveTrackingMap';
import { ChatModal } from '../shared/ChatModal';
import { 
  Truck, Navigation, Phone, MapPin, CheckCircle2, 
  Clock, ShieldAlert, Radio, MessageSquare, AlertCircle, Compass,
  Briefcase, FileText, UploadCloud, Check, X, Search, DollarSign,
  Calendar, Building2, User, FileCheck, ExternalLink
} from 'lucide-react';

export const DriverMode: React.FC = () => {
  const { 
    user, 
    bookings, 
    updateOrderStatus, 
    showToast,
    jobVacancies,
    jobApplications,
    applyForJob 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'trips' | 'jobs' | 'my_applications'>('trips');
  const [isGpsSharing, setIsGpsSharing] = useState(true);
  const [showChat, setShowChat] = useState(false);

  // Job Search / Filter State
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedJobForApply, setSelectedJobForApply] = useState<DriverJobVacancy | null>(null);

  // Job Application Form State
  const [applicantName, setApplicantName] = useState(user.fullName || '');
  const [applicantPhone, setApplicantPhone] = useState(user.phone || '');
  const [licenseNumber, setLicenseNumber] = useState('GJ0120200045678');
  const [experienceYears, setExperienceYears] = useState('4');
  const [resumeFileName, setResumeFileName] = useState('Commercial_Driver_Heavy_Vehicle_CV.pdf');
  const [resumeFileReady, setResumeFileReady] = useState(true);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Find active or assigned trip for driver
  const assignedTrip = bookings.find(b => 
    !['completed', 'cancelled', 'rejected'].includes(b.status)
  ) || bookings[0];

  const handleStatusAdvance = (orderId: string, nextStatus: any) => {
    updateOrderStatus(orderId, nextStatus);
  };

  const handleOpenApplyModal = (job: DriverJobVacancy) => {
    setSelectedJobForApply(job);
    setApplicantName(user.fullName || '');
    setApplicantPhone(user.phone || '');
    setApplyError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFileName(file.name);
      setResumeFileReady(true);
      showToast(`Resume file "${file.name}" attached.`);
    }
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobForApply) return;
    setApplyError(null);

    if (!applicantName.trim() || !applicantPhone.trim() || !licenseNumber.trim()) {
      setApplyError('Please fill in your Full Name, Mobile Number, and Driving License Number.');
      return;
    }

    const res = applyForJob(selectedJobForApply.id, {
      driverName: applicantName.trim(),
      driverPhone: applicantPhone.trim(),
      experienceYears: Number(experienceYears) || 3,
      licenseNumber: licenseNumber.trim().toUpperCase(),
      resumeFileName: resumeFileName || 'Driver_Resume.pdf',
      resumeUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80'
    });

    if (res.success) {
      setSelectedJobForApply(null);
    } else {
      setApplyError(res.message || 'Failed to submit application.');
    }
  };

  // Filter jobs
  const openVacancies = jobVacancies.filter(j => j.status === 'open');
  const filteredJobs = openVacancies.filter(j => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      j.vehicleType.toLowerCase().includes(q) ||
      j.route.toLowerCase().includes(q) ||
      j.transporterName.toLowerCase().includes(q) ||
      j.requirements.toLowerCase().includes(q)
    );
  });

  // Driver's own applications
  const myApplications = jobApplications.filter(a => 
    a.driverId === user.id || a.driverPhone === user.phone
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      {/* Driver Cab Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-900 font-black text-xl shadow">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-white">Driver Console</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
                ACTIVE ON DUTY
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Driver: <strong>{user.fullName}</strong> • Phone: {user.phone}
            </p>
          </div>
        </div>

        {/* Live GPS Broadcast Switch */}
        <div className="flex items-center gap-2 bg-slate-800/90 px-4 py-2 rounded-2xl border border-slate-700">
          <Radio className={`w-4 h-4 ${isGpsSharing ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
          <span className="text-xs font-bold text-slate-200">Live GPS Broadcast</span>
          <button
            onClick={() => {
              setIsGpsSharing(!isGpsSharing);
              showToast(isGpsSharing ? 'GPS broadcast paused.' : 'GPS broadcast active.');
            }}
            className={`ml-2 px-3 py-1 rounded-lg text-xs font-black transition ${
              isGpsSharing ? 'bg-emerald-600 text-white shadow' : 'bg-slate-700 text-slate-400'
            }`}
          >
            {isGpsSharing ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Driver Top Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300">
        <button
          onClick={() => setActiveTab('trips')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 ${
            activeTab === 'trips'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Compass className="w-4 h-4 text-blue-600" />
          <span>Active Trip & Navigation</span>
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 relative ${
            activeTab === 'jobs'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Briefcase className="w-4 h-4 text-amber-500" />
          <span>Driver Vacancies / Job Openings</span>
          {openVacancies.length > 0 && (
            <span className="bg-amber-500 text-slate-950 text-[10px] px-1.5 py-0.5 rounded-full font-black">
              {openVacancies.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('my_applications')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 ${
            activeTab === 'my_applications'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <FileCheck className="w-4 h-4 text-emerald-600" />
          <span>My Applications ({myApplications.length})</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE TRIPS & NAVIGATION */}
      {activeTab === 'trips' && (
        <>
          {!assignedTrip ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
              <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-base text-slate-800">No trips currently assigned</h3>
              <p className="text-xs text-slate-500 mt-1">Transporters assign vehicles &amp; trips directly to your profile.</p>
              <div className="mt-5">
                <button
                  onClick={() => setActiveTab('jobs')}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow inline-flex items-center gap-1.5"
                >
                  <Briefcase className="w-4 h-4" /> Browse Transporter Driver Vacancies
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Active Trip Card */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-950 text-white p-5 flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-amber-400 text-base">{assignedTrip.id}</span>
                      <StatusBadge status={assignedTrip.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Vehicle: <strong className="text-white">{assignedTrip.vehicleNumber}</strong> ({assignedTrip.vehicleType})
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {['accepted', 'assigned', 'trip_started', 'reached_pickup', 'loading_completed', 'in_transit', 'reached_destination', 'delivered', 'completed'].includes(assignedTrip.status) ? (
                      <button
                        onClick={() => showToast(`Calling Customer ${assignedTrip.customerName} (${assignedTrip.customerPhone})...`)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                      >
                        <Phone className="w-4 h-4" /> Call Customer
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-4 py-2 bg-slate-800 text-slate-500 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-not-allowed"
                        title="Contact number will be visible after booking approval"
                      >
                        <Phone className="w-4 h-4" /> Available after approval
                      </button>
                    )}
                    <button
                      onClick={() => setShowChat(true)}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4 text-blue-400" /> Chat
                    </button>
                  </div>
                </div>

                {/* Route Box */}
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pickup Address</span>
                      <p className="font-bold text-slate-900 text-sm mt-1 flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{assignedTrip.pickupLocation}</span>
                      </p>
                      <span className="text-[11px] text-slate-500 mt-1 block">Date: {assignedTrip.pickupDate}</span>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Destination Address</span>
                      <p className="font-bold text-slate-900 text-sm mt-1 flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{assignedTrip.deliveryLocation}</span>
                      </p>
                      <span className="text-[11px] text-slate-500 mt-1 block">Consignee: {assignedTrip.customerCompany}</span>
                    </div>
                  </div>

                  {/* Large In-Cab Step Progression Buttons */}
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 mb-3">
                      Tap to Update Trip Milestone
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {assignedTrip.status === 'requested' || assignedTrip.status === 'accepted' || assignedTrip.status === 'assigned' ? (
                        <button
                          onClick={() => handleStatusAdvance(assignedTrip.id, 'trip_started')}
                          className="p-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition"
                        >
                          <Navigation className="w-5 h-5" /> 1. Start Trip from Base
                        </button>
                      ) : null}

                      {assignedTrip.status === 'trip_started' && (
                        <button
                          onClick={() => handleStatusAdvance(assignedTrip.id, 'reached_pickup')}
                          className="p-4 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition"
                        >
                          <MapPin className="w-5 h-5" /> 2. Reached Pickup Warehouse
                        </button>
                      )}

                      {assignedTrip.status === 'reached_pickup' && (
                        <button
                          onClick={() => handleStatusAdvance(assignedTrip.id, 'loading_completed')}
                          className="p-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition"
                        >
                          <CheckCircle2 className="w-5 h-5" /> 3. Loading Done &amp; E-way Bill Signed
                        </button>
                      )}

                      {assignedTrip.status === 'loading_completed' && (
                        <button
                          onClick={() => handleStatusAdvance(assignedTrip.id, 'in_transit')}
                          className="p-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition"
                        >
                          <Truck className="w-5 h-5" /> 4. In Transit on Highway
                        </button>
                      )}

                      {assignedTrip.status === 'in_transit' && (
                        <button
                          onClick={() => handleStatusAdvance(assignedTrip.id, 'reached_destination')}
                          className="p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition"
                        >
                          <MapPin className="w-5 h-5" /> 5. Reached Destination Bay
                        </button>
                      )}

                      {assignedTrip.status === 'reached_destination' && (
                        <button
                          onClick={() => handleStatusAdvance(assignedTrip.id, 'delivered')}
                          className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition"
                        >
                          <CheckCircle2 className="w-5 h-5" /> 6. Goods Unloaded &amp; POD Received
                        </button>
                      )}

                      {assignedTrip.status === 'delivered' && (
                        <button
                          onClick={() => handleStatusAdvance(assignedTrip.id, 'completed')}
                          className="p-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition"
                        >
                          <CheckCircle2 className="w-5 h-5" /> Complete Trip &amp; Close Job
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Highway GPS Map */}
                  <div className="pt-2">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 mb-3">
                      Live Navigation Route
                    </h4>
                    <LiveTrackingMap order={assignedTrip} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: DRIVER VACANCIES & HIRING BOARD */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {/* Header & Search */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-500" />
                  <span>Transporter Driver Vacancies</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct commercial driving jobs with verified fleet operators. Apply with your resume and license details.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter route, vehicle..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Job Openings List */}
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-2">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-sm text-slate-700">No matching driver job vacancies found</p>
              <p className="text-xs text-slate-400">Try clearing filters or check back when transporters post new hiring ads.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredJobs.map((job) => {
                const existingApp = jobApplications.find(a => 
                  a.jobId === job.id && (a.driverPhone === user.phone || a.driverId === user.id)
                );

                return (
                  <div 
                    key={job.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:border-amber-400 transition space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-base text-slate-900">{job.vehicleType}</span>
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            HIRING NOW
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.transporterName}</span>
                          <span>•</span>
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.transporterPhone}</span>
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100 block">
                          {job.salaryOffer}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Route</span>
                        <p className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{job.route}</span>
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Experience Required</span>
                        <p className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                          <span>{job.experienceRequired}+ Years Commercial Driving</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 leading-relaxed bg-amber-50/40 p-3 rounded-2xl border border-amber-100/60">
                      <strong className="text-slate-800 block text-[11px] mb-0.5">Requirements &amp; Duties:</strong>
                      {job.requirements}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Posted: {job.createdAt}
                      </span>

                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${job.transporterPhone}`}
                          onClick={(e) => {
                            if (!job.transporterPhone) {
                              e.preventDefault();
                              showToast('Contact number not available');
                            }
                          }}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call Transporter
                        </a>

                        {existingApp ? (
                          <span className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border ${
                            existingApp.status === 'shortlisted' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : existingApp.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Applied ({existingApp.status.toUpperCase()})</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOpenApplyModal(job)}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow transition"
                          >
                            <UploadCloud className="w-4 h-4" /> Apply Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY APPLICATIONS */}
      {activeTab === 'my_applications' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              <span>My Submitted Job Applications</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Track your driver job applications and resume reviews by transporters.
            </p>
          </div>

          {myApplications.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-sm text-slate-700">You haven&apos;t applied to any driver vacancies yet.</p>
              <button
                onClick={() => setActiveTab('jobs')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow"
              >
                Browse Open Driver Vacancies
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myApplications.map((app) => {
                const job = jobVacancies.find(j => j.id === app.jobId);
                return (
                  <div key={app.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <span className="font-extrabold text-sm text-slate-900 block">
                          {job ? job.vehicleType : 'Commercial Heavy Vehicle'}
                        </span>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Transporter: <strong>{job?.transporterName || 'Fleet Operator'}</strong> • Route: {job?.route || 'All India'}
                        </p>
                      </div>

                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                          app.status === 'shortlisted'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : app.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {app.status === 'shortlisted' ? '✓ Shortlisted' : app.status === 'applied' ? 'Under Review' : 'Not Selected'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">License</span>
                        <strong className="text-slate-800">{app.licenseNumber}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Experience</span>
                        <strong className="text-slate-800">{app.experienceYears} Years</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Resume Attached</span>
                        <span className="text-blue-600 font-bold truncate block">{app.resumeFileName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Applied On</span>
                        <span className="text-slate-600 font-medium">{app.appliedAt}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* APPLY FOR JOB MODAL */}
      {selectedJobForApply && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 animate-in fade-in duration-150">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Driver Job Application
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Apply for {selectedJobForApply.vehicleType}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Route: <strong>{selectedJobForApply.route}</strong> • {selectedJobForApply.salaryOffer}
                </p>
              </div>
              <button
                onClick={() => setSelectedJobForApply(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applyError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{applyError}</span>
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Driver Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="e.g. Ramesh K. Rathod"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Experience (Years) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    required
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Commercial Driving License Number (HMV / LMV) *
                </label>
                <input
                  type="text"
                  required
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. GJ0120200045678"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
                />
              </div>

              {/* Resume Upload Area */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Upload Resume / Bio-Data *
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-4 text-center bg-slate-50 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-8 h-8 text-amber-500 mx-auto mb-1.5" />
                  <p className="font-bold text-slate-800 text-xs">
                    {resumeFileReady ? resumeFileName : 'Click to select your Resume (PDF, DOC, DOCX)'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Maximum size: 10MB • Auto-attaches to transporter candidate dossier
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedJobForApply(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black shadow transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Submit Application &amp; Resume
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Driver Chat Modal */}
      {showChat && assignedTrip && (
        <ChatModal order={assignedTrip} onClose={() => setShowChat(false)} />
      )}
    </div>
  );
};
