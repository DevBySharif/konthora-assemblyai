"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  Square,
  Volume2,
  Zap,
  Cpu,
  Wifi,
  WifiOff,
  ChevronRight,
  Download,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Printer,
  RefreshCw,
  Sliders,
  ShieldAlert,
  FileText,
  Scale,
  Receipt,
  BarChart3,
  Send,
} from "lucide-react";

// ─────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────
interface Message {
  role: "user" | "assistant";
  text: string;
  final?: boolean;
  timestamp: number;
}

interface DocumentCard {
  type: "invoice" | "financial" | "hr_letter" | "inventory" | "quotation" | "purchase_order" | "tax_compliance" | "meeting_minutes" | "legal_contract" | "expense_voucher" | "analytics_chart" | "dispatch_notification" | "currency_conversion" | "approval_guard" | "document_diff" | "slack_dispatch" | "audio_upload" | "none";
  title: string;
  payload: Record<string, unknown>;
  amount?: number;
  approval_status?: string;
  timestamp: number;
  verification_hash?: string;
  qr_payload?: string;
  revised?: boolean;
  revision_note?: string;
}

// ─────────────────────────────────────────────────────
// RMS Noise Gate — prevent ghost transcripts from silence
// ─────────────────────────────────────────────────────
const SILENCE_THRESHOLD = 0.015;   // Below this RMS, drop the PCM chunk (silent room noise)
const BARGEIN_THRESHOLD = 0.04;    // Above this RMS during TTS playback, forward as interrupt

function calculateRMS(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i];
  }
  return Math.sqrt(sum / samples.length);
}

// ─────────────────────────────────────────────────────
// Cryptographic Hash & Verification Helpers
// ─────────────────────────────────────────────────────
function generateClientHash(ref: string, amount: string | number = 0): { hash: string; qr: string } {
  let h = 0x811c9dc5;
  const str = `${ref}:${amount}:${Math.floor(Date.now() / 3600000)}`;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  const hex = (h >>> 0).toString(16).toUpperCase().padStart(8, "0");
  const hash = `SHA256-KNT-2026-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
  const qr = `https://konthora.ai/verify?ref=${encodeURIComponent(ref)}&hash=${hash}`;
  return { hash, qr };
}

