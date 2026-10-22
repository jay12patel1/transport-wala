package com.transportwala.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.transportwala.data.models.*
import com.transportwala.data.repository.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class AuthState {
    object Idle : AuthState()
    object Loading : AuthState()
    data class Success(val profile: UserProfile) : AuthState()
    data class Error(val message: String) : AuthState()
}

class AuthViewModel(
    private val authRepository: AuthRepository = AuthRepository()
) : ViewModel() {

    private val _authState = MutableStateFlow<AuthState>(AuthState.Idle)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    private val _currentUser = MutableStateFlow<UserProfile?>(null)
    val currentUser: StateFlow<UserProfile?> = _currentUser.asStateFlow()

    fun login(identifier: String, pass: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            val result = authRepository.login(identifier, pass)
            result.onSuccess { profile ->
                _currentUser.value = profile
                _authState.value = AuthState.Success(profile)
            }.onFailure { error ->
                _authState.value = AuthState.Error(error.message ?: "Login failed")
            }
        }
    }

    fun signUp(
        fullName: String,
        mobile: String,
        email: String,
        pass: String,
        role: UserRole,
        companyName: String? = null
    ) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            val result = authRepository.signUp(fullName, mobile, email, pass, role, companyName)
            result.onSuccess { profile ->
                _currentUser.value = profile
                _authState.value = AuthState.Success(profile)
            }.onFailure { error ->
                _authState.value = AuthState.Error(error.message ?: "Sign up failed")
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            _currentUser.value = null
            _authState.value = AuthState.Idle
        }
    }
}

class CustomerViewModel(
    private val vehicleRepository: VehicleRepository = VehicleRepository(),
    private val bookingRepository: BookingRepository = BookingRepository()
) : ViewModel() {

    private val _vehicles = MutableStateFlow<List<Vehicle>>(emptyList())
    val vehicles: StateFlow<List<Vehicle>> = _vehicles.asStateFlow()

    private val _bookings = MutableStateFlow<List<Booking>>(emptyList())
    val bookings: StateFlow<List<Booking>> = _bookings.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    fun searchVehicles(pickup: String? = null, vehicleType: String? = null, isRefrigerated: Boolean? = null) {
        viewModelScope.launch {
            _isLoading.value = true
            val result = vehicleRepository.getAvailableVehicles(pickup, vehicleType, isRefrigerated)
            result.onSuccess {
                _vehicles.value = it
            }
            _isLoading.value = false
        }
    }

    fun loadBookings(customerId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            val result = bookingRepository.getCustomerBookings(customerId)
            result.onSuccess {
                _bookings.value = it
            }
            _isLoading.value = false
        }
    }

    fun confirmBooking(booking: Booking, onComplete: (Boolean) -> Unit) {
        viewModelScope.launch {
            _isLoading.value = true
            val result = bookingRepository.createBooking(booking)
            _isLoading.value = false
            onComplete(result.isSuccess)
        }
    }
}

class TransporterViewModel(
    private val vehicleRepository: VehicleRepository = VehicleRepository(),
    private val bookingRepository: BookingRepository = BookingRepository()
) : ViewModel() {

    private val _myVehicles = MutableStateFlow<List<Vehicle>>(emptyList())
    val myVehicles: StateFlow<List<Vehicle>> = _myVehicles.asStateFlow()

    private val _bookingRequests = MutableStateFlow<List<Booking>>(emptyList())
    val bookingRequests: StateFlow<List<Booking>> = _bookingRequests.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    fun loadDashboard(transporterId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            val vehiclesRes = vehicleRepository.getTransporterVehicles(transporterId)
            val bookingsRes = bookingRepository.getTransporterBookings(transporterId)
            
            vehiclesRes.onSuccess { _myVehicles.value = it }
            bookingsRes.onSuccess { _bookingRequests.value = it }
            _isLoading.value = false
        }
    }

    fun acceptBooking(orderId: String) {
        viewModelScope.launch {
            bookingRepository.updateBookingStatus(orderId, OrderStatus.ACCEPTED)
        }
    }

    fun rejectBooking(orderId: String) {
        viewModelScope.launch {
            bookingRepository.updateBookingStatus(orderId, OrderStatus.REJECTED)
        }
    }

    fun assignDriver(orderId: String, driverId: String, driverName: String, driverPhone: String) {
        viewModelScope.launch {
            bookingRepository.assignDriver(orderId, driverId, driverName, driverPhone)
        }
    }

    fun addVehicle(vehicle: Vehicle, onComplete: (Boolean) -> Unit) {
        viewModelScope.launch {
            val res = vehicleRepository.addVehicle(vehicle)
            onComplete(res.isSuccess)
        }
    }
}

class DriverViewModel(
    private val driverRepository: DriverRepository = DriverRepository(),
    private val bookingRepository: BookingRepository = BookingRepository()
) : ViewModel() {

    private val _trips = MutableStateFlow<List<Booking>>(emptyList())
    val trips: StateFlow<List<Booking>> = _trips.asStateFlow()

    fun loadTrips(driverId: String) {
        viewModelScope.launch {
            val res = driverRepository.getDriverTrips(driverId)
            res.onSuccess { _trips.value = it }
        }
    }

    fun startTrip(orderId: String) {
        viewModelScope.launch {
            bookingRepository.updateBookingStatus(orderId, OrderStatus.TRIP_STARTED)
        }
    }

    fun completeTrip(orderId: String) {
        viewModelScope.launch {
            bookingRepository.updateBookingStatus(orderId, OrderStatus.COMPLETED)
        }
    }

    fun updateLocation(orderId: String, lat: Double, lng: Double, speed: Int) {
        viewModelScope.launch {
            driverRepository.updateGpsLocation(orderId, lat, lng, speed)
        }
    }
}

class AdminViewModel(
    private val adminRepository: AdminRepository = AdminRepository()
) : ViewModel() {

    private val _settings = MutableStateFlow(AdminSettings())
    val settings: StateFlow<AdminSettings> = _settings.asStateFlow()

    fun loadSettings() {
        viewModelScope.launch {
            val res = adminRepository.getAdminSettings()
            res.onSuccess { _settings.value = it }
        }
    }

    fun updateSettings(newSettings: AdminSettings) {
        viewModelScope.launch {
            val res = adminRepository.updateAdminSettings(newSettings)
            res.onSuccess { _settings.value = it }
        }
    }

    fun verifyDoc(docId: String, isApproved: Boolean, reason: String? = null) {
        viewModelScope.launch {
            adminRepository.verifyDocument(
                docId = docId,
                status = if (isApproved) DocStatus.VERIFIED else DocStatus.REJECTED,
                reason = reason
            )
        }
    }
}
