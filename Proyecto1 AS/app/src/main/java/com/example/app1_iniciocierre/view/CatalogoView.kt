package com.example.app1_iniciocierre.view

// ============================================================
// 1. IMPORTACIONES
// ============================================================
import android.util.Patterns
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
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
import com.example.app1_iniciocierre.model.CrearProductoRequest
import com.example.app1_iniciocierre.model.Producto
import com.example.app1_iniciocierre.model.ProductoService
import com.example.app1_iniciocierre.model.ResultadoProductos
import com.example.app1_iniciocierre.model.Rol
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.Locale

// ============================================================
// US03 — catálogo general: lista reciclable, imágenes, carga, error y reintento.
// US04 — filtro por categoría y restauración de “Ver todos”.
// US06 — alta, validación local y confirmación del ID simulado.
// Las secciones numeradas permiten ubicar cada historia con Ctrl+F.
// ============================================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CatalogoView(
    usuario: String,
    rol: Rol,
    servicio: ProductoService,
    abrirDetalle: (Int) -> Unit,
    cerrarSesion: () -> Unit,
    mensajeInicial: String? = null,
    alMostrarMensaje: () -> Unit = {}
) {
    // ------------------------------------------------------------
    // 3. DATOS Y ESTADO — contenido, filtros, formulario y avisos
    // ------------------------------------------------------------
    var productos by remember { mutableStateOf<List<Producto>>(emptyList()) }
    var productosCreadosLocalmente by remember { mutableStateOf<List<Producto>>(emptyList()) }
    var categorias by remember { mutableStateOf<List<String>>(emptyList()) }
    var categoriaSeleccionada by remember { mutableStateOf<String?>(null) }
    var cargando by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf(false) }
    var cargandoCategorias by remember { mutableStateOf(true) }
    var errorCategorias by remember { mutableStateOf(false) }
    var reintento by remember { mutableIntStateOf(0) }
    var mostrarFormulario by remember { mutableStateOf(false) }
    var seleccionandoCategoria by remember { mutableStateOf(false) }
    var titulo by remember { mutableStateOf("") }
    var precio by remember { mutableStateOf("") }
    var descripcion by remember { mutableStateOf("") }
    var imagen by remember { mutableStateOf("") }
    var categoria by remember { mutableStateOf("") }
    var errores by remember { mutableStateOf<Map<String, String>>(emptyMap()) }
    var enviando by remember { mutableStateOf(false) }
    var idCreado by remember { mutableStateOf<Int?>(null) }
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    // ------------------------------------------------------------
    // US03 / US04 — CONSULTAS: catálogo general o filtrado; limpia y marca carga al cambiar criterio.
    // ------------------------------------------------------------
    LaunchedEffect(Unit) {
        when (val resultado = servicio.obtenerCategorias()) {
            is ResultadoProductos.Exito -> categorias = resultado.datos.distinct()
            ResultadoProductos.Error -> errorCategorias = true
        }
        cargandoCategorias = false
    }

    LaunchedEffect(categoriaSeleccionada, reintento) {
        cargando = true
        error = false
        productos = emptyList()
        val resultado = if (categoriaSeleccionada == null) {
            servicio.obtenerProductos()
        } else {
            servicio.obtenerProductosPorCategoria(categoriaSeleccionada!!)
        }
        when (resultado) {
            is ResultadoProductos.Exito -> {
                val creadosEnEstaSesion = productosCreadosLocalmente.filter {
                    categoriaSeleccionada == null || it.category == categoriaSeleccionada
                }
                productos = (resultado.datos + creadosEnEstaSesion).distinctBy { it.id }
            }
            ResultadoProductos.Error -> error = true
        }
        cargando = false
    }

    LaunchedEffect(mensajeInicial) {
        if (mensajeInicial != null) {
            snackbarHostState.showSnackbar(mensajeInicial)
            alMostrarMensaje()
        }
    }

    // ------------------------------------------------------------
    // US03 / US04 — INTERFAZ: filtros y LazyColumn; tarjeta común para cada producto.
    // ------------------------------------------------------------
    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = { Text("Catálogo") },
                actions = {
                    Text("Hola, $usuario", style = MaterialTheme.typography.labelLarge)
                    if (rol == Rol.ADMINISTRADOR) {
                        TextButton(onClick = {
                            categoria = categorias.firstOrNull().orEmpty()
                            mostrarFormulario = true
                        }) {
                            Text("Agregar producto")
                        }
                    }
                    TextButton(onClick = cerrarSesion) { Text("Salir") }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            Text(
                text = "Filtrar por categoría",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)
            )

            if (cargandoCategorias) {
                CircularProgressIndicator(
                    modifier = Modifier.padding(horizontal = 16.dp).size(22.dp),
                    strokeWidth = 2.dp
                )
            } else if (errorCategorias) {
                Text(
                    text = "No se pudieron cargar las categorías. Puedes ver todos los productos.",
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
            } else {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState())
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilterChip(
                        selected = categoriaSeleccionada == null,
                        onClick = { categoriaSeleccionada = null },
                        label = { Text("Ver todos") }
                    )
                    categorias.forEach { nombreCategoria ->
                        FilterChip(
                            selected = categoriaSeleccionada == nombreCategoria,
                            onClick = { categoriaSeleccionada = nombreCategoria },
                            label = { Text(nombreCategoria) }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))
            when {
                cargando -> LoadingContent()
                error -> ErrorContent(onRetry = { reintento++ })
                productos.isEmpty() -> EmptyContent()
                else -> LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(items = productos, key = { it.id }) { producto ->
                        ProductoCard(producto = producto, onClick = { abrirDetalle(producto.id) })
                    }
                }
            }
        }
    }

    // ------------------------------------------------------------
    // 6. US06 — FORMULARIO Y VALIDACIONES PARA CREAR UN PRODUCTO
    // ------------------------------------------------------------
    if (mostrarFormulario) {
        AlertDialog(
            onDismissRequest = { if (!enviando) mostrarFormulario = false },
            title = { Text(if (seleccionandoCategoria) "Seleccionar categoría" else "Agregar producto") },
            text = {
                if (seleccionandoCategoria) {
                    Column(
                        modifier = Modifier.heightIn(max = 320.dp).verticalScroll(rememberScrollState()),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        categorias.forEach { opcion ->
                            TextButton(
                                onClick = {
                                    categoria = opcion
                                    errores = errores - "categoria"
                                    seleccionandoCategoria = false
                                },
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(opcion, modifier = Modifier.fillMaxWidth())
                            }
                        }
                    }
                } else {
                    Column(
                        modifier = Modifier.verticalScroll(rememberScrollState()),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                    CampoProducto("Título", titulo, { titulo = it }, errores["titulo"], !enviando)
                    CampoProducto("Precio", precio, { precio = it }, errores["precio"], !enviando)
                    CampoProducto(
                        "Descripción", descripcion, { descripcion = it },
                        errores["descripcion"], !enviando, multilinea = true
                    )
                    CampoProducto("URL de imagen", imagen, { imagen = it }, errores["imagen"], !enviando)
                    Text(
                        "Usa una URL http o https que apunte directamente a la imagen. Se acepta cualquier dominio.",
                        style = MaterialTheme.typography.bodySmall
                    )
                    CampoCategoria(
                        seleccion = categoria,
                        error = errores["categoria"] ?: if (errorCategorias) "No se pudieron cargar las categorías" else null,
                        habilitado = !enviando && !cargandoCategorias && !errorCategorias,
                        alAbrir = { seleccionandoCategoria = true }
                    )
                    errores["general"]?.let { mensajeError ->
                        Text(mensajeError, color = MaterialTheme.colorScheme.error)
                    }
                    Text(
                        "La API de demostración no guarda el producto en el servidor. Se mostrará " +
                            "en este catálogo durante la sesión actual.",
                        style = MaterialTheme.typography.bodySmall
                    )
                    }
                }
            },
            confirmButton = {
                if (seleccionandoCategoria) {
                    TextButton(onClick = { seleccionandoCategoria = false }) { Text("Volver") }
                } else TextButton(
                    enabled = !enviando,
                    onClick = {
                        val precioNumerico = precio.replace(',', '.').toDoubleOrNull()
                        val erroresNuevos = buildMap {
                            if (titulo.isBlank()) put("titulo", "Escribe el título")
                            if (precioNumerico == null || !precioNumerico.isFinite() || precioNumerico < 0) {
                                put("precio", "Escribe un precio numérico válido")
                            }
                            if (descripcion.isBlank()) put("descripcion", "Escribe la descripción")
                            if (imagen.isBlank() || !Patterns.WEB_URL.matcher(imagen).matches() ||
                                !(imagen.startsWith("https://", true) || imagen.startsWith("http://", true))
                            ) put("imagen", "Escribe una URL válida que comience con http:// o https://")
                            if (categoria.isBlank() || categoria !in categorias) {
                                put("categoria", "Selecciona una categoría de la lista")
                            }
                        }
                        errores = erroresNuevos
                        if (erroresNuevos.isNotEmpty()) return@TextButton

                        enviando = true
                        scope.launch {
                            when (
                                val resultado = servicio.crearProducto(
                                    rol,
                                    CrearProductoRequest(
                                        title = titulo.trim(),
                                        price = precioNumerico!!,
                                        description = descripcion.trim(),
                                        category = categoria.trim(),
                                        image = imagen.trim()
                                    )
                                )
                            ) {
                                is ResultadoProductos.Exito -> {
                                    val productoCreado = resultado.datos
                                    productosCreadosLocalmente =
                                        (productosCreadosLocalmente + productoCreado).distinctBy { it.id }
                                    if (categoriaSeleccionada == null) {
                                        productos = (productos + productoCreado).distinctBy { it.id }
                                    } else {
                                        categoriaSeleccionada = null
                                    }
                                    idCreado = productoCreado.id
                                    titulo = ""
                                    precio = ""
                                    descripcion = ""
                                    imagen = ""
                                    categoria = ""
                                    errores = emptyMap()
                                    mostrarFormulario = false
                                }
                                ResultadoProductos.Error -> errores = mapOf(
                                    "general" to "No se pudo crear el producto. Intenta de nuevo."
                                )
                            }
                            enviando = false
                        }
                    }
                ) { Text(if (enviando) "Enviando…" else "Guardar") }
            },
            dismissButton = {
                if (!seleccionandoCategoria) {
                    TextButton(enabled = !enviando, onClick = { mostrarFormulario = false }) {
                        Text("Cancelar")
                    }
                }
            }
        )
        errores["general"]?.let { mensaje ->
            LaunchedEffect(mensaje) { snackbarHostState.showSnackbar(mensaje) }
        }
    }

    // ------------------------------------------------------------
    // 7. US06 — CONFIRMACIÓN CON ID DEVUELTO POR LA API SIMULADA
    // ------------------------------------------------------------
    idCreado?.let { id ->
        AlertDialog(
            onDismissRequest = { idCreado = null },
            title = { Text("Producto creado (Simulación)") },
            text = {
                Text("La API devolvió el ID $id. El formulario se limpió. " +
                    "Fake Store API no guarda el producto realmente.")
            },
            confirmButton = {
                TextButton(onClick = { idCreado = null }) { Text("Aceptar") }
            }
        )
    }
}

