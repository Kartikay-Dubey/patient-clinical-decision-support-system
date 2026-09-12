# Design System Specifications

## 1. Visual Direction
The visual language for the Patient Clinical Decision-Support System prioritizes a calm, scientific, premium, and trustworthy editorial aesthetic. It deliberately avoids generic AI-generated hospital dashboards, heavy glassmorphic borders, neon cyan glows, cartoonish icons, or cluttered 3-column card grids.

Instead, the UI uses **progressive disclosure** (`input` → `analyzing` → `results`), keeping the interface focused, quiet, and intentional at every stage.

### Color Palette
- **Background Slate**: `#050811` to `#0a0f1d` (Deep Midnight Slate)
- **Surface Panels**: `#0c1222` / `rgba(15, 23, 42, 0.5)` (Subtle Slate Surface)
- **Border Utility**: `rgba(255, 255, 255, 0.06)` (Subtle Precision Line)
- **Primary Clinical Cyan**: `#0ea5e9` / `#38bdf8` (Scientific Accent / Focus Line)
- **Diagnostic Emerald**: `#10b981` (High Model Confidence / Normal Status)
- **Clinical Amber**: `#f59e0b` (Moderate Model Score / Attention State)
- **Text Primary**: `#f8fafc` (High Contrast White)
- **Text Secondary**: `#94a3b8` (Muted Metallic Blue)
- **Text Muted**: `#64748b` (Subdued Slate)

---

## 2. Typography
- **Primary Font**: `Inter` (UI elements, headers, metrics)
- **Data / Code Font**: `JetBrains Mono` (ICD-10 codes, model confidence metrics, numerical indexes)

### Type Scale & Hierarchy
- **Main Heading / Hero**: `2.25rem`–`2.5rem` (`36px`–`40px`), Font-Weight: `300` (Light) to `400` (Regular), Letter-Spacing: `-0.025em`
- **Section Heading**: `1.125rem` (`18px`), Font-Weight: `600`, Uppercase Tracking: `0.05em`
- **Numbered Indexes**: ` JetBrains Mono `, `1.25rem` (`20px`), Font-Weight: `600`, Color: `#0ea5e9`
- **Body Regular**: `0.875rem` (`14px`), Font-Weight: `400`, Line-Height: `1.6`
- **Caption / Meta**: `0.75rem` (`12px`), Font-Weight: `500`, Color: `#64748b`

---

## 3. Layout Architecture & Progressive Disclosure
The application follows a linear, step-guided workflow rather than a dense dashboard:

1. **Stage 1 — Input (`appState: 'input'`)**: Centered, spacious single column layout focusing entirely on symptom entry.
2. **Stage 2 — Analyzing (`appState: 'analyzing'`)**: Centered sequence animation list showing real-time analysis progress steps.
3. **Stage 3 — Results (`appState: 'results'`)**: Split 2-column layout:
   - **Left Column (7 cols)**: Editorial list of ranked possible conditions with clear numerical ordering (`01`, `02`, etc.) and expandable details.
   - **Right Column (5 cols)**: Sticky 3D Body Spatial Viewer acting as a hero anatomical element.

---

## 4. Component Standards

### Headers & Safety Disclaimers
- **Header**: Minimal, single-line brand bar (`CDSS v0.1.0-prototype`) with subtle status dot and action buttons (e.g., "Start New Analysis").
- **Safety Disclaimer**: Integrated seamlessly into the flow without harsh alert banners.

### Symptom Entry
- **Textarea**: Clean, borderless or single-line bordered container with floating character counter and subtle focus transitions.
- **Tag Pills**: Subdued pills (`bg-slate-900 border border-slate-800 text-slate-300`).

### Ranked Condition Cards
- **Numbered List**: Minimalist list item with index (`01`, `02`), condition title, category pill, and ICD-10 tag.
- **Confidence Indicators**: Muted pill labels (`HIGH CONFIDENCE`, `MODERATE`), no bright cartoonish progress bars.

---

## 5. Interaction & Motion Principles
- Micro-animations for feedback only (duration 150ms-250ms).
- Smooth linear transition between application stages (`fade-in`, step sequence).
- 3D camera auto-pan and smooth region rotation on interaction.

---

## 6. Responsive Behavior
- **Desktop (>=1024px)**: Full split-screen results view (7:5 ratio for results list vs 3D anatomical viewer).
- **Tablet & Mobile (<1024px)**: Stacked single-column layout with toggle/tab access to the 3D Anatomical Viewer in the results phase.

---

## 7. Medical UX Phrasing Standards

> [!IMPORTANT]
> To comply with clinical safety standards, all UI labels and outputs must maintain non-diagnostic terminology:
> - **Allowed**: "Possible conditions", "Primary affected region", "Body system", "Model analysis"
> - **Forbidden**: "Confirmed diagnosis", "You have...", "Definitive diagnosis"

