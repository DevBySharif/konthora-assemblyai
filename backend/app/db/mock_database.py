# backend/app/db/mock_database.py
"""
Konthora Mock Enterprise Database
Realistic B2B datasets & Bengali/Banglish fuzzy query helpers for Groq LLM tool calls.
"""

MOCK_ENTERPRISE_DB = {
    "clients": {
        "acme_corp": {
            "name": "Acme Corp",
            "id": "CLI-8821",
            "email": "billing@acme.com",
            "currency": "USD",
            "tax_id": "US-99201",
            "address": "500 Market St, San Francisco, CA 94103",
            "contact_person": "John D. Carter",
            "phone": "+1-415-555-0192",
            "payment_terms": "NET-30",
            "credit_limit": 500000,
            "aliases": ["acme", "acme corp", "একমি", "একমি কর্প"],
        },
        "softtech": {
            "name": "SoftTech Bangladesh",
            "id": "CLI-3302",
            "email": "accounts@softtech.com.bd",
            "currency": "BDT",
            "tax_id": "BD-33019",
            "address": "Plot 12, Bashundhara R/A, Dhaka 1229, Bangladesh",
            "contact_person": "Md. Habibur Rahman",
            "phone": "+880-1711-445566",
            "payment_terms": "NET-45",
            "credit_limit": 1500000,
            "aliases": ["softtech", "soft tech", "সফটটেক", "সফট টেক", "বাংলাদেশ"],
        },
        "innotech": {
            "name": "InnoTech GmbH",
            "id": "CLI-7703",
            "email": "finance@innotech.de",
            "currency": "EUR",
            "tax_id": "EU-44102",
            "address": "Hauptstrasse 88, 10178 Berlin, Germany",
            "contact_person": "Liesel Mueller",
            "phone": "+49-30-555-8821",
            "payment_terms": "NET-60",
            "credit_limit": 800000,
            "aliases": ["innotech", "inno tech", "ইনোট্রেক", "জার্মানি"],
        },
    },

    "financials_2026": {
        "Q1": {
            "revenue": 142000,
            "expenses": 85000,
            "profit": 57000,
            "currency": "USD",
            "period": "Jan-Mar 2026",
            "ebitda_margin_pct": 28.5,
            "tax_liability": 11400,
        },
        "Q2_projected": {
            "revenue": 185000,
            "expenses": 112000,
            "profit": 73000,
            "currency": "USD",
            "period": "Apr-Jun 2026 (Projected)",
            "ebitda_margin_pct": 31.0,
            "tax_liability": 14600,
        },
        "annual_metrics": {
            "ebitda_margin_pct": 28.5,
            "tax_liability": 11400,
            "currency": "USD",
            "fiscal_year": "FY 2026",
            "projected_annual_revenue": 720000,
        },
    },

    "inventory": {
        "m3_pro_chip": {
            "name": "Apple M3 Pro Chip (OEM)",
            "sku": "HW-M3P-001",
            "units_in_stock": 42,
            "unit_price": 450,
            "currency": "USD",
            "warehouse": "Singapore Hub",
            "reorder_point": 10,
            "aliases": ["m3", "m3 pro", "chip", "chips", "প্রসেসর", "চিপ", "কম্পিউটার"],
        },
        "enterprise_server_rack": {
            "name": "Enterprise Server Rack 42U",
            "sku": "HW-SRV-42U",
            "units_in_stock": 8,
            "unit_price": 2800,
            "currency": "USD",
            "warehouse": "Frankfurt DC",
            "reorder_point": 3,
            "aliases": ["rack", "server rack", "server", "সার্ভার", "র্যাক"],
        },
        "fiber_optic_transceiver": {
            "name": "Fiber Optic Transceiver 100G",
            "sku": "NET-FOT-100G",
            "units_in_stock": 120,
            "unit_price": 180,
            "currency": "USD",
            "warehouse": "Singapore Hub",
            "reorder_point": 25,
            "aliases": ["fiber", "transceiver", "100g", "অপটিক্যাল", "নেটওয়ার্ক"],
        },
    },

    "employees": {
        "rafiqul_islam": {
            "name": "Rafiqul Islam",
            "employee_id": "EMP-1041",
            "title": "Senior Full-Stack Engineer",
            "department": "Engineering",
            "salary": 120000,
            "currency": "BDT",
            "join_date": "2023-04-15",
            "offer_letter_date": "2026-10-01",
            "manager": "Sarah Jenkins",
            "email": "rafiqul.islam@konthora.ai",
            "status": "Active",
            "aliases": ["rafiqul", "rafiq", "রফিক", "রফিকুল", "ইঞ্জিনিয়ার", "বেতন"],
        },
        "sarah_jenkins": {
            "name": "Sarah Jenkins",
            "employee_id": "EMP-0021",
            "title": "Lead Solutions Architect",
            "department": "Architecture and Strategy",
            "salary": 95000,
            "currency": "USD",
            "join_date": "2021-08-01",
            "offer_letter_date": "2026-11-15",
            "manager": "CEO",
            "email": "sarah.jenkins@konthora.ai",
            "status": "Active",
            "aliases": ["sarah", "jenkins", "সারাহ", "জেনকিন্স", "আর্কিটেক্ট"],
        },
    },

    "quotations": {
        "phoenix_2026": {
            "id": "PHOENIX-2026",
            "client_name": "Acme Corp",
            "client_id": "CLI-8821",
            "valid_until": "2026-12-31",
            "currency": "USD",
            "items": [
                {"description": "Konthora Real-Time Multilingual Voice Gateway", "qty": 1, "unit_price": 18500, "total": 18500},
                {"description": "Kokoro-82M High-Density Edge TTS Cluster", "qty": 2, "unit_price": 5000, "total": 10000},
            ],
            "subtotal": 28500,
            "discount_pct": 5,
            "total": 27075,
            "notes": "Includes 24/7 SLA with sub-850ms latency guarantee under AssemblyAI Streaming v3.",
            "aliases": ["phoenix", "phoenix-2026", "acme quote", "ফিনিক্স", "কোটেশন"],
        },
        "bd_gov_tender_09": {
            "id": "BD-GOV-TENDER-09",
            "client_name": "SoftTech Bangladesh (ICT Ministry Tender)",
            "client_id": "CLI-3302",
            "valid_until": "2026-11-30",
            "currency": "BDT",
            "items": [
                {"description": "National Citizen Portal Voice Accessibility Integration", "qty": 1, "unit_price": 3200000, "total": 3200000},
                {"description": "Bangla Acoustic Model Tuning & Enterprise Lexicon", "qty": 1, "unit_price": 1300000, "total": 1300000},
            ],
            "subtotal": 4500000,
            "discount_pct": 0,
            "total": 4500000,
            "notes": "Compliant with Bangladesh Public Procurement Rules (PPR-2008).",
            "aliases": ["tender", "gov tender", "ট্যান্ডার", "টেন্ডার", "সরকারি কোটেশন"],
        },
    },

    "purchase_orders": {
        "po_88301": {
            "id": "PO-88301",
            "vendor": "Apex Hardware International Ltd.",
            "date": "2026-09-15",
            "currency": "USD",
            "status": "Approved & Processing",
            "destination_warehouse": "Singapore Hub",
            "items": [
                {"item": "Apple M3 Pro Chip (OEM)", "sku": "HW-M3P-001", "qty": 20, "unit_price": 450, "total": 9000},
                {"item": "Enterprise Server Rack 42U", "sku": "HW-SRV-42U", "qty": 2, "unit_price": 2800, "total": 5600},
            ],
            "tax": 0,
            "shipping": 450,
            "grand_total": 15050,
            "approval_manager": "Sarah Jenkins",
            "aliases": ["po-88301", "po 88301", "purchase order", "ক্রয়াদেশ", "পিও", "অর্ডার"],
        },
    },

    "tax_and_compliance": {
        "fy_2026_summary": {
            "fiscal_year": "FY 2026",
            "entity": "Konthora AI Global Ltd.",
            "currency": "USD",
            "taxable_income": 57000,
            "corporate_tax_rate_pct": 20.0,
            "effective_tax_due": 11400,
            "withholding_tax_paid": 3200,
            "net_payable": 8200,
            "filing_deadline": "2026-11-30",
            "status": "Provisioned & Compliant",
        },
        "vat_registrations": {
            "bangladesh": {"reg_name": "SoftTech / Konthora BD", "bin": "BIN-003928172-0102", "standard_rate_pct": 15.0},
            "european_union": {"reg_name": "InnoTech / Konthora GmbH", "vat_id": "DE-319208194", "standard_rate_pct": 19.0},
            "united_states": {"reg_name": "Konthora US Inc.", "ein": "12-9920194", "state_nexus": "California"},
        },
    },
}


