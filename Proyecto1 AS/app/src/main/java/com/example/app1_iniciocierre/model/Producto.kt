package com.example.app1_iniciocierre.model

/**
 * Modelo de un producto tal como lo entrega Fake Store API.
 * La propiedad rating es opcional porque el catálogo no la necesita para
 * renderizarse, pero conservarla permite mapear la respuesta completa.
 */
// ============================================================
// US03–US08 — MODELOS COMPARTIDOS DE PRODUCTOS
// El modelo de lectura alimenta catálogo/detalle; los DTO de escritura son de US06/US07.
// 1. MODELO — producto recibido de Fake Store API
// ============================================================
data class Producto(
    val id: Int,
    val title: String,
    val price: Double,
    val description: String,
    val category: String,
    val image: String,
    val rating: Calificacion? = null
)

// ============================================================
// 2. MODELO AUXILIAR — calificación opcional del producto
// ============================================================
data class Calificacion(
    val rate: Double = 0.0,
    val count: Int = 0
)

// ============================================================
// 3. US06 — datos enviados al crear un producto (POST)
// ============================================================
/** Datos requeridos para crear un producto en Fake Store API. */
data class CrearProductoRequest(
    val title: String,
    val price: Double,
    val description: String,
    val category: String,
    val image: String
)

// ============================================================
// 4. US07 — datos enviados al actualizar un producto (PUT)
// ============================================================
data class ActualizarProductoRequest(
    val title: String,
    val price: Double,
    val description: String,
    val category: String,
    val image: String
)

// ============================================================
// 5. RESULTADO — respuesta exitosa con datos o error HTTP
// ============================================================
sealed interface ResultadoProductos<out T> {
    data class Exito<T>(val datos: T) : ResultadoProductos<T>
    data object Error : ResultadoProductos<Nothing>
}
