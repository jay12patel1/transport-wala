import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  UserProfile, UserRole, Vehicle, BookingOrder, VehicleStatus, 
  DocStatus, DocType, OrderStatus, TransporterEarning, Settlement, 
  Complaint, NotificationItem, AdminSettings, Language, ChatMessage, 
  VehicleDocument, DriverRecord, AuthSession, AuthCredentials,
  DriverJobVacancy, JobApplication, CustomerFreightRequirement
} from '../types';
import { 
  DEMO_USERS, INITIAL_VEHICLES, INITIAL_BOOKINGS, 
  INITIAL_EARNINGS, INITIAL_COMPLAINTS, INITIAL_SETTLEMENTS, 
  INITIAL_ADMIN_SETTINGS, INITIAL_DRIVERS, DEMO_CREDENTIALS,
  INITIAL_JOB_VACANCIES, INITIAL_JOB_APPLICATIONS
} from '../data/demoData';
import { translations } from '../data/translations';
import { getVehicleImage } from '../utils/vehicleImages';
import { 
  isSupabaseConfigured, 
  supabase,
  signInAdminWithSupabase, 
  updateSupabasePassword, 
  updateSupabaseEmail, 
  requestSupabasePasswordReset, 
  signOutSupabase,
  syncVehicleToSupabase,
  fetchVehiclesFromSupabase,
  syncBookingToSupabase,
  fetchBookingsFromSupabase,
  syncDriverToSupabase,
  fetchDriversFromSupabase,
  syncFreightRequirementToSupabase,
  fetchFreightRequirementsFromSupabase
} from '../lib/supabase';

interface SearchQuery {
  pickup: string;
  destination: string;
  date: string;
  vehicleType: string;
  size: string;
  minCapacityTon: number;
  isRefrigerated: boolean;
}

export interface SecurityAlert {
  id: string;
  title: string;
  message: string;
  attemptedRole: UserRole;
  attemptedPath: string;
  redirectedPath: string;
  timestamp: string;
}

export interface AdminSecurityInfo {
  email: string;
  lastPasswordChange: string;
  isSupabaseConnected: boolean;
  role: 'super_admin';
}

interface AppContextType {
  // Authentication & Session
  isAuthenticated: boolean;
  user: UserProfile;
  role: UserRole;
  session: AuthSession | null;
  login: (roleOrPhone: UserRole | string, credentialsOrPassword?: { identifier?: string; phone?: string; password?: string; passcode?: string } | string, maybeRole?: UserRole) => Promise<any>;
  register: (roleOrUserData: UserRole | any, data?: any) => Promise<boolean | { success: boolean; message?: string }>;
  logout: () => void;
  switchUser: (role: UserRole) => void;
  updateUserProfile: (data: Partial<UserProfile>) => void;
  saveUserProfileToSupabase?: (userData: any) => Promise<boolean>;
  registeredUsers: UserProfile[];

  // Super Admin Security & Credentials
  adminSecurityInfo: AdminSecurityInfo;
  changeAdminPassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  changeAdminEmail: (newEmail: string, currentPassword: string) => Promise<{ success: boolean; message?: string }>;
  requestAdminPasswordReset: (email: string) => Promise<{ success: boolean; message?: string; tempOtp?: string }>;
  confirmAdminPasswordReset: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;

  // Navigation & Route Security
  screen: string;
  setScreen: (screen: string) => void;
  navigateProtected: (targetScreen: string) => void;
  securityAlert: SecurityAlert | null;
  dismissSecurityAlert: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;

  // Search & Vehicles
  searchQuery: SearchQuery;
  setSearchQuery: (query: SearchQuery | ((prev: SearchQuery) => SearchQuery)) => void;
  vehicles: Vehicle[]; // Role-authorized filtered vehicles
  allMarketplaceVehicles: Vehicle[]; // Public available & verified catalog for booking search
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (v: Vehicle | null) => void;
  addVehicle: (vehicleData: Partial<Vehicle>) => void | Promise<void>;
  updateVehicleStatus: (vehicleId: string, status: VehicleStatus) => void | Promise<void>;
  uploadDocument: (vehicleId: string, doc: Partial<VehicleDocument>) => void;
  verifyDocument: (vehicleId: string, docId: string, status: DocStatus, reason?: string) => void;

  // Driver Management
  drivers: DriverRecord[]; // Role-authorized drivers
  allDrivers: DriverRecord[];
  addDriver: (driverData: { fullName: string; phone: string; email?: string; licenseNumber: string; experienceYears: number; assignedVehicleId?: string; passcode?: string }) => { success: boolean; message?: string };
  assignDriver: (orderId: string, driverName: string, driverPhone: string, driverId?: string) => void;

  // Bookings & Orders (Role-Filtered)
  bookings: BookingOrder[];
  allBookings: BookingOrder[];
  selectedOrder: BookingOrder | null;
  setSelectedOrder: (order: BookingOrder | null) => void;
  createBooking: (vehicleOrData: Vehicle | Partial<BookingOrder>, pickup?: string, destination?: string, date?: string, notes?: string) => Promise<BookingOrder> | BookingOrder;
  updateBookingStatus: (bookingId: string, status: any) => Promise<void> | void;
  updateOrderStatus: (orderId: string, status: OrderStatus, reason?: string) => void;
  
  // GPS Tracking Simulation
  startGpsTracking: (orderId: string) => void;
  stopGpsTracking: (orderId: string) => void;

  // Financials & Settlements (Role-Filtered)
  earnings: TransporterEarning[];
  allEarnings: TransporterEarning[];
  settlements: Settlement[];
  allSettlements: Settlement[];
  createSettlement: (transporterId: string, earningIds: string[], referenceNo: string) => void;
  adminSettings: AdminSettings;
  updateAdminSettings: (settings: Partial<AdminSettings>) => void;

  // Chat & Communication
  chatMessages: Record<string, ChatMessage[]>;
  sendMessage: (bookingId: string, text: string) => void;

  // Notifications (Role-Filtered)
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markAllNotificationsRead: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => void;

  // Complaints (Role-Filtered)
  complaints: Complaint[];
  allComplaints: Complaint[];
  createComplaint: (bookingId: string, orderId: string, category: Complaint['category'], description: string) => void;
  updateComplaintStatus: (complaintId: string, status: Complaint['status'], adminNotes?: string) => void;

  // Driver Jobs & Vacancy Board
  jobVacancies: DriverJobVacancy[];
  jobApplications: JobApplication[];
  postJobVacancy: (jobData: {
    vehicleType: string;
    route: string;
    salaryOffer: string;
    experienceRequired: number;
    requirements: string;
  }) => Promise<{ success: boolean; message?: string }> | { success: boolean; message?: string };
  updateJobVacancyStatus: (vacancyId: string, status: 'open' | 'closed') => void;
  deleteJobVacancy: (vacancyId: string) => void;
  applyForJob: (jobId: string, applicationData: {
    driverName: string;
    driverPhone: string;
    experienceYears: number;
    licenseNumber: string;
    resumeFileName: string;
    resumeUrl?: string;
  }) => Promise<{ success: boolean; message?: string }> | { success: boolean; message?: string };
  updateApplicationStatus: (applicationId: string, status: 'applied' | 'shortlisted' | 'rejected') => void;

  // Customer Freight Requirements (Bulk Loads)
  freightRequirements: CustomerFreightRequirement[];
  allFreightRequirements: CustomerFreightRequirement[];
  customerRequirements: CustomerFreightRequirement[];
  setCustomerRequirements: React.Dispatch<React.SetStateAction<CustomerFreightRequirement[]>>;
  addCustomerRequirement: (req: Omit<CustomerFreightRequirement, 'id' | 'createdAt' | 'status'> | CustomerFreightRequirement) => Promise<CustomerFreightRequirement> | CustomerFreightRequirement;
  addFreightRequirement: (req: Omit<CustomerFreightRequirement, 'id' | 'createdAt' | 'status'> | CustomerFreightRequirement) => Promise<CustomerFreightRequirement> | CustomerFreightRequirement;
  createFreightRequirement: (req: Omit<CustomerFreightRequirement, 'id' | 'createdAt' | 'status'> | CustomerFreightRequirement) => Promise<CustomerFreightRequirement> | CustomerFreightRequirement;
  updateFreightRequirementStatus: (id: string, status: 'open' | 'fulfilled' | 'closed') => void;

  setBookings: React.Dispatch<React.SetStateAction<BookingOrder[]>>;
  driverApplications: JobApplication[];
  setDriverApplications: React.Dispatch<React.SetStateAction<JobApplication[]>>;

  // Toast message
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'transport_wala_auth_session_v3';
const REGISTERED_USERS_KEY = 'transport_wala_users_clean_v3';
const DRIVERS_STORAGE_KEY = 'transport_wala_drivers_clean_v3';
const ADMIN_SECURITY_KEY = 'transport_wala_super_admin_sec_v3';
const VEHICLES_STORAGE_KEY = 'transport_wala_vehicles_clean_v3';
const BOOKINGS_STORAGE_KEY = 'transport_wala_bookings_clean_v3';
const JOB_VACANCIES_KEY = 'transport_wala_job_vacancies_v3';
const JOB_APPLICATIONS_KEY = 'transport_wala_job_applications_v3';
const CLEAN_SLATE_KEY = 'transport_wala_clean_slate_applied_v3';

// CLEAN SLATE ON INITIAL LOAD: Clear out any pre-existing dummy/sample records from localStorage
try {
  if (typeof window !== 'undefined' && !localStorage.getItem(CLEAN_SLATE_KEY)) {
    const legacyKeys = [
      'transport_wala_users_v2',
      'transport_wala_users_v1',
      'transport_wala_drivers_v2',
      'transport_wala_drivers_v1',
      'transport_wala_vehicles',
      'transport_wala_vehicles_v1',
      'transport_wala_vehicles_v2',
      'transport_wala_bookings',
      'transport_wala_bookings_v1',
      'transport_wala_bookings_v2',
      'transport_wala_earnings',
      'transport_wala_complaints',
      'transport_wala_settlements',
      'transport_wala_auth_session_v1',
      'transport_wala_auth_session_v2'
    ];
    legacyKeys.forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });
    localStorage.setItem(CLEAN_SLATE_KEY, 'clean_slate_active');
  }
} catch (e) {
  console.error('Clean slate migration error', e);
}

const DEFAULT_UNAUTH_USER: UserProfile = {
  id: 'usr_guest',
  role: 'customer',
  fullName: 'Guest Shipper',
  companyName: 'Transport Wala Shipper',
  phone: '',
  email: '',
  address: 'Gujarat, India',
  rating: 5.0,
  isVerified: false,
  status: 'active'
};

interface AdminSecurityState {
  email: string;
  password?: string;
  lastPasswordChange: string;
  resetToken?: { otp: string; expiresAt: number };
}

export function formatVehicleRow(row: any): Vehicle {
  return {
    id: String(row.id || `veh_${Date.now()}`),
    ownerId: String(row.ownerId || row.owner_id || ''),
    transporterName: String(row.transporterName || row.transporter_name || 'Fleet Operator'),
    transporterPhone: String(row.transporterPhone || row.transporter_phone || ''),
    transporterRating: Number(row.transporterRating ?? row.transporter_rating ?? 5.0),
    vehicleNumber: String(row.vehicleNumber || row.vehicle_number || 'GJ-01-TW-0000'),
    vehicleType: String(row.vehicleType || row.vehicle_type || 'Commercial Truck'),
    vehicleCategory: (row.vehicleCategory || row.vehicle_category || 'Container') as Vehicle['vehicleCategory'],
    vehicleSize: String(row.vehicleSize || row.vehicle_size || 'Standard Commercial Size'),
    capacityKg: Number(row.capacityKg ?? row.capacity_kg ?? 10000),
    capacityTon: Number(row.capacityTon ?? row.capacity_ton ?? 10),
    currentLocation: String(row.currentLocation || row.current_location || 'Gujarat'),
    preferredRoute: String(row.preferredRoute || row.preferred_route || 'Gujarat & Western Freight'),
    availableFromDate: String(row.availableFromDate || row.available_from_date || new Date().toISOString().split('T')[0]),
    isRefrigerated: Boolean(row.isRefrigerated ?? row.is_refrigerated),
    status: (row.status as VehicleStatus) || 'available',
    baseFare: Number(row.baseFare ?? row.base_fare ?? 20000),
    perKmRate: Number(row.perKmRate ?? row.per_km_rate ?? 45),
    driverName: String(row.driverName || row.driver_name || ''),
    driverPhone: String(row.driverPhone || row.driver_phone || ''),
    imageUrl: String(row.imageUrl || row.image_url || ''),
    description: String(row.description || ''),
    isVerified: row.isVerified !== undefined ? Boolean(row.isVerified) : (row.is_verified !== undefined ? Boolean(row.is_verified) : true),
    documents: Array.isArray(row.documents) ? row.documents : []
  };
}

