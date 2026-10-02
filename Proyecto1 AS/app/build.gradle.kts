// ================================================================
// 1. PLUGINS DEL MÓDULO
// ================================================================
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
}

// ================================================================
// 2. CONFIGURACIÓN ANDROID
// ================================================================
android {
    namespace = "com.example.app1_iniciocierre"
    compileSdk {
        version = release(37)
    }

// ================================================================
// IDENTIDAD, VERSIONES Y PRUEBAS
// ================================================================
    defaultConfig {
        applicationId = "com.example.app1_iniciocierre"
        minSdk = 24
        targetSdk = 37
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

// ================================================================
// COMPILACIÓN RELEASE
// ================================================================
    buildTypes {
        release {
            optimization {
                enable = false
            }
        }
    }
// ================================================================
// VERSIÓN DE JAVA
// ================================================================
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
// ================================================================
// HABILITAR COMPOSE
// ================================================================
    buildFeatures {
        compose = true
    }
}

// ================================================================
// 3. DEPENDENCIAS DE APP Y PRUEBAS
// ================================================================
dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    testImplementation(libs.junit)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(libs.androidx.junit)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
    debugImplementation(libs.androidx.compose.ui.tooling)
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
    implementation("io.coil-kt:coil-compose:2.7.0")
}
