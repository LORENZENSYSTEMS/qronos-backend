# Documentación de Estructura — Qronos Backend

Este documento describe **qué contiene cada carpeta, subcarpeta y archivo** del proyecto, con descripciones generales para ubicar rápidamente dónde vive cada parte del código y qué dominio maneja. No entra en funciones ni en detalles de implementación.

---

## Patrón arquitectónico

Casi todos los módulos de `src/routes/` siguen el mismo esquema en tres capas:

- **Controller** (`*Controller.js` o carpeta `Controllers/`): capa HTTP. Expone y agrupa los endpoints de un dominio.
- **Repositories/** (`*Repository.js`): capa de acceso a datos. Todo el acceso a la base de datos (Prisma) de ese dominio.
- **Services/** (`*Service.js`): capa de reglas de negocio. Recibe su repositorio por inyección y no toca la base de datos directamente.
- **`Services/errors.js`**: errores de dominio reutilizables del módulo (p. ej. `NotFoundError`, `ValidationError`).
- **`Services/services.js`**: "barril" (barrel) que re-exporta los services y errores para simplificar los imports.

Con esto, para saber dónde está algo basta con:

| Quieres... | Busca en... |
|---|---|
| Endpoints / rutas HTTP | el `Controller` del módulo |
| Consultas a la base de datos | la carpeta `Repositories/` del módulo |
| Reglas de negocio | la carpeta `Services/` del módulo |
| Manejo de un dominio concreto | su carpeta bajo `src/routes/` |

---

## Raíz del proyecto

- **`main.js`** — Punto de entrada del backend: configura el servidor Fastify (logger, CORS, multipart, JWT), registra los plugins y todos los módulos de rutas de `src/routes/`, y arranca el servidor HTTP.
- **`api.md`** — Referencia existente de los endpoints de la API.
- **`CLAUDE.md`** — Convenciones del repositorio (nombres, principios SOLID).
- **`docs/`** — Este documento de documentación.
- **`tests/`** — Suites de pruebas por módulo (vitest).
- **`prisma/`** — Esquema y migraciones de la base de datos.

---

## `src/plugins/` — Plugins e infraestructura compartida

- **`database.js`** — Inicializa y exporta el cliente `PrismaClient` (PostgreSQL) de uso común en todo el proyecto.
- **`auth.js`** — Configura JWT y el hook de autenticación para proteger rutas.
- **`bcrypt.js`** — Utilidades de hash y verificación de contraseñas.
- **`email.js`** — Configuración y envío de correos electrónicos (Nodemailer).
- **`firebaseAdmin.js`** — Inicialización de Firebase Admin (Auth y Firestore).

---

## `src/utils/` — Utilidades generales

- **`s3Config.js`** — Configuración del cliente AWS S3 y subida de imágenes a la nube.
- **`validate.js`** — Utilidades de validación/normalización de datos (p. ej. correos).

---

## `src/routes/` — Módulos de negocio

### AdminPanel
Panel administrativo del catálogo: países, ciudades, categorías y el destacado de empresas.

- **`AdminPanelController.js`** — Controlador raíz: instancia los repositorios y servicios y registra los subcontroladores bajo `/api`.
- **`index.js`** — Punto de entrada del módulo que registra el controlador en Fastify.
- **`Controllers/enviarError.js`** — Utilidad compartida para formatear respuestas de error.

**`Controllers/`**
- **`PaisController.js`** — Endpoints CRUD de países.
- **`CiudadController.js`** — Endpoints CRUD de ciudades.
- **`CategoriaController.js`** — Endpoints CRUD de categorías.
- **`EmpresaController.js`** — Endpoints para destacar empresas y listar las destacadas.

**`Repositories/`**
- **`PaisRepository.js`** — Acceso a datos de países.
- **`CiudadRepository.js`** — Acceso a datos de ciudades.
- **`CategoriaRepository.js`** — Acceso a datos de categorías.
- **`EmpresaRepository.js`** — Acceso a datos de empresas (destacadas/populares).

**`Services/`**
- **`PaisService.js`** — Reglas de negocio de países.
- **`CiudadService.js`** — Reglas de negocio de ciudades.
- **`CategoriaService.js`** — Reglas de negocio de categorías.
- **`EmpresaService.js`** — Reglas de negocio de empresas destacadas.
- **`MigracionService.js`** — Migración de datos existentes de empresas (país/ciudad/categoría).
- **`errors.js`** — Errores de dominio del módulo.
- **`services.js`** — Barril de re-exportación.

---

### Cancha
Canchas deportivas y sus reservas.

- **`CanchaController.js`** — Endpoints de canchas y reservas (CRUD, disponibilidad, reservar).

**`Repositories/`**
- **`CanchaRepository.js`** — Acceso a datos de canchas.
- **`ReservaCanchaRepository.js`** — Acceso a datos de reservas de canchas.

**`Services/`**
- **`CanchaService.js`** — Reglas de negocio de canchas.
- **`DisponibilidadService.js`** — Cálculo de canchas disponibles por fecha y rango horario.
- **`ReservaCanchaService.js`** — Reglas de negocio de reservas de canchas.
- **`SlotConflictChecker.js`** — Verificación de solapamientos de horarios entre reservas.
- **`errors.js`** — Errores de dominio del módulo.
- **`services.js`** — Barril de re-exportación.

---

### CategoriaProducto
Categorías de productos de las empresas.

- **`CategoriaProductoController.js`** — Endpoints CRUD de categorías de producto.

**`Repositories/`**
- **`CategoriaProductoRepository.js`** — Acceso a datos de categorías de producto.

**`Services/`**
- **`CategoriaProductoService.js`** — Reglas de negocio de categorías de producto.
- **`errors.js`** — Errores de dominio del módulo.
- **`services.js`** — Barril de re-exportación.

---

### Cliente
Autenticación y gestión de clientes.

- **`ClienteController.js`** — Endpoints de registro, inicio de sesión y perfiles de clientes.

**`Repositories/`**
- **`ClienteRepository.js`** — Acceso a datos de clientes.
- **`EmpresaRepository.js`** — Acceso a datos de empresas, usado por la lógica de autenticación.

**`Services/`**
- **`ClienteService.js`** — Reglas de negocio de gestión de clientes.
- **`AuthService.js`** — Búsqueda de perfiles (cliente/empresa) para la autenticación.
- **`SesionService.js`** — Orquestación del flujo de inicio de sesión.
- **`JwtService.js`** — Firma y emisión de tokens JWT.
- **`PasswordService.js`** — Hash y verificación de contraseñas.
- **`PushTokenService.js`** — Actualización de tokens de push de clientes y empresas.
- **`errors.js`** — Errores de dominio del módulo.
- **`services.js`** — Barril de re-exportación.

---

### Empresa
Gestión de empresas.

- **`EmpresaController.js`** — Endpoints de empresas (login, creación, listado, actualización).

**`Repositories/`**
- **`EmpresaRepository.js`** — Acceso a datos de empresas.

**`Services/`**
- **`EmpresaService.js`** — Reglas de negocio de empresas.
- **`EmpresaUpdateService.js`** — Procesamiento de actualizaciones con subida de archivos/imágenes.
- **`FirebaseService.js`** — Gestión de usuarios en Firebase Auth.
- **`errors.js`** — Errores de dominio del módulo.
- **`services.js`** — Barril de re-exportación.

---

### Mesa
Mesas y sus reservas.

- **`MesaController.js`** — Endpoints de mesas y reservas (CRUD, disponibilidad, reservar).

**`Repositories/`**
- **`MesaRepository.js`** — Acceso a datos de mesas.
- **`ReservaMesaRepository.js`** — Acceso a datos de reservas de mesas.

**`Services/`**
- **`MesaService.js`** — Reglas de negocio de mesas.
- **`DisponibilidadService.js`** — Cálculo de mesas disponibles por fecha y hora.
- **`ReservaMesaService.js`** — Reglas de negocio de reservas de mesas.
- **`errors.js`** — Errores de dominio del módulo.
- **`services.js`** — Barril de re-exportación.

---

### MetricasCliente
Métricas y escaneos QR de clientes (fidelización por puntos).

- **`MetricaController.js`** — Endpoints de registro de escaneos y consulta de métricas.

**`Repositories/`**
- **`MetricaRepository.js`** — Acceso a datos de métricas y escaneos.

**`Services/`**
- **`MetricaService.js`** — Reglas de negocio de métricas (registrar escaneo, sumar puntos).
- **`QrTokenValidator.js`** — Validación de la firma y expiración de tokens QR.
- **`errors.js`** — Errores de dominio del módulo.
- **`services.js`** — Barril de re-exportación.

---

### MetricasLandingPage
Métricas agregadas públicas para la landing page.

- **`LandingController.js`** — Endpoints de métricas de la landing page.

**`Repositories/`**
- **`LandingPageRepository.js`** — Consultas de totales (clientes, empresas) para la landing.

**`Services/`**
- **`LandingPageService.js`** — Composición de las métricas agregadas de la landing.
- **`errors.js`** — Errores de dominio del módulo.
- **`services.js`** — Barril de re-exportación.

---

### Notificaciones
Envío de notificaciones push.

- **`NotificacionController.js`** — Endpoints de envío de notificaciones (a usuario, por filtros, histórico, estadísticas).

**`Repositories/`**
- **`ClienteTokenRepository.js`** — Acceso a los tokens de push de los clientes.
- **`NotificacionRepository.js`** — Acceso a datos de notificaciones registradas.

**`Services/`**
- **`NotificacionService.js`** — Reglas de negocio de envío y registro de notificaciones.
- **`ExpoPushService.js`** — Integración con el servicio de notificaciones push (Expo).
- **`errors.js`** — Errores de dominio del módulo.
- **`services.js`** — Barril de re-exportación.

---

### Producto
Productos de las empresas.

- **`ProductoController.js`** — Endpoints CRUD de productos y listados por empresa/categoría.

**`Repositories/`**
- **`ProductoRepository.js`** — Acceso a datos de productos.

**`Services/`**
- **`ProductoService.js`** — Reglas de negocio de productos.
- **`errors.js`** — Errores de dominio del módulo.
- **`services.js`** — Barril de re-exportación.

---

### Qr
Generación de códigos QR para fidelización.

- **`QrController.js`** — Endpoint de generación de tokens QR.

**`Repositories/`**
- **`ClienteRepository.js`** — Verificación de existencia del cliente para generar el QR.

**`Services/`**
- **`QrService.js`** — Reglas de negocio de generación del QR.
- **`QrTokenSigner.js`** — Firma del token QR con HMAC.
- **`errors.js`** — Errores de dominio del módulo.
- **`services.js`** — Barril de re-exportación.
