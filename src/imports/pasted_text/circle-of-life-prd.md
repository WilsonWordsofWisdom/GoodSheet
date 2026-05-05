# PRD: CircleOfLife (GoodSh!t) 

## 1. Product Vision & Problem Statement
**Vision:** A "Zero-Cloud" health ecosystem that closes the biological feedback loop by treating human output as the ultimate diagnostic biomarker.

**Problem Statement:** Current health trackers focus exclusively on "input" (calories, steps) and "performance" (heart rate), creating a "Feedback Gap." Users lack an objective way to measure biological output—the most direct indicator of metabolic efficiency and gut health. GutLoop closes this loop using on-device AI to correlate what goes in with what comes out.

---

## 2. User Journey / Flow (The "Gut Loop" Experience)

### A. Logic Flow
1. **Onboarding:** User sets baseline (age, weight, height) and selects goals (e.g., "Identify Bloating Triggers").
2. **Daily Inputs:** - **Meal Log:** Photo + Quick Tags (e.g., #Breakfast, #Spicy, #HighFiber).
   - **Activity Log:** Quick Chip selection (e.g., #Yoga, #Running) + Intensity/Duration.
3. **The Output Event:** User opens app -> "Log Stool" -> Photo Capture -> Auto-Classification.
4. **Correlation:** App calculates transit time from meal timestamps and compares input characteristics to stool quality.
5. **Insight Generation:** Dashboard updates with a "Daily Gut Score" and actionable "Eat/Avoid" advice.

### B. Screen Architecture
- **Home (Dashboard):** Progress rings, "Gut Health Score," and a Timeline Feed.
- **Logger Interface:** Unified camera/text interface with toggles for Food, Exercise, or Stool.
- **Insights Lab:** Dedicated trends view showing correlations (e.g., "Running + High Fiber = Type 4").

---

## 3. User Journey Example: "A Day with GutLoop"

**User Persona:** *Alex, a 30-year-old professional looking to optimize energy levels through gut health.*

1. **08:30 AM | The Input (Breakfast):** Alex takes a photo of his oatmeal and coffee. He taps quick-tags: `#Oats` and `#Caffeine`. The app logs this as **Input T-0**.
2. **12:30 PM | The Activity:** After a morning at his desk, Alex takes a 20-minute brisk walk. He taps the **Exercise** icon, selects `Walk` and `20 min`. The app flags this as a "Low-Intensity Motility Trigger."
3. **02:15 PM | The Output:** Alex feels an urge and takes his phone to the bathroom. He captures a photo of the "output." The on-device CV identifies it as **Type 4 (Optimal)** on the Bristol Scale.
4. **02:16 PM | The Feedback Loop:** Immediately after saving, the app displays an insight: *"Your transit time for this morning's oats was ~6 hours. This is 20% faster than your 7-day average. The morning walk likely aided this efficiency."*
5. **08:00 PM | Evening Check-in:** Before dinner, Alex checks the **Insights Lab**. The app warns: *"Fiber intake has been low today. To maintain today's Type 4 consistency, consider a fiber-rich side for dinner."*

---

## 4. Mandatory Feature Set (Must-Haves)

| ID | Feature | Description |
| :--- | :--- | :--- |
| **F01** | **Visual Output Capture** | Take/upload stool photos (Base64 local storage only). |
| **F02** | **Stool Metadata** | Manual entry for urgency, ease of passage, and qualitative notes. |
| **F03** | **AI Stool Classifier** | On-device CV to categorize Bristol Stool Scale (1–7) and detect healthy states. |
| **F04** | **Visual Food Log** | Photo-based meal history for visual reference. |
| **F05** | **Textual Food Entry** | Manual logging with "Quick Tags" (e.g., #Dairy, #Spicy, #Fiber). |
| **F06** | **Calorie Counter** | Calories inferred from text keywords and portion estimation. |
| **F07** | **Exercise Tracker** | Log activity types (Run, Yoga, Gym) with Intensity and Duration. |
| **F08** | **Correlation Engine** | 72-hour sliding window identifying how diet and exercise affect stool quality. |
| **F09** | **SAI Chatbot** | Virtual assistant to remind users to log their food, activity, and stool. To also provide recommendation on the food to eat for the day based on user's current health status. |

---

## 5. Reference Projects & Technical Inspiration

### A. Computer Vision & Stool Analysis
- **[Erotemic/shitspotter](https://github.com/Erotemic/shitspotter):** Reference for detecting organic matter in complex backgrounds.
- **[Roboflow: Bristol-Stool-Boost](https://universe.roboflow.com/yuvaraj/bristol-stool-boost):** Training reference for Bristol Scale labeling (Types 1-7).

### B. Nutrition & Activity Analysis
- **[Food-Recognition-and-Calorie-Estimation](https://github.com/Gopi1603/Food-Recognition-and-Calorie-Estimation):** Blueprint for mapping food images/text to caloric density.

### C. Infrastructure (Zero-Cloud)
- **[TensorFlow.js](https://github.com/tensorflow/tfjs-examples):** For running "Zero-Cloud" AI directly in the browser thread.
- **[LocalForage / IndexedDB](https://github.com/localForage/localForage):** Architecture for storing sensitive photos locally without a backend.

---

## 6. Design & Technical Specs

### Design Language (Google Minimalist / Material 3)
- **Background:** Pure White (#FFFFFF).
- **Accents:** Google Blue (#4285F4), Red (#EA4335), Yellow (#FBBC05), Green (#34A853).
- **Typography:** Roboto or Inter.
- **Components:** Rounded "Quick-Chips," card-based timeline, and subtle shadows.

### Technical Logic
- **Framework:** React or Next.js (Static) with Tailwind CSS.
- **Storage:** 100% on-device (IndexedDB).
- **The "72-Hour Lookback":** When a stool log occurs (T-0), the app scans the previous 12h-48h for Food Tags and Exercise intensity.
- **Insight Logic:** If "Type 6/7 (Loose)" occurs, find common tags in the window (e.g., #Spicy) and generate a warning: *"Spicy food detected 14h before loose stool. Consider avoiding before activity."*

---

## 7. Refinements from Clarification Round (Added 2026-04-29)

These refinements layer on top of Sections 1–6 without replacing them. Where they conflict with earlier text, the refinement wins for MVP.

### 7.1 Platform Priority
- **Mobile-first PWA** as the primary target. Phone-sized layouts by default; desktop is a secondary, responsive view.
- Camera capture via `getUserMedia`. Installable via "Add to Home Screen." No native app or app-store distribution in MVP — reduces friction for a sensitive-topic product.
- Native (iOS/Android) deferred to post-MVP.

### 7.2 CV Model Feasibility & Training Data
- **Bristol classification is assistive, not authoritative.** AI prediction is always presented as a *suggestion* the user confirms or overrides. The manual Bristol picker is the source of truth.
- **Model approach:** MobileNetV3 feature extractor + small classifier head, run via TensorFlow.js on-device.
- **Training data reality:** No clean public dataset of toilet-bowl Bristol photos exists (Nerthus is colonoscopy footage). MVP seeds with a small labeled set (~500–1000 images) drawn from the Roboflow Bristol-Stool-Boost reference and synthetic augmentation. Accuracy is expected to be modest at launch and improve with user-confirmed labels (local fine-tuning optional, post-MVP).
- **Food classification:** Fine-tuned MobileNet on Food-101 → category → USDA portion lookup. Honest accuracy ceiling for calorie estimation: **±30%**.

### 7.3 Photo Storage Policy
- **Default:** photos are *not* persisted. Classification runs in-memory; only the resulting label, timestamp, and metadata are stored.
- **Opt-in:** user may choose to store a compressed thumbnail (≤50KB, base64 in IndexedDB) for visual recall.
- This supersedes F01's "Base64 local storage only" as the default behavior — full-resolution storage is opt-in, not automatic. Reinforces the Zero-Cloud privacy promise and sidesteps IndexedDB quota issues.

### 7.4 MVP Scope (Recommended Cut)
**In MVP:**
- Meal logging (photo + manual + Quick Tags)
- Bowel logging with **manual Bristol picker** (primary) + optional photo
- 72-hour correlation view + Daily Gut Score
- Basic pattern insights (see 7.5 thresholds)
- Local-only IndexedDB storage
- Privacy onboarding (see 7.6)

**Deferred to v1.1+:**
- AI Bristol classification (ship manual first; AI as a suggestion layer once seed model is validated)
- Calorie estimation precision tuning
- Export / share / multi-device sync
- Multi-user profiles

### 7.5 Correlation Confidence Thresholds
- Surface a recommendation only when:
  - **≥5 co-occurrences** of the (input tag, output type) pair within the lookback window, AND
  - **Lift ≥1.5** versus the user's baseline rate.
- Always label insights as **"pattern"**, never **"cause"**. Display sample size next to each insight (e.g., "based on 7 occurrences").
- Avoid medical-sounding language; the app surfaces correlations, not diagnoses.

### 7.6 Privacy Onboarding
- **One screen, three bullets:** data stays on device · no account needed · export/delete anytime.
- Expandable "How this works" panel for the technically curious (explains TF.js + IndexedDB).
- No email gate, no dark patterns, no analytics SDKs in MVP.

### 7.7 Bristol Scale Education
- **Inline visual picker** with illustrated (not photographic) Type 1–7 cards and one-line clinical descriptions (e.g., "Type 4 — smooth, soft, sausage-shaped").
- "Learn more" sheet referencing NHS / Rome Foundation framing.
- Tone: neutral, scientific, judgment-free. No euphemisms, no jokes.

### 7.8 Calorie & Nutrition Precision
- Display **ranges, not point values** (e.g., "~400–600 kcal").
- User corrections are stored locally and bias future suggestions for that user.
- Frame insights around **fiber, FODMAP categories, and trigger tags** rather than calorie targets — these matter more for gut correlation than absolute kcal.

### 7.10 SAI Chatbot Architecture (F09)

Two-tier design that preserves the Zero-Cloud principle while allowing a conversational layer on capable devices.

**Tier 1 — Rule-based assistant (always available)**
- Deterministic, runs on every device with no model download.
- Powers reminders (configurable schedule: meals, post-meal stool windows, end-of-day activity check) via local notifications / in-app prompts.
- Powers structured food recommendations driven directly by the Correlation Engine output (e.g., "Low fiber today + your Type 4 days correlate with #HighFiber → suggest lentils, oats, berries").
- Output is templated text + Quick-Chip suggestions, not free-form prose.

**Tier 2 — On-device SLM (opt-in)**
- **Runtime:** WebLLM (MLC) via WebGPU. Fallback: Transformers.js for non-WebGPU devices.
- **Model:** Phi-3.5-mini or Gemma 2 2B (quantized, ~800MB–1.5GB). User-facing label: "SAI Conversational Mode."
- **Activation:** explicit one-time consent screen disclosing download size, storage cost, and device requirements (WebGPU + ≥4GB RAM).
- **Pattern:** RAG-style — the SLM receives a structured context block from Tier 1 (recent tags, correlation results, current Gut Score) and rephrases it conversationally. It does **not** reason about medical state from scratch.
- **Guardrails:** same "pattern, not cause" framing as 7.5. System prompt forbids diagnostic language and clinical claims. Fall back to Tier 1 on any inference error.

**Device tiering**
- Unsupported / low-RAM / user-declined → Tier 1 only. The chatbot still works, just terser.
- Supported + opted-in → Tier 2 wraps Tier 1 outputs.

**Privacy**
- All inference local. No tags, no logs, no telemetry leave the device.
- Model weights cached in IndexedDB / OPFS after first download.

### 7.9 Open Questions for Next Round
- Do we need a "share with clinician" export format (PDF/CSV) in MVP, or defer?
- Should the Daily Gut Score be a single number (0–100) or a multi-axis readout (consistency, frequency, transit time)?
- Tone check: is "GutLoop" or "CircleOfLife / GoodSh!t" the canonical product name going forward?

