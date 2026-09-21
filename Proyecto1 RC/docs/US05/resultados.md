# US05 — Ver detalle del producto con interfaz dinámica

Resultados de la implementación y de las pruebas manuales ejecutadas en emulador Android.

- Proyecto: `Proyecto1 RC` (Expo ~57 / React Native 0.86 / TypeScript / React Navigation)
- Rama: `Israel` — Commit: `07fca1c`
- Emulador: AVD `Pixel_8` (API nivel correspondiente al SDK local)
- API: Fake Store API (`https://fakestoreapi.com/products/{id}`)

---

## 1. Entregables (código)

| Archivo | Propósito |
| --- | --- |
| `src/model/SesionLocal.ts` | Estructura de la sesión local `{ user: { username, role } }` y validación de rol (`ROLES_VALIDOS`, `esRolValido`). El rol se obtiene **solo** de la sesión local, nunca de la API. |
| `src/services/SessionService.ts` | Persistencia en AsyncStorage (clave `@voz_urbana/session_local`). API: `saveSession`, `getCurrentSession`, `getCurrentRole`, `isAdministrador`, `clearSession`. Descarta sesiones corruptas o con rol inválido. |
| `src/hooks/useSesionLocal.ts` | Hook que expone `sesion`, `role`, `esAdministrador`, `cargando` desde la sesión local. |
| `src/services/productService.ts` | Extendido: `getProducts`/`fetchProducts` (catálogo), `getProductById(id)`, `updateProduct(id, data)` (PUT), `deleteProduct(id)` (DELETE). Errores amigables (`ProductServiceError`). |
| `src/controllers/ProductDetailController.ts` | Controlador del detalle: estados loading/success/error, `retry`, `guardarProducto`, `eliminarProducto`. |
| `src/utils/validators.ts` | `validateProductForm` + validadores de título, precio, descripción y categoría. |
| `src/views/ProductDetailScreen.tsx` | Detalle con interfaz dinámica por rol y manejo de error. |
| `src/views/ProductEditScreen.tsx` | Formulario de edición (solo Administrador). |
| `src/components/ProductCard.tsx` | Tarjeta presionable → navega al detalle. |
| `src/navigation/AppNavigator.tsx` | Rutas `DetalleProducto` y `EditarProducto` agregadas. |
| `src/navigation/AuthContext.tsx` | Sincroniza la sesión local al iniciar/restaurar/cerrar sesión. |
| `src/hooks/useRefreshOnFocus.ts` | Refresca catálogo/detalle al volver a enfocar la pantalla. |

---

## 2. Verificación estática

| Comando | Resultado |
| --- | --- |
| `npx tsc --noEmit` | Sin errores |
| `npx eslint .` | Sin errores |
| `npx jest --silent` | 97 tests / 9 suites en verde (se agregaron tests de US05 en `SessionService`, `productService`, `SesionLocal`, `validators`) |
| `npx expo start --android` | Bundle Metro OK: `Android Bundled 100874ms index.ts (1046 modules)` |

Comandos del proyecto: `npm start`, `npm run typecheck`, `npm run lint`, `npm test`.

---

## 3. Escenarios probados (emulador)

### Escenario 1 — Cliente solo lectura

Usuario: `donero` / `ewedon` (id 4 → Cliente).

| Paso | Resultado |
| --- | --- |
| Inicio de sesión | OK — Home muestra "Rol: Cliente" |
| Catálogo → mostrar productos | OK — "20 productos disponibles" |
| Tocar producto → Detalle | OK — imagen, categoría (`MEN'S CLOTHING`), título, `$109.95`, descripción |
| Botones Editar / Eliminar | **Ausentes** (0 nodos en el árbol de UI) |

Evidencia: `evidencia/01_detalle_cliente.png`.

### Escenario 2 — Administrador (editar y eliminar)

Usuario: `johnd` / `m38rmF$` (id 1 → Administrador).

| Paso | Resultado |
| --- | --- |
| Inicio de sesión | OK — Home muestra "Rol: Administrador" |
| Catálogo → Detalle | OK — muestra título, precio, descripción |
| Botones Editar / Eliminar | **Presentes** (juntos a la información) |
| Editar → formulario | OK — carga datos actuales (título, precio, categoría, descripción) |
| Validación: vaciar precio y guardar | OK — error por campo: "Ingresa el precio." |
| Guardar con precio `120.00` | OK — Alert "Producto actualizado – Los cambios se guardaron correctamente." |
| Eliminar → confirmación | OK — Alert de confirmación ("¿Seguro que deseas eliminar este producto?") |
| Confirmar eliminación | OK — Alert "Producto eliminado" y regreso al catálogo con lista actualizada |

Nota (limitación conocida de Fake Store API): DELETE/PUT responden 2xx pero **no persisten** en el servidor; al refrescar, el GET devuelve los datos originales (20 productos, precio `109.95`). El cliente lo maneja con elegancia sin romper la app y documentando el resultado.

Evidencia: `evidencia/02_detalle_admin.png`.

### Escenario 3 — Error "Producto no disponible"

La red se desconecta (modo avión) con el catálogo ya cargado.

| Paso | Resultado |
| --- | --- |
| Tocar producto con red caída | OK — Alert **"Producto no disponible"** ("No se pudo cargar el producto solicitado.") |
| Aceptar el aviso | OK — regreso automático a Catálogo general |

Extra verificado: si la carga del catálogo falla, la pantalla muestra su estado de error propio con "Reintentar".

Evidencia: `evidencia/03_producto_no_disponible.png`.

### Escenario adicional — Auditor solo lectura

Usuario: `kevinryan` / `kev02937@` (id 3 → Auditor). El detalle muestra la información completa y **no** instancia los botones Editar/Eliminar (0 nodos).

Evidencia: `evidencia/04_detalle_auditor.png`.

---

## 4. Seguridad de interfaz

- El rol se lee **exclusivamente** de la sesión local (`sessionService.getCurrentSession()` → `useSesionLocal`), nunca de Fake Store API.
- Cliente y Auditor solo reciben los datos; los botones Editar/Eliminar **no se instancian** en el árbol (`{esAdministrador && <BotonesAdmin />}`), garantizando que no existan ni ocultos por estilos ni deshabilitados.
- La pantalla de edición sólo es alcanzable desde la pantalla de detalle bajo rol administrador (`AppStackParamList['EditarProducto']`).

---

## 5. Cómo reproducir

```bash
cd "Proyecto1 RC"
npm install
npm run typecheck   # tsc
npm run lint        # eslint
npm test            # jest

# Emulador
# 1) AVD: Pixel_8  (o cualquier AVD de la instalación de Android SDK)
# 2) Levantar el servidor y abrirlo en el emulador:
npx expo start --android
# Si Expo Go no conecta, reenviar el puerto:
adb reverse tcp:8081 tcp:8081
```

Flujos de navegación:

- Catálogo → Detalle → Editar (Administrador)
- Detalle → Eliminar → Confirmación → Catálogo (lista actualizada)
- Catálogo → Detalle → Error → "Producto no disponible" → Catálogo