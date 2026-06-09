# ZDanger — Especificación de diseño (Laravel + handoff de vistas Stitch)

> ℹ️ **Documento de diseño** (handoff de vistas, tokens Material, reglas de producto).
> Para el estado técnico de implementación ver **`claude/zdanger-spec.md`**.
> _Nota: "AlertaCalle" era el nombre previo del proyecto, hoy **ZDanger**._

> **Reemplaza** la sección de stack de la v2. Esta versión asume **proyecto Laravel** con las vistas de Stitch en `resources/views`. El núcleo de producto (modelo de datos, lógica de confianza, privacidad, antiabuso) se mantiene; aquí se expresa en términos de Laravel y se añade el handoff de las vistas.
> **Fuente de verdad de diseño:** el **front-matter YAML de `DESIGN.md`** (tokens Material). Donde la prosa de DESIGN.md cite hex distintos, **ignorarla**: gana el YAML (los screenshots se generaron con esos tokens).
 
---
 
## 0. Reglas de oro (no cambian)
1. Reporte ultrarrápido, **anónimo por defecto**.
2. **Hechos en lugares, NUNCA personas.** Sin nombres, caras ni placas; ni en datos semilla, ni en placeholders, ni en descripciones.
3. Privacidad por diseño (Ley 1581/2012): minimización, consentimiento, supresión.
4. Antiabuso desde el día 1.
5. Estética **calmada, no alarmista**: mapa desaturado, rojo solo para riesgo alto.
---
 
## 1. Stack (Laravel) — estado real implementado

> Esta sección documenta el stack **realmente construido**, que difiere del plan
> original (Blade + Alpine + Livewire + PostGIS). La fuente de verdad técnica
> completa es `zdanger-spec.md`.

- **Backend:** Laravel 13 (PHP 8.4).
- **SPA bridge:** **Inertia.js v3** — sin API REST separada; cada página recibe props del controlador.
- **Frontend:** **React 19 + TypeScript + Vite** + **Tailwind v4** (tokens `--ac-*`, dark mode automático). Las páginas viven en `resources/js/pages/*.tsx`.
- **Base de datos:** **SQLite** en dev → **PostgreSQL + PostGIS** previsto para prod. Por ahora las consultas por distancia (zonas de alerta) se resuelven con **Haversine en PHP**, no con tipos espaciales.
- **Mapa:** **Mapbox GL JS** (pines + popups; heatmap/clustering en backlog), con sync de estilo claro/oscuro. Geocoding vía Mapbox Geocoding API (`resources/js/lib/mapbox-geocode.ts`).
- **Auth:** **Laravel Fortify** (+ passkeys / 2FA). Esquema **mixto**: lectura pública, escritura requiere sesión. **Anónimo permitido** en reportes.
- **Tiempo real:** notificaciones in-app **derivadas on-the-fly** (sin tabla), compartidas por props de Inertia. Push (FCM) y polling quedan para fase 2.
- **PWA / offline:** **fase 2**.
- **Colas:** Laravel Queue previsto para tareas async (recalcular trust en lote, archivado por decaimiento).

**Estructura real (resumen):**
```
app/Models/{Report, ReportVote, ReportMedia, AlertZone, User}.php
app/Http/Controllers/{ReportController, AlertZoneController, NotificationController}.php
app/Http/Middleware/HandleInertiaRequests.php  (comparte auth + notifications)
app/Support/UserAlerts.php  (feed de notificaciones derivado)
database/migrations/*  database/seeders/{ReportSeeder, DatabaseSeeder}.php
resources/js/pages/*.tsx        (mapa, reportes, reportar, ajustes, mi-perfil)
resources/js/components/alertacalle/*.tsx
resources/js/lib/mapbox-geocode.ts   resources/css/app.css (tokens --ac-*)
routes/web.php
```
 
---
 
## 2. Modelo de datos (Eloquent + migraciones)
 
Igual que v2, en sintaxis Laravel/PostGIS.
 
**`incident_type` (enum de aplicación):** `atraco_a_pie, atraco_en_moto, fleteo, cosquilleo, hurto_celular, intimidacion_arma, otro`.
**NO incluir** categorías de quejas urbanas (luminaria, alumbrado, escombros, ventas ilegales): fuera del MVP (ver §4-C).
 
