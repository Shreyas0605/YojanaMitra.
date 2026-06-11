# YojanaMitra: High-Fidelity System Design & Architectural Blueprint

## 1. System Architecture Overview
YojanaMitra is built on a distributed AI-logic architecture. It separates raw data ingestion (Scraper) from the user-facing deductive engine (Matching).

![YojanaMitra System Architecture](C:\Users\91994\.gemini\antigravity\brain\ac017a7b-479e-4611-b722-122ca016737e\yojanamitra_architecture_diagram_1778167755356.png)

### 1.1 Component Breakdown
- **Frontend Layer:** Responsive dashboard built to handle dynamic "Questioning Modals" and state transitions.
- **Backend (Flask):** The orchestration layer that manages sessions, database transactions, and AI handoffs.
- **AI Logic Layer (Gemini-1.5-Flash):** The brain that performs "Deductive Resolution" and "Contextual Question Generation."
- **Data Persistence (SQLAlchemy):** Relational storage for schemes, conditions, and the critical `QuestionAnswer` memory.
- **Scraper Pipeline:** An asynchronous ETL process that translates policy text into machine-readable logic.

---

## 2. The 6-Phase Matching Engine (Flow Logic)
The matching engine follows a strictly defined progression from uncertainty to resolution.

![6-Phase Matching Flow](C:\Users\91994\.gemini\antigravity\brain\ac017a7b-479e-4611-b722-122ca016737e\yojanamitra_matching_flow_diagram_1778167784870.png)

### Phase 1: Initial Pool Extraction (The Hard Gate)
The first layer of filtering is purely deterministic.
- **Input:** Raw User Profile + Full Scheme Database.
- **Mechanism:** SQL `JOIN` between User Attributes and Scheme Conditions where `condition_type = 'hard'`.
- **Result:**
  - **Confirmed Eligible:** Every hard condition is met.
  - **Ineligible:** At least one hard condition is definitively violated (e.g., Male user vs Female scheme).
  - **The Partial Pool:** Schemes where the profile contains `NULL` or where conditions are marked as `soft` (probabilistic).

### Phase 2: Verify Pool Activation
This is the "Deep Search" trigger.
- **Process:** The system isolates the `POSSIBLE` list. It generates a "Gap Analysis" report identifying which specific concepts (e.g., `is_farmer`, `has_disability`) are missing for the highest-value schemes in the pool.

### Phase 3: Context-Based Questioning
Unlike static forms, YojanaMitra generates questions in real-time.
- **Logic:** `QuestionEngine` looks at the `unknown_fields` and the raw scheme description.
- **Prompting:** *"Based on the requirement 'Must be a weaver from the Kurnool district', generate a question to verify the user's eligibility."*
- **Output:** *"Are you a traditional weaver currently residing in or operating out of the Kurnool district?"*

### Phase 4: Memory Injection (SchemeClarification)
This phase prevents "AI Amnesia."
- **Mechanism:** Before any AI call, the system retrieves the `SchemeClarification` history for the current user.
- **Context:** The prompt is enriched with: `User previously stated they do NOT have a BPL card.`
- **Benefit:** If Scheme B also needs a BPL card, the AI deductively fails it without asking the user again.

### Phase 5: Deductive Resolution
The final logic pass where AI acts as an auditor.
- **Implementation:** `contextual_resolver.py`
- **Reasoning:** *"User is a 22-year-old student. The scheme requires 'Unemployed Youth'. Deductively, a full-time student is not 'Unemployed Youth' in the context of this specific labor welfare scheme."*
- **Finality:** The AI must return a definitive `ELIGIBLE` or `INELIGIBLE`.

### Phase 6: State Promotion
The "Resolved" state is committed to the database.
- **Action:** Answers are saved to `UserProfileAttribute`.
- **State Change:** The scheme's `status` in the user's session is updated to `RESOLVED`.
- **Persistence:** These answers become part of the user's core identity for all future sessions.

---

## 3. Deep-Dive: Beneficial Advisor & Conflict Resolution

### 3.1 Beneficial Advisor (The Scorer)
The Beneficial Advisor ranks the **Phase 6: Resolved** schemes to ensure the user sees the most impactful options first.
- **Formula:** `(Monetary_Value * 0.4) + (Urgency * 0.3) + (Complexity_Penalty * -0.2)`
- **Goal:** To surface schemes that provide the highest ROI for the user's specific demographic profile.

### 3.2 Conflict Resolution (The Truth Engine)
When Phase 3 answers contradict Phase 1 profile data:
- **Detection:** If `Profile(age=25)` clashes with `Answer(is_minor=True)`.
- **Resolution:** The system halts the promotion and triggers a **Reconciliation Prompt**: *"We noticed a discrepancy. Your profile says you are 25, but you mentioned being a minor. Please confirm your correct age to proceed."*

---

## 4. Scraper & Extraction Pipeline (ETL)

The scraper pipeline is the system's "Knowledge Intake" mechanism.

1.  **Ingestion:** `scheme_scraper.py` crawls portals like MyScheme.gov.in.
2.  **Semantic Extraction:** `production_extractor.py` uses Gemini to parse raw HTML into JSON.
3.  **Heuristic Mapping:** The system maps extracted fields (e.g., "income < 2L") to canonical concepts in the `Concept Registry`.
4.  **Verification:** A secondary AI pass audits the extracted logic to ensure no "False Positives" are introduced into the database.

---

## 5. Implementation Reference Map

| Component | Logic Source | Key Files |
| :--- | :--- | :--- |
| **Matching Phases** | `eligibility.py` | 6-Phase Orchestration |
| **Deductive Resolution** | `contextual_resolver.py` | Gemini-Logic handoff |
| **Clarification Memory** | `models.py` | `QuestionAnswer` persistence |
| **Question Generation** | `gemini_client.py` | Contextual Prompt Builder |
| **Data Ingestion** | `scheme_scraper.py` | Semantic Extraction Pipeline |
| **Offline Access** | `run_omr_test.py` | OMR Vision-to-Data logic |
