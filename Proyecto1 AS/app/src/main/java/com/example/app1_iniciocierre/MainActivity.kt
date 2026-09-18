package com.example.app1_iniciocierre

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.example.app1_iniciocierre.controller.LoginController
import com.example.app1_iniciocierre.model.NetworkMonitor
import com.example.app1_iniciocierre.model.ProductoService
import com.example.app1_iniciocierre.model.SessionStore
import com.example.app1_iniciocierre.model.UsuarioService
import com.example.app1_iniciocierre.view.CatalogoView
import com.example.app1_iniciocierre.view.DetalleProductoView
import com.example.app1_iniciocierre.view.LoginView


class MainActivity : ComponentActivity() {

    override fun onCreate(
        savedInstanceState: Bundle?
    ) {

        super.onCreate(savedInstanceState)


        setContent {

            MaterialTheme {

                App(this)
            }
        }
    }
}


@Composable
fun App(activity: ComponentActivity) {

    val sessionStore = remember { SessionStore(activity.applicationContext) }

    var sesionActual by remember {
        mutableStateOf(sessionStore.obtener())
    }
    var productoSeleccionado by remember { mutableStateOf<Int?>(null) }


    val controller = remember {

        LoginController(
            UsuarioService(),
            NetworkMonitor(activity.applicationContext)
        )
    }
    val productoService = remember { ProductoService() }


    if (sesionActual == null) {

        LoginView(

            controller = controller,

            iniciarSesion = { sesion ->

                sessionStore.guardar(sesion)
                sesionActual = sesion
            }
        )

    } else if (productoSeleccionado == null) {
        CatalogoView(
            usuario = sesionActual!!.usuario.username,
            servicio = productoService,
            abrirDetalle = { productoSeleccionado = it },
            cerrarSesion = {
                sessionStore.limpiar()
                productoSeleccionado = null
                sesionActual = null
            }
        )
    } else {
        DetalleProductoView(
            productoId = productoSeleccionado!!,
            rol = sesionActual!!.usuario.rol,
            servicio = productoService,
            volverCatalogo = { productoSeleccionado = null }
        )
    }
}
