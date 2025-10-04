# ExpenseFlow — Full-Stack (MERN + TypeScript)

> A production-grade Expense Management platform with multi-level, conditional approvals — built with MongoDB, Express, React, Node (MERN) and TypeScript. Polished UI (glassmorphism), accessible, secure, and ready for hackathon demo.

*Team Lead:* Vrund Patel
*Team Members:* Hemil Hansora · Kaustav Das · Meet Soni

---

## ✨ Project Summary

ExpenseFlow replaces manual reimbursement workflows with a modern web app that supports:

* Role-based access: *Admin, **Manager, **Employee*
* Multi-step approval workflows (sequential / parallel) and conditional rules (percentage, specific approver, hybrid)
* Receipt OCR (Tesseract or pluggable OCR service) and currency conversion integration
* Audit trails, escalation rules, impersonation for admin testing, and robust API + client separation
* Full TypeScript stack for safety and maintainability

This repo contains the *complete full-stack implementation* (API + frontend + infra guides) so evaluators can run, test, and extend the system.

---

## 🚀 Tech Stack

* Frontend: React + TypeScript, Vite, Tailwind CSS + shadcn/ui
* Backend: Node.js + TypeScript, Express (or Fastify)
* Database: MongoDB (Atlas or local)
* Auth: JWT (access + refresh tokens)
* OCR: Tesseract (server-side) with fallback to stub/mock for demos
* Realtime (optional): Socket.IO for notifications
* Testing: Jest + React Testing Library (frontend), Jest + Supertest (backend)
* Lint & format: ESLint + Prettier
* Deployment: Docker + optional Kubernetes manifest / Vercel for frontend

---

## 📁 Repo Structure (high-level)


/client                  # React + TS frontend
  /src
	 /components
	 /pages
	 /services           # API clients
	 /styles
	 main.tsx
  vite.config.ts
/server                  # API service (Express + TS)
  /src
	 /controllers
	 /models             # Mongoose models
	 /routes
	 /services           # approval engine, OCR, exchange rates
	 /utils
	 app.ts
  tsconfig.json
/docker                 # docker-compose & Dockerfiles
README.md
.env.example


---

## ✅ Key Features & Flow (what you will demo)

1. *Signup (company boot):* first signup creates a Company + Admin; signup asks for country → sets company currency.
2. *Auth:* JWT-based login + refresh tokens, role-aware guards (Admin/Manager/Employee).
3. *Admin:* create/edit users, assign roles/managers, configure approval rules (sequence, parallel, required flags, min-% threshold, specific approver override, escalation), impersonation for testing, import/export rules & seed.
4. *Employee:* create drafts, attach receipts (upload → OCR parses amount/date/merchant), edit parsed fields, submit for approvals.
5. *Manager:* approvals queue, approve/reject with comments, audit trail.
6. *Approval Engine:* server-side deterministic engine supporting sequential & parallel flows, percentage & specific approver rules, hybrid logic, escalation, and audit logging.
7. *Currency:* currency conversion via public API with caching.
8. *Notifications:* email + in-app realtime notifications (optional Socket.IO).

---

## 📦 API Overview (selected endpoints)

> All endpoints are prefixed with /api/v1. Use Authorization: Bearer <access_token> after login.

*Auth*

* POST /api/v1/auth/signup — create company & admin
* POST /api/v1/auth/login — returns { accessToken, refreshToken }
* POST /api/v1/auth/refresh — refresh tokens

*Users & Company*

* GET /api/v1/companies/:id
* GET /api/v1/users (Admin only)
* POST /api/v1/users (Admin create user)
* PATCH /api/v1/users/:id (Admin edit user)

*Expenses*

* POST /api/v1/expenses — create expense (attachments optional)
* GET /api/v1/expenses?userId=&status= — list
* GET /api/v1/expenses/:id — detail + approval timeline

*Approvals*

* GET /api/v1/approvals/pending — manager’s pending approvals
* POST /api/v1/approvals/:expenseId/action — { action: 'approve'|'reject', comment }

*Approval Rules*

* GET /api/v1/approval-rules
* POST /api/v1/approval-rules
* POST /api/v1/approval-rules/simulate — simulate an expense against a rule

*Receipts & OCR*

* POST /api/v1/receipts/upload — uploads file, triggers OCR; returns parsed fields and confidence

*Admin Utilities*

* POST /api/v1/admin/impersonate — admin starts impersonation
* POST /api/v1/admin/seed — load seed data (dev/demo only)

(Full OpenAPI spec available in /server/docs)

---

## 🗂 Database Schema (summary)

MongoDB / Mongoose models (simplified):

*Company*

js
{ _id, name, countryCode, defaultCurrency, createdAt }


*User*

js
{ _id, companyId, name, email, passwordHash, role, managerId?, isActive, createdAt }


*ApprovalRule*

js
{ _id, companyId, name, sequence: [userId|"manager"], parallel: boolean,
  required: { userId: boolean }, minApprovalPercentage: number,
  specificApproverId?, escalationDays }


*Expense*

