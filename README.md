# HealNexus

**AI-powered continuity of care after discharge** — doctors stay in control; patients, caregivers, and rural health workers keep the same recovery thread.

> Clinical safety: HealNexus **never diagnoses, never prescribes, and never changes a doctor’s orders**. AI drafts and education are assistive. Licensed clinicians approve care plans.

This repository is a **working MVP**, not a slide-only mockup. Core flows run in the browser with a local demo store. Optional Python AI and Supabase are documented below.

---

## 1. Problem statement

Hospitals lose visibility after discharge. Patients miss medicines, vitals drift, investigations slip, and rural families cannot always reach the same OPD. Doctors get static labels, not a live picture. Caregivers and ASHA / ANM workers work from paper or memory.

India-specific gaps this MVP targets (Ahmedabad / Gujarat demo):

- Post-discharge follow-up for diabetes, hypertension, COPD, and surgery recovery
- Language (English / Hindi / Gujarati) and village PHC → CHC → district hospital paths
- Offline-friendly health identity when the network drops
- Assistive AI that educates and organizes — without impersonating a doctor

---

## 2. Proposed solution

HealNexus is a **role-based web app** plus an optional **AI microservice**:

| Layer | What it does in this MVP |
| --- | --- |
| `webapp/` | React 19 + Vite + TypeScript SPA: Patient, Doctor, Caregiver, Health Worker, Admin |
| Local store | `localStorage` demo database (seeded Ahmedabad caseload). **This is enough to run and judge the prototype.** |
| Rule engines | Recovery score, readmission risk, disease progression, alerts — computed in the client from live check-ins |
| `ai-service/` | FastAPI: Care Companion drafts, visit brief, health assistant (Exa + OpenRouter), medicine OCR assist |
| `supabase/` | Optional Postgres schema + RLS if you wire Auth later (not required to demo) |

Doctors, patients, and field workers see **the same live scores** when check-ins, missed doses, overdue labs, or alerts change.

---

## 3. Features (demonstrable in the prototype)

Sign in with **live role buttons** on `/login` (or User ID + `demo123`).

| Feature | Where to click | Original vs third-party |
| --- | --- | --- |
| Doctor caseload + live risk / recovery | Doctor → Patients / Home Active Panel | Original rule engine + UI |
| Patient Today + Recovery | Patient → Today / Recovery | Original |
| Check-in, medicines, care plan | Patient → Check-in / Medicines / Care Plan | Original |
| AI Care Companion (chat / education) | Patient → Talk to HealNexus | Original orchestration; optional Exa + OpenRouter |
| Doctor Visit Brief | Doctor patient record | Original context pack + optional LLM |
| Medicine camera / scan assist | Patient → Scan Medicine | Original UI; optional AI extract |
| Nearest care (PHC, CHC, shop, lab) | Patient → Get help | Original Ahmedabad/village catalogue; **Leaflet + OpenStreetMap** for map tiles |
| Offline Health Card / Passport QR | Patient → Passport | Original |
| Caregiver alerts | Priya · Caregiver | Original |
| Health worker home visits | Kavita · Health Worker | Original village seed |
| EN / HI / GU | Language switcher | Original dictionaries (not i18next) |
| Admin | Admin role | Original demo admin |

**Without API keys:** all role portals, scores, maps (OSM), passport, check-ins, and village data work.

**With `ai-service` + keys:** grounded health assistant and LLM drafts. Without keys, those routes return a clear “not configured” / local fallback — the rest of the MVP still runs.

---

## 4. Technology stack

### Original work (this team)

- Domain modules: patient, doctor, caregiver, rural/health worker, identity, health passport
- Local HealNexus store, seed (Ahmedabad + village caseload)
- In-app health intelligence (`webapp/src/lib/health-engine`, `clinical-risk.ts`)
- FastAPI Care Companion orchestration and safety copy
- Custom EN/HI/GU dictionaries

### Third-party (not claimed as our models or datasets)

| Component | License / terms (use as published by vendor) | Role |
| --- | --- | --- |
| React 19, React DOM | MIT | UI |
| Vite, TypeScript | MIT | Build |
| Tailwind CSS 4 | MIT | Styling |
| React Router, TanStack Query, Zod, RHF | MIT | Routing, cache, validation |
| Framer Motion, GSAP, Lucide, Recharts | MIT / ISC | Motion, icons, charts |
| Three.js, R3F, Drei | MIT | Optional 3D marketing visuals |
| Leaflet, React Leaflet, OpenStreetMap tiles | BSD / ODbL (map data) | Hospital / care-site map |
| `@supabase/supabase-js` | Apache-2.0 | Optional Auth/DB client |
| FastAPI, Uvicorn, Pydantic, httpx | MIT / BSD | AI service |
| **Exa API** | Exa terms of service | Medical **search** (server-side) |
| **OpenRouter** | OpenRouter + underlying model terms | LLM **synthesis** (server-side) |
| **Supabase** (optional) | Supabase terms | Postgres + Auth if enabled |

