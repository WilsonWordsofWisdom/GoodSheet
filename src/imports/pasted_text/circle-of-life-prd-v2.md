# PRD: CircleOfLife (GoodSh!t) — v2

## 1. Product Vision & Problem Statement
**Vision:** A "Zero-Cloud" health ecosystem that closes the biological feedback loop by treating human output as the ultimate diagnostic biomarker.

**Problem Statement:** Current health trackers focus exclusively on "input" (calories, steps) and "performance" (heart rate), creating a "Feedback Gap." Users lack an objective way to measure biological output—the most direct indicator of metabolic efficiency and gut health. GutLoop closes this loop using on-device AI to correlate what goes in with what comes out.

**Privacy Posture (Zero-Cloud):** All data and inference stay on-device. No accounts, no email gate, no analytics SDKs, no cloud calls in MVP. Users can export or delete their data at any time. Onboarding communicates this in a single screen with three bullets — *data stays on device · no account needed · export/delete anytime* — with an expandable "How this works" panel explaining TensorFlow.js + IndexedDB for the technically curious.

---

## 2. User Journey / Flow (The "Gut Loop" Experience)

### A. Logic Flow
1. **Onboarding:** User sets baseline (age, weight, height) and selects goals (e.g., "Identify Bloating Triggers"). Privacy posture is shown on a single screen (see Section 1). Bristol Scale is introduced via an illustrated Type 1–7 picker with neutral, clinical one-line descriptions and a "Learn more" sheet referencing NHS / Rome Foundation framing.
2. **Daily Inputs:**
   - **Meal Log:** Photo + Quick Tags (e.g., #Breakfast, #Spicy, #HighFiber).
   - **Activity Log:** Quick Chip selection (e.g., #Yoga, #Running) + Intensity/Duration.
3. **The Output Event:** User opens app → "Log Stool" → **Manual Bristol picker (primary, source of truth)** with optional photo capture. When AI classification is enabled (post-MVP), the model's prediction appears as a *suggestion* the user confirms or overrides.
4. **Correlation:** App calculates transit time from meal timestamps and compares input characteristics to stool quality.
5. **Insight Generation:** Dashboard updates with a "Daily Gut Score" and actionable "Eat/Avoid" advice, framed as **patterns, not causes** (see Section 6 thresholds).

### B. Screen Architecture
- **Home (Dashboard):** Progress rings, "Gut Health Score," and a Timeline Feed.
- **Logger Interface:** Unified camera/text interface with toggles for Food, Exercise, or Stool. Optimized for one-handed phone use.
- **Insights Lab:** Dedicated trends view showing correlations (e.g., "Running + High Fiber = Type 4"), each labeled with sample size.
- **SAI Chatbot:** Conversational surface for reminders and recommendations (see Section 4 / F09 and Section 6).

### C. Platform
- **Mobile-first PWA** is the primary target. Phone-sized layouts by default; desktop is a secondary, responsive view.
- Camera capture via `getUserMedia`. Installable via "Add to Home Screen." No native app or app-store distribution in MVP.
- Native (iOS/Android) deferred to post-MVP.

---

## 3. User Journey Example: "A Day with GutLoop"

**User Persona:** *Alex, a 30-year-old professional looking to optimize energy levels through gut health.*

1. **08:30 AM | The Input (Breakfast):** Alex takes a photo of his oatmeal and coffee. He taps quick-tags: `#Oats` and `#Caffeine`. The app logs this as **Input T-0**.
2. **12:30 PM | The Activity:** After a morning at his desk, Alex takes a 20-minute brisk walk. He taps the **Exercise** icon, selects `Walk` and `20 min`. The app flags this as a "Low-Intensity Motility Trigger."
3. **02:15 PM | The Output:** Alex feels an urge and takes his phone to the bathroom. He selects **Type 4 (Optimal)** on the Bristol picker; the optional photo is classified in-memory and discarded by default.
4. **02:16 PM | The Feedback Loop:** Immediately after saving, the app displays an insight: *"Pattern: your transit time for this morning's oats was ~6 hours, ~20% faster than your 7-day average. The morning walk often appears alongside faster transit (based on 6 occurrences)."*
5. **08:00 PM | Evening Check-in:** Before dinner, Alex checks the **Insights Lab**. SAI nudges: *"Fiber intake has been low today. Days like this in your history correlate with firmer Type 3 mornings — consider a fiber-rich side."*

---

## 4. Mandatory Feature Set (Must-Haves)

| ID | Feature | Description | MVP? |
| :--- | :--- | :--- | :--- |
| **F01** | **Visual Output Capture** | Take/upload stool photos. **Default: classified in-memory and discarded.** Opt-in: store a compressed thumbnail (≤50KB) in IndexedDB for visual recall. | ✅ |
| **F02** | **Stool Metadata** | Manual entry for urgency, ease of passage, and qualitative notes. | ✅ |
| **F03** | **AI Stool Classifier** | On-device CV (MobileNetV3 + small classifier head via TensorFlow.js) to suggest Bristol Scale (1–7). **Assistive only — manual picker is source of truth.** | v1.1 |
| **F04** | **Visual Food Log** | Photo-based meal history for visual reference. | ✅ |
| **F05** | **Textual Food Entry** | Manual logging with "Quick Tags" (e.g., #Dairy, #Spicy, #Fiber). | ✅ |
| **F06** | **Calorie Counter** | Calories inferred from text keywords and portion estimation, displayed as **ranges (e.g., ~400–600 kcal)**, not point values. ±30% accuracy ceiling. User corrections bias future suggestions locally. | ✅ |
| **F07** | **Exercise Tracker** | Log activity types (Run, Yoga, Gym) with Intensity and Duration. | ✅ |
| **F08** | **Correlation Engine** | 72-hour sliding window identifying how diet and exercise affect stool quality. Surfaces insights only when **≥5 co-occurrences** AND **lift ≥1.5** vs. baseline. Sample size shown with each insight; insights labeled as "patterns," never "causes." | ✅ |
| **F09** | **SAI Chatbot** | Two-tier virtual assistant (see Section 6 for architecture). Reminds users to log food/activity/stool and recommends foods based on current health status. | Tier 1 ✅ / Tier 2 opt-in |

**MVP cut summary:**
- **In:** F01, F02, F04, F05, F06, F07, F08, F09 Tier 1, privacy onboarding.
- **Deferred to v1.1+:** F03 (AI Bristol classifier), F09 Tier 2 (conversational SLM), calorie precision tuning, export/share, multi-device sync, multi-user profiles.

---

## 5. Reference Projects & Technical Inspiration

### A. Computer Vision & Stool Analysis
- **[Erotemic/shitspotter](https://github.com/Erotemic/shitspotter):** Reference for detecting organic matter in complex backgrounds.
- **[Roboflow: Bristol-Stool-Boost](https://universe.roboflow.com/yuvaraj/bristol-stool-boost):** Training reference for Bristol Scale labeling (Types 1–7). Note: no clean public dataset of toilet-bowl Bristol photos exists; MVP seeds with ~500–1000 labeled images plus synthetic augmentation, improving via user-confirmed labels (post-MVP).

### B. Nutrition & Activity Analysis
- **[Food-Recognition-and-Calorie-Estimation](https://github.com/Gopi1603/Food-Recognition-and-Calorie-Estimation):** Blueprint for mapping food images/text to caloric density. Approach: fine-tuned MobileNet on Food-101 → category → USDA portion lookup.

### C. Infrastructure (Zero-Cloud)
- **[TensorFlow.js](https://github.com/tensorflow/tfjs-examples):** For running "Zero-Cloud" CV models directly in the browser thread.
- **[LocalForage / IndexedDB](https://github.com/localForage/localForage):** Architecture for storing sensitive data locally without a backend.

### D. On-Device Language Models (for F09 Tier 2)
- **[WebLLM (MLC)](https://github.com/mlc-ai/web-llm):** WebGPU-accelerated SLM runtime for in-browser inference.
- **[Transformers.js (Xenova)](https://github.com/xenova/transformers.js):** ONNX-based fallback for non-WebGPU devices.
- Candidate models: **Phi-3.5-mini** or **Gemma 2 2B** (quantized, ~800MB–1.5GB).

---

## 6. Design & Technical Specs

### Design Language (Google Minimalist / Material 3)
- **Background:** Pure White (#FFFFFF).
- **Accents:** Google Blue (#4285F4), Red (#EA4335), Yellow (#FBBC05), Green (#34A853).
- **Typography:** Roboto or Inter.
- **Components:** Rounded "Quick-Chips," card-based timeline, subtle shadows.
- **Tone:** Neutral, scientific, judgment-free. No euphemisms, no jokes around bodily output.

### Technical Stack
- **Framework:** React (Vite) or Next.js (Static) with Tailwind CSS.
- **Form factor:** Mobile-first PWA, installable. Camera via `getUserMedia`.
- **Storage:** 100% on-device (IndexedDB). Photos discarded by default after inference; opt-in thumbnail storage only.

### Correlation Engine
- **The "72-Hour Lookback":** When a stool log occurs (T-0), the app scans the previous 12h–48h (extended window up to 72h for slower-transit correlations) for Food Tags and Exercise intensity.
- **Confidence thresholds:** A recommendation surfaces only when **≥5 co-occurrences** of the (input tag, output type) pair AND **lift ≥1.5** vs. baseline.
- **Insight Logic Example:** If "Type 6/7 (Loose)" recurs, find common tags in the window (e.g., #Spicy) and surface: *"Pattern: spicy food appears within 14h before loose stool in 6 of your last 8 occurrences."*
- **Framing:** Always "pattern," never "cause." Sample size shown alongside every insight. No medical-sounding or diagnostic language.

### CV Models (F03, F06)
- **Bristol classifier:** MobileNetV3 feature extractor + small classifier head, served via TensorFlow.js. Always assistive — user confirms or overrides. Manual picker remains the source of truth.
- **Food classifier:** MobileNet fine-tuned on Food-101, mapped to USDA portion-size lookup. Calorie output displayed as ranges; ±30% accuracy ceiling acknowledged.

### SAI Chatbot Architecture (F09)
Two-tier design that preserves the Zero-Cloud principle while allowing a conversational layer on capable devices.

**Tier 1 — Rule-based assistant (always available)**
- Deterministic; runs on every device with no model download.
- Powers reminders (configurable schedule: meals, post-meal stool windows, end-of-day activity check) via local notifications / in-app prompts.
- Powers structured food recommendations driven directly by the Correlation Engine output (e.g., "Low fiber today + your Type 4 days correlate with #HighFiber → suggest lentils, oats, berries").
- Output is templated text + Quick-Chip suggestions, not free-form prose.

**Tier 2 — On-device SLM (opt-in)**
- **Runtime:** WebLLM (MLC) via WebGPU. Fallback: Transformers.js for non-WebGPU devices.
- **Model:** Phi-3.5-mini or Gemma 2 2B (quantized, ~800MB–1.5GB). User-facing label: "SAI Conversational Mode."
- **Activation:** explicit one-time consent screen disclosing download size, storage cost, and device requirements (WebGPU + ≥4GB RAM).
- **Pattern:** RAG-style — the SLM receives a structured context block from Tier 1 (recent tags, correlation results, current Gut Score) and rephrases it conversationally. It does **not** reason about medical state from scratch.
- **Guardrails:** Same "pattern, not cause" framing as the Correlation Engine. System prompt forbids diagnostic language and clinical claims. Fall back to Tier 1 on any inference error.

**Device tiering**
- Unsupported / low-RAM / user-declined → Tier 1 only. The chatbot still works, just terser.
- Supported + opted-in → Tier 2 wraps Tier 1 outputs.

**Privacy**
- All inference local. No tags, no logs, no telemetry leave the device.
- Model weights cached in IndexedDB / OPFS after first download.

### Bristol Scale Education (UX detail)
- **Inline visual picker** with illustrated (not photographic) Type 1–7 cards and one-line clinical descriptions (e.g., "Type 4 — smooth, soft, sausage-shaped").
- "Learn more" sheet referencing NHS / Rome Foundation framing.

### Calorie & Nutrition Framing
- Display **ranges, not point values**.
- User corrections stored locally and bias future suggestions for that user.
- Frame insights around **fiber, FODMAP categories, and trigger tags** rather than calorie targets — these matter more for gut correlation than absolute kcal.

---