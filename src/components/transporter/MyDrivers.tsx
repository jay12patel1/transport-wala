import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DriverRecord, DriverJobVacancy, JobApplication } from '../../types';
import { 
  User, Plus, Phone, Award, ShieldCheck, 
  Truck, Star, KeyRound, Calendar, AlertCircle, X, CheckCircle2,
  Briefcase, FileText, Check, XCircle, Search, MapPin, Building2,
  UploadCloud, ExternalLink, UserCheck
} from 'lucide-react';

export const MyDrivers: React.FC = () => {
  const { 
    drivers, 
    user, 
    vehicles, 
    addDriver, 
    showToast,
    jobVacancies,
    jobApplications,
    postJobVacancy,
    updateJobVacancyStatus,
    deleteJobVacancy,
    updateApplicationStatus
  } = useApp();

  const [activeTab, setActiveTab] = useState<'drivers' | 'vacancies' | 'applications'>('drivers');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPostVacancyModal, setShowPostVacancyModal] = useState(false);

  // Driver Onboard Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [experienceYears, setExperienceYears] = useState('5');
  const [assignedVehicleId, setAssignedVehicleId] = useState('');
  const [passcode, setPasscode] = useState('4321');
  const [error, setError] = useState<string | null>(null);

  // Post Vacancy Form State
  const [vacancyVehicleType, setVacancyVehicleType] = useState('32ft Multi-Axle Container (14 Ton)');
  const [customVehicleType, setCustomVehicleType] = useState('');
  const [vacancyRoute, setVacancyRoute] = useState('Ahmedabad to Mumbai / JNPT Port');
  const [vacancySalary, setVacancySalary] = useState('₹28,000 / month + ₹600 Trip Allowance');
  const [vacancyExp, setVacancyExp] = useState('4');
  const [vacancyReqs, setVacancyReqs] = useState('HMV Commercial driving license required. Experience on NH48 highway, safe cargo handling, clean driving record.');
  const [vacancyError, setVacancyError] = useState<string | null>(null);

  // Filter vehicles owned by current transporter
  const myVehicles = vehicles.filter(v => v.ownerId === user.id);

  // Filter vacancies and applications belonging to this transporter
  const myVacancies = jobVacancies.filter(j => j.transporterId === user.id);
  const myApplications = jobApplications.filter(app => {
    return myVacancies.some(v => v.id === app.jobId) || app.jobId.includes(user.id);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName || !phone || !licenseNumber) {
      setError('Please fill in Driver Full Name, Mobile Phone, and Driving License Number.');
      return;
    }

    if (phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const res = addDriver({
      fullName,
      phone,
      email: email || undefined,
      licenseNumber,
      experienceYears: Number(experienceYears) || 5,
      assignedVehicleId: assignedVehicleId || undefined,
      passcode: passcode || '4321'
    });

    if (res.success) {
      setShowAddModal(false);
      setFullName('');
      setPhone('');
      setEmail('');
      setLicenseNumber('');
      setExperienceYears('5');
      setAssignedVehicleId('');
      setPasscode('4321');
    } else {
      setError(res.message || 'Failed to onboard driver.');
    }
  };

  const handlePostVacancySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVacancyError(null);

    const vehicleTypeToUse = vacancyVehicleType === 'Other' ? customVehicleType : vacancyVehicleType;
    if (!vehicleTypeToUse.trim() || !vacancyRoute.trim() || !vacancySalary.trim()) {
      setVacancyError('Please fill in Vehicle Type, Route, and Salary Offer.');
      return;
    }

    const res = postJobVacancy({
      vehicleType: vehicleTypeToUse.trim(),
      route: vacancyRoute.trim(),
      salaryOffer: vacancySalary.trim(),
      experienceRequired: Number(vacancyExp) || 3,
      requirements: vacancyReqs.trim()
    });

    if (res.success) {
      setShowPostVacancyModal(false);
      setVacancyRoute('');
      setVacancySalary('');
      setVacancyReqs('');
      setActiveTab('vacancies');
    } else {
      setVacancyError(res.message || 'Failed to post vacancy.');
    }
  };

  // Quick hire candidate into fleet
  const handleQuickHire = (app: JobApplication) => {
    updateApplicationStatus(app.id, 'shortlisted');
    setFullName(app.driverName);
    setPhone(app.driverPhone);
    setLicenseNumber(app.licenseNumber);
    setExperienceYears(String(app.experienceYears));
    setPasscode('4321');
    setShowAddModal(true);
    showToast(`Pre-filled ${app.driverName}'s details for authorized fleet onboarding!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Fleet Commercial Drivers &amp; Hiring Board
            </h1>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Fleet Operations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your authorized drivers, publish hiring vacancies, and inspect received driver resumes.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowPostVacancyModal(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow flex items-center gap-1.5 transition"
          >
            <Briefcase className="w-4 h-4" /> Post Driver Vacancy
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" /> Onboard Fleet Driver
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300">
        <button
          onClick={() => setActiveTab('drivers')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 ${
            activeTab === 'drivers'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <User className="w-4 h-4 text-blue-600" />
          <span>Active Fleet Drivers ({drivers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vacancies')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 ${
            activeTab === 'vacancies'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Briefcase className="w-4 h-4 text-amber-500" />
          <span>My Driver Vacancies ({myVacancies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 relative ${
            activeTab === 'applications'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>Applications Received ({myApplications.length})</span>
          {myApplications.filter(a => a.status === 'applied').length > 0 && (
            <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
              {myApplications.filter(a => a.status === 'applied').length} New
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: FLEET DRIVERS LIST */}
      {activeTab === 'drivers' && (
        <>
          {drivers.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
                <User className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-slate-800">No Drivers Registered in Your Fleet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Add drivers to assign them to your 20ft/30ft/32ft containers and enable real-time in-cab highway navigation and GPS telemetry.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow"
                >
                  Onboard First Driver
                </button>
                <button
                  onClick={() => setShowPostVacancyModal(true)}
                  className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold shadow"
                >
                  Post Hiring Vacancy
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drivers.map(driver => (
                <div 
                  key={driver.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-700 text-lg border border-slate-200">
                        {driver.fullName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-sm leading-snug">{driver.fullName}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <Phone className="w-3 h-3 text-blue-600" />
                          <span className="font-mono">{driver.phone}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      driver.status === 'on_trip' 
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : driver.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {driver.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* License & Experience */}
                  <div className="bg-slate-50 rounded-2xl p-3 text-xs space-y-2 border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Commercial DL:</span>
                      <span className="font-mono font-bold text-slate-800">{driver.licenseNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Driving Experience:</span>
                      <span className="font-bold text-slate-800">{driver.experienceYears} Years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Driver Rating:</span>
                      <span className="font-bold text-amber-600 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {driver.rating || 4.9} / 5.0
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">In-Cab Login PIN:</span>
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {driver.passcode || '4321'}
                      </span>
                    </div>
                  </div>

                  {/* Assigned Vehicle */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span>Assigned Truck:</span>
                    </div>
                    <span className="font-bold font-mono text-slate-900">
                      {driver.assignedVehicleNumber || 'Not assigned'}
                    </span>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <a
                      href={`tel:${driver.phone}`}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call Driver
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 2: MY DRIVER VACANCIES */}
      {activeTab === 'vacancies' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-500" />
                <span>My Driver Vacancy Posts</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                These job openings are broadcasted to commercial drivers across Gujarat &amp; Maharashtra.
              </p>
            </div>

            <button
              onClick={() => setShowPostVacancyModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Post New Driver Vacancy
            </button>
          </div>

          {myVacancies.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-800">No Driver Vacancies Posted Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Need drivers for your 32ft containers, flatbeds, or tankers? Post a requirement with salary and route details.
              </p>
              <button
                onClick={() => setShowPostVacancyModal(true)}
                className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-black shadow"
              >
                Post Your First Driver Vacancy
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myVacancies.map(vac => {
                const appCount = jobApplications.filter(a => a.jobId === vac.id).length;
                return (
                  <div key={vac.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-base text-slate-900">{vac.vehicleType}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border ${
                            vac.status === 'open' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {vac.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-500" />
                          <span>{vac.route}</span>
                        </p>
                      </div>

                      <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                        {vac.salaryOffer}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-1 text-slate-600">
                      <div className="flex justify-between text-slate-700 font-bold">
                        <span>Min Experience:</span>
                        <span>{vac.experienceRequired}+ Years Commercial</span>
                      </div>
                      <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 mt-1">
                        {vac.requirements}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                      <button
                        onClick={() => setActiveTab('applications')}
                        className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{appCount} Resumes Received</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateJobVacancyStatus(vac.id, vac.status === 'open' ? 'closed' : 'open')}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                            vac.status === 'open'
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                          }`}
                        >
                          {vac.status === 'open' ? 'Close Ad' : 'Reopen Ad'}
                        </button>
                        <button
                          onClick={() => deleteJobVacancy(vac.id)}
                          className="px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: APPLICATIONS RECEIVED */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>Applications &amp; Resumes Received</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review applicant resumes, verify commercial license numbers, and shortlist or onboard candidates.
              </p>
            </div>
          </div>

          {myApplications.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-800">No Driver Resumes Received Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Applications submitted by drivers from their Driver Console will appear here in real-time.
              </p>
              <button
                onClick={() => setShowPostVacancyModal(true)}
                className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-black shadow"
              >
                Post Hiring Ad to Attract Drivers
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myApplications.map(app => {
                const job = jobVacancies.find(j => j.id === app.jobId);
                return (
                  <div key={app.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-700 font-black text-lg flex items-center justify-center border border-amber-300">
                          {app.driverName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-base text-slate-900">{app.driverName}</h4>
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                              app.status === 'shortlisted'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : app.status === 'rejected'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {app.status === 'shortlisted' ? '✓ Shortlisted' : app.status === 'applied' ? 'New Application' : 'Rejected'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Applied for: <strong className="text-slate-800">{job ? job.vehicleType : 'Commercial Truck'}</strong> • Route: {job ? job.route : 'Highway'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${app.driverPhone}`}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call {app.driverPhone}
                        </a>
                      </div>
                    </div>

                    {/* Candidate Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Commercial DL</span>
                        <strong className="font-mono text-slate-900 text-xs">{app.licenseNumber}</strong>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Experience</span>
                        <strong className="text-slate-900 text-xs">{app.experienceYears} Years Commercial Driving</strong>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Resume / Bio-Data</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="font-bold text-blue-700 truncate">{app.resumeFileName}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Applied Date</span>
                        <span className="text-slate-600 font-semibold">{app.appliedAt}</span>
                      </div>
                    </div>

                    {/* Transporter Review Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            showToast(`Opening candidate resume file "${app.resumeFileName}"`);
                            if (app.resumeUrl) window.open(app.resumeUrl, '_blank');
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View Full Resume
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {app.status !== 'rejected' && (
                          <button
                            onClick={() => updateApplicationStatus(app.id, 'rejected')}
                            className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition"
                          >
                            Reject
                          </button>
                        )}

                        {app.status !== 'shortlisted' && (
                          <button
                            onClick={() => updateApplicationStatus(app.id, 'shortlisted')}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Shortlist Candidate
                          </button>
                        )}

                        <button
                          onClick={() => handleQuickHire(app)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition flex items-center gap-1.5"
                        >
                          <UserCheck className="w-4 h-4" /> Onboard into Fleet
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: POST DRIVER VACANCY */}
      {showPostVacancyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 animate-in fade-in duration-150">
            <div className="flex justify-between items-start pb-2 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Transporter Hiring Ad
                </span>
                <h3 className="font-black text-lg text-slate-900 mt-1">
                  Post Commercial Driver Vacancy
                </h3>
                <p className="text-xs text-slate-500">
                  Publish to the Driver Jobs board so qualified commercial drivers can apply with their resume.
                </p>
              </div>
              <button 
                onClick={() => setShowPostVacancyModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {vacancyError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{vacancyError}</span>
              </div>
            )}

            <form onSubmit={handlePostVacancySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Commercial Vehicle Type *
                </label>
                <select
                  value={vacancyVehicleType}
                  onChange={(e) => setVacancyVehicleType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="32ft Multi-Axle Container (14 Ton)">32ft Multi-Axle Container (14 Ton)</option>
                  <option value="30ft Closed Body Container (10 Ton)">30ft Closed Body Container (10 Ton)</option>
                  <option value="24ft Flatbed Trailer (20 Ton)">24ft Flatbed Trailer (20 Ton)</option>
                  <option value="20ft High-Cube Container (9 Ton)">20ft High-Cube Container (9 Ton)</option>
                  <option value="Multi-Axle Chemical / Fuel Tanker">Multi-Axle Chemical / Fuel Tanker</option>
                  <option value="Open Body High-Deck Truck (16 Ton)">Open Body High-Deck Truck (16 Ton)</option>
                  <option value="Tata Ace / Pick-up (1.5 Ton)">Tata Ace / Pick-up (1.5 Ton)</option>
                  <option value="Other">Other Custom Type</option>
                </select>

                {vacancyVehicleType === 'Other' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter custom vehicle category..."
                    value={customVehicleType}
                    onChange={(e) => setCustomVehicleType(e.target.value)}
                    className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Highway Route / Corridors *
                </label>
                <input
                  type="text"
                  required
                  value={vacancyRoute}
                  onChange={(e) => setVacancyRoute(e.target.value)}
                  placeholder="e.g. Ahmedabad to Mumbai / JNPT Port"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Monthly Salary Offer &amp; Allowances *
                  </label>
                  <input
                    type="text"
                    required
                    value={vacancySalary}
                    onChange={(e) => setVacancySalary(e.target.value)}
                    placeholder="e.g. ₹28,000/mo + ₹600 Trip Allowance"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Experience Required (Years) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    required
                    value={vacancyExp}
                    onChange={(e) => setVacancyExp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  License &amp; Candidate Requirements
                </label>
                <textarea
                  rows={3}
                  value={vacancyReqs}
                  onChange={(e) => setVacancyReqs(e.target.value)}
                  placeholder="e.g. Valid HMV license, clean highway driving history, smartphone usage for E-way bill POD..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPostVacancyModal(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Publish Driver Vacancy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ONBOARD FLEET DRIVER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Onboard Fleet Commercial Driver</h3>
                <p className="text-xs text-slate-500">Authorizes this driver to log in and manage assigned vehicle trips.</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-slate-100 rounded-xl text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Driver Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Suresh Kumar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9898054321"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Commercial DL Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                    placeholder="GJ-01-2018-883492"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium uppercase font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    In-Cab Login 4-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="4321"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono tracking-widest focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Assign to Fleet Commercial Vehicle
                </label>
                <select
                  value={assignedVehicleId}
                  onChange={(e) => setAssignedVehicleId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Select Fleet Vehicle (Optional) --</option>
                  {myVehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.vehicleNumber} ({v.vehicleType} - {v.capacityTon} Ton)
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition"
                >
                  Save &amp; Authorize Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
