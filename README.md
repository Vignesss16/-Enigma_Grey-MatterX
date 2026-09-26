# Genesis Reset FoodSafe: Clinical Decision Support Platform

An AI-native clinical food decision support system engineered for chronic health management, allergen detection, and personalized dietary hazard analysis.

**Deployment**: Vercel CI/CD Active | **Maintained by**: @Vignesss16

---

## ⚡ Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui design tokens
- **Styling & Design System**: Material 3 / Clinical Integrity design system (Inter typography, clinical teal `#005253`, calm mineral surfaces `#f8f9ff`)
- **AI & Multimodal OCR**: Google Gemini API (`gemini-1.5-flash` / Gemini Vision)
- **Clinical Risk Engine**: TypeScript-based rule engine evaluating Glycemic Load (GL), hidden polyols/sugar alcohols (Maltitol GI 35-52), sodium density (>400mg), and allergenic proteins
- **Data Visualization**: Recharts (Weekly Glycemic Load & Sodium clinical trajectory)
- **Animations & Micro-interactions**: Framer Motion & CSS hardware-accelerated scanning beam
- **Database & Auth**: Supabase PostgreSQL + Supabase Auth
- **Validation**: Zod schemas for food scans and health profiles
- **Deployment**: Vercel-ready

---

## 🩺 UI Architecture & Screen Flow

1. **Clinical Dashboard & Personalized Home (`/`)**:
   - Good morning greeting with patient context (`Ananya Rao`, `#CDS-8842`).
   - Active Baseline summary: Type 2 Diabetes, Stage 1 Hypertension, and continuous screening thresholds.
   - 3 Summary Stat Cards: Evaluated this month (42 foods), Primary Risk Vector (Hidden Refined Flour & Sodium Density), Information Confidence (96.4% Grade A).
   - Interactive Quick Scan Bay + Manual search input.
   - Weekly Glycemic Load Trajectory chart (Recharts) with benchmark threshold reference line.
   - Recently checked feed with clinical status badges.

2. **Food Scanner (`/scanner`)**:
   - Camera viewport with animated sweeping laser line, reticle targeting brackets, toggleable grid overlay, and torch toggle.
   - Real-time OCR Matrix indicator (Auto-focus 98.4%, ISO 100).
   - Mode switcher: Ingredients OCR vs Barcode scanner.
   - Quick Benchmark Presets: NutriChoice Digestive, Maggi Noodles, Peanut Chikki, and Photo Upload.

3. **Scan Processing (`/scanner/processing`)**:
   - Multi-step evidence pipeline ticker with real-time status indicators:
     - 1. Ingredients detected (24 items parsed)
     - 2. Nutrition facts detected (Calibrated per 25g & 100g)
     - 3. Health profile synchronized (Type-2 Diabetes & Hypertension)
     - 4. Compound & Sweetener scan (Hidden polyols & maltitol)
   - Automatically transitions to the diagnostic assessment.

4. **Food Risk Assessment (`/assessment/[id]`)**:
   - Product identification header with batch number and risk status: `ATTENTION — 3 areas need a closer look`.
   - 3-Step Clinical Diagnostic Chain:
     - **Step 1 (Your Profile)**: Personal insulin sensitivity index requires low glycemic load.
     - **Step 2 (Food Info)**: Refined wheat flour listed prominently as 1st ingredient (>55%).
     - **Step 3 (Potential Relevance)**: Rapid starch conversion causes postprandial glucose elevation despite "Sugar Free" marketing claim.
   - Progressive disclosure accordions:
     - "Why this was flagged"
     - "Ingredient breakdown" (24 chemical items with E-numbers and risk categories)
     - "Nutrition facts panel" (Serving size, calories, net carbs, sugar alcohols, sodium)
   - Direct CTA to explore safer alternatives.

5. **Safer Alternatives (`/alternatives`)**:
   - **Overview Stat Strip**: Evaluated: 3 Found | Max Fit: 96% | Hidden Polyols: 0g Detected.
   - **Alternative 1**: True Elements Rolled Oats Crackers (94% Fit, Net Carbs 8.2g, 0g sweeteners, Sodium 95mg, GL 4.1).
   - **Alternative 2**: The Whole Truth Multigrain Crispbread (89% Fit, Net Carbs 11.0g, 0g sweeteners, Sodium 140mg, GL 5.6).
   - **Alternative 3**: A Diabetic Chef Roasted Seed Thins (96% Fit, Net Carbs 4.5g, 0g sweeteners, Sodium 160mg, GL 1.8).
   - **Relative Glycemic Load Panel**: Positioned strictly **at the bottom after the three alternative cards** (duplicate at the top has been removed as instructed!).
   - Interactive slide-up comparison sheet modal ("Compare with original").
   - Instant swap toast notifications into the food log.

