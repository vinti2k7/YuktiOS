# YuktiOS Security Policy & Architecture Blueprint

## 1. Authentication & Password Protection
- **Salted Hashing**: Passwords are never stored in plaintext. Passwords are salted with 16 random bytes and hashed using PBKDF2 with SHA-512 (10,000 iterations).
- **HTTP-Only Cookies**: Authentication session tokens are stored in `yuktios_session` HTTP-only cookies to prevent XSS script theft. Secrets are never exposed to `localStorage`.

---

## 2. Server-Enforced Tenant Isolation
- **Strict Session Context**: Backend APIs extract `user.businessId` directly from the authenticated session (`getAuthenticatedUser(req)`).
- **No Client Parameter Trust**: `businessId` parameters from request bodies or URL parameters are strictly ignored or validated against the user session to prevent cross-tenant data leaks.
- **Query Scoping**: All domain repositories (`inventory`, `purchaseOrder`, `invoice`, `customer`, `employee`, `ticket`, `activity`) scope database queries using `businessId`.

---

## 3. Role-Based Access Control (RBAC)
- **Role Hierarchy**: `OWNER` > `ADMIN` > `MANAGER` > `EMPLOYEE`.
- **Sensitive Action Authorization**: Consequential actions like `RUN_PAYROLL` are restricted server-side (`POST /api/actions/execute`). Users with `employee` role receive HTTP 403 Forbidden.

---

## 4. AI Security & Prompt Injection Protection
- **Server-Side API Keys**: `GEMINI_API_KEY` exists exclusively in server-side environment variables and is never transmitted to client JavaScript.
- **Context Minimization**: AI queries construct compact business context scoped strictly to the current tenant (`businessId`).
- **Prompt Injection Filtering**: User queries are sanitized to strip malicious instructions (`ignore previous instructions`, `override system prompt`, `reveal api keys`).

---

## 5. Defense-in-Depth Features
- **Rate Limiting**:
  - `POST /api/auth/login`: Restricted to 5 requests / min per IP.
  - `POST /api/ai/ask`: Restricted to 10 requests / min per user/IP.
- **Security Headers**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-XSS-Protection: 1; mode=block`
- **Duplicate Prevention (Idempotency)**: Server tracks execution timestamps to reject duplicate action triggers within a 30-second window.
