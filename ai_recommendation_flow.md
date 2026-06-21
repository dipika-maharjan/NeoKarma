# AI Recommendation System — Flow Diagram

## 1. High-Level Architecture

```mermaid
flowchart TB
    subgraph Frontend["🖥️ Frontend (Next.js)"]
        A["User visits /plan page"] --> B["RecommendationsView.jsx"]
        B --> C["Calls getActivePlan()"]
        C --> D["GET /api/mitigation-plan"]
    end

    subgraph Backend["⚙️ Backend (Express.js)"]
        D --> E["mitigationPlan.controller.js"]
        E --> F["mitigationPlanService.getOrGeneratePlan(userId)"]
    end

    subgraph Decision["🧠 Routing Decision"]
        F --> G{"How many daily logs\ndoes this user have?"}
        G -- "< 30 logs" --> H["Return GENERAL_PLAN\n(Generic recommendations)"]
        G -- "≥ 30 logs" --> I{"Active plan exists\nin MongoDB?"}
        I -- "Yes" --> J["Use existing plan"]
        I -- "No" --> K["generatePlanForUser()"]
        K --> L["Return MONTHLY_PLAN\n(Personalized AI recommendations)"]
        J --> L
    end

    subgraph Display["📱 Frontend Display"]
        H --> M["Show generic cards\n+ Circular progress meter\n(counting to 30)"]
        L --> N["Show AI-powered cards\n+ AI Enabled badge\n+ Top emission contributors"]
    end

    style Frontend fill:#e8f5e9,stroke:#2e7d32
    style Backend fill:#e3f2fd,stroke:#1565c0
    style Decision fill:#fff8e1,stroke:#f57f17
    style Display fill:#fce4ec,stroke:#c62828
```

---

## 2. Plan Generation Pipeline (≥ 30 Logs)

This is what happens inside `generatePlanForUser()` when a user qualifies for personalized recommendations:

```mermaid
flowchart TD
    A["generatePlanForUser(userId)"] --> B["Fetch user from DB"]
    B --> C["Get last 30 daily logs\nfrom MongoDB"]
    C --> D["prepareUserData()\nAggregate all 30 days"]

    D --> E["Aggregated Data Object"]
    E --> E1["transportKg: total transport emissions"]
    E --> E2["foodKg: total food emissions"]
    E --> E3["wasteKg: total waste emissions"]
    E --> E4["energyKg: total energy emissions"]
    E --> E5["dailyBreakdown: array of 30 log entries\nwith transport mode, meal type,\nplastic count, energy hours, etc."]

    E --> F{"Try External AI Provider"}
    F -- "✅ Success" --> G["Use AI-generated recommendations\nsource = 'external-ai'"]
    F -- "❌ Fails/Not configured" --> H["Use Fallback Rule Engine\nsource = 'fallback-rule-based'"]

    G --> I["Save plan to MongoDB\n(deactivate old plans first)"]
    H --> I
    I --> J["Return structured MONTHLY_PLAN\nwith topContributors + recommendations"]

    style A fill:#bbdefb
    style F fill:#fff9c4
    style G fill:#c8e6c9
    style H fill:#ffe0b2
```

---

## 3. Expert Rule Engine (Fallback AI)

