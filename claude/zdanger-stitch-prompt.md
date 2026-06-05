# Prompt para Stitch AI — ZDanger

## Prompt principal

Design a mobile-first web app called **ZDanger** — a citizen safety platform for reporting street robberies and assaults in Latin American cities.

---

## Brand & Visual Identity

- **App name**: ZDanger
- **Tagline**: "Reportá. Alertá. Protegé."
- **Tone**: Urgent but trustworthy. Civic, not alarmist. Clean and modern.
- **Primary color**: Deep red `#C0392B` — danger, urgency
- **Secondary color**: Dark charcoal `#1C1C1E` — seriousness, authority
- **Accent color**: Amber `#F39C12` — warnings, pending states
- **Success/validated color**: `#27AE60`
- **Background**: Very dark `#111111` (dark mode primary) with a light mode variant `#F5F5F5`
- **Typography**: Inter or Geist Sans — clean, readable at small sizes

---

## Screens to design

### 1. Home / Map Screen
- Full-screen interactive map (dark map tiles, Google Maps style)
- Floating top bar with: app logo left, search icon right
- Incident pins on the map: red circle with count or icon (knife icon for mugging, car icon for vehicle theft)
- Bottom sheet (half-height) showing nearby incidents list:
  - Each card: incident type icon + type label + street address + time ago + validated badge (green checkmark) or pending badge (amber clock)
- Floating red FAB button (bottom right): "+" to report an incident
- Bottom navigation bar: Map, My Reports, Alerts, Profile

### 2. Report Form Screen
- Dark background
- Top: "Nuevo reporte" title with back arrow
- Step indicator (3 steps): Ubicación → Detalles → Evidencia
- **Step 1 — Ubicación**:
  - Small map preview showing current GPS pin
  - Address fields: Calle, Cruce, Barrio (auto-filled from GPS but editable)
  - "Usar mi ubicación actual" button
  - Date/time picker: "¿Cuándo ocurrió?"
- **Step 2 — Detalles**:
  - Incident type selector: horizontal scrollable chips (Asalto a persona, Robo de vehículo, Robo a domicilio, Otro)
  - Description textarea (max 300 chars, counter shown)
  - Toggle: "Reportar anónimamente"
- **Step 3 — Evidencia**:
  - Image upload area (dashed border, upload icon): "Subí una foto o video como evidencia"
  - Thumbnail previews of uploaded files (max 3)
  - Warning text: "La evidencia ayuda a validar tu reporte"
  - "Enviar reporte" primary button (red)

### 3. Incident Detail Screen
- Dark card-based layout
- Top: map thumbnail showing the exact location pin
- Status badge: "Validado ✓" (green) or "Pendiente" (amber)
- Incident type large icon + label
- Address: street, neighborhood, city
- Occurred at: date and time
- Description text
- Evidence photos in a horizontal scroll gallery
- Validation section: "¿Este reporte es real?" with two buttons — "Confirmar" (green) and "Es falso" (red outlined)
- Vote count: "12 personas confirmaron este reporte"
- Reporter: "Reportado por ciudadano anónimo · hace 2 horas"

### 4. My Alerts Screen
- List of saved zones with label, address, and radius
- Each zone card: location pin icon, label ("Casa"), address, radius pill ("500m"), edit + delete actions
- Empty state: map illustration with text "No tenés zonas de alerta. Creá una para recibir notificaciones."
- FAB: "+ Nueva zona"
- Add zone bottom sheet: label input, map picker, radius slider (100m–2000m)

### 5. Onboarding / Login Screen
- Full-screen dark background with subtle city map pattern (low opacity)
- ZDanger logo centered (large, bold, red Z)
- Tagline below
- Two buttons: "Ingresar con email" (red filled) and "Continuar sin cuenta" (outlined)
- Small text: "Al usar ZDanger aceptás los términos y la política de privacidad"

---

## UI Components to include

- Incident type chips/pills (scrollable, selectable)
- Validated / Pending / Fake status badges
- Report card (compact, for lists)
- Map pin variants (by incident type + status)
- Bottom sheet component
- Step progress indicator
- Dark mode toggle
- Push notification permission prompt card

---

## Additional notes

- All screens in **dark mode** as default
- Mobile screen size: 390×844 (iPhone 14 Pro)
- Also show a **web dashboard** variant for the map screen at 1440px width — same dark aesthetic, wider map, sidebar with filters (date range, incident type, status) and a list panel
- Use realistic placeholder data in Spanish: street names like "Av. Corrientes y Pueyrredón", neighborhoods like "Palermo", "Villa Crespo", incidents from "hace 10 minutos" to "hace 3 días"
