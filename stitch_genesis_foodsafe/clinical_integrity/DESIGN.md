---
name: Clinical Integrity
colors:
  surface: '#f8f9ff'
  surface-dim: '#d6dae4'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f4fd'
  surface-container: '#eaeef8'
  surface-container-high: '#e4e8f2'
  surface-container-highest: '#dee2ec'
  on-surface: '#171c23'
  on-surface-variant: '#3f4949'
  inverse-surface: '#2c3138'
  inverse-on-surface: '#edf1fb'
  outline: '#6f7979'
  outline-variant: '#bec8c8'
  surface-tint: '#14696b'
  primary: '#005253'
  on-primary: '#ffffff'
  primary-container: '#186b6d'
  on-primary-container: '#9fe9ea'
  inverse-primary: '#8ad3d5'
  secondary: '#306768'
  on-secondary: '#ffffff'
  secondary-container: '#b2eaeb'
  on-secondary-container: '#356b6d'
  tertiary: '#404956'
  on-tertiary: '#ffffff'
  tertiary-container: '#58616e'
  on-tertiary-container: '#d3dcec'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a6eff1'
  primary-fixed-dim: '#8ad3d5'
  on-primary-fixed: '#002021'
  on-primary-fixed-variant: '#004f51'
  secondary-fixed: '#b5ecee'
  secondary-fixed-dim: '#9ad0d2'
  on-secondary-fixed: '#002021'
  on-secondary-fixed-variant: '#134e50'
  tertiary-fixed: '#dae3f3'
  tertiary-fixed-dim: '#bec7d6'
  on-tertiary-fixed: '#131c27'
  on-tertiary-fixed-variant: '#3e4754'
  background: '#f8f9ff'
  on-background: '#171c23'
  surface-variant: '#dee2ec'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 2.25rem
    fontWeight: '600'
    lineHeight: 2.75rem
    letterSpacing: -0.025em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: 2.25rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.5rem
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.375rem
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1.125rem
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.25rem
    letterSpacing: 0.005em
  label-md:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: '600'
    lineHeight: 0.875rem
    letterSpacing: 0.04em
  clinical-mono:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system is engineered for high-stakes consumer clinical insight, specifically focused on allergen detection, dietary sensitivities, and personalized hidden-ingredient analysis. The emotional baseline must be calm, authoritative, reassuring, and impeccably clear. Users engaging with potential dietary hazards or medical dietary triggers are often anxious or fatigued; the visual language actively avoids sensationalism, alarmist neon indicators, decorative tech tropes, or unearned "futuristic AI" branding.

The design movement combines **Contemporary Clinical Minimalism** with **Warm Editorial Serenity**. It leverages an architectural, disciplined layout structured on rigorous baseline metrics, quiet warmth through mineral off-whites, and deliberate typographic rhythm. The aesthetic communicates the peer-reviewed authority of a clinical reference laboratory alongside the tactile, dignified comfort of preventative medicine.

## Colors

The palette balances warm organic neutrality with clinical precision. It enforces strict accessibility standards (WCAG AAA for all primary reading copy, AA+ for actionable elements and badges).

### Base & Backgrounds
- **Canvas Base (`#FBFBF9`)**: Warm linen white. Default backdrop for full screens and pages.
- **Surface Layer (`#F5F5F0`)**: Subdued secondary backing for section containers, table headers, and nested panels.
- **Surface Raised (`#FFFFFF`)**: Pure clinical white, reserved strictly for primary content cards, elevated dialogs, and interactive surfaces requiring distinct separation.
- **Divider & Border (`#E2E5E9`)**: Fine architectural boundary tone, balancing crisp definition without harshness.

### Primary Accents & Hierarchy
- **Clinical Deep Teal (`#186B6D`)**: Primary active tone. Conveys therapeutic stewardship, confidence, and deliberate action. Used for primary buttons, selected tabs, key navigation markers, and verified analytical badges.
- **Abyssal Teal (`#0F4C4E`)**: Dark teal variant for interactive hover/press states and high-emphasis textual labels.
- **Teal Tint / Tinted Surface (`#E6F3F3`)**: Low-saturation teal fill for light badge backgrounds, active list selections, and verified ingredient highlights.

