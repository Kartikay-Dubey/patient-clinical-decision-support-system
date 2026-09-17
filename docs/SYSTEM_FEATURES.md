# Patient Clinical Decision Support System - Comprehensive Features & Technical Architecture

This document provides a detailed technical reference for all features implemented in the **Patient Clinical Decision Support System (CDSS)** web platform. It explains the underlying science, mathematics, Three.js 3D graphics pipeline, NLP/ML workflows, and frontend-backend synchronization.

---

## Table of Contents
1. [Platform Architecture Overview](#1-platform-architecture-overview)
2. [Clinical Intake & Free-Text NLP Engine](#2-clinical-intake--free-text-nlp-engine)
3. [Multi-Step Progressive Analysis Workflow](#3-multi-step-progressive-analysis-workflow)
4. [Machine Learning Differential Diagnosis Engine](#4-machine-learning-differential-diagnosis-engine)
5. [Interactive 3D Anatomical Body Viewer (BodyParts3D)](#5-interactive-3d-anatomical-body-viewer-bodyparts3d)
6. [Dynamic Camera Positioning & Auto-Framing (How Camera Angles Work)](#6-dynamic-camera-positioning--auto-framing-how-camera-angles-work)
7. [Smart Anatomical Layer Isolation (How Layer Toggling Works)](#7-smart-anatomical-layer-isolation-how-layer-toggling-works)
8. [Holographic HUD Callout & Animated Pointer Arrow (How the Pointer Works)](#8-holographic-hud-callout--animated-pointer-arrow-how-the-pointer-works)
9. [Clinical Storylines, Red Flags & Home Care Guidance](#9-clinical-storylines-red-flags--home-care-guidance)
10. [Design System & Master Console Features](#10-design-system--master-console-features)

---

## 1. Platform Architecture Overview

The system bridges state-of-the-art WebGL 3D rendering with a supervised medical machine learning pipeline trained on the **DDXPlus benchmark dataset**:

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           REACT FRONTEND (Vite + Three.js)                      │
│                                                                                 │
│   [ Symptom Intake ] ──► [ Scanning Console ] ──► [ Master 3D Results View ]     │
│         │                                                        ▲              │
│         │                                                        │              │
│         ▼                                                        │              │
│   Vite Proxy (/api/v1/analyze) ──────────────┐                   │              │
└──────────────────────────────────────────────┼───────────────────┼──────────────┘
                                               │                   │
                                               ▼                   │
┌──────────────────────────────────────────────────────────────────┴──────────────┐
│                              FASTAPI BACKEND                                    │
│                                                                                 │
│   [ NLP Matcher ] ──► [ 1213-D Feature Extractor ] ──► [ ML Classifier ]       │
│                                                               │                 │
│   [ Storyline Gen ] ◄── [ Anatomical Localizer ] ◄────────────┘                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Clinical Intake & Free-Text NLP Engine

### 2.1 Natural Language Processing Pipeline
Patients describe their symptoms in everyday colloquial language (e.g., *"I have a severe throbbing headache and light sensitivity"*, *"sharp lower back pain radiating down my leg"*).

The backend NLP engine (`backend/models/pipeline/nlp_matcher.py`):
1. **Case Normalization & Tokenization:** Lowercases, normalizes whitespace, and extracts multi-word clinical phrases.
2. **Clinical Synonym & Alias Lexicon:** Compares input phrases against a curated dictionary of clinical synonyms mapping colloquial expressions to formal DDXPlus medical codes:
   - *"can't catch my breath"* ➔ `dyspnea`
   - *"throwing up"* ➔ `vomiting`
   - *"acid reflux / heartburn"* ➔ `retrosternal_burning`
   - *"back spinal cord pain"* ➔ `pain_back`, `thoracic_spine`
3. **TF-IDF Vector Cosine Similarity:** Computes semantic similarity against 223 DDXPlus evidence definitions to capture symptoms not explicitly covered by deterministic aliases.
4. **Severity & Qualifier Attribution:** Detects urgency qualifiers (*"severe"*, *"sharp"*, *"crushing"*, *"mild"*, *"intermittent"*) to classify symptom severity tiers (`mild`, `moderate`, `severe`).

---

## 3. Multi-Step Progressive Analysis Workflow

The platform implements a finite state machine managing three distinct states:
- **`input` (Intake Page):** Clean, calm conversational intake with dynamic symptom suggestion pills.
- **`analyzing` (Scanning Console):** An animated high-tech clinical diagnostic console displaying real-time progress steps:
  - Step 1: *Extracting clinical evidence tokens via NLP*
  - Step 2: *Evaluating candidate differential conditions*
  - Step 3: *Identifying the primary affected anatomical region*
  - Step 4: *Generating evidence-based patient guidance*
- **`results` (Master Console):** Seamlessly reveals the unified 3D anatomical viewer on the left and tabbed guidance on the right.

---

## 4. Machine Learning Differential Diagnosis Engine

### 4.1 Benchmark & Model Architecture
- **Dataset:** Built on the peer-reviewed **DDXPlus** medical dataset.
- **Feature Vector:** Each patient case is transformed into a **1,213-dimensional binary/categorical feature vector** (`backend/models/feature_extractor.joblib`) encoding:
  - Patient demographics (normalized age and biological sex).
  - Primary presentation symptoms and antecedent risk factors.
  - Multi-choice clinical qualifiers (pain character, radiation, aggravating factors).
- **Classification Engine:** Multi-class Logistic Regression with calibrated soft-max probabilities (`backend/models/baseline_logistic_regression.joblib`) predicting probabilities across **49 distinct clinical pathologies**.
- **Condition Ranking & Metadata:** Returns ranked conditions with:
  - Probabilistic model score (`modelScore` from `0.0` to `1.0`).
  - Confidence category (`High`, `Moderate`, `Low`).
  - Formal ICD-10 diagnostic code (e.g., `I20.9` for Angina, `G44.0` for Cluster Headache, `K21` for GERD).
  - DDXPlus clinical severity index (Level 1 = Emergency to Level 5 = Minor).

---

## 5. Interactive 3D Anatomical Body Viewer (BodyParts3D)

### 5.1 Real Anatomical Geometry
The 3D model is built from the **BodyParts3D / Anatomography** open scientific dataset:
- **Parts Count:** Over **2,234 individual anatomical meshes** (bones, muscles, viscera, arteries, veins, nerves, and organs).
- **Binary Chunk Streaming:** Geometries are packed into indexed binary chunks (`.bin` / `.gz`) with concurrency, reducing initial download size from hundreds of megabytes to a lightweight compressed stream.
- **Scale:** Standard anatomical metric coordinates where $Y$ spans from $0.0\text{ m}$ (soles of feet) to $1.73\text{ m}$ (vertex of skull).

### 5.2 GPU DataTextures for Zero-Lag Highlighting
Instead of updating thousands of Three.js materials across 2,234 meshes (which would cause CPU bottlenecking and frame drops):
1. **GPU Visibility Texture:** A 1D floating-point data texture (`Float32Array`) stores visibility flags per anatomical part.
2. **GPU Selection Texture:** A 1D data texture (`Uint8Array`) stores whether each part belongs to the currently active clinical region.
3. **Custom Vertex Shaders:** Every mesh shares a single unified shader that reads from these data textures on the GPU in real time. Toggling an anatomical layer or highlighting a region takes **< 1 millisecond** with 60 FPS smoothness.

---

## 6. Dynamic Camera Positioning & Auto-Framing (How Camera Angles Work)

The 3D camera does not use static viewpoints. It uses a **dynamic spatial calculation engine** driven by the backend's `spatialCoordinates` (`x`, `y`, `z`).

### 6.1 Coordinate Resolution
When a symptom or condition is analyzed, the backend calculates target coordinates $(c_x, c_y, c_z)$:
- Head / Cranium: $(0.0, 1.58 - 1.62, 0.10)$
- Thorax / Heart / Lungs: $(0.0, 1.20 - 1.25, 0.05)$
- Thoracic Spine (Back): $(0.0, 1.20, -0.12)$
- Lumbar Spine (Lower Back): $(0.0, 0.92, -0.10)$
- Left Shoulder: $(0.19, 1.35, 0.05)$
- Right Shoulder: $(-0.19, 1.35, 0.05)$
- Knee: $(\pm 0.08, 0.45, 0.08)$

### 6.2 Posterior (Back) Auto-Rotation
When an issue affects the back, spine, or posterior musculature:
1. **Detection:** The system checks if $c_z < -0.04$ or if the target organ matches spinal keywords (`spine`, `spinal`, `cord`, `vertebra`, `lumbar`, `paraspinal`).
2. **Posterior Target & Position:**
   $$\text{Target} = [c_x, c_y, c_z]$$
   $$\text{Camera Position} = [c_x, c_y, c_z - 0.65]$$
   Because the camera position's $Z$ coordinate is negative (behind the body) and points forward toward $c_z$, the camera frames the **back of the body**.
3. **Non-Clipping Orbital Arc Interpolation:**
   If the camera transitioned in a straight line from front ($Z > 0$) to back ($Z < 0$), it would slice through the ribs, lungs, and heart.
   To prevent this, the animation loop introduces a lateral orbital arc:
   $$\text{arc} = \sin(t \cdot \pi) \cdot 0.75$$
   $$\text{camera.position.x} = \text{camera.position.x} + \text{arc}$$
   As $t$ progresses from $0 \to 1$, the camera smoothly **swings around the side of the body** to the back in a cinematic orbital sweep!
4. **Orientation Indicator Sync:** The toolbar's compass indicator automatically highlights **`Back`**.

### 6.3 Anterior & Limb Framing
- **Limbs (Shoulder, Elbow, Knee, Ankle):** Placed directly in front with a lateral camera offset aligned to the part's $X$ axis, zooming to a narrow field of view ($30^\circ$) to frame the joint clearly.
- **Head:** Zoom distance of $0.44\text{ m}$ centered on the cranium ($y = 1.58$).

---

## 7. Smart Anatomical Layer Isolation (How Layer Toggling Works)

A major challenge in medical visualization is anatomical occlusion—outer layers (skin, muscles, ribcage) can obstruct deeper internal organs or the spinal column.

The system automatically configures layer visibility (`Muscles`, `Skeleton`, `Organs`) based on the clinical nature of the diagnosed condition:

| Clinical Condition / Target | Muscles | Skeleton | Organs | Visual Effect & Rationale |
| :--- | :---: | :---: | :---: | :--- |
| **Spine / Spinal Cord / Vertebrae** | **OFF** | **ON** | **OFF** | **Isolates the vertebral column.** Hiding latissimus dorsi, trapezius, and internal organs reveals all 45 vertebral bones and the spinal column with zero obstruction. |
| **Esophagus / GERD / Boerhaave** | **OFF** | **OFF** | **ON** | **Isolates the esophagus.** Strips both the muscular wall and the rib cage to place the gastroesophageal tract directly in the center of the canvas. |
| **Visceral Organs (Heart, Lungs, Liver, GI)** | **OFF** | **ON** | **ON** | **Reveals internal organs.** Hides the opaque muscular wall while keeping the translucent skeletal rib cage as spatial reference. |
| **Cranial / Headache / Neurological** | **OFF** | **ON** | **ON** | **Reveals cerebral structures.** Hides the 126 facial and scalp muscles to reveal the brain, cerebral arteries, and cranial nerves. |
| **Joints & Limbs (Shoulder, Knee, Hip)** | **ON** | **ON** | **OFF** | **Displays musculoskeletal articulation.** Shows articulating muscles, tendons, and bones while hiding internal visceral organs. |
| **General Full Body** | **ON** | **ON** | **ON** | Displays the complete integrated anatomical model. |

*Note: Users can manually override any layer at any time using the floating Layers widget.*

---

## 8. Holographic HUD Callout & Animated Pointer Arrow (How the Pointer Works)

The interactive pointer arrow and holographic card connect the 2D interface to the 3D model in real time.

```text
  ┌───────────────────────────┐
  │   HUD CLINICAL CARD       │
  │  "Thoracic Spine & Cord"  │
  │   ICD-10: I20.9           │
  └─────────────┬─────────────┘
                │  (Curved SVG Leader Line)
                ▼
                \
                 \ ──► [ Glowing Arrowhead Marker ]
                       ▼
                     ( ● )  ◄── [ 3D Pulsing Beacon ] 
                                Pinned to Vertebra (cx, cy, cz)
```

### 8.1 3D-to-2D World Projection
Every animation frame, the 3D anatomical anchor $(x_w, y_w, z_w)$ is projected onto the 2D browser viewport:
1. Three.js `Vector3.project(camera)` converts world coordinates into Normalized Device Coordinates (NDC) in range $[-1, 1]$.
2. The NDC coordinates are converted to screen pixel coordinates:
   $$\text{screenX} = \frac{v_x + 1}{2} \cdot \text{canvasWidth}$$
   $$\text{screenY} = \frac{-v_y + 1}{2} \cdot \text{canvasHeight}$$
3. Checks clipping planes ($v_z < 1.0$) and canvas boundaries to ensure the beacon is only rendered when visible to the camera.

### 8.2 Dynamic SVG Leader Line & Arrowhead
- An SVG canvas overlays the WebGL element (`pointer-events: none`).
- Computes a smooth **quadratic Bezier curve** connecting the HUD card anchor to the 3D screen coordinate $(x, y)$:
  $$d = \text{"M } x_{\text{card}} \text{ } y_{\text{card}} \text{ Q } x_{\text{mid}} \text{ } y_{\text{card}} \text{ } x \text{ } y\text{"}$$
- Equipped with a teal-to-sky gradient stroke (`#0D9488` to `#0EA5E9`), dashed styling, a Gaussian glow filter, and a SVG marker arrowhead (`#hudArrowhead`) pointing precisely at the targeted anatomical structure.

### 8.3 Radar Pulsing Beacon Reticle
Pinned directly to the pixel coordinates $(x, y)$:
- An animated CSS `ping` outer radar ripple.
- An inner pulsing border ring.
- A glowing central core with a high-intensity drop shadow (`shadow-[0_0_12px_rgba(13,148,136,0.9)]`).
- Clicking the beacon re-centers and zooms directly onto the structure.

### 8.4 Collision-Aware Card Placement
To prevent the HUD card from getting clipped off-screen:
- If target $x > 260\text{px}$, the card anchors to the **left** of the target.
- If target $x \le 260\text{px}$, the card anchors to the **right** of the target.
- Top and bottom offsets are clamped within safe bounds.

---

## 9. Clinical Storylines, Red Flags & Home Care Guidance

The right column provides four structured, evidence-based guidance tabs:

### 9.1 Conditions Tab
- Ranked list of candidate pathologies matching the patient's presentation.
- Individual condition cards expandable to reveal clinical summaries, ICD-10 codes, and DDXPlus urgency ratings.
- Highlights exact matching symptoms that supported the differential diagnosis.

### 9.2 Remedies Tab
- Evidence-based, safe non-pharmacological home care measures (e.g., *Absolute Rest & Posture*, *Hydration*, *Calm Diaphragmatic Breathing*).
- Individual action instructions with custom medical icons.

### 9.3 "Why It Happens" Tab
- Clear, empathetic explanations of the underlying pathobiology (e.g., *Myocardial oxygen supply-demand mismatch*, *Bronchospasm and airway hyperresponsiveness*, *Nerve root compression*).

### 9.4 Red Flags Tab
- High-urgency clinical warning symptoms (e.g., *Crushing retrosternal pressure radiating to jaw*, *Sudden severe shortness of breath*, *Syncope*).
- Escalation triggers instructing the patient when to seek immediate emergency care.

---

## 10. Design System & Master Console Features

### 10.1 Circular Match Gauge (`ScoreGauge.jsx`)
- SVG circular gauge displaying the model's top match percentage.
- Smooth spring-animated stroke fill and dynamic color coding based on confidence tiers (`teal` for high, `amber` for moderate, `rose` for low).

### 10.2 Fullscreen Mode
- A dedicated button in the 3D viewer toolbar triggers the native browser **Fullscreen API**.
- Expands the anatomical canvas across the entire display for medical demonstration, presentations, or in-depth anatomical exploration.

### 10.3 Manual View Angle Presets
Floating orientation buttons allow the user to quickly snap the camera to standard anatomical perspectives:
- **`Front`** (Anterior view)
- **`3/4`** (Anterolateral oblique perspective)
- **`Side`** (Lateral sagittal view)
- **`Back`** (Posterior view)
- **`Full Body`** (Resets camera to frame the full human body)
