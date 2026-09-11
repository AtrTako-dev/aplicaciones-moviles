# Aplicaciones Moviles

Repositorio de proyectos para la materia Desarrollo de Aplicaciones Moviles.

## Contenido

| Carpeta | Tecnologia | Descripcion |
| --- | --- | --- |
| `Proyecto1 AS` | Kotlin, Jetpack Compose y Android | Login, roles y cierre de sesion con Fake Store API. |
| `Proyecto1 RC` | TypeScript, React Native y Expo | Aplicacion Voz Urbana. |

## Proyecto1 AS: Android

### Requisitos

- Android Studio actualizado, con Android SDK 37 instalado.
- JDK incluido con Android Studio.
- Un emulador Android o un celular con depuracion USB habilitada.
- Internet para descargar dependencias y consumir Fake Store API.

### Abrir y ejecutar

1. Abra Android Studio y seleccione **Open**.
2. Elija la carpeta `Proyecto1 AS`.
3. Espere a que Gradle sincronice las dependencias.
4. Seleccione un emulador o celular conectado.
5. Presione el boton Run (`▶`) o use `Shift + F10`.

El proyecto usa Kotlin, Jetpack Compose, Retrofit y almacenamiento cifrado con AndroidX Security. El Gradle Wrapper incluido descarga Gradle 9.6.0 automaticamente.

### Pruebas

Desde una terminal dentro de `Proyecto1 AS`:

```bash
./gradlew test
```

## Proyecto1 RC: React Native

### Requisitos

- Node.js 20 o superior y npm.
- Expo Go en un celular Android o iOS, o un emulador configurado.
- Internet y, para usar Expo Go por LAN, celular y computadora en la misma red Wi-Fi.

### Instalar y ejecutar

Desde una terminal:

```bash
cd "Proyecto1 RC"
npm install
npm start
```

Expo mostrara un codigo QR. Escaneelo desde Expo Go para abrir la aplicacion en el celular. Tambien puede usar:

```bash
npm run android
npm run web
```

Si Expo reporta dependencias desajustadas, ejecute:

```bash
npx expo install --fix
```

El proyecto usa TypeScript, React Native, Expo, React Navigation, Expo Secure Store, Expo SQLite y Async Storage.

### Pruebas y revision

```bash
npm test
npm run typecheck
npm run lint
```

## GitHub

El repositorio es privado. Para que otra persona pueda descargarlo, debe agregarse como colaborador desde **Settings** -> **Collaborators** en GitHub. Despues puede usar **Code** -> **Download ZIP** o clonar el repositorio.
