package com.transportwala.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
enum class UserRole {
    @SerialName("customer")
    CUSTOMER,

    @SerialName("transporter")
    TRANSPORTER,

    @SerialName("driver")
    DRIVER,

    @SerialName("super_admin")
    SUPER_ADMIN;

    fun getDisplayName(): String {
        return when (this) {
            CUSTOMER -> "Customer / Trader"
            TRANSPORTER -> "Transporter / Fleet Owner"
            DRIVER -> "Commercial Driver"
            SUPER_ADMIN -> "Super Admin"
        }
    }
}

@Serializable
enum class VehicleStatus {
    @SerialName("available")
    AVAILABLE,

    @SerialName("booked")
    BOOKED,

    @SerialName("on_trip")
    ON_TRIP,

    @SerialName("maintenance")
    MAINTENANCE,

    @SerialName("inactive")
    INACTIVE
}

@Serializable
enum class DocType {
    @SerialName("RC")
    RC,

    @SerialName("Insurance")
    INSURANCE,

    @SerialName("Fitness")
    FITNESS,

    @SerialName("Permit")
    PERMIT,

    @SerialName("PUC")
    PUC,

    @SerialName("GST")
    GST,

    @SerialName("Other")
    OTHER
}

@Serializable
enum class DocStatus {
    @SerialName("pending")
    PENDING,

    @SerialName("verified")
    VERIFIED,

    @SerialName("rejected")
    REJECTED,

    @SerialName("expired")
    EXPIRED
}

@Serializable
enum class OrderStatus {
    @SerialName("requested")
    REQUESTED,

    @SerialName("accepted")
    ACCEPTED,

    @SerialName("rejected")
    REJECTED,

    @SerialName("assigned")
    ASSIGNED,

    @SerialName("trip_started")
    TRIP_STARTED,

    @SerialName("reached_pickup")
    REACHED_PICKUP,

    @SerialName("loading_completed")
    LOADING_COMPLETED,

    @SerialName("in_transit")
    IN_TRANSIT,

    @SerialName("reached_destination")
    REACHED_DESTINATION,

    @SerialName("delivered")
    DELIVERED,

    @SerialName("completed")
    COMPLETED,

    @SerialName("cancelled")
    CANCELLED
}

@Serializable
enum class PaymentStatus {
    @SerialName("pending")
    PENDING,

    @SerialName("initiated")
    INITIATED,

    @SerialName("paid")
    PAID,

    @SerialName("partially_paid")
    PARTIALLY_PAID,

    @SerialName("failed")
    FAILED,

    @SerialName("refunded")
    REFUNDED,

    @SerialName("cash")
    CASH
}