**`reports`:** `id` (uuid), `occurred_at`, `lat`, `lng`, `geom` (geography Point 4326, índice GiST), `incident_type`, `description` (nullable, ≤280, sanitizado), `reporter_id` (nullable FK profiles), `device_hash`, `confirm_count` (default 0), `deny_count` (default 0), `trust_score` (default 20), `expires_at` (default +14 días), `is_hidden` (default false), `evidence_path` (nullable) **[FASE 2]**, timestamps.
 
**`validations`:** `id`, `report_id` FK, `voter_hash`, `vote` (smallint -1/1), timestamps, **unique(report_id, voter_hash)**.
 
**`profiles`:** `id` (=user id), `display_name` (nullable), `avatar_path` (nullable, **opcional**), `phone_verified` (bool default false), `reputation_score` (numeric default 1.0; ver §6 para mostrar como /1000), timestamps.
 
Trigger/observer para poblar `geom` desde `lat/lng`. Índices: GiST(`geom`), `expires_at`, `incident_type`, `created_at`.
 
---
 
## 3. Lógica de confianza (TrustScoreService) — sin cambios de fórmula
```
base        = 20
rep_bonus   = min(reputation_score * 15, 30)   // 0 si anónimo
corro_bonus = min(10 * (#reportes mismo tipo en 150 m y ±90 min, excl. propio), 30)
vote_bonus  = clamp((confirm_count - deny_count) * 5, -20, 20)
trust_score = clamp(base + rep_bonus + corro_bonus + vote_bonus, 0, 100)
```
- `heat_weight = trust_score * max(0, 1 - horas(now - occurred_at)/(14*24))`.
- `is_hidden = (deny_count >= confirm_count + 3) OR (trust_score < 10)`.
- Vencidos (`expires_at < now()`) se excluyen y se **archivan anonimizados** vía Scheduler diario.
- Recalcular en: creación de reporte y cada voto.
- Consulta de cercanía con PostGIS `ST_DWithin(geom, point, radius)`.
**Mostrar reputación como `/1000`:** `display = round(min(reputation_score,? )* k)`; definir un mapeo simple (p. ej. score interno 1.0–10.0 → 100–1000). Es solo presentación; el cálculo usa el score interno.
 
---
 
## 4. Qué debe IGNORAR o CORREGIR Codex (consolidado)
 
**A. Stack v2 (Next.js/Supabase/TanStack/Zustand/Workbox):** IGNORAR. Usar Laravel (§1).
 
**B. Textos que describen personas — CORREGIR (crítico):**
- Placeholder del formulario "Ej: Sujeto en bicicleta con chaqueta roja…" → cambiar a algo centrado en lugar/situación: **"Ej: ocurrió frente al paradero, zona poco iluminada"**.
- Cualquier dato semilla tipo "Sujeto en moto negra portando arma blanca" → reescribir sin describir personas (p. ej. "Hurto de celular cerca del cruce, alta afluencia").
- Validar en backend: si `description` contiene patrones de cédula/placa/teléfono, advertir y **no publicar** ese dato.
**C. Categorías de quejas urbanas — IGNORAR en MVP:** luminaria, alumbrado público, escombros, ventas ilegales. Solo los 7 `incident_type` de §2. (Reevaluar como módulo "Entorno/factores de riesgo" en fase 2.)
 
**D. Tokens de color:** usar el **YAML de DESIGN.md** como fuente única. IGNORAR los hex de la prosa de DESIGN.md cuando difieran (la prosa dice primary `#1E3A8A`, pero el YAML/CapturaS usan primary `#00236f` con `primary-container #1e3a8a`).
 
**E. Mapa alarmista (Image 2):** IGNORAR ese render 3D oscuro con pines naranjas. Usar el **mapa desaturado con heatmap** de la Image 3 como canónico (DESIGN.md: "mapa con saturación reducida").
 
**F. Modo oscuro (Image 6):** IGNORAR en MVP. Construir **modo claro** primero; dark = fase 2.
 
**G. Barra de búsqueda ("Buscar ubicación o reporte…"):** fase 2. Puede quedar en la UI **deshabilitada**; no implementar lógica de búsqueda aún.
 
**H. "Local Guide" (Image 3):** ELIMINAR. Solo existe el estado "Verificado".
 
**I. Avatar/identidad real (Image 4):** el avatar es **opcional y placeholder por defecto**; jamás requerir foto ni nombre real. Anónimo por defecto.
 
**J. Leyenda del mapa:** reescribir a semántica de riesgo (Alto/Medio/Bajo por densidad + confianza de reportes), no "zonas oscuras / vigilancia activa".
 
