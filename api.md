# Documentación de la API - Qronos Backend

Esta documentación lista los endpoints disponibles en la API de Qronos, organizados por recurso.

## 👤 Clientes (`/api/cliente`)

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/login` | Inicia sesión de un cliente usando email y pushToken. |
| `POST` | `/` | Crea un nuevo cliente en el sistema. |
| `GET` | `/` | Obtiene la lista de todos los clientes registrados. |
| `GET` | `/:id` | Obtiene la información detallada de un cliente por su ID. |
| `PUT` | `/:id` | Actualiza los datos de un cliente existente. |
| `DELETE` | `/:id` | Elimina un cliente del sistema. |

## 🏢 Empresas (`/api/empresa`)

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/login` | Inicia sesión de una empresa. |
| `POST` | `/` | Registra una nueva empresa. |
| `GET` | `/` | Obtiene la lista de todas las empresas. |
| `GET` | `/:id` | Obtiene la información de una empresa específica por ID. |
| `PUT` | `/:id` | Actualiza la información de una empresa (soporta carga de imágenes a S3). |
| `DELETE` | `/:id` | Elimina una empresa del sistema. |
| `PUT` | `/verify/:auth_uid` | Verifica manualmente una empresa usando su UID de autenticación. |

## 📦 Productos (`/api`)

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/empresas/:id/productos` | Obtiene todos los productos asociados a una empresa específica. |
| `POST` | `/productos` | Crea un nuevo producto (requiere `multipart/form-data` para la imagen). |
| `PUT` | `/productos/:id` | Actualiza un producto existente (soporta actualización de imagen). |
| `DELETE` | `/productos/:id` | Elimina un producto por su ID. |

## 📊 Métricas (`/api/metricas`)

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/register-scan` | Registra el escaneo de un código QR y asigna puntos (Requiere Auth). |
| `POST` | `/` | Crea un registro de métrica manual. |
| `GET` | `/` | Obtiene todas las métricas registradas (Requiere Auth). |
| `GET` | `/cliente/:clienteId` | Obtiene las métricas/puntos de un cliente específico. |
| `GET` | `/empresa/:empresaId` | Obtiene las métricas asociadas a una empresa específica. |
| `GET` | `/:id` | Obtiene una métrica específica por su ID. |
| `PUT` | `/:id` | Actualiza un registro de métrica. |
| `DELETE` | `/:id` | Elimina una métrica. |

## 📱 Códigos QR (`/api/qr`)

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/generate` | Genera un token firmado para la creación de un código QR del cliente (Requiere Auth). |

## 🚀 Landing Page (`/api/landing`)

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/metricas` | Obtiene métricas agregadas para mostrar en la landing page pública. |

## 🔔 Notificaciones (`/api/notifications`)

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/send` | Envía una notificación push a través de Expo. |

---

### Notas Generales
- **Autenticación**: Los endpoints marcados con (Requiere Auth) necesitan un token JWT válido en el header `Authorization`.
- **Formato de Datos**: La mayoría de los endpoints aceptan y devuelven datos en formato JSON, excepto aquellos de creación/edición de empresas y productos que utilizan `multipart/form-data` para manejar archivos de imagen.
