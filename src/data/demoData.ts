import { UserProfile, Vehicle, BookingOrder, AdminSettings, Complaint, Settlement, TransporterEarning, DriverRecord, DriverJobVacancy, JobApplication } from '../types';

/**
 * DEFAULT SUPER ADMIN ACCOUNT
 * Clean Slate: Only the master administrator account is preserved so the administrator can log in.
 * All dummy Customer, Transporter, and Driver accounts are removed.
 */
export const DEMO_USERS: Record<string, UserProfile> = {
  admin: {
    id: 'usr_adm_001',
    role: 'admin',
    fullName: 'Jayesh Patel (Super Admin)',
    companyName: 'Transport Wala Headquarters',
    phone: '9725506630',
    email: 'support@transportswala.com',
    password: 'password123',
    address: 'SG Highway, Ahmedabad, Gujarat',
    rating: 5.0,
    isVerified: true,
    phone_verified: true,
    phoneVerified: true,
    status: 'active',
    createdAt: '2026-01-01'
  }
};

/**
 * DEFAULT SUPER ADMIN CREDENTIALS FOR QUICK VERIFICATION
 */
export const DEMO_CREDENTIALS = [
  {
    role: 'admin',
    label: 'Super Admin Login',
    identifier: '9725506630',
    phone: '9725506630',
    password: 'password123',
    name: 'Jayesh Patel (Super Admin)'
  }
];

/**
 * PLATFORM ADMINISTRATIVE SETTINGS
 */
export const INITIAL_ADMIN_SETTINGS: AdminSettings = {
  commissionPercentage: 5.0,
  gstPercentage: 18.0,
  cancellationFeePercentage: 2.0,
  minimumBookingAmount: 2500,
  loadingChargeDefault: 800,
  unloadingChargeDefault: 800,
  tollChargeEstimated: 1200,
  appContactNumber: '9725506630',
  appDeveloper: 'Jayesh Patel',
  supportEmail: 'support@transportswala.com'
};

/**
 * CLEAN SLATE INITIAL STATE:
 * All pre-populated sample records are cleared out to empty arrays [].
 * Real data will be populated by registered users dynamically.
 */
export const INITIAL_VEHICLES: Vehicle[] = [];
export const INITIAL_BOOKINGS: BookingOrder[] = [];
export const INITIAL_DRIVERS: DriverRecord[] = [];
export const INITIAL_EARNINGS: TransporterEarning[] = [];
export const INITIAL_COMPLAINTS: Complaint[] = [];
export const INITIAL_SETTLEMENTS: Settlement[] = [];

export const INITIAL_JOB_VACANCIES: DriverJobVacancy[] = [
  {
    id: 'job_vac_001',
    transporterId: 'trans_patel_logistics',
    transporterName: 'Patel All India Roadlines',
    transporterPhone: '9825123456',
    vehicleType: '32ft Multi-Axle Container (14 Ton)',
    route: 'Ahmedabad to Mumbai / JNPT Port',
    salaryOffer: '₹28,000 / month + ₹600 Trip Allowance',
    experienceRequired: 4,
    requirements: 'Heavy Motor Vehicle (HMV/Trans) driving license required. Experience with 32ft containerized cargo on NH48. Valid commercial badge and clean driving record.',
    status: 'open',
    createdAt: '2026-04-10'
  },
  {
    id: 'job_vac_002',
    transporterId: 'trans_gujarat_freight',
    transporterName: 'Gujarat Express Cargo Carriers',
    transporterPhone: '9879011223',
    vehicleType: '24ft Flatbed Trailer (20 Ton)',
    route: 'Surat to Delhi / NCR Industrial Belt',
    salaryOffer: '₹32,000 / month + Highway Food Allowance',
    experienceRequired: 5,
    requirements: 'Trailer driving experience required. Safe steel coil / machinery handling, night highway driving proficiency on Western Corridor.',
    status: 'open',
    createdAt: '2026-04-12'
  },
  {
    id: 'job_vac_003',
    transporterId: 'trans_om_logistics',
    transporterName: 'Shiv Shakti Transport Fleet',
    transporterPhone: '9712345678',
    vehicleType: '20ft Closed Body Truck (9 Ton)',
    route: 'Vadodara to Pune / Chakan MIDC',
    salaryOffer: '₹24,000 / month + Diesel Incentive',
    experienceRequired: 3,
    requirements: 'FMCG and auto-parts express deliveries. Smartphone usage for GPS tracking and digital E-way bill POD sign-off.',
    status: 'open',
    createdAt: '2026-04-15'
  }
];

export const INITIAL_JOB_APPLICATIONS: JobApplication[] = [];

