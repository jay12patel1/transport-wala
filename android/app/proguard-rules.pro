# Add project specific ProGuard rules here.
-keepattributes *Annotation*
-keepclassmembers class * {
    @kotlinx.serialization.SerialName <fields>;
}
-keep class io.github.jan.supabase.** { *; }
-keep class io.ktor.** { *; }
