package com.transportwala.ui.screens.customer

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
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.transportwala.R
import com.transportwala.data.models.Booking
import com.transportwala.data.models.OrderStatus
import com.transportwala.ui.theme.*
import com.transportwala.ui.viewmodel.CustomerViewModel

@Composable
fun CustomerBookingsScreen(
    customerViewModel: CustomerViewModel,
    customerId: String,
    onTrackVehicle: (String) -> Unit,
    onOpenChat: (String) -> Unit,
    onViewInvoice: (String) -> Unit,
    onRaiseComplaint: (String) -> Unit
) {
    val bookings by customerViewModel.bookings.collectAsState()
    val isLoading by customerViewModel.isLoading.collectAsState()

    LaunchedEffect(customerId) {
        customerViewModel.loadBookings(customerId)
    }

    Scaffold(
        containerColor = BackgroundSlate,
        topBar = {
            SmallTopAppBar(
                title = { Text("My Bookings", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.smallTopAppBarColors(containerColor = SurfaceWhite)
            )
        }
    ) { padding ->
        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = BluePrimary)
            }
        } else if (bookings.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        Icons.Default.ReceiptLong,
                        contentDescription = null,
                        tint = TextMuted,
                        modifier = Modifier.size(56.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "No Bookings Yet",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Text(
                        text = "Your commercial truck bookings will appear here.",
                        fontSize = 13.sp,
                        color = TextMuted,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
                contentPadding = PaddingValues(vertical = 16.dp)
            ) {
                items(bookings) { booking ->
                    BookingOrderCard(
                        booking = booking,
                        onTrack = { onTrackVehicle(booking.id) },
                        onChat = { onOpenChat(booking.id) },
                        onInvoice = { onViewInvoice(booking.id) },
                        onComplaint = { onRaiseComplaint(booking.id) }
                    )
                }
            }
        }
    }
}

@Composable
fun BookingOrderCard(
    booking: Booking,
    onTrack: () -> Unit,
    onChat: () -> Unit,
    onInvoice: () -> Unit,
    onComplaint: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            // Header with Order ID & Status Badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = booking.id,
                    fontWeight = FontWeight.Black,
                    fontSize = 15.sp,
                    color = TextPrimary
                )

                OrderStatusBadge(status = booking.status)
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "${booking.vehicleType} • ${booking.vehicleNumber}",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = BluePrimary
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Route Details
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.TripOrigin, contentDescription = null, tint = EmeraldGreen, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text(text = booking.pickupLocation, fontSize = 13.sp, color = TextPrimary)
            }
            Spacer(modifier = Modifier.height(4.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.LocationOn, contentDescription = null, tint = OrangeAccent, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text(text = booking.deliveryLocation, fontSize = 13.sp, color = TextPrimary)
            }

            Spacer(modifier = Modifier.height(10.dp))
            Divider(color = BorderLight)
            Spacer(modifier = Modifier.height(10.dp))

            // Amount & Actions
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(text = "Total Fare", fontSize = 11.sp, color = TextMuted)
                    Text(
                        text = "₹${booking.totalAmount.toInt()}",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Black,
                        color = TextPrimary
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    if (booking.status == OrderStatus.TRIP_STARTED || booking.status == OrderStatus.IN_TRANSIT) {
                        Button(
                            onClick = onTrack,
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = EmeraldGreen),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Icon(Icons.Default.Navigation, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(text = "Track", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    OutlinedButton(
                        onClick = onChat,
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Icon(Icons.Default.Chat, contentDescription = null, modifier = Modifier.size(16.dp))
                    }

                    OutlinedButton(
                        onClick = onInvoice,
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Icon(Icons.Default.Receipt, contentDescription = null, modifier = Modifier.size(16.dp))
                    }
                }
            }
        }
    }
}

@Composable
fun OrderStatusBadge(status: OrderStatus) {
    val (bgColor, textColor, label) = when (status) {
        OrderStatus.REQUESTED -> Triple(BlueLight, BlueDark, "REQUESTED")
        OrderStatus.ACCEPTED -> Triple(EmeraldLight, EmeraldGreen, "ACCEPTED")
        OrderStatus.REJECTED -> Triple(RoseRed.copy(alpha = 0.1f), RoseRed, "REJECTED")
        OrderStatus.ASSIGNED -> Triple(BlueLight, BluePrimary, "DRIVER ASSIGNED")
        OrderStatus.TRIP_STARTED -> Triple(EmeraldLight, EmeraldGreen, "ON TRIP")
        OrderStatus.REACHED_PICKUP -> Triple(OrangeLight, OrangeAccent, "AT PICKUP")
        OrderStatus.LOADING_COMPLETED -> Triple(BlueLight, BluePrimary, "LOADED")
        OrderStatus.IN_TRANSIT -> Triple(EmeraldLight, EmeraldGreen, "IN TRANSIT")
        OrderStatus.REACHED_DESTINATION -> Triple(OrangeLight, OrangeAccent, "AT DESTINATION")
        OrderStatus.DELIVERED -> Triple(EmeraldLight, EmeraldGreen, "DELIVERED")
        OrderStatus.COMPLETED -> Triple(EmeraldLight, EmeraldGreen, "COMPLETED")
        OrderStatus.CANCELLED -> Triple(RoseRed.copy(alpha = 0.1f), RoseRed, "CANCELLED")
    }

    Surface(
        shape = RoundedCornerShape(6.dp),
        color = bgColor
    ) {
        Text(
            text = label,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            color = textColor,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
        )
    }
}