def query_client(name_query: str) -> dict:
    """
    Fuzzy-match a client by key, display name, or aliases (including Bengali / Banglish).
    Falls back to acme_corp if no match found.
    """
    q = name_query.lower().strip()
    clients = MOCK_ENTERPRISE_DB["clients"]

    # Direct match
    if q in clients:
        return clients[q]

    # Alias / name match
    for key, client in clients.items():
        if q in key or q in client["name"].lower():
            return client
        for alias in client.get("aliases", []):
            if q in alias or alias in q:
                return client

    # Token match
    q_tokens = q.split()
    for key, client in clients.items():
        search_corpus = [client["name"].lower(), key] + [a.lower() for a in client.get("aliases", [])]
        if any(any(tok in target for target in search_corpus) for tok in q_tokens):
            return client

    return clients["acme_corp"]


def query_inventory(item_query: str) -> dict | None:
    """Fuzzy-match an inventory item by key, SKU, or multilingual alias."""
    q = item_query.lower().strip()
    inventory = MOCK_ENTERPRISE_DB["inventory"]

    if q in inventory:
        return inventory[q]

    for key, item in inventory.items():
        if q in key or q in item["name"].lower() or q in item["sku"].lower():
            return item
        for alias in item.get("aliases", []):
            if q in alias or alias in q:
                return item

    q_tokens = q.split()
    for key, item in inventory.items():
        search_corpus = [item["name"].lower(), item["sku"].lower(), key] + [a.lower() for a in item.get("aliases", [])]
        if any(any(tok in target for target in search_corpus) for tok in q_tokens):
            return item

    return None


