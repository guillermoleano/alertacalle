# ZDanger — Especificación técnica

> Última actualización: 2026-06-08
> 📐 Documento de **diseño** (handoff de vistas, tokens): ver `claude/zdanger-design-spec.md`

## Descripción general

App web (con proyección a móvil) para el reporte ciudadano de asaltos y robos en ciudades latinoamericanas. Los usuarios pueden registrar incidentes con ubicación, tipo de delito, descripción y evidencia fotográfica. Los reportes se visualizan en un mapa interactivo de Mapbox con pines por nivel de riesgo, sistema de validación comunitaria y puntaje de confianza.

---

## Stack tecnológico actual

| Capa | Tecnología | Estado |
|---|---|---|
| Backend | Laravel 13 (PHP 8.4) | ✅ Activo |
| SPA bridge | Inertia.js v3 | ✅ Activo |
| Frontend | React 19 + TypeScript + Vite 8 | ✅ Activo |
| Estilos | Tailwind CSS v4 + sistema de tokens `--ac-*` (Material Design 3) | ✅ Activo |
| Mapa | Mapbox GL JS (`mapbox-gl`) | ✅ Integrado |
| Base de datos | SQLite (dev) → PostgreSQL + PostGIS (prod) | 🔄 Dev: SQLite |
| Storage de archivos | Local (dev) → Cloudflare R2 / S3 (prod) | Pendiente |
| Autenticación | Laravel Fortify + Passkeys (`@laravel/passkeys`) | ✅ Activo |
| Push notifications | Firebase Cloud Messaging (FCM) | Fase 2 |
| Cache | Database (dev) → Redis (prod) | 🔄 Dev: Database |
| Servidor local | Laravel Herd (`zdanger.test`) | ✅ Activo |

---

## Arquitectura frontend

### Patrón
Inertia.js con React — no hay API REST separada en esta etapa. Cada página es un componente `.tsx` en `resources/js/pages/` que recibe props del controlador Laravel directamente (sin fetch/axios).

### Estructura de directorios
```
resources/js/
├── components/
│   └── alertacalle/
│       ├── app-frame.tsx          — Shell principal: sidebar, header, nav
│       ├── report-card.tsx        — Card de reporte con votos y trust score
│       ├── mapbox-map.tsx         — Mapa interactivo (Mapbox GL JS)
│       └── calm-map-preview.tsx   — SVG preview (legacy, reemplazado por MapboxMap)
├── data/
│   └── demo-reports.ts            — Datos de demostración con coords reales de Bogotá
├── hooks/
│   ├── use-stagger.ts             — Animaciones de entrada escalonadas
│   └── use-appearance.ts          — Toggle dark/light mode
├── pages/
│   ├── mapa.tsx                   — Mapa de riesgo con sidebar de reportes
│   ├── reportes.tsx               — Grilla de reportes con filtros y ordenamiento
│   ├── reportar.tsx               — Wizard 3 pasos para crear reporte
│   ├── ajustes.tsx                — Configuración de cuenta, notifs, privacidad, apariencia
│   └── mi-perfil.tsx              — Perfil del usuario
└── css/
    └── app.css                    — Tokens --ac-*, dark mode, keyframes
```

---

## Sistema de diseño

### Tokens CSS (Material Design 3)
Todos los colores se referencian mediante variables `--ac-*` en lugar de clases hardcodeadas. Esto garantiza que dark mode funcione automáticamente al sobrescribir los tokens en `.dark {}`.

```css
/* Light (default en :root) */
--ac-primary: #00236f
--ac-secondary: #006b5f
--ac-surface-container-lowest: #ffffff
--ac-on-surface: #131b2e
--ac-outline-variant: #c5c5d3

/* Dark (sobrescrito en .dark) */
--ac-primary: #b6c4ff
--ac-secondary: #4fdbc8
--ac-surface-container-lowest: #090c12
--ac-on-surface: #dfe3f7
--ac-outline-variant: #2c3348
```

### Dark mode
- Activado por `useAppearance` hook → agrega clase `.dark` a `<html>`
- Persistido en `localStorage` y cookie
- `ThemeToggle` en el header (ícono sol/luna con animación de rotación)
- Mapbox cambia automáticamente de estilo `light-v11` → `dark-v11` vía `MutationObserver`

