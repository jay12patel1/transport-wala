package com.transportwala.data.repository

import com.transportwala.data.models.*
import com.transportwala.data.remote.SupabaseClientProvider
import io.github.jan.supabase.gotrue.providers.builtin.Email
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Columns
import io.github.jan.supabase.postgrest.query.Order
import io.github.jan.supabase.realtime.channel
import io.github.jan.supabase.realtime.postgresChangeFlow
import io.github.jan.supabase.storage.storage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import java.util.UUID

class AuthRepository {
    private val auth = SupabaseClientProvider.auth
    private val postgrest = SupabaseClientProvider.postgrest

    suspend fun login(identifier: String, password: String): Result<UserProfile> = withContext(Dispatchers.IO) {
        try {
            // 1. Authenticate with Supabase Auth
            auth.signInWith(Email) {
                this.email = identifier
                this.password = password
            }

            val currentUser = auth.currentUserOrNull() 
                ?: return@withContext Result.failure(Exception("Authentication failed"))

            // 2. Fetch User Profile & Role from database
            val profile = postgrest.from("profiles")
                .select {
                    filter {
                        or {
                            eq("user_id", currentUser.id)
                            eq("email", identifier)
                        }
                    }
                }
                .decodeSingle<UserProfile>()

            Result.success(profile)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun signUp(
        fullName: String,
        mobile: String,
        email: String,
        password: String,
        role: UserRole,
        companyName: String? = null,
        address: String? = null
    ): Result<UserProfile> = withContext(Dispatchers.IO) {
        try {
            // Disallow public super_admin signup
            if (role == UserRole.SUPER_ADMIN) {
                return@withContext Result.failure(Exception("Public registration as Super Admin is not allowed."))
            }

            // 1. Create user in Supabase Auth
            auth.signUpWith(Email) {
                this.email = email
                this.password = password
            }

            val userId = auth.currentUserOrNull()?.id ?: UUID.randomUUID().toString()

            // 2. Insert Profile into public.profiles
            val newProfile = UserProfile(
                id = UUID.randomUUID().toString(),
                userId = userId,
                fullName = fullName,
                mobile = mobile,
                email = email,
                role = role,
                companyName = companyName,
                address = address
            )

            postgrest.from("profiles").insert(newProfile)

            Result.success(newProfile)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun resetPassword(email: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            auth.resetPasswordForEmail(email)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun logout(): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            auth.signOut()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

class VehicleRepository {
    private val postgrest = SupabaseClientProvider.postgrest
    private val storage = SupabaseClientProvider.storage

    suspend fun getAvailableVehicles(
        pickupLocation: String? = null,
        vehicleType: String? = null,
        isRefrigerated: Boolean? = null
    ): Result<List<Vehicle>> = withContext(Dispatchers.IO) {
        try {
            val vehicles = postgrest.from("vehicles")
                .select {
                    filter {
                        eq("status", "available")
                        eq("is_verified", true)
                        if (!pickupLocation.isNullOrBlank()) {
                            ilike("current_location", "%$pickupLocation%")
                        }
                        if (!vehicleType.isNullOrBlank() && vehicleType != "All") {
                            eq("vehicle_type", vehicleType)
                        }
                        if (isRefrigerated == true) {
                            eq("is_refrigerated", true)
                        }
                    }
                }
                .decodeList<Vehicle>()

            Result.success(vehicles)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getTransporterVehicles(transporterId: String): Result<List<Vehicle>> = withContext(Dispatchers.IO) {
        try {
            val vehicles = postgrest.from("vehicles")
                .select {
                    filter {
                        eq("owner_id", transporterId)
                    }
                }
                .decodeList<Vehicle>()

            Result.success(vehicles)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun addVehicle(vehicle: Vehicle): Result<Vehicle> = withContext(Dispatchers.IO) {
        try {
            postgrest.from("vehicles").insert(vehicle)
            Result.success(vehicle)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun uploadVehicleDocument(document: VehicleDocument, fileBytes: ByteArray): Result<VehicleDocument> = withContext(Dispatchers.IO) {
        try {
            // Upload to Supabase Storage Bucket 'documents'
            val bucket = storage.from("documents")
            val filePath = "vehicles/${document.vehicleId}/${document.docType}_${System.currentTimeMillis()}.pdf"
            bucket.upload(filePath, fileBytes)
            val publicUrl = bucket.publicUrl(filePath)

            val docWithUrl = document.copy(fileUrl = publicUrl)
            postgrest.from("vehicle_documents").insert(docWithUrl)

            Result.success(docWithUrl)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

class BookingRepository {
    private val postgrest = SupabaseClientProvider.postgrest

    suspend fun createBooking(booking: Booking): Result<Booking> = withContext(Dispatchers.IO) {
        try {
            postgrest.from("bookings").insert(booking)
            Result.success(booking)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getCustomerBookings(customerId: String): Result<List<Booking>> = withContext(Dispatchers.IO) {
        try {
            val bookings = postgrest.from("bookings")
                .select {
                    filter {
                        eq("customer_id", customerId)
                    }
                    order("created_at", Order.DESCENDING)
                }
                .decodeList<Booking>()

            Result.success(bookings)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getTransporterBookings(transporterId: String): Result<List<Booking>> = withContext(Dispatchers.IO) {
        try {
            val bookings = postgrest.from("bookings")
                .select {
                    filter {
                        eq("transporter_id", transporterId)
                    }
                    order("created_at", Order.DESCENDING)
                }
                .decodeList<Booking>()

            Result.success(bookings)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateBookingStatus(orderId: String, status: OrderStatus): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            postgrest.from("bookings").update(
                mapOf("status" to status.name.lowercase())
            ) {
                filter { eq("id", orderId) }
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun assignDriver(orderId: String, driverId: String, driverName: String, driverPhone: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            postgrest.from("bookings").update(
                mapOf(
                    "driver_id" to driverId,
                    "driver_name" to driverName,
                    "driver_phone" to driverPhone,
                    "status" to "assigned"
                )
            ) {
                filter { eq("id", orderId) }
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

class DriverRepository {
    private val postgrest = SupabaseClientProvider.postgrest

    suspend fun getDriverTrips(driverId: String): Result<List<Booking>> = withContext(Dispatchers.IO) {
        try {
            val trips = postgrest.from("bookings")
                .select {
                    filter {
                        eq("driver_id", driverId)
                    }
                    order("created_at", Order.DESCENDING)
                }
                .decodeList<Booking>()

            Result.success(trips)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateGpsLocation(orderId: String, lat: Double, lng: Double, speedKm: Int): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            postgrest.from("bookings").update(
                mapOf(
                    "gps_lat" to lat,
                    "gps_lng" to lng,
                    "gps_speed_km" to speedKm
                )
            ) {
                filter { eq("id", orderId) }
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

class ChatRepository {
    private val postgrest = SupabaseClientProvider.postgrest

    suspend fun getMessages(bookingId: String): Result<List<ChatMessage>> = withContext(Dispatchers.IO) {
        try {
            val messages = postgrest.from("chat_messages")
                .select {
                    filter {
                        eq("booking_id", bookingId)
                    }
                    order("created_at", Order.ASCENDING)
                }
                .decodeList<ChatMessage>()

            Result.success(messages)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun sendMessage(message: ChatMessage): Result<ChatMessage> = withContext(Dispatchers.IO) {
        try {
            postgrest.from("chat_messages").insert(message)
            Result.success(message)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

class AdminRepository {
    private val postgrest = SupabaseClientProvider.postgrest

    suspend fun getAdminSettings(): Result<AdminSettings> = withContext(Dispatchers.IO) {
        try {
            val settings = postgrest.from("admin_settings")
                .select()
                .decodeSingle<AdminSettings>()
            Result.success(settings)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateAdminSettings(settings: AdminSettings): Result<AdminSettings> = withContext(Dispatchers.IO) {
        try {
            postgrest.from("admin_settings").update(settings) {
                filter { eq("id", 1) }
            }
            Result.success(settings)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun verifyDocument(docId: String, status: DocStatus, reason: String? = null): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            postgrest.from("vehicle_documents").update(
                mapOf(
                    "status" to status.name.lowercase(),
                    "rejection_reason" to reason
                )
            ) {
                filter { eq("id", docId) }
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
