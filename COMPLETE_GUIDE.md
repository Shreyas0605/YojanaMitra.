# 🇮🇳 YojanaMitra: Complete Deployment & Execution Guide

Welcome to the official deployment guide for **YojanaMitra**, a premium AI-powered welfare matching platform. This document provides everything needed to move the project from development to a live production environment.

---

## 1. Project Overview
YojanaMitra is a full-stack Flask application that uses Google Gemini AI to bridge the information gap in Indian welfare schemes. It features a multi-phase eligibility engine, automated scrapers, and a premium glassmorphic dashboard.

### Tech Stack:
- **Backend:** Flask (Python 3.10+)
- **Database:** SQLAlchemy (SQLite default, PostgreSQL supported)
- **AI Engine:** Google Gemini 1.5 Pro (via `google-generativeai`)
- **Frontend:** Vanilla JS / CSS3 (Premium Dark Mode UI)
- **Scheduling:** Flask-APScheduler (Weekly scraping)

---

## 2. Directory Structure (The Essentials)
While the repository contains many audit and test files, the following are the **essential components** for the website to function:

```text
yojanamitra/
├── app.py                      # Main Flask Server & API Routes
├── scheduler.py                # Background Scraper & Task Logic
├── requirements.txt            # Python Dependency List
├── .env                        # API Keys & Secrets
├── yojanamiitra.db             # Primary SQLite Database
├── all_extracted_conditions.json # Core Logic for Phase 1 Matching
├── app/                        # Logic Sub-modules
│   └── engine/                 # AI Orchestrator & Scoring Logic
└── static/                     # Full Frontend Assets
    ├── dashboard.html          # Premium User Dashboard
    ├── admin.html              # System Admin Panel
    ├── css/                    # Glassmorphic Styles
    └── js/                     # Client-side Evaluation Engine
```

---

## 3. Installation & Setup

### Step 1: Clone and Prepare
Ensure you have Python 3.10 or 3.11 installed.
```bash
# Install all required packages
pip install -r requirements.txt
```

### Step 2: Configure Environment
Create a `.env` file in the root directory (if not already present):
```env
GEMINI_API_KEY=AIzaSyD6ZgvxesZ8ywZpycK4Fb9DrVelw4z6kIo
SECRET_KEY=yojanamitra_premium_secret_2026
DATABASE_URL=sqlite:///yojanamiitra.db
```
*Note: The system is already updated to use the Paid Premium Tier (1000 RPM).*

### Step 3: Database Initialization
YojanaMitra handles its own migrations. The first time you run the app, it will call `init_db()` automatically to set up tables.

---

## 4. Running the Application

### Development Mode:
```bash
python app.py
```
The server will start at `http://localhost:5000`.

### Production Mode (Recommended):
For better performance on a real server, use `gunicorn`:
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

## 5. Core Features to Verify
Once the server is running, verify these key modules:

1.  **Phase 1 Matching:** Visit the Dashboard. It should load ~63 schemes instantly using the client-side evaluation engine.
2.  **Phase 3 (Resolve & Match):** Click "Resolve & Match". The system should use **Gemini 1.5 Pro** to ask clarifying questions.
3.  **Admin Scraper:** Visit `/admin.html`. This allows you to trigger manual scrapes of MyScheme.gov.in.
4.  **AI Readiness Analysis:** In the admin panel, clicking "Analyze with AI" uses the premium model to audit scheme data quality.

---

## 6. Maintenance & Automation
- **Weekly Scraper:** The system is configured to automatically scrape new schemes every **Sunday at 2:00 AM**.
- **Logs:** System logs are written to `yojanamitra_backend.log`. Check this for AI quota or database errors.

---

## 7. Troubleshooting
- **404 Model Not Found:** Ensure the model string in `app.py` is `gemini-flash-latest`.
- **Database Locked:** This happens if multiple processes try to write to SQLite. Ensure only one instance of `app.py` is running.
- **Port Conflict:** If port 5000 is taken, change the port in the last line of `app.py`.

---
**Prepared by Antigravity AI**
*YojanaMitra Optimization Suite v3.1*
