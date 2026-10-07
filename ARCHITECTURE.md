# YuktiOS Architecture Blueprint

YuktiOS is a multi-agent AI Operating System engineered for Small and Medium Enterprises (SMEs).

---

## 1. High-Level System Topology

```
+-------------------------------------------------------------------------+
|                              REACT FRONTEND                             |
|  Executive Dashboard | AI Command Center | 6 Specialized Agent Views    |
+-------------------------------------------------------------------------+
                                     |
                                  HTTP REST
                                     v
+-------------------------------------------------------------------------+
|                             EXPRESS BACKEND                             |
|  Security Middleware | Session Cookie Auth | Role-Based Access Control |
+-------------------------------------------------------------------------+
          |                                                   |
          v                                                   v
+-----------------------+                           +-------------------+
| REPOSITORY DATA LAYER |                           | AI SERVICE ENGINE |
| Multi-Tenant Isolation|                           | Google Gemini AI  |
|  (data_store.json)    |                           | Context Minimizer |
+-----------------------+                           +-------------------+
          |                                                   |
          +-------------------------+-------------------------+
                                    |
                                    v
                        +-----------------------+
                        | ACTION EXECUTOR ENGINE|
                        | Validation & Audit Log|
                        +-----------------------+
```

---

## 2. Component Layers & Responsibilities

### Layer 1: Presentation (React UI)
- **Files**: `src/App.tsx`, `src/components/*`
- **Responsibilities**: Responsive dark/purple SME workspace, live agent feed, role switcher, POS quick sales modal, interactive Ask YuktiOS drawer.

### Layer 2: API & Gateway Server
- **Files**: `server.ts`
- **Responsibilities**: Express server, rate limiting, security headers (`X-Frame-Options`, `X-Content-Type-Options`), session cookie verification, REST route routing.

### Layer 3: Security & Multi-Tenant Data Layer
- **Files**: `src/server/data/DataStore.ts`, `src/server/data/repositories/*`
- **Responsibilities**: `data_store.json` disk persistence, `businessId` tenant isolation, PBKDF2 salted password hashing, repository CRUD.

### Layer 4: Multi-Agent AI Engine & Coordinator
- **Files**: `src/server/ai/AIService.ts`, `src/agents/*`
- **Responsibilities**: 6 specialized agents (Finance, Inventory, HR, Marketing, Support, Analytics), multi-agent routing, business context minimization, Google Gemini API integration.

### Layer 5: Action Executor Engine
- **Files**: `src/services/ActionExecutor.ts`, `src/services/AgentEventBus.ts`
- **Responsibilities**: Safe business action execution, duplicate prevention, event bus publish/subscribe, live audit stream logging.

---

## 3. Data Flow Example: Purchase Order Reorder

1. **Detection**: Inventory Agent detects SKU stock below reorder threshold.
2. **Recommendation**: YuktiOS Coordinator synthesizes purchase order recommendation.
3. **User Action**: User clicks **Execute Action** in UI modal.
4. **Execution**: Frontend calls `POST /api/actions/execute`.
5. **Security Check**: Server verifies session auth, `businessId`, and user role permission.
6. **Data Mutation**: `PurchaseOrderRepository.create()` updates purchase orders and stock quantities.
7. **Audit & Event**: Event logged to `activityRepository` and published over `AgentEventBus`.
