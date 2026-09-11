package com.example.app1_iniciocierre

import com.example.app1_iniciocierre.model.Rol
import com.example.app1_iniciocierre.model.rolParaUsuario
import org.junit.Assert.assertEquals
import org.junit.Test

class RoleMapperTest {
    @Test
    fun asignaAdministradoresALosIdsUnoYDos() {
        assertEquals(Rol.ADMINISTRADOR, rolParaUsuario(1))
        assertEquals(Rol.ADMINISTRADOR, rolParaUsuario(2))
    }

    @Test
    fun asignaAuditorAlIdTres() {
        assertEquals(Rol.AUDITOR, rolParaUsuario(3))
    }

    @Test
    fun asignaClienteALosDemAsIds() {
        assertEquals(Rol.CLIENTE, rolParaUsuario(4))
        assertEquals(Rol.CLIENTE, rolParaUsuario(10))
    }
}
