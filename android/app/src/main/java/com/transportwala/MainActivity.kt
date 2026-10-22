package com.transportwala

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.transportwala.ui.navigation.AppNavGraph
import com.transportwala.ui.theme.TransportWalaTheme
import com.transportwala.ui.viewmodel.*

class MainActivity : ComponentActivity() {

    private val authViewModel: AuthViewModel by viewModels()
    private val customerViewModel: CustomerViewModel by viewModels()
    private val transporterViewModel: TransporterViewModel by viewModels()
    private val driverViewModel: DriverViewModel by viewModels()
    private val adminViewModel: AdminViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            TransportWalaTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    AppNavGraph(
                        navController = navController,
                        authViewModel = authViewModel,
                        customerViewModel = customerViewModel,
                        transporterViewModel = transporterViewModel,
                        driverViewModel = driverViewModel,
                        adminViewModel = adminViewModel
                    )
                }
            }
        }
    }
}
