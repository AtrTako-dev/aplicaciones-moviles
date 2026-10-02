package com.example.app1_iniciocierre.model

// ================================================================
// SessionStore.kt — US01 y US02 — persistencia segura y limpieza de sesión
// ================================================================
// US01 guarda/recupera token y perfil cifrados; US02 elimina las credenciales persistidas.
// Secciones: 1. IMPORTACIONES, 2. DATOS DE LA SESIÓN, 3. ALMACENAMIENTO CIFRADO, 4. FUNCIÓN — guardar token y datos de usuario, 5. FUNCIÓN — recuperar y validar la sesión, 6. FUNCIÓN — cerrar sesión borrando preferencias, 7. CONSTANTES — claves del almacenamiento


// ================================================================
// 1. IMPORTACIONES
// ================================================================
import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

// ================================================================
// 2. DATOS DE LA SESIÓN
// ================================================================
data class Sesion(val token: String, val usuario: Usuario)

// ================================================================
// 3. ALMACENAMIENTO CIFRADO
// ================================================================
class SessionStore(context: Context) {
    private val preferences = EncryptedSharedPreferences.create(
        context,
        FILE_NAME,
        MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(),
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    // ================================================================
    // 4. FUNCIÓN — guardar token y datos de usuario
    // ================================================================
    fun guardar(sesion: Sesion) {
        preferences.edit()
            .putString(KEY_TOKEN, sesion.token)
            .putInt(KEY_USER_ID, sesion.usuario.id)
            .putString(KEY_USERNAME, sesion.usuario.username)
            .putString(KEY_ROLE, sesion.usuario.rol.name)
            .commit()
    }

    // ================================================================
    // 5. FUNCIÓN — recuperar y validar la sesión
    // ================================================================
    fun obtener(): Sesion? {
        val token = preferences.getString(KEY_TOKEN, null) ?: return null
        val username = preferences.getString(KEY_USERNAME, null) ?: return null
        val rol = preferences.getString(KEY_ROLE, null)?.let {
            runCatching { Rol.valueOf(it) }.getOrNull()
        } ?: return null
        val id = preferences.getInt(KEY_USER_ID, -1)
        return if (id > 0) Sesion(token, Usuario(id, username, rol)) else null
    }

    // ================================================================
    // 6. FUNCIÓN — cerrar sesión borrando preferencias
    // ================================================================
    fun limpiar() {
        preferences.edit().clear().commit()
    }

    // ================================================================
    // 7. CONSTANTES — claves del almacenamiento
    // ================================================================
    private companion object {
        const val FILE_NAME = "secure_session"
        const val KEY_TOKEN = "token"
        const val KEY_USER_ID = "user_id"
        const val KEY_USERNAME = "username"
        const val KEY_ROLE = "role"
    }
}
