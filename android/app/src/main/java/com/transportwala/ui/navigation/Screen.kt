package com.transportwala.ui.navigation

sealed class Screen(val route: String) {
    // Public / Auth
    object Landing : Screen("landing")
    object Login : Screen("login")
    object SignUp : Screen("signup")
    object ForgotPassword : Screen("forgot_password")

    // Customer
    object CustomerHome : Screen("customer_home")
    object VehicleSearch : Screen("vehicle_search")
    object BookingConfirmation : Screen("booking_confirmation/{vehicleId}") {
        fun createRoute(vehicleId: String) = "booking_confirmation/$vehicleId"
    }
    object CustomerBookings : Screen("customer_bookings")
    object LiveTracking : Screen("live_tracking/{orderId}") {
        fun createRoute(orderId: String) = "live_tracking/$orderId"
    }

    // Transporter
    object TransporterDashboard : Screen("transporter_dashboard")
    object AddVehicle : Screen("add_vehicle")
    object VehicleDocuments : Screen("vehicle_documents/{vehicleId}") {
        fun createRoute(vehicleId: String) = "vehicle_documents/$vehicleId"
    }
    object TransporterEarnings : Screen("transporter_earnings")

    // Driver
    object DriverHome : Screen("driver_home")
    object ActiveTrip : Screen("active_trip/{orderId}") {
        fun createRoute(orderId: String) = "active_trip/$orderId"
    }
    object TripHistory : Screen("trip_history")

    // Super Admin
    object AdminDashboard : Screen("admin_dashboard")
    object AdminSecurity : Screen("admin_security")

    // Shared
    object Chat : Screen("chat/{bookingId}") {
        fun createRoute(bookingId: String) = "chat/$bookingId"
    }
    object Invoice : Screen("invoice/{orderId}") {
        fun createRoute(orderId: String) = "invoice/$orderId"
    }
    object Profile : Screen("profile")
}