### Neutrals & Typography
- **Charcoal Dense (`#1E232A`)**: Primary text color. Softer than pure black to reduce eye strain while retaining peak contrast against linen white.
- **Charcoal Muted (`#333C48`)**: Secondary text color for supporting context, secondary captions, metadata, and laboratory source notes.
- **Muted Stone (`#64748B`)**: Structural tertiary text for non-critical assistive hints, timestamps, and inactive iconography.

### Clinical Risk Hierarchy
Semantic signaling must never look like generic software alerts. Colors must appear balanced, medicinal, and non-jarring:
- **Low Concern / Verified Safe**:
  - Boundary & Icon: `#2E7D32`
  - Subtle Fill: `#E8F5E9`
  - Text Contrast: `#1B5E20`
- **Moderate Concern / Caution & Hidden Cross-Contamination**:
  - Boundary & Icon: `#C05621`
  - Subtle Fill: `#FEF3C7`
  - Text Contrast: `#92400E`
- **Significant Concern / Clinical Allergen Alert**:
  - Boundary & Icon: `#B91C1C`
  - Subtle Fill: `#FEE2E2`
  - Text Contrast: `#991B1B`

## Typography

The typography uses Inter across all levels to maintain neutral, objective, and legible clinical scanning. Data-dense medical composition demands precision in tabular numbers and consistent letterform geometry.

- **Numerals**: Always enable open-type tabular lining (`font-feature-settings: "tnum" on, "cv05" on`) for ingredient quantities, chemical formulas, and percentage scores.
- **Headlines**: Set tightly with modest negative tracking to project composed authority. Avoid heavy black weights (`font-weight: 800+`); top headers max out at `600` (Semi-bold) to sustain a calm demeanor.
- **Body & Citations**: Prioritize readable leading (`1.5rem` on base body). Scientific citations, toxicology thresholds, and laboratory references utilize `label-md` or `body-sm` with charcoal muted tones (`#333C48`).

## Layout & Spacing

The layout is built on a strict **8px baseline rhythm** with a **4px half-grid** for micro-components and badge insets. 

### Grid Infrastructure
- **Mobile (< 768px)**: 4 columns, `margin: 1rem`, `gutter: 1rem`. Full-width card stacks with single-column linear flow to minimize reading fatigue.
- **Tablet (768px – 1024px)**: 8 columns, `margin-tablet: 2rem`, `gutter: 1.25rem`. Split-screen patterns: master list on the left, clinical detail sheet on the right.
- **Desktop (> 1024px)**: 12 columns, max-width `1280px` centered canvas, `margin-desktop: 3rem`, `gutter-desktop: 1.5rem`. Asymmetric balance: 4 columns dedicated to patient allergen parameters and risk thresholds, 8 columns dedicated to analyzed food panels and compound breakdowns.

### Spacing Philosophy
Spacing must breathe intentionally to convey stability. Cluttered diagnostic screens heighten cognitive load and perceived threat. Group related metrics within `space-sm` (8px), divide distinct analytical data blocks by `space-lg` (24px), and isolate global assessment cards using `space-xl` (32px).

## Elevation & Depth

This design system avoids heavy blurred drop shadows and physical skeuomorphic gradients in favor of **Tonal Layering and Low-Contrast Architectural Outlines**.

1. **Surface Base (Level 0)**: `#FBFBF9` (Canvas) and `#F5F5F0` (Structural rails, secondary content bays). Zero shadow; demarcated exclusively by 1px borders (`#E2E5E9`).
2. **Elevated Card (Level 1)**: Pure white background (`#FFFFFF`) with a 1px border of `#E2E5E9`. To give subtle grounding without drama, an ultra-fine ambient shadow is permitted: `box-shadow: 0 1px 3px rgba(30, 35, 42, 0.04), 0 1px 2px rgba(30, 35, 42, 0.02)`.
3. **Interactive Floats & Drawers (Level 2)**: For dropdown ingredient selectors, clinical monographs, and contextual glossaries: `#FFFFFF`, 1px border (`#E2E5E9`), with `box-shadow: 0 4px 16px -2px rgba(30, 35, 42, 0.06), 0 2px 6px -1px rgba(30, 35, 42, 0.03)`.
4. **Critical Modals (Level 3)**: High-priority clinical intervention warnings use a dimmed, warm neutral backdrop (`rgba(30, 35, 42, 0.45)`) paired with a white modal container bounded by `#E2E5E9` and a deep soft blur (`0 12px 32px -4px rgba(30, 35, 42, 0.12)`).