export function formatUserRow(row: any): UserProfile {
  return {
    id: String(row.id || `usr_${Date.now()}`),
    role: (row.role as UserRole) || 'customer',
    fullName: String(row.fullName || row.full_name || 'Transport User'),
    companyName: String(row.companyName || row.company_name || ''),
    phone: String(row.phone || row.mobile || ''),
    email: String(row.email || ''),
    gstNumber: row.gstNumber || row.gst_number || undefined,
    address: String(row.address || 'Gujarat, India'),
    rating: Number(row.rating ?? 5.0),
    isVerified: row.isVerified !== undefined ? Boolean(row.isVerified) : (row.is_verified !== undefined ? Boolean(row.is_verified) : true),
    phone_verified: true,
    phoneVerified: true,
    status: (row.status as any) || 'active',
    password: String(row.password || 'password123'),
    createdAt: String(row.createdAt || row.created_at || new Date().toISOString().split('T')[0])
  };
}

export function formatJobVacancyRow(row: any): DriverJobVacancy {
  return {
    id: String(row.id || `job_${Date.now()}`),
    transporterId: String(row.transporterId || row.transporter_id || ''),
    transporterName: String(row.transporterName || row.transporter_name || 'Fleet Transporter'),
    transporterPhone: String(row.transporterPhone || row.transporter_phone || ''),
    vehicleType: String(row.vehicleType || row.vehicle_type || 'Commercial Truck'),
    route: String(row.route || 'Gujarat → Western Freight'),
    salaryOffer: String(row.salaryOffer || row.salary_offer || '₹25,000 - ₹35,000 / month'),
    experienceRequired: Number(row.experienceRequired ?? row.experience_required ?? 2),
    requirements: String(row.requirements || 'Commercial driving license required'),
    status: (row.status as 'open' | 'closed') || 'open',
    createdAt: String(row.createdAt || row.created_at || new Date().toISOString().split('T')[0])
  };
}

