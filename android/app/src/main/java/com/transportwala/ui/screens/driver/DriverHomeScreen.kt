package com.transportwala.ui.screens.driver

import android.content.Intent
import android.net.Uri
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.transportwala.R
import com.transportwala.data.models.Booking
import com.transportwala.data.models.OrderStatus
import com.transportwala.services.LocationTrackingService
import com.transportwala.ui.theme.*
import com.transportwala.ui.viewmodel.DriverViewModel

@Composable
fun DriverHomeScreen(
    driverViewModel: DriverViewModel,
    driverId: String,
    driverName: String,
    onOpenChat: (String) -> Unit
) {
    val context = LocalContext.current
    val trips by driverViewModel.trips.collectAsState()

    LaunchedEffect(driverId) {
        driverViewModel.loadTrips(driverId)
    }

    Scaffold(
        containerColor = BackgroundSlate,
        topBar = {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(NavyDark)
                    .padding(horizontal = 20.dp, vertical = 18.dp)
            ) {
                Column {
                    Text(
                        text = "Driver Cockpit",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )
                    Text(
                        text = "Welcome, $driverName",
                        fontSize = 13.sp,
                        color = EmeraldGreen,
                        fontWeight = FontWeight.SemiBold
                    )
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
            item {
                Text(
                    text = "Assigned Commercial Trips",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
            }

            if (trips.isEmpty()) {
                item {
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        color = SurfaceWhite
                    ) {
                        Column(
                            modifier = Modifier.padding(32.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                Icons.Default.DirectionsCar,
                                contentDescription = null,
                                tint = TextMuted,
                                modifier = Modifier.size(50.dp)
                            )
                            Spacer(modifier = Modifier.height(10.dp))
                            Text(
                                text = "No Trips Assigned",
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            Text(
                                text = "When your fleet manager assigns you a trip, it will appear here.",
                                fontSize = 12.sp,
                                color = TextMuted,
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                                modifier = Modifier.padding(top = 4.dp)
                            )
                        }
                    }
                }
            } else {
                items(trips) { trip ->
                    DriverTripCard(
                        trip = trip,
                        onStartTrip = {
                            driverViewModel.startTrip(trip.id)
                            LocationTrackingService.startTracking(context, trip.id)
                        },
                        onCompleteTrip = {
                            driverViewModel.completeTrip(trip.id)
                            LocationTrackingService.stopTracking(context)
                        },
                        onOpenNavigation = {
                            val gmmIntentUri = Uri.parse("google.navigation:q=${Uri.encode(trip.deliveryLocation)}")
                            val mapIntent = Intent(Intent.ACTION_VIEW, gmmIntentUri).apply {
                                setPackage("com.google.android.apps.maps")
                            }
                            context.startActivity(mapIntent)
                        },
                        onCallCustomer = {
                            val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${trip.customerPhone}"))
                            context.startActivity(intent)
                        },
                        onChat = { onOpenChat(trip.id) }
                    )
                }
            }
        }
    }
}

@Composable
fun DriverTripCard(
    trip: Booking,
    onStartTrip: () -> Unit,
    onCompleteTrip: () -> Unit,
    onOpenNavigation: () -> Unit,
    onCallCustomer: () -> Unit,
    onChat: () -> Unit
) {
    val isTripActive = trip.status == OrderStatus.TRIP_STARTED || trip.status == OrderStatus.IN_TRANSIT

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            // Header with Order ID & Status
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = trip.id,
                    fontWeight = FontWeight.Black,
                    fontSize = 17.sp,
                    color = TextPrimary
                )

                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = if (isTripActive) EmeraldLight else BlueLight
                ) {
                    Text(
                        text = if (isTripActive) "ACTIVE TRIP" else trip.status.name,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        color = if (isTripActive) EmeraldGreen else BluePrimary,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Vehicle Specs
            Text(
                text = "${trip.vehicleType} • ${trip.vehicleNumber}",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = BluePrimary
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Pickup & Destination
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.TripOrigin, contentDescription = null, tint = EmeraldGreen, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(text = "Pickup: ${trip.pickupLocation}", fontSize = 13.sp, fontWeight = FontWeight.Medium, color = TextPrimary)
            }
            Spacer(modifier = Modifier.height(6.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.LocationOn, contentDescription = null, tint = OrangeAccent, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(text = "Drop: ${trip.deliveryLocation}", fontSize = 13.sp, fontWeight = FontWeight.Medium, color = TextPrimary)
            }

            Spacer(modifier = Modifier.height(14.dp))
            Divider(color = BorderLight)
            Spacer(modifier = Modifier.height(14.dp))

            // Customer Contact Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(text = "Customer", fontSize = 11.sp, color = TextMuted)
                    Text(text = "${trip.customerName} (${trip.customerPhone})", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                }

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    IconButton(
                        onClick = onCallCustomer,
                        modifier = Modifier.background(BlueLight, RoundedCornerShape(10.dp))
                    ) {
                        Icon(Icons.Default.Phone, contentDescription = "Call", tint = BluePrimary)
                    }

                    IconButton(
                        onClick = onChat,
                        modifier = Modifier.background(OrangeLight, RoundedCornerShape(10.dp))
                    ) {
                        Icon(Icons.Default.Chat, contentDescription = "Chat", tint = OrangeAccent)
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Primary Big Action Buttons for Driver Safety
            if (!isTripActive && trip.status != OrderStatus.COMPLETED) {
                Button(
                    onClick = onStartTrip,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldGreen)
                ) {
                    Icon(Icons.Default.PlayArrow, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = stringResource(R.string.start_trip),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            } else if (isTripActive) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Button(
                        onClick = onOpenNavigation,
                        modifier = Modifier
                            .weight(1f)
                            .height(52.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = BluePrimary)
                    ) {
                        Icon(Icons.Default.Navigation, contentDescription = null)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(text = stringResource(R.string.navigation), fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = onCompleteTrip,
                        modifier = Modifier
                            .weight(1f)
                            .height(52.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = OrangeAccent)
                    ) {
                        Icon(Icons.Default.CheckCircle, contentDescription = null)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(text = stringResource(R.string.complete_trip), fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
