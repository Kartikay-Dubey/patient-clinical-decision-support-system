# Patient Clinical Decision Support System (CDSS)

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r173-black?logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![ICD-10](https://img.shields.io/badge/Standard-ICD--10_CM-107C41)](https://www.who.int/standards/classifications/classification-of-diseases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An evidence-based **Clinical Decision Support System (CDSS)** featuring an interactive **3D Anatomical Atlas (BodyParts3D Foundation)**, real-time physiological layer toggles, ICD-10 diagnostic localization, and structured clinical guidance for patients and healthcare practitioners.

---

## 🌟 Key Features

### 1. 3D Anatomical Foundation (BodyParts3D)
- **2,234 Anatomical Structures**: Complete reference human body model with skeletal, muscular, and visceral organ assemblies.
- **GPU-Accelerated Visibility**: Zero-overhead shader uniform buffers allow instantaneous toggling between:
  - 🦴 **Skeleton** (Bones, cartilage, and connective tissues)
  - 💪 **Muscles** (Skeletal musculature & tendons)
  - 🫀 **Organs** (Cardiovascular, respiratory, digestive, nervous, urinary, endocrine, and sensory systems)
- **Clinical Region Highlighting**: Automatically focuses camera and illuminates affected anatomical zones (`Head`, `Thorax`, `Abdomen`, `Pelvis`, `Upper Limb`, `Lower Limb`).
- **Interactive Raycasting & Tooltips**: Hover over or click any anatomical structure to view its name, physiological system, and anatomical region.

### 2. Clinical Journey Narrative
The user experience is structured around a 6-stage clinical reasoning framework:
1. **DESCRIBE** — Natural language patient symptom input with preset clinical presentations.
2. **UNDERSTAND** — Symptom tokenization, clinical terminology extraction, and risk profiling.
3. **LOCATE** — Anatomical body system and regional localization.
4. **EXPLORE** — ICD-10 differential matching and probabilistic confidence scoring.
5. **STANDARDIZE** — Classification of primary clinical findings against standard diagnostic codes.
6. **VISUALIZE** — Unified 3D anatomical master console with tabbed clinical guidance.

### 3. Patient Guidance & Triage
- **Evidence-Based Home Remedies**: Safe, supportive lifestyle and hydration measures.
- **Pathophysiology Insights**: Clear explanations of underlying anatomical mechanisms.
- **Precautions & Red Flags**: Urgent clinical indicators requiring immediate emergency evaluation.
- **Differential Probabilities**: Confidence dials and comparative condition matches.

---

## 📂 Project Structure

```text
patient-diagnosis-system/
├── .gitignore                     # Workspace Git exclusion rules
├── LICENSE                        # MIT License
├── README.md                      # Project documentation
│
├── docs/                          # Architectural & Clinical Specifications
│   ├── ARCHITECTURE.md            # System design & component boundaries
│   ├── PROJECT_CONTEXT.md         # Clinical domain scope & clinical safety guidelines
│   └── DEVELOPMENT_PLAN.md        # Roadmap & engineering milestones
│
└── frontend/                      # React Web Application
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    │
    ├── public/
    │   └── models/                # BodyParts3D dataset
    │       ├── atlas.json         # 2,234 anatomical structures manifest
    │       ├── body-*.bin / .gz   # Binary geometry chunks (positions, normals, indices)
    │       └── ATTRIBUTION.md     # CC BY 4.0 data attribution (BodyParts3D)
    │
    └── src/
        ├── App.jsx                # Clinical journey controller
        ├── index.css              # Warm ivory editorial styling & theme tokens
        ├── components/            # Reusable UI widgets (Header, ScoreGauge, StatusBadge)
        ├── features/
        │   ├── symptom-input/     # Natural language symptom input & quick chips
        │   ├── analysis/          # Clinical processing pipeline visualization
        │   ├── results/           # Tabbed clinical guidance console
        │   └── body-viewer/       # Three.js 3D Anatomy engine & shaders
        │       ├── BodyViewer.jsx # 3D Canvas, OrbitControls, raycaster
        │       ├── anatomyAtlas.js# 15 anatomical systems & region classifier
        │       └── modelLoader.js # DecompressionStream binary chunk loader
        ├── mock/
        │   └── clinicalData.js    # ICD-10 diagnostic datasets
        └── services/
            └── apiService.js      # Backend API client with automatic fallback
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or later
- **npm** or **pnpm** / **yarn**

### Installation & Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/<YOUR_USERNAME>/patient-diagnosis-system.git
cd patient-diagnosis-system

# 2. Navigate to frontend and install dependencies
cd frontend
npm install

# 3. Start the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal) in your browser.

### Production Build

```bash
cd frontend
npm run build
```
The optimized production bundle will be generated in `frontend/dist/`.

---

## 🔌 API & Real Dataset Integration

The frontend uses `apiService.js` to communicate with any backend diagnostic service (FastAPI, Python LLM/MedLM, FHIR server, or EHR pipeline).

Set your backend endpoint in `.env`:
```env
VITE_API_BASE_URL=https://your-clinical-api.com/api/v1
```

The system accepts standard JSON diagnostic responses:
```json
{
  "bodyLocalization": {
    "primaryRegion": "Thorax",
    "bodySystem": "Respiratory System"
  },
  "topCondition": {
    "name": "Acute Bronchitis",
    "icd10Code": "J20.9",
    "confidenceScore": 88
  },
  "guidance": {
    "homeRemedies": ["Hydration", "Humidified air", "Honey for cough relief"],
    "causes": ["Acute viral inflammation of bronchial mucosa"],
    "precautions": ["Seek medical evaluation if fever exceeds 102°F or severe dyspnea develops"]
  }
}
```

---

## 📜 Attribution & Licenses

- **Anatomical Geometry**: Adapted from **BodyParts3D**, © The Database Center for Life Science, licensed under [CC Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/). See [`frontend/public/models/ATTRIBUTION.md`](frontend/public/models/ATTRIBUTION.md) for full citation details.
- **Application Source Code**: Licensed under the [MIT License](LICENSE).

---

## ⚕️ Medical Disclaimer

> [!WARNING]
> This application is an educational decision-support demonstration and is **not** a certified medical diagnostic device. It does not provide definitive medical diagnoses or replace direct consultation with licensed healthcare professionals. Always seek the advice of a qualified physician for any medical symptoms or conditions.
