# HyperCore Apex Logistics (HAL)

> **Enterprise-grade Business Resource Management (BRM) Suite**  
> A high-density operations Command Center unifying real-time fleet telemetry, warehouse logistics, team management, and a cryptographically secured audit ledger — built on a Hybrid Data Architecture.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
   - [Hybrid Data Architecture](#21-hybrid-data-architecture)
   - [Repository Pattern](#22-repository-pattern)
   - [Role-Based Access Control (RBAC)](#23-role-based-access-control-rbac)
3. [Tech Stack](#3-tech-stack)
4. [Module Reference](#4-module-reference)
5. [Security — Immutable Audit Ledger](#5-security--immutable-audit-ledger)
6. [Project Structure](#6-project-structure)
7. [Environment Variables](#7-environment-variables)
8. [Getting Started](#8-getting-started)
9. [Seeding Demo Data](#9-seeding-demo-data)
10. [Firebase RTDB Setup](#10-firebase-rtdb-setup)
11. [API Reference](#11-api-reference)
12. [Deployment](#12-deployment)

---

## 1. Project Overview

HyperCore Apex Logistics (HAL) solves the fragmentation problem in large-scale industrial operations by unifying disparate data streams into a single **Command Center** interface. Rather than operators switching between five different tools to check fleet positions, bay occupancy, task queues, inventory levels, and staff roles — HAL consolidates everything into one authenticated, role-gated, real-time dashboard.

### Core Business Value

| Problem | HAL Solution |
|---|---|
| Real-time data needs instant updates | Firebase RTDB with WebSocket push — zero polling |
| Static corporate data needs relational integrity | Neon PostgreSQL with Prisma ORM |
| Custom schemas per enterprise client | Schema Forge → MongoDB Atlas document store |
| No audit trail for compliance | Immutable SHA-256 hash-chained Audit Ledger |
| Different staff need different access | 4-tier RBAC enforced at middleware + API level |

---

## 2. Architecture

### 2.1 Hybrid Data Architecture

HAL uses **three distinct databases**, each chosen for the specific nature of the data it holds:

```
┌─────────────────────────────────────────────────────────────────┐
│                     HAL COMMAND CENTER (Next.js 14)             │
├──────────────────┬──────────────────────┬───────────────────────┤
│   Firebase RTDB  │  Neon PostgreSQL      │   MongoDB Atlas       │
│   (Real-Time)    │  (Relational/Static)  │   (Flexible Schemas)  │
├──────────────────┼──────────────────────┼───────────────────────┤
│ • Fleet GPS      │ • Users + RBAC        │ • Schema Forge defs   │
│ • Bay Occupancy  │ • Inventory items     │ • Custom enterprise   │
│ • Task Queue     │ • Audit Ledger        │   schemas (NoSQL)     │
│ • Live Events    │ • Session tokens      │                       │
│                  │                       │                       │
│ WebSocket push   │ Prisma ORM queries    │ Mongoose ODM          │
│ < 50ms latency   │ ACID transactions     │ Flexible documents    │
└──────────────────┴──────────────────────┴───────────────────────┘
```

#### Why this split?

- **Firebase RTDB** excels at sub-second pub/sub — perfect for GPS coordinates updating every 5 seconds and bay status toggling in real time. Persisting these to PostgreSQL would create polling overhead and write amplification.
- **Neon PostgreSQL** provides the ACID guarantees needed for financial-grade records: who has what role, how much stock exists, and the tamper-proof audit ledger.
- **MongoDB Atlas** allows Schema Forge to store arbitrary user-defined schemas without requiring a database migration every time an admin adds a new field type.

### 2.2 Repository Pattern

All database access flows through a strict **Repository Pattern**. The UI components never import database clients directly — they only import typed interfaces.

```
src/lib/repositories/
├── interfaces/               ← TypeScript contracts (what)
│   ├── IFleetRepository.ts
│   ├── IBayRepository.ts
│   ├── ITaskRepository.ts
│   ├── IUserRepository.ts
│   ├── IInventoryRepository.ts
│   └── IAuditRepository.ts
├── firebase/                 ← Firebase implementations (how)
│   ├── FirebaseFleetRepository.ts
│   ├── FirebaseBayRepository.ts
│   └── FirebaseTaskRepository.ts
└── postgres/                 ← PostgreSQL implementations (how)
    ├── PostgresUserRepository.ts
    └── PostgresInventoryRepository.ts
```

**Benefit:** Swap PostgreSQL for MySQL, or Firebase for Supabase Realtime — the UI doesn't change. Only the implementation files change.

### 2.3 Role-Based Access Control (RBAC)

Four roles form a strict permission hierarchy:

```
SUPER_ADMIN
    │  Full system access: create schemas, manage all users,
    │  view audit ledger, assign fleet, modify inventory
    ▼
FLEET_MANAGER
    │  Fleet dispatch + loading bays + task management
    │  Read-only: inventory, team, audit
    ▼
WAREHOUSE_OPS
    │  Inventory management + loading bay status updates
    │  Read-only: fleet (no dispatch), team
    ▼
VIEWER
       Read-only access to all dashboards. No mutations.
```

RBAC is enforced at **three layers**:
1. **Middleware** (`src/middleware.ts`) — redirects unauthenticated requests before the page renders
2. **API Routes** — each endpoint checks `session.user.role` against allowed roles
3. **UI** — action buttons/forms conditionally render based on role

---

## 3. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | SSR, API routes, file-based routing |
| **Language** | TypeScript 5 | Type safety across the full stack |
| **Styling** | Tailwind CSS | Utility-first dark theme |
| **UI Components** | NextUI v2 | Tables, Modals, Chips, Selects |
| **Charts** | Tremor v3 | Area charts, metrics, data viz |
| **Maps** | Leaflet + React-Leaflet | GPS fleet map (OpenStreetMap tiles) |
| **Auth** | NextAuth.js v5 (beta) | JWT sessions, credentials provider |
| **Passwords** | bcryptjs | Password hashing (cost factor 12) |
| **Real-time DB** | Firebase Realtime Database | WebSocket fleet/bay/task sync |
| **Relational DB** | Neon PostgreSQL | Users, inventory, audit ledger |
| **ORM** | Prisma 6 | Type-safe PostgreSQL queries |
| **Document DB** | MongoDB Atlas | Schema Forge definitions |
| **ODM** | Mongoose | MongoDB model definitions |
| **Date utilities** | date-fns | Relative timestamps in audit ledger |
| **Toast notifications** | react-hot-toast | Success/error feedback |
| **Icons** | Lucide React | 400+ consistent SVG icons |

---

## 4. Module Reference

### Command Center (`/dashboard`)

The main operational overview dashboard. Pulls simultaneously from Firebase (fleet, bays, tasks) and renders:

- **KPI Stat Cards** — Fleet Online, Bay Occupancy, Active Tasks, Critical Alerts — all updating in real-time via Firebase WebSocket subscriptions.
- **Operations Throughput Chart** — 24-hour area chart (Tremor) showing Deliveries, Pickups, and Loads over simulated time series data.
- **Fleet Status Panel** — Live list of all vehicles with status badges (ONLINE/EN_ROUTE/IDLE/OFFLINE), assigned driver, last GPS coordinates, and a link to the full dispatcher.
- **Loading Bay Grid Mini** — Compact top-level view of all docks grouped by zone with colour-coded occupancy.
- **Task Feed** — Scrollable real-time queue of pending/active/critical dispatch tasks.

### Fleet Dispatcher (`/dashboard/fleet`)

Full-screen operational map + task assignment module:

- **Leaflet GPS Map** — OpenStreetMap base tiles with vehicle markers. Markers are colour-coded: green (IDLE), amber (EN_ROUTE), cyan (ONLINE), red (OFFLINE). Clicking a marker opens a popup with full vehicle telemetry.
- **Vehicle Assignment Modal** — Select any vehicle, choose an unassigned pending task from the dropdown, and dispatch with one click. Firebase RTDB updates instantly and all connected clients see the change.
- **Seed Demo Data button** — Populates Firebase with 8 sample vehicles across Sydney coordinates.

### Loading Bays (`/dashboard/loading-bays`)

Full grid view of all 12 loading docks across three zones:

- **Zone A (Receiving)** — Bays 1–4
- **Zone B (Dispatch)** — Bays 5–8  
- **Zone C (Overflow/Hazmat)** — Bays 9–12

Each cell shows bay ID, current status, assigned vehicle (if occupied), and a button to update status. Status changes write instantly to Firebase RTDB.

**Bay Statuses:** `AVAILABLE` (green) • `OCCUPIED` (red) • `MAINTENANCE` (amber) • `RESERVED` (blue)

### Warehouse Inventory (`/dashboard/inventory`)

Full SKU management system backed by PostgreSQL:

- **Inventory Table** — SKU, item name, category, warehouse zone, stock level progress bar, weight/unit, and status badge (LOW STOCK / OK).
- **Low Stock Alerts** — Automated banner when any item falls at or below its `minStock` threshold.
- **Search & Filter** — Live search across SKU, name, and category.
- **Add Item Modal** — Full form with SKU, name, category, unit, quantities, weight, and zone selector.
- **Load Sample Data** — Seeds 8 realistic industrial inventory items across all zones.

### Team Management (`/dashboard/team`)

RBAC administration panel:

- **Team Table** — Avatar, name, email, department, role badge, active status, join date, and inline role selector.
- **Inline Role Change** — Dropdown directly in the table row. Changes are written to PostgreSQL and logged to the Audit Ledger immediately.
- **Add Member Modal** — Create new user accounts with bcrypt-hashed passwords. Role assigned at creation.
- **Role Summary Cards** — Top-level count of members per role across the 4-tier hierarchy.

### Schema Forge (`/dashboard/schema-forge`)

Proprietary database schema provisioning engine:

- **Visual Field Builder** — Dynamically add fields with name, data type (Text, Integer, Float, Boolean, Date, UUID, JSON), and required flag.
- **Live SQL Preview** — As you build fields, a `CREATE TABLE` SQL statement generates in real-time in the preview pane.
- **Live MongoDB Preview** — Simultaneously generates a Mongoose schema definition.
- **Provision Schema** — Saves the schema definition to MongoDB Atlas. Each schema is stored as a document with full field definitions, enabling future dynamic form generation.
- **Saved Schemas List** — All previously created schemas displayed as cards with field counts.

### Audit Ledger (`/dashboard/audit`)

Immutable cryptographic compliance trail:

- **Event Log Table** — Sequence number, timestamp, actor (name + role), action string, entity type + name, hash preview.
- **Chain Integrity Verification** — "Verify Chain" button hits the `/api/audit/verify` endpoint which re-computes the entire hash chain server-side and reports any tampering.
- **Stats** — Total entry count, algorithm (SHA-256), compliance mode (INSERT-ONLY).

---

## 5. Security — Immutable Audit Ledger

Every system mutation is cryptographically logged. The ledger is **append-only** — there are no UPDATE or DELETE operations on the `audit_ledger` table.

### Hash Chain Algorithm

```
Entry N hash = SHA-256(
  timestamp_N + actorId_N + action_N + entityId_N + previousHash_(N-1)
)
```

The first entry uses `""` (empty string) as `previousHash`. Every subsequent entry chains off the previous entry's hash, making it mathematically impossible to silently modify or delete any historical record without breaking every subsequent hash.

### Tamper Detection

`POST /api/audit/verify` fetches all entries ordered by sequence, re-computes each hash from source data, and compares to the stored hash. If any entry has been modified, the sequence number of the first broken link is returned.

### Events Logged

| Event | Trigger |
|---|---|
| `USER_CREATED` | New team member added |
| `ROLE_CHANGED` | User role updated |
| `SCHEMA_CREATED` | Schema Forge provisions new schema |
| `INVENTORY_CREATED` | New inventory item added |
| `VEHICLE_ASSIGNED` | Fleet dispatcher assigns vehicle to task |
| `VEHICLE_UNASSIGNED` | Vehicle released from task |
| `SYSTEM_INIT` | Admin account seeded |
| `BAY_STATUS_CHANGED` | Loading bay status updated |

---

## 6. Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── audit/              GET (list) + POST /verify (integrity check)
│   │   ├── auth/[...nextauth]  NextAuth.js handler
│   │   ├── inventory/          GET (list) + POST (create)
│   │   ├── schema-forge/       GET (list) + POST (provision)
│   │   ├── seed/               POST (seed demo data)
│   │   └── users/
│   │       ├── route.ts        GET (list) + POST (create)
│   │       └── [id]/role/      PATCH (change role)
│   ├── dashboard/
│   │   ├── page.tsx            Command Center
│   │   ├── fleet/              Fleet Dispatcher + Leaflet map
│   │   ├── loading-bays/       Bay grid management
│   │   ├── inventory/          Warehouse stock management
│   │   ├── team/               RBAC team management
│   │   ├── schema-forge/       Schema provisioning engine
│   │   └── audit/              Immutable audit ledger
│   ├── login/                  Auth page
│   ├── layout.tsx              Root layout (Providers, dark theme)
│   ├── page.tsx                Redirect → /dashboard
│   ├── providers.tsx           NextUI + ReactQuery + SessionProvider
│   └── globals.css             Tailwind base + HAL design tokens
│
├── components/
│   ├── dashboard/
│   │   ├── CommandCenter.tsx   Main dashboard orchestrator
│   │   ├── StatCard.tsx        KPI metric card
│   │   ├── OperationsChart.tsx Tremor area chart
│   │   ├── FleetStatusPanel.tsx Vehicle list widget
│   │   ├── BayGridMini.tsx     Bay occupancy mini-grid
│   │   └── TaskFeed.tsx        Live task queue feed
│   ├── fleet/
│   │   └── FleetMap.tsx        Leaflet map (dynamic import, SSR-safe)
│   └── layout/
│       ├── Sidebar.tsx         Navigation sidebar with active state
│       └── TopBar.tsx          Top header bar with user session info
│
├── hooks/
│   ├── useFleet.ts             Firebase fleet subscription hook
│   ├── useBays.ts              Firebase bays subscription hook
│   └── useTasks.ts             Firebase tasks subscription hook
│
├── lib/
│   ├── audit/
│   │   └── ledger.ts           SHA-256 hash chain write function
│   ├── auth/
│   │   ├── auth.ts             NextAuth.js config + Prisma adapter
│   │   ├── config.ts           Auth options (credentials provider)
│   │   └── rbac.ts             Role hierarchy + permission checks
│   ├── firebase/
│   │   ├── client.ts           Firebase app + RTDB initialisation
│   │   └── seed.ts             Firebase demo data seeder
│   ├── mongodb/
│   │   ├── client.ts           Mongoose connection singleton
│   │   └── models/
│   │       └── CustomSchema.ts Mongoose schema model
│   ├── prisma/
│   │   └── client.ts           Prisma client singleton
│   └── repositories/
│       ├── interfaces/         TypeScript repository interfaces
│       ├── firebase/           Firebase RTDB implementations
│       └── postgres/           Neon PostgreSQL implementations
│
├── middleware.ts               Route protection (NextAuth + RBAC)
└── types/
    └── index.ts                Shared TypeScript types
```

---

## 7. Environment Variables

Create `.env.local` in the project root:

```bash
# ── NextAuth ──────────────────────────────────────────
NEXTAUTH_SECRET=your-32-char-random-secret
NEXTAUTH_URL=http://localhost:3000

# ── Neon PostgreSQL ───────────────────────────────────
DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require

# ── Firebase Config (client-side) ─────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.region.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# ── MongoDB Atlas ─────────────────────────────────────
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/hal_db?retryWrites=true&w=majority
```

> **Never commit `.env.local` to version control.** The `.gitignore` already excludes it.

---

## 8. Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** 9+
- Firebase project with Realtime Database enabled
- Neon (or any PostgreSQL) database
- MongoDB Atlas cluster

### Installation

```powershell
# Clone the repository
git clone https://github.com/abdurrehman722/HyperCore-Apex-Logistics-HAL-.git
cd HyperCore-Apex-Logistics-HAL-

# Install dependencies
npm install

# Configure environment variables
# Copy the template above into .env.local and fill in your credentials

# Push Prisma schema to your PostgreSQL database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Start the development server
npm run dev
```

The application will be available at **http://localhost:3000**

### First Login

The default admin account must be seeded before first use:

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/seed" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"type":"admin"}' `
  -UseBasicParsing
```

Then log in with:

| Field | Value |
|---|---|
| **Email** | `admin@hal.corp` |
| **Password** | `admin123` |

---

## 9. Seeding Demo Data

The `/api/seed` endpoint supports three seed types:

### Seed Admin User (PostgreSQL)
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/seed" `
  -Method POST -ContentType "application/json" `
  -Body '{"type":"admin"}' -UseBasicParsing
```

### Seed Firebase Real-Time Data (Fleet + Bays + Tasks)
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/seed" `
  -Method POST -ContentType "application/json" `
  -Body '{"type":"firebase"}' -UseBasicParsing
```

This seeds:
- **8 vehicles** across Sydney coordinates (trucks, vans, utes) with statuses IDLE/EN_ROUTE/ONLINE
- **12 loading bays** in Zones A/B/C with mixed AVAILABLE/OCCUPIED/MAINTENANCE statuses
- **6 dispatch tasks** (PENDING, ACTIVE, CRITICAL priority)

### Seed Inventory (PostgreSQL)
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/seed" `
  -Method POST -ContentType "application/json" `
  -Body '{"type":"inventory"}' -UseBasicParsing
```

Seeds 8 industrial inventory items across all warehouse zones, including some deliberately at low-stock levels to trigger alerts.

---

## 10. Firebase RTDB Setup

### Enable Realtime Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use an existing one)
3. Navigate to **Build → Realtime Database**
4. Click **Create Database** → choose your region → **Start in test mode**

### Update Security Rules

By default Firebase rules deny all access. For development, set open rules:

1. In Firebase Console → **Realtime Database → Rules**
2. Replace with:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

3. Click **Publish**

> **Production rules** should authenticate using Firebase Auth UID and restrict writes to specific paths. Example production rule:
> ```json
> {
>   "rules": {
>     "fleet": {
>       ".read": "auth != null",
>       ".write": "auth != null && auth.token.role === 'FLEET_MANAGER'"
>     }
>   }
> }
> ```

### Get Firebase Config

1. Firebase Console → Project Settings (gear icon) → **General tab**
2. Scroll to **Your apps** → click the web app (or create one)
3. Copy the `firebaseConfig` object values into your `.env.local`

---

## 11. API Reference

All API routes require an authenticated session (NextAuth JWT cookie) except the seed endpoint.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/auth/session` | Get current session |
| `POST` | `/api/auth/callback/credentials` | Sign in with email/password |
| `POST` | `/api/auth/signout` | Sign out |

### Users & RBAC

| Method | Endpoint | Required Role | Description |
|---|---|---|---|
| `GET` | `/api/users` | FLEET_MANAGER+ | List all users |
| `POST` | `/api/users` | SUPER_ADMIN | Create new user |
| `PATCH` | `/api/users/:id/role` | SUPER_ADMIN | Update user role |

### Inventory

| Method | Endpoint | Required Role | Description |
|---|---|---|---|
| `GET` | `/api/inventory` | Any authenticated | List all items |
| `POST` | `/api/inventory` | WAREHOUSE_OPS+ | Create inventory item |

### Schema Forge

| Method | Endpoint | Required Role | Description |
|---|---|---|---|
| `GET` | `/api/schema-forge` | Any authenticated | List custom schemas |
| `POST` | `/api/schema-forge` | SUPER_ADMIN | Provision new schema |

### Audit Ledger

| Method | Endpoint | Required Role | Description |
|---|---|---|---|
| `GET` | `/api/audit` | Any authenticated | List audit entries (paginated) |
| `POST` | `/api/audit/verify` | SUPER_ADMIN | Verify full hash chain integrity |

### Seed

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/api/seed` | `{"type":"admin"}` | Create default admin user |
| `POST` | `/api/seed` | `{"type":"firebase"}` | Seed Firebase RTDB with demo data |
| `POST` | `/api/seed` | `{"type":"inventory"}` | Seed PostgreSQL inventory items |

---

## 12. Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# Settings → Environment Variables → add all from .env.local
```

> **Important:** After deployment, run the seed endpoints against your production URL to initialise the admin user.

### Production Checklist

- [ ] Replace Firebase RTDB rules with authenticated, role-based rules
- [ ] Rotate `NEXTAUTH_SECRET` to a cryptographically random 32+ character string
- [ ] Enable Neon connection pooling for production traffic
- [ ] Set `NEXTAUTH_URL` to your production domain
- [ ] Enable MongoDB Atlas IP allowlist for production server IPs only
- [ ] Change admin password after first login
- [ ] Review and tighten PostgreSQL `audit_ledger` table permissions (allow INSERT only)

---

## Database Schema (PostgreSQL)

```sql
-- Users table (RBAC)
CREATE TABLE users (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,              -- bcrypt hash
  role        Role DEFAULT 'VIEWER',      -- SUPER_ADMIN | FLEET_MANAGER | WAREHOUSE_OPS | VIEWER
  department  TEXT,
  avatar_url  TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP
);

-- Inventory items
CREATE TABLE inventory_items (
  id              TEXT PRIMARY KEY,
  sku             TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  category        TEXT NOT NULL,
  quantity        INTEGER NOT NULL DEFAULT 0,
  unit            TEXT DEFAULT 'units',
  warehouse_zone  TEXT NOT NULL,
  min_stock       INTEGER DEFAULT 10,
  max_stock       INTEGER DEFAULT 1000,
  unit_weight     FLOAT DEFAULT 1.0,     -- kg
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP
);

-- Immutable audit ledger
CREATE TABLE audit_ledger (
  id           TEXT PRIMARY KEY,
  sequence     SERIAL,                   -- auto-incrementing, never reset
  actor_id     TEXT NOT NULL,
  actor_name   TEXT NOT NULL,
  actor_role   TEXT NOT NULL,
  action       TEXT NOT NULL,
  entity_type  TEXT NOT NULL,
  entity_id    TEXT,
  entity_name  TEXT,
  metadata     JSONB,
  ip_address   TEXT,
  hash         TEXT NOT NULL,            -- SHA-256 of this entry
  previous_hash TEXT NOT NULL,           -- SHA-256 of previous entry
  timestamp    TIMESTAMP DEFAULT NOW()
  -- NO UPDATE or DELETE permissions should be granted on this table
);
```

---

## Firebase RTDB Data Structure

```json
{
  "fleet": {
    "vehicle-id": {
      "id": "HAL-TRK-001",
      "name": "Truck Alpha",
      "type": "HEAVY_TRUCK",
      "status": "EN_ROUTE",
      "driver": "Marcus Chen",
      "lat": -33.8688,
      "lng": 151.2093,
      "speed": 62,
      "fuel": 78,
      "assignedTaskId": "task-id",
      "lastUpdate": 1711234567890
    }
  },
  "bays": {
    "bay-id": {
      "id": "BAY-A01",
      "zone": "A",
      "bayNumber": 1,
      "status": "OCCUPIED",
      "vehicleId": "vehicle-id",
      "lastUpdate": 1711234567890
    }
  },
  "tasks": {
    "task-id": {
      "id": "task-id",
      "title": "Deliver to Warehouse C",
      "status": "PENDING",
      "priority": "HIGH",
      "assignedVehicleId": null,
      "origin": "Warehouse A",
      "destination": "Warehouse C",
      "createdAt": 1711234567890
    }
  }
}
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes with appropriate TypeScript types
4. Ensure all repository implementations satisfy their interface contracts
5. Test RBAC: verify each role only accesses what it should
6. Submit a pull request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built with ❤️ as a demonstration of enterprise-grade BRM architecture combining real-time data streams, cryptographic security, and multi-database hybrid patterns.*