We do **not** claim Exa, OpenRouter, OSM, or any public hospital list as a model “trained by the team.” Demo patients and village coordinates are **synthetic / curated for the hackathon**, not an official government dataset.

Rule-based scores are **not** a trained XGBoost production model. ML hooks exist for later swap; the judged MVP uses explainable rules.

---

## 5. System architecture

```
┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐
│  Patient   │   │   Doctor   │   │ Caregiver  │   │ Health     │
│  SPA       │   │   SPA      │   │  SPA       │   │ Worker SPA │
└─────┬──────┘   └─────┬──────┘   └─────┬──────┘   └─────┬──────┘
      │                │                │                │
      └────────────────┴────────┬───────┴────────────────┘
                                │
                     webapp (Vite :5173)
                     localStorage store  ← default demo DB
                     in-browser risk/recovery engines
                                │
              optional          │          optional
     ┌──────────────────────────┼──────────────────────────┐
     ▼                          ▼                          ▼
 FastAPI :8001            Supabase Postgres           OSM tiles
 Exa + OpenRouter         (Auth + RLS)                (Leaflet)
 keys in ai-service/.env  keys in webapp/.env         no key
 never in GitHub          (anon key only if used)
```

More design notes: [`docs/HealNexus_SRS_Architecture.md`](docs/HealNexus_SRS_Architecture.md), [`docs/FINALIZED_ARCHITECTURE.md`](docs/FINALIZED_ARCHITECTURE.md).

---

## 6. APIs (this repo)

OpenAPI when the AI service is running: [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs)

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Service health + whether Exa/OpenRouter are configured |
| POST | `/ai/care-companion` | Organize discharge text → schedule JSON (draft) |
| POST | `/ai/patient-summary` | Short assistive summary |
| POST | `/ai/visit-brief` | Doctor visit brief from packed context |
| POST | `/ai/medicine/extract` | Assistive label/text extract (not a prescription) |
| POST | `/ai/health-assistant` | Education grounded with Exa + LLM |
| POST | `/ai/emergency-checkup` | Triage-style education, not diagnosis |
| POST | `/ai/education` | Localized education pack |
| POST | `/ai/government-guidance` | PM-JAY style guidance (demo + search) |
| POST | `/predict/recovery-score` | Optional server twin of recovery rules |
| POST | `/predict/readmission` | Optional server twin of risk rules |
| POST | `/predict/disease-progression` | Condition worsening (mapped conditions only) |
| POST | `/predict/trends` | Trend narrative |
| POST | `/predict/lifestyle-simulation` | What-if lifestyle (not a treatment change) |
| POST | `/predict/alerts` | Alert policy |
| POST | `/predict/explain` | Why attribution |

The **webapp does not send Exa or OpenRouter keys**. `VITE_AI_API_BASE_URL` is only the public origin of the AI service.

CRUD for the judged demo is **not** a public REST CRUD API — it is the local store (`webapp/src/data/store`). Optional Supabase is schema-only until you set URL + anon key.

---

## 7. Database

### Default (reproducible, no install)

- Engine: browser `localStorage` key `healnexus-dynamic-store-v2`
- Seed: `webapp/src/data/store/seed.ts` (version in `STORE_VERSION`)
- Demo passwords (`demo123`) are **public demo accounts**, not production secrets

If scores look stale after a pull, hard-refresh once so the seed version migrates.

### Optional Supabase Postgres

SQL under `supabase/migrations/`. Create a project, run migrations, copy URL + **anon** key into `webapp/.env`. Never commit the service role key. `SUPABASE_SERVICE_ROLE_KEY` belongs only in `ai-service/.env` if you enable server enrichment later.

---

## 8. Setup, install, run, build

### Prerequisites

- **Node.js 20+** (see `webapp/package.json` `engines`)
- **npm** (lockfile: `webapp/package-lock.json`)
- Optional AI: **Python 3.11+**, `pip`
- Optional: Git

Clone the repo, then:

### Webapp (required for the prototype)

```bash
cd webapp
copy .env.example .env
# Windows PowerShell: Copy-Item .env.example .env
npm install
npm run dev
```

Open **http://127.0.0.1:5173** (or the URL Vite prints).

Production build:

```bash
cd webapp
npm run build
npm run preview
```

### AI service (optional)