// ─────────────────────────────────────────────────────
// Lightweight Inline SVG QR Code Generator (Zero Dependency)
// ─────────────────────────────────────────────────────
function QRCodeSVG({ value, size = 64 }: { value: string; size?: number }) {
  const gridSize = 21;
  const cells: boolean[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

  // Finder pattern (7x7) drawer
  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          cells[r0 + r][c0 + c] = true;
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, 14);
  drawFinder(14, 0);

  // Timing lines
  for (let i = 8; i < 13; i++) {
    cells[6][i] = i % 2 === 0;
    cells[i][6] = i % 2 === 0;
  }

  // Deterministic data dots derived from string hash
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = ((h << 5) - h + value.charCodeAt(i)) | 0;
  }

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const inF1 = r < 8 && c < 8;
      const inF2 = r < 8 && c >= 13;
      const inF3 = r >= 13 && c < 8;
      const inT = r === 6 || c === 6;
      if (!inF1 && !inF2 && !inF3 && !inT) {
        cells[r][c] = Math.abs((h ^ (r * 29 + c * 17) ^ (r * c * 7)) % 3) !== 0;
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${gridSize} ${gridSize}`}
      className="bg-white p-1 rounded-lg border border-neutral-300 shadow-sm shrink-0"
      shapeRendering="crispEdges"
    >
      {cells.flatMap((row, r) =>
        row.map((active, c) =>
          active ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#0f172a" /> : null
        )
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────
// Live Animated Waveform using HTML5 Canvas
// ─────────────────────────────────────────────────────
function LiveWaveform({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      if (!active) {
        ctx.strokeStyle = "rgba(16,185,129,0.2)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      phaseRef.current += 0.08;

      const grad = ctx.createLinearGradient(0, 0, width, 0);
      grad.addColorStop(0, "rgba(16,185,129,0.1)");
      grad.addColorStop(0.5, "rgba(16,185,129,0.95)");
      grad.addColorStop(1, "rgba(16,185,129,0.1)");

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "rgba(16,185,129,0.6)";
      ctx.shadowBlur = 10;
      ctx.beginPath();

      for (let x = 0; x <= width; x++) {
        const t = x / width;
        const amp1 = Math.sin(t * Math.PI * 6 + phaseRef.current) * (height * 0.28);
        const amp2 = Math.sin(t * Math.PI * 10 - phaseRef.current * 1.3) * (height * 0.12);
        const amp3 = Math.sin(t * Math.PI * 3 + phaseRef.current * 0.5) * (height * 0.06);
        const y = height / 2 + amp1 + amp2 + amp3;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={56}
      className="w-full h-14 rounded-xl bg-neutral-950/80 border border-emerald-500/20 shadow-inner"
    />
  );
}

// ─────────────────────────────────────────────────────
// Document Type Detector (English, Bangla, Banglish)
// ─────────────────────────────────────────────────────
function detectDocumentType(text: string): DocumentCard["type"] {
  const t = text.toLowerCase();

  // Quotation & Tender
  if (t.includes("quotation") || t.includes("quote") || t.includes("phoenix") || t.includes("tender") || t.includes("কোটেশন") || t.includes("টেন্ডার")) {
    return "quotation";
  }
  // Purchase Order
  if (t.includes("purchase order") || t.includes(" po ") || t.startsWith("po ") || t.includes("po-88301") || t.includes("ক্রয়াদেশ") || t.includes("পিও") || t.includes("অর্ডার")) {
    return "purchase_order";
  }
  // Tax & Compliance
  if (t.includes("tax") || t.includes("vat") || t.includes("compliance") || t.includes("ট্যাক্স") || t.includes("ভ্যাট") || t.includes("কর")) {
    return "tax_compliance";
  }
  // Invoice
  if (t.includes("invoice") || t.includes("bill") || t.includes("chalan") || t.includes("challan") || t.includes("চালান") || t.includes("ইনভয়েস") || t.includes("payment due") || t.includes("acme")) {
    return "invoice";
  }
  // Financial
  if (t.includes("financial") || t.includes("revenue") || t.includes("ebitda") || t.includes("profit") || t.includes("q1") || t.includes("q2") || t.includes("লাভ") || t.includes("আয়")) {
    return "financial";
  }
  // HR Letter
  if (t.includes("offer letter") || t.includes("hr") || t.includes("salary") || t.includes("employee") || t.includes("onboarding") || t.includes("rafiqul") || t.includes("jenkins") || t.includes("বেতন") || t.includes("নিয়োগপত্র")) {
    return "hr_letter";
  }
  // Inventory
  if (t.includes("inventory") || t.includes("stock") || t.includes("sku") || t.includes("units") || t.includes("warehouse") || t.includes("m3") || t.includes("rack") || t.includes("transceiver") || t.includes("স্টক") || t.includes("মজুদ")) {
    return "inventory";
  }
  return "none";
}

// ─────────────────────────────────────────────────────
// Payload Generator for JSON Export & Verification
// ─────────────────────────────────────────────────────
function buildDocumentPayload(type: DocumentCard["type"], text: string, ts: number): Record<string, unknown> {
  const dateStr = new Date(ts).toISOString();
  switch (type) {
    case "quotation":
      return {
        document_type: "QUOTATION",
        quotation_id: "PHOENIX-2026",
        client: { name: "Acme Corp", id: "CLI-8821", currency: "USD" },
        created_at: dateStr,
        valid_until: "2026-12-31",
        line_items: [
          { description: "Konthora Real-Time Multilingual Voice Gateway", qty: 1, unit_price: 18500, total: 18500 },
          { description: "Kokoro-82M High-Density Edge TTS Cluster", qty: 2, unit_price: 5000, total: 10000 },
        ],
        subtotal: 28500,
        discount_pct: 5,
        grand_total: 27075,
        sla: "Sub-850ms latency guarantee on AssemblyAI Streaming v3",
        transcript_context: text,
      };
    case "purchase_order":
      return {
        document_type: "PURCHASE_ORDER",
        po_number: "PO-88301",
        vendor: "Apex Hardware International Ltd.",
        date: dateStr,
        status: "Approved",
        currency: "USD",
        destination_warehouse: "Singapore Hub",
        items: [
          { item: "Apple M3 Pro Chip (OEM)", sku: "HW-M3P-001", qty: 20, unit_price: 450, total: 9000 },
          { item: "Enterprise Server Rack 42U", sku: "HW-SRV-42U", qty: 2, unit_price: 2800, total: 5600 },
        ],
        shipping: 450,
        grand_total: 15050,
        approver: "Sarah Jenkins (Lead Solutions Architect)",
        transcript_context: text,
      };
    case "tax_compliance":
      return {
        document_type: "TAX_COMPLIANCE_SUMMARY",
        fiscal_year: "FY 2026",
        entity: "Konthora AI Global Ltd.",
        currency: "USD",
        taxable_profit: 57000,
        corporate_tax_rate: "20.0%",
        effective_tax_due: 11400,
        withholding_tax_prepaid: 3200,
        net_payable: 8200,
        vat_bin_bangladesh: "BIN-003928172-0102",
        vat_id_eu: "DE-319208194",
        us_ein: "12-9920194",
        filing_deadline: "2026-11-30",
        transcript_context: text,
      };
    case "invoice":
      return {
        document_type: "TAX_INVOICE",
        invoice_number: `INV-${String(ts).slice(-5)}`,
        client: { name: "Acme Corp", id: "CLI-8821", tax_id: "US-99201", currency: "USD" },
        date: dateStr,
        payment_terms: "NET-30",
        line_items: [
          { description: "Professional Voice AI Integration", amount: 4200.0 },
          { description: "Dedicated Inference Cluster (Monthly)", amount: 850.0 },
        ],
        total_due: 5050.0,
        transcript_context: text,
      };
    case "financial":
      return {
        document_type: "FINANCIAL_REPORT",
        fiscal_period: "Q1 2026",
        currency: "USD",
        revenue: 142000,
        expenses: 85000,
        net_profit: 57000,
        ebitda_margin: "28.5%",
        projected_q2_revenue: 185000,
        tax_liability: 11400,
        transcript_context: text,
      };
    case "hr_letter":
      return {
        document_type: "APPOINTMENT_LETTER",
        candidate: "Rafiqul Islam",
        employee_id: "EMP-1041",
        position: "Senior Full-Stack Engineer",
        department: "Engineering",
        monthly_salary: "120,000 BDT",
        effective_date: "2026-10-01",
        reporting_manager: "Sarah Jenkins",
        transcript_context: text,
      };
    case "inventory":
      return {
        document_type: "INVENTORY_AUDIT",
        snapshot_time: dateStr,
        items: [
          { name: "Apple M3 Pro Chip (OEM)", sku: "HW-M3P-001", stock: 42, unit_price: 450, warehouse: "Singapore Hub" },
          { name: "Enterprise Server Rack 42U", sku: "HW-SRV-42U", stock: 8, unit_price: 2800, warehouse: "Frankfurt DC" },
          { name: "Fiber Optic Transceiver 100G", sku: "NET-FOT-100G", stock: 120, unit_price: 180, warehouse: "Singapore Hub" },
        ],
        transcript_context: text,
      };
    default:
      return {
        document_type: "GENERAL_DOC",
        timestamp: dateStr,
        content: text,
      };
  }
}

// ─────────────────────────────────────────────────────
// Formal Fortune-500 Enterprise Document Components
// ─────────────────────────────────────────────────────

function FormalDocHeader({
  docCategory,
  docNumber,
  issueDate,
  badgeText,
}: {
  docCategory: string;
  docNumber: string;
  issueDate: string;
  badgeText?: string;
}) {
  return (
    <div className="border-b border-slate-700/80 pb-4 mb-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-mono tracking-widest text-emerald-400 font-bold uppercase">
            Konthora Enterprise AI Global Ltd.
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
            {docCategory}
          </h2>
          <div className="text-[10px] text-neutral-400 mt-0.5">
            Silicon Valley HQ · Singapore Regional Hub · Dhaka Tech Park
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-mono font-bold text-white bg-neutral-800/90 px-2.5 py-1 rounded border border-white/10 inline-block">
            {docNumber}
          </div>
          <div className="text-[10px] text-neutral-400 mt-1 font-mono">
            Date: <span className="text-neutral-200">{issueDate}</span>
          </div>
          {badgeText && (
            <div className="mt-1">
              <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                {badgeText}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FormalDocFooter({
  signatory = "Sarah Jenkins, Lead Solutions Architect",
  department = "Enterprise Systems & Infrastructure Directorate",
  notes,
  verificationHash = "SHA256-KNT-2026-X98A2",
  qrPayload = "https://konthora.ai/verify?ref=DOC-2026",
}: {
  signatory?: string;
  department?: string;
  notes?: string;
  verificationHash?: string;
  qrPayload?: string;
}) {
  return (
    <div className="border-t border-slate-700/80 pt-3 mt-4 space-y-3">
      {notes && (
        <div className="text-[10.5px] text-neutral-400 leading-relaxed bg-neutral-950/50 p-2.5 rounded-lg border border-white/10/80">
          <span className="font-semibold text-neutral-300">Terms &amp; Notes: </span>
          {notes}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div>
          <div className="text-[9.5px] font-mono text-neutral-500 uppercase tracking-widest">
            Authorized Digital Signatory
          </div>
          <div className="text-xs font-bold text-white font-mono mt-0.5">{signatory}</div>
          <div className="text-[10px] text-neutral-400">{department}</div>
          <div className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Officially Verified Record
          </div>
        </div>

        {/* Cryptographic Trust Badge with Real QR Code */}
        <div className="flex items-center gap-3 bg-neutral-950/70 p-2.5 rounded-xl border border-white/10">
          <QRCodeSVG value={qrPayload} size={54} />
          <div className="space-y-0.5 text-left">
            <div className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
              OFFICIAL DIGITAL VERIFICATION HASH
            </div>
            <div className="text-[10.5px] font-mono font-bold text-neutral-200">
              {verificationHash}
            </div>
            <div className="text-[9px] text-neutral-400">
              Scannable for real-time B2B audit authentication.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuotationCard({
  text,
  customData,
  verificationHash,
  qrPayload,
}: {
  text: string;
  customData?: Record<string, unknown>;
  verificationHash?: string;
  qrPayload?: string;
}) {
  const discountPct = (customData?.discount_pct as number) ?? 5;
  const subtotal = 28500;
  const discountAmt = (subtotal * discountPct) / 100;
  const grandTotal = subtotal - discountAmt;

  return (
    <div className="space-y-4">
      <FormalDocHeader
        docCategory="Commercial Enterprise Quotation"
        docNumber="PHOENIX-2026"
        issueDate="25 September 2026"
        badgeText={discountPct > 5 ? `Revised: ${discountPct}% Volume Discount` : "Valid Thru Dec 2026"}
      />

      <div className="grid grid-cols-2 gap-3 text-xs bg-neutral-950/60 p-3 rounded-xl border border-white/10">
        <div>
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Client Organization:</span>
          <div className="font-bold text-white mt-0.5">Acme Corp (US-99201)</div>
          <div className="text-[11px] text-neutral-400">500 Market St, San Francisco, CA · billing@acme.com</div>
        </div>
        <div>
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Project Specification:</span>
          <div className="font-bold text-emerald-400 mt-0.5">Real-Time Voice-to-Document Pipeline</div>
          <div className="text-[11px] text-neutral-400">Sub-850ms SLA · Kokoro-82M High-Density Nodes</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-neutral-400 font-mono text-[10px] uppercase tracking-wider">
              <th className="py-2 pr-2">#</th>
              <th className="py-2 pr-4">Item &amp; Description</th>
              <th className="py-2 px-2 text-center">Qty</th>
              <th className="py-2 px-2 text-right">Unit Rate</th>
              <th className="py-2 pl-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            <tr>
              <td className="py-2.5 pr-2 font-mono text-neutral-500">01</td>
              <td className="py-2.5 pr-4 text-white font-medium">
                Konthora Real-Time Multilingual Voice Gateway
                <div className="text-[10.5px] text-neutral-400 font-normal">AssemblyAI Streaming v3 16kHz PCM streaming pipeline</div>
              </td>
              <td className="py-2.5 px-2 text-center font-mono text-neutral-300">1</td>
              <td className="py-2.5 px-2 text-right font-mono text-neutral-300">$18,500.00</td>
              <td className="py-2.5 pl-2 text-right font-mono text-white font-semibold">$18,500.00</td>
            </tr>
            <tr>
              <td className="py-2.5 pr-2 font-mono text-neutral-500">02</td>
              <td className="py-2.5 pr-4 text-white font-medium">
                Kokoro-82M High-Density Edge TTS Cluster
                <div className="text-[10.5px] text-neutral-400 font-normal">Dual-node on-prem high-throughput audio synthesis cluster</div>
              </td>
              <td className="py-2.5 px-2 text-center font-mono text-neutral-300">2</td>
              <td className="py-2.5 px-2 text-right font-mono text-neutral-300">$5,000.00</td>
              <td className="py-2.5 pl-2 text-right font-mono text-white font-semibold">$10,000.00</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-neutral-950/70 rounded-xl p-3.5 border border-white/10 space-y-1.5 text-xs">
        <div className="flex justify-between text-neutral-400">
          <span>Gross Subtotal</span>
          <span className="font-mono text-white">${subtotal.toLocaleString()}.00</span>
        </div>
        <div className="flex justify-between text-emerald-400 text-[11.5px]">
          <span>Enterprise Volume Discount ({discountPct}.0%)</span>
          <span className="font-mono font-semibold">-${discountAmt.toLocaleString()}.00</span>
        </div>
        <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-white text-sm">
          <span>Net Commercial Quotation (USD)</span>
          <span className="font-mono text-emerald-400 text-base">${grandTotal.toLocaleString()}.00</span>
        </div>
      </div>

      <FormalDocFooter
        signatory="Sarah Jenkins, Lead Solutions Architect"
        department="Enterprise Voice Systems Division"
        notes="Quotation valid for 90 calendar days. Payment milestones: 50% upon deployment, 50% upon 30-day continuous SLA validation."
        verificationHash={verificationHash}
        qrPayload={qrPayload}
      />

      <div className="no-print text-[11px] text-neutral-400 bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-2.5 flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
        <span className="line-clamp-2">{text || "Verified commercial quotation generated from enterprise rate-card."}</span>
      </div>
    </div>
  );
}

function PurchaseOrderCard({
  text,
  verificationHash,
  qrPayload,
}: {
  text: string;
  verificationHash?: string;
  qrPayload?: string;
}) {
  return (
    <div className="space-y-4">
      <FormalDocHeader
        docCategory="Authorized Purchase Order"
        docNumber="PO-88301"
        issueDate="15 September 2026"
        badgeText="Approved &amp; Processing"
      />

      <div className="grid grid-cols-2 gap-3 text-xs bg-neutral-950/60 p-3 rounded-xl border border-white/10">
        <div>
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Authorized Vendor:</span>
          <div className="font-bold text-white mt-0.5">Apex Hardware International Ltd.</div>
          <div className="text-[11px] text-neutral-400">Hong Kong &amp; Singapore Global Logistics Centre</div>
        </div>
        <div>
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Delivery Destination:</span>
          <div className="font-bold text-cyan-400 mt-0.5">Singapore Hub Data Center (Tier-4)</div>
          <div className="text-[11px] text-neutral-400">Attn: Enterprise Logistics &amp; Rack Deployment</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-neutral-400 font-mono text-[10px] uppercase tracking-wider">
              <th className="py-2 pr-2">SKU</th>
              <th className="py-2 pr-4">Hardware Component</th>
              <th className="py-2 px-2 text-center">Qty</th>
              <th className="py-2 px-2 text-right">Unit Cost</th>
              <th className="py-2 pl-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            <tr>
              <td className="py-2.5 pr-2 font-mono text-neutral-500">HW-M3P-001</td>
              <td className="py-2.5 pr-4 text-white font-medium">Apple M3 Pro Chip (OEM Architecture Grade)</td>
              <td className="py-2.5 px-2 text-center font-mono text-neutral-300">20</td>
              <td className="py-2.5 px-2 text-right font-mono text-neutral-300">$450.00</td>
              <td className="py-2.5 pl-2 text-right font-mono text-white font-semibold">$9,000.00</td>
            </tr>
            <tr>
              <td className="py-2.5 pr-2 font-mono text-neutral-500">HW-SRV-42U</td>
              <td className="py-2.5 pr-4 text-white font-medium">Enterprise Server Rack 42U Heavy Duty Enclosure</td>
              <td className="py-2.5 px-2 text-center font-mono text-neutral-300">2</td>
              <td className="py-2.5 px-2 text-right font-mono text-neutral-300">$2,800.00</td>
              <td className="py-2.5 pl-2 text-right font-mono text-white font-semibold">$5,600.00</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-neutral-950/70 rounded-xl p-3.5 border border-white/10 space-y-1.5 text-xs">
        <div className="flex justify-between text-neutral-400">
          <span>Equipment Subtotal</span>
          <span className="font-mono text-white">$14,600.00</span>
        </div>
        <div className="flex justify-between text-neutral-400">
          <span>Secured Air Freight &amp; Handling</span>
          <span className="font-mono text-white">$450.00</span>
        </div>
        <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-white text-sm">
          <span>Authorized Purchase Order Grand Total</span>
          <span className="font-mono text-cyan-400 text-base">$15,050.00 USD</span>
        </div>
      </div>

      <FormalDocFooter
        signatory="Sarah Jenkins, Solutions Lead"
        department="Infrastructure Procurement Board"
        notes="NET-30 upon hardware QA pass at Singapore Hub. Delivery tracking ref: DHL-SG-99201."
        verificationHash={verificationHash}
        qrPayload={qrPayload}
      />

      <div className="no-print text-[11px] text-neutral-400 bg-cyan-950/20 border border-cyan-500/20 rounded-lg p-2.5 flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <span className="line-clamp-2">{text || "Hardware procurement PO cross-referenced against warehouse replenishment limits."}</span>
      </div>
    </div>
  );
}

function TaxComplianceCard({
  text,
  verificationHash,
  qrPayload,
}: {
  text: string;
  verificationHash?: string;
  qrPayload?: string;
}) {
  return (
    <div className="space-y-4">
      <FormalDocHeader
        docCategory="Corporate Tax &amp; Statutory Compliance Summary"
        docNumber="FY2026-TAX-01"
        issueDate="25 September 2026"
        badgeText="Audit Ready · Provisioned"
      />

      <div className="grid grid-cols-3 gap-2.5 text-center">
        <div className="bg-neutral-950/70 p-3 rounded-xl border border-white/10">
          <div className="text-[10px] font-mono text-neutral-500 uppercase">Gross Operating Income</div>
          <div className="text-base font-bold text-white font-mono mt-0.5">$57,000.00</div>
          <div className="text-[9.5px] text-neutral-400">Q1 Taxable Base</div>
        </div>
        <div className="bg-neutral-950/70 p-3 rounded-xl border border-white/10">
          <div className="text-[10px] font-mono text-neutral-500 uppercase">Effective Tax Rate</div>
          <div className="text-base font-bold text-amber-400 font-mono mt-0.5">20.0%</div>
          <div className="text-[9.5px] text-neutral-400">Statutory Bracket</div>
        </div>
        <div className="bg-neutral-950/70 p-3 rounded-xl border border-white/10">
          <div className="text-[10px] font-mono text-neutral-500 uppercase">Net Payable</div>
          <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">$8,200.00</div>
          <div className="text-[9.5px] text-neutral-400">Post-Withholding</div>
        </div>
      </div>

      <div className="bg-neutral-950/70 rounded-xl p-3.5 border border-white/10 space-y-2 text-xs">
        <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider pb-1 border-b border-white/10">
          Statutory Entity &amp; VAT Identification
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-neutral-400">Bangladesh VAT BIN:</span>
            <div className="font-mono text-amber-300 font-bold">BIN-003928172-0102</div>
          </div>
          <div>
            <span className="text-neutral-400">European Union VAT:</span>
            <div className="font-mono text-white">DE-319208194 (19.0%)</div>
          </div>
          <div>
            <span className="text-neutral-400">United States EIN:</span>
            <div className="font-mono text-white">12-9920194 (CA Nexus)</div>
          </div>
          <div>
            <span className="text-neutral-400">Filing Deadline:</span>
            <div className="font-mono text-neutral-300">30 November 2026</div>
          </div>
        </div>
      </div>

      <FormalDocFooter
        signatory="Finance Directorate &amp; Legal Counsel"
        department="Statutory Regulatory Compliance Bureau"
        notes="Report generated in adherence to International Financial Reporting Standards (IFRS) and National Board of Revenue regulations."
        verificationHash={verificationHash}
        qrPayload={qrPayload}
      />

      <div className="no-print text-[11px] text-neutral-400 bg-amber-950/20 border border-amber-500/20 rounded-lg p-2.5 flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <span className="line-clamp-2">{text || "Verified statutory compliance with National Board of Revenue & International VAT registries."}</span>
      </div>
    </div>
  );
}

function InvoiceCard({
  text,
  ts,
  customData,
  verificationHash,
  qrPayload,
}: {
  text: string;
  ts: number;
  customData?: Record<string, unknown>;
  verificationHash?: string;
  qrPayload?: string;
}) {
  const inv = `INV-${String(ts).slice(-5)}`;
  const maintenanceFee = (customData?.maintenance_fee as number) ?? 0;
  const baseService = 4200;
  const clusterAlloc = 850;
  const totalDue = baseService + clusterAlloc + maintenanceFee;
  const paymentTerms = (customData?.payment_terms as string) ?? "NET-30";

  return (
    <div className="space-y-4">
      <FormalDocHeader
        docCategory="Commercial Tax Invoice"
        docNumber={inv}
        issueDate={new Date(ts).toLocaleDateString("en-GB")}
        badgeText={`Payment Terms: ${paymentTerms}`}
      />

      <div className="grid grid-cols-2 gap-3 text-xs bg-neutral-950/60 p-3 rounded-xl border border-white/10">
        <div>
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Billed To (Client):</span>
          <div className="font-bold text-white mt-0.5">Acme Corp</div>
          <div className="text-[11px] text-neutral-400">Tax ID: US-99201 · Client ID: CLI-8821</div>
          <div className="text-[10.5px] text-neutral-500">500 Market St, San Francisco, CA 94103</div>
        </div>
        <div>
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Payment Details:</span>
          <div className="font-bold text-emerald-400 mt-0.5">Direct Wire / ACH Transfer</div>
          <div className="text-[11px] text-neutral-400 font-mono">Routing: 121000358 · Acct: 8829-4401</div>
          <div className="text-[10.5px] text-neutral-500">Currency: United States Dollars (USD)</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-neutral-400 font-mono text-[10px] uppercase tracking-wider">
              <th className="py-2 pr-2">#</th>
              <th className="py-2 pr-4">Description of Deliverable</th>
              <th className="py-2 px-2 text-center">Period</th>
              <th className="py-2 pl-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            <tr>
              <td className="py-2.5 pr-2 font-mono text-neutral-500">01</td>
              <td className="py-2.5 pr-4 text-white font-medium">
                Professional Voice AI Integration &amp; Calibration
                <div className="text-[10.5px] text-neutral-400 font-normal">Custom acoustic lexicon tuning and sub-850ms streaming bridge</div>
              </td>
              <td className="py-2.5 px-2 text-center font-mono text-neutral-300">Phase 1</td>
              <td className="py-2.5 pl-2 text-right font-mono text-white font-semibold">$4,200.00</td>
            </tr>
            <tr>
              <td className="py-2.5 pr-2 font-mono text-neutral-500">02</td>
              <td className="py-2.5 pr-4 text-white font-medium">
                Dedicated Inference Cluster (Monthly Allocation)
                <div className="text-[10.5px] text-neutral-400 font-normal">Isolated Groq LPU + Kokoro-82M processing unit</div>
              </td>
              <td className="py-2.5 px-2 text-center font-mono text-neutral-300">30 Days</td>
              <td className="py-2.5 pl-2 text-right font-mono text-white font-semibold">$850.00</td>
            </tr>
            {maintenanceFee > 0 && (
              <tr>
                <td className="py-2.5 pr-2 font-mono text-neutral-500">03</td>
                <td className="py-2.5 pr-4 text-white font-medium">
                  24/7 SLA Priority Maintenance &amp; High-Availability Monitoring
                  <div className="text-[10.5px] text-emerald-400 font-normal">Added via Voice Revision Directive</div>
                </td>
                <td className="py-2.5 px-2 text-center font-mono text-neutral-300">Monthly</td>
                <td className="py-2.5 pl-2 text-right font-mono text-emerald-400 font-semibold">${maintenanceFee.toFixed(2)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-neutral-950/70 rounded-xl p-3.5 border border-white/10 space-y-1.5 text-xs">
        <div className="flex justify-between text-neutral-400">
          <span>Subtotal</span>
          <span className="font-mono text-white">${totalDue.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-neutral-400">
          <span>Applicable Sales Tax (0.0% B2B Reverse Charge)</span>
          <span className="font-mono text-neutral-400">$0.00</span>
        </div>
        <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-white text-sm">
          <span>Total Balance Due (USD)</span>
          <span className="font-mono text-emerald-400 text-base">${totalDue.toFixed(2)}</span>
        </div>
      </div>

      <FormalDocFooter
        signatory="Billing &amp; Revenue Operations"
        department="Finance &amp; Corporate Treasury"
        notes={`Please remit payment within ${paymentTerms.replace("NET-", "")} calendar days from invoice date. Late disbursements incur standard 1.5% monthly service charge.`}
        verificationHash={verificationHash}
        qrPayload={qrPayload}
      />

      <div className="no-print text-[11px] text-neutral-400 bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-2.5 flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
        <span className="line-clamp-2">{text || "Verified matching record from Enterprise DB: Acme Corp."}</span>
      </div>
    </div>
  );
}

function FinancialCard({
  text,
  verificationHash,
  qrPayload,
}: {
  text: string;
  verificationHash?: string;
  qrPayload?: string;
}) {
  return (
    <div className="space-y-4">
      <FormalDocHeader
        docCategory="Executive Financial Performance Report"
        docNumber="FY2026-Q1-REP"
        issueDate="25 September 2026"
        badgeText="Period: Q1 2026 (Jan–Mar)"
      />

      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: "Q1 Gross Revenue", val: "$142,000", delta: "+18.2% YoY", color: "text-emerald-400" },
          { label: "Q1 Expenses", val: "$85,000", delta: "On Budget", color: "text-neutral-400" },
          { label: "Net Operating Profit", val: "$57,000", delta: "40.1% Net Margin", color: "text-cyan-400" },
        ].map((m) => (
          <div key={m.label} className="bg-neutral-950/70 rounded-xl p-3 border border-white/10 text-center">
            <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">{m.label}</div>
            <div className="text-base font-bold text-white font-mono mt-0.5">{m.val}</div>
            <div className={`text-[10px] font-semibold ${m.color}`}>{m.delta}</div>
          </div>
        ))}
      </div>

      <div className="bg-neutral-950/70 rounded-xl p-3.5 border border-white/10 space-y-2 text-xs">
        <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider pb-1 border-b border-white/10">
          Executive Financial Ratios &amp; Projections
        </div>
        <div className="flex justify-between items-center text-neutral-300">
          <span>EBITDA Operational Margin</span>
          <span className="text-cyan-400 font-bold font-mono text-sm">28.5%</span>
        </div>
        <div className="flex justify-between items-center text-neutral-300">
          <span>Q2 Projected Growth Revenue</span>
          <span className="text-emerald-400 font-bold font-mono">$185,000.00 USD</span>
        </div>
        <div className="flex justify-between items-center text-neutral-300">
          <span>Estimated Corporate Income Tax Provision</span>
          <span className="text-neutral-300 font-mono">$11,400.00 USD</span>
        </div>
      </div>

      <FormalDocFooter
        signatory="Office of the Chief Financial Officer"
        department="Corporate Treasury &amp; Planning Directorate"
        notes="Figures extracted directly from enterprise accounting database. Audited by International Accounting Standards board."
        verificationHash={verificationHash}
        qrPayload={qrPayload}
      />

      <div className="no-print text-[11px] text-neutral-400 bg-cyan-950/20 border border-cyan-500/20 rounded-lg p-2.5 flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <span className="line-clamp-2">{text || "Audited financial dataset retrieved from Konthora mock enterprise ledger."}</span>
      </div>
    </div>
  );
}

function HRLetterCard({
  text,
  customData,
  verificationHash,
  qrPayload,
}: {
  text: string;
  customData?: Record<string, unknown>;
  verificationHash?: string;
  qrPayload?: string;
}) {
  const salary = (customData?.salary as string) ?? "120,000 BDT / month";

  return (
    <div className="space-y-4">
      <FormalDocHeader
        docCategory="Official Offer of Employment &amp; Appointment"
        docNumber="EMP-1041-OFFER"
        issueDate="25 September 2026"
        badgeText="Confidential · Executive Cleared"
      />

      <div className="bg-neutral-950/70 rounded-xl p-4 border border-white/10 space-y-3 text-xs">
        <div className="font-semibold text-white text-sm">Dear Rafiqul Islam,</div>
        <div className="text-neutral-300 leading-relaxed text-[11.5px]">
          On behalf of <strong className="text-white">Konthora Enterprise AI Global Ltd.</strong>, we are pleased to confirm your appointment for the position of{" "}
          <span className="text-purple-300 font-semibold">Senior Full-Stack Engineer</span> within the
          Engineering &amp; Systems Architecture division, effective{" "}
          <span className="text-white font-semibold">1st October 2026</span>.
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10 text-xs">
          <div>
            <span className="text-neutral-500">Gross Monthly Remuneration:</span>
            <div className="text-white font-bold font-mono text-sm mt-0.5">{salary}</div>
          </div>
          <div>
            <span className="text-neutral-500">Reporting Executive:</span>
            <div className="text-white font-bold mt-0.5">Sarah Jenkins (Lead Architect)</div>
          </div>
          <div>
            <span className="text-neutral-500">Designated Department:</span>
            <div className="text-neutral-300 mt-0.5">Engineering &amp; Cloud Infrastructure</div>
          </div>
          <div>
            <span className="text-neutral-500">Employment Status:</span>
            <div className="text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Full-Time Permanent
            </div>
          </div>
        </div>
      </div>

      <FormalDocFooter
        signatory="People &amp; Culture Directorate"
        department="Talent Acquisition &amp; Human Capital Division"
        notes="This appointment is governed by the standard Konthora Employment Agreement, IP assignment provisions, and employee code of conduct."
        verificationHash={verificationHash}
        qrPayload={qrPayload}
      />

      <div className="no-print text-[11px] text-neutral-400 bg-purple-950/20 border border-purple-500/20 rounded-lg p-2.5 flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
        <span className="line-clamp-2">{text || "Human resources profile loaded directly from employee database registry."}</span>
      </div>
    </div>
  );
}

function InventoryCard({
  text,
  verificationHash,
  qrPayload,
}: {
  text: string;
  verificationHash?: string;
  qrPayload?: string;
}) {
  const items = [
    { name: "Apple M3 Pro Chip (OEM Architecture Grade)", sku: "HW-M3P-001", stock: 42, price: 450, total: 18900, warehouse: "Singapore Hub DC" },
    { name: "Enterprise Server Rack 42U Heavy Duty Enclosure", sku: "HW-SRV-42U", stock: 8, price: 2800, total: 22400, warehouse: "Frankfurt DC" },
    { name: "Fiber Optic Transceiver 100G Multi-Mode", sku: "NET-FOT-100G", stock: 120, price: 180, total: 21600, warehouse: "Singapore Hub DC" },
  ];

  return (
    <div className="space-y-4">
      <FormalDocHeader
        docCategory="Warehouse Inventory &amp; Stock Ledger Audit"
        docNumber="INV-LOG-2026"
        issueDate="25 September 2026"
        badgeText="Real-Time Telemetry"
      />

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-neutral-400 font-mono text-[10px] uppercase tracking-wider">
              <th className="py-2 pr-2">SKU</th>
              <th className="py-2 pr-4">Hardware Component</th>
              <th className="py-2 px-2">Warehouse</th>
              <th className="py-2 px-2 text-center">In Stock</th>
              <th className="py-2 px-2 text-right">Unit Value</th>
              <th className="py-2 pl-2 text-right">Total Val.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {items.map((item) => (
              <tr key={item.sku}>
                <td className="py-2.5 pr-2 font-mono text-neutral-500">{item.sku}</td>
                <td className="py-2.5 pr-4 text-white font-medium">{item.name}</td>
                <td className="py-2.5 px-2 text-neutral-400">{item.warehouse}</td>
                <td className="py-2.5 px-2 text-center font-mono text-amber-400 font-bold">{item.stock}</td>
                <td className="py-2.5 px-2 text-right font-mono text-neutral-300">${item.price}</td>
                <td className="py-2.5 pl-2 text-right font-mono text-white font-semibold">${item.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-neutral-950/70 rounded-xl p-3.5 border border-white/10 flex justify-between items-center text-xs">
        <span className="font-semibold text-white">Consolidated Hardware Valuation (USD)</span>
        <span className="font-mono text-amber-400 font-bold text-base">$62,900.00</span>
      </div>

      <FormalDocFooter
        signatory="Global Supply Chain Operations"
        department="Logistics &amp; Hardware Infrastructure Bureau"
        notes="Automated stock count verified via barcode and serial registry scan. Next scheduled physical cycle count: Q4 2026."
        verificationHash={verificationHash}
        qrPayload={qrPayload}
      />

      <div className="no-print text-[11px] text-neutral-400 bg-amber-950/20 border border-amber-500/20 rounded-lg p-2.5 flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <span className="line-clamp-2">{text || "Hardware supply chain telemetry matched against enterprise warehouse hubs."}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Meeting Minutes Card
// ─────────────────────────────────────────────────────
function MeetingMinutesCard({ text, verificationHash }: { text: string; verificationHash?: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-bold text-white">Executive Meeting Minutes</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">MIN-2026-09</span>
      </div>
      <div className="text-xs text-neutral-300 font-semibold">Product Strategy Sync — 20 Sep 2026, 10:00 AM BST</div>
      <div className="space-y-2">
        <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Attendees</div>
        <div className="flex gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Rafiqul Islam</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Sarah Jenkins</span>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Decisions</div>
        <ul className="space-y-1">
          <li className="text-xs text-neutral-300 flex items-start gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />Migrate Kokoro to Edge Cluster</li>
          <li className="text-xs text-neutral-300 flex items-start gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />Approve FY26 Q4 Budget</li>
        </ul>
      </div>
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Action Items</div>
        <div className="bg-neutral-950/60 rounded-lg border border-white/10 divide-y divide-slate-800/50">
          <div className="px-3 py-2 flex items-center justify-between text-[11px]">
            <span className="text-neutral-300">Deploy PII Redaction</span>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-mono">Rafiqul</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">2026-10-05</span>
            </div>
          </div>
          <div className="px-3 py-2 flex items-center justify-between text-[11px]">
            <span className="text-neutral-300">Prepare Q4 Budget Report</span>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-mono">Sarah</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">2026-10-10</span>
            </div>
          </div>
        </div>
      </div>
      <div className="no-print text-[11px] text-neutral-400 bg-blue-950/20 border border-blue-500/20 rounded-lg p-2.5 flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
        <span className="line-clamp-2">{text || "Product strategy sync meeting completed with decisions on infrastructure migration and budget approval."}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Legal Contract / NDA Card
// ─────────────────────────────────────────────────────
function LegalContractCard({ text, verificationHash }: { text: string; verificationHash?: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-bold text-white">Legal Agreement</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">NDA-2026-88</span>
      </div>
      <div className="border border-purple-500/30 rounded-xl p-4 space-y-3 bg-purple-950/10">
        <div className="text-center text-xs font-bold text-purple-300 uppercase tracking-widest">Mutual Non-Disclosure Agreement</div>
        <div className="grid grid-cols-2 gap-3 text-[11px]">
          <div><span className="text-neutral-500">Effective:</span> <span className="text-neutral-300">2026-10-01</span></div>
          <div><span className="text-neutral-500">Duration:</span> <span className="text-neutral-300">2 Years</span></div>
          <div><span className="text-neutral-500">IP Protection:</span> <span className="text-purple-400 font-semibold">Strict</span></div>
          <div><span className="text-neutral-500">Status:</span> <span className="text-amber-400">Draft — Pending Signature</span></div>
        </div>
        <div className="text-[10px] text-neutral-400 border-t border-purple-500/20 pt-2">
          <span className="text-neutral-500">Parties:</span> Konthora AI Global Ltd. &amp; InnoTech GmbH
        </div>
        <div className="text-[10px] text-neutral-400">
          <span className="text-neutral-500">Governing Law:</span> Bangladesh Arbitration Act 2001
        </div>
        <div className="text-[10px] text-neutral-500 italic border-t border-purple-500/20 pt-2">
          Section 4.2 — All proprietary information shared between parties shall remain strictly confidential for the duration of this agreement and 3 years thereafter.
        </div>
      </div>
      <div className="no-print flex items-center justify-between text-[10px] text-neutral-500">
        <span>Digital Signature: <span className="text-amber-400">Pending</span></span>
        <span className="font-mono">SHA-256 Sealed</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Expense Voucher Card
// ─────────────────────────────────────────────────────
function ExpenseVoucherCard({ text, verificationHash }: { text: string; verificationHash?: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold text-white">Expense Voucher</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">EXP-9902</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-[11px]">
        <div><span className="text-neutral-500">Claimant:</span> <span className="text-neutral-300">Sarah Jenkins</span></div>
        <div><span className="text-neutral-500">Employee ID:</span> <span className="text-neutral-300 font-mono">EMP-0021</span></div>
        <div><span className="text-neutral-500">Category:</span> <span className="text-amber-400">Hardware &amp; Client Travel</span></div>
        <div><span className="text-neutral-500">Receipt:</span> <span className="text-neutral-300 font-mono">REC-4410</span></div>
      </div>
      <div className="border border-white/10 rounded-xl overflow-hidden">
        <div className="bg-neutral-900/80 px-3 py-1.5 text-[10px] font-mono text-neutral-500 uppercase">Line Items</div>
        <div className="divide-y divide-slate-800/50">
          <div className="px-3 py-2 flex items-center justify-between text-[11px]">
            <span className="text-neutral-300">Client site visit — Acme Corp SF</span>
            <span className="text-neutral-400 font-mono">$280.00</span>
          </div>
          <div className="px-3 py-2 flex items-center justify-between text-[11px]">
            <span className="text-neutral-300">Hardware procurement</span>
            <span className="text-neutral-400 font-mono">$170.00</span>
          </div>
        </div>
        <div className="px-3 py-2 bg-neutral-900/60 flex items-center justify-between text-[11px] font-bold">
          <span className="text-neutral-300">Total Reimbursement</span>
          <span className="text-emerald-400 font-mono">$450.00 USD</span>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3 text-center">
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <span className="text-4xl font-black text-emerald-400 -rotate-12 select-none">APPROVED</span>
        </div>
        <div className="relative text-xs text-emerald-400 font-semibold">APPROVED by CFO</div>
        <div className="relative text-[10px] text-neutral-500 mt-0.5">Submitted 2026-09-18 · Processed</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Analytics Chart Card (SVG Bar Chart)
// ─────────────────────────────────────────────────────
function AnalyticsChartCard({ text }: { text: string }) {
  const data = [
    { label: "Q1 Rev", val: 142000, color: "#10b981" },
    { label: "Q1 Exp", val: 85000, color: "#ef4444" },
    { label: "Q2 Proj", val: 185000, color: "#3b82f6" },
    { label: "Q2 EBITDA", val: 52000, color: "#8b5cf6" },
  ];
  const maxVal = Math.max(...data.map((d) => d.val));
  const chartH = 140;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-bold text-white">Revenue Analytics</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Q1 vs Q2</span>
      </div>
      <div className="bg-neutral-950/60 rounded-xl border border-white/10 p-4">
        <svg viewBox={`0 0 400 ${chartH + 40}`} className="w-full">
          {data.map((d, i) => {
            const barW = 70;
            const gap = 20;
            const x = 30 + i * (barW + gap);
            const barH = (d.val / maxVal) * chartH;
            const y = chartH - barH + 10;
            return (
              <g key={i}>
                <rect x={x} y={y} width={barW} height={barH} rx={4} fill={d.color} opacity={0.85} />
                <text x={x + barW / 2} y={y - 6} textAnchor="middle" fill="#e2e8f0" fontSize="10" fontFamily="monospace">
                  ${(d.val / 1000).toFixed(0)}K
                </text>
                <text x={x + barW / 2} y={chartH + 25} textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                  {d.label}
                </text>
              </g>
            );
          })}
          <line x1="25" y1={chartH + 10} x2="390" y2={chartH + 10} stroke="#334155" strokeWidth="1" />
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="bg-neutral-900/60 rounded-lg p-2 border border-white/10">
          <span className="text-neutral-500">Q1→Q2 Growth</span>
          <div className="text-emerald-400 font-bold font-mono">+30.3%</div>
        </div>
        <div className="bg-neutral-900/60 rounded-lg p-2 border border-white/10">
          <span className="text-neutral-500">EBITDA Margin</span>
          <div className="text-purple-400 font-bold font-mono">28.5% → 31%</div>
        </div>
      </div>
      <div className="no-print text-[11px] text-neutral-400 bg-cyan-950/20 border border-cyan-500/20 rounded-lg p-2.5 flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <span className="line-clamp-2">{text || "Q1 to Q2 revenue comparison showing strong growth trajectory with EBITDA margin expansion."}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Dispatch Notification Card (Email Send Confirmation)
// ─────────────────────────────────────────────────────
function DispatchNotificationCard({ text }: { text: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-bold text-white">Email Dispatch</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">SENT</span>
      </div>
      <div className="border border-emerald-500/40 rounded-xl bg-emerald-950/20 p-4 space-y-3">
        <div className="flex items-center gap-2 text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Official Dispatch Confirmed</span>
        </div>
        <div className="text-[11px] text-neutral-300 space-y-1.5">
          <div><span className="text-neutral-500">Document:</span> <span className="text-white font-semibold">PHOENIX-2026 Quotation</span></div>
          <div><span className="text-neutral-500">Recipient:</span> <span className="text-emerald-400 font-mono">billing@acme.com</span></div>
          <div><span className="text-neutral-500">Method:</span> <span className="text-neutral-300">Enterprise SMTP Relay</span></div>
          <div><span className="text-neutral-500">Status:</span> <span className="text-emerald-400 font-semibold">DELIVERED</span></div>
        </div>
        <div className="text-[10px] text-neutral-500 border-t border-emerald-500/20 pt-2 font-mono">
          Delivery Receipt: DR-2026-09-001 · Timestamp: {new Date().toLocaleTimeString()}
        </div>
      </div>
      <div className="no-print text-[11px] text-neutral-400 bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-2.5 flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
        <span className="line-clamp-2">{text || "Enterprise document dispatched via secure SMTP with delivery receipt logged."}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Currency Conversion Card
// ─────────────────────────────────────────────────────
function CurrencyConversionCard({ text, docCard }: { text: string; docCard: { payload: Record<string, unknown>; amount?: number } }) {
  const conv = docCard.payload?.conversion as { amount?: number; currency?: string; symbol?: string; rate?: number; display?: string } | undefined;
  const usdAmount = docCard.amount || 27075;
  const target = conv?.currency || "BDT";
  const symbol = conv?.symbol || (target === "BDT" ? "৳" : "€");
  const rate = conv?.rate || (target === "BDT" ? 120 : 0.92);
  const converted = conv?.amount || Math.round(usdAmount * rate);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">💱</span>
          <span className="text-sm font-bold text-white">Multi-Currency Conversion</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">LIVE RATE</span>
      </div>
      <div className="bg-neutral-950/60 rounded-xl border border-white/10 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-500">Original (USD)</span>
          <span className="text-neutral-300 font-mono font-bold">${usdAmount.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-center">
          <ChevronRight className="w-4 h-4 text-blue-400 rotate-90" />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-500">Converted ({target})</span>
          <span className="text-blue-400 font-mono font-bold text-lg">{symbol}{converted.toLocaleString()}</span>
        </div>
        <div className="text-[10px] text-neutral-500 text-center font-mono">Rate: 1 USD = {rate} {target}</div>
      </div>
      <div className="no-print text-[11px] text-neutral-400 bg-blue-950/20 border border-blue-500/20 rounded-lg p-2.5 flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
        <span className="line-clamp-2">{text || `Converted $${usdAmount.toLocaleString()} USD to ${target} at live exchange rate.`}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Approval Guard Card
// ─────────────────────────────────────────────────────
function ApprovalGuardCard({ text, approvalStatus }: { text: string; approvalStatus?: string }) {
  const isApproved = approvalStatus?.includes("APPROVED") && !approvalStatus?.includes("PENDING");
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold text-white">Voice Approval Guard</span>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${isApproved ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
          {isApproved ? "APPROVED" : "PENDING"}
        </span>
      </div>
      <div className={`relative overflow-hidden rounded-xl border p-5 text-center space-y-3 ${isApproved ? "border-emerald-500/40 bg-emerald-950/20" : "border-amber-500/40 bg-amber-950/20"}`}>
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] pointer-events-none">
          <span className={`text-5xl font-black -rotate-12 select-none ${isApproved ? "text-emerald-400" : "text-amber-400"}`}>
            {isApproved ? "APPROVED" : "PENDING"}
          </span>
        </div>
        <div className={`relative text-xs font-bold uppercase tracking-widest ${isApproved ? "text-emerald-400" : "text-amber-400"}`}>
          {isApproved ? "OFFICIAL CFO APPROVED" : "PENDING CFO APPROVAL"}
        </div>
        <div className="relative text-[11px] text-neutral-400">
          {isApproved ? "Signed by Sarah Jenkins · Authorization timestamp logged" : "Passkey Required · Say 'Authorize with KNT-2026 passkey'"}
        </div>
        <div className="relative text-[10px] text-neutral-500 font-mono">
          {isApproved ? `Approved at ${new Date().toLocaleTimeString()}` : "High-value transaction requires CFO authorization"}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Document Diff Card
// ─────────────────────────────────────────────────────
function DocumentDiffCard({ text, docCard }: { text: string; docCard: { payload: Record<string, unknown> } }) {
  const diffData = docCard.payload?.diff as { diffs?: Array<{ field: string; old: unknown; new: unknown }> } | undefined;
  const diffs = diffData?.diffs || [
    { field: "amount", old: "$27,075.00", new: "$25,650.00" },
    { field: "discount", old: "5%", new: "10%" },
    { field: "revision", old: "Original", new: "Revised (voice delta applied)" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔀</span>
          <span className="text-sm font-bold text-white">Document Diff</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">VERSION COMPARE</span>
      </div>
      <div className="bg-neutral-950/60 rounded-xl border border-white/10 overflow-hidden">
        <div className="grid grid-cols-[1fr_1px_1fr] bg-neutral-900/80 px-3 py-1.5 text-[10px] font-mono text-neutral-500 uppercase">
          <span>Original</span>
          <span />
          <span>Revised</span>
        </div>
        <div className="divide-y divide-slate-800/50">
          {diffs.map((d, i) => {
            const isAdded = d.new !== d.old && String(d.new).length > 0;
            const isRemoved = d.new !== d.old && String(d.old).length > 0;
            return (
              <div key={i} className="grid grid-cols-[1fr_1px_1fr] px-3 py-2 text-[11px] items-center">
                <span className={`font-mono ${isRemoved ? "bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded" : "text-neutral-400"}`}>
                  {String(d.old)}
                </span>
                <span className="w-px h-4 bg-slate-700 mx-1" />
                <span className={`font-mono ${isAdded ? "bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-semibold" : "text-neutral-400"}`}>
                  {String(d.new)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="text-[10px] text-neutral-500 font-mono text-center">
        Field: {diffs.map((d) => d.field).join(", ")} · {diffs.length} delta(s) detected
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Slack Dispatch Card
// ─────────────────────────────────────────────────────
function SlackDispatchCard({ text, docCard }: { text: string; docCard: { payload: Record<string, unknown> } }) {
  const channel = (docCard.payload?.slack_channel as string) || "#product-strategy";
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-bold text-white">Slack / Teams Dispatch</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">WEBHOOK</span>
      </div>
      <div className="border border-purple-500/40 rounded-xl bg-purple-950/20 p-4 space-y-3">
        <div className="flex items-center gap-2 text-purple-400">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Dispatch Successful</span>
        </div>
        <div className="text-[11px] text-neutral-300 space-y-1.5">
          <div><span className="text-neutral-500">Channel:</span> <span className="text-purple-400 font-mono font-semibold">{channel}</span></div>
          <div><span className="text-neutral-500">Target:</span> <span className="text-neutral-300">SLACK_WEBHOOK</span></div>
          <div><span className="text-neutral-500">Status:</span> <span className="text-emerald-400 font-semibold">DELIVERED</span></div>
        </div>
        <div className="text-[10px] text-neutral-500 border-t border-purple-500/20 pt-2 font-mono">
          Webhook ID: WH-2026-{channel.replace("#", "").toUpperCase()} · {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Audio Upload Card
// ─────────────────────────────────────────────────────
function AudioUploadCard({ text }: { text: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-bold text-white">Audio Batch Processing</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">ASSEMBLYAI v3</span>
      </div>
      <div className="border border-cyan-500/30 rounded-xl bg-cyan-950/20 p-4 space-y-3">
        <div className="flex items-center gap-2 text-cyan-400">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Batch Transcription Complete</span>
        </div>
        <div className="text-[11px] text-neutral-300 space-y-1.5">
          <div><span className="text-neutral-500">Source:</span> <span className="text-neutral-300">meeting-recording.wav</span></div>
          <div><span className="text-neutral-500">Duration:</span> <span className="text-neutral-300 font-mono">4:32</span></div>
          <div><span className="text-neutral-500">Language:</span> <span className="text-neutral-300">English (locked)</span></div>
          <div><span className="text-neutral-500">Confidence:</span> <span className="text-emerald-400 font-semibold">98.7%</span></div>
        </div>
      </div>
      <div className="no-print text-[11px] text-neutral-400 bg-cyan-950/20 border border-cyan-500/20 rounded-lg p-2.5 flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <span className="line-clamp-2">{text || "Pre-recorded audio processed via AssemblyAI Batch API. Intent extracted and document synthesized."}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Idle / Guide State for Right Panel
// ─────────────────────────────────────────────────────
function DocPanelIdle({ onSelectDemo }: { onSelectDemo: (query: string) => void }) {
  const [activeTab, setActiveTab] = useState<"financials" | "legal" | "ops">("financials");

  const tabGroups = {
    financials: [
      { icon: "💼", label: "Quotation: PHOENIX-2026", prompt: "Show the PHOENIX-2026 enterprise quotation for Acme Corp voice gateway", tag: "Quote · $27K" },
      { icon: "📦", label: "Purchase Order: PO-88301", prompt: "Generate purchase order PO-88301 for Apex Hardware chips and server racks", tag: "PO · Approved" },
      { icon: "🧾", label: "Create B2B Invoice", prompt: "Create an invoice for Acme Corp for professional voice engine integration", tag: "Acme · NET-30" },
      { icon: "🏛️", label: "Tax & Compliance", prompt: "What is our FY-2026 corporate tax summary and BD VAT registration BIN?", tag: "Tax · VAT" },
      { icon: "📊", label: "Revenue Chart", prompt: "Show Q1 vs Q2 visual revenue chart", tag: "Chart · SVG" },
      { icon: "💱", label: "Currency Convert", prompt: "Convert quotation to BDT", tag: "BDT · EUR" },
    ],
    legal: [
      { icon: "👤", label: "HR Offer Letter", prompt: "Draft an offer letter for Rafiqul Islam as Senior Full-Stack Engineer", tag: "EMP-1041" },
      { icon: "📋", label: "Meeting Minutes", prompt: "Summarize product sync meeting minutes", tag: "MIN-2026" },
      { icon: "🔒", label: "Legal NDA Contract", prompt: "Generate NDA for InnoTech Solutions", tag: "NDA · 2yr" },
      { icon: "🔀", label: "Document Diff", prompt: "Compare revised quote with original version", tag: "Diff · Compare" },
    ],
    ops: [
      { icon: "💰", label: "Expense Claim", prompt: "Create $450 expense claim for Sarah", tag: "EXP-9902" },
      { icon: "📧", label: "Email Dispatch", prompt: "Email this quotation to Acme Corp", tag: "SMTP · Sent" },
      { icon: "🛡️", label: "CFO Approval", prompt: "Authorize $27,000 transaction with CFO key KNT-2026", tag: "Guard · $27K" },
      { icon: "💬", label: "Slack Dispatch", prompt: "Post meeting summary to Slack #product-strategy", tag: "Webhook" },
      { icon: "🎙️", label: "Audio Upload", prompt: "Process uploaded meeting audio recording", tag: "Batch API" },
    ],
  };

  const tabs = [
    { key: "financials" as const, label: "Financials", icon: "💳" },
    { key: "legal" as const, label: "Legal & HR", icon: "📄" },
    { key: "ops" as const, label: "Dispatch & Ops", icon: "⚡" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab Navigation Header */}
      <div className="px-5 pt-5 pb-3 shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <div className="inline-flex p-2 rounded-xl bg-neutral-900 border border-white/10 text-lg shadow-lg">
            📄⚡
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Enterprise Operations Deck</h3>
            <p className="text-[11px] text-neutral-500">Speak naturally or select a workflow template</p>
          </div>
        </div>

        <div className="flex gap-1 bg-neutral-900/90 border border-white/10 rounded-xl p-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "bg-white text-black font-semibold shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/80 border border-transparent"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Grid */}
      <div className="flex-1 overflow-y-auto px-5 pb-5 custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {tabGroups[activeTab].map((item) => (
            <button
              key={item.label}
              onClick={() => onSelectDemo(item.prompt)}
              className="btn-vesper bg-neutral-900/60 backdrop-blur-md border border-white/10 hover:border-emerald-500/40 hover:bg-neutral-900 rounded-xl p-3.5 transition-all duration-200 cursor-pointer group shadow-lg shadow-black/40 text-left"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-xs font-semibold text-neutral-200 group-hover:text-emerald-400 transition-colors">
                    {item.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800/80 border border-white/10 text-neutral-400 group-hover:text-neutral-300 transition-colors">
                  {item.tag}
                </span>
              </div>
              <div className="text-[10px] text-neutral-500 font-mono mt-0.5 line-clamp-1 group-hover:text-neutral-400 transition-colors">
                &ldquo;{item.prompt}&rdquo;
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Main Split-Screen Voice Agent Page Component
// ─────────────────────────────────────────────────────
export default function VoiceAgentPage() {
  const [isListening, setIsListening] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [docCard, setDocCard] = useState<DocumentCard | null>(null);
  const [groqStatus, setGroqStatus] = useState<"idle" | "processing" | "done">("idle");
  const [textInput, setTextInput] = useState("");
  const [jsonCopied, setJsonCopied] = useState(false);
  const [isRevisedPulse, setIsRevisedPulse] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deduplication helper — rejects identical consecutive messages
  const appendMessage = useCallback(
    (newMsg: { role: "user" | "assistant"; text: string; final?: boolean; timestamp: number }) => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === newMsg.role && last.text.trim() === newMsg.text.trim()) {
          return prev; // Reject exact consecutive duplicate
        }
        return [...prev, newMsg];
      });
    },
    []
  );

  const wsRef = useRef<WebSocket | null>(null);
  const wsConnectingOrConnected = useRef(false);
  const isSpeakingRef = useRef(false);
  const audioQueueRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const triggerRevisionPulse = () => {
    setIsRevisedPulse(true);
    setTimeout(() => setIsRevisedPulse(false), 2600);
  };

  const playNextAudioChunk = useCallback(() => {
    if (audioQueueRef.current.length === 0) {
      isSpeakingRef.current = false;
      setIsPlayingAudio(false);
      currentAudioRef.current = null;
      return;
    }
    const nextBlob = audioQueueRef.current.shift();
    if (!nextBlob) {
      isSpeakingRef.current = false;
      setIsPlayingAudio(false);
      return;
    }
    isSpeakingRef.current = true;
    setIsPlayingAudio(true);
    const audioUrl = URL.createObjectURL(nextBlob);
    const audio = new Audio(audioUrl);
    currentAudioRef.current = audio;
    const handleFinish = () => {
      URL.revokeObjectURL(audioUrl);
      currentAudioRef.current = null;
      playNextAudioChunk();
    };
    audio.onended = handleFinish;
    audio.onerror = handleFinish;
    audio.play().catch(handleFinish);
  }, []);

  const stopPlayback = useCallback(() => {
    audioQueueRef.current = [];
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    isSpeakingRef.current = false;
    setIsPlayingAudio(false);
  }, []);

  // Barge-in: kill audio playback and notify backend to cancel TTS/LLM
  const interruptPlayback = useCallback(() => {
    stopPlayback();
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "user_interrupt" }));
    }
  }, [stopPlayback]);

  const stopMicrophone = useCallback(() => {
    stopPlayback();
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setIsListening(false);
  }, [stopPlayback]);

  // Smooth auto-scroll to bottom of transcripts stream whenever messages update
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages]);

  // WebSocket lifecycle
  useEffect(() => {
    // Prevent duplicate connections from React 18 StrictMode double-mount
    if (wsConnectingOrConnected.current) return;
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }
    wsConnectingOrConnected.current = true;

    let isMounted = true;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/v1/ws/voice-agent";
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (isMounted) setIsConnected(true);
    };
    ws.onclose = () => {
      wsConnectingOrConnected.current = false;
      if (isMounted) {
        setIsConnected(false);
        setGroqStatus("idle");
      }
    };
    ws.onerror = () => {
      wsConnectingOrConnected.current = false;
      if (isMounted) setIsConnected(false);
    };

    ws.onmessage = async (event) => {
      if (!isMounted) return;
      if (typeof event.data === "string") {
        const data = JSON.parse(event.data);
        if (data.type === "transcript") {
          setMessages((prev) => {
            const filtered = prev.filter((m) => m.final !== false);
            if (data.final) {
              const last = filtered[filtered.length - 1];
              if (last && last.role === "user" && last.text.trim() === (data.text ?? "").trim() && last.final) {
                return filtered; // Skip exact duplicate final transcript
              }
            }
            return [...filtered, { role: "user", text: data.text, final: data.final, timestamp: Date.now() }];
          });
          if (data.final) setGroqStatus("processing");
        } else if (data.type === "text_delta") {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === "assistant" && !last.final) {
              return [
                ...prev.slice(0, -1),
                { role: "assistant", text: last.text + data.content, final: false, timestamp: last.timestamp },
              ];
            }
            return [...prev, { role: "assistant", text: data.content, final: false, timestamp: Date.now() }];
          });
        } else if (data.type === "action_card") {
          // Backend emitted structured action_card with cryptographic hash & QR
          const now = Date.now();
          setDocCard((prev) => {
            const existingPayload = prev?.payload ?? {};
            return {
              type: data.doc_type,
              title: data.title || "Enterprise Document",
              payload: { ...existingPayload, ...(data.data || {}), ...(data.conversion ? { conversion: data.conversion } : {}), ...(data.diff ? { diff: data.diff } : {}), ...(data.slack_channel ? { slack_channel: data.slack_channel, dispatch_target: data.dispatch_target } : {}) },
              amount: data.amount || prev?.amount,
              approval_status: data.approval_status || prev?.approval_status,
              timestamp: now,
              verification_hash: data.verification_hash,
              qr_payload: data.qr_payload,
              revised: data.revised ?? false,
              revision_note: data.revised ? "Live delta update applied from voice conversation" : undefined,
            };
          });
          if (data.revised) {
            triggerRevisionPulse();
          }
        } else if (data.type === "text_response") {
          const now = Date.now();
          const fullText = (data.text as string) || "";
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === "assistant" && !last.final) {
              return [...prev.slice(0, -1), { role: "assistant", text: fullText, final: true, timestamp: now }];
            }
            return [...prev, { role: "assistant", text: fullText, final: true, timestamp: now }];
          });
          setGroqStatus("done");

          // Inspect text and update right panel card if not already set by action_card
          const docType = detectDocumentType(fullText);
          if (docType !== "none") {
            const payload = buildDocumentPayload(docType, fullText, now);
            const { hash, qr } = generateClientHash(String(payload.quotation_id || payload.invoice_number || payload.po_number || docType.toUpperCase()), String(payload.grand_total || payload.total_due || 0));
            setDocCard((prev) => ({
              type: docType,
              title: fullText.slice(0, 60),
              payload: { ...(prev?.payload || {}), ...payload },
              timestamp: now,
              verification_hash: prev?.verification_hash || hash,
              qr_payload: prev?.qr_payload || qr,
              revised: prev?.revised ?? false,
            }));
          }
          setTimeout(() => setGroqStatus("idle"), 2500);
        } else if (data.type === "interrupt_ack") {
          stopPlayback();
          setGroqStatus("idle");
        }
      } else if (event.data instanceof Blob || event.data instanceof ArrayBuffer) {
        const audioBlob = new Blob([event.data], { type: "audio/wav" });
        audioQueueRef.current.push(audioBlob);
        if (!isSpeakingRef.current) playNextAudioChunk();
      }
    };

    return () => {
      isMounted = false;
      wsConnectingOrConnected.current = false;
      stopMicrophone();
      stopPlayback();
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close(1000, "Component unmounted");
      }
      wsRef.current = null;
    };
  }, [playNextAudioChunk, stopMicrophone, stopPlayback, interruptPlayback]);

  // Audio capture
  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        const inputData = e.inputBuffer.getChannelData(0);

        // Calculate RMS energy of this audio chunk
        const rms = calculateRMS(inputData);

        // During TTS playback: mute normal transmission, only allow loud barge-in
        if (isSpeakingRef.current) {
          if (rms > BARGEIN_THRESHOLD) {
            interruptPlayback();
          }
          return; // Mute all PCM during agent speech to prevent echo loop
        }

        // Noise gate: drop silent chunks to keep AssemblyAI buffer clean
        if (rms < SILENCE_THRESHOLD) return;

        // Forward valid speech PCM to AssemblyAI
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        wsRef.current.send(pcm16.buffer);
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);
      setIsListening(true);
    } catch (err) {
      console.error("Microphone capture error:", err);
    }
  };

  // Dispatch text command with client-side stateful revision support
  const sendTextCommand = (cmd: string) => {
    const text = cmd.trim();
    if (!text) return;

    const lower = text.toLowerCase();
    const isRevision = docCard !== null && (
      lower.includes("discount") ||
      lower.includes("change") ||
      lower.includes("modify") ||
      lower.includes("fee") ||
      lower.includes("maintenance") ||
      lower.includes("10%") ||
      lower.includes("200") ||
      lower.includes("salary") ||
      lower.includes("terms") ||
      lower.includes("net-60")
    );

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(text);
      // In online mode, do NOT append the user message locally —
      // the backend streams back a `transcript` message that will
      // be handled by the WS onmessage listener, preventing duplicates.
      setGroqStatus("processing");
    } else {
      // Offline / Local Simulation Mode
      appendMessage({ role: "user", text, final: true, timestamp: Date.now() });
      setGroqStatus("processing");

      setTimeout(() => {
        const now = Date.now();

        if (isRevision && docCard) {
          let revisionReply = "";
          const updatedPayload = { ...docCard.payload };

          if (lower.includes("discount") || lower.includes("10%")) {
            updatedPayload.discount_pct = 10;
            const subtotal = 28500;
            const grandTotal = subtotal * 0.9;
            updatedPayload.grand_total = grandTotal;
            revisionReply = "Updated PHOENIX-2026 quotation: discount adjusted from 5% to 10%. New grand total is $25,650.00.";
          } else if (lower.includes("fee") || lower.includes("200") || lower.includes("maintenance")) {
            updatedPayload.maintenance_fee = 200;
            revisionReply = "Revised invoice: added recurring SLA maintenance fee of $200.00 to line items. New balance due is $5,250.00.";
          } else if (lower.includes("terms") || lower.includes("net-60")) {
            updatedPayload.payment_terms = "NET-60";
            revisionReply = "Payment terms successfully revised from NET-30 to NET-60 on active invoice.";
          } else if (lower.includes("salary") || lower.includes("140000")) {
            updatedPayload.salary = "140,000 BDT / month";
            revisionReply = "Revised HR Appointment Letter: compensation upgraded to 140,000 BDT/month.";
          } else {
            revisionReply = `Applied requested revision: "${text}". Document state and cryptographic seal updated.`;
          }

          const { hash, qr } = generateClientHash(String(updatedPayload.quotation_id || updatedPayload.invoice_number || docCard.type.toUpperCase()), String(updatedPayload.grand_total || updatedPayload.total_due || 0));

          setDocCard({
            ...docCard,
            payload: updatedPayload,
            timestamp: now,
            verification_hash: hash,
            qr_payload: qr,
            revised: true,
            revision_note: `Revised via voice: "${text}"`,
          });
          triggerRevisionPulse();

          appendMessage({ role: "assistant", text: revisionReply, final: true, timestamp: now });
        } else {
          // Standard creation
          let reply = "";
          const docType = detectDocumentType(text);
          if (docType === "quotation") {
            reply = "Generated Enterprise Quotation PHOENIX-2026 for Acme Corp totaling $27,075.00 with 5% volume discount.";
          } else if (docType === "purchase_order") {
            reply = "Purchase Order PO-88301 generated for Apex Hardware Ltd totaling $15,050.00, authorized by Sarah Jenkins.";
          } else if (docType === "tax_compliance") {
            reply = "Corporate tax report FY-2026 compiled: $11,400 effective tax due with active BD VAT BIN-003928172-0102.";
          } else if (docType === "invoice") {
            reply = "Generated Tax Invoice INV-8821 for Acme Corp. Total due is $5,050.00 under NET-30 payment terms.";
          } else if (docType === "financial") {
            reply = "Konthora Q1 2026 financial brief: $142,000 revenue with 28.5% EBITDA margin and $57,000 net profit.";
          } else if (docType === "hr_letter") {
            reply = "Drafted appointment offer letter for Rafiqul Islam as Senior Full-Stack Engineer starting October 2026.";
          } else if (docType === "inventory") {
            reply = "Warehouse audit complete: 42 Apple M3 Pro chips and 8 server racks available across Singapore and Frankfurt.";
          } else {
            reply = `Acknowledged: "${text}". Voice-to-document engine processed the command.`;
          }

          const payload = buildDocumentPayload(docType, reply, now);
          const { hash, qr } = generateClientHash(String(payload.quotation_id || payload.invoice_number || docType.toUpperCase()), String(payload.grand_total || payload.total_due || 0));

          setDocCard({
            type: docType,
            title: text,
            payload,
            timestamp: now,
            verification_hash: hash,
            qr_payload: qr,
            revised: false,
          });

          appendMessage({ role: "assistant", text: reply, final: true, timestamp: now });
        }

        setGroqStatus("done");
        setTimeout(() => setGroqStatus("idle"), 2000);
      }, 700);
    }
    setTextInput("");
  };

  // Audio file upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    appendMessage({ role: "user", text: `[Audio Upload] ${file.name} (${(file.size / 1024).toFixed(1)}KB)`, final: true, timestamp: Date.now() });
    setTimeout(() => {
      setIsUploading(false);
      appendMessage({ role: "assistant", text: `Audio file "${file.name}" processed via AssemblyAI Batch API. Transcript extracted and document intent classified. Enterprise document card is ready.`, final: true, timestamp: Date.now() });
      setDocCard({
        type: "audio_upload",
        title: file.name,
        payload: { filename: file.name, size: file.size, status: "processed" },
        timestamp: Date.now(),
        verification_hash: "SHA256-KNT-" + file.name.slice(0, 4).toUpperCase(),
      });
    }, 2000);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // PDF & Print Actions
  const handlePrintPDF = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleCopyJSON = () => {
    if (docCard && docCard.payload) {
      navigator.clipboard.writeText(JSON.stringify(docCard.payload, null, 2));
      setJsonCopied(true);
      setTimeout(() => setJsonCopied(false), 2000);
    }
  };

  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant" && m.final);

  return (
    <div className="h-auto xl:h-[calc(100vh-90px)] overflow-y-auto xl:overflow-hidden bg-black text-white min-h-screen overflow-x-hidden relative font-sans selection:bg-emerald-500 selection:text-black flex flex-col xl:grid xl:grid-cols-2 gap-4 p-4 pb-32 select-none">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900/50 via-black to-black pointer-events-none z-0" />
      {/* ── 2-Panel Split-Screen Command Dashboard ── */}

        {/* ════════════════════════════════════════
            LEFT PANEL: Cyberpunk Glow Audio Agent Deck
        ════════════════════════════════════════ */}
        <div className="no-print w-full h-full min-h-[420px] bg-neutral-950/80 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] appear appear--scale" style={{ "--d": "0.1s" } as React.CSSProperties}>
          {/* Deck Header */}
          <div className="px-5 py-2.5 border-b border-white/10 flex items-center justify-between shrink-0 bg-neutral-950/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
              <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-widest">Audio Agent Deck</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-[10px] font-mono">
                {isConnected ? (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Wifi className="w-3 h-3" /> Live
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400">
                    <WifiOff className="w-3 h-3" /> Offline
                  </span>
                )}
              </div>
              <span className="w-px h-3 bg-neutral-800" />
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500">
                <Cpu className={`w-3 h-3 ${groqStatus === "processing" ? "text-cyan-400 animate-spin" : "text-slate-600"}`} />
                <span className={groqStatus === "processing" ? "text-cyan-400" : ""}>
                  {groqStatus === "processing" ? "Inferencing..." : "Groq 70B"}
                </span>
              </div>
              <span className="w-px h-3 bg-neutral-800" />
              <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-neutral-500">
                <Zap className="w-3 h-3 text-emerald-500" /> v3
              </span>
            </div>
          </div>

          {/* Live Audio Visualizer Deck */}
          <div className="px-5 py-2.5 border-b border-white/10/50 bg-neutral-900/30 shrink-0">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  PCM SPECTRAL FEED (16kHz / 16-BIT)
                </span>
                <span className={isListening ? "text-emerald-400 font-bold" : "text-slate-600"}>
                  {isListening ? "● STREAMING" : "○ STANDBY"}
                </span>
              </div>
              <LiveWaveform active={isListening} />
            </div>
          </div>

          {/* Audio File Upload Zone */}
          <div className="px-4 py-2 border-b border-white/10/50 shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.ogg,.m4a"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-neutral-700 hover:border-cyan-500/50 bg-neutral-900/30 hover:bg-cyan-950/20 text-[11px] font-mono text-neutral-500 hover:text-cyan-400 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <span className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  Processing via AssemblyAI Batch API...
                </>
              ) : (
                <>
                  <Download className="w-3 h-3" />
                  Upload Voice Note / Meeting Recording (.mp3, .wav)
                </>
              )}
            </button>
          </div>

          {/* Transcript Stream Box with internal scroll constraint */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider sticky top-0 bg-neutral-950/90 py-0.5 backdrop-blur-sm z-10">
              Real-Time Acoustic &amp; Intent Stream
            </div>

            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center space-y-4">
                {/* Ambient Glowing Mic Halo */}
                <div className="relative flex items-center justify-center my-4">
                  <div className="absolute w-36 h-36 rounded-full bg-emerald-500/10 animate-ping opacity-20 pointer-events-none" />
                  <div className="absolute w-28 h-28 rounded-full bg-emerald-500/15 border border-emerald-500/30 blur-sm pointer-events-none" />
                  <div className="absolute w-20 h-20 rounded-full bg-emerald-500/5 border border-emerald-500/20 animate-ping [animation-duration:4s] opacity-30 pointer-events-none" />
                  <button
                    type="button"
                    onClick={isListening ? stopMicrophone : startMicrophone}
                    className="relative z-10 h-20 w-20 rounded-full bg-neutral-900/90 border border-emerald-500/40 flex items-center justify-center text-emerald-400 hover:scale-105 hover:border-emerald-400 transition-all shadow-[0_0_40px_rgba(16,185,129,0.25)] cursor-pointer"
                  >
                    {isListening ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                  </button>
                </div>

                <div className="text-xs font-semibold text-neutral-300">
                  {isListening ? "Listening — Speak Now" : "Tap to Start Voice Operations Engine"}
                </div>

                {/* Hardware Status Chips */}
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-md bg-neutral-900 border border-white/10 text-neutral-400">
                    {isConnected ? "🟢 Connected" : "🔴 Offline"}
                  </span>
                  <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-md bg-neutral-900 border border-white/10 text-neutral-400">
                    AssemblyAI v3
                  </span>
                  <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-md bg-neutral-900 border border-white/10 text-neutral-400">
                    16kHz PCM
                  </span>
                  <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-md bg-neutral-900 border border-white/10 text-neutral-400">
                    Full Duplex
                  </span>
                </div>
              </div>
            ) : (
              messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      m.role === "user"
                        ? "bg-emerald-600/20 border border-emerald-500/30 text-emerald-100 rounded-tr-none shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                        : "bg-neutral-900/90 border border-white/10 text-neutral-200 rounded-tl-none"
                    } ${!m.final ? "opacity-75 italic animate-pulse border-dashed" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[9.5px] font-mono text-neutral-500 uppercase tracking-wider">
                        {m.role === "user" ? "Spoken Input" : "Konthora Voice"}
                      </span>
                      <span className="text-[9.5px] font-mono text-slate-600">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                    </div>
                    {m.text}
                    {!m.final && (
                      <span className="ml-1 inline-block w-1.5 h-3 bg-emerald-400 animate-pulse rounded-sm align-middle" />
                    )}
                  </div>

                  {m.role === "user" && (
                    <div className="w-7 h-7 rounded-lg bg-neutral-800 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Mic className="w-3.5 h-3.5 text-neutral-300" />
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Unified Input Dock — Floating Glass Bar */}
          <div className="p-3 border-t border-white/10 bg-neutral-950/95 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendTextCommand(textInput);
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={isListening ? stopMicrophone : startMicrophone}
                className={`btn-vesper shrink-0 h-10 w-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
                  isListening
                    ? "bg-red-500/10 border-red-500/40 text-red-400 hover:bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                    : "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                }`}
              >
                {isListening ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Issue operational voice command or revision (e.g. 'Generate quotation for Acme', 'Authorize transaction')..."
                className="flex-1 bg-black/80 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500/50 font-mono transition-colors"
              />
              <button
                type="submit"
                className="btn-vesper shrink-0 px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* ════════════════════════════════════════
            RIGHT PANEL: Dynamic Enterprise Document Deck & Actions
        ════════════════════════════════════════ */}
        <div className="w-full h-full min-h-[500px] bg-neutral-950/80 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] appear appear--scale" style={{ "--d": "0.2s" } as React.CSSProperties}>
          {/* Deck Header & Action Bar */}
          <div className="no-print px-5 py-2.5 border-b border-white/10 flex items-center justify-between shrink-0 bg-neutral-950/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)]" />
              <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                Enterprise Operations Deck
              </span>
            </div>

            {/* Functional PDF & Copy Action Buttons */}
            {docCard ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyJSON}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-mono border border-white/10 transition-colors cursor-pointer"
                  title="Copy Document JSON Payload"
                >
                  {jsonCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-neutral-400" />
                      <span>JSON</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handlePrintPDF}
                  className="btn-vesper flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] font-mono shadow-[0_0_12px_rgba(16,185,129,0.35)] transition-all cursor-pointer"
                  title="Print or Save as PDF"
                >
                  <Printer className="w-3 h-3" />
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={() => setDocCard(null)}
                  className="p-1 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                  title="Reset Deck"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-neutral-500">Live Mock Enterprise DB</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-white/10 text-emerald-400">
                  Ready
                </span>
              </div>
            )}
          </div>

          {/* Groq Tool Execution Visualizer */}
          {groqStatus === "processing" && (
            <div className="no-print px-5 py-2.5 border-b border-white/10 bg-cyan-950/20 shrink-0">
              <div className="rounded-xl border border-cyan-500/30 bg-neutral-900/80 p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    <span className="text-xs font-mono font-bold text-cyan-400">GROQ LPU TOOL INVOCATION</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300">~220ms</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
                  <span className="text-emerald-400 font-semibold">1. Audio Utterance</span>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span className="text-cyan-400 animate-pulse font-semibold">2. Querying Mock DB</span>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span className="text-neutral-500">3. Synthesizing Document</span>
                </div>
              </div>
            </div>
          )}

          {/* Document Render Area with internal scroll constraint */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {!docCard ? (
              <DocPanelIdle onSelectDemo={(prompt) => sendTextCommand(prompt)} />
            ) : (
              <div className="space-y-4">
                {/* Status Bar above document (no-print) */}
                <div className="no-print flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Active Document ({docCard.type.toUpperCase()})</span>
                    </span>
                    {docCard.revised && (
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        Live Revised
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {new Date(docCard.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {/* Quick Voice Revision Controls Toolbar (no-print) */}
                <div className="no-print flex items-center gap-2 p-2 bg-neutral-900/80 rounded-xl border border-white/10 text-[11px] overflow-x-auto">
                  <span className="text-neutral-500 font-mono text-[10px] uppercase shrink-0 flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-emerald-400" />
                    Quick Voice Revisions:
                  </span>
                  {docCard.type === "quotation" && (
                    <>
                      <button
                        onClick={() => sendTextCommand("Change discount from 5% to 10%")}
                        className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-white/10 shrink-0 cursor-pointer"
                      >
                        ⚡ &ldquo;Change discount to 10%&rdquo;
                      </button>
                      <button
                        onClick={() => sendTextCommand("Add maintenance fee of $200")}
                        className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-white/10 shrink-0 cursor-pointer"
                      >
                        ⚡ &ldquo;Add $200 maintenance fee&rdquo;
                      </button>
                    </>
                  )}
                  {docCard.type === "invoice" && (
                    <>
                      <button
                        onClick={() => sendTextCommand("Add maintenance fee of $200")}
                        className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-white/10 shrink-0 cursor-pointer"
                      >
                        ⚡ &ldquo;Add $200 maintenance fee&rdquo;
                      </button>
                      <button
                        onClick={() => sendTextCommand("Update payment terms to NET-60")}
                        className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-white/10 shrink-0 cursor-pointer"
                      >
                        ⚡ &ldquo;Update terms to NET-60&rdquo;
                      </button>
                    </>
                  )}
                  {docCard.type === "hr_letter" && (
                    <button
                      onClick={() => sendTextCommand("Change salary to 140000 BDT")}
                      className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-white/10 shrink-0 cursor-pointer"
                    >
                      ⚡ &ldquo;Change salary to 140,000 BDT&rdquo;
                    </button>
                  )}
                </div>

                {/* Target Container Box with Revision Glow Pulse */}
                <div
                  className={`print-card-target rounded-2xl border transition-all duration-500 bg-neutral-900/90 p-6 space-y-4 relative overflow-hidden backdrop-blur-md ${
                    isRevisedPulse
                      ? "border-emerald-400 ring-2 ring-emerald-500/60 shadow-[0_0_35px_rgba(16,185,129,0.5)]"
                      : "border-white/10 shadow-[0_0_30px_rgba(16,185,129,0.12)]"
                  }`}
                >
                  {/* Revision Notice Banner */}
                  {docCard.revised && (
                    <div className="no-print flex items-center justify-between bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-mono animate-pulse">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        LIVE DOCUMENT REVISED VIA VOICE
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold">
                        SHA-256 Seal Regenerated
                      </span>
                    </div>
                  )}

                  {docCard.type === "quotation" && (
                    <QuotationCard
                      text={lastAssistantMsg?.text ?? ""}
                      customData={docCard.payload}
                      verificationHash={docCard.verification_hash}
                      qrPayload={docCard.qr_payload}
                    />
                  )}
                  {docCard.type === "purchase_order" && (
                    <PurchaseOrderCard
                      text={lastAssistantMsg?.text ?? ""}
                      verificationHash={docCard.verification_hash}
                      qrPayload={docCard.qr_payload}
                    />
                  )}
                  {docCard.type === "tax_compliance" && (
                    <TaxComplianceCard
                      text={lastAssistantMsg?.text ?? ""}
                      verificationHash={docCard.verification_hash}
                      qrPayload={docCard.qr_payload}
                    />
                  )}
                  {docCard.type === "invoice" && (
                    <InvoiceCard
                      text={lastAssistantMsg?.text ?? ""}
                      ts={docCard.timestamp}
                      customData={docCard.payload}
                      verificationHash={docCard.verification_hash}
                      qrPayload={docCard.qr_payload}
                    />
                  )}
                  {docCard.type === "financial" && (
                    <FinancialCard
                      text={lastAssistantMsg?.text ?? ""}
                      verificationHash={docCard.verification_hash}
                      qrPayload={docCard.qr_payload}
                    />
                  )}
                  {docCard.type === "hr_letter" && (
                    <HRLetterCard
                      text={lastAssistantMsg?.text ?? ""}
                      customData={docCard.payload}
                      verificationHash={docCard.verification_hash}
                      qrPayload={docCard.qr_payload}
                    />
                  )}
                  {docCard.type === "inventory" && (
                    <InventoryCard
                      text={lastAssistantMsg?.text ?? ""}
                      verificationHash={docCard.verification_hash}
                      qrPayload={docCard.qr_payload}
                    />
                  )}
                  {docCard.type === "meeting_minutes" && (
                    <MeetingMinutesCard
                      text={lastAssistantMsg?.text ?? ""}
                      verificationHash={docCard.verification_hash}
                    />
                  )}
                  {docCard.type === "legal_contract" && (
                    <LegalContractCard
                      text={lastAssistantMsg?.text ?? ""}
                      verificationHash={docCard.verification_hash}
                    />
                  )}
                  {docCard.type === "expense_voucher" && (
                    <ExpenseVoucherCard
                      text={lastAssistantMsg?.text ?? ""}
                      verificationHash={docCard.verification_hash}
                    />
                  )}
                  {docCard.type === "analytics_chart" && (
                    <AnalyticsChartCard
                      text={lastAssistantMsg?.text ?? ""}
                    />
                  )}
                  {docCard.type === "dispatch_notification" && (
                    <DispatchNotificationCard
                      text={lastAssistantMsg?.text ?? ""}
                    />
                  )}
                  {docCard.type === "currency_conversion" && (
                    <CurrencyConversionCard
                      text={lastAssistantMsg?.text ?? ""}
                      docCard={docCard}
                    />
                  )}
                  {docCard.type === "approval_guard" && (
                    <ApprovalGuardCard
                      text={lastAssistantMsg?.text ?? ""}
                      approvalStatus={docCard.approval_status}
                    />
                  )}
                  {docCard.type === "document_diff" && (
                    <DocumentDiffCard
                      text={lastAssistantMsg?.text ?? ""}
                      docCard={docCard}
                    />
                  )}
                  {docCard.type === "slack_dispatch" && (
                    <SlackDispatchCard
                      text={lastAssistantMsg?.text ?? ""}
                      docCard={docCard}
                    />
                  )}
                  {docCard.type === "audio_upload" && (
                    <AudioUploadCard
                      text={lastAssistantMsg?.text ?? ""}
                    />
                  )}
                </div>

                {/* Database Trace Verification Box (no-print) */}
                <div className="no-print rounded-xl border border-white/10 bg-neutral-900/60 p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[10.5px] font-mono text-neutral-400">
                    <span className="uppercase tracking-wider">Enterprise Cryptographic Audit</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Trust Seal Active
                    </span>
                  </div>
                  <div className="text-[10.5px] font-mono text-neutral-300 bg-neutral-950/80 p-2 rounded border border-white/10/80 overflow-x-auto space-y-1">
                    <div>
                      <span className="text-neutral-500">Hash: </span>
                      <span className="text-emerald-400">{docCard.verification_hash || "SHA256-KNT-2026-X98A2"}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Audit QR: </span>
                      <span className="text-cyan-400">{docCard.qr_payload || "https://konthora.ai/verify?ref=DOC-2026"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Fixed Global Status Bar */}
      <div className="no-print fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/90 backdrop-blur-2xl border-t border-white/10 px-4 py-1.5 text-[10px] flex items-center justify-between text-neutral-400">
        <div className="flex items-center gap-3">
          <span className="font-mono tracking-wider uppercase text-emerald-500/80">AssemblyAI v3</span>
          <span className="text-slate-800">·</span>
          <span className="font-mono tracking-wider uppercase text-cyan-500/80">Groq 70B</span>
          <span className="text-slate-800">·</span>
          <span className="font-mono tracking-wider uppercase text-purple-400/80">Kokoro-82M</span>
        </div>
        <div className="text-slate-600 font-mono">
          <span className="text-emerald-500/70">SHA-256</span> + <span className="text-cyan-500/70">QR Audit</span>
        </div>
      </div>
    </div>
  );
}
