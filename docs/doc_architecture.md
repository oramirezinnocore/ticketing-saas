# Ticketing SaaS Architecture

## Purpose

This document defines the architecture for the Ticketing SaaS system.

It is the single source of truth for:
- module structure
- system boundaries
- responsibilities
- API design decisions

---

## Tech Stack

- Backend: Node.js (Express + TypeScript)
- Database: MongoDB (Mongoose)
- Auth: JWT
- Payments: MercadoPago
- Frontend: React
- Admin: React (separate app)

---

## Project Structure

backend/src/

- config/ → environment, DB connection
- modules/
  - auth/
  - users/
  - events/
  - tickets/
  - orders/
  - payments/
- middlewares/
- utils/
- app.ts
- server.ts

---

## Module Responsibilities

### auth
- register
- login
- JWT validation

### users
- user profile
- roles (user, organizer, admin)

### events
- create event
- manage dates
- ticket types

### tickets
- generate tickets
- QR code generation
- ticket validation

### orders
- create order
- manage purchases
- status tracking

### payments
- integrate MercadoPago
- handle payment status
- confirm transactions

---

## API Design

All endpoints follow:

/api/v1/{module}

Examples:

- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET /api/v1/events
- POST /api/v1/orders

---

## Security Rules

- JWT required for protected routes
- QR must be signed (not predictable)
- Validate all inputs
- Prevent duplicate ticket validation

---

## Data Flow (Simplified)

1. User selects event
2. Creates order
3. Payment processed
4. Tickets generated
5. QR assigned
6. Ticket validated at entry

---

## Out of Scope (MVP)

- seat maps
- dynamic pricing AI
- resale marketplace