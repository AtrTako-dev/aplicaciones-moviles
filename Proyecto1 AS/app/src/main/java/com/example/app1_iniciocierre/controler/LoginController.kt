package com.example.app1_iniciocierre.controller

// ================================================================
// LoginController.kt — US01 — Login y asignación local de perfiles
// ================================================================
// Propósito: US01 valida credenciales/conectividad, autentica y asigna el rol local.
// Secciones: 1. IMPORTACIONES, 2. RESULTADOS POSIBLES DEL INICIO DE SESIÓN, 3. CONTROLADOR Y DEPENDENCIAS, 4. FUNCIÓN PRINCIPAL — validar campos, conexión y credenciales, VALIDACIÓN LOCAL — no consultar si hay campos vacíos, VALIDACIÓN DE RED, AUTENTICACIÓN Y CONVERSIÓN DE LA RESPUESTA


// ================================================================
// 1. IMPORTACIONES
// ================================================================
import com.example.app1_iniciocierre.model.NetworkMonitor
import com.example.app1_iniciocierre.model.ResultadoApiLogin
import com.example.app1_iniciocierre.model.Sesion
import com.example.app1_iniciocierre.model.UsuarioService
import com.example.app1_iniciocierre.model.Usuario
import com.example.app1_iniciocierre.model.rolParaUsuario


// ================================================================
// 2. RESULTADOS POSIBLES DEL INICIO DE SESIÓN
// ================================================================
sealed class ResultadoLogin {

    data class Exito(
        val sesion: Sesion
    ) : ResultadoLogin()

    data object CredencialesInvalidas : ResultadoLogin()

    data object CamposVacios : ResultadoLogin()

    data object ErrorConexion : ResultadoLogin()

    data object SinConexion : ResultadoLogin()
}


// ================================================================
// 3. CONTROLADOR Y DEPENDENCIAS
// ================================================================
class LoginController(
    private val usuarioService: UsuarioService,
    private val networkMonitor: NetworkMonitor
) {

    // ================================================================
    // 4. FUNCIÓN PRINCIPAL — validar campos, conexión y credenciales
    // ================================================================
    suspend fun iniciarSesion(
        username: String,
        password: String
    ): ResultadoLogin {

        // ================================================================
        // VALIDACIÓN LOCAL — no consultar si hay campos vacíos
        // ================================================================
        if (username.isBlank() || password.isBlank()) {

            return ResultadoLogin.CamposVacios
        }

        // ================================================================
        // VALIDACIÓN DE RED
        // ================================================================
        if (!networkMonitor.hayConexion()) {
            return ResultadoLogin.SinConexion
        }


        // ================================================================
        // AUTENTICACIÓN Y CONVERSIÓN DE LA RESPUESTA
        // ================================================================
        return try {

            when (val resultado = usuarioService.autenticar(username, password)) {
                ResultadoApiLogin.CredencialesInvalidas -> ResultadoLogin.CredencialesInvalidas
                ResultadoApiLogin.ErrorRed -> ResultadoLogin.ErrorConexion
                is ResultadoApiLogin.Exito -> {
                    val usuario = Usuario(
                        id = resultado.usuario.id,
                        username = resultado.usuario.username,
                        rol = rolParaUsuario(resultado.usuario.id)
                    )
                    ResultadoLogin.Exito(Sesion(resultado.token, usuario))
                }
            }

        } catch (e: Exception) {

            ResultadoLogin.ErrorConexion
        }
    }
}
