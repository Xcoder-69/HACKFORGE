# AgroMind AI — Alert & Notification System Implementation & Verification

## Executive Overview

AgroMind AI now features a complete, decoupled, and persistent Alert & Notification System driven entirely by authentic field telemetry and agronomic data:
1. **Persistent Alerts** ([`/alerts`](file:///c:/Users/mahen/OneDrive/Desktop/HACKFORGE/src/pages/farmer/AlertsActionCenter.tsx)): Evaluated by a centralized rule engine in [`alertService.ts`](file:///c:/Users/mahen/OneDrive/Desktop/HACKFORGE/src/services/alertService.ts), deduplicated using deterministic keys, and tracked across a strict lifecycle (`NEW` $\rightarrow$ `READ` $\rightarrow$ `RESOLVED` $\rightarrow$ `EXPIRED`).
2. **Temporary Popup Notifications** ([`notificationService.ts`](file:///c:/Users/mahen/OneDrive/Desktop/HACKFORGE/src/services/notificationService.ts)): Lightweight toast alerts displayed on real event occurrences (e.g. weather/market sync) that auto-dismiss after a few seconds and **never duplicate on browser refresh or page navigation**.
3. **Home Page Active Alerts Widget** ([`MyFarm.tsx`](file:///c:/Users/mahen/OneDrive/Desktop/HACKFORGE/src/pages/farmer/MyFarm.tsx)): Displays the latest 2–3 active important alerts with live counts (`X Active Alerts • Y Critical`), priority indicators, and direct `[View Alert]` and `View All Alerts →` navigation.

---

## Architecture & Implementation Details

```
                                  REAL DATA SOURCES
        ┌───────────────────┬───────────────────┬───────────────────┐
        ▼                   ▼                   ▼                   ▼
    Open-Meteo         Real Plots &        APMC Mandi          Uploaded Soil
   Live Weather        Planting Date      Market Prices         Lab Reports
        │                   │                   │                   │
        └───────────────────┼───────────────────┴───────────────────┘
                            ▼
               CENTRAL ALERT ENGINE (alertService.ts)
                 • Real agronomic rule evaluation
                 • Deterministic key deduplication
                 • Lifecycle: NEW -> READ -> RESOLVED -> EXPIRED
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
    PERSISTENT STORAGE             TEMPORARY TOASTS
   (storageService.ALERTS)    (notificationService.ts)
            │                               │
    ┌───────┴───────┐                       ▼
    ▼               ▼             ToastNotificationContainer
Home Widget     Alert Center        (Session deduplicated,
(Top 2-3)        (/alerts)           never repeats on reload)
```

### 1. Alert Data Model ([`src/types/index.ts`](file:///c:/Users/mahen/OneDrive/Desktop/HACKFORGE/src/types/index.ts))
- **`AlertItem`** includes:
  - `id: string`
  - `key: string` (deterministic composite deduplication key)
  - `type: 'weather' | 'crop' | 'market' | 'soil' | 'diagnosis' | 'recommendation' | 'irrigation'`
  - `title`, `titleEn`, `titleGu`, `titleHi`
  - `message`, `descriptionEn`, `descriptionGu`, `descriptionHi`
  - `priority: 'Critical' | 'High' | 'Medium' | 'Low'`
  - `createdAt: string`, `expiresAt?: string`
  - `status: 'NEW' | 'READ' | 'RESOLVED' | 'EXPIRED'`
  - `read: boolean`
  - `source: 'Open-Meteo' | 'Mandi/market data' | 'Uploaded laboratory report' | 'AI crop analysis' | 'Agronomic Engine'`
  - `relatedCropId?: string`, `plotId?: string`
  - `actionText: string`, `actionRoute: string`
  - `dataValues?: Record<string, any>`
- **`PlotInfo`** extended with `plantingDate?: string` to anchor crop age calculation to real ISO calendar dates.

### 2. Rule Evaluation & Deduplication ([`src/services/alertService.ts`](file:///c:/Users/mahen/OneDrive/Desktop/HACKFORGE/src/services/alertService.ts))
- **Crop Milestones & Harvest**: Evaluates `cropAgeDays = currentDate - plantingDate`. Matches against [`recommendationService.ts`](file:///c:/Users/mahen/OneDrive/Desktop/HACKFORGE/src/services/recommendationService.ts) stage ranges and maturity window without hardcoding "Day 30".
- **Open-Meteo Weather**: Evaluates rainfall ($\ge 15$mm or $\ge 65\%$ prob), temperature ($\ge 38^\circ$C), and wind speed ($\ge 24$ km/h). Uses cautious hazard wording ("Risk detected", "Conditions may increase risk").
- **APMC Mandi Intelligence**: Detects favorable selling opportunities and major price movements from [`marketService.ts`](file:///c:/Users/mahen/OneDrive/Desktop/HACKFORGE/src/services/marketService.ts).
- **Soil Laboratory Reports**: Reads actual tested values from `STORAGE_KEYS.SOIL_REPORT` (e.g. low Nitrogen $< 140$ kg/ha or extreme pH). Never fabricates values if no lab report is uploaded.
- **AI Camera History**: Flags actual leaf pathology diseases from `STORAGE_KEYS.SCANS`.
- **Deduplication**: Assigns deterministic keys such as `weather:heavy-rain:${district}:${day}`. If an alert is `RESOLVED` or `EXPIRED`, it is preserved and never resurrected.

### 3. Temporary Toast System ([`src/services/notificationService.ts`](file:///c:/Users/mahen/OneDrive/Desktop/HACKFORGE/src/services/notificationService.ts))
- Triggers non-persistent toast alerts for discrete events ("Weather Updated", "Market Data Updated", "New Alert Added").
- Uses `sessionStorage` tracking: toasts will **never repeat** after a simple page refresh or route navigation.
- Automatically dismisses after 5 seconds with an explicit close button and direct route navigation.
- Mounted globally via [`ToastNotificationContainer.tsx`](file:///c:/Users/mahen/OneDrive/Desktop/HACKFORGE/src/components/ui/ToastNotificationContainer.tsx) in [`FarmerLayout.tsx`](file:///c:/Users/mahen/OneDrive/Desktop/HACKFORGE/src/layouts/FarmerLayout.tsx).

### 4. Home Page Active Alerts Widget ([`src/pages/farmer/MyFarm.tsx`](file:///c:/Users/mahen/OneDrive/Desktop/HACKFORGE/src/pages/farmer/MyFarm.tsx))
- Completely purged all mock alerts (`AI_ALERTS`) and the 9-second dummy rotation interval.
- Compact Active Alerts widget displays:
  - Header: Counter badge (`X Active Alerts • Y Critical`) or `All Parameters Normal` when empty.
  - Body: Top 2–3 active alerts with priority indicators ( Critical,  High,  Medium), source badge, message, and direct `[View Alert]` button.
  - Footer: `View All Alerts →` button navigating to `/alerts`.

### 5. Alerts & Action Center ([`src/pages/farmer/AlertsActionCenter.tsx`](file:///c:/Users/mahen/OneDrive/Desktop/HACKFORGE/src/pages/farmer/AlertsActionCenter.tsx))
- Status filters: **Active** (default), **Resolved**, and **All**.
- Category filters: **All**, **Critical**, **Weather**, **Crop**, **Market**, **Soil**, **System**.
- Card display:
  - Icon, multilingual title, and explanation.
  - Source attribution badge (`Source: Open-Meteo`, `Source: Mandi data`, etc.).
  - Related plot/crop tag (e.g., `Plot A • Shankar-6 Cotton`).
  - Actions: **Take Action** (`actionRoute`), **Resolve** (marks task completed), **Mark Read / Unread**, and **Dismiss / Delete**.
  - Manual **Re-check Alerts** button to re-evaluate telemetry on demand.

### 6. Dummy Alert Cleanup ([`src/services/dataInitializer.ts`](file:///c:/Users/mahen/OneDrive/Desktop/HACKFORGE/src/services/dataInitializer.ts))
- Default alerts initialize as an empty array (`[]`). Alerts only appear when live data conditions warrant them.

---

## Verification & Build Results

- **TypeScript Compilation**:
  `npx tsc --noEmit` $\rightarrow$ **Exit code 0** (Zero errors).
- **Vite Production Build**:
  `npm run build` $\rightarrow$ **Exit code 0** (Production bundle built cleanly in 6.99s).
