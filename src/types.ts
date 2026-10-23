export type UserRole = 'customer' | 'transporter' | 'driver' | 'admin';

export type VehicleStatus = 'available' | 'booked' | 'on_trip' | 'maintenance' | 'inactive';

export type DocStatus = 'pending' | 'verified' | 'rejected' | 'expired';

export type DocType = 'RC' | 'Insurance' | 'Fitness' | 'Permit' | 'PUC' | 'GST' | 'Other';

export type OrderStatus = 
  | 'requested'
  | 'accepted'
  | 'rejected'
  | 'assigned'
  | 'trip_started'
  | 'reached_pickup'
  | 'loading_completed'
  | 'in_transit'
  | 'reached_destination'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'initiated' | 'paid' | 'partially_paid' | 'failed' | 'refunded' | 'cash';

export type SettlementStatus = 'pending' | 'approved' | 'processing' | 'paid' | 'failed';

export type ComplaintStatus = 'open' | 'under_review' | 'resolved' | 'closed';

export type Language = 'en' | 'gu' | 'hi';

export interface UserProfile {
  id: string;
  role: UserRole;
  fullName: string;
  companyName: string;
  phone: string;
  email: string;
  gstNumber?: string;
  address: string;
  rating?: number;
  avatarUrl?: string;
  isVerified?: boolean;
  phone_verified?: boolean;
  phoneVerified?: boolean;
  status?: 'active' | 'suspended' | 'pending';
  createdAt?: string;
  password?: string;
}

export interface DriverRecord {
  id: string; // e.g. usr_drv_001
  transporterId: string; // e.g. usr_trans_001
  transporterName: string;
  fullName: string;
  phone: string;
  email?: string;
  licenseNumber: string;
  experienceYears: number;
  assignedVehicleId?: string;
  assignedVehicleNumber?: string;
  status: 'active' | 'on_trip' | 'inactive';
  rating: number;
  joinedAt: string;
  passcode?: string;
  password?: string;
}

export interface AuthSession {
  token: string;
  user: UserProfile;
  role: UserRole;
  expiresAt: string;
}

export interface AuthCredentials {
  identifier: string; // Email or phone
  password?: string;
  passcode?: string;
  role: UserRole;
}

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  ownerId: string;
  docType: DocType;
  docNumber: string;
  issueDate: string;
  expiryDate: string;
  fileUrl: string;
  fileName: string;
  status: DocStatus;
  rejectionReason?: string;
  uploadedAt: string;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  transporterName: string;
  transporterPhone: string;
  transporterRating: number;
  vehicleNumber: string;
  vehicleType: string;
  vehicleCategory: 'Container' | 'Open Truck' | 'Closed Body' | 'Trailer' | 'Special' | 'Tanker';
  vehicleSize: string;
  capacityKg: number;
  capacityTon: number;
  currentLocation: string;
  preferredRoute?: string;
  availableFromDate: string;
  isRefrigerated: boolean;
  status: VehicleStatus;
  baseFare: number;
  perKmRate: number;
  driverName?: string;
  driverPhone?: string;
  imageUrl: string;
  description?: string;
  isVerified: boolean;
  documents: VehicleDocument[];
}

export interface OrderEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  status: OrderStatus;
  location?: string;
}

export interface BookingOrder {
  id: string; // e.g. ORD-2026-001234
  customerId: string;
  customerName: string;
  customerCompany: string;
  customerPhone: string;
  transporterId: string;
  transporterName: string;
  transporterPhone: string;
  vehicleId: string;
  vehicleType: string;
  vehicleNumber: string;
  driverName?: string;
  driverPhone?: string;
  pickupLocation: string;
  deliveryLocation: string;
  pickupDate: string;
  requiredCapacityTon?: number;
  isRefrigeratedReq?: boolean;
  baseFare: number;
  loadingCharges: number;
  unloadingCharges: number;
  tollCharges: number;
  otherCharges: number;
  gstAmount: number;
  totalAmount: number;
  adminCommissionAmount: number;
  transporterPayableAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: 'online' | 'cash' | 'neft';
  paymentTxnId?: string;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  events: OrderEvent[];
  // Live GPS state
  currentGps?: {
    lat: number;
    lng: number;
    speedKm: number;
    updatedAt: string;
    distanceCoveredKm: number;
    totalDistanceKm: number;
    etaMinutes: number;
  };
}

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  messageType: 'text' | 'image' | 'system';
  createdAt: string;
  isRead: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'booking' | 'payment' | 'trip' | 'document' | 'settlement' | 'chat' | 'system';
  linkTarget?: { screen: string; params?: any };
  isRead: boolean;
  createdAt: string;
}

export interface TransporterEarning {
  id: string;
  transporterId: string;
  bookingId: string;
  orderId: string;
  grossAmount: number;
  commissionDeducted: number;
  netEarnings: number;
  status: 'pending_settlement' | 'settled';
  settlementId?: string;
  completedAt: string;
}

export interface Settlement {
  id: string; // SETT-2026-0001
  transporterId: string;
  transporterName: string;
  earningIds: string[];
  orderIds: string[];
  totalGrossAmount: number;
  totalCommission: number;
  netPayableAmount: number;
  paymentReference: string;
  status: SettlementStatus;
  settledAt?: string;
  createdAt: string;
}

export interface Complaint {
  id: string; // CMP-2026-0001
  bookingId: string;
  orderId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  category: 'Vehicle Issue' | 'Driver Issue' | 'Fare Dispute' | 'Delay' | 'Damage / Loss' | 'Payment Issue' | 'Other';
  description: string;
  status: ComplaintStatus;
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface AdminSettings {
  commissionPercentage: number;
  gstPercentage: number;
  cancellationFeePercentage: number;
  minimumBookingAmount: number;
  loadingChargeDefault: number;
  unloadingChargeDefault: number;
  tollChargeEstimated: number;
  appContactNumber: string;
  appDeveloper: string;
  supportEmail?: string;
}

export interface DriverJobVacancy {
  id: string;
  transporterId: string;
  transporterName: string;
  transporterPhone: string;
  vehicleType: string;
  route: string;
  salaryOffer: string;
  experienceRequired: number;
  requirements: string;
  status: 'open' | 'closed';
  createdAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  experienceYears: number;
  licenseNumber: string;
  resumeFileName: string;
  resumeUrl?: string;
  status: 'applied' | 'shortlisted' | 'rejected';
  appliedAt: string;
}

export interface CustomerFreightRequirement {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  pickupLocation: string;
  deliveryLocation: string;
  pickupDate: string;
  vehicleType: string;
  quantityRequired: number;
  goodsDescription: string;
  targetBudgetPerVehicle?: number;
  status: 'open' | 'fulfilled' | 'closed';
  createdAt?: string;
}
