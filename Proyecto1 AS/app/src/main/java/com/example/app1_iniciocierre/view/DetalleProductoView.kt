package com.example.app1_iniciocierre.view

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DetalleProductoView(
    productoId: Int,
    rol: Rol,
    servicio: ProductoService,
    volverCatalogo: () -> Unit
) {
    var producto by remember { mutableStateOf<Producto?>(null) }
    var cargando by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf(false) }
    var reintento by remember { mutableIntStateOf(0) }
    var mensaje by remember { mutableStateOf<String?>(null) }
    var editando by remember { mutableStateOf(false) }
    var confirmarEliminacion by remember { mutableStateOf(false) }
    var guardando by remember { mutableStateOf(false) }
    var tituloEditado by remember { mutableStateOf("") }
    var precioEditado by remember { mutableStateOf("") }
    var descripcionEditada by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()

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
            volverCatalogo()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Detalle del producto") },
                navigationIcon = {
                    TextButton(onClick = volverCatalogo) { Text("← Volver") }
                }
            )
        }
    ) { padding ->
        when {
            cargando -> Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) { CircularProgressIndicator() }

            error -> ErrorDetailContent(
                modifier = Modifier.padding(padding),
                onRetry = {
                    error = false
                    reintento++
                },
                volverCatalogo = volverCatalogo
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
                    mensaje = null
                    editando = true
                },
                onEliminar = { confirmarEliminacion = true }
            )
        }
    }

    if (editando && producto != null) {
        AlertDialog(
            onDismissRequest = { if (!guardando) editando = false },
            title = { Text("Editar producto") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = tituloEditado,
                        onValueChange = { tituloEditado = it },
                        label = { Text("Título") },
                        enabled = !guardando,
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = precioEditado,
                        onValueChange = { precioEditado = it },
                        label = { Text("Precio") },
                        enabled = !guardando,
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = descripcionEditada,
                        onValueChange = { descripcionEditada = it },
                        label = { Text("Descripción") },
                        enabled = !guardando,
                        minLines = 3
                    )
                }
            },
            confirmButton = {
                TextButton(
                    enabled = !guardando,
                    onClick = {
                        val precio = precioEditado.replace(',', '.').toDoubleOrNull()
                        if (tituloEditado.isBlank() || precio == null || precio < 0) {
                            mensaje = "Ingresa un título y un precio válido"
                            return@TextButton
                        }
                        guardando = true
                        scope.launch {
                            when (
                                val resultado = servicio.actualizarProducto(
                                    producto!!.id,
                                    ActualizarProductoRequest(
                                        title = tituloEditado.trim(),
                                        price = precio,
                                        description = descripcionEditada.trim(),
                                        category = producto!!.category,
                                        image = producto!!.image
                                    )
                                )
                            ) {
                                is ResultadoProductos.Exito -> {
                                    producto = resultado.datos
                                    editando = false
                                    guardando = false
                                    mensaje = "Producto actualizado correctamente"
                                }

                                ResultadoProductos.Error -> {
                                    guardando = false
                                    mensaje = "No se pudo actualizar el producto"
                                }
                            }
                        }
                    }
                ) { Text("Guardar") }
            },
            dismissButton = {
                TextButton(
                    enabled = !guardando,
                    onClick = { editando = false }
                ) { Text("Cancelar") }
            }
        )
    }

    if (confirmarEliminacion && producto != null) {
        AlertDialog(
            onDismissRequest = { if (!guardando) confirmarEliminacion = false },
            title = { Text("Eliminar producto") },
            text = { Text("¿Seguro que deseas eliminar “${producto!!.title}”?") },
            confirmButton = {
                TextButton(
                    enabled = !guardando,
                    onClick = {
                        guardando = true
                        scope.launch {
                            when (servicio.eliminarProducto(producto!!.id)) {
                                is ResultadoProductos.Exito -> {
                                    guardando = false
                                    confirmarEliminacion = false
                                    volverCatalogo()
                                }

                                ResultadoProductos.Error -> {
                                    guardando = false
                                    confirmarEliminacion = false
                                    mensaje = "No se pudo eliminar el producto"
                                }
                            }
                        }
                    }
                ) { Text("Eliminar") }
            },
            dismissButton = {
                TextButton(
                    enabled = !guardando,
                    onClick = { confirmarEliminacion = false }
                ) { Text("Cancelar") }
            }
        )
    }
}

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
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        AsyncImage(
            model = producto.image,
            contentDescription = "Imagen de ${producto.title}",
            contentScale = ContentScale.Fit,
            modifier = Modifier
                .fillMaxWidth()
                .height(260.dp)
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
            RowActions(onEditar = onEditar, onEliminar = onEliminar)
        }

        if (mensaje != null) {
            Surface(color = MaterialTheme.colorScheme.secondaryContainer) {
                Text(mensaje, modifier = Modifier.padding(12.dp))
            }
        }
    }
}

@Composable
private fun RowActions(onEditar: () -> Unit, onEliminar: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Button(onClick = onEditar, modifier = Modifier.weight(1f)) { Text("Editar") }
        Button(onClick = onEliminar, modifier = Modifier.weight(1f)) { Text("Eliminar") }
    }
}

@Composable
private fun ErrorDetailContent(
    modifier: Modifier,
    onRetry: () -> Unit,
    volverCatalogo: () -> Unit
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(24.dp),
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
