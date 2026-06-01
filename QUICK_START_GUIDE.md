# Quick Start Guide - Ticketing SaaS

## Prerequisites

- Node.js 18+ installed
- MongoDB 7.0+ with replica set configured
- Git installed

---

## 🚀 Setup Instructions

### 1. Clone and Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure MongoDB Replica Set

```bash
# Start MongoDB
brew services start mongodb-community@7.0

# Initialize replica set (one-time setup)
mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'127.0.0.1:27017'}]})"

# Verify replica set
mongosh --eval "rs.status()" | grep PRIMARY
# Should show: stateStr: 'PRIMARY'
```

### 3. Configure Backend Environment

Ensure `backend/.env` has correct values:

```bash
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/ticketing-saas?replicaSet=rs0
CORS_ORIGIN=http://localhost:5173
BACKEND_URL=http://localhost:5001
FRONTEND_URL=http://localhost:5173
MERCADOPAGO_ACCESS_TOKEN=your-token
MERCADOPAGO_WEBHOOK_SECRET=your-secret
```

---

## ▶️ Running the Application

**Terminal 1 - Backend:**
```bash
cd backend && npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend && npm run dev
```

**Open:** http://localhost:5173

---

## ✅ Verification

- Backend: http://localhost:5001/api-docs
- Frontend: http://localhost:5173
- Purchase flow: Select event → Buy tickets → Redirect to MercadoPago ✅

**Full documentation:** See `MERCADOPAGO_FIX_COMPLETE.md`
