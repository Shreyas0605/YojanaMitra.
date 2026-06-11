# YojanaMitra — Complete System Documentation

> **Version:** 2.0 | **Last Updated:** May 2026  
> **Purpose:** Comprehensive technical reference covering every engine, pipeline, and integration point in the YojanaMitra platform.  
> **Audience:** Developers, system architects, maintainers.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Matching Engine (6-Phase Architecture)](#2-matching-engine-6-phase-architecture)
3. [Beneficial Advisor](#3-beneficial-advisor)
4. [Conflict Resolution Engine](#4-conflict-resolution-engine)
5. [Questioning Engine (Deep Dive)](#5-questioning-engine-deep-dive)
6. [Scraper Pipeline](#6-scraper-pipeline)
7. [Unified Profile Engine](#7-unified-profile-engine)
8. [AI Gatekeeper & Semantic Processing](#8-ai-gatekeeper--semantic-processing)
9. [Privacy Architecture](#9-privacy-architecture)
10. [Flask Application Layer (app.py)](#10-flask-application-layer-apppy)
11. [End-to-End Data Flow](#11-end-to-end-data-flow)
12. [Deployment & Configuration](#12-deployment--configuration)
13. [Appendix A: Complete File Index](#13-appendix-a-complete-file-index)

---

## 1. System Overview

YojanaMitra is a civic-tech platform that matches Indian citizens to government welfare schemes (Yojanas) using AI-driven eligibility inference. The system ingests raw scheme PDFs from government portals, extracts eligibility criteria via a multi-strategy NLP pipeline, builds structured scheme profiles, and then matches citizens through a cascading engine architecture.

### High-Level Block Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        YOJANAMITRA SYSTEM ARCHITECTURE                   │
└──────────────────────────────────────────────────────────────────────────┘
                                                                                
  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐       
  │   DATA INGESTION │     │    AI ENGINES     │     │  USER INTERFACE  │       
  │   ┌────────────┐ │     │  ┌──────────────┐│     │  ┌────────────┐  │       
  │   │ Web        │ │     │  │ Eligibility  ││     │  │ Web App    │  │       
  │   │ Scrapers   │ │     │  │ Orchestrator ││     │  │ (Flask)    │  │       
  │   │ (6 types)  │ │     │  └──────┬───────┘│     │  └─────┬──────┘  │       
  │   └─────┬──────┘ │     │         │        │     │        │         │       
  │         │        │     │  ┌──────▼───────┐│     │  ┌─────▼──────┐  │       
  │   ┌─────▼──────┐ │     │  │   Matching   ││     │  │  Profile   │  │       
  │   │ PDF/Text   │ │     │  │    Engine    ││     │  │  Builder   │  │       
  │   │ Extractor  │ │     │  │ (6-Phase)    ││     │  └────────────┘  │       
  │   └─────┬──────┘ │     │  └──────┬───────┘│     │                  │       
  │         │        │     │         │        │     │                  │       
  │   ┌─────▼──────┐ │     │  ┌──────▼───────┐│     │                  │       
  │   │ Semantic   │ │     │  │  Beneficial   ││     │                  │       
  │   │ Extractor  │ │     │  │   Advisor     ││     │                  │       
  │   └────────────┘ │     │  └──────────────┘│     │                  │       
  │                  │     │                   │     │                  │       
  │   ┌────────────┐ │     │  ┌──────────────┐│     │  ┌────────────┐  │       
  │   │ Gemini AI  │ │     │  │  Conflict    ││     │  │  API       │  │       
  │   │ Extractor  │ │     │  │  Resolution  ││     │  │  Layer     │  │       
  │   └────────────┘ │     │  └──────────────┘│     │  └────────────┘  │       
  └──────────────────┘     └──────────────────┘     └──────────────────┘       
                                                                                
  ┌──────────────────────────────────────────────────────────────────────────┐
  │                        SUPPORTING SYSTEMS                                │
  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
  │  │ Question     │  │ Unified      │  │ AI Gatekeeper│  │ Contextual   │ │
  │  │ Engine       │  │ Profile      │  │ (Dispatcher) │  │ Reasoner     │ │
  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
  │  │ Derived Field│  │ Canonical    │  │ Rule         │  │ Deductive    │ │
  │  │ Engine       │  │ Field Registry│ │ Injector     │  │ Resolver     │ │
  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Cascading Precision**: Each phase in the Matching Engine narrows the result set with stricter criteria, from broad category match to fine-grained financial eligibility.
2. **Multi-Strategy Extraction**: Scheme criteria are extracted via regex, semantic NLP (spaCy), and Gemini AI in parallel, then reconciled via weighted voting.
3. **Privacy-First**: Personal data (name, phone, Aadhaar last 4 digits) is isolated from eligibility evaluation. The matching engine sees only derived canonical fields.
4. **Graceful Degradation**: AI services (Gemini) have thread-safe fallback chains. If AI is unavailable, the system falls back to pure regex/semantic extraction.

### Core Tech Stack

| Component | Technology |
|-----------|-----------|
| Web Framework | Flask 2.x + Jinja2 Templates |
| AI Orchestration | Google Gemini API (generativeai) |
| NLP | spaCy (en_core_web_sm), NLTK |
| PDF Processing | PyPDF2, pdfminer.six, pdfplumber |
| Web Scraping | requests, BeautifulSoup, Selenium |
| State Management | Redis (sessions, cache), server-side sessions |
| Database | PostgreSQL (via psycopg2 / flask-sqlalchemy), SQLite (dev) |
| Async | threading (BoundedSemaphore for AI rate limits) |
| Frontend | Bootstrap 5, Chart.js, vanilla JS |

---

## 2. Matching Engine (6-Phase Architecture)

The Matching Engine is the core eligibility evaluation pipeline. It executes 6 sequential phases, each implemented as a pass through the eligibility engine with different constraints.

### Conceptual Flow

```
                         ┌─────────────────────────┐
                         │  Citizen Profile Input   │
                         │  (Age, Income, Category, │
                         │   Location, Occupation)  │
                         └────────────┬────────────┘
                                      │
                         ┌────────────▼────────────┐
                         │   Phase 1: Prefilter    │
                         │   Category/State Filter │
                         │  [TargetGroup check]    │
                         └────────────┬────────────┘
                                      │
                         ┌────────────▼────────────┐
                         │   Phase 2: Eligibility  │
                         │   Criteria Match        │
                         │  [Categorical Match]    │
                         └────────────┬────────────┘
                                      │
                         ┌────────────▼────────────┐
                         │   Phase 3: Financial    │
                         │   Threshold Analysis    │
                         │  [Income/Asset Check]   │
                         └────────────┬────────────┘
                                      │
                         ┌────────────▼────────────┐
                         │   Phase 4: Contextual   │
                         │   Reasoning             │
                         │  [8-Signal Scoring]     │
                         └────────────┬────────────┘
                                      │
                         ┌────────────▼────────────┐
                         │   Phase 5: Conflict     │
                         │   Resolution            │
                         │  [Deductive Override]   │
                         └────────────┬────────────┘
                                      │
                         ┌────────────▼────────────┐
                         │   Phase 6: Ranking      │
                         │   & UX Threshold       │
                         │  [Final Score + Ease]   │
                         └────────────┬────────────┘
                                      │
                         ┌────────────▼────────────┐
                         │   Ranked Scheme List     │
                         │   (Score, Tier, Ease)   │
                         └─────────────────────────┘
```

### Phase 1: Prefilter (Target Group & Location)

**Purpose**: Eliminate schemes that categorically cannot apply to the citizen.

**Logic**:
- Check `target_group` against citizen category (General/SC/ST/OBC/Minority/Women).
- Check `state` against citizen state of residence.
- Check `gender` restrictions if scheme is gender-specific.
- Check `marital_status` restrictions for spousal schemes.

**Key Code**: `eligibility_orchestrator_prefilter()` in `app/engine/__init__.py`

```
┌────────────────┐     ┌────────────────────┐     ┌─────────────────────┐
│ Citizen Data   │────>│ Target Group Match │────>│ State Jurisdiction  │
│ (Category,     │     │ ┌────────────────┐ │     │ ┌─────────────────┐│
│  State, Gender,│     │ │ SC/ST/OBC/     │ │     │ │ Scheme.Allowed  ││
│  MaritalStatus)│     │ │ Gen/Min/Women  │ │     │ │ States.Contains ││
│                │     │ │ Exact Match    │ │     │ │ Citizen.State   ││
└────────────────┘     │ └────────────────┘ │     │ └─────────────────┘│
                       └────────────────────┘     └─────────────────────┘
                                       │                      │
                                       └──────────┬───────────┘
                                                  │
                                       ┌──────────▼───────────┐
                                       │ Gender & Marital      │
                                       │ Status Constraints   │
                                       │ ┌──────────────────┐ │
                                       │ │ Additional Filter│ │
                                       │ └──────────────────┘ │
                                       └──────────┬───────────┘
                                                  │
                                       ┌──────────▼───────────┐
                                       │     PREFILTER PASS   │
                                       │ (Eliminated Schemes  │
                                       │  Marked Ineligible)  │
                                       └──────────────────────┘
```

### Phase 2: Eligibility Criteria Match (Categorical)

**Purpose**: Apply scheme-specific eligibility rules from extracted criteria.

**Logic**:
- Iterate over raw/semantic eligibility criteria for each surviving scheme.
- Use `check_criteria_with_context()` in `app/engine/eligibility.py`.
- Match criteria categories: AGE_BASED, INCOME_BASED, CATEGORY_BASED, RESIDENCY_BASED, EDUCATION_BASED, EMPLOYMENT_BASED, DOCUMENT_BASED, GENDER_BASED, MARITAL_BASED, DISABILITY_BASED, AGRICULTURE_BASED.

```
┌──────────────────┐     ┌──────────────────────────────┐
│ Surviving Schemes│────>│ For Each Scheme:              │
│ (from Phase 1)   │     │   Load Eligibility Criteria   │
└──────────────────┘     │   ┌────────────────────────┐  │
                         │   │ Raw Criteria (extracted)│  │
                         │   │ Semantic Criteria       │  │
                         │   │ Gemini Criteria         │  │
                         │   └───────┬────────────────┘  │
                         │           │                   │
                         │   ┌───────▼────────────────┐  │
                         │   │ Criteria Router        │  │
                         │   │ ┌──────────────────┐   │  │
                         │   │ │ AGE_BASED       │   │  │
                         │   │ │ check_age()     │   │  │
                         │   │ ├──────────────────┤   │  │
                         │   │ │ INCOME_BASED    │   │  │
                         │   │ │ check_income()  │   │  │
                         │   │ ├──────────────────┤   │  │
                         │   │ │ CATEGORY_BASED  │   │  │
                         │   │ │ check_category()│   │  │
                         │   │ ├──────────────────┤   │  │
                         │   │ │ ... (11 types)  │   │  │
                         │   │ └──────────────────┘   │  │
                         │   └────────────────────────┘  │
                         └───────────────┬───────────────┘
                                         │
                               ┌─────────▼─────────┐
                               │ Criteria Met?     │
                               │ YES ──> Phase 3   │
                               │ NO  ──> Mark Low  │
                               └───────────────────┘
```

### Phase 3: Financial Threshold Analysis

**Purpose**: Apply income limits, asset limits, and BPL (Below Poverty Line) thresholds.

**Logic**:
- Compare citizen income against `income_limit` for each scheme.
- Apply BPL status scoring.
- Check asset ownership constraints.
- Use `scorer.py` for financial scoring.

```
┌──────────────────┐     ┌────────────────────────────────┐
│ Citizen Finances │────>│ Scheme Income Limit Check      │
│ (Income, Assets, │     │ ┌────────────────────────────┐ │
│  BPL Status)     │     │ │ IF Income <= IncomeLimit:  │ │
│                  │     │ │   PASS                     │ │
│                  │     │ │ ELSE:                      │ │
│                  │     │ │   Marginal / Fail          │ │
│                  │     │ └────────────────────────────┘ │
│                  │     │                                │
│                  │     │ ┌────────────────────────────┐ │
│                  │     │ │ BPL Status Scoring         │ │
│                  │     │ │ BPL YES: +20 points        │ │
│                  │     │ │ BPL NO: neutral            │ │
│                  │     │ └────────────────────────────┘ │
│                  │     │                                │
│                  │     │ ┌────────────────────────────┐ │
│                  │     │ │ Asset Limit Check          │ │
│                  │     │ │ Land, Vehicle, Housing     │ │
│                  │     │ └────────────────────────────┘ │
│                  │     └───────────────┬────────────────┘
│                  │                     │
│                  │           ┌─────────▼─────────┐
│                  │           │ Financial Score    │
│                  │           │ 0-100              │
│                  │           └───────────────────┘
└──────────────────┘
```

### Phase 4: Contextual Reasoning (8-Signal Scoring)

**Purpose**: Score schemes based on contextual depth — how well the citizen's full life situation aligns with the scheme's intent.

**Logic**: ContextualReasoner in `app/engine/context.py` evaluates 8 signals:

| Signal | Description | Weight |
|--------|-------------|--------|
| Income Alignment | Income vs scheme target income bracket | 25 |
| Category Alignment | Social category match depth | 20 |
| Age Alignment | Age range fit within scheme target | 15 |
| Location Proximity | State/District match | 12 |
| Family Profile | Family size/dependents fit | 10 |
| Asset Profile | Asset ownership vs scheme expectations | 8 |
| Gender Match | Gender-specific scheme alignment | 5 |
| Priority Score | Government priority flag for scheme | 5 |

```
┌────────────────────────────────────────────────────────────┐
│                  CONTEXTUAL REASONER                        │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Signal Extractor                                     │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│  │
│  │  │ Income   │ │ Category │ │ Age      │ │ Location ││  │
│  │  │ Signal   │ │ Signal   │ │ Signal   │ │ Signal   ││  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘│  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│  │
│  │  │ Family   │ │ Asset    │ │ Gender   │ │ Priority ││  │
│  │  │ Signal   │ │ Signal   │ │ Signal   │ │ Signal   ││  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘│  │
│  └───────┼────────────┼────────────┼─────────────┼──────┘  │
│          │            │            │             │          │
│  ┌───────▼────────────▼────────────▼─────────────▼──────┐  │
│  │              Weighted Aggregator                      │  │
│  │  Score = Σ(Signal_i × Weight_i) / MaxPossible × 100   │  │
│  │             Range: 0 (no match) - 100 (perfect)       │  │
│  └──────────────────────┬───────────────────────────────┘  │
│                         │                                   │
│  ┌──────────────────────▼───────────────────────────────┐  │
│  │  Contextual Score Output                              │  │
│  │  - Raw score (0-100)                                 │  │
│  │  - Signal strengths (for UX display)                 │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### Phase 5: Conflict Resolution

**Purpose**: Resolve contradictory signals between eligibility phases using deductive reasoning.

**Logic**: `contextual_resolver.py` applies rule-based conflict resolution.

**Conflict Types Resolved**:
1. **Category Mismatch**: If Phase 2 says eligible but citizen category mismatches scheme target group, Phase 5 overrides with INELIGIBLE.
2. **Income Threshold Conflict**: If Phase 3 marks PASS but Phase 4 finds income far above scheme norms, Phase 5 downgrades to MARGINAL.
3. **Age Anomaly**: If age-based criteria pass borderline but contextual age signal is very low, Phase 5 adds a note.
4. **Document Gap**: If all criteria pass but required documents are missing, Phase 5 marks CONDITIONAL.

```
┌────────────────────┐     ┌──────────────────────┐
│ Phase 2 Result     │────>│                      │
│ (Criteria Match)   │     │                      │
└────────────────────┘     │   CONFLICT RESOLVER   │
                           │                      │
┌────────────────────┐     │   ┌────────────────┐  │     ┌────────────────────┐
│ Phase 3 Result     │────>│   │ Rule Engine    │──│────>│ Resolved Result    │
│ (Financial)        │     │   │ ┌────────────┐  │  │     │ - Phase 2 Override │
└────────────────────┘     │   │ │ Rule 1:    │  │  │     │ - Phase 3 Downgrade│
                           │   │ │ Category   │  │  │     │ - Phase 4 Adjusted │
┌────────────────────┐     │   │ │ Conflict   │  │  │     │ - Final Decision   │
│ Phase 4 Result     │────>│   │ ├────────────┤  │  │     │ (Eligible /        │
│ (Contextual)       │     │   │ │ Rule 2:    │  │  │     │  Marginal /         │
└────────────────────┘     │   │ │ Income     │  │  │     │  Conditional /      │
                           │   │ │ Conflict   │  │  │     │  Ineligible)        │
┌────────────────────┐     │   │ ├────────────┤  │  │     └────────────────────┘
│ Profile Signals    │────>│   │ │ Rule 3:    │  │  │
│ (from Phase 4)     │     │   │ │ Age        │  │  │
└────────────────────┘     │   │ │ Anomaly    │  │  │
                           │   │ ├────────────┤  │  │
┌────────────────────┐     │   │ │ Rule 4:    │  │  │
│ Required Docs      │────>│   │ │ Document   │  │  │
│ Status             │     │   │ │ Gap        │  │  │
└────────────────────┘     │   │ └────────────┘  │  │
                           │   └────────────────┘  │
                           │                      │
                           └──────────────────────┘
```

### Phase 6: Ranking & UX Threshold

**Purpose**: Produce the final sorted list with user-friendly display tiers.

**Logic**: `ResultRanker` in `app/engine/scorer.py` computes:

- **Overall Score**: Weighted combination of Phase 2-5 results.
- **Ease Score**: How easy is it to apply? (based on document simplicity, application process complexity).
- **Tier**: GOLD (score >= 80), SILVER (score >= 60), BRONZE (score >= 40).
- **Ease Label**: VERY_EASY, EASY, MODERATE, COMPLEX.

```
┌─────────────────────────┐
│  Score Aggregator        │
│  ┌─────────────────────┐ │
│  │ Weights:            │ │
│  │ Criteria Match: 35% │ │
│  │ Financial:     25%  │ │
│  │ Contextual:    25%  │ │
│  │ Resolution:    15%  │ │
│  └──────────┬──────────┘ │
└─────────────┼────────────┘
              │
┌─────────────▼────────────┐
│  Ease Score Calculator    │
│  ┌─────────────────────┐ │
│  │ Factors:            │ │
│  │ - Documents Count   │ │
│  │ - Form Complexity   │ │
│  │ - Online/Offline    │ │
│  │ - Time Estimate     │ │
│  └──────────┬──────────┘ │
└─────────────┼────────────┘
              │
┌─────────────▼────────────┐
│  Tier Classifier          │
│  ┌─────────────────────┐ │
│  │ GOLD   >= 80            │ │
│  │ SILVER >= 60            │ │
│  │ BRONZE >= 40            │ │
│  │ Below 40: not shown     │ │
│  └─────────────────────┘ │
└─────────────┼────────────┘
              │
┌─────────────▼────────────┐
│  Sorted Output            │
│  1. PM Awas Yojana       │
│     Score: 92 | GOLD     │
│     Ease: VERY_EASY      │
│  2. Sukanya Samriddhi    │
│     Score: 78 | SILVER   │
│     Ease: EASY           │
│  3. ...                  │
└──────────────────────────┘
```

### Key Files for Matching Engine

| File | Purpose |
|------|---------|
| `app/engine/__init__.py` | EligibilityOrchestrator (prefilter, cache, tier logic) |
| `app/engine/eligibility.py` | 3-pass criteria matching engine (1206 lines) |
| `app/engine/context.py` | ContextualReasoner (8-signal scorer) |
| `app/engine/scorer.py` | ResultRanker with UX thresholds |
| `app/engine/derived_fields.py` | DAG-based field derivation |
| `app/engine/canonical_field_registry.py` | Typed field schema registry |
| `app/engine/questions.py` | QuestionEngine (deep-dive questions) |

---

## 3. Beneficial Advisor

**Purpose**: Recommend additional schemes a citizen may be eligible for based on their profile and already-matched schemes. It identifies cross-scheme synergies and hidden eligibilities.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    BENEFICIAL ADVISOR MODULE                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌──────────────────────────────────┐
│ Primary Scheme    │────>│  Cross-Scheme Mapper             │
│ (User selected)   │     │  ┌────────────────────────────┐ │
└──────────────────┘     │  │ Maps scheme requirements    │ │
                         │  │ across categories:          │ │
┌──────────────────┐     │  │ - Shared eligibility crit. │ │
│ Citizen Profile   │────>│ │ - Complementary benefits   │ │
│ (Full data)       │     │  │ - Sequential schemes       │ │
└──────────────────┘     │  │ - Upgrade paths             │ │
                         │  └────────────┬───────────────┘ │
┌──────────────────┐     │               │                  │
│ Past Matches      │────>│  ┌────────────▼───────────────┐ │
│ (History)         │     │  │ Eligibility Re-Evaluation   │ │
└──────────────────┘     │  │ (Lightweight, cache-aware)  │ │
                         │  └────────────┬───────────────┘ │
                         │               │                  │
                         │  ┌────────────▼───────────────┐ │
                         │  │ Rank & Filter              │ │
                         │  │ - Remove already-shown     │ │
                         │  │ - Remove ineligible        │ │
                         │  │ - Sort by relevance score  │ │
                         │  └────────────┬───────────────┘ │
                         │               │                  │
                         │  ┌────────────▼───────────────┐ │
                         │  │ Recommendation Output       │ │
                         │  │ "You might also qualify for │ │
                         │  │  PM-KISAN based on your     │ │
                         │  │  farmer status..."          │ │
                         │  └────────────────────────────┘ │
                         └──────────────────────────────────┘
```

### Recommendation Types

1. **Shared Eligibility**: Schemes with overlapping criteria (e.g., a woman qualifying for both Ladli Behna and Sukanya Samriddhi).
2. **Complementary Benefits**: Schemes that stack together (e.g., PM Awas + Ujjwala for BPL families).
3. **Sequential Paths**: Schemes for life-stage progression (e.g., Scholarship -> Skill Development -> Employment scheme).
4. **Upgrade Paths**: Better versions of matched schemes with stricter criteria.

### Key Integration Points

- Reads from `unified_profile_engine.py` for cross-scheme intelligence.
- Uses `eligibility_orchestrator()` for lightweight eligibility re-checks.
- Results rendered in `app.py` route `/advisor`.

---

## 4. Conflict Resolution Engine

**Purpose**: Resolve contradictions between different eligibility signals (extracted criteria vs contextual analysis vs raw text parsing).

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CONFLICT RESOLUTION ENGINE                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        INPUT LAYER                                   │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────┐ │
│  │ Eligibility Criteria│  │ Contextual        │  │ Raw Text       │ │
│  │ (Phase 2 Result)    │  │ Signals (Phase 4) │  │ (Phase 1-3)    │ │
│  └─────────┬──────────┘  └─────────┬──────────┘  └────────┬───────┘ │
└────────────┼───────────────────────┼──────────────────────┼─────────┘
             │                       │                      │
             └───────────────────────┼──────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────┐
│                        CONFLICT IDENTIFIER                           │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────┐ │
│  │ Category     │  │ Income       │  │ Age          │  │ Document│ │
│  │ Conflict     │  │ Threshold    │  │ Anomaly      │  │ Gap     │ │
│  │ Detector     │  │ Conflict     │  │ Detector     │  │ Detector│ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────┬────┘ │
└─────────┼─────────────────┼─────────────────┼───────────────┼──────┘
          │                 │                 │               │
          └─────────────────┼─────────────────┼───────────────┘
                            │                 │
┌───────────────────────────▼─────────────────▼────────────────────────┐
│                        RESOLUTION RULES                               │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ Rule 1: Category Override                                     │   │
│  │ IF (Phase 2 says ELIGIBLE) AND (TargetGroup != CitizenCategory)│   │
│  │ THEN override → INELIGIBLE (with explanation)                 │   │
│  └────────────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ Rule 2: Income Marginal                                       │   │
│  │ IF (Financial PASS) AND (Contextual Income Signal < 30)       │   │
│  │ THEN downgrade → MARGINAL (flag: income near limit)           │   │
│  └────────────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ Rule 3: Age Anomaly Note                                      │   │
│  │ IF (Age Criteria PASS borderline) AND (Age Signal < 20)       │   │
│  │ THEN add advisory note (flag: age mismatch)                   │   │
│  └────────────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ Rule 4: Document Gap Flag                                     │   │
│  │ IF (All criteria PASS) AND (RequiredDocs not in Profile)      │   │
│  │ THEN mark CONDITIONAL → show document checklist               │   │
│  └────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────────────────┐
│                        OUTPUT LAYER                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────┐ │
│  │ Final      │  │ Explanation│  │ Confidence │  │ Document       │ │
│  │ Decision   │  │ Text       │  │ Score      │  │ Checklist      │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### Key File

`contextual_resolver.py` — 137-line module with the `deductive_resolve()` function.

---

## 5. Questioning Engine (Deep Dive)

**Purpose**: When the system lacks sufficient information to determine eligibility, the Questioning Engine dynamically generates clarifying questions to fill gaps in the citizen profile.

### Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                      QUESTIONING ENGINE (DEEP DIVE)                 │
└────────────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌────────────────────────────────────────────┐
│ Current Profile   │────>│  Gap Analyzer                              │
│ (Partial/Unclear) │     │  ┌──────────────────────────────────────┐ │
└──────────────────┘     │  │ Identifies missing/incomplete fields  │ │
                         │  │ from CanonicalFieldRegistry            │ │
                         │  │ Labels: MISSING, UNCLEAR, CONTRADICT  │ │
                         │  └────────────────┬─────────────────────┘ │
┌──────────────────┐     │                   │                        │
│ Scheme Criteria   │────>│  ┌────────────────▼─────────────────────┐ │
│ (Extracted)       │     │  │ Question Generator                   │ │
└──────────────────┘     │  │ Templates:                            │ │
                         │  │ - "What is your {{field}}?"          │ │
                         │  │ - "Do you have {{document}}?"        │ │
                         │  │ - "Is your {{situation}} like X or Y?"│ │
                         │  └────────────────┬─────────────────────┘ │
                         │                   │                        │
┌──────────────────┐     │  ┌────────────────▼─────────────────────┐ │
│ User Response     │<────│──│ Response Processor                   │ │
│ (Answer Input)    │     │  │ Parses answer → updates profile     │ │
└──────────────────┘     │  │ Triggers re-evaluation if needed     │ │
                         │  └──────────────────────────────────────┘ │
                         └───────────────────────────────────────────┘
```

### Question Categories

| Category | Trigger | Example |
|----------|---------|---------|
| Income Clarification | Income not provided | "What is your annual household income?" |
| Category Confirmation | Category not specified | "Which social category do you belong to?" |
| Document Check | Document list needed | "Do you have a BPL certificate?" |
| Employment Detail | Job type unclear | "Are you employed in the organized sector?" |
| Family Composition | Family size critical | "How many dependents do you have?" |
| Location Precision | District needed | "Which district do you reside in?" |

### Key File

`app/engine/questions.py` — QuestionEngine class (330 lines).

---

## 6. Scraper Pipeline

**Purpose**: Automatically discover, download, and extract eligibility criteria from government scheme PDFs and web pages.

### Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          SCRAPER PIPELINE                                 │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                          SCHEDULER / TRIGGER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Cron Job     │  │ Manual       │  │ Webhook      │  │ Admin Panel  │ │
│  │ (Daily)      │  │ Trigger      │  │ (Git Push)   │  │ Trigger      │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
└─────────┼─────────────────┼─────────────────┼───────────────┼──────────┘
          │                 │                 │               │
          └─────────────────┼─────────────────┼───────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────────────────┐
│                      SPECIALIZED SCRAPERS (6 Types)                       │
│                                                                          │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐ │
│  │ 1. Scheme Scraper  │  │ 2. PDF Scraper     │  │ 3. State Portal    │ │
│  │ scrape_scheme_list()│  │ scrape_pdf()       │  │ scrape_state()     │ │
│  │ - Ministry sites   │  │ - PDF download     │  │ - State gov sites  │ │
│  │ - Scheme portals   │  │ - Text extraction  │  │ - Regional schemes │ │
│  └────────┬───────────┘  └────────┬───────────┘  └────────┬───────────┘ │
│                                                                          │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐ │
│  │ 4. Scheme Pedia    │  │ 5. MyScheme.gov   │  │ 6. Budget Doc      │ │
│  │ scrape_pedia()     │  │ scrape_myscheme()  │  │ scrape_budget()    │ │
│  │ - Wiki-style pages │  │ - Official portal  │  │ - Budget documents │ │
│  │ - Community info   │  │ - Structured data  │  │ - Allocation data  │ │
│  └────────┬───────────┘  └────────┬───────────┘  └────────┬───────────┘ │
└───────────┼────────────────────────┼──────────────────────┼──────────────┘
            │                        │                      │
            └────────────────────────┼──────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                           EXTRACTION PIPELINE                            │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Stage 1: Raw Text Extraction (PyPDF2 / pdfminer / pdfplumber)   │   │
│  └────────────────────────────┬─────────────────────────────────────┘   │
│                               │                                         │
│  ┌────────────────────────────▼─────────────────────────────────────┐   │
│  │ Stage 2: Rule-Based Extraction (semantic_eligibility_extractor)  │   │
│  │ - Regex patterns for income, age, category, residency            │   │
│  │ - spaCy NER for entity extraction                                │   │
│  └────────────────────────────┬─────────────────────────────────────┘   │
│                               │                                         │
│  ┌────────────────────────────▼─────────────────────────────────────┐   │
│  │ Stage 3: Semantic Rule Injection (semantic_rule_injector)        │   │
│  │ - 50+ injection rules for specific scheme patterns               │   │
│  │ - Context-aware criteria refinement                              │   │
│  └────────────────────────────┬─────────────────────────────────────┘   │
│                               │                                         │
│  ┌────────────────────────────▼─────────────────────────────────────┐   │
│  │ Stage 4: Gemini AI Extraction (processor.py)                    │   │
│  │ - 2-pass extraction with schema validation                      │   │
│  │ - Structured JSON output                                        │   │
│  └────────────────────────────┬─────────────────────────────────────┘   │
│                               │                                         │
│  ┌────────────────────────────▼─────────────────────────────────────┐   │
│  │ Stage 5: Weighted Reconciliation                                │   │
│  │ - Vote-based merging of all extraction outputs                  │   │
│  │ - Conflict resolution across sources                            │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                          PERSISTENCE                                    │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐│
│  │ PostgreSQL         │  │ SQLite (dev)       │  │ File Cache         ││
│  │ - Scheme profiles  │  │ - Local testing    │  │ - PDFs             ││
│  │ - Eligibility data │  │ - Quick iteration  │  │ - Extracted text   ││
│  └────────────────────┘  └────────────────────┘  └────────────────────┘│
└──────────────────────────────────────────────────────────────────────────┘
```

### Scraper Details

| Scraper | Function | Source | Rate Limit |
|---------|----------|--------|------------|
| Scheme Scraper | `scrape_scheme_list()` | Ministry websites | 1 req/sec |
| PDF Scraper | `scrape_pdf()` | Direct PDF URLs | Configurable |
| State Portal | `scrape_state()` | State gov portals | 2 req/sec |
| Scheme Pedia | `scrape_pedia()` | Community wikis | 1 req/sec |
| MyScheme.gov | `scrape_myscheme()` | Official scheme portal | 1 req/2sec |
| Budget Doc | `scrape_budget()` | Budget publications | 1 req/sec |

### Key File

`scheme_scraper.py` — 1396 lines, 6 specialized scrapers with error handling and rate limiting.

---

## 7. Unified Profile Engine

**Purpose**: Create a comprehensive, cross-scheme citizen profile by merging data from multiple sources and deriving inferred fields.

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      UNIFIED PROFILE ENGINE                           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        DATA SOURCES                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────┐ │
│  │ User Input │  │ Session    │  │ Database   │  │ Derived        │ │
│  │ (Form)     │  │ (Redis)    │  │ (Postgres) │  │ Fields (DAG)  │ │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘  └───────┬────────┘ │
└─────────┼───────────────┼───────────────┼────────────────┼──────────┘
          │               │               │                │
          └───────────────┼───────────────┼────────────────┘
                          │               │
┌─────────────────────────▼───────────────▼──────────────────────────┐
│                     PROFILE MERGER                                  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Merge Strategy: Latest wins for direct fields                │  │
│  │ Union for multi-valued fields                                │  │
│  │ AI-suggested for missing fields                              │  │
│  └────────────────────────────┬─────────────────────────────────┘  │
└───────────────────────────────┼────────────────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────────┐
│                     FIELD DERIVATION ENGINE                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ DAG-Based Derivation                                         │  │
│  │                                                              │  │
│  │  Age ────────────► Age Group (child/adult/senior)           │  │
│  │  Income + Family ──► Per Capita Income                      │  │
│  │  Category + State ─► Priority Group                        │  │
│  │  Land + Income ────► Agricultural Status                   │  │
│  │  Age + Gender ─────► Life Stage                            │  │
│  │  Documents ───────► Document Completeness Score            │  │
│  └────────────────────────────┬─────────────────────────────────┘  │
└───────────────────────────────┼────────────────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────────┐
│                     FINAL UNIFIED PROFILE                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ {                                                            │  │
│  │   "direct_fields": { age, income, category, state, ... },   │  │
│  │   "derived_fields": { age_group, per_capita, ... },         │  │
│  │   "documents": { aadhaar: true, income_cert: false, ... },  │  │
│  │   "confidence": 0.85                                        │  │
│  │ }                                                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Key File

`unified_profile_engine.py` — Cross-scheme intelligence (595 lines).
`app/engine/derived_fields.py` — DAG-based field derivation.

---

## 8. AI Gatekeeper & Semantic Processing

### AI Gatekeeper

**Purpose**: Thread-safe dispatcher for Gemini AI calls with automatic fallback chain.

```
┌──────────────────────────────────────────────────────────────────────┐
│                         AI GATEKEEPER                                 │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│ AI Request        │
│ (Prompt + Schema) │
└────────┬─────────┘
         │
┌────────▼─────────┐     YES     ┌──────────────────────┐
│ Rate Limit Check │────────────>│ Gemini AI Dispatch   │
│ (Semaphore)      │             │ - Thread-safe        │
└────────┬─────────┘             │ - BoundedSemaphore(3)│
         │ NO                    │ - Structured Output  │
         │                       └──────────┬───────────┘
         │                                  │ SUCCESS
         │                       ┌──────────▼───────────┐
         │                       │ Valid JSON?          │
         │                       │ Schema Match?        │
         │                       └──────────┬───────────┘
         │                                  │ NO
         │                       ┌──────────▼───────────┐
         │                       │ Retry (max 2)        │
         │                       └──────────┬───────────┘
         │                                  │ FAIL
         │                       ┌──────────▼───────────┐
         │                       │ Fallback Chain        │
         │                       │ 1. Gemini (retry ×2) │
         │                       │ 2. spaCy NER         │
         │                       │ 3. Regex Extraction  │
         │                       │ 4. Default Values    │
         └──────────────────────>└──────────────────────┘
```

### Semantic Extraction Layer

**Purpose**: Multi-strategy extraction of eligibility criteria from scheme text.

```
┌──────────────────────────────────────────────────────────────────────┐
│                    SEMANTIC EXTRACTION LAYER                          │
└──────────────────────────────────────────────────────────────────────┘

┌────────────────────┐     ┌────────────────────────────────────────┐
│ Raw Scheme Text    │────>│  Strategy 1: Regex Patterns            │
│ (PDF/HTML Source)  │     │  - Income: "income.*(?:less|below|upto)│
│                    │     │  - Age: "age.*between (\d+) and (\d+)" │
│                    │     │  - Category: "SC|ST|OBC|Minority"      │
│                    │     │  - Residency: "resident of (\w+)"      │
│                    │     │  - Gender: "women|female|male"         │
│                    │     └────────────────┬───────────────────────┘
│                    │                      │
│                    │     ┌────────────────▼───────────────────────┐
│                    │     │  Strategy 2: spaCy NER                │
│                    │     │  - Money entities (income amounts)    │
│                    │     │  - Date entities (age limits)         │
│                    │     │  - GPE entities (location/state)      │
│                    │     │  - ORG entities (ministry names)      │
│                    │     └────────────────┬───────────────────────┘
│                    │                      │
│                    │     ┌────────────────▼───────────────────────┐
│                    │     │  Strategy 3: Gemini AI                │
│                    │     │  - Structured JSON extraction         │
│                    │     │  - Complex criteria inference         │
│                    │     │  - Implicit eligibility detection     │
│                    │     └────────────────┬───────────────────────┘
│                    │                      │
│                    │     ┌────────────────▼───────────────────────┐
│                    │     │  Reconciliation (Weighted Voting)     │
│                    │     │  - Each strategy votes on each field  │
│                    │     │  - Majority wins                     │
│                    │     │  - Confidence score computed         │
│                    │     └──────────────────────────────────────┘
└────────────────────┘
```

### Key Files

| File | Purpose |
|------|---------|
| `ai_gatekeeper.py` | Thread-safe AI dispatch with fallback |
| `semantic_eligibility_extractor.py` | Multi-strategy extraction (775 lines) |
| `semantic_rule_injector.py` | 50+ domain-specific rules (1125 lines) |
| `app/pipeline/extractor.py` | Gemini 2-pass extraction |
| `app/pipeline/processor.py` | 8-step extraction pipeline |

---

## 9. Privacy Architecture

**Purpose**: Ensure personally identifiable information (PII) is never used directly in eligibility decisions. The system operates on canonical, anonymized fields.

### Data Isolation Model

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PRIVACY ARCHITECTURE                             │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────┐     ┌──────────────────────────────────┐
│    PII LAYER (Isolated)      │     │    CANONICAL LAYER (Shared)       │
│                              │     │                                  │
│  ┌────────────────────────┐  │     │  ┌────────────────────────────┐ │
│  │ Name                   │  │     │  │ Age (derived from DOB)     │ │
│  │ Phone Number           │  │     │  │ Income Brackets            │ │
│  │ Email                  │  │     │  │ Category Code (SC/ST/OBC)  │ │
│  │ Full Aadhaar           │  │     │  │ State Code                 │ │
│  │ Full Address           │  │     │  │ Gender                     │ │
│  │ DOB (raw)              │  │     │  │ Marital Status             │ │
│  │ Photo/ID URLs          │  │     │  │ Occupation Group           │ │
│  └────────────────────────┘  │     │  │ Education Level            │ │
│                              │     │  │ Family Size                │ │
│  NEVER passed to engine      │     │  │ Asset Indicators           │ │
│  Stored encrypted if at all  │     │  └────────────────────────────┘ │
└──────────────────────────────┘     │                                  │
                                      │  Field mapping in               │
                                      │  CanonicalFieldRegistry         │
                                      └──────────────────────────────────┘
                                               │
                                               │ (only canonical fields)
                                               ▼
                                    ┌──────────────────────┐
                                    │   ELIGIBILITY ENGINE  │
                                    │   (Operates on       │
                                    │    canonical fields  │
                                    │    ONLY)             │
                                    └──────────────────────┘
```

### Key Privacy Mechanisms

1. **Field Transformation**: Raw user data → canonical fields (e.g., DOB → age bracket, full address → state code).
2. **Data Minimization**: Only fields needed for eligibility are extracted and stored.
3. **Session Isolation**: PII stored in encrypted server-side sessions, not in eligibility database.
4. **Audit Trail**: Every eligibility decision is logged with the canonical fields used, without PII.

### Key File

`app/engine/canonical_field_registry.py` — Typed field schema that defines the privacy-safe canonical layer.

---

## 10. Flask Application Layer (app.py)

**Purpose**: The main web application serving the YojanaMitra user interface and API endpoints.

### Route Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                      FLASK APPLICATION (app.py)                      │
│                      Main entry point, 6859 lines                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        MIDDLEWARE LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────┐ │
│  │ Session Mgmt │  │ CSRF Protect │  │ Rate Limiter │  │ Logging │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         ROUTE MAP                                    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ PUBLIC ROUTES                                                  │  │
│  │  GET  /                  → Home/explanatory landing           │  │
│  │  GET  /schemes           → Paginated scheme listing           │  │
│  │  GET  /scheme/<id>       → Single scheme detail               │  │
│  │  POST /check             → Eligibility check (main)           │  │
│  │  GET  /results/<id>      → Eligibility results               │  │
│  │  GET  /advisor           → Beneficial Advisor recomms         │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ USER ROUTES (Session-based)                                    │  │
│  │  POST /profile/update     → Update citizen profile            │  │
│  │  GET  /profile            → View current profile              │  │
│  │  POST /questions/answer   → Answer deep-dive question         │  │
│  │  GET  /questions          → Get pending questions             │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ ADMIN ROUTES                                                   │  │
│  │  GET  /admin              → Admin dashboard                   │  │
│  │  POST /admin/scrape       → Trigger manual scrape             │  │
│  │  GET  /admin/schemes      → Manage schemes                    │  │
│  │  POST /admin/cache/clear  → Clear eligibility cache           │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ API ROUTES (JSON)                                              │  │
│  │  GET  /api/schemes         → Scheme list JSON                 │  │
│  │  POST /api/check           → Eligibility check JSON           │  │
│  │  GET  /api/analytics       → Usage statistics                 │  │
│  └────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     INTEGRATION HUBS                                 │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────┐ │
│  │ Eligibility  │  │ Matching     │  │ Question     │  │ Session │ │
│  │ Orchestrator │  │ Engine       │  │ Engine       │  │ Manager │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────┐ │
│  │ Profile      │  │ Advisor      │  │ Cache Layer  │  │ Logger  │ │
│  │ Builder      │  │ Engine       │  │ (Redis)      │  │         │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Route-Level Data Flow

```
User Browser                    Flask Server                     Engine Layer
    │                               │                               │
    │  POST /check                  │                               │
    │  {age, income, category, ...} │                               │
    │──────────────────────────────>│                               │
    │                               │  eligibility_orchestrator()   │
    │                               │──────────────────────────────>│
    │                               │                               │
    │                               │  ┌─────────────────────────┐  │
    │                               │  │ 1. Prefilter (Phase 1)  │  │
    │                               │  │ 2. Criteria (Phase 2)   │  │
    │                               │  │ 3. Financial (Phase 3)  │  │
    │                               │  │ 4. Context (Phase 4)    │  │
    │                               │  │ 5. Conflict (Phase 5)   │  │
    │                               │  │ 6. Rank (Phase 6)       │  │
    │                               │  └─────────────────────────┘  │
    │                               │<──────────────────────────────│
    │                               │                               │
    │  200 OK                       │                               │
    │  {schemes: [...], scores,...} │                               │
    │<──────────────────────────────│                               │
```

### Key Files

`app.py` — Main Flask application (6859 lines).
`templates/` — Jinja2 templates (Bootstrap 5 frontend).

---

## 11. End-to-End Data Flow

### Complete Request Flow: Citizen Eligibility Check

```
┌──────────────────────┐
│ USER ENTERS DATA      │
│ - Personal details    │
│ - Financial info      │
│ - Location            │
└──────────┬───────────┘
           │
┌──────────▼───────────┐
│ SESSION LAYER         │
│ - Encrypt PII         │
│ - Extract canonical   │
│   fields              │
│ - Store in Redis      │
└──────────┬───────────┘
           │
┌──────────▼───────────┐
│ ELIGIBILITY ENGINE    │
│                       │
│  Phase 1: Prefilter   │
│  ├─ Target group      │
│  ├─ State check       │
│  └─ Gender filter     │
│                       │
│  Phase 2: Criteria    │
│  ├─ Raw criteria      │
│  ├─ Semantic criteria │
│  └─ AI criteria       │
│                       │
│  Phase 3: Financial   │
│  ├─ Income limit      │
│  ├─ BPL scoring       │
│  └─ Asset check       │
│                       │
│  Phase 4: Contextual  │
│  ├─ 8-signal scoring  │
│  ├─ Weighted agg      │
│  └─ Strength calc     │
│                       │
│  Phase 5: Conflict    │
│  ├─ Rule matching     │
│  ├─ Override logic    │
│  └─ Decision output   │
│                       │
│  Phase 6: Ranking     │
│  ├─ Final score       │
│  ├─ Tier assignment   │
│  └─ Ease calculation  │
└──────────┬───────────┘
           │
┌──────────▼───────────┐
│ BENEFICIAL ADVISOR    │
│ - Cross-scheme check  │
│ - Additional recomms  │
│ - Rank & filter       │
└──────────┬───────────┘
           │
┌──────────▼───────────┐
│ QUESTION ENGINE       │
│ - Gap analysis        │
│ - Question generation │
│ - (if gaps exist)     │
└──────────┬───────────┘
           │
┌──────────▼───────────┐
│ RESPONSE ASSEMBLY     │
│ - Primary matches     │
│ - Advisor recomms     │
│ - Pending questions   │
│ - Document checklist  │
└──────────┬───────────┘
           │
┌──────────▼───────────┐
│ UI RENDERING          │
│ - Tiered display      │
│ - Comparison view     │
│ - Action guidance     │
└──────────────────────┘
```

### Data Flow: Scraping Pipeline

```
┌──────────────────┐
│ CRON / TRIGGER    │
└────────┬─────────┘
         │
┌────────▼─────────┐
│ SITEMAP DISCOVERY │
│ (Find new/updated │
│  scheme pages)    │
└────────┬─────────┘
         │
┌────────▼─────────┐
│ CONTENT FETCH     │
│ 6 Scrapers ──>   │
│ Raw HTML/PDF     │
└────────┬─────────┘
         │
┌────────▼─────────┐
│ TEXT EXTRACTION   │
│ PyPDF2 / pdfminer │
│ / pdfplumber     │
│ / BeautifulSoup  │
└────────┬─────────┘
         │
┌────────▼─────────┐
│ CRITERIA EXTRACT  │
│ ┌──────────────┐ │
│ │ Regex        │ │
│ ├──────────────┤ │
│ │ spaCy NER    │ │
│ ├──────────────┤ │
│ │ Gemini AI   │ │
│ ├──────────────┤ │
│ │ Reconciliation│ │
│ └──────────────┘ │
└────────┬─────────┘
         │
┌────────▼─────────┐
│ DATABASE WRITE    │
│ - Scheme profile  │
│ - Criteria        │
│ - Metadata        │
└────────┬─────────┘
         │
┌────────▼─────────┐
│ CACHE INVALIDATE  │
│ - Clear elig cache│
│ - Update sitemap  │
└──────────────────┘
```

---

## 12. Deployment & Configuration

### Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `GEMINI_API_KEY` | Google Gemini AI key | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `SECRET_KEY` | Flask session secret | Yes |
| `PYTHON_VERSION` | Python runtime version | Dev |
| `MAX_AI_WORKERS` | AI thread pool size (default: 3) | No |

### Deployment Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    PRODUCTION DEPLOYMENT                       │
│                                                               │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐             │
│  │ Nginx    │────>│ Gunicorn │────>│ Flask    │             │
│  │ (Reverse │     │ (WSGI)   │     │ (App)    │             │
│  │ Proxy)   │     │ Workers  │     │          │             │
│  └──────────┘     └──────────┘     └────┬─────┘             │
│                                          │                   │
│                    ┌─────────────────────┼──────────────┐   │
│                    │                     │              │   │
│              ┌─────▼─────┐       ┌───────▼──────┐      │   │
│              │ PostgreSQL │       │ Redis        │      │   │
│              │ (Primary)  │       │ (Cache/Sess) │      │   │
│              └───────────┘       └──────────────┘      │   │
│                                                         │   │
│              ┌──────────────────────────────────────┐   │   │
│              │ File System                          │   │   │
│              │ - PDF cache                          │   │   │
│              │ - Logs                               │   │   │
│              └──────────────────────────────────────┘   │   │
└──────────────────────────────────────────────────────────┘   │
                                                               │
┌──────────────────────────────────────────────────────────────┐
│                    BACKGROUND PROCESSES                       │
│                                                               │
│  ┌─────────────────────┐     ┌─────────────────────────────┐ │
│  │ Scraper Cron Job    │     │ Session Cleanup (Redis)     │ │
│  │ (Daily, 2 AM)       │     │ (Hourly, expired sessions)  │ │
│  └─────────────────────┘     └─────────────────────────────┘ │
│  ┌─────────────────────┐     ┌─────────────────────────────┐ │
│  │ Cache Warming       │     │ AI Model Fallback Health    │ │
│  │ (Post-scrape)       │     │ Check (Every 5 min)        │ │
│  └─────────────────────┘     └─────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Performance Considerations

- **AI Rate Limiting**: BoundedSemaphore(3) limits concurrent Gemini calls.
- **Eligibility Caching**: Results cached by canonical field hash (TTL: 1 hour).
- **Session Storage**: Redis-based, TTL: 30 minutes.
- **Database Connection Pool**: 10-20 connections per Gunicorn worker.
- **Static Assets**: Served via Nginx, Flask only for dynamic content.

---

## 13. Appendix A: Complete File Index

```
C:\yojanamitra_complete\
│
├── app.py                                # Main Flask application (6859 lines)
│                                         # Routes, session mgmt, engine integration
│
├── scheme_scraper.py                     # 6 specialized web scrapers (1396 lines)
│                                         # Scheme, PDF, State, Pedia, MyScheme, Budget
│
├── semantic_eligibility_extractor.py     # Multi-strategy criteria extraction (775 lines)
│                                         # Regex + spaCy NER + pattern matching
│
├── semantic_rule_injector.py             # 50+ domain-specific rules (1125 lines)
│                                         # Context-aware criteria refinement
│
├── contextual_resolver.py                # Deductive conflict resolution (137 lines)
│                                         # Rule-based override engine
│
├── unified_profile_engine.py             # Cross-scheme intelligence (595 lines)
│                                         # Profile merging, cross-scheme analysis
│
├── ai_gatekeeper.py                      # Thread-safe AI dispatch with fallback
│                                         # Rate limiting, retry, fallback chain
│
├── app\
│   ├── __init__.py                       # App factory, config loading
│   │
│   ├── engine\
│   │   ├── __init__.py                   # EligibilityOrchestrator
│   │   │                                 # Prefilter, cache orchestration, tier logic
│   │   ├── eligibility.py                # 3-pass criteria matching (1206 lines)
│   │   │                                 # Criteria router, check_criteria_with_context()
│   │   ├── context.py                    # ContextualReasoner
│   │   │                                 # 8-signal scoring system
│   │   ├── scorer.py                     # ResultRanker
│   │   │                                 # Final scoring, UX thresholds, tiering
│   │   ├── questions.py                  # QuestionEngine (330 lines)
│   │   │                                 # Deep-dive question generation
│   │   ├── derived_fields.py             # DAG-based field derivation
│   │   │                                 # Age group, per capita, etc.
│   │   └── canonical_field_registry.py   # Typed field schema registry
│   │                                     # Privacy-safe field definitions
│   │
│   ├── pipeline\
│   │   ├── __init__.py                   # Pipeline factory
│   │   ├── processor.py                  # 8-step extraction pipeline
│   │   │                                 # Fetch → Extract → Parse → Enhance → Validate
│   │   ├── extractor.py                  # Gemini 2-pass extraction
│   │   │                                 # Structured JSON extraction via AI
│   │   └── fetcher.py                    # URL/content fetcher
│   │                                     # HTTP client with retry logic
│   │
│   ├── models\
│   │   ├── scheme.py                     # Scheme database model
│   │   ├── profile.py                    # Profile database model
│   │   └── eligibility.py                # Eligibility result model
│   │
│   ├── templates\                        # Jinja2 HTML templates
│   │   ├── base.html                     # Base layout (Bootstrap 5)
│   │   ├── index.html                    # Home page
│   │   ├── check.html                    # Eligibility check form
│   │   ├── results.html                  # Results display
│   │   ├── scheme.html                   # Scheme detail page
│   │   ├── advisor.html                  # Advisor recommendations
│   │   ├── admin.html                    # Admin dashboard
│   │   └── partials\                     # Reusable template fragments
│   │
│   └── static\                           # Static assets
│       ├── css\                          # Stylesheets
│       ├── js\                           # JavaScript files
│       └── images\                       # Images and icons
│
├── tests\                                # Test suite
│   ├── test_eligibility.py               # Eligibility engine tests
│   ├── test_scraper.py                   # Scraper tests
│   ├── test_questions.py                 # Question engine tests
│   └── test_integration.py               # End-to-end tests
│
├── docs\
│   ├── YOJANAMITRA_SYSTEM_DESIGN.md      # Original system design document
│   ├── PRIVACY_SAFE_ELIGIBILITY_ARCH.md  # Privacy architecture
│   └── architecture.md                   # Architecture flow diagrams
│
├── requirements.txt                      # Python dependencies
├── Dockerfile                            # Container definition
├── docker-compose.yml                    # Multi-container setup
├── .env.example                          # Environment template
└── README.md                             # Project README
```

---

*— End of YojanaMitra Complete System Documentation —*
