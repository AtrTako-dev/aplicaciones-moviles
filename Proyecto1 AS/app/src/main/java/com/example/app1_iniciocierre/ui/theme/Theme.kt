package com.example.app1_iniciocierre.ui.theme

// ================================================================
// Theme.kt — MAPA DEL ARCHIVO
// ================================================================
// Propósito: Configura paleta, colores dinámicos y tipografía del tema Compose.
// Secciones: 1. IMPORTACIONES, 2. PALETA OSCURA, 3. PALETA CLARA, 4. FUNCIÓN — elegir y aplicar tema, SELECCIÓN DEL ESQUEMA, APLICAR COLORES Y TIPOGRAFÍA


// ================================================================
// 1. IMPORTACIONES
// ================================================================
import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

// ================================================================
// 2. PALETA OSCURA
// ================================================================
private val DarkColorScheme = darkColorScheme(
    primary = Purple80,
    secondary = PurpleGrey80,
    tertiary = Pink80
)

// ================================================================
// 3. PALETA CLARA
// ================================================================
private val LightColorScheme = lightColorScheme(
    primary = Purple40,
    secondary = PurpleGrey40,
    tertiary = Pink40

    /* Other default colors to override
    background = Color(0xFFFFFBFE),
    surface = Color(0xFFFFFBFE),
    onPrimary = Color.White,
    onSecondary = Color.White,
    onTertiary = Color.White,
    onBackground = Color(0xFF1C1B1F),
    onSurface = Color(0xFF1C1B1F),
    */
)

// ================================================================
// 4. FUNCIÓN — elegir y aplicar tema
// ================================================================
@Composable
fun APP1_INICIOCIERRETheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    // Dynamic color is available on Android 12+
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    // ================================================================
    // SELECCIÓN DEL ESQUEMA
    // ================================================================
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }

        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    // ================================================================
    // APLICAR COLORES Y TIPOGRAFÍA
    // ================================================================
    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}