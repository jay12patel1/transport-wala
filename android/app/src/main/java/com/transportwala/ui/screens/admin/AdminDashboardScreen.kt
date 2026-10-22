package com.transportwala.ui.screens.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import com.transportwala.data.models.AdminSettings
import com.transportwala.ui.theme.*
import com.transportwala.ui.viewmodel.AdminViewModel

@Composable
fun AdminDashboardScreen(
    adminViewModel: AdminViewModel,
    onNavigateToSecurity: () -> Unit,
    onLogout: () -> Unit
) {
    val settings by adminViewModel.settings.collectAsState()
    var commissionInput by remember { mutableStateOf("${settings.commissionPercentage}") }
    var gstInput by remember { mutableStateOf("${settings.gstPercentage}") }

    LaunchedEffect(Unit) {
        adminViewModel.loadSettings()
    }

    LaunchedEffect(settings) {
        commissionInput = "${settings.commissionPercentage}"
        gstInput = "${settings.gstPercentage}"
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
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Super Admin Console",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White
                        )
                        Text(
                            text = "System Governance & Marketplace Settings",
                            fontSize = 12.sp,
                            color = OrangeAccent
                        )
                    }

                    Row {
                        IconButton(onClick = onNavigateToSecurity) {
                            Icon(Icons.Default.Security, contentDescription = "Security", tint = Color.White)
                        }
                        IconButton(onClick = onLogout) {
                            Icon(Icons.Default.Logout, contentDescription = "Logout", tint = RoseRed)
                        }
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
            // Stats Grid
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    AdminMetricCard(
                        title = "Platform Commission",
                        value = "${settings.commissionPercentage}%",
                        icon = Icons.Default.Percent,
                        modifier = Modifier.weight(1f)
                    )
                    AdminMetricCard(
                        title = "GST Rate",
                        value = "${settings.gstPercentage}%",
                        icon = Icons.Default.AccountBalance,
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // Commission & Fee Settings Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Text(
                            text = "Marketplace Commission Settings",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Controls commission collected on every completed booking",
                            fontSize = 12.sp,
                            color = TextMuted,
                            modifier = Modifier.padding(top = 2.dp, bottom = 14.dp)
                        )

                        OutlinedTextField(
                            value = commissionInput,
                            onValueChange = { commissionInput = it },
                            label = { Text("Admin Commission (%)") },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp)
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        OutlinedTextField(
                            value = gstInput,
                            onValueChange = { gstInput = it },
                            label = { Text("GST Percentage (%)") },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp)
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        Button(
                            onClick = {
                                val comm = commissionInput.toDoubleOrNull() ?: 5.0
                                val gst = gstInput.toDoubleOrNull() ?: 18.0
                                adminViewModel.updateSettings(
                                    settings.copy(
                                        commissionPercentage = comm,
                                        gstPercentage = gst
                                    )
                                )
                            },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = BluePrimary)
                        ) {
                            Text("Save Marketplace Settings", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // Quick Security Card
            item {
                Card(
                    onClick = onNavigateToSecurity,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(18.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.LockReset, contentDescription = null, tint = OrangeAccent)
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = "Admin Security & Credentials",
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary
                                )
                                Text(
                                    text = "Update Super Admin password & email via Supabase Auth",
                                    fontSize = 12.sp,
                                    color = TextMuted
                                )
                            }
                        }

                        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = TextMuted)
                    }
                }
            }
        }
    }
}

@Composable
fun AdminMetricCard(
    title: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        color = SurfaceWhite,
        shadowElevation = 2.dp
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Icon(imageVector = icon, contentDescription = null, tint = BluePrimary, modifier = Modifier.size(22.dp))
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = value, fontSize = 22.sp, fontWeight = FontWeight.Black, color = TextPrimary)
            Text(text = title, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextMuted)
        }
    }
}
