package com.example.app1_iniciocierre.view

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.app1_iniciocierre.model.Usuario


@Composable
fun InicioView(
    usuario: Usuario,
    cerrarSesion: () -> Unit
) {

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp)
    ) {

        Button(
            onClick = {
                cerrarSesion()
            }
        ) {

            Text("Cerrar sesión")
        }


        Box(
            modifier = Modifier.fillMaxSize(),

            contentAlignment =
                Alignment.Center
        ) {

            Column(
                horizontalAlignment =
                    Alignment.CenterHorizontally
            ) {

                Text(
                    text = "Bienvenido a la app",
                    style =
                        MaterialTheme.typography.headlineMedium
                )


                Spacer(
                    modifier = Modifier.height(20.dp)
                )


                Text(
                    text = "Usuario: ${usuario.username}"
                )


                Text(
                    text = "ID: ${usuario.id}"
                )


                Text(
                    text = "Rol: ${usuario.rol.etiqueta}"
                )
            }
        }
    }
}
