 PRD: CircleOfLife (GoodSh!t) 

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

