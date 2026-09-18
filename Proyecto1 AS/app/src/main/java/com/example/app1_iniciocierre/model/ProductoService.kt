package com.example.app1_iniciocierre.model

import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PUT
import retrofit2.http.Path

interface ProductoApi {
    @GET("products")
    suspend fun obtenerProductos(): Response<List<Producto>>

    @GET("products/categories")
    suspend fun obtenerCategorias(): Response<List<String>>

    @GET("products/category/{category}")
    suspend fun obtenerProductosPorCategoria(
        @Path("category") categoria: String
    ): Response<List<Producto>>

    @GET("products/{id}")
    suspend fun obtenerProducto(@Path("id") id: Int): Response<Producto>

    @PUT("products/{id}")
    suspend fun actualizarProducto(
        @Path("id") id: Int,
        @Body producto: ActualizarProductoRequest
    ): Response<Producto>

    @DELETE("products/{id}")
    suspend fun eliminarProducto(@Path("id") id: Int): Response<Producto>
}

/** Acceso único a la API de productos; la UI no conoce Retrofit. */
class ProductoService(
    private val api: ProductoApi = Retrofit.Builder()
        .baseUrl("https://fakestoreapi.com/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(ProductoApi::class.java)
) {
    suspend fun obtenerProductos(): ResultadoProductos<List<Producto>> {
        return ejecutar { api.obtenerProductos() }
    }

    suspend fun obtenerCategorias(): ResultadoProductos<List<String>> {
        return ejecutar { api.obtenerCategorias() }
    }

    suspend fun obtenerProductosPorCategoria(categoria: String): ResultadoProductos<List<Producto>> {
        return ejecutar { api.obtenerProductosPorCategoria(categoria) }
    }

    suspend fun obtenerProducto(id: Int): ResultadoProductos<Producto> {
        return ejecutar { api.obtenerProducto(id) }
    }

    suspend fun actualizarProducto(
        id: Int,
        producto: ActualizarProductoRequest
    ): ResultadoProductos<Producto> {
        return ejecutar { api.actualizarProducto(id, producto) }
    }

    suspend fun eliminarProducto(id: Int): ResultadoProductos<Unit> {
        return runCatching { api.eliminarProducto(id) }
            .getOrNull()
            ?.takeIf { it.isSuccessful }
            ?.let { ResultadoProductos.Exito(Unit) }
            ?: ResultadoProductos.Error
    }

    private suspend fun <T> ejecutar(
        llamada: suspend () -> Response<T>
    ): ResultadoProductos<T> {
        return runCatching { llamada() }
            .getOrNull()
            ?.takeIf { it.isSuccessful }
            ?.body()
            ?.let { ResultadoProductos.Exito(it) }
            ?: ResultadoProductos.Error
    }
}
