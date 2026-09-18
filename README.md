# ArogyaAI - Intelligent eVillage System

"From Awareness to Action."

## Local Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- PostgreSQL

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

## Features
- AI Voice-First Symptom Guidance
- AI Risk Indicators
- Doctor Consultation
- ...and more!