### Animaciones
- `useStagger` hook — anima los hijos de un contenedor con delays escalonados (60ms entre elementos)
- `ac-card-enter` keyframe — fade + slide up en montaje de cards
- `ac-btn-ripple` — efecto ripple en botones primarios
- `active:scale-95` — feedback táctil en todos los botones interactivos

---

## Componente MapboxMap

**Archivo:** `resources/js/components/alertacalle/mapbox-map.tsx`

**Token:** `VITE_MAPBOX_TOKEN` en `.env`

### Features implementadas
- Pines circulares con emoji por tipo de incidente y color por nivel de riesgo
  - 🔴 Alto → `#ef4444`
  - 🟡 Medio → `#f59e0b`
  - 🟢 Bajo → `#10b981`
- Anillo pulsante (`zdanger-ping`) en pines de **alto riesgo**
- Hover con `scale(1.15)` en el pin
- **Popup** al hacer click: tipo, título, ubicación, tiempo, trust score
- `fitBounds` automático al cargar — encuadra todos los reportes visibles
- Sincronización bidireccional con sidebar: click en pin → resalta card; click en card → resalta pin
- Filtros de tipo y búsqueda actualizan los pines en tiempo real
- Sync dark/light mode automático vía `MutationObserver`
- Fallback UI elegante cuando `VITE_MAPBOX_TOKEN` no está configurado

### Props
```typescript
interface Props {
    reports: ReportSummary[];
    center?: [number, number];   // default: Bogotá [-74.0721, 4.7110]
    zoom?: number;               // default: 13
    className?: string;
    onSelectReport?: (id: string | null) => void;
    selectedReportId?: string | null;
}
```

---

## Modelos de datos

### `users` (existente — Laravel Fortify)
```
id (uuid)
name (string)
email (string, unique)
phone (string, nullable)
password (hashed)
alerts_seen_at (timestamp, nullable) — marca de "notificaciones leídas"
role (enum: citizen, moderator, authority) — pendiente agregar
fcm_token (string, nullable) — Fase 2
created_at / updated_at
```

> Nota: las tablas usan PK `bigint` autoincrement (`$table->id()`), no UUID
> (el esquema de abajo se conserva como referencia conceptual).

### `reports`
```
id (uuid)
user_id (uuid, FK → users, nullable — reportes anónimos)
type (enum: mugging, vehicle_theft, phone_theft, pickpocket,
           motorcycle_robbery, bank_followup, intimidation, other)
title (string)
description (text)
note (string 200, nullable) — nota adicional opcional del reportante
status (enum: pending, validated, rejected, fake)
risk_level (enum: Alto, Medio, Bajo) — derivado de votos (trust_score)
severity (Alta/Media/Baja) — derivada del tipo en código (Report::severityForType),
          no es columna; se serializa en toInertia()
latitude (decimal 10,7)
longitude (decimal 10,7)
address (string)
cross_street (string, nullable)
neighborhood (string, nullable)
city (string, default: 'Bogotá')
confirms_count (integer, default: 0)
denies_count (integer, default: 0)
trust_score (integer, default: 0) — 0-100
occurred_at (timestamp)
created_at / updated_at
```

### `report_votes`
```
id (uuid)
report_id (uuid, FK → reports)
user_id (uuid, FK → users, nullable)
ip_address (string) — para votos anónimos
vote (enum: confirm, deny)
created_at
UNIQUE(report_id, user_id) — un voto por usuario por reporte
```

### `report_media`
```
id (uuid)
report_id (uuid, FK → reports)
disk (string, default: 'local')
path (string)
url (string, virtual)
mime_type (string)
size_bytes (integer)
created_at
```

### `alert_zones` ✅ implementada
```
id
user_id (FK → users, cascade on delete)
label (string) — ej: "Casa", "Trabajo", "Gym"
latitude (decimal)
longitude (decimal)
radius_meters (integer, default: 500)
active (boolean, default: true)
created_at / updated_at
```

---

## Trust Score

El puntaje de confianza (0-100) se calcula con la fórmula:

```
trust_score = (confirms / (confirms + denies)) * 100
            * log10(confirms + denies + 1) / log10(11)
            (capped en 100)
```

Esto pondera por cantidad de votos: un reporte con 10 confirms/0 denies pesa más que uno con 1/0.

### Umbrales de risk_level automático
| trust_score | risk_level |
|---|---|
| ≥ 70 | Alto |
| 40–69 | Medio |
| < 40 | Bajo |

