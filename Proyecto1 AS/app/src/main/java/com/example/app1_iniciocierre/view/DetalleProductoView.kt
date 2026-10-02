package com.example.app1_iniciocierre.view

// ============================================================
// 1. IMPORTACIONES
// ============================================================
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.example.app1_iniciocierre.model.ActualizarProductoRequest
import com.example.app1_iniciocierre.model.Producto
import com.example.app1_iniciocierre.model.ProductoService
import com.example.app1_iniciocierre.model.ResultadoProductos
import com.example.app1_iniciocierre.model.Rol
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

// ============================================================
// US05 — DETALLE: GET por ID y vista de consulta para todos los roles.
// US07 — edición precargada solo para Administrador.
// US08 — confirmación y DELETE solo para Administrador.
// Las secciones numeradas permiten ubicar cada historia con Ctrl+F.
// ============================================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DetalleProductoView(
    productoId: Int,
    rol: Rol,
    servicio: ProductoService,
    volverCatalogo: (String?) -> Unit
) {
    // ------------------------------------------------------------
    // 3. DATOS Y ESTADO — producto, formulario y diálogos
    // ------------------------------------------------------------
    var producto by remember { mutableStateOf<Producto?>(null) }
    var cargando by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf(false) }
    var reintento by remember { mutableIntStateOf(0) }
    var mensaje by remember { mutableStateOf<String?>(null) }
    var editando by remember { mutableStateOf(false) }
    var confirmarEliminacion by remember { mutableStateOf(false) }
    var enviando by remember { mutableStateOf(false) }
    var tituloEditado by remember { mutableStateOf("") }
    var precioEditado by remember { mutableStateOf("") }
    var descripcionEditada by remember { mutableStateOf("") }
    var categoriaEditada by remember { mutableStateOf("") }
    var erroresFormulario by remember { mutableStateOf<Map<String, String>>(emptyMap()) }
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    // ------------------------------------------------------------
    // US05 — CONSULTA /products/{id}: carga, error y retorno al catálogo.
    // ------------------------------------------------------------
    LaunchedEffect(productoId, reintento) {
        cargando = true
        error = false
        producto = null
        when (val resultado = servicio.obtenerProducto(productoId)) {
            is ResultadoProductos.Exito -> producto = resultado.datos
            ResultadoProductos.Error -> error = true
        }
        cargando = false
    }

    LaunchedEffect(error) {
        if (error) {
            delay(1800)
            volverCatalogo(null)
        }
    }

    // ------------------------------------------------------------
    // 5. DISTRIBUCIÓN — barra superior y contenido según el estado
    // ------------------------------------------------------------
    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = { Text("Detalle del producto") },
                navigationIcon = {
                    TextButton(onClick = { volverCatalogo(null) }) { Text("← Volver") }
                }
            )
        }
    ) { padding ->
        when {
            cargando -> Box(
                modifier = Modifier.fillMaxSize().padding(padding),
                contentAlignment = Alignment.Center
            ) { CircularProgressIndicator() }

            error -> ErrorDetailContent(
                modifier = Modifier.padding(padding),
                onRetry = { error = false; reintento++ },
                volverCatalogo = { volverCatalogo(null) }
            )

            producto != null -> DetalleContent(
                producto = producto!!,
                rol = rol,
                mensaje = mensaje,
                modifier = Modifier.padding(padding),
                onEditar = {
                    tituloEditado = producto!!.title
                    precioEditado = producto!!.price.toString()
                    descripcionEditada = producto!!.description
                    categoriaEditada = producto!!.category
                    erroresFormulario = emptyMap()
                    mensaje = null
                    editando = true
                },
                onEliminar = { confirmarEliminacion = true }
            )
        }
    }

    // ------------------------------------------------------------
    // 6. US07 — FORMULARIO DE EDICIÓN CON CAMPOS PRECARGADOS
    // ------------------------------------------------------------
    if (editando && producto != null) {
        AlertDialog(
            onDismissRequest = { if (!enviando) editando = false },
            title = { Text("Editar producto") },
            text = {
                Column(
                    modifier = Modifier.verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    CampoEdicion("Título", tituloEditado, { tituloEditado = it }, erroresFormulario["titulo"], !enviando)
                    CampoEdicion("Precio", precioEditado, { precioEditado = it }, erroresFormulario["precio"], !enviando)
                    CampoEdicion(
                        "Descripción", descripcionEditada, { descripcionEditada = it },
                        erroresFormulario["descripcion"], !enviando, multilinea = true
                    )
                    CampoEdicion("Categoría", categoriaEditada, { categoriaEditada = it }, erroresFormulario["categoria"], !enviando)
                }
            },
            confirmButton = {
                TextButton(
                    enabled = !enviando,
                    onClick = {
                        val precio = precioEditado.replace(',', '.').toDoubleOrNull()
                        erroresFormulario = buildMap {
                            if (tituloEditado.isBlank()) put("titulo", "El título es obligatorio")
                            if (precio == null || !precio.isFinite() || precio < 0) {
                                put("precio", "Ingresa un precio numérico válido")
                            }
                            if (descripcionEditada.isBlank()) put("descripcion", "La descripción es obligatoria")
                            if (categoriaEditada.isBlank()) put("categoria", "La categoría es obligatoria")
                        }
                        if (erroresFormulario.isNotEmpty()) return@TextButton

                        enviando = true
                        scope.launch {
                            when (
                                val resultado = servicio.actualizarProducto(
                                    rol = rol,
                                    id = producto!!.id,
                                    producto = ActualizarProductoRequest(
                                        title = tituloEditado.trim(),
                                        price = precio!!,
                                        description = descripcionEditada.trim(),
                                        category = categoriaEditada.trim(),
                                        image = producto!!.image
                                    )
                                )
                            ) {
                                is ResultadoProductos.Exito -> {
                                    producto = resultado.datos
                                    editando = false
                                    mensaje = "Producto actualizado (Simulación)"
                                }
                                ResultadoProductos.Error -> {
                                    snackbarHostState.showSnackbar("No se pudo actualizar el producto")
                                }
                            }
                            enviando = false
                        }
                    }
                ) {
                    if (enviando) CircularProgressIndicator() else Text("Guardar")
                }
            },
            dismissButton = {
                TextButton(enabled = !enviando, onClick = { editando = false }) {
                    Text("Cancelar")
                }
            }
        )
    }

    // ------------------------------------------------------------
    // 7. US08 — CONFIRMACIÓN OBLIGATORIA ANTES DE DELETE
    // ------------------------------------------------------------
    if (confirmarEliminacion && producto != null) {
        AlertDialog(
            onDismissRequest = { if (!enviando) confirmarEliminacion = false },
            title = { Text("Eliminar producto") },
            text = { Text("¿Seguro que deseas eliminar “${producto!!.title}”?") },
            confirmButton = {
                TextButton(
                    enabled = !enviando,
                    onClick = {
                        enviando = true
                        scope.launch {
                            when (servicio.eliminarProducto(rol, producto!!.id)) {
                                is ResultadoProductos.Exito -> {
                                    confirmarEliminacion = false
                                    enviando = false
                                    volverCatalogo("Producto eliminado (Simulación)")
                                }
                                ResultadoProductos.Error -> {
                                    enviando = false
                                    confirmarEliminacion = false
                                    snackbarHostState.showSnackbar("No se pudo eliminar el producto")
                                }
                            }
                        }
                    }
                ) {
                    if (enviando) CircularProgressIndicator() else Text("Eliminar")
                }
            },
            dismissButton = {
                TextButton(
                    enabled = !enviando,
                    onClick = { confirmarEliminacion = false }
                ) { Text("Cancelar") }
            }
        )
    }
}

