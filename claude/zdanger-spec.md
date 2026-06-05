# ZDanger — Especificación técnica (MVP)

## Descripción general

App móvil y web para el reporte ciudadano de asaltos y robos. Los usuarios pueden registrar incidentes con ubicación GPS, tipo de delito, descripción y evidencia fotográfica. Los reportes se visualizan en un mapa interactivo con alertas por zonas.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend API | Laravel 11 (PHP 8.3) |
| Base de datos | PostgreSQL + PostGIS |
| Frontend web | React + TypeScript + Vite |
| App móvil | React Native (Expo) |
| Mapa | Google Maps SDK / React Native Maps |
| Storage de archivos | Cloudflare R2 (compatible S3) |
| Autenticación | Laravel Sanctum (tokens) |
| Push notifications | Firebase Cloud Messaging (FCM) |
| Cache | Redis |

---

## Modelos de datos

### `users`
```
id (uuid)
name (string)
email (string, unique)
phone (string, nullable)
password (hashed)
role (enum: citizen, moderator, authority)
fcm_token (string, nullable) — para notificaciones push
created_at / updated_at
```

### `reports`
```
id (uuid)
user_id (uuid, FK → users) — nullable si se permite anónimo
type (enum: mugging, vehicle_theft, home_robbery, other)
description (text)
status (enum: pending, validated, rejected, fake)
latitude (decimal 10,7)
longitude (decimal 10,7)
address (string) — calle, cruce, barrio
neighborhood (string)
city (string)
occurred_at (timestamp) — hora real del hecho
created_at / updated_at
```

### `report_media`
```
id (uuid)
report_id (uuid, FK → reports)
url (string) — URL en R2/S3
type (enum: photo, video)
created_at
```

### `report_votes`
```
id (uuid)
report_id (uuid, FK → reports)
user_id (uuid, FK → users)
vote (enum: confirm, fake)
created_at
```

### `alert_zones`
```
id (uuid)
user_id (uuid, FK → users)
label (string) — ej: "Casa", "Trabajo"
latitude (decimal)
longitude (decimal)
radius_meters (integer) — default: 500
created_at
```

---

## API Endpoints (REST)

### Autenticación
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Reportes
```
GET    /api/reports              — listado paginado con filtros
POST   /api/reports              — crear reporte (multipart/form-data para archivos)
GET    /api/reports/{id}         — detalle de un reporte
PATCH  /api/reports/{id}/status  — cambiar estado (moderador/autoridad)
DELETE /api/reports/{id}         — eliminar propio reporte
```

### Mapa
```
GET    /api/reports/map          — reportes en bounding box (params: lat, lng, radius, from, to, type)
GET    /api/reports/heatmap      — puntos para mapa de calor
```

### Votos (validación comunitaria)
```
POST   /api/reports/{id}/vote    — body: { vote: "confirm" | "fake" }
```

### Zonas de alerta
```
GET    /api/alert-zones
POST   /api/alert-zones
DELETE /api/alert-zones/{id}
```

### Media
```
POST   /api/reports/{id}/media   — subir foto/video
DELETE /api/media/{id}
```

---

## Reglas de negocio

### Validación de reportes
- Un reporte nuevo queda en estado `pending`
- Si recibe 5 votos `confirm` → pasa a `validated`
- Si recibe 3 votos `fake` → pasa a `fake` y se oculta del mapa
- Moderadores y autoridades pueden cambiar el estado manualmente

### Alertas push
- Al crearse un reporte `validated`, el sistema busca usuarios con `alert_zones` dentro del radio del reporte
- Se envía notificación FCM a esos usuarios

### Anonimato
- El `user_id` en `reports` puede ser null si el usuario elige reportar anónimamente
- Los datos del reportante nunca son públicos en la API

### Media
- Máximo 3 archivos por reporte
- Formatos permitidos: jpg, png, mp4
- Tamaño máximo: 10MB por archivo

---

## Filtros del mapa (GET /api/reports/map)

| Parámetro | Tipo | Descripción |
|---|---|---|
| lat | float | Latitud centro |
| lng | float | Longitud centro |
| radius | integer | Radio en metros (default 2000) |
| type | string | Tipo de incidente (opcional) |
| status | string | pending, validated (default: validated) |
| from | date | Fecha desde (default: -30 días) |
| to | date | Fecha hasta (default: hoy) |

---

## Consideraciones de seguridad

- Rate limiting en endpoints de reporte: máximo 5 reportes por hora por usuario/IP
- Validación de coordenadas dentro de rango geográfico válido
- Las URLs de media son firmadas (tiempo de expiración) o privadas
- Sanitización de descripciones (evitar XSS si se renderiza en web)
- Autenticación requerida para votar y crear alertas; opcional para ver el mapa

---

## Fases de desarrollo

### Fase 1 — MVP
- [x] Auth (registro, login)
- [x] CRUD de reportes con foto y GPS
- [x] Mapa con reportes validados
- [x] Votos comunitarios

### Fase 2
- [ ] Alertas push por zona
- [ ] Panel de moderación
- [ ] App móvil (React Native)

### Fase 3
- [ ] Acceso para autoridades con validación oficial
- [ ] Mapa de calor
- [ ] Estadísticas públicas por barrio/ciudad
- [ ] Exportación de datos para municipios
