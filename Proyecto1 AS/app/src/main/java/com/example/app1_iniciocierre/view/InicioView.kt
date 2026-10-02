package com.example.app1_iniciocierre.view

// ================================================================
// InicioView.kt — MAPA DEL ARCHIVO
// ================================================================
// Propósito: Pantalla de bienvenida heredada; MainActivity usa el catálogo tras iniciar sesión.
// Secciones: 1. IMPORTACIONES, 2. PANTALLA Y DATOS RECIBIDOS, 3. INTERFAZ — contenido de bienvenida, 4. BOTÓN — cerrar sesión, 5. TEXTOS — nombre, ID y rol


// ================================================================
// 1. IMPORTACIONES
// ================================================================
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


// ================================================================
// 2. PANTALLA Y DATOS RECIBIDOS
// ================================================================
@Composable
fun InicioView(
    usuario: Usuario,
    cerrarSesion: () -> Unit
) {

    // ================================================================
    // 3. INTERFAZ — contenido de bienvenida
    // ================================================================
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp)
    ) {

        // ================================================================
        // 4. BOTÓN — cerrar sesión
        // ================================================================
        Button(
            onClick = {
                cerrarSesion()
            }
        ) {

            Text("Cerrar sesión")
        }


        // ================================================================
        // 5. TEXTOS — nombre, ID y rol
        // ================================================================
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
