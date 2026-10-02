package com.example.app1_iniciocierre.ui.theme

// ================================================================
// Type.kt — MAPA DEL ARCHIVO
// ================================================================
// Propósito: Define estilos de texto reutilizables por las pantallas.
// Secciones: 1. IMPORTACIONES, Set of Material typography styles to start with, 2. ESTILOS DE TEXTO


// ================================================================
// 1. IMPORTACIONES
// ================================================================
import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

// Set of Material typography styles to start with
// ================================================================
// 2. ESTILOS DE TEXTO
// ================================================================
val Typography = Typography(
    bodyLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp,
        letterSpacing = 0.5.sp
    )
    /* Other default text styles to override
    titleLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 22.sp,
        lineHeight = 28.sp,
        letterSpacing = 0.sp
    ),
    labelSmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 11.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.5.sp
    )
    */
)