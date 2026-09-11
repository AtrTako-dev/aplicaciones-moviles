package com.example.app1_iniciocierre.view

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.example.app1_iniciocierre.controller.LoginController
import com.example.app1_iniciocierre.controller.ResultadoLogin
import com.example.app1_iniciocierre.model.Sesion
import kotlinx.coroutines.launch


@Composable
fun LoginView(
    controller: LoginController,
    iniciarSesion: (Sesion) -> Unit
) {

    // Login is the root of the unauthenticated flow; protected content is never restored.
    BackHandler { }

    var username by remember {
        mutableStateOf("")
    }

    var password by remember {
        mutableStateOf("")
    }

    var mensaje by remember {
        mutableStateOf("")
    }

    var cargando by remember {
        mutableStateOf(false)
    }


    val scope = rememberCoroutineScope()


    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(30.dp),

        verticalArrangement = Arrangement.Center,

        horizontalAlignment = Alignment.CenterHorizontally
    ) {

        Text(
            text = "Iniciar sesión",
            style = MaterialTheme.typography.headlineMedium
        )


        Spacer(
            modifier = Modifier.height(20.dp)
        )


        OutlinedTextField(
            value = username,

            onValueChange = {
                username = it
            },

            label = {
                Text("Usuario")
            },

            enabled = !cargando
        )


        Spacer(
            modifier = Modifier.height(10.dp)
        )


        OutlinedTextField(
            value = password,

            onValueChange = {
                password = it
            },

            label = {
                Text("Contraseña")
            },

            visualTransformation =
                PasswordVisualTransformation(),

            enabled = !cargando
        )


        Spacer(
            modifier = Modifier.height(20.dp)
        )


        Button(

            enabled = !cargando,

            onClick = {

                scope.launch {

                    cargando = true
                    mensaje = ""


                    when (
                        val resultado =
                            controller.iniciarSesion(
                                username,
                                password
                            )
                    ) {

                        is ResultadoLogin.Exito -> {

                            iniciarSesion(
                                resultado.sesion
                            )
                        }


                        ResultadoLogin.CredencialesInvalidas -> {

                            mensaje = "Usuario o contraseña inválidos"
                        }


                        ResultadoLogin.CamposVacios -> {

                            mensaje =
                                "Ingresa usuario y contraseña"
                        }


                        ResultadoLogin.ErrorConexion -> {

                            mensaje =
                                "Error al conectar con la API"
                        }

                        ResultadoLogin.SinConexion -> {
                            mensaje = "Sin conexión a internet"
                        }
                    }


                    cargando = false
                }
            }
        ) {

            if (cargando) {

                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    strokeWidth = 2.dp
                )

            } else {

                Text("Iniciar sesión")
            }
        }


        Spacer(
            modifier = Modifier.height(15.dp)
        )


        if (mensaje.isNotEmpty()) {
            Surface(color = MaterialTheme.colorScheme.errorContainer) {
                Text(
                    text = mensaje,
                    color = MaterialTheme.colorScheme.onErrorContainer,
                    modifier = Modifier.padding(12.dp)
                )
            }
        }
    }
}
