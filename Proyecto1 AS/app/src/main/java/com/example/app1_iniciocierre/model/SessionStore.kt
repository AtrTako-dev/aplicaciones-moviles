package com.example.app1_iniciocierre.model

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

data class Sesion(val token: String, val usuario: Usuario)

class SessionStore(context: Context) {
    private val preferences = EncryptedSharedPreferences.create(
        context,
        FILE_NAME,
        MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(),
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun guardar(sesion: Sesion) {
        preferences.edit()
            .putString(KEY_TOKEN, sesion.token)
            .putInt(KEY_USER_ID, sesion.usuario.id)
            .putString(KEY_USERNAME, sesion.usuario.username)
            .putString(KEY_ROLE, sesion.usuario.rol.name)
            .commit()
    }

    fun obtener(): Sesion? {
        val token = preferences.getString(KEY_TOKEN, null) ?: return null
        val username = preferences.getString(KEY_USERNAME, null) ?: return null
        val rol = preferences.getString(KEY_ROLE, null)?.let {
            runCatching { Rol.valueOf(it) }.getOrNull()
        } ?: return null
        val id = preferences.getInt(KEY_USER_ID, -1)
        return if (id > 0) Sesion(token, Usuario(id, username, rol)) else null
    }

    fun limpiar() {
        preferences.edit().clear().commit()
    }

    private companion object {
        const val FILE_NAME = "secure_session"
        const val KEY_TOKEN = "token"
        const val KEY_USER_ID = "user_id"
        const val KEY_USERNAME = "username"
        const val KEY_ROLE = "role"
    }
}
