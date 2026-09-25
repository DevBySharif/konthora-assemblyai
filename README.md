# 🎙️ Konthora — Real-Time Voice-to-Document Enterprise Engine

> **Next-Generation Conversational Voice Intelligence Engine for Autonomous B2B Document Synthesis, Stateful Revisions, and Cryptographic Trust Verification.**

[![AssemblyAI v3](https://img.shields.io/badge/STT-AssemblyAI_v3_Streaming-blueviolet?style=for-the-badge&logo=assemblyai)](https://www.assemblyai.com/)
[![Groq LPU](https://img.shields.io/badge/LLM-Groq_Llama--3.3--70B-orange?style=for-the-badge&logo=groq)](https://groq.com/)
[![Next.js 14](https://img.shields.io/badge/Frontend-Next.js_14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#license)

---

## 🌟 Executive Overview

**Konthora** is an enterprise-grade, full-duplex Voice Operations Hub designed to convert real-time spoken utterances into fully formatted, verified, and printable corporate documentation in sub-seconds. Powered by **AssemblyAI v3 Streaming Speech-to-Text**, **Groq Llama-3.3-70B**, and **Kokoro-82M Neural Synthesis**, Konthora bridges the gap between natural human conversation and structured corporate workflows.

Whether drafting **Tax Invoices, Commercial Quotations, Purchase Orders, HR Appointment Letters, Executive Meeting Minutes, Legal NDAs, or Financial Audits**, Konthora eliminates administrative overhead through intuitive voice interaction, stateful document revisions, and dynamic cryptographic verification seals.

---

## 🔥 Key Innovations & Core Architecture

### ⚡ 1. Full-Duplex Speech Interruption (Barge-In)
- **Zero-Latency Halting:** Built-in client-side Voice Activity Detection (RMS Energy thresholding) monitors microphone activity during active speech synthesis.
- **Instant Abort:** Interrupts audio playback within `<100ms` and emits a WebSocket `user_interrupt` control frame to halt backend LLM and TTS queues instantly.

### 🧠 2. Stateful Conversational Memory & Voice Revisions
- **Delta Document Updates:** Users can modify active documents iteratively using natural follow-up voice commands (e.g., *"Change discount from 5% to 10%"*, *"Add $200 maintenance fee"*, *"Convert currency to EUR"*).
- **Context Preservation:** Preserves all existing line items while applying delta updates directly to the active document object.

### 🛡️ 3. Cryptographic Anti-Forgery & QR Verification
- **SHA-256 Audit Seal:** Generates a unique `SHA256-KNT-XXXX` cryptographic hash digest computed from the document reference, financial payload, and timestamp.
- **Inline SVG QR Matrix:** Renders an instant, scan-verifiable 21×21 inline QR code on every document card and PDF export for real-time audit verification.

### 🎯 4. AssemblyAI Advanced Audio Intelligence
- **Custom Vocabulary (Word Boost):** Enhanced phonetic accuracy for domain terms (`Konthora`, `EBITDA`, `NET-30`, `M3 Pro`, `BDT`, `BIN-003928172`).
- **PII Redaction Guardrails:** Automatic client/server sanitization masking sensitive tax IDs, credit digits, and account numbers.
- **Batch Voice File Import:** Drag-and-drop audio note processing (.mp3/.wav) via AssemblyAI Batch API for asynchronous transcript and document extraction.

### 📊 5. Enterprise Cockpit & Clean PDF Export
- **Dual-Panel Cyberpunk Dashboard:** Isolated transcript scroll stream on the left audio deck alongside an interactive, dynamic document card deck on the right.
- **Print Stylesheet Isolation (`@media print`):** Strict white-list CSS layer that suppresses browser headers/footers, third-party extension overlays, and chat bubbles, yielding clean, fortune-500 corporate PDFs.

---

## 🛠️ Complete Tech Stack

| Layer | Technology / Library | Role & Integration |
| :--- | :--- | :--- |
| **Speech-to-Text** | **AssemblyAI v3 WebSocket & Batch API** | Real-time 16kHz PCM streaming STT, Word Boost, PII Masking |
| **LLM Inference** | **Groq LPU (Llama-3.3-70B Versatile)** | Sub-second structured tool-calling & JSON schema extraction |
| **Voice Synthesis** | **Kokoro-82M Local Neural TTS** | Ultra-realistic, low-latency audio chunk synthesis |
| **Frontend UI** | **Next.js 14, React 18, Tailwind CSS** | Futuristic cockpit UI, custom SVG visualizers, stateful cards |
| **Backend API** | **FastAPI, Asyncio, WebSockets** | High-concurrency event loop, stream management, barge-in logic |
| **Database Engine** | **In-Memory Mock Enterprise DB** | Fuzzy-matching engine for Clients, HR, Inventory, Financials |

---

## 🚀 Supported Enterprise Document Types

1. **Tax Invoices (`INV-8821`):** Itemized breakdown, tax liability, NET payment terms, and client metadata.
2. **Commercial Quotations (`PHOENIX-2026`):** Enterprise edge gateway pricing, volume discounts, SLA guarantees.
3. **Purchase Orders (`PO-88301`):** Hardware procurement, SKU counts, manager authorizations.
4. **HR Appointment Letters (`EMP-1041`):** Position details, salary structures, reporting managers.
5. **Executive Meeting Minutes (`MIN-2026`):** Agenda items, attendee lists, decision bullets, action items with deadlines.
6. **Legal NDA Contracts (`NDA-2026`):** Confidentiality duration, IP clauses, governing law, digital signature blocks.
7. **Expense Reimbursement Vouchers (`EXP-9902`):** Account classification, line-item receipts, approval watermarks.
8. **Financial Briefs & Dynamic Charts:** Q1/Q2 revenue comparisons, EBITDA margins, bar chart visualizations.
9. **Document Diff & Comparisons:** Side-by-side version comparison highlighting added/modified rates in green/red.

---

## 💻 Local Development & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- AssemblyAI API Key ([Get Key](https://www.assemblyai.com/))
- Groq API Key ([Get Key](https://groq.com/))

### 1. Clone & Configure Remote
```bash
git clone https://github.com/DevBySharif/konthora-assemblyai.git
cd konthora-assemblyai
```

### 2. Backend Setup (FastAPI + Kokoro TTS)
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup (Next.js)
```bash
# From project root
npm install
npm run dev
```

### 4. Environment Variables
Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_BACKEND_WS_URL=ws://localhost:8000/ws/voice
```

Create a `.env` file in `backend/`:
```env
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
GROQ_API_KEY=your_groq_api_key
KOKORO_MODEL_PATH=./kokoro-82m
```

> ⚠️ **Never commit API keys or `.env` files to version control.**

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     BROWSER (Next.js 14)                     │
│  ┌──────────────┐    ┌──────────────────────────────────┐   │
│  │  Mic Capture  │    │  WebSocket Client (ws://...)      │   │
│  │  RMS VAD      │───▶│  ┌─ user_interrupt control ─┐    │   │
│  │  Barge-In     │    │  │  PCM 16kHz audio frames  │    │   │
│  └──────────────┘    │  └──────────────────────────┘    │   │
│                       │  ┌─ action_card document ────┐    │   │
│                       │  │  SHA-256 hash + QR matrix │    │   │
│                       │  └──────────────────────────┘    │   │
│                       └──────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │ WebSocket (bidirectional)
┌─────────────────────────▼───────────────────────────────────┐
│                  BACKEND (FastAPI + AsyncIO)                  │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐   │
│  │ AssemblyAI v3  │  │ Groq Llama 3.3 │  │ Kokoro TTS   │   │
│  │ Streaming STT  │─▶│ 70B Inference  │─▶│ 82M Neural   │   │
│  │ + Word Boost   │  │ + Tool Calling │  │ PCM Chunks   │   │
│  │ + PII Redact   │  │ + JSON Schema  │  │ + Streaming  │   │
│  └────────────────┘  └────────────────┘  └──────────────┘   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Mock Enterprise Database                   │  │
│  │  Clients · Financials · HR · Inventory · Quotations    │  │
│  │  Meeting Minutes · Legal Contracts · Expense Vouchers  │  │
│  │  Exchange Rates · Approval Guard · Document Diff       │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Quick Voice Command Reference

| Voice Command | Document Type | Example Output |
| :--- | :--- | :--- |
| *"Create an invoice for Acme Corp"* | Tax Invoice | `INV-2026` with line items, tax, NET-30 terms |
| *"Draft a quotation for edge gateway"* | Commercial Quote | `PHOENIX-2026` with volume discounts |
| *"Generate a purchase order"* | Purchase Order | `PO-2026` with hardware SKUs |
| *"Write an appointment letter for John"* | HR Letter | `EMP-2026` with salary & position details |
| *"Summarize our last meeting"* | Meeting Minutes | `MIN-2026` with agenda, attendees, action items |
| *"Draft an NDA with Acme"* | Legal Contract | `NDA-2026` with clauses & signatures |
| *"Create an expense voucher"* | Expense Report | `EXP-2026` with line-item receipts |
| *"Show revenue chart"* | Analytics Chart | Q1/Q2 comparison bar chart |
| *"Convert to BDT"* | Currency Conversion | Live rate conversion with display |
| *"Authorize with KNT-2026"* | Approval Guard | CFO approval watermark applied |
| *"Compare with original version"* | Document Diff | Green/red delta view |
| *"Post to Slack"* | Slack Dispatch | Webhook delivery confirmation |

---

## 📦 Project Structure

```
konthora-assemblyai/
├── backend/
│   ├── app/
│   │   ├── main.py                      # FastAPI app entry
│   │   ├── api/v1/voice_agent.py        # WebSocket handler, AssemblyAI stream
│   │   ├── services/voice_agent_service.py  # LLM, TTS, document logic
│   │   └── db/mock_database.py          # Mock enterprise database
│   ├── requirements.txt
│   └── .env                             # API keys (git-ignored)
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   └── voice-agent/page.tsx         # Main voice agent dashboard
│   ├── components/
│   │   └── layout/Footer.tsx            # Hidden on /voice-agent
│   └── lib/
├── public/
├── .env.local                           # Frontend env (git-ignored)
├── package.json
├── tailwind.config.ts
└── README.md
```

---

## 🏆 Enterprise Features

| Feature | Status |
| :--- | :--- |
| Full-Duplex Barge-In (RMS VAD) | ✅ Active |
| AssemblyAI v3 Streaming STT | ✅ Active |
| Word Boost (26 Domain Terms) | ✅ Active |
| PII Redaction (Tax IDs, Credit, SSN) | ✅ Active |
| Groq Llama-3.3-70B LLM | ✅ Active |
| Kokoro-82M Neural TTS | ✅ Active |
| Stateful Document Revisions | ✅ Active |
| SHA-256 Cryptographic Hash | ✅ Active |
| Inline SVG QR Verification | ✅ Active |
| Multi-Currency Conversion (USD/BDT/EUR) | ✅ Active |
| CFO Approval Guard ($10K Threshold) | ✅ Active |
| Document Diff Engine | ✅ Active |
| Slack/Teams Webhook Dispatch | ✅ Active |
| Audio File Upload (Batch API) | ✅ Active |
| Clean PDF Export (Print Stylesheet) | ✅ Active |
| English-Only STT Lock | ✅ Active |

---

## 🤝 Contributing

This project was built for the **AssemblyAI Hackathon**. Contributions, feedback, and forks are welcome.

```bash
# Create a feature branch
git checkout -b feature/your-feature

# Commit changes
git commit -m "feat: add your feature"

# Push and open a PR
git push origin feature/your-feature
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with 🎙️ by <strong>Konthora Team</strong> for the AssemblyAI Hackathon 2026
</p>
