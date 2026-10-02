package com.example.app1_iniciocierre.model

// ================================================================
// NetworkMonitor.kt — US01 — detección de conectividad antes del login
// ================================================================
// Propósito: Comprueba si Android informa una conexión a Internet activa y validada.
// Secciones: 1. IMPORTACIONES, 2. CLASE Y DEPENDENCIA DEL SISTEMA, 3. FUNCIÓN — obtener y comprobar la red activa


// ================================================================
// 1. IMPORTACIONES
// ================================================================
import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities

// ================================================================
// 2. CLASE Y DEPENDENCIA DEL SISTEMA
// ================================================================
class NetworkMonitor(context: Context) {
    private val connectivityManager = context.getSystemService(ConnectivityManager::class.java)

    // ================================================================
    // 3. FUNCIÓN — obtener y comprobar la red activa
    // ================================================================
    fun hayConexion(): Boolean {
        val red = connectivityManager.activeNetwork ?: return false
        val capacidades = connectivityManager.getNetworkCapabilities(red) ?: return false
        return capacidades.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) &&
            capacidades.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
    }
}
