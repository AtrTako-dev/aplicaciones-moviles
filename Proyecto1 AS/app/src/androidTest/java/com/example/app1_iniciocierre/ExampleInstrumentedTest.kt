package com.example.app1_iniciocierre

// ================================================================
// ExampleInstrumentedTest.kt — MAPA DEL ARCHIVO
// ================================================================
// Propósito: PRUEBA ANDROID — verifica el contexto instalado en dispositivo
// Secciones: 1. IMPORTACIONES, 2. PROPÓSITO, 3. EJECUTOR ANDROID, 4. CASO — comprobar nombre de paquete


// ================================================================
// 1. IMPORTACIONES
// ================================================================
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.ext.junit.runners.AndroidJUnit4

import org.junit.Test
import org.junit.runner.RunWith

import org.junit.Assert.*

// ================================================================
// 2. PROPÓSITO
// ================================================================
/**
 * Instrumented test, which will execute on an Android device.
 *
 * See [testing documentation](http://d.android.com/tools/testing).
 */
// ================================================================
// 3. EJECUTOR ANDROID
// ================================================================
@RunWith(AndroidJUnit4::class)
class ExampleInstrumentedTest {
// ================================================================
// 4. CASO — comprobar nombre de paquete
// ================================================================
    @Test
    fun useAppContext() {
        // Context of the app under test.
        val appContext = InstrumentationRegistry.getInstrumentation().targetContext
        assertEquals("com.example.app1_iniciocierre", appContext.packageName)
    }
}