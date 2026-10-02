# Mapa del proyecto por historia de usuario

Usa **Ctrl+F** en los archivos fuente para buscar `US01`, `US02`, etc. Los bloques marcados como **compartidos** sirven a varias historias y evitan duplicar modelos, navegación y llamadas HTTP.

## US01 — Login y asignación local de perfiles

- `app/src/main/java/com/example/app1_iniciocierre/view/LoginView.kt`: formulario, carga y mensajes.
- `app/src/main/java/com/example/app1_iniciocierre/controler/LoginController.kt`: valida campos/conexión, autentica y crea la sesión.
- `app/src/main/java/com/example/app1_iniciocierre/model/UsuarioService.kt`: POST `/auth/login` y búsqueda del usuario.
- `app/src/main/java/com/example/app1_iniciocierre/model/Usuario.kt`: IDs 1–2 Administrador, ID 3 Auditor y demás Cliente.
- `app/src/main/java/com/example/app1_iniciocierre/model/SessionStore.kt`: persistencia cifrada.
- `app/src/main/java/com/example/app1_iniciocierre/model/NetworkMonitor.kt`: conectividad antes de consultar la API.

## US02 — Cierre de sesión y limpieza

- `view/CatalogoView.kt`: acción «Salir».
- `MainActivity.kt`: limpia la sesión y descarta pantalla/estado protegido.
- `model/SessionStore.kt`: borra token, usuario y rol de preferencias cifradas.

## US03 — Catálogo general

- `view/CatalogoView.kt`: carga, error/vacío, reintento y `LazyColumn`.
- `model/ProductoService.kt`: GET `/products`.
- `model/Producto.kt`: modelo JSON compartido.

## US04 — Filtrar por categoría

- `view/CatalogoView.kt`: categorías, carga de resultados y opción «Ver todos».
- `model/ProductoService.kt`: GET `/products/categories` y `/products/category/{category}`.

## US05 — Ver detalle del producto

- `view/CatalogoView.kt`: tarjeta que abre el detalle.
- `view/DetalleProductoView.kt`: GET por ID, imagen, título, precio, categoría y descripción.
- `model/ProductoService.kt`: GET `/products/{id}`.

## US06 — Agregar producto

- `view/CatalogoView.kt`: formulario, validación local, estado de envío y confirmación de ID.
- `model/Producto.kt`: `CrearProductoRequest`.
- `model/ProductoService.kt`: POST `/products`, restringido al Administrador.

## US07 — Editar producto

- `view/DetalleProductoView.kt`: campos precargados, validación y actualización visual.
- `model/Producto.kt`: `ActualizarProductoRequest`.
- `model/ProductoService.kt`: PUT `/products/{id}`, restringido al Administrador.

## US08 — Eliminar producto

- `view/DetalleProductoView.kt`: confirmación; cancelar no envía solicitud; éxito vuelve al catálogo.
- `model/ProductoService.kt`: DELETE `/products/{id}`, restringido al Administrador.

## Código transversal

- `MainActivity.kt`: navegación y ciclo de sesión.
- `ui/theme/`: tema visual, sin lógica de historias.
- Archivos `*Test.kt` y `build.gradle.kts`: pruebas/configuración, no funcionalidad de usuario.

## Notas de alcance

- Fake Store API simula POST, PUT y DELETE; las modificaciones no se conservan en el servidor.
- La app comprueba roles en interfaz y cliente HTTP; una API real también debe autorizarlos en servidor.
- La revisión de US01–US08 se hizo por inspección de código. No se ejecutaron compilación ni pruebas.
