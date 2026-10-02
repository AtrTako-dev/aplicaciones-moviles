package com.example.app1_iniciocierre.model

import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

// ============================================================
// US03–US08 — CONTRATO Y SERVICIO COMPARTIDOS
// US03 catálogo, US04 filtro, US05 detalle, US06 POST, US07 PUT y US08 DELETE.
// 1. CONTRATO HTTP — rutas y métodos disponibles en la API
// ============================================================
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

    @POST("products")
    suspend fun crearProducto(@Body producto: CrearProductoRequest): Response<Producto>

    @PUT("products/{id}")
    suspend fun actualizarProducto(
        @Path("id") id: Int,
        @Body producto: ActualizarProductoRequest
    ): Response<Producto>

    @DELETE("products/{id}")
    suspend fun eliminarProducto(@Path("id") id: Int): Response<Producto>
}

// ============================================================
// 2. SERVICIO — validaciones de permisos y acceso a la API
// ============================================================
/** Acceso único a la API de productos; las pantallas no conocen Retrofit. */
class ProductoService(
    private val api: ProductoApi = Retrofit.Builder()
        .baseUrl("https://fakestoreapi.com/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(ProductoApi::class.java)
) {
    // ------------------------------------------------------------
    // 3. CONSULTAS — catálogo, categorías y detalle
    // ------------------------------------------------------------
    suspend fun obtenerProductos(): ResultadoProductos<List<Producto>> =
        ejecutar { api.obtenerProductos() }

    suspend fun obtenerCategorias(): ResultadoProductos<List<String>> =
        ejecutar { api.obtenerCategorias() }

    suspend fun obtenerProductosPorCategoria(categoria: String): ResultadoProductos<List<Producto>> =
        ejecutar { api.obtenerProductosPorCategoria(categoria) }

    suspend fun obtenerProducto(id: Int): ResultadoProductos<Producto> =
        ejecutar { api.obtenerProducto(id) }

    // ------------------------------------------------------------
    // 4. US06 — CREAR producto (POST), solo para administradores
    // ------------------------------------------------------------
    suspend fun crearProducto(
        rol: Rol,
        producto: CrearProductoRequest
    ): ResultadoProductos<Producto> {
        if (rol != Rol.ADMINISTRADOR) return ResultadoProductos.Error
        return ejecutar { api.crearProducto(producto) }
    }

    // ------------------------------------------------------------
    // 5. US07 — EDITAR producto (PUT), solo para administradores
    // ------------------------------------------------------------
    suspend fun actualizarProducto(
        rol: Rol,
        id: Int,
        producto: ActualizarProductoRequest
    ): ResultadoProductos<Producto> {
        if (rol != Rol.ADMINISTRADOR) return ResultadoProductos.Error
        return ejecutar { api.actualizarProducto(id, producto) }
    }

    // ------------------------------------------------------------
    // 6. US08 — ELIMINAR producto (DELETE), solo para administradores
    // ------------------------------------------------------------
    suspend fun eliminarProducto(rol: Rol, id: Int): ResultadoProductos<Unit> {
        if (rol != Rol.ADMINISTRADOR) return ResultadoProductos.Error
        return runCatching { api.eliminarProducto(id) }
            .getOrNull()
            ?.takeIf { it.isSuccessful }
            ?.let { ResultadoProductos.Exito(Unit) }
            ?: ResultadoProductos.Error
    }

    // ------------------------------------------------------------
    // 7. FUNCIÓN AUXILIAR — convertir respuesta HTTP en resultado
    // ------------------------------------------------------------
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