6. **Dining Out Assistant (`/dining-out`)**:
   - Real-world evaluation for restaurants, tiffin services, weddings/buffets, street food, and home-cooked meals.
   - Confidence level and uncertainty indicators.
   - Actionable questions to ask the chef or waiter to customize dishes safely.

7. **Food History & Clinical Trends (`/history`)**:
   - Chronological ledger with filter pills (All, Flagged, Compliant).
   - Weekly Recharts trends.
   - "Export Physician Report" button for medical consultations.

8. **Health Profile (`/profile`)**:
   - Toggle diagnoses (Type 2 Diabetes, Hypertension, Peanut Allergy, Celiac/Gluten).
   - Customize personal biomarker ceilings (Max GL per meal, Max sodium per portion).

---

## 🛠️ Project Directory Structure

```
├── app/
│   ├── layout.tsx                # App shell, fonts, desktop sidebar & header, mobile bottom nav
│   ├── globals.css               # Clinical Integrity tokens, Material Symbols, laser animations
│   ├── page.tsx                  # Clinical Dashboard & Personalized Home
│   ├── scanner/
│   │   ├── page.tsx              # Interactive Camera Scanner Viewport
│   │   └── processing/
│   │       └── page.tsx          # Multi-step AI Diagnostic Ticker
│   ├── assessment/
│   │   └── [id]/
│   │       └── page.tsx          # Deep Dive Risk Evaluation & Accordions
│   ├── alternatives/
│   │   └── page.tsx              # Safer Alternatives (Single bottom Relative GL panel)
│   ├── dining-out/
│   │   └── page.tsx              # Restaurant & Menu Safety Advisor
│   ├── history/
│   │   └── page.tsx              # Food History Log + Recharts Trends
│   ├── profile/
│   │   └── page.tsx              # Health Baseline & Threshold Management
│   └── api/
│       ├── scan/route.ts         # Gemini Vision OCR & Clinical Risk Engine endpoint
│       ├── risk-engine/route.ts  # Rule Engine evaluation endpoint
│       └── alternatives/route.ts # Alternatives matching endpoint
├── components/
│   ├── ui/                       # Button, Card, Badge, Dialog
│   ├── navigation/               # DesktopSidebar, DesktopHeader, MobileHeader, MobileBottomNav
│   ├── dashboard/                # BaselineCard, SummaryStats, QuickScanBay, RecentChecksFeed, ClinicalAnalyticsChart
│   ├── scanner/                  # CameraViewport, SampleFoodSelector
│   ├── assessment/               # AssessmentHeader, RiskChips, ClinicalChainAccordion, IngredientBreakdown, NutritionFactsPanel
│   ├── alternatives/             # AlternativesStatStrip, AlternativeCard, GlycemicLoadPanel, CompareModal
│   ├── dining-out/               # VenueSelector, DishAnalysisCard, CustomizationTips
│   └── profile/                  # ProfileForm
├── lib/
│   ├── utils.ts                  # cn, formatters
│   ├── risk-engine.ts            # TypeScript Clinical Rule Engine
│   ├── gemini.ts                 # Gemini 1.5 Flash Vision OCR integration
│   ├── supabase.ts               # Supabase database & auth client
│   ├── mock-data.ts              # Benchmark clinical foods and alternatives
│   └── validations.ts            # Zod validation schemas
├── supabase/
│   └── schema.sql                # Supabase PostgreSQL tables & RLS policies
├── types/
│   └── index.ts                  # Comprehensive TypeScript interfaces
├── .env.example                  # Environment variable template
├── tailwind.config.ts            # Clinical Integrity theme tokens
└── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your credentials:
- `GEMINI_API_KEY`: Google AI Studio Gemini API key
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase public anon key

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production / Vercel
```bash
npm run build
```
Deploy directly to Vercel via GitHub with zero custom configuration.
