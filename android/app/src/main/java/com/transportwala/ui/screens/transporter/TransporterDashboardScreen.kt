package com.transportwala.ui.screens.transporter

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.transportwala.data.models.Booking
import com.transportwala.data.models.OrderStatus
import com.transportwala.ui.theme.*
import com.transportwala.ui.viewmodel.TransporterViewModel

@Composable
fun TransporterDashboardScreen(
    transporterViewModel: TransporterViewModel,
    transporterId: String,
    onNavigateToAddVehicle: () -> Unit,
    onNavigateToEarnings: () -> Unit,
    onOpenChat: (String) -> Unit
) {
    val myVehicles by transporterViewModel.myVehicles.collectAsState()
    val bookingRequests by transporterViewModel.bookingRequests.collectAsState()
    val isLoading by transporterViewModel.isLoading.collectAsState()

    var showAssignDialog by remember { mutableStateOf<Booking?>(null) }

    LaunchedEffect(transporterId) {
        transporterViewModel.loadDashboard(transporterId)
    }

    Scaffold(
        containerColor = BackgroundSlate,
        topBar = {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(NavyDark)
                    .padding(horizontal = 20.dp, vertical = 16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Transporter Console",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White
                        )
                        Text(
                            text = "Fleet & Booking Operations",
                            fontSize = 12.sp,
                            color = OrangeAccent
                        )
                    }

                    Button(
                        onClick = onNavigateToAddVehicle,
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = OrangeAccent),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Add Vehicle", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(vertical = 16.dp)
        ) {
            // Fleet Performance Stats Cards
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    MetricCard(
                        title = "Vehicles",
                        value = "${myVehicles.size}",
                        icon = Icons.Default.LocalShipping,
                        bgColor = BlueLight,
                        textColor = BluePrimary,
                        modifier = Modifier.weight(1f)
                    )
                    MetricCard(
                        title = "Requests",
                        value = "${bookingRequests.filter { it.status == OrderStatus.REQUESTED }.size}",
                        icon = Icons.Default.PendingActions,
                        bgColor = OrangeLight,
                        textColor = OrangeAccent,
                        modifier = Modifier.weight(1f)
                    )
                    MetricCard(
                        title = "Trips",
                        value = "${bookingRequests.filter { it.status == OrderStatus.TRIP_STARTED || it.status == OrderStatus.IN_TRANSIT }.size}",
                        icon = Icons.Default.Navigation,
                        bgColor = EmeraldLight,
                        textColor = EmeraldGreen,
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // Booking Requests Section
            item {
                Text(
                    text = "New Booking Requests (${bookingRequests.filter { it.status == OrderStatus.REQUESTED }.size})",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
            }

            val pendingRequests = bookingRequests.filter { it.status == OrderStatus.REQUESTED }
            if (pendingRequests.isEmpty()) {
                item {
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        color = SurfaceWhite
                    ) {
                        Text(
                            text = "No pending booking requests right now.",
                            fontSize = 13.sp,
                            color = TextMuted,
                            modifier = Modifier.padding(20.dp)
                        )
                    }
                }
            } else {
                items(pendingRequests) { booking ->
                    TransporterRequestCard(
                        booking = booking,
                        onAccept = {
                            transporterViewModel.acceptBooking(booking.id)
                            showAssignDialog = booking
                        },
                        onReject = { transporterViewModel.rejectBooking(booking.id) },
                        onChat = { onOpenChat(booking.id) }
                    )
                }
            }

            // Active Trips Section
            item {
                Text(
                    text = "Active & In-Progress Trips",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }

            val activeTrips = bookingRequests.filter { 
                it.status == OrderStatus.ACCEPTED || 
                it.status == OrderStatus.ASSIGNED || 
                it.status == OrderStatus.TRIP_STARTED ||
                it.status == OrderStatus.IN_TRANSIT 
            }

            if (activeTrips.isEmpty()) {
                item {
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        color = SurfaceWhite
                    ) {
                        Text(
                            text = "No active trips at the moment.",
                            fontSize = 13.sp,
                            color = TextMuted,
                            modifier = Modifier.padding(20.dp)
                        )
                    }
                }
            } else {
                items(activeTrips) { trip ->
                    ActiveTripManageCard(
                        trip = trip,
                        onAssignDriver = { showAssignDialog = trip },
                        onChat = { onOpenChat(trip.id) }
                    )
                }
            }
        }
    }

    // Assign Driver Dialog
    if (showAssignDialog != null) {
        var driverName by remember { mutableStateOf("Ramesh Solanki") }
        var driverPhone by remember { mutableStateOf("9876543210") }

        AlertDialog(
            onDismissRequest = { showAssignDialog = null },
            title = { Text("Assign Driver to ${showAssignDialog?.id}", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = driverName,
                        onValueChange = { driverName = it },
                        label = { Text("Driver Name") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = driverPhone,
                        onValueChange = { driverPhone = it },
                        label = { Text("Driver Phone Number") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val booking = showAssignDialog
                        if (booking != null) {
                            transporterViewModel.assignDriver(
                                orderId = booking.id,
                                driverId = "drv_${System.currentTimeMillis()}",
                                driverName = driverName,
                                driverPhone = driverPhone
                            )
                        }
                        showAssignDialog = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = BluePrimary)
                ) {
                    Text("Confirm Driver")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAssignDialog = null }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
fun MetricCard(
    title: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    bgColor: Color,
    textColor: Color,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        color = SurfaceWhite,
        shadowElevation = 2.dp
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Icon(imageVector = icon, contentDescription = null, tint = textColor, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = value, fontSize = 20.sp, fontWeight = FontWeight.Black, color = TextPrimary)
            Text(text = title, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = TextMuted)
        }
    }
}

@Composable
fun TransporterRequestCard(
    booking: Booking,
    onAccept: () -> Unit,
    onReject: () -> Unit,
    onChat: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = booking.id, fontWeight = FontWeight.Black, fontSize = 15.sp, color = TextPrimary)
                Text(
                    text = "₹${booking.transporterPayableAmount.toInt()}",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Black,
                    color = BluePrimary
                )
            }

            Spacer(modifier = Modifier.height(8.dp))
            Text(text = "Customer: ${booking.customerName} (${booking.customerPhone})", fontSize = 13.sp, color = TextSecondary)
            Text(text = "${booking.pickupLocation} ➔ ${booking.deliveryLocation}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = TextPrimary)

            Spacer(modifier = Modifier.height(14.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = onAccept,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldGreen)
                ) {
                    Text("Accept", fontWeight = FontWeight.Bold)
                }

                OutlinedButton(
                    onClick = onReject,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Reject", color = RoseRed, fontWeight = FontWeight.Bold)
                }

                IconButton(onClick = onChat) {
                    Icon(Icons.Default.Chat, contentDescription = "Chat", tint = BluePrimary)
                }
            }
        }
    }
}

@Composable
fun ActiveTripManageCard(
    trip: Booking,
    onAssignDriver: () -> Unit,
    onChat: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(text = trip.id, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Text(text = trip.status.name, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = BluePrimary)
            }

            Spacer(modifier = Modifier.height(6.dp))
            Text(text = "${trip.vehicleType} • ${trip.vehicleNumber}", fontSize = 13.sp, color = TextMuted)
            Text(text = "Driver: ${trip.driverName ?: "Not Assigned"}", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)

            Spacer(modifier = Modifier.height(10.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (trip.driverName.isNullOrBlank()) {
                    Button(
                        onClick = onAssignDriver,
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = BluePrimary)
                    ) {
                        Text("Assign Driver", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                }

                IconButton(onClick = onChat) {
                    Icon(Icons.Default.Chat, contentDescription = "Chat", tint = BluePrimary)
                }
            }
        }
    }
}
