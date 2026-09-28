# Konthora — Autonomous Voice-Driven Enterprise Operations Engine

> **Enterprise-Grade Full-Duplex Voice Intelligence Engine for Real-Time B2B Workflow Automation, Audio Analysis, and Persistent Document Management.**

[![AssemblyAI Voice Agent](https://img.shields.io/badge/STT%2BLLM%2BTTS-AssemblyAI_Voice_Agent-blueviolet?style=for-the-badge&logo=assemblyai)](https://www.assemblyai.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js_16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#license)

---

## Executive Overview

**Konthora** is an enterprise-grade, full-duplex Voice Operations Hub that converts real-time spoken utterances into fully formatted, verified, and printable corporate documentation in sub-seconds. Powered by **AssemblyAI Voice Agent API** (managed STT + LLM + TTS in a single WebSocket), Konthora eliminates administrative overhead through intuitive voice interaction, audio file analysis, and persistent document storage.

Whether drafting **Tax Invoices, Commercial Quotations, Purchase Orders, HR Appointment Letters, Executive Meeting Minutes, Legal NDAs, or Financial Audits**, Konthora processes voice commands with sub-second response times — and now supports **audio upload** for analyzing meeting recordings and interviews.

---

## Key Features

- **Real-Time Voice Processing**: Sub-850ms voice-to-document pipeline via AssemblyAI Voice Agent
- **24 Enterprise Document Types**: Invoices, quotations, contracts, HR letters, financial reports, and more
- **Audio Upload & Analysis**: Upload MP3/WAV/WebM/M4A recordings for transcription, summarization, and document creation
- **Persistent Database**: SQLite with SQLAlchemy ORM storing all documents, clients, inventory, tasks, and financials
- **Email Notifications**: Send generated documents via email with formatted HTML templates
- **Multilingual Support**: English, Bangla, and Banglish code-switching
- **24kHz Full-Duplex Audio**: AudioWorklet capture with Web Audio API gapless playback
- **Hardware AEC**: Browser-native echo cancellation prevents agent voice feedback
- **Cryptographic Seals**: SHA-256 verification on every generated document

---

## Architecture

```
Browser mic (24kHz)
    |
    | AudioWorklet → base64 PCM16 JSON
    v
wss://agents.assemblyai.com/v1/ws  (managed: STT + LLM + TTS)
    |
    | tool.call events
    v
Backend REST API (FastAPI + SQLite)
    |  POST /voice-agent/tool
    |  execute business logic
    |  store in database
    v
tool.result → back to AssemblyAI → reply.audio → Browser speakers
    |
    | OR
    v
Audio Upload (POST /voice-agent/upload)
    |  httpx → AssemblyAI HTTP API
    |  transcribe + summarize
    v
Follow-up text commands → Create documents from transcription
```

### AssemblyAI Voice Agent (v2)

| Feature | Implementation |
|---|---|
| **STT** | AssemblyAI managed (real-time streaming) |
| **LLM** | AssemblyAI managed (tool calling, reasoning) |
| **TTS** | AssemblyAI Anna voice (sub-second synthesis) |
| **WebSocket** | Single connection for all three stages |
| **Turn Detection** | Built-in endpointing and interruption handling |
| **Audio Upload** | Async HTTP API for offline recordings |

---

## Tech Stack

| Layer | Technology | Role |
|---|---|---|
| **Voice Agent** | **AssemblyAI Voice Agent API** | Managed STT + LLM + TTS, turn detection, tool calling |
| **Frontend** | **Next.js 16, React 19, Tailwind CSS** | Cockpit UI, AudioWorklet capture, Web Audio API playback |
| **Backend** | **FastAPI, AsyncIO, httpx** | Token minting, tool execution, document business logic |
| **Database** | **SQLite + SQLAlchemy ORM** | Persistent storage for documents, clients, inventory, tasks |
| **Verification** | **SHA-256 + QR** | Cryptographic audit seals on every document |
| **Email** | **Mock SMTP / Real SMTP ready** | Document delivery via email notifications |

---

## Supported Enterprise Document Types (24 Total)

### Financial Documents (6)
1. **Tax Invoices (`INV-8821`):** Itemized breakdown, tax liability, NET payment terms
2. **Commercial Quotations (`QTN-2026`):** Enterprise pricing, volume discounts
3. **Receipts (`RCP-2026`):** Payment confirmation, transaction details
4. **Sales Orders (`SO-2026`):** Order confirmation, delivery terms
5. **Credit Notes (`CN-2026`):** Refund documentation, adjustment details
6. **Purchase Orders (`PO-88301`):** Hardware procurement, SKU counts, authorizations

### HR Documents (4)
7. **HR Appointment Letters (`EMP-1041`):** Position details, salary structures
8. **Employment Contracts (`CTR-2026`):** Full employment terms, benefits, clauses
9. **Salary Revision Memos (`SAL-2026`):** Compensation adjustments, effective dates
10. **Experience Certificates (`EXP-CERT-2026`):** Employment verification, tenure

### Reporting Documents (4)
11. **Financial Summaries (`FIN-2026`):** Q1/Q2 revenue, EBITDA margins, variance analysis
12. **Budget Reports (`BUD-2026`):** Department budgets, variance from plan
13. **Expense Reports (`EXP-RPT-2026`):** Team expenses, category breakdowns
14. **Tax Summaries (`TAX-2026`):** Tax liability, deductions, compliance

### Client Operations (4)
15. **Client Onboarding Packs (`ONB-2026`):** Welcome docs, account setup
16. **Business Proposals (`PROP-2026`):** Scope, deliverables, pricing
17. **Executive Meeting Minutes (`MIN-2026`):** Agenda items, decisions, action items
18. **Legal NDA Contracts (`NDA-2026`):** Confidentiality duration, IP clauses

### Inventory Management (4)
19. **Inventory Reports (`INV-RPT-2026`):** Stock levels, valuation
20. **Low Stock Alerts (`LSA-2026`):** Threshold notifications, reorder triggers
21. **Stock Transfer Orders (`STO-2026`):** Inter-warehouse movements
22. **Purchase Requisitions (`PR-2026`):** Procurement requests, approvals

### Project Management (4)
23. **Project Plans (`PLN-2026`):** Timeline, milestones, resources
24. **Status Reports (`SR-2026`):** Progress, blockers, next steps
25. **Milestone Reviews (`MR-2026`):** Phase completion, deliverables
26. **Task Assignments (`TA-2026`):** Work allocation, deadlines

---

## Audio Upload Feature

Upload meeting recordings, interviews, or calls for AI-powered analysis:

1. **Upload Audio**: Drag & drop or click to upload MP3, WAV, WebM, or M4A files
2. **Transcription**: AssemblyAI transcribes the audio with high accuracy
3. **AI Summary**: Generate a concise summary of the recording
4. **Follow-Up Actions**: Use suggestion buttons or type commands to create documents from the transcription

### Supported Upload Formats
- **MP3** - MPEG Audio Layer 3
- **WAV** - Waveform Audio File Format
- **WebM** - Web Media
- **M4A** - MPEG-4 Audio

---

## Database Schema

Konthora uses SQLite with SQLAlchemy ORM for persistent storage:

| Table | Purpose |
|---|---|
| `clients` | Client information, contact details, status |
| `documents` | All 24 document types with full metadata |
| `inventory` | Stock items, quantities, prices, reorder levels |
| `tasks` | Task assignments, priorities, due dates, status |
| `financials` | Financial records, transactions, budgets |
| `calendar_events` | Scheduled events, meetings, reminders |
| `staff` | Employee information, roles, departments |

**Upgrade Path**: Set `DATABASE_URL=postgresql://...` to switch from SQLite to PostgreSQL for production deployments.

---

## Local Development

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- AssemblyAI API Key with Voice Agent access ([Get Key](https://www.assemblyai.com/dashboard/api-keys))

### 1. Clone
```bash
git clone https://github.com/DevBySharif/konthora-assemblyai.git
cd konthora-assemblyai
```

### 2. Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend
```bash
npm install
npm run dev
```

### 4. Environment Variables

Create `.env` in `backend/`:
```env
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
CORS_ORIGINS=http://localhost:3000
```

Create `.env.local` in project root:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

> Never commit API keys or `.env` files to version control.

---

## Backend API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | Health check with DB status |
| `GET` | `/api/v1/voice-agent/token` | Mint temp token for browser → AssemblyAI WS |
| `GET` | `/api/v1/voice-agent/config` | System prompt, tools, voice for session.update |
| `POST` | `/api/v1/voice-agent/tool` | Execute tool calls from AssemblyAI LLM |
| `POST` | `/api/v1/voice-agent/text` | Text input fallback |
| `POST` | `/api/v1/voice-agent/upload` | Upload audio for transcription & analysis |

---

## Voice Commands

| Voice Command | Document Type |
|---|---|
| "Generate quotation for Acme" | Commercial Quotation |
| "Create invoice for Acme Corp" | Tax Invoice |
| "Draft purchase order for Apex" | Purchase Order |
| "Write appointment letter for Rafiqul" | HR Letter |
| "Summarize our last meeting" | Meeting Minutes |
| "Draft an NDA with InnoTech" | Legal Contract |
| "Create expense voucher" | Expense Report |
| "Show Q1 revenue" | Financial Summary |
| "Check inventory for Widget X" | Inventory Report |
| "Create task for team meeting" | Task Assignment |
| "Schedule board meeting" | Calendar Event |
| "Send invoice to client" | Email Notification |
| "Convert to BDT" | Currency Conversion |
| "Compare with original" | Document Diff |

---

## Project Structure

```
konthora-assemblyai/
├── backend/
│   ├── app/
│   │   ├── main.py                          # FastAPI entry + lifespan
│   │   ├── api/v1/
│   │   │   ├── voice_agent_v2.py            # Token, tools, config, upload
│   │   │   └── health.py                    # Health check endpoint
│   │   ├── services/
│   │   │   ├── voice_agent_service.py       # Business logic, system prompt
│   │   │   └── email_service.py             # Mock email + real SMTP
│   │   ├── models/
│   │   │   ├── client.py                    # Client model
│   │   │   ├── document.py                  # Document model (24 types)
│   │   │   ├── inventory.py                 # Inventory model
│   │   │   ├── task.py                      # Task model
│   │   │   ├── financial.py                 # Financial model
│   │   │   ├── calendar_event.py            # Calendar event model
│   │   │   └── staff.py                     # Staff model
│   │   ├── core/
│   │   │   ├── config.py                    # Settings + env vars
│   │   │   └── database.py                  # SQLAlchemy engine + seeding
│   │   └── schemas/
│   │       └── tts.py                       # Pydantic models
│   ├── scripts/
│   │   └── seed.py                          # Standalone seed script
│   ├── Dockerfile                           # Python 3.11-slim
│   └── requirements.txt                     # fastapi, uvicorn, sqlalchemy, httpx
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── page.tsx                          # Landing page
│   │   └── voice-agent/
│   │       └── page.tsx                      # Voice agent dashboard
│   └── components/
│       └── layout/                           # Header, Footer, RouteChrome
├── .env.local                                # Frontend env (git-ignored)
├── docker-compose.yml                        # Local dev with Railway
├── package.json
└── README.md
```

---

## Deployment

### Vercel (Frontend)
```bash
git push origin main
# Auto-deploys to https://konthora-voice-agent.vercel.app
```

### Railway (Backend)
```bash
railway login
railway up
# Deploys to https://konthora-assemblyai-production.up.railway.app
```

### Docker
```bash
docker build -t konthora-backend ./backend
docker run -p 8000:8000 -e ASSEMBLYAI_API_KEY=your_key konthora-backend
```

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built by <strong>Konthora Team</strong> for the AssemblyAI Hackathon 2026
</p>
