---
name: AlertaCalle Core
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#444651'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#006b5f'
  on-secondary: '#ffffff'
  secondary-container: '#6df5e1'
  on-secondary-container: '#006f64'
  tertiary: '#3e2400'
  on-tertiary: '#ffffff'
  tertiary-container: '#5c3800'
  on-tertiary-container: '#ef9900'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#71f8e4'
  secondary-fixed-dim: '#4fdbc8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  h1:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  h2:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  caption:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  display-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  huge: 48px
  touch-target: 44px
---

## Brand & Style
The design system is built to foster civic collaboration and safety through a lens of serenity and precision. Rather than inducing panic, the UI prioritizes **Trustworthy Minimalism**. By leveraging high whitespace and a restrained color palette, the interface remains calm and functional in high-stress reporting scenarios.

The aesthetic is **Modern Corporate** with a warm Caribbean touch. It balances the institutional reliability of a public service with the approachability of a community-driven tool. Visual clarity is the primary driver, ensuring that critical information is digestible at a glance without overwhelming the user.

## Colors
This design system uses a palette rooted in "Trust Blue" and "Caribbean Teal." The color logic follows a strict hierarchy:
- **Primary (Blue):** Used for navigation, primary actions, and branding to establish authority.
- **Accent (Teal):** Used for interactive secondary elements and communal features.
- **Semantic Colors:** Risk levels are clearly demarcated. Red (#EF4444) is reserved strictly for high-risk data visualization and critical alerts; it must never be used for general UI elements like buttons or headers to avoid an alarmist tone.
- **Accessibility:** All color combinations must maintain WCAG AA contrast ratios. Information should never be conveyed by color alone; always accompany status colors with iconography or descriptive text.

## Typography
The system utilizes **Inter** exclusively to ensure maximum legibility and a systematic, clean appearance. 
- **Scale:** The base text size is locked at 16px to ensure readability for all age groups in the Caribbean region. 
- **Localization:** All implementation text must be in Spanish (es-CO), using terms that are culturally appropriate yet professional (e.g., "Reportar" instead of "Denunciar" for general entries).
- **Hierarchy:** Use bold weights for displays to create clear "landing spots" for the eye. Captions should be used sparingly for metadata and secondary labels.

## Layout & Spacing
The spacing rhythm follows a **4px base scale**, ensuring a tight mathematical relationship between all elements. 
- **Grid:** On mobile, use a fluid 4-column grid with 16px margins. On desktop, transition to a 12-column fixed grid (max-width 1200px) centered in the viewport.
- **Touch Targets:** Any interactive element (buttons, icons, links) must have a minimum physical tap area of 44x44px, regardless of the visual size of the asset.
- **Density:** Maintain "High Whitespace." Avoid crowding reports; use the `xxl` (32px) and `huge` (48px) units to separate major sections.

## Elevation & Depth
The design system employs **Ambient Shadows** to create a subtle sense of depth without adding visual noise. 
- **Surface Layer:** The main background is #F8FAFC. 
- **Card Layer:** Interactive cards and modals use #FFFFFF with a soft, diffused shadow (0px 4px 12px rgba(15, 23, 42, 0.05)).
- **Interactive State:** Upon hover or active tap, shadows should slightly increase in spread to provide tactile feedback.
- **Separation:** Use 1px borders (#E2E8F0) in conjunction with shadows for containers to maintain definition on high-brightness screens common in outdoor Caribbean environments.

## Shapes
The shape language is consistently **Rounded**, reinforcing the "friendly and approachable" brand pillar. 
- **Cards & Buttons:** Use a 12px radius to soften the edges of the UI.
- **Chips & Tags:** Use a full pill shape (9999px) to distinguish them from actionable buttons and card containers.
- **Input Fields:** Should match the button radius (12px) for a unified form-factor.

## Components
- **Buttons:** Primary buttons use Trust Blue (#1E3A8A) with white text. Secondary buttons use a Teal outline or subtle gray background. All buttons have a 12px radius and 16px horizontal padding.
- **Chips:** Used for category filters (e.g., "Hurto", "Iluminación"). These should use Caribbean Teal (#14B8A6) at 10% opacity for the background and 100% for the text when active.
- **Input Fields:** 12px radius, 1px border (#E2E8F0). Focus state uses a 2px Trust Blue border. Labels are always visible above the field in `caption` style.
- **Cards:** The primary container for reports. Include a header with an icon, a clear title, and a risk-level indicator. 
- **Risk Indicators:** Must be a combination of a colored dot + text (e.g., "Riesgo Alto").
- **Iconography:** Use 24px line icons with rounded caps and joins. Stroke weight should be 1.5px or 2px to maintain visibility.
- **Maps:** Use a custom-styled map with reduced saturation to let report pins (using the Primary and Risk colors) stand out.