// ============================================================
// 8. SELECTOR DE CATEGORÍA — abre la lista recibida desde la API
// ============================================================
@Composable
private fun CampoCategoria(
    seleccion: String,
    error: String?,
    habilitado: Boolean,
    alAbrir: () -> Unit
) {
    Column {
        OutlinedButton(
            onClick = alAbrir,
            enabled = habilitado,
            modifier = Modifier.fillMaxWidth(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 10.dp)
        ) {
            Column(modifier = Modifier.fillMaxWidth()) {
                if (seleccion.isNotBlank()) {
                    Text("Categoría", style = MaterialTheme.typography.labelSmall)
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = seleccion.ifBlank { "Selecciona una categoría" },
                        modifier = Modifier.weight(1f),
                        style = MaterialTheme.typography.bodyLarge
                    )
                    Text("▼")
                }
            }
        }
        if (error != null) {
            Text(
                text = error,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.fillMaxWidth().padding(start = 16.dp, top = 4.dp)
            )
        }
    }
}

// ============================================================
// 9. CAMPOS DEL FORMULARIO — texto y error de validación
// ============================================================
@Composable
private fun CampoProducto(
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
        supportingText = error?.let { textoError -> ({ Text(textoError) }) },
        singleLine = !multilinea,
        minLines = if (multilinea) 3 else 1,
        modifier = Modifier.fillMaxWidth()
    )
}

