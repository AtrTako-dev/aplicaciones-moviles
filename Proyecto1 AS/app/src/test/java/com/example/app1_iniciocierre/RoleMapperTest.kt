package com.example.app1_iniciocierre

// ================================================================
// RoleMapperTest.kt — MAPA DEL ARCHIVO
// ================================================================
// Propósito: PRUEBAS — asignación de rol según ID de usuario
// Secciones: 1. IMPORTACIONES, 2. CASOS DE ASIGNACIÓN DE ROL, ADMINISTRADORES — IDs uno y dos, AUDITOR — ID tres, CLIENTES — otros IDs


// ================================================================
// 1. IMPORTACIONES
// ================================================================
import com.example.app1_iniciocierre.model.Rol
import com.example.app1_iniciocierre.model.rolParaUsuario
import org.junit.Assert.assertEquals
import org.junit.Test

// ================================================================
// 2. CASOS DE ASIGNACIÓN DE ROL
// ================================================================
class RoleMapperTest {
// ================================================================
// ADMINISTRADORES — IDs uno y dos
// ================================================================
    @Test
    fun asignaAdministradoresALosIdsUnoYDos() {
        assertEquals(Rol.ADMINISTRADOR, rolParaUsuario(1))
        assertEquals(Rol.ADMINISTRADOR, rolParaUsuario(2))
    }

// ================================================================
// AUDITOR — ID tres
// ================================================================
    @Test
    fun asignaAuditorAlIdTres() {
        assertEquals(Rol.AUDITOR, rolParaUsuario(3))
    }

// ================================================================
// CLIENTES — otros IDs
// ================================================================
    @Test
    fun asignaClienteALosDemAsIds() {
        assertEquals(Rol.CLIENTE, rolParaUsuario(4))
        assertEquals(Rol.CLIENTE, rolParaUsuario(10))
    }
}
