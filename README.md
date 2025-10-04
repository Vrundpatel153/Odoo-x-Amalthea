# Expense Management System — Full-Stack (MERN + TypeScript)

> **Smart, auditable expense reimbursement** with configurable multi-level approvals.  
> Production-grade MERN + TypeScript implementation — frontend polished to match Excalidraw mocks, backend implements deterministic approval engine, OCR, exchange rates, admin tooling, and audit trails.

**Team Lead:** Vrund Patel  
**Team Members:** Hemil Hansora · Kaustav Das · Meet Soni

---

[![Status](https://img.shields.io/badge/status-production-green.svg)]()
[![Tech](https://img.shields.io/badge/tech-MERN%20%2B%20TS-blue.svg)]()
[![Deployed on Netlify](https://img.shields.io/badge/deploy-netlify-blue.svg)]()

---

## 🎯 Project Summary

Our project replaces slow, error-prone manual reimbursement with a clear, auditable workflow:

- Role based: **Admin**, **Manager**, **Employee**  
- Multi-step approval flows (sequential, parallel) + conditional rules (percentage, specific approver, hybrid)  
- OCR receipt extraction (Tesseract + parser) with editable parsed fields  
- Currency conversion caching (ExchangeRate API) and country→currency mapping (REST Countries)  
- Admin tools: user mgmt, approval rule editor + simulator, impersonation, import/export, seed/reset  
- Approval engine: deterministic, server-side, immutably logs actions

This repo is demo-ready and matches the supplied Excalidraw layouts.

---

## 🧭 Tech Stack

- **Client:** React + TypeScript (Vite), Tailwind CSS, shadcn/ui  
- **Server:** Node.js + TypeScript, Express, Mongoose (MongoDB)  
- **Auth:** JWT (access + refresh)  
- **OCR:** Tesseract (server) with fallback parser for demos  
- **Realtime (optional):** Socket.IO for notifications  
- **Tests:** Jest + React Testing Library (frontend), Jest + Supertest (backend)

---

## 📁 Repo Layout

/client # React frontend (Vite + TS)
/public
/src
/components
/cards
/tables
/forms
/modals
/toasts
/pages
/auth
/admin
/manager
/employee
/expenses
/services # api clients, auth, ocr helpers
/styles
package.json
/server # Express backend (TS)
/src
/controllers
/models
/routes
/services # approvalEngine, ocrService, exchangeService
/jobs # escalation cron jobs
package.json
.env.example
README.md

yaml
Copy code

---

## 🚀 Quick Start (Local)

> **Note:** This repo was demoed and deployed on Netlify for the frontend. Local dev instructions below let the judges run both client & server.

### Prereqs
- Node 18+ & npm  
- MongoDB (local or Atlas)  
- Optional: Tesseract installed locally for best OCR results

### Backend (API)
```bash
cd server
cp .env.example .env
# edit .env -> set MONGO_URI, JWT_SECRET, EXCHANGE_API_KEY (or leave blank for mock), etc.
npm install
npm run dev           # starts API on default port, e.g., http://localhost:4000
Frontend (Client)
bash
Copy code
cd client
npm install
npm run dev           # opens Vite dev server (e.g., http://localhost:5173)
Seed demo data
Use Admin UI → Reset to Seed or call:

bash
Copy code
POST /api/v1/admin/seed
Seed accounts:

Admin_A — admin@acme.test / Admin@123

Manager_B — manager@acme.test / Manager@123

Employee_C — employee@acme.test / Employee@123 (manager -> Manager_B)

🔐 Auth & Company Bootstrap
First signup creates a Company and an Admin (country selection sets company.default_currency).

Login returns access & refresh tokens. Server validates roles on every protected endpoint.

🧩 Core Features (All implemented)
User Management (Admin)

Create/Edit/Delete users, assign role, set manager relationships, optional “send password” flow (simulated email).

Admin impersonation (safe switch/restore) for demos.

Expense Submission (Employee)

Drafts, multi-line items, upload receipts (attachments), OCR parsing (amount/date/merchant), editable parsed fields, choose expense currency, view history.

Approval Workflows (Manager/Admin)

Sequence/resolution supports "manager" placeholder → resolves to requester.managerId (fallback admin).

Multi-approver sequences and parallel lists. Approver actions (approve/reject/comment) recorded immutably.

Conditional Rules

Percentage rule (e.g., 60%)

Specific approver rule (e.g., CFO auto-approve)

Hybrid (percentage OR specific approver)

Approval Engine

Deterministic logic for sequential/parallel flows, percentage & specific approver rules, required approvers reject logic, hybrid logic, escalation days, audit trail persisted in DB.

OCR & Receipts

Server runs OCR (Tesseract) and returns parsed results + confidence score. Frontend pre-fills and allows edits.

Currency & Exchange Rates

Uses ExchangeRate API (configurable), caches rates on server with TTL; each expense stores the rate used and total in company currency.

Admin Tools

Rule editor + reorderable sequence, simulator (test a sample expense and preview approver list and likely outcome), import/export JSON, seed/reset.

🧾 API Snapshot (key endpoints)
bash
Copy code
POST /api/v1/auth/signup
POST /api/v1/auth/login
POST /api/v1/auth/refresh

GET  /api/v1/users
POST /api/v1/users
PATCH /api/v1/users/:id

POST /api/v1/expenses
GET  /api/v1/expenses
GET  /api/v1/expenses/:id

GET  /api/v1/approvals/pending
POST /api/v1/approvals/:expenseId/action

GET  /api/v1/approval-rules
POST /api/v1/approval-rules
POST /api/v1/approval-rules/simulate

POST /api/v1/receipts/upload
POST /api/v1/admin/seed
GET  /api/v1/admin/export
POST /api/v1/admin/import
(Full OpenAPI spec included in /server/docs.)

📐 UI / Components / Design System
This project includes a polished component library matching Excalidraw:

Design Tokens
Primary: #6C63FF

Accent: #00C2A8

Dark bg: #0b0b0f

Light bg: #f6f7fb

Radius: 2xl for cards

Spacing: Tailwind default (4px scale)

Font: Inter

Core components
AppShell — Topbar (dark/light toggle, search, user menu) + collapsible Sidebar

Card — glassmorphism, header + action area, p-6 padding

Table — sticky header, sortable columns, search, pagination (10/25/50), row action ellipsis

Form Inputs — label above, inline validation, accessible aria attributes

Modal — accessible dialog with keyboard focus trap

Toast — aria-live notifications for success/error

ReceiptUploader — drag & drop + preview + OCR confidence chip

ApprovalTimeline — per-expense timeline of approver actions with avatars & timestamps

RuleBuilder — drag & drop sequence, required toggles, min-percentage slider, specific approver picker, simulator modal

All components are responsive; tables collapse to card lists on mobile and right-side panels become full-screen modals.

✅ Acceptance Checklist (for Judges / Evaluators)
Follow these steps to validate core flows:

Start client & server (see Quick Start).

Reset to seed from Admin → Settings (or POST /api/v1/admin/seed).

Employee_C: create expense, attach receipt → confirm OCR parsed values appear and are editable → submit.

Manager_B: check /manager/approvals, approve/reject with comment → verify action logged in approval timeline.

Admin_A: create rule with minApprovalPercentage = 100 and approvers Manager_B + Admin_A → a single rejection should set expense → Rejected (fix verified).

Rule simulator: test a sample expense and review predicted approver list & output.

Import/Export: export app JSON, wipe DB, import JSON, confirm data restored.

Escalation: create a rule with escalationDays low and verify background job marks escalated.

🧪 Tests
Backend: unit tests for approvalEngine and integration tests for API endpoints (Jest + Supertest)

Frontend: component & integration tests for forms, tables, and approval flows (Jest + React Testing Library)

Run tests:

bash
Copy code
# server
cd server
npm run test

# client
cd client
npm run test
🔒 Security Notes
Passwords hashed (bcrypt).

JWT short-lived access tokens + refresh flow.

Server-side role checks on all sensitive endpoints.

Input validation & sanitization (Joi / express-validator).

File upload limits & content validation for receipts.

🧭 Demo Script (2–3 minute walkthrough)
Intro (10s): show landing & one-line problem statement.

Admin (30s): login as Admin_A → Users page → create Manager_B & Employee_C → create approval rule using "manager" placeholder → simulate.

Employee (40s): login as Employee_C → New Expense → upload receipt (OCR auto fills) → submit.

Manager (30s): login as Manager_B (or Admin impersonate) → Approvals → open expense → Approve → show timeline.

Admin (10s): show rule editor & import/export seed. Conclude.

📄 README Addenda / Useful Links
Excalidraw mockups (design reference): included in repo /design/excalidraw

OpenAPI spec: /server/docs/openapi.yaml

Seed JSON: /server/seed/seed.json

📞 Contact & Support
Team Lead: Vrund Patel — available on discord group for live demo assistance.

📝 License
MIT — see LICENSE.