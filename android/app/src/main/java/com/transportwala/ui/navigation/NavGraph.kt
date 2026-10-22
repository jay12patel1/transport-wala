package com.transportwala.ui.navigation

import androidx.compose.runtime.*
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.transportwala.data.models.UserRole
import com.transportwala.data.models.Vehicle
import com.transportwala.ui.screens.admin.AdminDashboardScreen
import com.transportwala.ui.screens.auth.LoginScreen
import com.transportwala.ui.screens.auth.SignUpScreen
import com.transportwala.ui.screens.customer.BookingConfirmationScreen
import com.transportwala.ui.screens.customer.CustomerBookingsScreen
import com.transportwala.ui.screens.customer.CustomerHomeScreen
import com.transportwala.ui.screens.customer.LiveTrackingScreen
import com.transportwala.ui.screens.driver.DriverHomeScreen
import com.transportwala.ui.screens.landing.LandingScreen
import com.transportwala.ui.screens.transporter.TransporterDashboardScreen
import com.transportwala.ui.viewmodel.*

@Composable
fun AppNavGraph(
    navController: NavHostController,
    authViewModel: AuthViewModel,
    customerViewModel: CustomerViewModel,
    transporterViewModel: TransporterViewModel,
    driverViewModel: DriverViewModel,
    adminViewModel: AdminViewModel
) {
    val currentUser by authViewModel.currentUser.collectAsState()
    var selectedVehicleForBooking by remember { mutableStateOf<Vehicle?>(null) }

    NavHost(
        navController = navController,
        startDestination = Screen.Landing.route
    ) {
        // Landing Screen
        composable(Screen.Landing.route) {
            LandingScreen(
                onNavigateToLogin = { navController.navigate(Screen.Login.route) },
                onNavigateToSignUp = { role ->
                    navController.navigate(Screen.SignUp.route)
                },
                onFindVehicleClick = {
                    navController.navigate(Screen.Login.route)
                }
            )
        }

        // Login Screen
        composable(Screen.Login.route) {
            LoginScreen(
                authViewModel = authViewModel,
                onLoginSuccess = { profile ->
                    when (profile.role) {
                        UserRole.CUSTOMER -> navController.navigate(Screen.CustomerHome.route) {
                            popUpTo(Screen.Landing.route) { inclusive = true }
                        }
                        UserRole.TRANSPORTER -> navController.navigate(Screen.TransporterDashboard.route) {
                            popUpTo(Screen.Landing.route) { inclusive = true }
                        }
                        UserRole.DRIVER -> navController.navigate(Screen.DriverHome.route) {
                            popUpTo(Screen.Landing.route) { inclusive = true }
                        }
                        UserRole.SUPER_ADMIN -> navController.navigate(Screen.AdminDashboard.route) {
                            popUpTo(Screen.Landing.route) { inclusive = true }
                        }
                    }
                },
                onNavigateToSignUp = { navController.navigate(Screen.SignUp.route) },
                onNavigateToForgotPassword = { navController.navigate(Screen.ForgotPassword.route) },
                onBack = { navController.popBackStack() }
            )
        }

        // Sign Up Screen
        composable(Screen.SignUp.route) {
            SignUpScreen(
                authViewModel = authViewModel,
                onSignUpSuccess = { profile ->
                    when (profile.role) {
                        UserRole.CUSTOMER -> navController.navigate(Screen.CustomerHome.route) {
                            popUpTo(Screen.Landing.route) { inclusive = true }
                        }
                        UserRole.TRANSPORTER -> navController.navigate(Screen.TransporterDashboard.route) {
                            popUpTo(Screen.Landing.route) { inclusive = true }
                        }
                        UserRole.DRIVER -> navController.navigate(Screen.DriverHome.route) {
                            popUpTo(Screen.Landing.route) { inclusive = true }
                        }
                        UserRole.SUPER_ADMIN -> navController.navigate(Screen.AdminDashboard.route)
                    }
                },
                onNavigateToLogin = { navController.navigate(Screen.Login.route) },
                onBack = { navController.popBackStack() }
            )
        }

        // Customer Home
        composable(Screen.CustomerHome.route) {
            CustomerHomeScreen(
                customerViewModel = customerViewModel,
                onBookVehicle = { vehicle ->
                    selectedVehicleForBooking = vehicle
                    navController.navigate("booking_confirm")
                },
                onOpenSearch = {}
            )
        }

        // Customer Booking Confirmation
        composable("booking_confirm") {
            val vehicle = selectedVehicleForBooking
            if (vehicle != null) {
                BookingConfirmationScreen(
                    vehicle = vehicle,
                    customerViewModel = customerViewModel,
                    customerId = currentUser?.id ?: "usr_cust_001",
                    customerName = currentUser?.fullName ?: "Valued Trader",
                    customerPhone = currentUser?.mobile ?: "9725506630",
                    onBookingSuccess = { orderId ->
                        navController.navigate(Screen.CustomerBookings.route)
                    },
                    onBack = { navController.popBackStack() }
                )
            }
        }

        // Customer Bookings
        composable(Screen.CustomerBookings.route) {
            CustomerBookingsScreen(
                customerViewModel = customerViewModel,
                customerId = currentUser?.id ?: "usr_cust_001",
                onTrackVehicle = { orderId ->
                    navController.navigate("live_track/$orderId")
                },
                onOpenChat = { bookingId -> },
                onViewInvoice = { orderId -> },
                onRaiseComplaint = { orderId -> }
            )
        }

        // Live Tracking
        composable("live_track/{orderId}") { backStackEntry ->
            val orderId = backStackEntry.arguments?.getString("orderId") ?: ""
            val booking = customerViewModel.bookings.collectAsState().value.find { it.id == orderId }
            LiveTrackingScreen(
                orderId = orderId,
                booking = booking,
                onBack = { navController.popBackStack() },
                onOpenChat = {}
            )
        }

        // Transporter Dashboard
        composable(Screen.TransporterDashboard.route) {
            TransporterDashboardScreen(
                transporterViewModel = transporterViewModel,
                transporterId = currentUser?.id ?: "usr_trans_001",
                onNavigateToAddVehicle = {},
                onNavigateToEarnings = {},
                onOpenChat = {}
            )
        }

        // Driver Home
        composable(Screen.DriverHome.route) {
            DriverHomeScreen(
                driverViewModel = driverViewModel,
                driverId = currentUser?.id ?: "usr_drv_001",
                driverName = currentUser?.fullName ?: "Driver",
                onOpenChat = {}
            )
        }

        // Super Admin Dashboard
        composable(Screen.AdminDashboard.route) {
            AdminDashboardScreen(
                adminViewModel = adminViewModel,
                onNavigateToSecurity = {},
                onLogout = {
                    authViewModel.logout()
                    navController.navigate(Screen.Landing.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }
    }
}