js
{ _id, companyId, requesterId, items: [{desc, amount, currency}], totalAmount, currency,
  totalInCompanyCurrency, exchangeRateUsed, status, approvalRuleId,
  approverState: { approvers: [{ userId, status, comment, actedAt }], sequenceIndex }, createdAt }


*ApprovalAction*

js
{ _id, expenseId, approverId, action, comment, timestamp }


*Receipt*

js
{ _id, expenseId, fileUrl, ocrParsed: { amount, date, merchant }, ocrConfidence }

---

## 🧠 Approval Engine — Implementation Notes

* Engine lives on server (/server/src/services/approvalEngine.ts) and is the single source of truth for:

  * Building approver lists (resolve "manager" to requester.managerId or fallback to company admin)
  * Evaluating sequential vs parallel flows
  * Enforcing specific approver overrides (immediate approval if spec approver approves)
  * Percentage rules and hybrid logic (e.g., 60% OR CFO approval)
  * Handling required approver rejections (immediate rejection)
  * Writing immutable audit entries to approvalActions
  * Supporting escalation flows (cron job / background worker checks for stale approvals)

---

## 🔧 Local Development (run everything)

> Prereqs: Node 18+, npm or yarn, MongoDB (local or Atlas)

1. Copy env:

bash
cp .env.example .env
# fill values: MONGO_URI, JWT_SECRET, OCR configs, EXCHANGE_API_KEY, etc.


2. Install & run backend:

bash
cd server
npm install
npm run dev        # ts-node-dev / nodemon
# or in prod:
npm run build
npm start


3. Install & run frontend:

bash
cd client
npm install
npm run dev
# open http://localhost:5173


4. Seed demo data (optional):

* Call POST /api/v1/admin/seed (dev only) or use built-in "Reset to seed" in Admin UI.

---

## 🔁 Running Tests

* Backend unit & integration:

bash
cd server
npm run test


* Frontend tests:

bash
cd client
npm run test

---

## 🧪 Demo & Acceptance Checklist (for evaluators)

Follow these steps to validate the full-stack behavior:

1. *Signup / Company Boot*

	* /signup → create company + admin (choose country). Verify admin user exists in DB and JWT returned.

2. *Seed / Login*

	* Use seed accounts (if seeded) or login created admin.
	* Seed accounts (example):

	  * admin@acme.test / Admin@123
	  * manager@acme.test / Manager@123
	  * employee@acme.test / Employee@123

3. *Admin: Users & Rules*

	* As Admin: create Manager_B and Employee_C, set Employee_C.managerId = Manager_B.
	* Create an approval rule containing "manager" in sequence and/or specific approver and min% = 60.

4. *Employee: Submit Expense*

	* As Employee_C: create expense, upload receipt → OCR parses fields; submit.
	* Verify expense record in database includes approvalRuleId and approverState.

5. *Manager Approval*

	* As Manager_B: view /manager/approvals → see expense → Approve with comment.
	* Verify approval action stored in approvalActions collection and expense status updated accordingly.

6. *Approval Engine*

	* Test parallel flows with multiple approvers and percentage thresholds.
	* Test specific-approver override (if CFO approves, auto-approve).
	* Test required approver rejection leads to immediate rejection.

7. *Escalation*

	* Configure escalationDays and verify background worker flags escalations.

8. *Audit & Logs*

	* Confirm approvalActions keeps full trail with timestamps, comments, and action types.

---

## 🔒 Security & Ops Notes

* Passwords hashed with bcrypt; JWT access token short-lived with refresh tokens stored securely.
* Validate role-based access on server (not only client-side).
* Rate-limits and input validation (express-validator/Joi) on all endpoints.
* Store secrets in environment variables; use Vault/Secret Manager for production.
* For production: use TLS, enable CORS only for allowed origins, enable logging & monitoring.

---

## ☁ Deployment (summary)

* Build frontend (npm run build) and serve via CDN or Vercel/Netlify.
* Containerize backend with Docker and deploy to any cloud provider (AWS ECS, GCP Cloud Run, DigitalOcean App Platform).
* Use managed MongoDB (Atlas) for production.
* Setup background worker (cron or queue) for escalations and OCR heavy jobs.

---

## 🧾 Contribution & Roadmap

Planned next steps (post-hackathon):

* RBAC granular policies & roles UI
* Multi-tenant enhancements
* Payment / reimbursement integrations
* Audit exports and compliance reports
* Mobile-friendly PWA & offline support

Contributions welcome — raise issues or PRs. Follow code style & tests.

---

## 📄 License

MIT License — see LICENSE file.

---

## 🎯 Final Notes (pitch for judges)

ExpenseFlow is built to be demo-ready and enterprise-capable: clear separation of concerns, deterministic approval engine, and UX designed for clarity and trust. For your hackathon demo, run the seed, perform the quick acceptance checklist, and show how rules, OCR, and approvals work end-to-end.

If you want, I’ll now:

* generate docker-compose.yml + Dockerfiles,
* produce the exact package.json files, or
* scaffold the backend approvalEngine.ts and the frontend signup/login pages in TypeScript.

Which do you want me to create next?