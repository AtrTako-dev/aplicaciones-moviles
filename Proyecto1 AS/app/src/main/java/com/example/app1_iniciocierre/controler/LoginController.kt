package com.example.app1_iniciocierre.controller

import com.example.app1_iniciocierre.model.NetworkMonitor
import com.example.app1_iniciocierre.model.ResultadoApiLogin
import com.example.app1_iniciocierre.model.Sesion
import com.example.app1_iniciocierre.model.UsuarioService
import com.example.app1_iniciocierre.model.Usuario
import com.example.app1_iniciocierre.model.rolParaUsuario


sealed class ResultadoLogin {

    data class Exito(
        val sesion: Sesion
    ) : ResultadoLogin()

    data object CredencialesInvalidas : ResultadoLogin()

    data object CamposVacios : ResultadoLogin()

    data object ErrorConexion : ResultadoLogin()

    data object SinConexion : ResultadoLogin()
}


class LoginController(
    private val usuarioService: UsuarioService,
    private val networkMonitor: NetworkMonitor
) {

    suspend fun iniciarSesion(
        username: String,
        password: String
    ): ResultadoLogin {

        if (username.isBlank() || password.isBlank()) {

            return ResultadoLogin.CamposVacios
        }

        if (!networkMonitor.hayConexion()) {
            return ResultadoLogin.SinConexion
        }


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