## Shapes

The geometric framework balances human warmth with medical precision through a consistent **12px boundary logic** (`roundedness: 2` scale).

- **Cards & Data Panels**: Fixed `12px` (`0.75rem` / `rounded-lg`) border radius. This geometry removes harsh corner stress while avoiding excessive consumer roundness.
- **Buttons & Input Controls**: Standardized at `8px` (`0.5rem`) for compact efficiency and tactile structure.
- **Pills, Chips, and Risk Tags**: Micro tags are set to `4px` or `6px` for clinical labels to retain an authoritative, index-card feel. True pill shapes (`9999px`) are reserved solely for high-level overall status indicators (e.g., "Screened Safe", "Alert Triggered").
- **Divider Lines**: 1px solid horizontal and vertical dividers using `#E2E5E9`.

## Components

### Buttons
- **Primary**: Solid Deep Teal (`#186B6D`), text `#FFFFFF`, 8px radius. Hover: `#0F4C4E`. Active: `#0A3537`. Padding: 10px 18px (medium), 8px 14px (small). Never use drop shadows or inner glows.
- **Secondary / Outline**: 1px border in `#186B6D`, text `#186B6D`, background transparent. Hover: `#E6F3F3`.
- **Tertiary / Ghost**: Text `#333C48`, background transparent. Hover: `#F5F5F0`.
- **Destructive / Risk Confirmation**: Subdued crimson background (`#B91C1C`), text `#FFFFFF`. Hover: `#991B1B`.

### Clinical Risk Badges & Status Chips
Badges communicate immediate hazard categories without screaming:
- **Low Risk**: Background `#E8F5E9`, text `#1B5E20`, border `1px solid #C8E6C9`.
- **Moderate / Hidden Concern**: Background `#FEF3C7`, text `#92400E`, border `1px solid #FDE68A`.
- **High Concern / Immediate Allergen**: Background `#FEE2E2`, text `#991B1B`, border `1px solid #FECACA`.
- Format: Left-aligned 6px dot icon indicating status, followed by label text (`label-md`).

### Cards & Content Containers
- Background: `#FFFFFF`.
- Border: 1px solid `#E2E5E9`.
- Corner Radius: 12px.
- Internal Padding: 20px (compact) or 24px (standard).
- Header: Separated by a 1px border or clear vertical rhythm; includes title in `headline-sm` with optional secondary clinical metadata aligned to the right.

### Input Fields & Controls
- **Form Inputs**: Background `#FFFFFF`, 1px border `#E2E5E9`, 8px radius, text `#1E232A`. Focus: 1px border `#186B6D` with a subtle 2px focus ring (`rgba(24, 107, 109, 0.15)`).
- **Checkboxes & Radios**: 18px dimensions. Unchecked: 1.5px border `#94A3B8`. Checked: `#186B6D` fill with pure white checkmark. Border radius: 4px for checkboxes, 50% for radios.

### Ingredient Match & Alert Lists
- Displayed as structured, high-density row items.
- Item Rows: Separated by 1px bottom border `#E2E5E9`, background hovering to `#F5F5F0`.
- Left slot: Chemical or common ingredient name (`label-lg`) with derivative subtext (`body-sm`, `#333C48`).
- Right slot: Exact scientific matching tag (e.g., "Cross-reactive with Birch Pollen") paired with the appropriate risk badge.

### Clinical Evidence Drawer
- A slide-over panel for deep dives into toxicology, scientific citations, and clinical rationale.
- Backing: `#FFFFFF`.
- Header carries citation level, publication DOI metadata, and clear, calm dismissal options without heavy iconography.