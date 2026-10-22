package com.transportwala

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.transportwala.data.remote.SupabaseClientProvider

class TransportWalaApp : Application() {

    companion object {
        const val CHANNEL_ID = "transport_wala_notifications"
        const val CHANNEL_NAME = "Transport Wala Notifications"
        const val TRACKING_CHANNEL_ID = "transport_wala_tracking"
        const val TRACKING_CHANNEL_NAME = "Transport Wala Live Tracking"
        
        lateinit var instance: TransportWalaApp
            private set
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
        
        // Initialize Supabase Client
        SupabaseClientProvider.initialize(this)
        
        // Create Notification Channels for Android 8.0+
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = getSystemService(NotificationManager::class.java)

            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Trips, Bookings, Chat and Platform Updates"
                enableVibration(true)
            }

            val trackingChannel = NotificationChannel(
                TRACKING_CHANNEL_ID,
                TRACKING_CHANNEL_NAME,
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Foreground GPS Location Tracking for Active Trips"
            }

            notificationManager.createNotificationChannel(channel)
            notificationManager.createNotificationChannel(trackingChannel)
        }
    }
}
