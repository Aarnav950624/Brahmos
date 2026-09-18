<div align="center">

# HealNexus

**Healthcare that stays with you — after discharge.**

AI-powered continuity of care for patients, families, doctors, and rural health workers.

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_19-087EA4?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

[Quick start](#quick-start) · [Demo logins](#five-minute-demo) · [Architecture](#system-architecture) · [Deploy](#deploy) · [Safety](#clinical-safety)

</div>

---

## Clinical safety

> HealNexus **never diagnoses, never prescribes, and never changes a doctor’s orders.**  
> AI drafts and education are assistive. **AI assists. Clinicians decide.**

This repo is a **working MVP** — not a slide deck. Role portals, live recovery/risk scores, village caseload, maps, and passport run in the browser with **no API keys**. Optional FastAPI + Exa/OpenRouter unlock grounded chat.

---

## Table of contents

1. [Problem](#problem)
2. [Solution](#solution)
3. [Features](#features)
4. [Pricing model](#pricing-model)
5. [Tech stack](#technology-stack)
6. [Architecture](#system-architecture)
7. [APIs](#apis)
8. [Database](#database)
9. [Setup & run](#quick-start)
10. [Deploy](#deploy)
11. [Secrets](#secrets--credentials)
12. [AI disclosure](#ai-tools-disclosure)
13. [Originality](#originality)

---

## Problem

Hospitals lose the patient at the gate. After discharge, medicines are missed, vitals drift, labs go overdue, and rural families cannot always reach the same OPD. Doctors see **static labels**. Caregivers and ASHA / ANM workers work from paper.

**India-shaped gaps this MVP targets** (Ahmedabad / Gujarat demo):

| Gap | What breaks |
| --- | --- |
| Post-discharge follow-up | Diabetes, hypertension, COPD, surgery recovery |
| Language | English, Hindi, Gujarati in the same product |
| Rural path | Village PHC → CHC → district hospital |
| Offline | Health identity when the network drops |
| Trust | Assistive AI that **does not** impersonate a doctor |

---

## Solution

One continuity thread for **patient · family · doctor · health worker**.

| Layer | Role in this MVP |
| --- | --- |
| **`webapp/`** | React 19 + Vite + TypeScript — five roles, marketing site, `/pricing` |
| **Local store** | Browser `localStorage` seed (Ahmedabad + villages). **Enough to judge the prototype.** |
| **Rule engines** | Recovery score, readmission risk, disease progression, alerts from live check-ins |
| **`ai-service/`** | Optional FastAPI — Care Companion, visit brief, health assistant, medicine extract |
| **`supabase/`** | Optional Postgres + RLS — **not required** to demo |

When a check-in, missed dose, or overdue lab changes, **the doctor list and the patient Recovery page show the same numbers.**

```mermaid
flowchart LR
  subgraph People
    P[Patient]
    D[Doctor]
    C[Caregiver]
    H[Health worker]
  end
  subgraph HealNexus
    W[Web app]
    S[Local store + rules]
    A[Optional AI service]
  end
  P --> W
  D --> W
  C --> W
  H --> W
  W --> S
  W -.-> A
```

---

## Features

Sign in on `/login` with **live role buttons**, or User ID + `demo123`.

| You can try | Where | Built by |
| --- | --- | --- |
| Live risk + recovery caseload | Doctor → Patients / Active Panel | Original rules + UI |
| Today dashboard + Recovery | Patient → Today / Recovery | Original |
| Check-in, medicines, care plan | Patient modules | Original |
| Talk to HealNexus | Patient → companion | Original orchestration; optional Exa + OpenRouter |
| AI Doctor Visit Brief | Doctor patient record | Original context; optional LLM |
| Medicine camera scanner | Patient → Scan | Original UI; optional extract |
| Nearest care (PHC, shop, lab) | Patient → Get help | Original catalogue + **Leaflet / OSM** |
| Offline Health Card / Passport QR | Patient → Passport | Original |
| Family / caregiver alerts | Priya · Caregiver | Original |
| Village home visits | Kavita · Health Worker | Original seed |
| EN / HI / GU | Language switcher | Original dictionaries |
| Pricing (B2C + B2B + sponsored) | `/pricing` | Original marketing page |

**No keys:** portals, scores, OSM maps, passport, check-ins, villages.  
**With AI service:** grounded assistant and LLM drafts. Without keys, those calls fail closed — the rest still runs.

---

## Pricing model

Presentation only (`webapp/src/modules/marketing/pricing-config.ts`) — **not billed**.

| Who | Price | Intent |
| --- | --- | --- |
| Individual | **₹0** / **₹99**/mo | Free everyday care · Care = personal AI |
| Family | **₹199**/mo | Up to 5 members |
| Hospitals | **₹4,999+** / Custom | Proposed SaaS — labelled as proposed |
| Communities | Sponsored | NGOs / CSR / public health *potential* deploy — no fake gov partnerships |

---

## Technology stack

### This team built

- Role modules (patient, doctor, caregiver, health worker, admin, identity)
- Local store + Ahmedabad / village seed
- In-app health intelligence (`webapp/src/lib/health-engine`, `clinical-risk.ts`)
- FastAPI Care Companion orchestration + safety copy
- Custom EN / HI / GU dictionaries
- Marketing + pricing UX

### Third-party (not our trained models)

| Piece | Terms | Use |
| --- | --- | --- |
| React 19, Vite, TypeScript, Tailwind 4 | MIT | App shell |
| React Router, TanStack Query, Zod, RHF | MIT | Routing, cache, forms |
| Framer Motion, GSAP, Lucide, Recharts | MIT / ISC | Motion, icons, charts |
| Three.js / R3F / Drei | MIT | Marketing 3D |
| Leaflet + OpenStreetMap | BSD / ODbL | Care-site map tiles |
| FastAPI, Uvicorn, Pydantic, httpx | MIT / BSD | AI service |
| `@supabase/supabase-js` | Apache-2.0 | Optional client |
| **Exa** | Vendor ToS | Server-side medical **search** |
| **OpenRouter** | Vendor + model ToS | Server-side LLM **synthesis** |

Demo patients and village coordinates are **synthetic / curated**. Scores are **explainable rules**, not a production XGBoost we trained. We do **not** claim OSM, Exa, or OpenRouter as team-built models.

---

## System architecture

```mermaid
flowchart TB
  subgraph Client["webapp · Vite :5173"]
    UI[Role SPAs + marketing]
    Store[localStorage store]
    Engines[Recovery / risk / progression]
    UI --> Store
    UI --> Engines
  end
  subgraph Optional
    FastAPI["ai-service :8001"]
    SB[Supabase Postgres]
    OSM[OSM tiles]
  end
  UI -.-> FastAPI
  UI -.-> SB
  UI --> OSM
  FastAPI --> Exa[Exa]
  FastAPI --> OR[OpenRouter]
```

Keys for Exa / OpenRouter live **only** in `ai-service/.env` (or Render). Never in Vite.  
Longer notes: [`docs/HealNexus_SRS_Architecture.md`](docs/HealNexus_SRS_Architecture.md) · [`docs/FINALIZED_ARCHITECTURE.md`](docs/FINALIZED_ARCHITECTURE.md)

```text
HealNexus/
├── webapp/                 # MVP UI, store, engines, /pricing
├── ai-service/             # Optional FastAPI
├── supabase/migrations/    # Optional SQL
├── docs/                   # SRS
└── README.md
```

---

## APIs

Interactive docs: [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs) when the AI service is up.

<details>
<summary><strong>Endpoint list</strong> (click to expand)</summary>

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Health + whether Exa/OpenRouter are configured |
| POST | `/ai/care-companion` | Discharge → schedule JSON (draft) |
| POST | `/ai/patient-summary` | Short assistive summary |
| POST | `/ai/visit-brief` | Doctor visit brief |
| POST | `/ai/medicine/extract` | Label/text extract — not a prescription |
| POST | `/ai/health-assistant` | Education (Exa + LLM) |
| POST | `/ai/emergency-checkup` | Education, not diagnosis |
| POST | `/ai/education` | Localized pack |
| POST | `/ai/government-guidance` | PM-JAY-style **demo** + search |
| POST | `/predict/*` | Optional server twins of recovery, risk, trends, alerts, explain |

</details>

Demo **CRUD is the local store**, not a public REST API. `VITE_AI_API_BASE_URL` is only the AI origin.

---

## Database

**Default (zero install):** `localStorage` key `healnexus-dynamic-store-v2` · seed in `webapp/src/data/store/seed.ts`.  
`demo123` is a **public demo password**, not a production secret. Hard-refresh after a pull if seed version bumped.

**Optional:** `supabase/migrations/` → project URL + **anon** key on the webapp. Service role never in GitHub / never in Vite.

---

## Quick start

**Need:** Node.js **20+**, npm. Optional: Python **3.11+**.

```bash
cd webapp
cp .env.example .env          # Windows: copy .env.example .env
npm install
npm run dev
```

Open **http://127.0.0.1:5173**

```bash
npm run build && npm run preview
```

### Optional AI service

```bash
cd ai-service
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # EXA_API_KEY + OPENROUTER_API_KEY here only
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

`webapp/.env`: `VITE_AI_API_BASE_URL=http://127.0.0.1:8001` → restart Vite.

| File | Git |
| --- | --- |
| `*.env.example` | Yes |
| `webapp/.env`, `ai-service/.env` | **No** |

---

## Five-minute demo

1. `cd webapp && npm install && npm run dev`
2. **Dr. Ananya · Doctor** → Patients: live Recovery + risk, village rows
3. Sign out → **Asha · Patient** → Today / Recovery: **same scores**
4. Get help → nearest PHC / pharmacy
5. Optional: AI service → Talk to HealNexus

| Role | User ID | Password |
| --- | --- | --- |
| Patient | `asha.patel` · `ravi.shah` · `meera.desai` · `bharat.solanki` · `leela.chauhan` | `demo123` |
| Doctor / Caregiver / HW / Admin | Live buttons, or `priya.patel` · `kavita.solanki` · `admin` | `demo123` |

---

## Deploy

**Judges can use Vercel alone** (`localStorage`, no keys).

1. GitHub → Vercel → **Root Directory: `webapp`**
2. Vite · `npm run build` · output `dist` · Node 20
3. `webapp/vercel.json` already rewrites the SPA
4. `VITE_*` vars = **Config**, not Secret. Do **not** put OpenRouter on Vercel

**LLM / Exa:** Render Web Service, root `ai-service`, start:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Render env: `OPENROUTER_API_KEY`, `EXA_API_KEY`, `CORS_ORIGINS=https://your-app.vercel.app`  
Then Vercel **build** env: `VITE_AI_API_BASE_URL=https://your-service.onrender.com` → **Redeploy**.

---

## Secrets & credentials

- `.gitignore` covers `.env`, `*.pem`, `*.key`
- No `VITE_EXA_API_KEY` in the client
- Rotate any key that was pasted into chat

---

## AI tools disclosure

**Put this on the PPT.** This product used **significant AI coding assistance** (including Cursor) for scaffolding, refactoring, and docs. **The team can explain every submitted flow.** That help is **not** unaided original work.

In-product AI (companion, visit brief, assistant) is a **feature**, with the same clinical safety copy.

---

## Originality

HealNexus is an original continuity-of-care product in this repository. Third-party libraries, OSM, Exa, and OpenRouter are named above. Clinical demo numbers come from **our rules + synthetic seed**, not a copied trained model.

---

<div align="center">

**Healthcare continuity for everyone** — free to start, affordable to upgrade, scalable for hospitals.

*AI assists. Clinicians decide.*

</div>