---

## Tipos de incidente

| Key (DB) | Label UI | Emoji |
|---|---|---|
| `phone_theft` | Hurto celular | 📱 |
| `mugging` | Atraco a pie | 🚶 |
| `motorcycle_robbery` | Atraco en moto | 🏍️ |
| `bank_followup` | Fleteo | 💳 |
| `pickpocket` | Cosquilleo | 👋 |
| `intimidation` | Intimidación con arma | ⚠️ |
| `other` | Otro | 📋 |

---

## Páginas implementadas

### `/mapa` — Mapa de riesgo
- Stats bar: reportes hoy, zona alto riesgo, validados, confianza promedio
- Búsqueda en tiempo real (título + ubicación)
- Chips de filtro por tipo de incidente
- **Mapa Mapbox** con pines, popups, fitBounds automático
- Sidebar con lista de reportes filtrados
- Selección bidireccional mapa ↔ sidebar

### `/reportes` — Grilla de reportes
- Stats: total, alto/medio/bajo riesgo
- Búsqueda + ordenamiento (reciente / confianza / riesgo)
- Tabs de nivel de riesgo
- Chips de tipo de incidente
- Grilla responsive (1/2/3 columnas) con `useStagger`
- Empty state con "Limpiar filtros"

### `/reportar` — Wizard de reporte (3 pasos)
1. **Ubicación** — calle, cruce, barrio, fecha/hora del hecho
2. **Detalles** — tipo (radio grid con emojis), descripción con contador, toggle anónimo
3. **Evidencia** — drag & drop de fotos, previews, nota de privacidad
- Indicador de pasos con `CheckCircle2` para completados
- Pantalla de éxito con animación zoom tras submit

### `/ajustes` — Configuración
- **Cuenta** — nombre, email, teléfono (badge PENDIENTE), contraseña
- **Notificaciones** — 4 toggles + chips de sonido
- **Privacidad** — 3 toggles + exportar datos / política
- **Apariencia** — chips de tema, estilos de mapa, slider de tamaño de fuente
- **Zonas de alerta** — lista de zonas con hover edit/delete
- **Zona de peligro** — logout + modal de eliminar cuenta
- `useStagger` en secciones

### `/mi-perfil` — Perfil
- Info del usuario, estadísticas de contribución

---

## Rutas web (Inertia)

Esquema **mixto**: la lectura es pública; escribir y las páginas de cuenta
requieren sesión (`auth`).

```php
/* Público */
Route::get('/mapa',     [ReportController::class, 'mapa'])->name('mapa');
Route::get('/reportes', [ReportController::class, 'index'])->name('reportes');

/* Requiere auth */
Route::middleware(['auth'])->group(function () {
    Route::get('/reportar',  [ReportController::class, 'create'])->name('reportar');
    Route::post('/reportar', [ReportController::class, 'store'])->name('reportar.store');
    Route::post('/reportes/{report}/vote', [ReportController::class, 'vote'])->name('reportes.vote');

    Route::get('/mi-perfil', [ReportController::class, 'profile'])->name('mi-perfil');
    Route::get('/ajustes',   [AlertZoneController::class, 'index'])->name('ajustes');

    Route::post('/zonas',          [AlertZoneController::class, 'store'])->name('zonas.store');
    Route::put('/zonas/{zone}',    [AlertZoneController::class, 'update'])->name('zonas.update');
    Route::delete('/zonas/{zone}', [AlertZoneController::class, 'destroy'])->name('zonas.destroy');

    Route::post('/notificaciones/visto', [NotificationController::class, 'seen'])->name('notificaciones.visto');
});
```

---

## Variables de entorno relevantes

```env
APP_NAME=ZDanger
APP_URL=https://zdanger.test   # HTTPS (herd secure) — requerido por geolocalización

DB_CONNECTION=sqlite          # dev
# DB_CONNECTION=pgsql         # prod (con PostGIS para queries geoespaciales)

VITE_APP_NAME="${APP_NAME}"
VITE_MAPBOX_TOKEN=pk.eyJ1...  # Mapbox public token
```

---

## Reglas de negocio

### Validación de reportes
- Reporte nuevo → estado `pending`
- 5 votos `confirm` → `validated` (aparece en mapa público)
- 3 votos `deny` → `fake` (oculto del mapa)
- Moderadores/autoridades pueden cambiar estado manualmente

