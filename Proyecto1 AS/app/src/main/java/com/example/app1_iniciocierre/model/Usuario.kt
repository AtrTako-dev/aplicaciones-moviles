package com.example.app1_iniciocierre.model

data class Usuario(
    val id: Int,
    val username: String,
    val rol: Rol
)

enum class Rol(val etiqueta: String) {
    ADMINISTRADOR("Administrador"),
    AUDITOR("Auditor"),
    CLIENTE("Cliente")
}

fun rolParaUsuario(id: Int): Rol = when (id) {
    1, 2 -> Rol.ADMINISTRADOR
    3 -> Rol.AUDITOR
    else -> Rol.CLIENTE
}
