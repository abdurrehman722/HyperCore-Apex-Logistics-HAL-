# HAL Assumptions Log

## [BATCH 1 - 2026-03-22] Project Setup & Architecture

### Tech Stack Decisions
- Next.js 14 App Router (not Pages Router)
- NextUI v2 for interactive components (Modals, Tables, Dropdowns, Cards)
- Tremor v3 for analytics/data viz (Charts, Metrics, Trackers)
- Both use Tailwind CSS - configured to include both in content array
- framer-motion required by NextUI

### Database Architecture
- Firebase RTDB: Real-time data only (fleet GPS, bay occupancy, task events)
  - Project: hypercore-apex-logistics
  - Region: asia-southeast1 (Singapore)
  - RTDB URL: https://hypercore-apex-logistics-default-rtdb.asia-southeast1.firebasedatabase.app
- PostgreSQL (Neon): Static/relational data (employees, inventory, audit ledger, RBAC)
  - Host: ep-small-sound-a1qe9mcc-pooler.ap-southeast-1.aws.neon.tech
  - DB: neondb
- MongoDB Atlas: Schema Forge custom schemas, flexible document store
  - Cluster: hal-cluster.arop5kx.mongodb.net
  - DB: hal_db

### Auth Strategy
- NextAuth v5 (beta) with credentials provider
- Session strategy: JWT
- RBAC roles stored in PostgreSQL User table
- Roles: SUPER_ADMIN, FLEET_MANAGER, WAREHOUSE_OPS, VIEWER

### Repository Pattern
- Each domain has an interface in /lib/repositories/interfaces/
- Firebase impl in /lib/repositories/firebase/
- Postgres impl in /lib/repositories/postgres/
- MongoDB impl in /lib/repositories/mongodb/
- UI only imports interfaces, never concrete implementations

### Audit Ledger
- SHA-256 hash chain: hash = SHA256(timestamp + actorId + action + prevHash)
- Stored in PostgreSQL AuditLedger table
- INSERT-only (no UPDATE/DELETE on this table)
- First entry uses hash of empty string as prevHash

### create-next-app issue
- Failed due to capital letters in directory name "HyperCore-Apex-Logistics-HAL-"
- Resolved by manually creating project structure files
- package.json name set to lowercase "hypercore-apex-logistics"

### UI Theme
- Dark theme enforced globally (class="dark" on html)
- Color palette: hal-dark (#0a0e1a), hal-card (#0f1629), hal-accent (#00d4ff cyan)
- High-density dashboard layout: sidebar nav + main content area
- Font: system + JetBrains Mono for data/code displays

### NextUI ThemeProvider
- Wraps entire app in providers.tsx client component
- Theme: "dark" forced via attribute
- Leaflet CSS must be imported in loading-bay/fleet pages (SSR issue with leaflet)

## [BATCH 2 - To be filled as build progresses]