def query_employee(name_query: str) -> dict | None:
    """Fuzzy-match an employee record with support for Bengali & Banglish names."""
    q = name_query.lower().strip()
    employees = MOCK_ENTERPRISE_DB["employees"]

    if q in employees:
        return employees[q]

    for key, emp in employees.items():
        if q in key or q in emp["name"].lower() or q in emp["employee_id"].lower():
            return emp
        for alias in emp.get("aliases", []):
            if q in alias or alias in q:
                return emp

    q_tokens = q.split()
    for key, emp in employees.items():
        search_corpus = [emp["name"].lower(), emp["employee_id"].lower(), key] + [a.lower() for a in emp.get("aliases", [])]
        if any(any(tok in target for target in search_corpus) for tok in q_tokens):
            return emp

    return None


def query_quotation(query_str: str) -> dict | None:
    """Fuzzy-match a quotation or tender."""
    q = query_str.lower().strip()
    quotations = MOCK_ENTERPRISE_DB["quotations"]

    if q in quotations:
        return quotations[q]

    for key, quote in quotations.items():
        if q in key or q in quote["id"].lower() or q in quote["client_name"].lower():
            return quote
        for alias in quote.get("aliases", []):
            if q in alias or alias in q:
                return quote

    # Default to phoenix_2026
    return quotations["phoenix_2026"]


def query_purchase_order(query_str: str) -> dict | None:
    """Fuzzy-match a purchase order."""
    q = query_str.lower().strip()
    orders = MOCK_ENTERPRISE_DB["purchase_orders"]

    if q in orders:
        return orders[q]

    for key, po in orders.items():
        if q in key or q in po["id"].lower() or q in po["vendor"].lower():
            return po
        for alias in po.get("aliases", []):
            if q in alias or alias in q:
                return po

    return orders["po_88301"]


def get_financials(period: str = "Q1"):
    """Return financial snapshot for the given period key."""
    financials = MOCK_ENTERPRISE_DB["financials_2026"]
    period_key = period.upper().replace(" ", "_").replace("-", "_")

    if period_key in financials:
        return financials[period_key]

    for key in financials:
        if period.upper() in key.upper():
            return financials[key]

    return financials["Q1"]


def get_tax_compliance():
    """Return corporate tax and VAT registration summaries."""
    return MOCK_ENTERPRISE_DB["tax_and_compliance"]
