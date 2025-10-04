Backend (TypeScript)

Quick start:
- Copy .env.example to .env and adjust values
- Ensure MongoDB is running locally (mongodb://localhost:27017)
- Install deps: npm install
- Dev server: npm run dev
- Build: npm run build; Start: npm start
- Seed sample data: npm run seed

API highlights:
- POST /api/auth/signup { companyName, name, email, password }
- POST /api/auth/login { email, password } -> { token }
- GET /api/users/me (Bearer token)
- GET /api/expenses (Bearer token)
- POST /api/expenses { title, amount, currency } (Bearer token)
- GET /api/approvals/pending (Bearer token)
- POST /api/approvals/action { expenseId, decision, comment } (Bearer token)
- POST /api/admin/override { expenseId, decision, comment } (Bearer admin token)