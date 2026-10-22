package com.transportwala.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = BluePrimary,
    onPrimary = SurfaceWhite,
    primaryContainer = BlueLight,
    onPrimaryContainer = BlueDark,
    secondary = OrangeAccent,
    onSecondary = SurfaceWhite,
    secondaryContainer = OrangeLight,
    onSecondaryContainer = OrangeAccent,
    background = BackgroundSlate,
    surface = SurfaceWhite,
    onBackground = TextPrimary,
    onSurface = TextPrimary,
    outline = BorderLight
)

private val DarkColorScheme = darkColorScheme(
    primary = BluePrimary,
    onPrimary = SurfaceWhite,
    background = NavyDark,
    surface = NavySurface,
    onBackground = SurfaceWhite,
    onSurface = SurfaceWhite,
    outline = BorderLight
)

@Composable
fun TransportWalaTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = NavyDark.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
