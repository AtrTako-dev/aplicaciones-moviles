package com.example.app1_iniciocierre.model

// ================================================================
// UsuarioService.kt — US01 — POST /auth/login y consulta de perfil
// ================================================================
// Propósito: Define las rutas HTTP y autentica al usuario con Fake Store API.
// Secciones: 1. IMPORTACIONES, 2. DATOS — solicitud y respuestas de login, 3. CONTRATO HTTP — POST login y GET usuarios, 4. RESULTADOS POSIBLES DE LA API, 5. SERVICIO Y CONFIGURACIÓN DE RETROFIT, 6. FUNCIÓN — enviar credenciales y resolver usuario


// ================================================================
// 1. IMPORTACIONES
// ================================================================
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

// ================================================================
// 2. DATOS — solicitud y respuestas de login
// ================================================================
data class LoginRequest(val username: String, val password: String)

data class LoginResponse(val token: String)

data class UsuarioApi(val id: Int, val username: String)

// ================================================================
// 3. CONTRATO HTTP — POST login y GET usuarios
// ================================================================
interface FakeStoreApi {
    @POST("auth/login")
    suspend fun iniciarSesion(@Body credenciales: LoginRequest): Response<LoginResponse>

    @GET("users")
    suspend fun obtenerUsuarios(): Response<List<UsuarioApi>>
}

// ================================================================
// 4. RESULTADOS POSIBLES DE LA API
// ================================================================
sealed class ResultadoApiLogin {
    data class Exito(val token: String, val usuario: UsuarioApi) : ResultadoApiLogin()
    data object CredencialesInvalidas : ResultadoApiLogin()
    data object ErrorRed : ResultadoApiLogin()
}

// ================================================================
// 5. SERVICIO Y CONFIGURACIÓN DE RETROFIT
// ================================================================
class UsuarioService {
    private val api: FakeStoreApi = Retrofit.Builder()
        .baseUrl("https://fakestoreapi.com/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(FakeStoreApi::class.java)

    // ================================================================
    // 6. FUNCIÓN — enviar credenciales y resolver usuario
    // ================================================================
    suspend fun autenticar(username: String, password: String): ResultadoApiLogin {
        val respuestaLogin = api.iniciarSesion(LoginRequest(username, password))
        if (respuestaLogin.code() == 401) return ResultadoApiLogin.CredencialesInvalidas
        if (!respuestaLogin.isSuccessful) return ResultadoApiLogin.ErrorRed

        val token = respuestaLogin.body()?.token ?: return ResultadoApiLogin.ErrorRed
        val respuestaUsuarios = api.obtenerUsuarios()
        if (!respuestaUsuarios.isSuccessful) return ResultadoApiLogin.ErrorRed

        val usuario = respuestaUsuarios.body()?.firstOrNull { it.username == username }
            ?: return ResultadoApiLogin.ErrorRed
        return ResultadoApiLogin.Exito(token, usuario)
    }
}
