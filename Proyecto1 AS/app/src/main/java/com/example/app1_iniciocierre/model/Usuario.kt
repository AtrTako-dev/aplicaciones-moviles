package com.example.app1_iniciocierre.model

// ================================================================
// Usuario.kt — US01 — perfil y asignación local de rol
// ================================================================
// Propósito: Define los datos del usuario, sus roles y la asignación local.
// Secciones: 1. DATOS DEL USUARIO, 2. ROLES DISPONIBLES, 3. FUNCIÓN — asignar rol según ID de demostración


// ================================================================
// 1. DATOS DEL USUARIO
// ================================================================
data class Usuario(
    val id: Int,
    val username: String,
    val rol: Rol
)

// ================================================================
// 2. ROLES DISPONIBLES
// ================================================================
enum class Rol(val etiqueta: String) {
    ADMINISTRADOR("Administrador"),
    AUDITOR("Auditor"),
    CLIENTE("Cliente")
}

// ================================================================
// 3. FUNCIÓN — asignar rol según ID de demostración
// ================================================================
fun rolParaUsuario(id: Int): Rol = when (id) {
    1, 2 -> Rol.ADMINISTRADOR
    3 -> Rol.AUDITOR
    else -> Rol.CLIENTE
}
