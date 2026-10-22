package com.transportwala.ui.screens.customer

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.transportwala.R
import com.transportwala.data.models.Booking
import com.transportwala.data.models.OrderStatus
import com.transportwala.data.models.PaymentStatus
import com.transportwala.data.models.Vehicle
import com.transportwala.ui.theme.*
import com.transportwala.ui.viewmodel.CustomerViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun BookingConfirmationScreen(
    vehicle: Vehicle,
    customerViewModel: CustomerViewModel,
    customerId: String,
    customerName: String,
    customerPhone: String,
    onBookingSuccess: (String) -> Unit,
    onBack: () -> Unit
) {
    var pickupLocation by remember { mutableStateOf(vehicle.currentLocation) }
    var deliveryLocation by remember { mutableStateOf("Mumbai Port Area") }
    var notes by remember { mutableStateOf("") }
    var isSubmitting by remember { mutableStateOf(false) }

    // Fare calculation
    val baseFare = vehicle.baseFare
    val loadingCharges = 800.0
    val unloadingCharges = 800.0
    val tollCharges = 1200.0
    val subtotal = baseFare + loadingCharges + unloadingCharges + tollCharges
    val gstAmount = subtotal * 0.18
    val totalAmount = subtotal + gstAmount
    val adminCommission = totalAmount * 0.05
    val transporterPayout = totalAmount - adminCommission

    val scrollState = rememberScrollState()

    Scaffold(
        containerColor = BackgroundSlate,
        topBar = {
            SmallTopAppBar(
                title = { Text("Confirm Booking", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.smallTopAppBarColors(containerColor = SurfaceWhite)
            )
        },
        bottomBar = {
            Surface(
                color = SurfaceWhite,
                tonalElevation = 8.dp,
                shadowElevation = 8.dp
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(text = "Total Amount", fontSize = 12.sp, color = TextMuted)
                        Text(
                            text = "₹${totalAmount.toInt()}",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Black,
                            color = BluePrimary
                        )
                    }

                    Button(
                        onClick = {
                            isSubmitting = true
                            val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                            val currentDate = sdf.format(Date())
                            val randomSuffix = (1000..9999).random()
                            val orderId = "ORD-2026-$randomSuffix"

                            val newBooking = Booking(
                                id = orderId,
                                customerId = customerId,
                                customerName = customerName,
                                customerPhone = customerPhone,
                                transporterId = vehicle.ownerId,
                                transporterName = vehicle.transporterName,
                                transporterPhone = vehicle.transporterPhone,
                                vehicleId = vehicle.id,
                                vehicleType = vehicle.vehicleType,
                                vehicleNumber = vehicle.vehicleNumber,
                                pickupLocation = pickupLocation,
                                deliveryLocation = deliveryLocation,
                                pickupDate = currentDate,
                                requiredCapacityTon = vehicle.capacityTon,
                                isRefrigeratedReq = vehicle.isRefrigerated,
                                baseFare = baseFare,
                                loadingCharges = loadingCharges,
                                unloadingCharges = unloadingCharges,
                                tollCharges = tollCharges,
                                gstAmount = gstAmount,
                                totalAmount = totalAmount,
                                adminCommissionAmount = adminCommission,
                                transporterPayableAmount = transporterPayout,
                                paymentStatus = PaymentStatus.PENDING,
                                status = OrderStatus.REQUESTED,
                                notes = if (notes.isNotBlank()) notes else null
                            )

                            customerViewModel.confirmBooking(newBooking) { success ->
                                isSubmitting = false
                                if (success) {
                                    onBookingSuccess(orderId)
                                }
                            }
                        },
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = OrangeAccent),
                        enabled = !isSubmitting,
                        modifier = Modifier.height(48.dp)
                    ) {
                        if (isSubmitting) {
                            CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp))
                        } else {
                            Text(text = "Confirm Booking", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        }
                    }
                }
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(scrollState)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Vehicle Details Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = SurfaceWhite)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "Vehicle Selected", fontSize = 13.sp, color = TextMuted, fontWeight = FontWeight.SemiBold)
                    Text(text = "${vehicle.vehicleType} (${vehicle.vehicleNumber})", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                    Text(text = "Transporter: ${vehicle.transporterName}", fontSize = 13.sp, color = TextSecondary)
                }
            }

            // Route Details
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = SurfaceWhite)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "Route & Cargo Details", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = pickupLocation,
                        onValueChange = { pickupLocation = it },
                        label = { Text("Pickup Address") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = deliveryLocation,
                        onValueChange = { deliveryLocation = it },
                        label = { Text("Delivery Address") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = notes,
                        onValueChange = { notes = it },
                        label = { Text("Special Cargo Instructions (Optional)") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )
                }
            }

            // Fare Breakdown Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = SurfaceWhite)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "Fare Breakdown", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                    Spacer(modifier = Modifier.height(12.dp))

                    FareRow(label = "Base Fare", amount = baseFare)
                    FareRow(label = "Loading Charges", amount = loadingCharges)
                    FareRow(label = "Unloading Charges", amount = unloadingCharges)
                    FareRow(label = "Tolls & Green Tax (Est.)", amount = tollCharges)
                    FareRow(label = "GST (18%)", amount = gstAmount)

                    Divider(color = BorderLight, modifier = Modifier.padding(vertical = 8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Total Payable", fontWeight = FontWeight.Black, fontSize = 15.sp, color = TextPrimary)
                        Text(text = "₹${totalAmount.toInt()}", fontWeight = FontWeight.Black, fontSize = 16.sp, color = BluePrimary)
                    }
                }
            }
        }
    }
}

@Composable
fun FareRow(label: String, amount: Double) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, fontSize = 13.sp, color = TextSecondary)
        Text(text = "₹${amount.toInt()}", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
    }
}
