package com.transportwala.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class UserProfile(
    val id: String,
    @SerialName("user_id") val userId: String? = null,
    @SerialName("full_name") val fullName: String,
    val mobile: String,
    val email: String,
    val role: UserRole = UserRole.CUSTOMER,
    @SerialName("avatar_url") val avatarUrl: String? = null,
    @SerialName("company_name") val companyName: String? = null,
    @SerialName("gst_number") val gstNumber: String? = null,
    val address: String? = null,
    val rating: Double = 5.0,
    @SerialName("is_active") val isActive: Boolean = true,
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class Vehicle(
    val id: String,
    @SerialName("owner_id") val ownerId: String,
    @SerialName("transporter_name") val transporterName: String,
    @SerialName("transporter_phone") val transporterPhone: String,
    @SerialName("vehicle_number") val vehicleNumber: String,
    @SerialName("vehicle_type") val vehicleType: String,
    @SerialName("vehicle_category") val vehicleCategory: String = "Container",
    @SerialName("vehicle_size") val vehicleSize: String? = "20 ft",
    @SerialName("capacity_kg") val capacityKg: Double = 5000.0,
    @SerialName("capacity_ton") val capacityTon: Double = 5.0,
    @SerialName("current_location") val currentLocation: String,
    @SerialName("preferred_route") val preferredRoute: String? = null,
    @SerialName("available_from_date") val availableFromDate: String? = null,
    @SerialName("is_refrigerated") val isRefrigerated: Boolean = false,
    val status: VehicleStatus = VehicleStatus.AVAILABLE,
    @SerialName("base_fare") val baseFare: Double,
    @SerialName("per_km_rate") val perKmRate: Double = 50.0,
    @SerialName("driver_name") val driverName: String? = null,
    @SerialName("driver_phone") val driverPhone: String? = null,
    @SerialName("image_url") val imageUrl: String? = null,
    val description: String? = null,
    @SerialName("is_verified") val isVerified: Boolean = false,
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class VehicleDocument(
    val id: String,
    @SerialName("vehicle_id") val vehicleId: String,
    @SerialName("owner_id") val ownerId: String,
    @SerialName("doc_type") val docType: DocType,
    @SerialName("doc_number") val docNumber: String,
    @SerialName("issue_date") val issueDate: String? = null,
    @SerialName("expiry_date") val expiryDate: String? = null,
    @SerialName("file_url") val fileUrl: String,
    @SerialName("file_name") val fileName: String,
    val status: DocStatus = DocStatus.PENDING,
    @SerialName("rejection_reason") val rejectionReason: String? = null,
    @SerialName("uploaded_at") val uploadedAt: String? = null
)

@Serializable
data class Driver(
    val id: String,
    @SerialName("transporter_id") val transporterId: String,
    @SerialName("profile_id") val profileId: String? = null,
    @SerialName("full_name") val fullName: String,
    val phone: String,
    val email: String? = null,
    @SerialName("license_number") val licenseNumber: String,
    @SerialName("experience_years") val experienceYears: Int = 5,
    @SerialName("assigned_vehicle_id") val assignedVehicleId: String? = null,
    val status: String = "active",
    val rating: Double = 5.0,
    @SerialName("joined_at") val joinedAt: String? = null
)

@Serializable
data class Booking(
    val id: String,
    @SerialName("customer_id") val customerId: String,
    @SerialName("customer_name") val customerName: String,
    @SerialName("customer_company") val customerCompany: String? = null,
    @SerialName("customer_phone") val customerPhone: String,
    @SerialName("transporter_id") val transporterId: String,
    @SerialName("transporter_name") val transporterName: String,
    @SerialName("transporter_phone") val transporterPhone: String,
    @SerialName("vehicle_id") val vehicleId: String,
    @SerialName("vehicle_type") val vehicleType: String,
    @SerialName("vehicle_number") val vehicleNumber: String,
    @SerialName("driver_id") val driverId: String? = null,
    @SerialName("driver_name") val driverName: String? = null,
    @SerialName("driver_phone") val driverPhone: String? = null,
    @SerialName("pickup_location") val pickupLocation: String,
    @SerialName("delivery_location") val deliveryLocation: String,
    @SerialName("pickup_date") val pickupDate: String,
    @SerialName("required_capacity_ton") val requiredCapacityTon: Double? = null,
    @SerialName("is_refrigerated_req") val isRefrigeratedReq: Boolean = false,
    @SerialName("base_fare") val baseFare: Double,
    @SerialName("loading_charges") val loadingCharges: Double = 0.0,
    @SerialName("unloading_charges") val unloadingCharges: Double = 0.0,
    @SerialName("toll_charges") val tollCharges: Double = 0.0,
    @SerialName("other_charges") val otherCharges: Double = 0.0,
    @SerialName("gst_amount") val gstAmount: Double,
    @SerialName("total_amount") val totalAmount: Double,
    @SerialName("admin_commission_amount") val adminCommissionAmount: Double = 0.0,
    @SerialName("transporter_payable_amount") val transporterPayableAmount: Double = 0.0,
    @SerialName("payment_status") val paymentStatus: PaymentStatus = PaymentStatus.PENDING,
    @SerialName("payment_method") val paymentMethod: String = "online",
    @SerialName("payment_txn_id") val paymentTxnId: String? = null,
    val status: OrderStatus = OrderStatus.REQUESTED,
    val notes: String? = null,
    @SerialName("gps_lat") val gpsLat: Double? = 23.0225,
    @SerialName("gps_lng") val gpsLng: Double? = 72.5714,
    @SerialName("gps_speed_km") val gpsSpeedKm: Int? = 0,
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class ChatMessage(
    val id: String,
    @SerialName("booking_id") val bookingId: String,
    @SerialName("sender_id") val senderId: String,
    @SerialName("sender_name") val senderName: String,
    @SerialName("sender_role") val senderRole: UserRole,
    val content: String,
    @SerialName("message_type") val messageType: String = "text",
    @SerialName("is_read") val isRead: Boolean = false,
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class NotificationItem(
    val id: String,
    @SerialName("user_id") val userId: String,
    val title: String,
    val body: String,
    val type: String = "general",
    @SerialName("is_read") val isRead: Boolean = false,
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class Complaint(
    val id: String,
    @SerialName("booking_id") val bookingId: String? = null,
    @SerialName("order_id") val orderId: String? = null,
    @SerialName("user_id") val userId: String,
    @SerialName("user_name") val userName: String,
    @SerialName("user_role") val userRole: UserRole,
    val category: String,
    val description: String,
    val status: String = "open",
    @SerialName("admin_notes") val adminNotes: String? = null,
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class TransporterEarning(
    val id: String,
    @SerialName("transporter_id") val transporterId: String,
    @SerialName("booking_id") val bookingId: String,
    @SerialName("order_id") val orderId: String,
    @SerialName("gross_amount") val grossAmount: Double,
    @SerialName("commission_deducted") val commissionDeducted: Double,
    @SerialName("net_earnings") val netEarnings: Double,
    val status: String = "pending_settlement",
    @SerialName("completed_at") val completedAt: String? = null
)

@Serializable
data class Settlement(
    val id: String,
    @SerialName("transporter_id") val transporterId: String,
    @SerialName("transporter_name") val transporterName: String,
    @SerialName("total_gross_amount") val totalGrossAmount: Double,
    @SerialName("total_commission") val totalCommission: Double,
    @SerialName("net_payable_amount") val netPayableAmount: Double,
    @SerialName("payment_reference") val paymentReference: String,
    val status: String = "paid",
    @SerialName("settled_at") val settledAt: String? = null
)

@Serializable
data class AdminSettings(
    val id: Int = 1,
    @SerialName("commission_percentage") val commissionPercentage: Double = 5.0,
    @SerialName("gst_percentage") val gstPercentage: Double = 18.0,
    @SerialName("loading_charge_default") val loadingChargeDefault: Double = 800.0,
    @SerialName("toll_charge_estimated") val tollChargeEstimated: Double = 1200.0,
    @SerialName("app_contact_number") val appContactNumber: String = "9725506630",
    @SerialName("app_developer") val appDeveloper: String = "Jayesh Patel"
)
