package com.example.app1_iniciocierre.view

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.horizontalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.example.app1_iniciocierre.model.Producto
import com.example.app1_iniciocierre.model.ProductoService
import com.example.app1_iniciocierre.model.ResultadoProductos
import java.text.NumberFormat
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CatalogoView(
    usuario: String,
    servicio: ProductoService,
    abrirDetalle: (Int) -> Unit,
    cerrarSesion: () -> Unit
) {
    var productos by remember { mutableStateOf<List<Producto>>(emptyList()) }
    var categorias by remember { mutableStateOf<List<String>>(emptyList()) }
    var categoriaSeleccionada by remember { mutableStateOf<String?>(null) }
    var cargando by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf(false) }
    var cargandoCategorias by remember { mutableStateOf(true) }
    var errorCategorias by remember { mutableStateOf(false) }
    var reintento by remember { mutableIntStateOf(0) }

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
            is ResultadoProductos.Exito -> productos = resultado.datos

            ResultadoProductos.Error -> error = true
        }
        cargando = false
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Catálogo") },
                actions = {
                    Text("Hola, $usuario", style = MaterialTheme.typography.labelLarge)
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
                    modifier = Modifier
                        .padding(horizontal = 16.dp)
                        .size(22.dp),
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
                    categorias.forEach { categoria ->
                        FilterChip(
                            selected = categoriaSeleccionada == categoria,
                            onClick = { categoriaSeleccionada = categoria },
                            label = { Text(categoria) }
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
}

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

@Composable
private fun ProductoCard(producto: Producto, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
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

internal fun formatPrice(price: Double): String =
    NumberFormat.getCurrencyInstance(Locale.US).format(price)