// ============================================================
// 8. CAMPOS DEL FORMULARIO — entrada, validación visual y error
// ============================================================
@Composable
private fun CampoEdicion(
    etiqueta: String,
    valor: String,
    alCambiar: (String) -> Unit,
    error: String?,
    habilitado: Boolean,
    multilinea: Boolean = false
) {
    OutlinedTextField(
        value = valor,
        onValueChange = alCambiar,
        label = { Text(etiqueta) },
        enabled = habilitado,
        isError = error != null,
        supportingText = { if (error != null) Text(error) },
        singleLine = !multilinea,
        minLines = if (multilinea) 3 else 1,
        modifier = Modifier.fillMaxWidth()
    )
}

// ============================================================
// US05 — presentación completa; US07/US08 — acciones solo para Administrador.
// ============================================================
@Composable
private fun DetalleContent(
    producto: Producto,
    rol: Rol,
    mensaje: String?,
    modifier: Modifier,
    onEditar: () -> Unit,
    onEliminar: () -> Unit
) {
    Column(
        modifier = modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        AsyncImage(
            model = producto.image,
            contentDescription = "Imagen de ${producto.title}",
            contentScale = ContentScale.Fit,
            modifier = Modifier.fillMaxWidth().height(260.dp)
        )
        Text(producto.title, style = MaterialTheme.typography.headlineSmall)
        Text(
            formatPrice(producto.price),
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.primary,
            fontWeight = FontWeight.Bold
        )
        Text("Categoría: ${producto.category}", style = MaterialTheme.typography.labelLarge)
        Text(producto.description, style = MaterialTheme.typography.bodyLarge)

        if (rol == Rol.ADMINISTRADOR) {
            // Botones visibles solo para administradores; el servicio también verifica el rol.
            RowActions(onEditar = onEditar, onEliminar = onEliminar)
        }

        if (mensaje != null) {
            Surface(color = MaterialTheme.colorScheme.secondaryContainer) {
                Text(mensaje, modifier = Modifier.padding(12.dp))
            }
        }
    }
}

// ============================================================
// 10. BOTONES — Editar abre el formulario; Eliminar pide confirmar
// ============================================================
@Composable
private fun RowActions(onEditar: () -> Unit, onEliminar: () -> Unit) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        Button(onClick = onEditar, modifier = Modifier.weight(1f)) { Text("Editar") }
        Button(onClick = onEliminar, modifier = Modifier.weight(1f)) { Text("Eliminar") }
    }
}

// ============================================================
// 11. ESTADO DE ERROR — reintentar o regresar al catálogo
// ============================================================
@Composable
private fun ErrorDetailContent(
    modifier: Modifier,
    onRetry: () -> Unit,
    volverCatalogo: () -> Unit
) {
    Column(
        modifier = modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            "Producto no disponible",
            color = MaterialTheme.colorScheme.error,
            style = MaterialTheme.typography.titleLarge
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text("Volviendo al catálogo…")
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = onRetry) { Text("Reintentar") }
        TextButton(onClick = volverCatalogo) { Text("Volver ahora") }
    }
}
