---
name: Warm M3 Mindspace
colors:
  surface: '#fef7ff'
  surface-dim: '#ded8e2'
  surface-bright: '#fef7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f1fc'
  surface-container: '#f2ebf6'
  surface-container-high: '#ede6f1'
  surface-container-highest: '#e7e0eb'
  on-surface: '#1d1a22'
  on-surface-variant: '#474554'
  inverse-surface: '#322f37'
  inverse-on-surface: '#f5eef9'
  outline: '#787586'
  outline-variant: '#c8c4d7'
  surface-tint: '#5547d6'
  primary: '#4a3acb'
  on-primary: '#ffffff'
  primary-container: '#6356e5'
  on-primary-container: '#f0ecff'
  inverse-primary: '#c5c0ff'
  secondary: '#725477'
  on-secondary: '#ffffff'
  secondary-container: '#fad3fd'
  on-secondary-container: '#77587c'
  tertiary: '#335b49'
  on-tertiary: '#ffffff'
  tertiary-container: '#4c7460'
  on-tertiary-container: '#cbf8df'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c5c0ff'
  on-primary-fixed: '#140067'
  on-primary-fixed-variant: '#3c28be'
  secondary-fixed: '#fcd7ff'
  secondary-fixed-dim: '#dfbbe4'
  on-secondary-fixed: '#2a1131'
  on-secondary-fixed-variant: '#593d5f'
  tertiary-fixed: '#c0edd4'
  tertiary-fixed-dim: '#a5d0b8'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#264e3c'
  background: '#fef7ff'
  on-background: '#1d1a22'
  surface-variant: '#e7e0eb'
typography:
  display-lg:
    fontFamily: Roboto Flex
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Roboto Flex
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Roboto Flex
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Roboto Flex
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Roboto Flex
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-md:
    fontFamily: Roboto Flex
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 22px
  body-lg:
    fontFamily: Roboto Flex
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Roboto Flex
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-lg:
    fontFamily: Roboto Flex
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Roboto Flex
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Roboto Flex
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system translates Google Material Design 3 (Material You) principles into an empathetic, mindful, and emotionally comforting journaling experience. Designed for reflective everyday writers and individuals tracking mental well-being, the emotional tone is reassuring, non-judgmental, warm, and clear.

The design movement blends **Material You (M3) tonal layering** with a **soft tactile wellness aesthetic**. Instead of stark corporate minimalism or stark clinical dashboards, it embraces generous pill shapes, organic curviness, warm tinted pastel surfaces, and delicate atmospheric glows that make vulnerability feel safe. Interactions feel responsive, lightweight, and grounding, giving AI insights the warmth of a gentle supportive companion rather than an automated metric engine.

## Colors

The palette establishes an emotional gradient system grounded in warm M3 tonal surface foundations.

- **Primary (`#6356E5` / Deep Iris Violet):** Anchors primary actions, active navigation states, and the Gemini 3.8 Flash AI synthesis highlights.
- **Secondary (`#E0BBE4` / Muted Lavender Petal):** Provides soft structural backing for high-focus panels, tag pills, and secondary interactive accents.
- **Tertiary (`#76A08A` / Sage Calm):** Highlights grounding reflections, mindful insights, and positive stabilization states.
- **Neutral (`#2B2830` / Warm Charcoal):** Delivers high-legibility text without the harshness of pitch black, softened with subtle warm undertones.

### Emotion Sentiment Accents
The five emotion categories map to dedicated pastel color tokens:
- **Joy / Gratitude:** `#FDE047` (Warm Honey Butter) / Container `#FEF9C3`
- **Calm / Peace:** `#93C5FD` (Soft Sky) / Container `#EFF6FF`
- **Sadness / Release:** `#A5B4FC` (Gentle Indigo Mist) / Container `#EEF2FF`
- **Anger / Tension:** `#FCA5A5` (Soft Coral Blossom) / Container `#FEF2F2`
- **Anxiety / Overwhelm:** `#FDBA74` (Warm Peach Apricot) / Container `#FFF7ED`

### Backgrounds & Surfaces
- Canvas Background: `#FBF9F5` (Warm Cream White)
- Surface Low: `#F5F2EB` (Warm Parchment)
- Surface Container: `#FFFFFF`
- Surface High: `#EEEAE1`

## Typography

The type system utilizes `Roboto Flex` (with fallback to `Pretendard` or system sans-serif for East Asian glyph optimization). This pairing balances geometric legibility with humanist warmth.

- **Headlines & Titles:** Set with tighter letter spacing and balanced weights (`500` to `600`) to keep diary prompts structured yet gentle.
- **Body Text:** Crafted with open line heights (`1.6x` – `1.65x`) in the diary entry textarea and AI analysis report, ensuring effortless long-form reading and reduced visual fatigue.
- **Labels & Badges:** Use explicit medium weights (`500`) with subtle character tracking for fast scanning in the 5 interactive emotion badges, date pickers, and toolbars.

