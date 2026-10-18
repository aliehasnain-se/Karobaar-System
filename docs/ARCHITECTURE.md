# Technical Architecture

## Technology

- Frontend: React, TypeScript, and Vite
- Backend: Python, Django, and Django REST Framework
- Database: PostgreSQL
- API style: versioned REST API under `/api/v1/`

Frontend and backend remain separate applications and communicate only through the API.

## Module-first organization

Planned frontend modules:

- auth
- dashboard
- employees
- inventory
- suppliers
- purchases
- customers
- sales
- returns
- expenses
- reports

Planned Django applications:

- accounts
- inventory
- suppliers
- purchases
- customers
- sales
- returns
- finance
- audit

Shared code must stay limited to genuine cross-module concerns such as API clients, permissions, common UI controls, and validation helpers.

## Data integrity

- Monetary values use decimal database fields, never floating-point values.
- Fabric quantities use decimal fields with an agreed precision.
- Stock and ledger updates execute inside database transactions.
- Important financial and stock records are reversed or cancelled rather than silently deleted.
- Every stock-changing action creates an immutable stock-movement record.
- Server-side validation is authoritative; frontend validation is for usability only.
- Concurrent stock operations use database locking where required to prevent double-selling.

## Security baseline

- Secrets and environment-specific values belong in untracked `.env` files.
- Safe placeholder names belong in committed `.env.example` files.
- Passwords are handled only by Django's password hashing system.
- Permissions are enforced by the backend, not only hidden in the frontend.
- Production cookies, HTTPS, CORS, CSRF, trusted origins, and host settings are restricted by environment.
- Login and sensitive endpoints will be rate-limited.
- API errors must not expose secrets, stack traces, or private data in production.
- Inputs are validated and normalized before persistence.
- Audit logs record actor, action, target, and timestamp for sensitive changes.
- Dependencies will be pinned and checked before releases.
- Database backups and a restore procedure are required before production launch.

## Environment files

Expected local files, which must never be committed:

- `frontend/.env`
- `backend/.env`

Committed examples will contain variable names and non-secret placeholders only.

## Delivery approach

Work proceeds in small, testable milestones:

1. Project scaffolding and quality checks
2. Frontend shell, authentication screens, and dashboard
3. Frontend business modules using mock data
4. Django and PostgreSQL foundation
5. Backend modules and automated tests
6. API integration module by module
7. Security review, user acceptance testing, backup verification, and deployment

