// ================================================================
// 1. REPOSITORIOS DE PLUGINS
// ================================================================
pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
// ================================================================
// 2. PLUGINS DE CONFIGURACIÓN
// ================================================================
plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}
// ================================================================
// 3. REPOSITORIOS DE DEPENDENCIAS
// ================================================================
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

// ================================================================
// 4. IDENTIDAD Y MÓDULOS
// ================================================================
rootProject.name = "APP1_INICIOCIERRE"
include(":app")