## Layout & Spacing

The layout is built upon a responsive grid system inspired by Material Design 3 surface containers:

- **Desktop (>= 1024px):** 12-column layout. The top header and date selector span full width. Below, a 2-column split pairs the diary writing card (6 columns) side-by-side with the Gemini 3.8 Flash AI emotion analysis report panel (6 columns). The interactive emotion badge bar anchors the base across all 12 columns.
- **Tablet (640px – 1023px):** 8-column layout. Writing canvas and AI panels flex to side-by-side (4 columns each) or adapt into stacked split view depending on screen orientation.
- **Mobile (< 640px):** Single-column stacked flow. Circular quick action buttons ("분석 시작", "초기화", "날짜 선택") sit below the header as a horizontal pill-scroll carousel or compact icon row. The Diary Textarea and AI Analysis Result panels stack sequentially, followed by a persistent horizontal dock containing the 5 emotion badges.

Spacing is metered on an 8-point base unit, using `space-md` (`1rem`) as standard inner card padding and `space-xl` (`2rem`) for major vertical section separations.

## Elevation & Depth

This system avoids heavy drop shadows in favor of M3 tonal elevation and soft ambient halos:

- **Level 0 (Flat Canvas):** `#FBF9F5` base background; no shadow.
- **Level 1 (Card & Textarea Containers):** Resting cards sit on pure white (`#FFFFFF`) with a delicate ambient shadow: `0 2px 8px -2px rgba(43, 40, 48, 0.05), 0 1px 3px 0 rgba(43, 40, 48, 0.03)`.
- **Level 2 (Interactive Cards & Emotion Badges):** Slightly lifted upon hover or selection: `0 8px 24px -4px rgba(99, 86, 229, 0.08), 0 4px 12px -2px rgba(43, 40, 48, 0.04)`.
- **Level 3 (AI Insight Panel & Active Modals):** High-focus Gemini AI reports feature a subtle iris-tinted glow outline: a 1px solid border of `rgba(99, 86, 229, 0.15)` combined with `0 12px 32px -6px rgba(99, 86, 229, 0.12)`.

## Shapes

The design system embraces Material 3's expressive rounded geometry (`roundedness: 3`).

- **Base Components & Input Fields:** `rounded-2xl` (1rem / 16px) for the diary textarea and date selectors.
- **Panels & Major Cards:** `rounded-3xl` (1.5rem to 2rem) for the diary editor container and Gemini AI analysis report card.
- **Interactive Action Buttons & Emotion Badges:** Fully circular (`rounded-full`) for floating action buttons ("분석 시작", "초기화", "날짜 선택") and pill-shaped badge chips (`rounded-full`) for emotion tags.

## Components

### Buttons & Quick Actions
- **Circular Action Controls:** The circular trigger buttons from the wireframe ("분석 시작" / Analyze, "초기화" / Reset, "날짜 선택" / Select Date) are styled as M3 Floating Action / Tonal circular buttons (56x56px on mobile, 64x64px on desktop).
  - *Primary Action ("분석 시작"):* Filled with Iris Violet (`#6356E5`), crisp white typography, and a subtle glowing hover elevation.
  - *Secondary / Utility Actions ("초기화", "날짜 선택"):* Tonal cream containers (`#F5F2EB`) with Neutral Charcoal text and subtle hover scaling (1.03x).

### Diary Writing Area
- A spacious `rounded-3xl` card with pure white surface, inner padding of `space-lg`, and zero border clutter.
- The input area includes an unobtrusive character counter, placeholder copy evoking gentle reflection, and a top toolbar containing autosave status and ambient mood indicators.

### Gemini 3.8 Flash AI Emotion Analysis Report Panel
- Outlined with an expressive `rounded-3xl` surface and a soft gradient background transitioning from `#FFFFFF` down to `#F5F3FF` (tinted iris pastel).
- Features a badge labeled "Gemini 3.8 Flash Engine" with a soft pulse dot.
- Organizes insights into modular cards: Dominant Mood percentage breakdown, Key Emotional Keywords, and a warm 2-sentence conversational reflection note.

### Emotion Emoji Badges (5 Interactive Cards)
- Positioned in the bottom deck or toolbar, representing Joy, Calm, Sadness, Anger, and Anxiety.
- Each item is structured as a tactile, pill-rounded card (`rounded-2xl` or `rounded-full`) with an oversized emoji, textual label, and sentiment score.
- Unselected state uses neutral soft cream background (`#F5F2EB`); selected state activates the corresponding emotion pastel fill and colored border with a smooth bouncy spring transition.