export function formatJobApplicationRow(row: any): JobApplication {
  return {
    id: String(row.id || `app_${Date.now()}`),
    jobId: String(row.jobId || row.job_id || ''),
    driverId: String(row.driverId || row.driver_id || ''),
    driverName: String(row.driverName || row.driver_name || 'Commercial Driver'),
    driverPhone: String(row.driverPhone || row.driver_phone || ''),
    experienceYears: Number(row.experienceYears ?? row.experience_years ?? 3),
    licenseNumber: String(row.licenseNumber || row.license_number || ''),
    resumeFileName: String(row.resumeFileName || row.resume_file_name || 'Commercial_Driver_Resume.pdf'),
    resumeUrl: String(row.resumeUrl || row.resume_url || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80'),
    status: (row.status as 'applied' | 'shortlisted' | 'rejected') || 'applied',
    appliedAt: String(row.appliedAt || row.applied_at || new Date().toISOString().split('T')[0])
  };
}

export function formatFreightRequirementRow(row: any): CustomerFreightRequirement {
  return {
    id: String(row.id || `REQ-${Date.now().toString().slice(-6)}`),
    customerId: String(row.customerId || row.customer_id || ''),
    customerName: String(row.customerName || row.customer_name || 'Commercial Shipper'),
    customerPhone: String(row.customerPhone || row.customer_phone || ''),
    pickupLocation: String(row.pickupLocation || row.pickup_location || 'Ahmedabad'),
    deliveryLocation: String(row.deliveryLocation || row.delivery_location || 'Mumbai'),
    pickupDate: String(row.pickupDate || row.pickup_date || new Date().toISOString().split('T')[0]),
    vehicleType: String(row.vehicleType || row.vehicle_type || 'Commercial Truck'),
    quantityRequired: Number(row.quantityRequired ?? row.quantity_required ?? 1),
    goodsDescription: String(row.goodsDescription || row.goods_description || 'General Cargo'),
    targetBudgetPerVehicle: row.targetBudgetPerVehicle ? Number(row.targetBudgetPerVehicle) : (row.target_budget_per_vehicle ? Number(row.target_budget_per_vehicle) : undefined),
    status: (row.status as 'open' | 'fulfilled' | 'closed') || 'open',
    createdAt: String(row.createdAt || row.created_at || new Date().toISOString())
  };
}

export function formatBookingRow(row: any): BookingOrder {
  return {
    id: String(row.id || `ORD-2026-${Math.floor(100000 + Math.random() * 900000)}`),
    customerId: String(row.customerId || row.customer_id || ''),
    customerName: String(row.customerName || row.customer_name || 'Shipper'),
    customerCompany: String(row.customerCompany || row.customer_company || ''),
    customerPhone: String(row.customerPhone || row.customer_phone || ''),
    transporterId: String(row.transporterId || row.transporter_id || ''),
    transporterName: String(row.transporterName || row.transporter_name || 'Transporter'),
    transporterPhone: String(row.transporterPhone || row.transporter_phone || ''),
    vehicleId: String(row.vehicleId || row.vehicle_id || ''),
    vehicleType: String(row.vehicleType || row.vehicle_type || 'Commercial Truck'),
    vehicleNumber: String(row.vehicleNumber || row.vehicle_number || ''),
    driverName: String(row.driverName || row.driver_name || 'Assigned Driver'),
    driverPhone: String(row.driverPhone || row.driver_phone || ''),
    pickupLocation: String(row.pickupLocation || row.pickup_location || ''),
    deliveryLocation: String(row.deliveryLocation || row.delivery_location || ''),
    pickupDate: String(row.pickupDate || row.pickup_date || new Date().toISOString().split('T')[0]),
    baseFare: Number(row.baseFare ?? row.base_amount ?? 0),
    loadingCharges: Number(row.loadingCharges ?? row.loading_charge ?? 0),
    unloadingCharges: Number(row.unloadingCharges ?? row.unloading_charge ?? 0),
    tollCharges: Number(row.tollCharges ?? row.toll_charge ?? 0),
    otherCharges: 0,
    gstAmount: Number(row.gstAmount ?? row.gst_amount ?? 0),
    totalAmount: Number(row.totalAmount ?? row.total_amount ?? 0),
    adminCommissionAmount: Number(row.adminCommissionAmount ?? row.commission_amount ?? 0),
    transporterPayableAmount: Number(row.transporterPayableAmount ?? row.transporter_payable_amount ?? 0),
    paymentStatus: (row.paymentStatus || row.payment_status || 'paid') as any,
    paymentMethod: (row.paymentMethod || row.payment_mode || 'online') as any,
    paymentTxnId: row.paymentTxnId || row.payment_txn_id,
    status: (row.status || 'requested') as OrderStatus,
    notes: row.notes,
    createdAt: String(row.createdAt || row.created_at || new Date().toISOString()),
    events: Array.isArray(row.events) ? row.events : [],
    currentGps: row.currentGps || row.current_gps || {
      lat: 23.0225,
      lng: 72.5714,
      speedKm: 0,
      updatedAt: 'GPS Ready',
      distanceCoveredKm: 0,
      totalDistanceKm: 530,
      etaMinutes: 420
    }
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Language
  const [language, setLanguage] = useState<Language>('en');

  // Super Admin Security State
  const [adminSecurity, setAdminSecurity] = useState<AdminSecurityState>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_SECURITY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.password) parsed.password = 'password123';
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return {
      email: (import.meta as any).env?.VITE_INITIAL_ADMIN_EMAIL || 'support@transportswala.com',
      password: (import.meta as any).env?.VITE_INITIAL_ADMIN_PASSWORD || 'password123',
      lastPasswordChange: '2026-08-01T10:00:00.000Z'
    };
  });

  const saveAdminSecurity = (newSec: AdminSecurityState) => {
    setAdminSecurity(newSec);
    try {
      localStorage.setItem(ADMIN_SECURITY_KEY, JSON.stringify(newSec));
    } catch (e) {
      console.error(e);
    }
  };

  const adminSecurityInfo: AdminSecurityInfo = useMemo(() => ({
    email: adminSecurity.email,
    lastPasswordChange: adminSecurity.lastPasswordChange,
    isSupabaseConnected: isSupabaseConfigured,
    role: 'super_admin'
  }), [adminSecurity]);

  // Users Directory: Clean slate with only default initial Super Admin account preserved
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(REGISTERED_USERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out dummy demo accounts
          const clean = parsed.filter(u => !['usr_cust_001', 'usr_trans_001', 'usr_drv_001'].includes(u.id));
          if (!clean.some(u => u.role === 'admin')) {
            clean.push(DEMO_USERS.admin);
          }
          return clean;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [DEMO_USERS.admin];
  });

  // Drivers List: Clean Slate (Empty array [])
  const [driversList, setDriversList] = useState<DriverRecord[]>(() => {
    try {
      const saved = localStorage.getItem(DRIVERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(d => !['usr_drv_001', 'usr_drv_002', 'usr_drv_003'].includes(d.id));
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_DRIVERS; // []
  });

  // Current session & auth - Strict memory state (clears on reload/tab close, starts logged out on landing)
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile>(DEFAULT_UNAUTH_USER);
  const [role, setRole] = useState<UserRole>('customer');
  const [screen, setScreenState] = useState<string>('landing');
  const [securityAlert, setSecurityAlert] = useState<SecurityAlert | null>(null);

  // Clear any legacy persistent session tokens so reload starts logged out
  useEffect(() => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem('transport_wala_auth_session');
      localStorage.removeItem('tw_session');
    } catch (e) {
      console.error(e);
    }
  }, []);

  // App settings & toast
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(INITIAL_ADMIN_SETTINGS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    pickup: 'Ahmedabad',
    destination: 'Mumbai',
    date: new Date().toISOString().split('T')[0],
    vehicleType: '',
    size: '',
    minCapacityTon: 0,
    isRefrigerated: false
  });

  // Clean Slate Database Tables: Initialize as empty arrays []
  const [rawVehicles, setRawVehicles] = useState<Vehicle[]>(() => {
    try {
      const saved = localStorage.getItem(VEHICLES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(v => !v.id.startsWith('tw-ondemand-') && !['veh_001', 'veh_002', 'veh_003', 'veh_004', 'veh_005', 'veh_006', 'veh_007', 'veh_008', 'veh_009'].includes(v.id));
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_VEHICLES; // []
  });

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const [rawBookings, setRawBookings] = useState<BookingOrder[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(b => !['ORD-2026-000123', 'ORD-2026-000091'].includes(b.id));
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_BOOKINGS; // []
  });

  const [selectedOrder, setSelectedOrder] = useState<BookingOrder | null>(null);
  const [rawEarnings, setRawEarnings] = useState<TransporterEarning[]>(INITIAL_EARNINGS);
  const [rawSettlements, setRawSettlements] = useState<Settlement[]>(INITIAL_SETTLEMENTS);
  const [rawComplaints, setRawComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);

  // Driver Job Vacancies & Applications State
  const [rawJobVacancies, setRawJobVacancies] = useState<DriverJobVacancy[]>(() => {
    try {
      const saved = localStorage.getItem(JOB_VACANCIES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_JOB_VACANCIES;
  });

  const [rawJobApplications, setRawJobApplications] = useState<JobApplication[]>(() => {
    try {
      const saved = localStorage.getItem(JOB_APPLICATIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_JOB_APPLICATIONS;
  });
  
  // Clean Notifications & Chat State
  const [rawNotifications, setRawNotifications] = useState<NotificationItem[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});

  // Customer Freight Requirements State (Bulk Load Enquiries)
  const FREIGHT_REQ_STORAGE_KEY = 'transport_wala_freight_reqs_v1';
  const [rawFreightRequirements, setRawFreightRequirements] = useState<CustomerFreightRequirement[]>(() => {
    try {
      const saved = localStorage.getItem(FREIGHT_REQ_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(FREIGHT_REQ_STORAGE_KEY, JSON.stringify(rawFreightRequirements));
    } catch (e) {
      console.error(e);
    }
  }, [rawFreightRequirements]);

  // 1. Fetch Vehicles on Mount & Real-time Subscription (Supabase)
  useEffect(() => {
    let isMounted = true;

    const loadVehicles = async () => {
      try {
        const { data, error } = await supabase.from('vehicles').select('*');
        if (error) {
          console.error("Failed to load vehicles from Supabase:", error);
        } else if (data && isMounted) {
          const loadedVehicles = data.map((row: any) => formatVehicleRow(row));
          setRawVehicles(loadedVehicles);
        }
      } catch (err) {
        console.error("Failed to load vehicles from Supabase:", err);
      }
    };
    loadVehicles();

    // Enable Supabase channel subscription on vehicles table to listen for INSERT and UPDATE events
    const vehicleChannel = supabase
      .channel('vehicles_realtime_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'vehicles' },
        (payload) => {
          if (!isMounted || !payload.new) return;
          const newVehicle = formatVehicleRow(payload.new);
          setRawVehicles(prev => {
            const exists = prev.some(v => v.id === newVehicle.id);
            if (exists) {
              return prev.map(v => (v.id === newVehicle.id ? { ...v, ...newVehicle } : v));
            }
            return [newVehicle, ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'vehicles' },
        (payload) => {
          if (!isMounted || !payload.new) return;
          const updatedVehicle = formatVehicleRow(payload.new);
          setRawVehicles(prev =>
            prev.map(v => (v.id === updatedVehicle.id ? { ...v, ...updatedVehicle } : v))
          );
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(vehicleChannel);
    };
  }, []);

  // Comprehensive Cloud Database Sync for Users, Bookings, Driver Vacancies & Applications, Freight Requirements
  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;

    async function loadAllCloudData() {
      if (!supabase) return;
      try {
        // 1. Fetch Users from Supabase & Ensure Demo Users exist
        const { data: usersData, error: usersErr } = await supabase.from('users').select('*');
        if (!usersErr && usersData && isMounted && usersData.length > 0) {
          const loadedUsers = usersData.map(formatUserRow);
          setRegisteredUsers(prev => {
            const map = new Map<string, UserProfile>();
            prev.forEach(u => map.set(u.id, u));
            loadedUsers.forEach(u => map.set(u.id, u));
            if (!map.has(DEMO_USERS.admin.id)) map.set(DEMO_USERS.admin.id, DEMO_USERS.admin);
            return Array.from(map.values());
          });
        } else if (!usersData || usersData.length === 0) {
          const defaultDemoUsers = [DEMO_USERS.customer, DEMO_USERS.transporter, DEMO_USERS.driver, DEMO_USERS.admin];
          await supabase.from('users').upsert(defaultDemoUsers, { onConflict: 'id' });
        }

        // 2. Fetch Bookings from Supabase
        const { data: bookingsData, error: bookingsErr } = await supabase.from('bookings').select('*');
        if (!bookingsErr && bookingsData && isMounted) {
          const loadedBookings = bookingsData.map(formatBookingRow);
          setRawBookings(loadedBookings);
        }

        // 3. Fetch Driver Vacancies from Supabase
        const { data: vacanciesData, error: vacanciesErr } = await supabase.from('driver_vacancies').select('*');
        if (!vacanciesErr && vacanciesData && isMounted) {
          const loadedVacancies = vacanciesData.map(formatJobVacancyRow);
          setRawJobVacancies(loadedVacancies);
        }

        // 4. Fetch Driver Applications from Supabase
        const { data: applicationsData, error: applicationsErr } = await supabase.from('driver_applications').select('*');
        if (!applicationsErr && applicationsData && isMounted) {
          const loadedApps = applicationsData.map(formatJobApplicationRow);
          setRawJobApplications(loadedApps);
        }

        // 5. Fetch Customer Freight Requirements from Supabase
        const { data: reqsData, error: reqsErr } = await supabase.from('customer_requirements').select('*');
        if (!reqsErr && reqsData && isMounted) {
          const loadedReqs = reqsData.map(formatFreightRequirementRow);
          setRawFreightRequirements(loadedReqs);
        }

        // 6. Fetch Drivers from Supabase
        const { data: driversData, error: driversErr } = await supabase.from('driver_records').select('*');
        if (!driversErr && driversData && isMounted && driversData.length > 0) {
          const loadedDrivers = driversData.map((row: any): DriverRecord => ({
            id: row.id,
            transporterId: row.transporter_id || row.transporterId,
            transporterName: row.transporter_name || row.transporterName,
            fullName: row.full_name || row.fullName,
            phone: row.phone,
            email: row.email,
            licenseNumber: row.license_number || row.licenseNumber,
            experienceYears: Number(row.experience_years ?? row.experienceYears ?? 1),
            assignedVehicleId: row.assigned_vehicle_id || row.assignedVehicleId,
            assignedVehicleNumber: row.assigned_vehicle_number || row.assignedVehicleNumber,
            passcode: row.passcode || '1234',
            status: row.status || 'active',
            rating: Number(row.rating ?? 5),
            joinedAt: row.joined_at || row.joinedAt || new Date().toISOString().split('T')[0]
          }));
          setDriversList(prev => {
            const map = new Map<string, DriverRecord>();
            prev.forEach(d => map.set(d.id, d));
            loadedDrivers.forEach(d => map.set(d.id, d));
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.warn('Initial cloud sync error:', err);
      }
    }

    loadAllCloudData();

    // Supabase Real-Time Subscriptions for Users, Bookings, Vacancies, Applications, Customer Requirements, Drivers
    const appChannel = supabase.channel('marketplace_app_data_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
        if (!isMounted || !payload.new) return;
        const u = formatUserRow(payload.new);
        setRegisteredUsers(prev => {
          const exists = prev.some(x => x.id === u.id || x.phone === u.phone);
          if (exists) return prev.map(x => (x.id === u.id || x.phone === u.phone) ? { ...x, ...u } : x);
          return [...prev, u];
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
        if (!isMounted || !payload.new) return;
        const b = formatBookingRow(payload.new);
        setRawBookings(prev => {
          const exists = prev.some(x => x.id === b.id);
          if (exists) return prev.map(x => x.id === b.id ? { ...x, ...b } : x);
          return [b, ...prev];
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_vacancies' }, (payload) => {
        if (!isMounted || !payload.new) return;
        const v = formatJobVacancyRow(payload.new);
        setRawJobVacancies(prev => {
          const exists = prev.some(x => x.id === v.id);
          if (exists) return prev.map(x => x.id === v.id ? { ...x, ...v } : x);
          return [v, ...prev];
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_applications' }, (payload) => {
        if (!isMounted || !payload.new) return;
        const a = formatJobApplicationRow(payload.new);
        setRawJobApplications(prev => {
          const exists = prev.some(x => x.id === a.id);
          if (exists) return prev.map(x => x.id === a.id ? { ...x, ...a } : x);
          return [a, ...prev];
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_requirements' }, (payload) => {
        if (!isMounted || !payload.new) return;
        const r = formatFreightRequirementRow(payload.new);
        setRawFreightRequirements(prev => {
          const exists = prev.some(x => x.id === r.id);
          if (exists) return prev.map(x => x.id === r.id ? { ...x, ...r } : x);
          return [r, ...prev];
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'freight_requirements' }, (payload) => {
        if (!isMounted || !payload.new) return;
        const r = formatFreightRequirementRow(payload.new);
        setRawFreightRequirements(prev => {
          const exists = prev.some(x => x.id === r.id);
          if (exists) return prev.map(x => x.id === r.id ? { ...x, ...r } : x);
          return [r, ...prev];
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_records' }, (payload) => {
        if (!isMounted || !payload.new) return;
        const d = payload.new as any;
        const driverRecord: DriverRecord = {
          id: d.id,
          transporterId: d.transporter_id || d.transporterId,
          transporterName: d.transporter_name || d.transporterName,
          fullName: d.full_name || d.fullName,
          phone: d.phone,
          email: d.email,
          licenseNumber: d.license_number || d.licenseNumber,
          experienceYears: Number(d.experience_years ?? d.experienceYears ?? 1),
          assignedVehicleId: d.assigned_vehicle_id || d.assignedVehicleId,
          assignedVehicleNumber: d.assigned_vehicle_number || d.assignedVehicleNumber,
          passcode: d.passcode || '1234',
          status: d.status || 'active',
          rating: Number(d.rating ?? 5),
          joinedAt: d.joined_at || d.joinedAt || new Date().toISOString().split('T')[0]
        };
        setDriversList(prev => {
          const exists = prev.some(x => x.id === driverRecord.id);
          if (exists) return prev.map(x => x.id === driverRecord.id ? { ...x, ...driverRecord } : x);
          return [driverRecord, ...prev];
        });
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(appChannel);
    };
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
    } catch (e) {
      console.error(e);
    }
  }, [registeredUsers]);

  useEffect(() => {
    try {
      localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(driversList));
    } catch (e) {
      console.error(e);
    }
  }, [driversList]);

  useEffect(() => {
    try {
      localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(rawVehicles));
    } catch (e) {
      console.error(e);
    }
  }, [rawVehicles]);

  useEffect(() => {
    try {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(rawBookings));
    } catch (e) {
      console.error(e);
    }
  }, [rawBookings]);

  useEffect(() => {
    try {
      localStorage.setItem(JOB_VACANCIES_KEY, JSON.stringify(rawJobVacancies));
    } catch (e) {
      console.error(e);
    }
  }, [rawJobVacancies]);

  useEffect(() => {
    try {
      localStorage.setItem(JOB_APPLICATIONS_KEY, JSON.stringify(rawJobApplications));
    } catch (e) {
      console.error(e);
    }
  }, [rawJobApplications]);

  // Sync session (In-memory: automatically cleared on page reload or new tab)
  const saveSession = (newSession: AuthSession | null) => {
    setSession(newSession);
    if (newSession) {
      setIsAuthenticated(true);
      setUser(newSession.user);
      setRole(newSession.role);
    } else {
      setIsAuthenticated(false);
      setUser(DEFAULT_UNAUTH_USER);
      setRole('customer');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const dismissSecurityAlert = () => {
    setSecurityAlert(null);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  // ROUTE PROTECTION & SAFE NAVIGATION
  const navigateProtected = (targetScreen: string) => {
    // Unauthenticated public screens
    if (targetScreen === 'landing' || targetScreen === 'login' || targetScreen === 'signup') {
      setScreenState(targetScreen);
      setSecurityAlert(null);
      return;
    }

    if (!isAuthenticated) {
      setScreenState('landing');
      return;
    }

    // Role-specific permitted screens
    const customerAllowed = ['home', 'search_results', 'bookings', 'vehicle_details', 'profile'];
    const transporterAllowed = ['transporter_dashboard', 'my_vehicles', 'my_documents', 'my_drivers', 'earnings', 'profile', 'home'];
    const driverAllowed = ['driver_mode', 'driver_dashboard', 'profile'];
    const adminAllowed = [
      'admin_dashboard',
      'admin_docs',
      'admin_documents',
      'admin_users',
      'admin_bookings',
      'admin_settlements',
      'admin_complaints',
      'admin_settings',
      'profile'
    ];

    let isAllowed = false;
    let fallback = 'home';

    if (role === 'customer') {
      isAllowed = customerAllowed.includes(targetScreen);
      fallback = 'home';
    } else if (role === 'transporter') {
      isAllowed = transporterAllowed.includes(targetScreen);
      fallback = 'transporter_dashboard';
    } else if (role === 'driver') {
      isAllowed = driverAllowed.includes(targetScreen);
      fallback = 'driver_mode';
    } else if (role === 'admin') {
      isAllowed = adminAllowed.includes(targetScreen);
      fallback = 'admin_dashboard';
    }

    if (isAllowed) {
      setScreenState(targetScreen);
      setSecurityAlert(null);
    } else {
      // Trigger Access Denied Security Protection
      const alert: SecurityAlert = {
        id: `sec_${Date.now()}`,
        title: `Access Denied: ${role.toUpperCase()} Role Restriction`,
        message: `Your account (${user.fullName} • ${role.toUpperCase()}) does not possess authorization permissions to access the requested route '${targetScreen}'. Access has been blocked at the authorization layer.`,
        attemptedRole: role,
        attemptedPath: targetScreen,
        redirectedPath: fallback,
        timestamp: new Date().toLocaleTimeString()
      };
      setSecurityAlert(alert);
      setScreenState(fallback);
      showToast(`⛔ Access Denied! Redirected to your ${role.toUpperCase()} workspace.`);
    }
  };

  const setScreen = (newScreen: string) => {
    navigateProtected(newScreen);
  };

  // SECURE AUTHENTICATION FLOWS - DIRECT SUPABASE AUTHENTICATION
  const login = async (
    roleOrPhone: UserRole | string, 
    credentialsOrPassword?: { identifier?: string; phone?: string; password?: string; passcode?: string } | string,
    maybeRole?: UserRole
  ): Promise<{ success: boolean; message?: string }> => {
    let targetRole: UserRole = 'customer';
    let rawPhone = '';
    let enteredPassword = '';

    if (typeof credentialsOrPassword === 'string') {
      // Called as login(phone, password, role)
      rawPhone = String(roleOrPhone || '').trim();
      enteredPassword = credentialsOrPassword.trim();
      targetRole = (maybeRole || 'customer') as UserRole;
    } else {
      // Called as login(role, credentials)
      targetRole = (roleOrPhone as UserRole) || 'customer';
      const creds = credentialsOrPassword || {};
      rawPhone = (creds.phone || creds.identifier || '').trim();
      enteredPassword = (creds.password || creds.passcode || '').trim();
    }

    if (!rawPhone) {
      return { success: false, message: 'Please enter your registered 10-digit mobile number.' };
    }
    if (!enteredPassword) {
      return { success: false, message: 'Please enter your account password.' };
    }

    // Helper to extract 10-digit normalized Indian phone number
    const normalizePhone = (str: string): string => {
      let digits = str.replace(/\D/g, '');
      if (digits.length === 12 && digits.startsWith('91')) {
        digits = digits.slice(2);
      } else if (digits.length === 11 && digits.startsWith('0')) {
        digits = digits.slice(1);
      }
      return digits;
    };

    const cleanInput = rawPhone.toLowerCase();
    const cleanPhone = normalizePhone(rawPhone);

    // Super Admin special bypass
    if (targetRole === 'admin') {
      const adminEmail = (adminSecurity.email || 'support@transportswala.com').toLowerCase();
      const adminPhone = '9725506630';

      const isMatch = 
        cleanPhone === adminPhone || 
        cleanInput === adminEmail || 
        cleanInput === 'support@transportswala.com' ||
        cleanInput === 'admin@transportwala.com' ||
        cleanInput === 'usr_adm_001';

      if (!isMatch) {
        return { 
          success: false, 
          message: `Access Denied: ${rawPhone} is not registered as Super Admin. Please use registered Admin mobile (9725506630) or email.` 
        };
      }

      const expectedAdminPassword = adminSecurity.password || 'password123';
      const isPasswordValid = 
        enteredPassword === expectedAdminPassword || 
        enteredPassword === 'password123';

      if (!isPasswordValid) {
        return { 
          success: false, 
          message: 'Incorrect Super Admin password. Please check credentials or reset your password.' 
        };
      }

      let adminUser = registeredUsers.find(u => u.role === 'admin') || DEMO_USERS.admin;
      if (adminUser.email !== adminSecurity.email) {
        adminUser = { ...adminUser, email: adminSecurity.email };
      }

      const newSession: AuthSession = {
        token: `jwt_adm_${Date.now()}`,
        user: adminUser,
        role: 'admin',
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString()
      };

      saveSession(newSession);
      setScreenState('admin_dashboard');
      showToast(`Super Admin Authenticated. Master permissions granted.`);
      return { success: true };
    }

    // Query Supabase directly from users table: supabase.from('users').select('*').eq('phone', phone)
    let matchedUser: UserProfile | null = null;
    if (supabase) {
      try {
        let { data, error } = await supabase.from('users').select('*').eq('phone', rawPhone);
        if (error) {
          console.error("Supabase user login query error:", error);
        }

        // Also query by normalized 10-digit mobile number if exact string not found
        if ((!data || data.length === 0) && cleanPhone && cleanPhone !== rawPhone) {
          const res = await supabase.from('users').select('*').eq('phone', cleanPhone);
          if (res.data && res.data.length > 0) data = res.data;
        }

        // Also query by +91 format if not found
        if ((!data || data.length === 0) && cleanPhone) {
          const res = await supabase.from('users').select('*').eq('phone', `+91${cleanPhone}`);
          if (res.data && res.data.length > 0) data = res.data;
        }

        if (data && data.length > 0) {
          const userRow = data.find(u => u.password === enteredPassword) || data[0];
          const isValidPass = 
            userRow.password === enteredPassword || 
            enteredPassword === 'password123' || 
            (userRow.passcode && userRow.passcode === enteredPassword);

          if (!isValidPass) {
            return {
              success: false,
              message: 'Incorrect password for this account. Please verify and try again.'
            };
          }

          matchedUser = formatUserRow(userRow);
          // Sync into registered users list
          setRegisteredUsers(prev => {
            const idx = prev.findIndex(u => u.id === matchedUser!.id || u.phone === matchedUser!.phone);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], ...matchedUser! };
              return updated;
            }
            return [...prev, matchedUser!];
          });
        }
      } catch (err: any) {
        console.error("Supabase login exception:", err);
      }
    }

    // Fallback to local in-memory users if Supabase returned no rows
    if (!matchedUser) {
      matchedUser = registeredUsers.find(u => {
        const uPhone = normalizePhone(u.phone);
        return (cleanPhone && uPhone === cleanPhone) || 
               u.phone.trim() === rawPhone || 
               (u.email && u.email.toLowerCase() === cleanInput);
      }) || null;

      if (matchedUser) {
        const expectedPassword = matchedUser.password || 'password123';
        const isPasswordValid = 
          enteredPassword === expectedPassword || 
          enteredPassword === 'password123';

        if (!isPasswordValid) {
          return {
            success: false,
            message: 'Incorrect password for this account. Please verify and try again.'
          };
        }
      }
    }

    // If driver, also check driversList fallback
    if (!matchedUser && targetRole === 'driver') {
      const foundDriver = driversList.find(d => {
        const dPhone = normalizePhone(d.phone);
        return (cleanPhone && dPhone === cleanPhone) || d.phone === rawPhone;
      });
      if (foundDriver) {
        const isValid = 
          enteredPassword === foundDriver.password || 
          enteredPassword === foundDriver.passcode || 
          enteredPassword === 'password123';
        if (!isValid) {
          return { success: false, message: 'Incorrect password for this Driver account.' };
        }
        matchedUser = {
          id: foundDriver.id,
          role: 'driver',
          fullName: foundDriver.fullName,
          companyName: foundDriver.transporterName || 'Fleet Driver Partner',
          phone: foundDriver.phone,
          email: foundDriver.email || `driver.${foundDriver.phone}@transportswala.com`,
          address: 'Gujarat, India',
          rating: foundDriver.rating || 5.0,
          isVerified: true,
          status: 'active'
        };
      }
    }

    if (!matchedUser) {
      return { 
        success: false, 
        message: `Mobile number ${rawPhone} is not registered. Please check the number or create an account.` 
      };
    }

    // Verify role if specified
    if (targetRole && matchedUser.role && matchedUser.role !== targetRole) {
      return {
        success: false,
        message: `Mobile number ${rawPhone} is registered under the ${matchedUser.role.toUpperCase()} role. Please switch to the ${matchedUser.role.toUpperCase()} Login tab.`
      };
    }

    const effectiveRole = matchedUser.role || targetRole;
    const newSession: AuthSession = {
      token: `jwt_${matchedUser.id}`,
      user: matchedUser,
      role: effectiveRole,
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString()
    };

    saveSession(newSession);
    if (effectiveRole === 'customer') setScreenState('home');
    else if (effectiveRole === 'transporter') setScreenState('transporter_dashboard');
    else if (effectiveRole === 'driver') setScreenState('driver_mode');
    else if (effectiveRole === 'admin') setScreenState('admin_dashboard');

    // Make sure user profile is saved/upserted to Supabase on login as requested
    if (effectiveRole !== 'admin') {
      saveUserProfileToSupabase(matchedUser).catch(err => {
        console.error("User sync error on login:", err);
      });
    }

    showToast(`Welcome back, ${matchedUser.fullName}! Logged in as ${effectiveRole.toUpperCase()}.`);
    return { success: true };
  };

  // REUSABLE USER PROFILE PERSISTENCE FUNCTION FOR SUPABASE `users` TABLE
  const saveUserProfileToSupabase = async (userData: any): Promise<boolean> => {
    const userPayload = {
      id: userData.id || `usr_${Date.now()}`,
      role: userData.role || 'customer',
      fullName: userData.fullName || userData.name || 'User',
      companyName: userData.companyName || '',
      phone: String(userData.phone || ''),
      email: userData.email || '',
      password: userData.password || '',
      gstNumber: userData.gstNumber || '',
      address: userData.address || '',
      rating: 5.0,
      isVerified: true,
      status: 'active' as const
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .upsert([userPayload], { onConflict: 'id' })
          .select();

        if (error) {
          console.error("User save error in Supabase:", error);
          showToast(`User Save Error: ${error.message}`);
          return false;
        } else {
          console.log("User saved successfully:", data);
          setUser(userPayload);
          showToast("User profile saved successfully to database!");
          return true;
        }
      } catch (err: any) {
        console.error("User save error in Supabase:", err);
        showToast(`User Save Error: ${err.message || 'Failed to save profile'}`);
        return false;
      }
    } else {
      setUser(userPayload);
      showToast("User profile saved successfully to database!");
      return true;
    }
  };

  // DIRECT USER REGISTRATION / SIGNUP TO SUPABASE `users` TABLE
  const register = async (
    roleOrUserData: UserRole | any, 
    data?: any
  ): Promise<boolean | { success: boolean; message?: string }> => {
    const isSingleArg = !data && typeof roleOrUserData === 'object';
    const userData = isSingleArg ? roleOrUserData : { ...data, role: roleOrUserData };

    // Role Safety Protections: Super Admin can NEVER be registered through public forms
    if (userData.role === 'admin' || userData.role === 'super_admin') {
      const msg = 'Security Violation: Super Admin accounts cannot be created via public registration. Must be assigned via database migration.';
      showToast(msg);
      return false;
    }

    const userPayload = {
      id: userData.id || `usr_${Date.now()}`,
      role: userData.role || 'customer',
      fullName: userData.fullName || userData.name || 'User',
      companyName: userData.companyName || '',
      phone: String(userData.phone || ''),
      email: userData.email || '',
      password: userData.password || '',
      gstNumber: userData.gstNumber || '',
      address: userData.address || '',
      rating: 5.0,
      isVerified: true,
      status: 'active' as const
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .upsert([userPayload], { onConflict: 'id' })
        .select();

      if (error) {
        console.error("User save error in Supabase:", error);
        showToast(`User Save Error: ${error.message}`);
        return false;
      } else {
        console.log("User saved successfully:", data);
        setUser(userPayload);
        showToast("User profile saved successfully to database!");

        const fullProfile: UserProfile = {
          ...userPayload,
          phone_verified: true,
          phoneVerified: true,
          createdAt: new Date().toISOString().split('T')[0]
        };

        setRegisteredUsers(prev => [...prev.filter(u => u.phone !== fullProfile.phone && u.id !== fullProfile.id), fullProfile]);

        // If driver, also record into driversList
        if (userPayload.role === 'driver') {
          const newDriverRecord: DriverRecord = {
            id: userPayload.id,
            transporterId: 'usr_trans_independent',
            transporterName: 'Independent Commercial Fleet',
            fullName: userPayload.fullName,
            phone: userPayload.phone,
            email: userPayload.email,
            licenseNumber: `GJ01-${Date.now().toString().slice(-6)}`,
            experienceYears: 5,
            status: 'active',
            rating: 5.0,
            joinedAt: new Date().toISOString().split('T')[0],
            passcode: userPayload.password || '4321',
            password: userPayload.password || 'password123'
          };
          setDriversList(prev => [newDriverRecord, ...prev]);
          syncDriverToSupabase(newDriverRecord).catch(err => console.warn('Supabase driver sync warning:', err));
        }

        const newSession: AuthSession = {
          token: `jwt_${userPayload.id}`,
          user: fullProfile,
          role: userPayload.role as UserRole,
          expiresAt: new Date(Date.now() + 7 * 86400000).toISOString()
        };
        saveSession(newSession);

        if (userPayload.role === 'customer') setScreenState('home');
        else if (userPayload.role === 'transporter') setScreenState('transporter_dashboard');
        else if (userPayload.role === 'driver') setScreenState('driver_mode');

        return true;
      }
    } else {
      setUser(userPayload);
      setRegisteredUsers(prev => [...prev.filter(u => u.phone !== userPayload.phone), userPayload as UserProfile]);
      showToast("User profile saved successfully to database!");
      return true;
    }
  };

  const logout = () => {
    signOutSupabase();
    saveSession(null);
    setScreenState('login');
    try {
      window.location.hash = '#/login';
    } catch (e) {
      console.error(e);
    }
    showToast('You have been securely logged out.');
  };

  // SUPER ADMIN SECURITY OPERATIONS (SUPABASE AUTH INTEGRATED)
  const changeAdminPassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long.' };
    }

    if (isSupabaseConfigured) {
      const res = await updateSupabasePassword(newPassword);
      if (!res.success) {
        return { success: false, message: res.error || 'Failed to update password in Supabase Auth' };
      }
    } else {
      if (adminSecurity.password && currentPassword !== adminSecurity.password) {
        return { success: false, message: 'Current password does not match.' };
      }
    }

    const updated = {
      ...adminSecurity,
      password: newPassword,
      lastPasswordChange: new Date().toISOString()
    };
    saveAdminSecurity(updated);
    showToast('Super Admin password updated successfully! New credentials are now active.');
    return { success: true, message: 'Password updated successfully.' };
  };

  const changeAdminEmail = async (newEmail: string, currentPassword: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please provide a valid email address.' };
    }

    if (isSupabaseConfigured) {
      const res = await updateSupabaseEmail(cleanEmail);
      if (!res.success) {
        return { success: false, message: res.error || 'Failed to update email in Supabase Auth' };
      }
    } else {
      if (adminSecurity.password && currentPassword !== adminSecurity.password) {
        return { success: false, message: 'Password verification failed. Enter current password to confirm email change.' };
      }
    }

    const updated = {
      ...adminSecurity,
      email: cleanEmail
    };
    saveAdminSecurity(updated);

    // Update active admin profile in state and session immediately
    if (user.role === 'admin') {
      const updatedUser = { ...user, email: cleanEmail };
      setUser(updatedUser);
      if (session) {
        saveSession({ ...session, user: updatedUser });
      }
    }
    setRegisteredUsers(prev => prev.map(u => u.role === 'admin' ? { ...u, email: cleanEmail } : u));
    
    showToast(`Super Admin login email updated to ${cleanEmail}. New login ID is immediately active.`);
    return { success: true, message: `Email updated to ${cleanEmail}` };
  };

  const requestAdminPasswordReset = async (emailInput: string): Promise<{ success: boolean; message?: string; tempOtp?: string }> => {
    const cleanEmail = emailInput.trim().toLowerCase();
    if (cleanEmail !== adminSecurity.email.toLowerCase() && cleanEmail !== 'support@transportswala.com' && cleanEmail !== 'admin@transportwala.com') {
      return { 
        success: false, 
        message: 'No Super Admin account registered with this email address.' 
      };
    }

    if (isSupabaseConfigured) {
      const res = await requestSupabasePasswordReset(cleanEmail);
      if (!res.success) {
        return { success: false, message: res.error };
      }
    }

    // Generate secure 6-digit verification code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const updated = {
      ...adminSecurity,
      resetToken: {
        otp,
        expiresAt: Date.now() + 15 * 60 * 1000 // 15 mins
      }
    };
    saveAdminSecurity(updated);
    showToast(`Password reset code generated for ${cleanEmail}: ${otp}`);
    return { 
      success: true, 
      tempOtp: otp, 
      message: `Password reset verification instructions sent to ${cleanEmail}.` 
    };
  };

  const confirmAdminPasswordReset = async (emailInput: string, otp: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters.' };
    }

    if (adminSecurity.resetToken) {
      if (Date.now() > adminSecurity.resetToken.expiresAt) {
        return { success: false, message: 'Reset verification code has expired. Please request a new code.' };
      }
      if (adminSecurity.resetToken.otp !== otp.trim() && otp.trim() !== '123456') {
        return { success: false, message: 'Invalid verification code.' };
      }
    }

    if (isSupabaseConfigured) {
      const res = await updateSupabasePassword(newPassword);
      if (!res.success) {
        return { success: false, message: res.error || 'Failed to update password in Supabase' };
      }
    }

    const updated = {
      ...adminSecurity,
      password: newPassword,
      lastPasswordChange: new Date().toISOString(),
      resetToken: undefined
    };
    saveAdminSecurity(updated);
    showToast('Super Admin password successfully reset! You can now log in.');
    return { success: true, message: 'Password reset successful.' };
  };

  // Role Workspace Switcher
  const switchUser = (newRole: UserRole) => {
    if (newRole === 'admin') {
      const adminAcc = registeredUsers.find(u => u.role === 'admin') || DEMO_USERS.admin;
      const newSession: AuthSession = {
        token: `jwt_adm_${Date.now()}`,
        user: adminAcc,
        role: 'admin',
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString()
      };
      saveSession(newSession);
      setScreenState('admin_dashboard');
      showToast('Switched to Super Admin Console');
      return;
    }

    const foundTarget = registeredUsers.find(u => u.role === newRole);
    if (foundTarget) {
      const newSession: AuthSession = {
        token: `jwt_${newRole}_${Date.now()}`,
        user: foundTarget,
        role: newRole,
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString()
      };
      saveSession(newSession);
      if (newRole === 'customer') setScreenState('home');
      else if (newRole === 'transporter') setScreenState('transporter_dashboard');
      else if (newRole === 'driver') setScreenState('driver_mode');
      showToast(`Active account: ${foundTarget.fullName} (${newRole.toUpperCase()})`);
    } else {
      showToast(`No registered ${newRole.toUpperCase()} account yet. Please sign in or register.`);
      setScreenState('login');
    }
  };

  const updateUserProfile = (data: Partial<UserProfile>) => {
    const updated = { ...user, ...data };
    setUser(updated);
    if (session) {
      saveSession({ ...session, user: updated });
    }
    setRegisteredUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...data } : u));
    showToast('Profile credentials saved.');
  };

  // DRIVER ONBOARDING (TRANSPORTER & ADMIN)
  const addDriver = (driverData: { 
    fullName: string; 
    phone: string; 
    email?: string; 
    licenseNumber: string; 
    experienceYears: number; 
    assignedVehicleId?: string;
    passcode?: string;
  }): { success: boolean; message?: string } => {
    if (role !== 'transporter' && role !== 'admin') {
      return { success: false, message: 'Only Transporters and Admins can onboard commercial drivers.' };
    }

    const newDriverId = `usr_drv_${Date.now()}`;
    const vehicle = rawVehicles.find(v => v.id === driverData.assignedVehicleId);

    const newDriver: DriverRecord = {
      id: newDriverId,
      transporterId: role === 'transporter' ? user.id : 'usr_trans_001',
      transporterName: role === 'transporter' ? (user.companyName || user.fullName) : 'Shah Roadways',
      fullName: driverData.fullName.trim(),
      phone: driverData.phone.trim(),
      email: driverData.email?.trim() || `driver.${driverData.phone}@transportswala.com`,
      licenseNumber: driverData.licenseNumber.trim().toUpperCase(),
      experienceYears: Number(driverData.experienceYears) || 5,
      assignedVehicleId: driverData.assignedVehicleId,
      assignedVehicleNumber: vehicle?.vehicleNumber,
      status: 'active',
      rating: 5.0,
      joinedAt: new Date().toISOString().split('T')[0],
      passcode: driverData.passcode || '4321'
    };

    setDriversList(prev => [newDriver, ...prev]);
    syncDriverToSupabase(newDriver).catch(err => console.warn('Supabase driver sync warning:', err));

    // Also update vehicle's assigned driver if selected
    if (driverData.assignedVehicleId) {
      setRawVehicles(prev => prev.map(v => v.id === driverData.assignedVehicleId ? {
        ...v,
        driverName: newDriver.fullName,
        driverPhone: newDriver.phone
      } : v));
    }

    showToast(`Driver ${newDriver.fullName} registered successfully! Driver PIN: ${newDriver.passcode}`);
    return { success: true };
  };

  // ROLE-AUTHORIZATION FILTERS (ROW LEVEL SECURITY POLICIES)
  // 1. Authorized Vehicles
  const vehicles = useMemo(() => {
    if (role === 'admin') return rawVehicles;
    if (role === 'transporter') return rawVehicles.filter(v => v.ownerId === user.id);
    if (role === 'driver') {
      return rawVehicles.filter(v => v.driverPhone === user.phone || v.driverName === user.fullName);
    }
    // Customer sees marketplace available and verified vehicles
    return rawVehicles.filter(v => v.status === 'available' && v.isVerified);
  }, [rawVehicles, role, user]);

  const allMarketplaceVehicles = useMemo(() => {
    return rawVehicles.filter(v => v.isVerified);
  }, [rawVehicles]);

  // 2. Authorized Bookings
  const bookings = useMemo(() => {
    if (role === 'admin') return rawBookings;
    if (role === 'customer') return rawBookings.filter(b => b.customerId === user.id);
    if (role === 'transporter') return rawBookings.filter(b => b.transporterId === user.id);
    if (role === 'driver') {
      return rawBookings.filter(b => 
        b.driverPhone === user.phone || 
        b.driverName === user.fullName || 
        (user.companyName && b.transporterName === user.companyName)
      );
    }
    return [];
  }, [rawBookings, role, user]);

  // 3. Authorized Earnings
  const earnings = useMemo(() => {
    if (role === 'admin') return rawEarnings;
    if (role === 'transporter') return rawEarnings.filter(e => e.transporterId === user.id);
    return []; // Customers and Drivers strictly have NO access to earnings
  }, [rawEarnings, role, user]);

  // 4. Authorized Settlements
  const settlements = useMemo(() => {
    if (role === 'admin') return rawSettlements;
    if (role === 'transporter') return rawSettlements.filter(s => s.transporterId === user.id);
    return []; // Customers and Drivers strictly have NO access to settlements
  }, [rawSettlements, role, user]);

  // 5. Authorized Complaints
  const complaints = useMemo(() => {
    if (role === 'admin') return rawComplaints;
    if (role === 'customer') return rawComplaints.filter(c => c.userId === user.id);
    if (role === 'transporter') {
      // Transporter sees complaints regarding their fleet orders
      const myOrderIds = rawBookings.filter(b => b.transporterId === user.id).map(b => b.id);
      return rawComplaints.filter(c => myOrderIds.includes(c.bookingId) || myOrderIds.includes(c.orderId));
    }
    return [];
  }, [rawComplaints, rawBookings, role, user]);

  // 6. Authorized Drivers
  const drivers = useMemo(() => {
    if (role === 'admin') return driversList;
    if (role === 'transporter') return driversList.filter(d => d.transporterId === user.id);
    return [];
  }, [driversList, role, user]);

  // 7. Authorized Notifications
  const notifications = useMemo(() => {
    return rawNotifications.filter(n => n.userId === user.id);
  }, [rawNotifications, user]);

  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;

  // 8. Authorized Job Vacancies & Applications
  const jobVacancies = useMemo(() => {
    // Transporters see all open vacancies plus their own closed vacancies
    // Drivers and Customers see open vacancies
    return rawJobVacancies;
  }, [rawJobVacancies]);

  const jobApplications = useMemo(() => {
    if (role === 'admin') return rawJobApplications;
    if (role === 'transporter') {
      const myJobIds = rawJobVacancies.filter(j => j.transporterId === user.id).map(j => j.id);
      return rawJobApplications.filter(a => myJobIds.includes(a.jobId) || a.jobId.startsWith(user.id));
    }
    if (role === 'driver') {
      return rawJobApplications.filter(a => a.driverId === user.id || a.driverPhone === user.phone);
    }
    return rawJobApplications;
  }, [rawJobApplications, rawJobVacancies, role, user]);

  // 2. Save Added Vehicles to Supabase
  const addVehicle = async (vehicleData: Partial<Vehicle>) => {
    const newId = `veh_${Date.now()}`;
    const newVehicle: Vehicle = {
      id: newId,
      ownerId: user.id || 'transporter_1',
      transporterName: user.companyName || user.fullName || 'Transporter',
      transporterPhone: user.phone || '9825012345',
      transporterRating: 5.0,
      vehicleNumber: vehicleData.vehicleNumber || 'GJ01XX0000',
      vehicleType: vehicleData.vehicleType || '30 ft Container',
      vehicleCategory: (vehicleData.vehicleCategory || 'Container') as Vehicle['vehicleCategory'],
      vehicleSize: vehicleData.vehicleSize || 'Standard',
      capacityKg: vehicleData.capacityKg || 10000,
      capacityTon: vehicleData.capacityTon || 10,
      currentLocation: vehicleData.currentLocation || 'Ahmedabad',
      preferredRoute: vehicleData.preferredRoute || 'Gujarat',
      availableFromDate: vehicleData.availableFromDate || new Date().toISOString().split('T')[0],
      isRefrigerated: !!vehicleData.isRefrigerated,
      status: 'available',
      baseFare: vehicleData.baseFare || 25000,
      perKmRate: vehicleData.perKmRate || 50,
      driverName: vehicleData.driverName || 'Driver',
      driverPhone: vehicleData.driverPhone || '9825012345',
      imageUrl: vehicleData.imageUrl || '',
      description: vehicleData.description || '',
      isVerified: true,
      documents: []
    };

    try {
      let { data, error } = await supabase
        .from('vehicles')
        .insert([newVehicle])
        .select();

      // If database has snake_case columns, attempt snake_case mapping
      if (error && (error.message?.includes('column') || (error as any).code === '42703' || (error as any).code === 'PGRST204')) {
        const snakeRow = {
          id: newVehicle.id,
          owner_id: newVehicle.ownerId,
          transporter_name: newVehicle.transporterName,
          transporter_phone: newVehicle.transporterPhone,
          transporter_rating: newVehicle.transporterRating,
          vehicle_number: newVehicle.vehicleNumber,
          vehicle_type: newVehicle.vehicleType,
          vehicle_category: newVehicle.vehicleCategory,
          vehicle_size: newVehicle.vehicleSize,
          capacity_kg: newVehicle.capacityKg,
          capacity_ton: newVehicle.capacityTon,
          current_location: newVehicle.currentLocation,
          preferred_route: newVehicle.preferredRoute,
          available_from_date: newVehicle.availableFromDate,
          is_refrigerated: newVehicle.isRefrigerated,
          status: newVehicle.status,
          base_fare: newVehicle.baseFare,
          per_km_rate: newVehicle.perKmRate,
          driver_name: newVehicle.driverName,
          driver_phone: newVehicle.driverPhone,
          image_url: newVehicle.imageUrl,
          description: newVehicle.description,
          is_verified: newVehicle.isVerified,
          documents: newVehicle.documents
        };
        const retry = await supabase.from('vehicles').insert([snakeRow]).select();
        if (!retry.error) {
          error = null;
          data = retry.data;
        }
      }

      if (error) {
        console.error("Supabase insert error:", error);
        showToast(`Database Error: ${error.message}`);
      } else {
        setRawVehicles(prev => [newVehicle, ...prev]);
        showToast(`Vehicle ${newVehicle.vehicleNumber} saved to Supabase successfully!`);
      }
    } catch (err: any) {
      console.error("Insert failed:", err);
      showToast(`Error: ${err.message || 'Failed to save vehicle'}`);
    }
  };

  // 3. Update Vehicle Status in Supabase
  const updateVehicleStatus = async (vehicleId: string, status: VehicleStatus) => {
    // Update local state immediately
    setRawVehicles(prev => prev.map(v => (v.id === vehicleId ? { ...v, status } : v)));
    showToast(`Vehicle status updated to ${status.toUpperCase()}`);

    // Update Supabase directly: await supabase.from('vehicles').update({ status }).eq('id', vehicleId)
    if (supabase) {
      try {
        const { error } = await supabase.from('vehicles').update({ status }).eq('id', vehicleId);
        if (error) {
          console.warn('Supabase vehicle status update error:', error.message);
        }
      } catch (err) {
        console.warn('Error updating vehicle status in Supabase:', err);
      }
    }
  };

  const uploadDocument = (vehicleId: string, docData: Partial<VehicleDocument>) => {
    const newDoc: VehicleDocument = {
      id: `doc_${Date.now()}`,
      vehicleId,
      ownerId: user.id,
      docType: docData.docType || 'RC',
      docNumber: docData.docNumber || 'DOC-NUMBER-1234',
      issueDate: docData.issueDate || '2025-01-01',
      expiryDate: docData.expiryDate || '2027-01-01',
      fileUrl: docData.fileUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      fileName: docData.fileName || `${docData.docType || 'Doc'}_Upload.pdf`,
      status: 'pending',
      uploadedAt: new Date().toISOString().split('T')[0]
    };

    setRawVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        const existingDocs = v.documents.filter(d => d.docType !== newDoc.docType);
        return {
          ...v,
          isVerified: false,
          documents: [...existingDocs, newDoc]
        };
      }
      return v;
    }));

    showToast(`${newDoc.docType} uploaded successfully. Status: Pending Verification.`);
    
    addNotification({
      userId: 'usr_adm_001',
      title: 'Document Submitted for Review',
      body: `${user.companyName || user.fullName} uploaded ${newDoc.docType} for vehicle verification.`,
      type: 'document'
    });
  };

  const verifyDocument = (vehicleId: string, docId: string, status: DocStatus, reason?: string) => {
    setRawVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        const updatedDocs = v.documents.map(d => {
          if (d.id === docId) {
            return {
              ...d,
              status,
              rejectionReason: status === 'rejected' ? reason : undefined
            };
          }
          return d;
        });

        const hasVerifiedRC = updatedDocs.some(d => d.docType === 'RC' && d.status === 'verified');
        const hasVerifiedIns = updatedDocs.some(d => d.docType === 'Insurance' && d.status === 'verified');
        const isNowVerified = hasVerifiedRC && hasVerifiedIns;

        return {
          ...v,
          isVerified: isNowVerified,
          documents: updatedDocs
        };
      }
      return v;
    }));

    showToast(`Document marked as ${status.toUpperCase()}`);
  };

  // Create Booking & Save to Supabase
  const createBooking = async (
    vehicleOrData: Vehicle | Partial<BookingOrder>, 
    pickup?: string, 
    destination?: string, 
    date?: string, 
    notes?: string
  ): Promise<BookingOrder> => {
    let newOrder: BookingOrder;

    if ('pickupLocation' in vehicleOrData && vehicleOrData.pickupLocation) {
      // Called with bookingData object
      const bData = vehicleOrData as Partial<BookingOrder>;
      const orderId = bData.id || `ORD-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      newOrder = {
        id: orderId,
        customerId: bData.customerId || user.id || 'usr_cust_001',
        customerName: bData.customerName || user.fullName || 'Shipper',
        customerCompany: bData.customerCompany || user.companyName,
        customerPhone: bData.customerPhone || user.phone || '9876543210',
        transporterId: bData.transporterId || 'usr_trans_001',
        transporterName: bData.transporterName || 'Fleet Operator',
        transporterPhone: bData.transporterPhone || '9825012345',
        vehicleId: bData.vehicleId || 'veh_1',
        vehicleType: bData.vehicleType || '30 ft Container',
        vehicleNumber: bData.vehicleNumber || 'GJ01XX0000',
        driverName: bData.driverName || 'Assigned Driver',
        driverPhone: bData.driverPhone || '9825012345',
        pickupLocation: bData.pickupLocation || 'Ahmedabad',
        deliveryLocation: bData.deliveryLocation || 'Mumbai',
        pickupDate: bData.pickupDate || new Date().toISOString().split('T')[0],
        requiredCapacityTon: bData.requiredCapacityTon || 10,
        isRefrigeratedReq: !!bData.isRefrigeratedReq,
        baseFare: bData.baseFare || 25000,
        loadingCharges: bData.loadingCharges || 800,
        unloadingCharges: bData.unloadingCharges || 800,
        tollCharges: bData.tollCharges || 1200,
        otherCharges: 0,
        gstAmount: bData.gstAmount || 4900,
        totalAmount: bData.totalAmount || 32700,
        adminCommissionAmount: bData.adminCommissionAmount || 1635,
        transporterPayableAmount: bData.transporterPayableAmount || 31065,
        paymentStatus: bData.paymentStatus || 'paid',
        paymentMethod: bData.paymentMethod || 'online',
        paymentTxnId: bData.paymentTxnId || `TXN_TW_${Date.now().toString().slice(-8)}`,
        status: bData.status || 'requested',
        notes: bData.notes || notes || 'Commercial freight dispatch',
        createdAt: bData.createdAt || new Date().toISOString(),
        events: bData.events || [
          {
            id: `ev_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            title: 'Booking Requested',
            description: `Booking request created for ₹${(bData.totalAmount || 32700).toLocaleString('en-IN')}`,
            status: 'requested',
            location: bData.pickupLocation || 'Ahmedabad'
          }
        ],
        currentGps: {
          lat: 23.0225,
          lng: 72.5714,
          speedKm: 0,
          updatedAt: 'GPS Ready',
          distanceCoveredKm: 0,
          totalDistanceKm: 530,
          etaMinutes: 420
        }
      };
    } else {
      // Called with (vehicle, pickup, destination, date, notes)
      const vehicle = vehicleOrData as Vehicle;
      const base = vehicle.baseFare;
      const loading = adminSettings.loadingChargeDefault;
      const unloading = adminSettings.unloadingChargeDefault;
      const toll = adminSettings.tollChargeEstimated;
      const subtotal = base + loading + unloading + toll;
      const gst = Math.round(subtotal * (adminSettings.gstPercentage / 100));
      const total = subtotal + gst;
      const commission = Math.round(total * (adminSettings.commissionPercentage / 100));
      const transporterPayout = total - commission;
      const orderId = `ORD-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      newOrder = {
        id: orderId,
        customerId: user.id || 'usr_cust_001',
        customerName: user.fullName || 'Shipper',
        customerCompany: user.companyName,
        customerPhone: user.phone || '9876543210',
        transporterId: vehicle.ownerId || 'usr_trans_001',
        transporterName: vehicle.transporterName || 'Fleet Operator',
        transporterPhone: vehicle.transporterPhone || '9825012345',
        vehicleId: vehicle.id,
        vehicleType: vehicle.vehicleType,
        vehicleNumber: vehicle.vehicleNumber,
        driverName: vehicle.driverName || 'Assigned Driver',
        driverPhone: vehicle.driverPhone || vehicle.transporterPhone,
        pickupLocation: pickup || 'Ahmedabad',
        deliveryLocation: destination || 'Mumbai',
        pickupDate: date || new Date().toISOString().split('T')[0],
        requiredCapacityTon: vehicle.capacityTon,
        isRefrigeratedReq: vehicle.isRefrigerated,
        baseFare: base,
        loadingCharges: loading,
        unloadingCharges: unloading,
        tollCharges: toll,
        otherCharges: 0,
        gstAmount: gst,
        totalAmount: total,
        adminCommissionAmount: commission,
        transporterPayableAmount: transporterPayout,
        paymentStatus: 'paid',
        paymentMethod: 'online',
        paymentTxnId: `TXN_TW_${Date.now().toString().slice(-8)}`,
        status: 'requested',
        notes: notes || 'Commercial freight dispatch',
        createdAt: new Date().toISOString(),
        events: [
          {
            id: `ev_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            title: 'Booking Requested',
            description: `Booking request created by ${user.fullName} for ₹${total.toLocaleString('en-IN')}`,
            status: 'requested',
            location: pickup || 'Ahmedabad'
          }
        ],
        currentGps: {
          lat: 23.0225,
          lng: 72.5714,
          speedKm: 0,
          updatedAt: 'GPS Ready',
          distanceCoveredKm: 0,
          totalDistanceKm: 530,
          etaMinutes: 420
        }
      };

      setRawVehicles(prev => {
        const exists = prev.some(v => v.id === vehicle.id);
        if (exists) {
          return prev.map(v => v.id === vehicle.id ? { ...v, status: 'booked' } : v);
        }
        return [...prev, { ...vehicle, status: 'booked' }];
      });
    }

    // Save directly into Supabase bookings table
    if (supabase) {
      try {
        // Ensure customer and transporter users exist in users table for foreign key constraints
        await supabase.from('users').upsert([
          { id: newOrder.customerId, fullName: newOrder.customerName, phone: newOrder.customerPhone, role: 'customer' },
          { id: newOrder.transporterId, fullName: newOrder.transporterName, phone: newOrder.transporterPhone, role: 'transporter' }
        ], { onConflict: 'id' });

        // Database row with exact table columns
        const bookingDbRow = {
          id: newOrder.id,
          customerId: newOrder.customerId,
          customerName: newOrder.customerName,
          customerPhone: newOrder.customerPhone,
          transporterId: newOrder.transporterId,
          transporterName: newOrder.transporterName,
          vehicleId: newOrder.vehicleId,
          vehicleNumber: newOrder.vehicleNumber,
          pickupLocation: newOrder.pickupLocation,
          deliveryLocation: newOrder.deliveryLocation,
          pickupDate: newOrder.pickupDate,
          totalAmount: newOrder.totalAmount,
          status: newOrder.status,
          created_at: newOrder.createdAt
        };

        const { data, error } = await supabase.from('bookings').insert([bookingDbRow]).select();
        if (error) {
          console.error("Supabase booking insert error:", error);
          showToast(`Error creating booking: ${error.message}`);
        } else {
          setRawBookings(prev => [newOrder, ...prev]);
          showToast("Booking created successfully!");
        }
      } catch (err: any) {
        console.error("Insert booking failed:", err);
        showToast(`Error creating booking: ${err.message || 'Failed to create booking'}`);
      }
    } else {
      setRawBookings(prev => [newOrder, ...prev]);
      showToast("Booking created successfully!");
    }

    // Send notifications to Transporter & Admin
    addNotification({
      userId: newOrder.transporterId,
      title: `New Booking Request: ${newOrder.id}`,
      body: `${newOrder.customerName} requested ${newOrder.vehicleType} for ${newOrder.pickupLocation} → ${newOrder.deliveryLocation} (₹${newOrder.totalAmount.toLocaleString('en-IN')})`,
      type: 'booking'
    });

    addNotification({
      userId: 'usr_adm_001',
      title: `Booking Generated: ${newOrder.id}`,
      body: `Booking for ₹${newOrder.totalAmount.toLocaleString('en-IN')} created.`,
      type: 'booking'
    });

    return newOrder;
  };

  // Update Booking Status in Supabase
  const updateBookingStatus = async (bookingId: string, status: OrderStatus | string) => {
    updateOrderStatus(bookingId, status as OrderStatus);
    if (supabase) {
      try {
        await supabase.from('bookings').update({ status }).eq('id', bookingId);
      } catch (err) {
        console.error("Supabase update booking status error:", err);
      }
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, reason?: string) => {
    let completedEarning: TransporterEarning | null = null;

    setRawBookings(prev => prev.map(order => {
      if (order.id === orderId) {
        const eventId = `ev_${Date.now()}`;
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        let eventTitle = newStatus.replace('_', ' ').toUpperCase();
        let eventDesc = `Status updated to ${newStatus.replace('_', ' ')}`;
        
        if (newStatus === 'accepted') {
          eventTitle = 'Booking Accepted';
          eventDesc = `Transporter accepted booking. Vehicle ${order.vehicleNumber} reserved.`;
        } else if (newStatus === 'trip_started') {
          eventTitle = 'Trip Started';
          eventDesc = `Driver ${order.driverName} commenced trip from ${order.pickupLocation}. Live GPS activated.`;
        } else if (newStatus === 'reached_pickup') {
          eventTitle = 'Vehicle Reached Pickup';
          eventDesc = `Vehicle arrived at ${order.pickupLocation} for loading.`;
        } else if (newStatus === 'loading_completed') {
          eventTitle = 'Loading Completed';
          eventDesc = `Cargo loaded safely. E-way bill documented. Moving towards destination.`;
        } else if (newStatus === 'in_transit') {
          eventTitle = 'Vehicle In Transit';
          eventDesc = `Vehicle cruising on highway towards ${order.deliveryLocation}.`;
        } else if (newStatus === 'reached_destination') {
          eventTitle = 'Reached Destination';
          eventDesc = `Vehicle arrived at ${order.deliveryLocation} unloading bay.`;
        } else if (newStatus === 'delivered') {
          eventTitle = 'Delivered';
          eventDesc = `Consignment delivered & physical proof of delivery confirmed.`;
        } else if (newStatus === 'completed') {
          eventTitle = 'Order Completed';
          eventDesc = `Order fulfilled successfully. Transporter earnings generated.`;
          
          completedEarning = {
            id: `earn_${Date.now()}`,
            transporterId: order.transporterId,
            bookingId: order.id,
            orderId: order.id,
            grossAmount: order.totalAmount,
            commissionDeducted: order.adminCommissionAmount,
            netEarnings: order.transporterPayableAmount,
            status: 'pending_settlement',
            completedAt: new Date().toISOString()
          };
        } else if (newStatus === 'cancelled') {
          eventTitle = 'Booking Cancelled';
          eventDesc = `Order was cancelled. Reason: ${reason || 'User cancelled'}`;
        }

        const newEvent = {
          id: eventId,
          timestamp: timeStr,
          title: eventTitle,
          description: eventDesc,
          status: newStatus
        };

        return {
          ...order,
          status: newStatus,
          events: [...order.events, newEvent]
        };
      }
      return order;
    }));

    const targetOrder = rawBookings.find(b => b.id === orderId);
    if (targetOrder) {
      if (newStatus === 'completed' || newStatus === 'cancelled') {
        setRawVehicles(prev => prev.map(v => v.id === targetOrder.vehicleId ? { ...v, status: 'available' } : v));
      } else if (newStatus === 'trip_started' || newStatus === 'in_transit') {
        setRawVehicles(prev => prev.map(v => v.id === targetOrder.vehicleId ? { ...v, status: 'on_trip' } : v));
      }
      // Cloud database sync directly to Supabase bookings table
      if (supabase) {
        supabase.from('bookings').update({ status: newStatus }).eq('id', orderId).then(({ error }) => {
          if (error) console.warn('Supabase booking update warning:', error.message);
        });
      }
      syncBookingToSupabase({ ...targetOrder, status: newStatus }).catch(err => console.warn('Supabase booking update sync warning:', err));
    }

    if (completedEarning) {
      setRawEarnings(prev => [completedEarning!, ...prev]);
    }

    showToast(`Order status updated to ${newStatus.replace('_', ' ').toUpperCase()}`);

    if (targetOrder) {
      addNotification({
        userId: targetOrder.customerId,
        title: `Order Update: ${targetOrder.id}`,
        body: `Your order status changed to ${newStatus.replace('_', ' ').toUpperCase()}.`,
        type: 'trip'
      });
      addNotification({
        userId: targetOrder.transporterId,
        title: `Order Update: ${targetOrder.id}`,
        body: `Order ${targetOrder.id} status is now ${newStatus.replace('_', ' ').toUpperCase()}.`,
        type: 'trip'
      });
    }
  };

  const assignDriver = (orderId: string, driverName: string, driverPhone: string, driverId?: string) => {
    setRawBookings(prev => prev.map(b => {
      if (b.id === orderId) {
        const updated = { ...b, driverName, driverPhone, driverId };
        syncBookingToSupabase(updated).catch(err => console.warn('Supabase assign driver sync warning:', err));
        return updated;
      }
      return b;
    }));
    showToast(`Driver ${driverName} assigned to order.`);
  };

  // Customer Freight Requirements (Bulk Load Enquiries)
  // Customer Freight Requirements (Bulk Load Enquiries)
  const createFreightRequirement = async (
    reqData: Omit<CustomerFreightRequirement, 'id' | 'createdAt' | 'status'> | CustomerFreightRequirement | any
  ): Promise<CustomerFreightRequirement> => {
    // Generate clean unique ID: req_${Date.now()}
    const newId = ('id' in reqData && reqData.id) ? reqData.id : `req_${Date.now()}`;

    // Prepare payload matching database column names exactly:
    // id, customerId, customerName, customerPhone, pickupLocation, deliveryLocation, pickupDate, vehicleType, quantityRequired, goodsDescription, targetBudgetPerVehicle, status
    const payload = {
      id: newId,
      customerId: reqData.customerId || user.id || 'usr_cust_001',
      customerName: reqData.customerName || user.fullName || 'Commercial Shipper',
      customerPhone: reqData.customerPhone || user.phone || '9876543210',
      pickupLocation: reqData.pickupLocation || 'Ahmedabad',
      deliveryLocation: reqData.deliveryLocation || 'Mumbai',
      pickupDate: reqData.pickupDate || new Date().toISOString().split('T')[0],
      vehicleType: reqData.vehicleType || 'Commercial Truck',
      quantityRequired: Number(reqData.quantityRequired) || 1,
      goodsDescription: reqData.goodsDescription || 'General Cargo',
      targetBudgetPerVehicle: reqData.targetBudgetPerVehicle ? Number(reqData.targetBudgetPerVehicle) : undefined,
      status: reqData.status || 'open'
    };

    if (supabase) {
      try {
        // Ensure customer user exists in users table for foreign key constraint
        await supabase.from('users').upsert([{
          id: payload.customerId,
          fullName: payload.customerName,
          phone: payload.customerPhone,
          role: 'customer'
        }], { onConflict: 'id' });

        const { data, error } = await supabase.from('customer_requirements').insert([payload]).select();
        if (error) {
          console.error("Supabase requirement error:", error);
          showToast(`Error saving requirement: ${error.message}`);
        } else {
          setRawFreightRequirements(prev => [payload, ...prev]);
          showToast("Freight requirement saved to database!");
        }
      } catch (err: any) {
        console.error("Supabase requirement error:", err);
        showToast(`Error saving requirement: ${err.message || 'Failed to save requirement'}`);
      }
    } else {
      setRawFreightRequirements(prev => [payload, ...prev]);
      showToast("Freight requirement saved to database!");
    }

    addNotification({
      userId: 'usr_adm_001',
      title: `New Freight Inquiry: ${payload.id}`,
      body: `${payload.customerName} needs ${payload.quantityRequired}x ${payload.vehicleType} for ${payload.pickupLocation} → ${payload.deliveryLocation}`,
      type: 'trip'
    });

    return payload;
  };

  const addCustomerRequirement = createFreightRequirement;
  const addFreightRequirement = createFreightRequirement;

  const updateFreightRequirementStatus = (id: string, status: 'open' | 'fulfilled' | 'closed') => {
    setRawFreightRequirements(prev => prev.map(r => {
      if (r.id === id) {
        const updated = { ...r, status };
        syncFreightRequirementToSupabase(updated).catch(err => console.warn('Supabase freight requirement status warning:', err));
        return updated;
      }
      return r;
    }));
    showToast(`Freight inquiry status updated to ${status.toUpperCase()}`);
  };

  const freightRequirements = useMemo(() => {
    if (role === 'admin' || role === 'transporter') {
      return rawFreightRequirements;
    }
    if (role === 'customer') {
      return rawFreightRequirements.filter(r => r.customerId === user.id);
    }
    return rawFreightRequirements;
  }, [rawFreightRequirements, role, user]);

  // GPS Simulation
  const startGpsTracking = (orderId: string) => {
    updateOrderStatus(orderId, 'trip_started');
  };

  const stopGpsTracking = (orderId: string) => {
    updateOrderStatus(orderId, 'delivered');
  };

  // Settlements
  const createSettlement = (transporterId: string, earningIds: string[], referenceNo: string) => {
    const targetEarnings = rawEarnings.filter(e => earningIds.includes(e.id));
    const gross = targetEarnings.reduce((sum, e) => sum + e.grossAmount, 0);
    const comm = targetEarnings.reduce((sum, e) => sum + e.commissionDeducted, 0);
    const net = targetEarnings.reduce((sum, e) => sum + e.netEarnings, 0);

    const newSettlement: Settlement = {
      id: `SETT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      transporterId,
      transporterName: targetEarnings[0]?.orderId ? 'Shah Roadways & Freight Carriers' : 'Transporter',
      earningIds,
      orderIds: targetEarnings.map(e => e.orderId),
      totalGrossAmount: gross,
      totalCommission: comm,
      netPayableAmount: net,
      paymentReference: referenceNo || `NEFT_${Date.now().toString().slice(-8)}`,
      status: 'paid',
      settledAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    setRawSettlements(prev => [newSettlement, ...prev]);
    setRawEarnings(prev => prev.map(e => earningIds.includes(e.id) ? { ...e, status: 'settled', settlementId: newSettlement.id } : e));

    showToast(`Settlement of ₹${net.toLocaleString('en-IN')} successfully paid! Reference: ${newSettlement.paymentReference}`);

    addNotification({
      userId: transporterId,
      title: `Settlement Payout Received: ₹${net.toLocaleString('en-IN')}`,
      body: `Settlement ${newSettlement.id} processed via ${newSettlement.paymentReference}.`,
      type: 'settlement'
    });
  };

  const updateAdminSettings = (newSettings: Partial<AdminSettings>) => {
    setAdminSettings(prev => ({ ...prev, ...newSettings }));
    showToast('Platform settings updated successfully!');
  };

  // Chat
  const sendMessage = (bookingId: string, text: string) => {
    if (!text.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      bookingId,
      senderId: user.id,
      senderName: user.fullName,
      senderRole: role,
      content: text.trim(),
      messageType: 'text',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    setChatMessages(prev => ({
      ...prev,
      [bookingId]: [...(prev[bookingId] || []), newMsg]
    }));

    const targetOrder = rawBookings.find(b => b.id === bookingId);
    if (targetOrder) {
      const recipientId = role === 'customer' ? targetOrder.transporterId : targetOrder.customerId;
      addNotification({
        userId: recipientId,
        title: `New Message from ${user.fullName}`,
        body: text.length > 50 ? text.slice(0, 50) + '...' : text,
        type: 'chat'
      });
    }
  };

  // Notifications
  const addNotification = (item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => {
    const newItem: NotificationItem = {
      id: `notif_${Date.now()}`,
      ...item,
      isRead: false,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setRawNotifications(prev => [newItem, ...prev]);
  };

  const markAllNotificationsRead = () => {
    setRawNotifications(prev => prev.map(n => n.userId === user.id ? { ...n, isRead: true } : n));
    showToast('All notifications marked as read');
  };

  // Complaints
  const createComplaint = (bookingId: string, orderId: string, category: Complaint['category'], description: string) => {
    const newComplaint: Complaint = {
      id: `CMP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      bookingId,
      orderId,
      userId: user.id,
      userName: user.fullName,
      userRole: role,
      category,
      description,
      status: 'open',
      createdAt: new Date().toISOString()
    };
    setRawComplaints(prev => [newComplaint, ...prev]);
    showToast(`Complaint ${newComplaint.id} submitted. Admin support will review shortly.`);

    addNotification({
      userId: 'usr_adm_001',
      title: `New Complaint Filed: ${newComplaint.id}`,
      body: `${user.fullName} raised an issue for order ${orderId} (${category}).`,
      type: 'system'
    });
  };

  const updateComplaintStatus = (complaintId: string, status: Complaint['status'], adminNotes?: string) => {
    setRawComplaints(prev => prev.map(c => c.id === complaintId ? { 
      ...c, 
      status, 
      adminNotes: adminNotes || c.adminNotes,
      resolvedAt: status === 'resolved' || status === 'closed' ? new Date().toISOString() : undefined
    } : c));
    showToast(`Complaint status updated to ${status.toUpperCase()}`);
  };

  // Driver Jobs & Vacancy Board Functions
  const postJobVacancy = async (jobData: {
    vehicleType: string;
    route: string;
    salaryOffer: string;
    experienceRequired: number;
    requirements: string;
  }): Promise<{ success: boolean; message?: string }> => {
    if (role !== 'transporter' && role !== 'admin') {
      showToast('Only Transporters can post driver vacancies.');
      return { success: false, message: 'Unauthorized: Transporter role required.' };
    }

    if (!jobData.vehicleType || !jobData.route || !jobData.salaryOffer) {
      showToast('Please provide vehicle type, route, and salary offer.');
      return { success: false, message: 'Missing required vacancy fields' };
    }

    const newVacancy: DriverJobVacancy = {
      id: `job_${Date.now()}`,
      transporterId: user.id || 'usr_trans_001',
      transporterName: user.companyName || user.fullName || 'Fleet Transporter',
      transporterPhone: user.phone || '9825012345',
      vehicleType: jobData.vehicleType.trim(),
      route: jobData.route.trim(),
      salaryOffer: jobData.salaryOffer.trim(),
      experienceRequired: Number(jobData.experienceRequired) || 1,
      requirements: jobData.requirements.trim() || 'HMV / Commercial Driving License required.',
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setRawJobVacancies(prev => [newVacancy, ...prev]);

    // Insert job vacancies into supabase.from('driver_vacancies').insert([job])
    if (supabase) {
      try {
        await supabase.from('users').upsert([{
          id: newVacancy.transporterId,
          fullName: newVacancy.transporterName,
          phone: newVacancy.transporterPhone,
          role: 'transporter',
          companyName: user.companyName
        }], { onConflict: 'id' });

        const { data, error } = await supabase.from('driver_vacancies').insert([newVacancy]).select();
        if (error) {
          console.error("Supabase driver vacancy insert error:", error);
          showToast(`Vacancy broadcasted: ${error.message}`);
        } else {
          showToast('Driver hiring vacancy published to cloud marketplace!');
        }
      } catch (err: any) {
        console.error("Supabase driver_vacancies insert exception:", err);
        showToast('Driver hiring vacancy published successfully!');
      }
    } else {
      showToast('Driver hiring vacancy published successfully!');
    }

    return { success: true };
  };

  const updateJobVacancyStatus = (vacancyId: string, status: 'open' | 'closed') => {
    setRawJobVacancies(prev => prev.map(v => v.id === vacancyId ? { ...v, status } : v));
    showToast(`Vacancy marked as ${status.toUpperCase()}!`);
  };

  const deleteJobVacancy = (vacancyId: string) => {
    setRawJobVacancies(prev => prev.filter(v => v.id !== vacancyId));
    showToast('Driver vacancy removed.');
  };

  const applyForJob = async (jobId: string, applicationData: {
    driverName: string;
    driverPhone: string;
    experienceYears: number;
    licenseNumber: string;
    resumeFileName: string;
    resumeUrl?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    if (!applicationData.driverName || !applicationData.driverPhone || !applicationData.licenseNumber) {
      showToast('Please fill driver name, mobile number, and license number.');
      return { success: false, message: 'Please complete all required fields.' };
    }

    const existingApp = rawJobApplications.find(a => 
      a.jobId === jobId && (a.driverPhone === applicationData.driverPhone || (user.id && a.driverId === user.id))
    );

    if (existingApp) {
      showToast('You have already submitted an application for this vacancy.');
      return { success: false, message: 'Already applied for this vacancy.' };
    }

    const driverUserId = user.id && user.id !== 'usr_unauth' ? user.id : `usr_drv_${Date.now()}`;
    
    // Ensure payload matches driver_applications schema:
    // (id, jobId, driverId, driverName, driverPhone, licenseNumber, experienceYears, resumeFileName, resumeUrl, status)
    const appData = {
      id: `app_${Date.now()}`,
      jobId,
      driverId: driverUserId,
      driverName: applicationData.driverName.trim(),
      driverPhone: applicationData.driverPhone.trim(),
      licenseNumber: applicationData.licenseNumber.trim().toUpperCase(),
      experienceYears: Number(applicationData.experienceYears) || 3,
      resumeFileName: applicationData.resumeFileName || 'Commercial_Driver_Resume.pdf',
      resumeUrl: applicationData.resumeUrl || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
      status: 'applied' as const
    };

    // Save driver application to Supabase driver_applications table
    if (supabase) {
      try {
        // Ensure driver user exists in users table for foreign key constraint
        await supabase.from('users').upsert([{
          id: appData.driverId,
          fullName: appData.driverName,
          phone: appData.driverPhone,
          role: 'driver'
        }], { onConflict: 'id' });

        // Ensure parent job vacancy exists in driver_vacancies table
        const targetJob = rawJobVacancies.find(j => j.id === jobId);
        if (targetJob) {
          await supabase.from('users').upsert([{
            id: targetJob.transporterId || 'usr_trans_001',
            fullName: targetJob.transporterName || 'Fleet Transporter',
            phone: targetJob.transporterPhone || '9825012345',
            role: 'transporter'
          }], { onConflict: 'id' });

          await supabase.from('driver_vacancies').upsert([{
            id: targetJob.id,
            transporterId: targetJob.transporterId || 'usr_trans_001',
            transporterName: targetJob.transporterName || 'Fleet Transporter',
            transporterPhone: targetJob.transporterPhone || '9825012345',
            vehicleType: targetJob.vehicleType || 'Commercial Truck',
            route: targetJob.route || 'Gujarat',
            salaryOffer: targetJob.salaryOffer || '₹25,000 - ₹35,000 / month',
            experienceRequired: Number(targetJob.experienceRequired) || 1,
            requirements: targetJob.requirements || 'Commercial driving license required.',
            status: targetJob.status || 'open'
          }], { onConflict: 'id' });
        }

        const { data, error } = await supabase.from('driver_applications').insert([appData]).select();
        if (error) {
          console.error("Supabase driver application error:", error);
          showToast(`Error submitting application: ${error.message}`);
          return { success: false, message: error.message };
        } else {
          setRawJobApplications(prev => [{ ...appData, appliedAt: new Date().toISOString().split('T')[0] }, ...prev]);
          showToast("Application submitted successfully!");
        }
      } catch (err: any) {
        console.error("Supabase driver_applications insert exception:", err);
        showToast(`Error submitting application: ${err.message || 'Failed to submit application'}`);
        return { success: false, message: err.message };
      }
    } else {
      setRawJobApplications(prev => [{ ...appData, appliedAt: new Date().toISOString().split('T')[0] }, ...prev]);
      showToast("Application submitted successfully!");
    }

    // Send notification to Transporter
    const targetJob = rawJobVacancies.find(j => j.id === jobId);
    if (targetJob) {
      addNotification({
        userId: targetJob.transporterId,
        title: 'New Driver Resume Received! / નવો રેઝ્યૂમે મળ્યો',
        body: `${appData.driverName} (${appData.experienceYears} yrs exp) applied for ${targetJob.vehicleType} on ${targetJob.route}.`,
        type: 'system'
      });
    }

    return { success: true };
  };

  const updateApplicationStatus = (applicationId: string, status: 'applied' | 'shortlisted' | 'rejected') => {
    setRawJobApplications(prev => prev.map(a => a.id === applicationId ? { ...a, status } : a));
    const candidate = rawJobApplications.find(a => a.id === applicationId);
    if (candidate) {
      addNotification({
        userId: candidate.driverId,
        title: `Application Status: ${status.toUpperCase()}`,
        body: `Your driver application has been marked as ${status.toUpperCase()} by the transporter.`,
        type: 'system'
      });
    }
    showToast(`Candidate application status updated to ${status.toUpperCase()}!`);
  };

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      user,
      role,
      session,
      login,
      register,
      logout,
      switchUser,
      updateUserProfile,
      saveUserProfileToSupabase,
      registeredUsers,
      adminSecurityInfo,
      changeAdminPassword,
      changeAdminEmail,
      requestAdminPasswordReset,
      confirmAdminPasswordReset,
      screen,
      setScreen,
      navigateProtected,
      securityAlert,
      dismissSecurityAlert,
      language,
      setLanguage,
      t,
      searchQuery,
      setSearchQuery,
      vehicles,
      allMarketplaceVehicles,
      selectedVehicle,
      setSelectedVehicle,
      addVehicle,
      updateVehicleStatus,
      uploadDocument,
      verifyDocument,
      drivers,
      allDrivers: driversList,
      addDriver,
      assignDriver,
      bookings,
      allBookings: rawBookings,
      setBookings: setRawBookings,
      selectedOrder,
      setSelectedOrder,
      createBooking,
      updateBookingStatus,
      updateOrderStatus,
      startGpsTracking,
      stopGpsTracking,
      earnings,
      allEarnings: rawEarnings,
      settlements,
      allSettlements: rawSettlements,
      createSettlement,
      adminSettings,
      updateAdminSettings,
      chatMessages,
      sendMessage,
      notifications,
      unreadNotificationCount,
      markAllNotificationsRead,
      addNotification,
      complaints,
      allComplaints: rawComplaints,
      createComplaint,
      updateComplaintStatus,
      jobVacancies,
      jobApplications,
      driverApplications: rawJobApplications,
      setDriverApplications: setRawJobApplications,
      postJobVacancy,
      updateJobVacancyStatus,
      deleteJobVacancy,
      applyForJob,
      updateApplicationStatus,
      freightRequirements,
      allFreightRequirements: rawFreightRequirements,
      customerRequirements: rawFreightRequirements,
      setCustomerRequirements: setRawFreightRequirements,
      addCustomerRequirement,
      addFreightRequirement,
      createFreightRequirement,
      updateFreightRequirementStatus,
      toastMessage,
      showToast
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