```bash
cd ai-service
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env
# Put EXA_API_KEY and OPENROUTER_API_KEY only here — never in webapp/.env or GitHub
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

Then in `webapp/.env`:

```env
VITE_AI_API_BASE_URL=http://127.0.0.1:8001
```

Restart `npm run dev` after changing Vite env vars.

### Environment files

| File | Commit? | Contents |
| --- | --- | --- |
| `.env.example`, `webapp/.env.example`, `ai-service/.env.example` | Yes | Placeholders only |
| `webapp/.env`, `ai-service/.env` | **No** (gitignored) | Real keys if you have them |

Obtain Exa / OpenRouter keys from those vendors. Teams must follow each vendor’s terms. Do not paste keys into slides, GitHub, or the frontend.

### Deploy (Vercel + Render)

**Minimum (judges can use the product):** host only `webapp` on Vercel. Demo data lives in the browser (`localStorage`). No keys required.

1. Push the repo to GitHub.
2. [Vercel](https://vercel.com) → Import project → **Root Directory: `webapp`**.
3. Framework: Vite. Build: `npm run build`. Output: `dist`.
4. SPA rewrites are already in `webapp/vercel.json`.
5. Deploy. Open the `*.vercel.app` URL and use live role login.

**Full (Talk to HealNexus / LLM drafts):** also host `ai-service`.

1. [Render](https://render.com) → New **Web Service** → this repo → **Root Directory: `ai-service`**.
2. Runtime: Python 3.11+. Start command:

   `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. Environment (Render dashboard, never GitHub):

   - `APP_ENV=production`
   - `CORS_ORIGINS=https://YOUR-APP.vercel.app` (add the exact Vercel URL; `*.vercel.app` is also allowed in code)
   - `EXA_API_KEY`, `OPENROUTER_API_KEY`
   - `OPENROUTER_SITE_URL=https://YOUR-APP.vercel.app`

4. Confirm `https://YOUR-RENDER-URL/health` returns `"status":"ok"`.
5. Back on Vercel, set **Build** env:

   `VITE_AI_API_BASE_URL=https://YOUR-RENDER-URL`

   Redeploy the frontend so Vite bakes that URL in (it is not read at runtime).

**Do not** set Exa/OpenRouter keys on Vercel. Optional Supabase: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` on Vercel only if you actually run migrations.

---


## 9. How to run a judge demo (5 minutes)

1. `cd webapp && npm install && npm run dev`
2. Open the app → **Dr. Ananya · Doctor** → Patients: live Recovery + risk, village rows (Sanand, Bavla, Koth, …)
3. Sign out → **Asha · Patient** → Today + Recovery: **same numbers** as the doctor list
4. Get help: nearest PHC / pharmacy (OSM)
5. Optional: start `ai-service` and Talk to HealNexus

Demo User IDs (password `demo123`): `asha.patel`, `ravi.shah`, `meera.desai`, `bharat.solanki`, `leela.chauhan`, doctor live button, `priya.patel`, `kavita.solanki`, `admin`.

---

## 10. Secrets & credentials

- `.gitignore` excludes `.env`, `*.pem`, `*.key`, credential JSON
- Demo logins are documented on purpose
- Removed browser `VITE_EXA_API_KEY` / `X-Exa-Key` so a Vite key cannot leak to the client bundle

If a key was ever pasted into chat, rotate it at the vendor.

---

## 11. AI tools disclosure (put this on the PPT)

This product was built with **significant assistance from AI coding tools** (including Cursor) for scaffolding, refactoring, and documentation. **Team members must be able to explain every submitted flow.** AI output is **not** presented as unaided original work.

AI **inside the product** (Care Companion, visit brief, assistant) is a feature, disclosed here and in the UI safety copy.

---

## 12. Originality / plagiarism stance

HealNexus is an original continuity-of-care product concept and implementation in this repo. We did not copy another team’s hackathon repo and relabel it. Third-party libraries, OSM, Exa, and OpenRouter are identified above. Demo clinical numbers are generated by **our rules + synthetic seed**, not a stolen trained model.

---

## Folder layout

```text
HealNexus/
├── README.md                 # This file
├── .env.example
├── .gitignore
├── webapp/                   # MVP UI + local store + health engines
├── ai-service/               # Optional FastAPI AI
├── supabase/migrations/      # Optional Postgres
└── docs/                     # SRS / architecture
```

---

## Submission checklist (rules 6–12)

| Rule | Status |
| --- | --- |
| 6. README: problem, solution, features, stack, architecture, APIs, DB, setup, run | This document |
| 7. Working prototype / MVP, not slides only | `webapp` runnable; core features clickable |
| 8. Reproducible install / env / DB / run / build | Sections 7–9 |
| 9. External APIs & licenses named; keys not in GitHub | Sections 4, 6, 10 |
| 10. No secrets in source; `.env` + `.env.example` | gitignore + examples |
| 11. AI assistance disclosed; team must explain code | Section 11 — **also add to the PPT** |
| 12. Not a copied project; third-party vs original named | Sections 3–4, 12 |

**Still on the team:** paste Section 11 onto the presentation; do not upload `.env`; walk judges through Doctor → Patient Recovery with the same scores.