**K. Navegación inconsistente entre pantallas:** UNIFICAR a un solo menú lateral: **Mapa · Reportar · Reportes · Mi Perfil · Ajustes** (Ajustes puede ser fase 2). Top bar opcional: Ayuda + notificaciones + cuenta.
 
---
 
## 5. Handoff de vistas Stitch → Blade (`resources/views`)
 
| Vista Stitch | Archivo Blade sugerido | Veredicto | Acciones |
|---|---|---|---|
| Onboarding (Image 1, móvil) | `onboarding.blade.php` | **USAR** | Asegurar 3 slides; consentimiento de datos en slide 3 antes de entrar. |
| Mapa / Home (Image 3) | `map/index.blade.php` + `partials/sidebar`, `partials/report-card` | **USAR (canónico)** | Quitar "Local Guide"; corregir descripción que menciona persona; búsqueda deshabilitada (fase 2); reescribir leyenda (J). |
| Detalle reporte (Image 2) | `partials/report-detail.blade.php` (modal/sheet) | **USAR la tarjeta** | IGNORAR el mapa 3D de fondo (E). Mantener Confirmar/Desmentir + contadores + "Reportar como falso". |
| Reportar (Image 5, light) | `report/create.blade.php` | **USAR** | Corregir placeholder (B). Mantener 6 tipos + aviso anónimo del pie. |
| Reportar (Image 6, dark) | — | **IGNORAR (MVP)** | Dark mode = fase 2. Conservar como referencia. |
| Mi Perfil (Image 4) | `profile/show.blade.php` | **USAR** | Avatar opcional/placeholder (I); reemplazar reportes de ejemplo por atracos; reputación mostrada /1000 (§3); mantener privacidad + "Borrar mis datos". |
 
**Limpieza general de las vistas Stitch antes de usarlas como Blade:**
- Extraer estilos a Tailwind/`app.css` con los tokens de DESIGN.md (no dejar estilos inline divergentes).
- Sustituir textos hardcodeados por datos dinámicos (`@foreach` reportes, etc.).
- Convertir secciones repetidas en componentes Blade (`<x-report-card>`, `<x-risk-badge>`, `<x-incident-type-card>`).
- Quitar imágenes/mock de stock que impliquen render alarmista o personas reales.
---
 
## 6. Privacidad, accesibilidad, antiabuso (se mantienen de v2)
- Consentimiento en onboarding; anónimo por defecto; **"Borrar mis datos"** funcional (borra reportes + perfil).
- Sin identificación de terceros en ningún campo o dato semilla.
- RLS no aplica (no es Supabase): proteger con **policies/gates de Laravel** y nunca exponer `device_hash`/`reporter_id`/`evidence_path` en respuestas JSON (usar API Resources que omitan esos campos).
- Antiabuso: `device_hash` anónimo; rate-limit con middleware `throttle` + reglas (≤3 reportes/h por device; ≤1 mismo tipo en 100 m en 30 min; ≤N votos/h); `unique(report_id, voter_hash)` para un voto por dispositivo.
- Accesibilidad WCAG AA: estado nunca solo por color (RiskBadge = punto + texto), tap targets ≥44 px, foco visible, textos es-CO.
---
 
## 7. Criterios de aceptación (ajustados a Laravel)
- [ ] Reporte anónimo en ≤3 toques + ubicaciónn; persiste vía `ReportController@store`; aparece en el mapa (polling o Reverb).
- [ ] Heatmap desaturado ponderado por `trust_score × recencia`; clustering; filtros por tipo y ventana de tiempo.
- [ ] Confirmar/Desmentir vía `VoteController`; `unique` impide doble voto; recálculo de trust y reputación.
- [ ] Reportes vencen a 14 días; Scheduler los archiva anonimizados.
- [ ] Policies + API Resources no filtran campos sensibles; `throttle` activo.
- [ ] Solo los 7 `incident_type`; **ningún** texto/placeholder/seed describe personas.
- [ ] Tokens tomados del YAML de DESIGN.md; modo claro; sin dark mode.
- [ ] Onboarding con consentimiento (Ley 1581) y "Borrar mis datos" operativo.
- [ ] Cada vista con sus 4 estados (cargando/vacío/error/éxito).
---
 
## 8. [FASE 2] (solo anotar)
Búsqueda; modo oscuro; PWA/offline; verificación OTP completa; evidencia privada; categorías de entorno (iluminación); sello "verificado por autoridad"; tiempo real con Reverb; backoffice para alcaldía/Gaula; conexión con la capa anti-extorsión (RED SILENTE); export de datos abiertos anonimizados.