package com.example.app1_iniciocierre.model

/**
 * Modelo de un producto tal como lo entrega Fake Store API.
 * La propiedad rating es opcional porque el catálogo no la necesita para
 * renderizarse, pero conservarla permite mapear la respuesta completa.
 */
data class Producto(
    val id: Int,
    val title: String,
    val price: Double,
    val description: String,
    val category: String,
    val image: String,
    val rating: Calificacion? = null
)

data class Calificacion(
    val rate: Double = 0.0,
    val count: Int = 0
)

data class ActualizarProductoRequest(
    val title: String,
    val price: Double,
    val description: String,
    val category: String,
    val image: String
)

sealed interface ResultadoProductos<out T> {
    data class Exito<T>(val datos: T) : ResultadoProductos<T>
    data object Error : ResultadoProductos<Nothing>
}
