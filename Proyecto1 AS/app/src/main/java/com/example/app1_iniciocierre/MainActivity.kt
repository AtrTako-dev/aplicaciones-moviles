package com.example.app1_iniciocierre

// ============================================================
// 1. IMPORTACIONES — Android, Compose, servicios y pantallas
// ============================================================
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


// ============================================================
// 2. ENTRADA DE ANDROID — prepara la aplicación Compose
// ============================================================
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


// ============================================================
// 3. US01–US08 — navegación y ciclo de sesión compartidos
// Esta sección conecta historias; la lógica específica está en pantallas y servicios.
// NAVEGACIÓN — conserva sesión y el destino actual
// ============================================================
@Composable
fun App(activity: ComponentActivity) {

    // DATOS Y ESTADO — sesión, producto seleccionado y aviso del catálogo
    val sessionStore = remember { SessionStore(activity.applicationContext) }

    var sesionActual by remember {
        mutableStateOf(sessionStore.obtener())
    }
    var productoSeleccionado by remember { mutableStateOf<Int?>(null) }
    var mensajeCatalogo by remember { mutableStateOf<String?>(null) }


    // DEPENDENCIAS — controlador de login y servicios HTTP
    val controller = remember {

        LoginController(
            UsuarioService(),
            NetworkMonitor(activity.applicationContext)
        )
    }
    val productoService = remember { ProductoService() }


    // PANTALLAS — login, catálogo o detalle
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
            rol = sesionActual!!.usuario.rol,
            servicio = productoService,
            abrirDetalle = { productoSeleccionado = it },
            mensajeInicial = mensajeCatalogo,
            alMostrarMensaje = { mensajeCatalogo = null },
            cerrarSesion = {
                sessionStore.limpiar()
                mensajeCatalogo = null
                productoSeleccionado = null
                sesionActual = null
            }
        )
    } else {
        DetalleProductoView(
            productoId = productoSeleccionado!!,
            rol = sesionActual!!.usuario.rol,
            servicio = productoService,
            volverCatalogo = { mensaje ->
                mensajeCatalogo = mensaje
                productoSeleccionado = null
            }
        )
    }
}
