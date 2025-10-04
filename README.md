# Expense Management System — Full-Stack (MERN + TypeScript)

> **Smart, auditable expense reimbursement** with configurable multi-level approvals.  
> Production-grade MERN + TypeScript implementation — frontend polished to match Excalidraw mocks, backend implements deterministic approval engine, OCR, exchange rates, admin tooling, and audit trails.

**Team Lead:** Vrund Patel  
**Team Members:** Hemil Hansora · Kaustav Das · Meet Soni

---

[![Status](https://img.shields.io/badge/status-production-green.svg)]()
[![Tech](https://img.shields.io/badge/tech-MERN%20%2B%20TS-blue.svg)]()
[![Deployed on Netlify](https://img.shields.io/badge/deploy-netlify-blue.svg)](https://expense-manager-odoo-vrundpatel.netlify.app/)

<!-- Quick links -->

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Open%20App-00C7B7?logo=netlify&logoColor=white)](https://expense-manager-odoo-vrundpatel.netlify.app/)
[![Video Walkthrough](https://img.shields.io/badge/Video%20Walkthrough-Google%20Drive-1A73E8?logo=google-drive&logoColor=white)](https://drive.google.com/drive/folders/1tDl_gdLxzekY5bHsK-CLI3fTiXiZRd_p?usp=sharing)

<!-- Tech stack badges -->

[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?logo=socketdotio&logoColor=white)](https://socket.io)
[![Jest](https://img.shields.io/badge/Jest-C21325?logo=jest&logoColor=white)](https://jestjs.io)
[![Testing Library](https://img.shields.io/badge/Testing%20Library-E33332?logo=testing-library&logoColor=white)](https://testing-library.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?logoColor=white)](https://ui.shadcn.com)
[![Tesseract OCR](https://img.shields.io/badge/Tesseract%20OCR-5D2F86)](https://github.com/tesseract-ocr/tesseract)
[![REST Countries](https://img.shields.io/badge/REST%20Countries-002E3B)](https://restcountries.com)
[![ExchangeRate API](https://img.shields.io/badge/ExchangeRate%20API-0A0A0A)](https://www.exchangerate-api.com)

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
# Expense Management System — Full-Stack (MERN + TypeScript)

> Smart, auditable expense reimbursement with configurable multi-level approvals.

[![Status](https://img.shields.io/badge/status-production-green.svg)]()
[![Tech](https://img.shields.io/badge/tech-MERN%20%2B%20TS-blue.svg)]()

---

## Table of Contents

- Overview
- Tech Stack
- Monorepo Structure
- Quick Start
- Features
- APIs & Integrations
- UI System
- Testing
- License

---

## Overview

A production-style MERN + TypeScript app that replaces manual reimbursements with a clear, auditable workflow. It includes role-based access, multi-step approvals, OCR receipt parsing, currency conversion, admin tools, and an immutable audit trail.

---

## Tech Stack

- Client: React + TypeScript (Vite), Tailwind CSS, shadcn/ui
- Server: Node.js + TypeScript, Express, Mongoose (MongoDB)
- Auth: JWT (access + refresh)
- OCR: Tesseract (server) with a demo-friendly parser fallback
- Tests: Jest + RTL (frontend), Jest + Supertest (backend)

---

## Monorepo Structure

```
Odoo-x-Amalthea/
	frontend/            # React app (Vite + TS)
		public/
		src/
	backend/             # Express API (TS)
		src/
	README.md
```

---

## Quick Start (Local)

Prerequisites: Node 18+, npm, and MongoDB (local/Atlas)

1) Backend (API)
	 - cd backend
	 - copy .env (see .env.example) and set MONGO_URI, JWT_SECRET
	 - npm install; npm run dev

2) Frontend (Client)
	 - cd frontend
	 - npm install; npm run dev

---

## Features

- Roles: Admin, Manager, Employee
- Approvals: sequential/parallel, percentage thresholds, specific approver, required approvers, escalation days
- OCR & Receipts: upload, parse, edit prefill
- Currency: live ExchangeRate API; each expense stores exchange rate and converted total
- Admin: users, rules, impersonation, import/export, delete company, clear imported JSON

---

## APIs & Integrations

- REST Countries (client)
	- Endpoint: https://restcountries.com/v3.1/all?fields=name,currencies
	- Usage: maps country → currency (cached 7 days). See `frontend/src/lib/countries.ts`.

- ExchangeRate API (client)
	- Endpoint: https://api.exchangerate-api.com/v4/latest/{BASE}
	- Usage: converts expense amounts to company currency with 12h TTL. See `frontend/src/lib/exchangeRates.ts`.

---

## UI System

- AppShell with collapsible sidebar and theme toggle
- Landing page with hero, features, how-it-works, CTA band
- Glassmorphism cards, accessible forms, consistent focus styles

---

## UI Preview

<div align="center">
	<img src="frontend/public/logo-web.png" alt="Logo" width="96" height="96" />
	<p><em>Expense Manager — Modern, accessible, responsive UI</em></p>
</div>

- Landing hero with CTA buttons and subtle background grid
- Feature cards with hover lift and consistent iconography
- Sticky header, theme toggle, and clean navigation
- Dialog-based forms with focus-ring and keyboard accessibility

---

## Component Props (Examples)

### ApprovalActionButtons

```ts
type ApprovalActionButtonsProps = {
	expenseId: string;     // target expense id
	approverId: string;    // acting approver user id
	onActionComplete?: () => void; // optional callback on success
}
```

Usage: renders Approve/Reject buttons and a dialog to add an optional comment. Delegates logic to the centralized approval engine.

### AppShell

```ts
type AppShellProps = {
	children: React.ReactNode;
}
```

Usage: wraps all authenticated pages with a sticky header, collapsible sidebar (hover-expand on desktop), user menu, and theme toggle. Navigation items adapt to role: admin, manager, or employee.

### ThemeToggle

Stores the selected theme in localStorage and respects system preference. Accessible button with an icon-only surface.

---

## Testing

- Backend: unit tests for approval engine, API integration tests
- Frontend: component/integration tests for core flows

---

## License

MIT — see LICENSE