### Anonimato
- `user_id` nullable → reportes anónimos permitidos
- Los datos del reportante nunca son públicos en la API
- Votos anónimos se trackean por IP (un voto por IP por reporte)

### Media
- Máximo 3 archivos por reporte
- Formatos: jpg, png, mp4
- Tamaño máximo: 10MB por archivo

### Rate limiting
- 5 reportes por hora por usuario/IP
- 10 votos por hora por usuario/IP

---

## Consideraciones de seguridad

- Rate limiting en POST `/reportar` y `/vote`
- Validación de coordenadas en rango geográfico válido
- URLs de media firmadas con expiración (producción)
- Sanitización de texto (evitar XSS)
- Auth requerida para crear reportes y votar; pública la lectura del mapa

---

## Estado de desarrollo

### ✅ Completado
- Shell de la app (sidebar, header, dark mode, nav)
- Sistema de tokens `--ac-*` con dark mode completo
- Páginas: Mapa, Reportes, Reportar (wizard), Ajustes, Mi Perfil
- Componente `MapboxMap` con pines, popups, dark mode sync, fitBounds
- Componente `ReportCard` con trust score bar y sistema de votos
- Hook `useStagger` para animaciones escalonadas
- Migraciones: `reports`, `report_votes`, `report_media`
- Modelos: `Report`, `ReportVote`, `ReportMedia`
- Controlador `ReportController` (métodos: mapa, index, create, store, vote)
- Seeder con 5 reportes de demostración (coords reales de Bogotá)

### ✅ Hito 1 — Backend conectado (MVP funcional)
- Rutas del `ReportController` registradas en `web.php` con **auth mixto**
  (mapa/reportes públicos; reportar/votar requieren sesión)
- Migraciones corridas + seeder cargado (5 reportes reales)
- `mapa.tsx` y `reportes.tsx` consumen props reales desde la DB (ya no `demoReports`)
- Wizard `/reportar` conectado al `store()` vía Inertia `router.post`
  (validación, estado de envío, redirect con flash toast)
- Votos persistidos vía `router.post` con feedback optimista en `ReportCard`
- `Report::toInertia()` serializa `lat`/`lng` (shape que espera el frontend)
- Flash toasts: `flash.toast` compartido en `HandleInertiaRequests` +
  `useFlashToast` reescrito sobre el bus de eventos del router (vive fuera del
  contexto Inertia, por eso no usa `usePage`)
- **Fix MapboxMap**: los markers se agregaban con un gate sobre `styleLoaded`
  que nunca se cumplía (el `initializeTheme()` togglea la clase `.dark` tras
  crear el mapa → `MutationObserver` dispara `setStyle()` → estilo en loading).
  Los markers son overlays del DOM y no dependen del estilo: se quitó el gate.

### ✅ Hito 2 — Reporte con sustancia
- **Geocodificación** de la dirección del wizard vía Mapbox Geocoding API
  (`resources/js/lib/mapbox-geocode.ts`), sesgada a Bogotá con `proximity` +
  `bbox` para mantener resultados dentro de la ciudad
- **Botón "Mi ubicación"** con `navigator.geolocation` + reverse geocoding
  (rellena calle y barrio, fija lat/lng exactas con badge de confirmación)
- **Subida real de evidencia**: input de archivos con thumbnails, envío vía
  `router.post` con `forceFormData`, guardado en `storage/app/public/reports/{id}`
  y registros en `report_media` (`php artisan storage:link` ejecutado)
- Validación backend: máx. 3 archivos, jpg/png/mp4, 10 MB c/u
- **Tests** (`tests/Feature/ReportSubmissionTest.php`, 4 casos): auth mixto,
  envío con evidencia, address requerido, límites de media
- Fix de infra: habilitado `RefreshDatabase` global en `tests/Pest.php`
  (estaba comentado → 30 tests de auth/settings fallaban). Suite: 43 ✓

### ✅ Hito 3 — Identidad
- **Auth branding**: layout `auth-simple-layout.tsx` con identidad ZDanger
  (ShieldCheck + tagline, card elevada, glows de marca, tokens `--ac-*`)
- **Mi Perfil real** (`ReportController@profile`, ruta con auth): nombre,
  email, "miembro desde", reputación calculada (0–1000), stats (reportes /
  validados / confirmaciones), reportes propios con empty state