The [fallbackRuleProvider.js](file:///d:/new%20Neokarma/NeoKarma/backend/src/services/ai/fallbackRuleProvider.js) analyzes the user's **actual daily log data** and fires rules based on patterns it detects:

```mermaid
flowchart TD
    A["30 Days of User Data"] --> B["Scan Daily Logs"]

    B --> C1{"Car/Motorbike\n≥ 2 days OR\ntransportKg > 5?"}
    B --> C2{"Non-veg/Mixed meals\n≥ 2 days OR\nfoodKg > 6?"}
    B --> C3{"Avg food waste\n> 40g/day?"}
    B --> C4{"Avg plastic items\n≥ 1.5/day OR\nwasteKg > 0.5?"}
    B --> C5{"Unsegregated\ngarbage days > 0?"}
    B --> C6{"High energy usage\n≥ 2 days OR\nenergyKg > 0.4?"}
    B --> C7{"Firewood\nusage days > 0?"}

    C1 -- "Yes" --> R1["🚌 Use School Buses\n+ 🚶 Walk/Cycle Short Trips"]
    C2 -- "Yes" --> R2["🥦 Try Vegetarian Days"]
    C3 -- "Yes" --> R3["🍽️ Reduce Food Waste"]
    C4 -- "Yes" --> R4["♻️ Swap to Reusable Bottles"]
    C5 -- "Yes" --> R5["🗑️ Waste Segregation"]
    C6 -- "Yes" --> R6["💡 Power Down Lights & Screens"]
    C7 -- "Yes" --> R7["🔥 Biomass Cookstove Optimization"]

    R1 & R2 & R3 & R4 & R5 & R6 & R7 --> FINAL["Final Recommendations Array\n(only rules that matched)"]

    FINAL --> CHECK{"< 2 recommendations?"}
    CHECK -- "Yes" --> DEFAULT["Add default energy +\nwaste sorting tips"]
    CHECK -- "No" --> DONE["Return personalized list"]
    DEFAULT --> DONE

    style A fill:#e1f5fe
    style FINAL fill:#f3e5f5
    style DONE fill:#c8e6c9
```

> [!IMPORTANT]
> Each recommendation includes **personalized numbers** calculated from the user's actual data. For example:
> - `"We detected private car/motorbike commute on 18 days"` — real count from logs
> - `"-4 kg CO2 /week"` — calculated as `transportKg × 0.45`
> - Badge dynamically set to `HIGH IMPACT` or `MEDIUM IMPACT` based on emission magnitude

---

## 4. Data Flow: Daily Log → Recommendation

```mermaid
sequenceDiagram
    participant U as User
    participant Calc as Calculator Page
    participant DB as MongoDB
    participant Plan as /plan Page
    participant Svc as MitigationPlanService
    participant AI as Rule Engine

    Note over U,AI: Phase 1: Data Collection (Days 1–30)
    loop Every day for 30 days
        U->>Calc: Log daily emissions<br/>(transport, food, waste, energy)
        Calc->>DB: Save DailyLog document
    end

    Note over U,AI: Phase 2: AI Recommendations Unlock
    U->>Plan: Visit /plan page
    Plan->>Svc: GET /api/mitigation-plan
    Svc->>DB: Count user's logs
    DB-->>Svc: logsCount = 30 ✅

    Svc->>DB: Fetch last 30 DailyLogs
    DB-->>Svc: Array of 30 log documents

    Svc->>Svc: prepareUserData()<br/>Aggregate transportKg, foodKg,<br/>wasteKg, energyKg

    Svc->>AI: generateRecommendations(aggregatedData)
    AI->>AI: Check 7 rule conditions<br/>against user's patterns
    AI-->>Svc: Personalized recommendations[]

    Svc->>DB: Save plan (deactivate old)
    Svc-->>Plan: MONTHLY_PLAN + topContributors

    Plan->>U: Show AI-powered cards<br/>with "AI Enabled" badge
```

---

## 5. Refresh Cycle (Cron Job)

```mermaid
flowchart LR
    CRON["⏰ Daily Cron\n(midnight)"] --> SCAN["Scan all users"]
    SCAN --> CHECK{"Plan older than\n7 days AND\nlogsCount ≥ 7?"}
    CHECK -- "Yes" --> REGEN["Re-generate plan\nwith latest 30 days of data"]
    CHECK -- "No" --> SKIP["Skip user"]
    REGEN --> SAVE["Save new active plan\nto MongoDB"]

    style CRON fill:#fff9c4,stroke:#f57f17
```

> [!NOTE]
> The cron currently re-generates every **7 days**. This means a user with 30+ logs will get their recommendations **refreshed weekly** with the latest 30 days of data, so the AI adapts as their habits change.

---

## 6. Summary Table

| Stage | What Happens | Key File |
|---|---|---|
| **User logs daily** | Transport, food, waste, energy data saved to `DailyLog` collection | Calculator page → `dailyLog.controller.js` |
| **User visits /plan** | Frontend calls `GET /api/mitigation-plan` | [RecommendationsView.jsx](file:///d:/new%20Neokarma/NeoKarma/frontend/src/components/RecommendationsView.jsx#L263-L325) |
| **< 30 logs** | Backend returns `GENERAL_PLAN` with generic tips | [mitigationPlan.service.js](file:///d:/new%20Neokarma/NeoKarma/backend/src/services/mitigationPlan.service.js#L164-L236) |
| **≥ 30 logs** | Backend aggregates 30 days of data → runs rule engine → returns `MONTHLY_PLAN` | [mitigationPlan.service.js](file:///d:/new%20Neokarma/NeoKarma/backend/src/services/mitigationPlan.service.js#L31-L89) |
| **Rule engine** | 7 conditional rules analyze patterns in user's actual log data | [fallbackRuleProvider.js](file:///d:/new%20Neokarma/NeoKarma/backend/src/services/ai/fallbackRuleProvider.js#L14-L243) |
| **Auto-refresh** | Cron job regenerates stale plans (> 7 days old) daily at midnight | [mitigationPlan.service.js](file:///d:/new%20Neokarma/NeoKarma/backend/src/services/mitigationPlan.service.js#L366-L392) |
| **Frontend display** | `< 30` → progress meter + generic cards · `≥ 30` → AI badge + personalized cards | [RecommendationsView.jsx](file:///d:/new%20Neokarma/NeoKarma/frontend/src/components/RecommendationsView.jsx#L391-L432) |
