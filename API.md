# YuktiOS REST API Reference

All API routes are served from the backend Express server on `http://localhost:3000`.

---

## Authentication Endpoints

### `POST /api/auth/register`
Create a new Business organization and Owner account.
- **Request Body**: `{ businessName, industry, ownerName, email, password }`
- **Response**: `{ success: true, user: PublicUserInfo, sessionToken }`

### `POST /api/auth/login`
Authenticate an existing user.
- **Request Body**: `{ email, password }`
- **Response**: `{ success: true, user: PublicUserInfo, sessionToken }`

### `POST /api/auth/logout`
Invalidate current session token and clear HTTP-only cookie.
- **Response**: `{ success: true, message: "Logged out successfully" }`

### `GET /api/auth/me`
Fetch current authenticated user profile and tenant metadata.
- **Response**: `{ authenticated: true, user: PublicUserInfo }`

---

## Data & System State Endpoints

### `GET /api/state`
Returns tenant-isolated system state slice.

### `GET /api/inventory`
List all inventory SKUs for authenticated tenant.

### `GET /api/purchase-orders`
List all purchase orders for authenticated tenant.

### `GET /api/employees`
List employee staff records for authenticated tenant.

### `GET /api/invoices`
List billing invoices for authenticated tenant.

### `GET /api/customers`
List customer RFM segments for authenticated tenant.

### `GET /api/tickets`
List support tickets for authenticated tenant.

### `GET /api/activities`
List activity stream logs for authenticated tenant.

---

## AI & Action Execution Endpoints

### `POST /api/ai/ask`
Query the Ask YuktiOS Multi-Agent Copilot.
- **Request Body**: `{ message: string }`
- **Response**: `AskYuktiOSAIResponse` (structured JSON with `answer`, `insights`, `agentsConsulted`, `recommendation`).

### `POST /api/actions/execute`
Execute an AI-recommended business action.
- **Request Body**: `{ actionType: string, payload: ActionPayload }`
- **Response**: `{ result: ActionResult, updatedState: SystemState }`

### `POST /api/data/reset`
Reset persistent datastore back to baseline seed data.