- **Cuenta en Ajustes**: muestra nombre/email reales (vía `auth.user`
  compartido) y enrutan a `/settings/profile` y `/settings/security`
- **Tests** (`tests/Feature/ProfilePageTest.php`): auth requerido +
  stats/reputación calculadas correctamente. Suite: 45 ✓ / 176 assertions

### ✅ Hito 4 — Frente #2: Zonas de alerta + notificaciones
- **Zonas de alerta funcionales** (`alert_zones`: label, lat/lng, radio, active):
  migración + modelo `AlertZone` + factory, `AlertZoneController`
  (`index` rinde `/ajustes` con las zonas del usuario; `store`/`update`/`destroy`
  con auth y chequeo de propiedad → 403 si la zona es ajena)
- **Ajustes**: sección de zonas conectada a datos reales (antes mock).
  Modal de alta/edición con nombre, radio (300/500/800/1000 m), geocoding de
  dirección (`forwardGeocode`) + botón "usar mi ubicación"
  (`navigator.geolocation` + `reverseGeocode`). Empty state + borrado con confirm
- **Campana de notificaciones real** en el header (`app-frame.tsx`): dropdown con
  badge de no-leídas, cierre por click-afuera/Escape. Reemplaza el punto rojo
  decorativo
- **Feed derivado on-the-fly** (sin tabla, sin event-wiring) vía servicio
  `App\Support\UserAlerts`: (a) reportes recientes dentro de zonas activas
  (Haversine en PHP) y (b) confirmaciones de terceros a mis reportes. Se comparte
  globalmente en `HandleInertiaRequests` (`notifications: { unread, items }`)
- **No-leídas** vía `users.alerts_seen_at`; `POST /notificaciones/visto` lo setea
  y refresca solo la prop (`router.reload only: ['notifications']`)
- **Tests** (`AlertZoneTest` 7 casos, `NotificationsTest` 5 casos): CRUD + auth +
  propiedad, alertas por zona/validación, exclusión de votos propios, marcar
  visto. Suite: 57 ✓ / 258 assertions

### ✅ Hito 4 — Filtro por fecha (completo)
- Filtro por rango de fecha (Todo / 24 h / 7 días / 30 días) en **`/mapa`**
  (frente #1) y portado a **`/reportes`** (frente #2). Client-side sobre
  `occurredAt ?? createdAt`, integrado al reset de "Limpiar filtros".
  Con esto el Hito 4 queda cerrado por completo.

### ✅ Mejoras de reporte y ubicación
- **Mapa interactivo de ubicación** (`LocationPickerMap`): reemplaza la grilla
  SVG falsa del wizard. Pin arrastrable + click para marcar; sincronizado con
  "mi ubicación" y con el geocoding de la dirección (mueve y recentra el pin)
- **Autodetección de ubicación al abrir** el wizard (una vez). Requiere
  **contexto seguro**: el sitio se sirve por **HTTPS** (`herd secure` +
  `APP_URL=https://zdanger.test`), obligatorio para `navigator.geolocation`
- **Severidad por tipo de incidente** (`Report::severityForType`, Alta/Media/Baja):
  filtro de severidad en `/mapa` y `/reportes` + indicador en `ReportCard`.
  Distinta del `risk_level` (que se deriva de los votos)
- **Fecha del hecho no futura**: validación `before_or_equal:now` en backend +
  `max` en el `datetime-local`. (De paso fix de un 500 latente en `store()`
  cuando faltaba `title`.)
- **Nota libre opcional** (`reports.note`, máx 200): campo en el wizard +
  callout en `ReportCard`
- **Tests** sumados: `ReportSeverityTest` (mapeo + serialización) y casos nuevos
  en `ReportSubmissionTest` (fecha futura/pasada, nota y su límite).
  Suite: **70 ✓ / 281 assertions**

### 📋 Próximo — Fase 2
- Alertas push por zona (FCM)
- Panel de moderación
- Heatmap (Mapbox Heatmap layer)
- App móvil (React Native + Expo)
- Estadísticas públicas por barrio/ciudad

### 📋 Fase 3
- Acceso para autoridades con validación oficial
- Exportación de datos para municipios
- Clustering de pines en el mapa (Mapbox Supercluster)
- Modo offline (Service Worker + IndexedDB)