// ============================================================
// 10. CONTENIDO DE ESTADO — carga, error y lista vacía
// ============================================================
@Composable
private fun LoadingContent() {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        CircularProgressIndicator()
    }
}

@Composable
private fun ErrorContent(onRetry: () -> Unit) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("No se pudo cargar el catálogo", color = MaterialTheme.colorScheme.error)
            Spacer(modifier = Modifier.height(12.dp))
            Button(onClick = onRetry) { Text("Reintentar") }
        }
    }
}

@Composable
private fun EmptyContent() {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text("No hay productos para mostrar")
    }
}

// ============================================================
// 11. TARJETA DE PRODUCTO — imagen, datos y navegación al detalle
// ============================================================
@Composable
private fun ProductoCard(producto: Producto, onClick: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth().clickable(onClick = onClick)) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            AsyncImage(
                model = producto.image,
                contentDescription = "Imagen de ${producto.title}",
                contentScale = ContentScale.Crop,
                modifier = Modifier.size(104.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(producto.title, style = MaterialTheme.typography.titleMedium)
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    formatPrice(producto.price),
                    style = MaterialTheme.typography.titleLarge,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Bold
                )
                Text(producto.category, style = MaterialTheme.typography.bodySmall)
            }
        }
    }
}

// ============================================================
// 12. FUNCIÓN AUXILIAR — formato de precio
// ============================================================
internal fun formatPrice(price: Double): String =
    NumberFormat.getCurrencyInstance(Locale.US).format(price)
