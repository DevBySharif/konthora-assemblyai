# Konthora — Autonomous Voice-Driven Enterprise Operations Engine

> **Enterprise-Grade Full-Duplex Voice Intelligence Engine for Real-Time B2B Workflow Automation, Stateful Document Revisions, and Cryptographic Audit Verification.**

[![AssemblyAI Voice Agent](https://img.shields.io/badge/STT%2BLLM%2BTTS-AssemblyAI_Voice_Agent-blueviolet?style=for-the-badge&logo=assemblyai)](https://www.assemblyai.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js_16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#license)

---

## Executive Overview

**Konthora** is an enterprise-grade, full-duplex Voice Operations Hub that converts real-time spoken utterances into fully formatted, verified, and printable corporate documentation in sub-seconds. Powered by **AssemblyAI Voice Agent API** (managed STT + LLM + TTS in a single WebSocket), Konthora eliminates administrative overhead through intuitive voice interaction, stateful document revisions, and dynamic cryptographic verification seals.

Whether drafting **Tax Invoices, Commercial Quotations, Purchase Orders, HR Appointment Letters, Executive Meeting Minutes, Legal NDAs, or Financial Audits**, Konthora processes voice commands with sub-second response times.

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
Backend REST API (FastAPI)
    |  POST /voice-agent/tool
    |  execute business logic
    v
tool.result → back to AssemblyAI → reply.audio → Browser speakers
```

### What Changed (v2 — AssemblyAI Voice Agent)

| Before (v1) | After (v2) |
|---|---|
| AssemblyAI Streaming STT | AssemblyAI Voice Agent (all-in-one) |
| Groq Llama-3.3-70B (unreliable, 3s timeout) | AssemblyAI managed LLM (built-in) |
| Kokoro-82M TTS on CPU (minutes of delay) | AssemblyAI managed TTS (Anna voice, sub-second) |
| 3 network hops (STT → LLM → TTS) | 1 managed WebSocket |
| Backend WebSocket proxy | Browser connects directly to AssemblyAI |
| ScriptProcessorNode (deprecated) | AudioWorklet (modern, 24kHz) |
| HTML5 Audio blob queue | Web Audio API gapless PCM16 playback |

### Why Browser-Direct?

- **Hardware AEC**: Browser `getUserMedia` handles echo cancellation, noise suppression, and AGC — the agent's TTS output doesn't feed back into the mic
- **No backend bottleneck**: Audio goes directly to AssemblyAI, not through a proxy
- **Sub-second response**: STT + LLM + TTS all managed in one connection
- **Tool calling**: AssemblyAI's LLM calls backend REST endpoints for document actions

---

## Tech Stack

| Layer | Technology | Role |
|---|---|---|
| **Voice Agent** | **AssemblyAI Voice Agent API** | Managed STT + LLM + TTS, turn detection, tool calling |
| **Frontend** | **Next.js 16, React 19, Tailwind CSS** | Cockpit UI, AudioWorklet capture, Web Audio API playback |
| **Backend** | **FastAPI, AsyncIO** | Token minting, tool execution, document business logic |
| **Verification** | **SHA-256 + QR** | Cryptographic audit seals on every document |

---

## Supported Enterprise Document Types

1. **Tax Invoices (`INV-8821`):** Itemized breakdown, tax liability, NET payment terms.
2. **Commercial Quotations (`PHOENIX-2026`):** Enterprise edge gateway pricing, volume discounts.
3. **Purchase Orders (`PO-88301`):** Hardware procurement, SKU counts, authorizations.
4. **HR Appointment Letters (`EMP-1041`):** Position details, salary structures.
5. **Executive Meeting Minutes (`MIN-2026`):** Agenda items, decisions, action items.
6. **Legal NDA Contracts (`NDA-2026`):** Confidentiality duration, IP clauses.
7. **Expense Reimbursement Vouchers (`EXP-9902`):** Line-item receipts, approval watermarks.
8. **Financial Briefs:** Q1/Q2 revenue, EBITDA margins.
9. **Document Diff & Comparisons:** Side-by-side version comparison.
10. **Currency Conversion:** USD to BDT/EUR with live rates.
11. **Slack Dispatch:** Webhook delivery to channels.

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
| `GET` | `/api/v1/voice-agent/token` | Mint temp token for browser → AssemblyAI WS |
| `GET` | `/api/v1/voice-agent/config` | System prompt, tools, voice for session.update |
| `POST` | `/api/v1/voice-agent/tool` | Execute tool calls from AssemblyAI LLM |
| `POST` | `/api/v1/voice-agent/text` | Text input fallback |

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
| "Show revenue chart" | Analytics Chart |
| "Convert to BDT" | Currency Conversion |
| "Authorize with KNT-2026" | CFO Approval |
| "Compare with original" | Document Diff |
| "Post to Slack channel" | Slack Dispatch |

---

## Project Structure

```
konthora-assemblyai/
├── backend/
│   ├── app/
│   │   ├── main.py                          # FastAPI entry
│   │   ├── api/v1/voice_agent_v2.py         # Token, tools, config endpoints
│   │   ├── api/v1/voice_agent.py            # Legacy WS handler (kept)
│   │   ├── services/voice_agent_service.py  # Business logic, fast fallback
│   │   └── db/mock_database.py             # Mock enterprise database
│   └── requirements.txt
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── voice-agent/page.tsx             # Voice agent dashboard
│   └── components/
│       └── layout/                          # Header, Footer, RouteChrome
├── .env.local                               # Frontend env (git-ignored)
├── package.json
└── README.md
```

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built by <strong>Konthora Team</strong> for the AssemblyAI Hackathon 2026
</p>
