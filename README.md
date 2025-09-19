# Ticketera Mobile - App de Validadores

Aplicación móvil React Native con Expo para validadores de eventos Vibepass.

## 🚀 Características

- ✅ **Login de validadores** usando la API `/api/users/login`
- ✅ **Navegación entre pantallas** (Login → Bienvenida → Escáner → Validación)
- ✅ **Pantalla de bienvenida** con información completa del evento asignado
- ✅ **Visualización de datos del evento**: nombre, descripción, fecha, horario, lugar y banner
- ✅ **Información del validador**: nombre, correo, RUT, estado y permisos
- ✅ **Escáner de códigos QR** con cámara nativa
- ✅ **Sistema de validación completo**:
  - **Validación de entradas**: Control de acceso de asistentes
  - **Validación de alimentos**: Canje de comida comprada
  - **Validación de bebestibles**: Canje de bebidas compradas
  - **Validación de actividades**: Canje de cupos para actividades
- ✅ **Estado de canjes en tiempo real**: Seguimiento de elementos canjeados/pendientes
- ✅ **Interfaz intuitiva** con resúmenes y confirmaciones
- ✅ **Almacenamiento local** de sesión con AsyncStorage
- ✅ **Interfaz nativa** optimizada para móviles

## 📱 Instalación y Uso

### Prerrequisitos
- Node.js instalado
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app en tu dispositivo móvil

### Dependencias principales
- `expo-camera`: Para escáner QR y cámara nativa
- `@react-navigation/native`: Para navegación entre pantallas
- `@react-navigation/stack`: Para navegación tipo stack
- `expo-status-bar`: Para barra de estado

### Pasos para ejecutar:

1. **Instalar dependencias:**
   ```bash
   cd ticketera-mobile
   npm install
   ```

2. **Iniciar el servidor de desarrollo:**
   ```bash
   npm start
   ```

3. **Probar en dispositivo móvil:**
   - Instala "Expo Go" desde App Store/Google Play
   - Escanea el código QR que aparece en la terminal
   - La app se abrirá en tu dispositivo

### Credenciales de prueba:
Usa las mismas credenciales del dashboard web para probar el login.

## 🔧 Configuración de API

La app está configurada para conectarse a:
- **URL Base**: `https://5a5c56347372.ngrok-free.app`
- **Endpoint Login**: `/api/users/login`

### Formato de Login
La aplicación envía las credenciales en el siguiente formato:
```json
{
  "correoElectronico": "juanperez@gmail.com",
  "password": "154010"
}
```

### Respuesta del Backend
El backend retorna información del validador y el evento asignado:
```json
{
  "status": "success",
  "message": "Login de validador exitoso",
  "data": {
    "validator": { ... },
    "evento": { ... },
    "token": "...",
    "permisos": { ... }
  }
}
```

## 🔄 Flujo de Validación

### 1. **Escaneo QR**
- El validador escanea el código QR del asistente
- La app parsea el JSON con información de la compra
- Se inicializa el estado de validación para todos los elementos

### 2. **Menú de Validación**
- Se muestran las opciones disponibles según la compra:
  - **Validador QR**: Para entradas al evento
  - **Atracciones**: Para actividades compradas
  - **Alimentos**: Para comida comprada
  - **Bebestibles**: Para bebidas compradas

### 3. **Validación Específica**
- **Entradas**: Lista de asistentes con opción de marcar entrada/salida
- **Alimentos/Bebestibles**: Lista de productos con cantidad y botones de canje
- **Actividades**: Lista de actividades con cupos y opciones de canje

### 4. **Estado en Tiempo Real**
- Seguimiento de elementos canjeados vs pendientes
- Resúmenes actualizados automáticamente
- Confirmaciones de cada acción

## 📂 Estructura del Proyecto

```
ticketera-mobile/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js              # Pantalla de login
│   │   ├── WelcomeScreen.js            # Pantalla de bienvenida
│   │   ├── QRScannerScreen.js          # Escáner de códigos QR
│   │   ├── ValidationMenuScreen.js     # Menú de opciones de validación
│   │   ├── TicketValidationScreen.js   # Validación de entradas
│   │   ├── FoodValidationScreen.js     # Validación de alimentos
│   │   ├── DrinkValidationScreen.js    # Validación de bebestibles
│   │   └── ActivityValidationScreen.js # Validación de actividades
│   ├── context/
│   │   └── QRContext.js                # Contexto para manejo de datos QR
│   ├── services/
│   │   ├── api.js                      # Configuración de API
│   │   └── storage.js                  # Almacenamiento local
│   ├── components/                     # Componentes reutilizables
│   └── utils/                          # Utilidades
├── App.js                              # Componente principal con navegación
└── package.json
```

## 🎯 Funcionalidades Implementadas

### ✅ Sistema de Autenticación
- Login de validadores con correo y contraseña
- Almacenamiento seguro de tokens y datos de usuario
- Validación de sesión automática

### ✅ Pantalla de Bienvenida
- Información completa del evento asignado
- Datos del validador (nombre, RUT, permisos, estado)
- Banner promocional del evento
- Botón de acceso al escáner QR

### ✅ Escáner de Códigos QR
- Cámara nativa con permisos automáticos
- Interfaz visual con marco de escaneo
- Validación y parseo de datos JSON
- Manejo de errores y códigos inválidos

### ✅ Sistema de Validación Completo
- **Validación de Entradas**: Control de acceso individual por asistente
- **Validación de Alimentos**: Canje unitario o masivo de productos
- **Validación de Bebestibles**: Separación automática de bebidas
- **Validación de Actividades**: Gestión de cupos para actividades

### ✅ Gestión de Estado
- Contexto React para datos QR compartidos
- Estado en tiempo real de canjes y validaciones
- Resúmenes automáticos y contadores
- Persistencia durante la sesión de validación
- Checkbox "Recordar cuenta"
- Validación de campos
- Conexión con API backend
- Manejo de errores de red
- Loading states

### ✅ Pantalla de Bienvenida
- Información del usuario logueado
- Estado de conexión
- Botón de cerrar sesión
- Diseño responsive

### ✅ Servicios
- **ApiService**: Manejo de peticiones HTTP con timeout
- **StorageService**: Persistencia de datos con AsyncStorage
- Manejo de tokens de autenticación
- Logging detallado para debugging

## 🔄 Próximas Funcionalidades

1. **Escáner QR**: Para validar entradas de eventos
2. **Lista de eventos**: Ver eventos asignados al validador
3. **Historial de validaciones**: Registro de entradas validadas
4. **Modo offline**: Funcionalidad básica sin conexión

## 🐛 Debugging

La app incluye logging detallado en la consola:
- 🚀 Inicio de procesos
- ✅ Operaciones exitosas
- ❌ Errores y excepciones
- 📱 Estados de almacenamiento
- 📦 Datos de API

Para ver los logs, abre las Developer Tools en Expo Go o usa `npx react-native log-android` / `npx react-native log-ios`.

## 📞 Soporte

Si encuentras algún problema:
1. Verifica que la URL de ngrok esté activa
2. Revisa los logs en la consola
3. Asegúrate de tener conexión a internet
4. Reinicia el servidor Expo si es necesario
