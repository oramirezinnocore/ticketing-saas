# MongoDB Replica Set - Complete Fix Guide

## 🔴 ROOT CAUSE IDENTIFIED

**Error:** "Transaction numbers are only allowed on a replica set member or mongos"

**Actual Problem:**
1. ✅ MongoDB is running (process found)
2. ❌ MongoDB running in **standalone mode** (not replica set)
3. ❌ `.env` uses `mongodb://localhost:27017/ticketing-saas` (no `replicaSet` parameter)
4. ❌ `rs.status()` returns: "MongoServerError: not running with --replSet"

**Current MongoDB Process:**
```
/opt/homebrew/opt/mongodb-community@7.0/bin/mongod --config /opt/homebrew/etc/mongod.conf
```

**Config file (`/opt/homebrew/etc/mongod.conf`):**
```yaml
systemLog:
  destination: file
  path: /opt/homebrew/var/log/mongodb/mongo.log
  logAppend: true
storage:
  dbPath: /opt/homebrew/var/mongodb
net:
  bindIp: 127.0.0.1, ::1
  ipv6: true
# ❌ MISSING: replication section
```

**Transactions require replica set mode. Current standalone mode does NOT support transactions.**

---

## 🚀 COMPLETE FIX (Mac Development)

### Step 1: Stop Current MongoDB

```bash
# Stop homebrew service
brew services stop mongodb-community@7.0

# Verify stopped
ps aux | grep mongod
```

### Step 2: Update MongoDB Config

**Edit:** `/opt/homebrew/etc/mongod.conf`

```bash
nano /opt/homebrew/etc/mongod.conf
```

**Add this section at the end:**

```yaml
replication:
  replSetName: rs0
```

**Complete config should look like:**

```yaml
systemLog:
  destination: file
  path: /opt/homebrew/var/log/mongodb/mongo.log
  logAppend: true
storage:
  dbPath: /opt/homebrew/var/mongodb
net:
  bindIp: 127.0.0.1, ::1
  ipv6: true
replication:
  replSetName: rs0
```

**Save and exit** (Ctrl+O, Enter, Ctrl+X)

### Step 3: Start MongoDB in Replica Set Mode

```bash
# Start with homebrew (uses updated config)
brew services start mongodb-community@7.0

# Wait 3 seconds for startup
sleep 3

# Verify running
ps aux | grep mongod | grep -v grep
```

**Expected:** Process should now include `--replSet rs0` in arguments

### Step 4: Initialize Replica Set

```bash
mongosh --eval "rs.initiate({
  _id: 'rs0',
  members: [
    { _id: 0, host: '127.0.0.1:27017' }
  ]
})"
```

**Expected output:**
```javascript
{
  ok: 1,
  '$clusterTime': {...},
  operationTime: Timestamp(...)
}
```

**Wait 5 seconds for initialization:**
```bash
sleep 5
```

### Step 5: Verify Replica Set

```bash
mongosh --eval "rs.status()"
```

**Expected output (key parts):**
```javascript
{
  set: 'rs0',
  myState: 1,
  members: [
    {
      _id: 0,
      name: '127.0.0.1:27017',
      health: 1,
      state: 1,
      stateStr: 'PRIMARY',
      ...
    }
  ],
  ok: 1
}
```

**✅ Look for:**
- `set: 'rs0'` - Replica set name
- `stateStr: 'PRIMARY'` - Node is primary
- `ok: 1` - Success

### Step 6: Update Backend .env

**File:** `backend/.env`

**Change:**
```bash
# ❌ OLD (causes transaction error)
MONGODB_URI=mongodb://localhost:27017/ticketing-saas

# ✅ NEW (enables transactions)
MONGODB_URI=mongodb://127.0.0.1:27017/ticketing-saas?replicaSet=rs0
```

**IMPORTANT Notes:**
- Use `127.0.0.1` instead of `localhost` for better replica set connection
- MUST include `?replicaSet=rs0` parameter
- Replica set name MUST match what you initialized (rs0)

**Complete updated .env:**
```bash
# Server Configuration
NODE_ENV=development
PORT=5001

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/ticketing-saas?replicaSet=rs0
MONGODB_TEST_URI=mongodb://127.0.0.1:27017/ticketing-saas-test?replicaSet=rs0

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1d

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=your-mercadopago-access-token
MERCADOPAGO_WEBHOOK_SECRET=your-webhook-secret-for-signature-verification

# URLs
BACKEND_URL=http://localhost:5001
FRONTEND_URL=http://localhost:3000
```

### Step 7: Start Backend

```bash
cd backend
npm run dev
```

**Look for these logs:**

```
[INFO] Connecting to MongoDB...
[INFO] MongoDB connected successfully
  database: "ticketing-saas"
  host: "127.0.0.1:27017"
[INFO] MongoDB replica set detected
  setName: "rs0"
  primary: "127.0.0.1:27017"
  hosts: ["127.0.0.1:27017"]
  transactionsSupported: true
[INFO] Transaction support validated successfully
[INFO] ✓ MongoDB transactions are fully supported
```

---

## ✅ VERIFICATION COMMANDS

### 1. Check MongoDB Process

```bash
ps aux | grep mongod | grep -v grep
```

**Should include:** `--replSet rs0` or use config with replication section

### 2. Check Replica Set Status

```bash
mongosh --eval "rs.status()" | grep -E "(set|stateStr|ok)"
```

**Expected:**
```javascript
set: 'rs0',
stateStr: 'PRIMARY',
ok: 1
```

### 3. Test Transaction Support

```bash
mongosh --eval "
  session = db.getMongo().startSession();
  session.startTransaction();
  session.getDatabase('test').dummy.insertOne({test: 1});
  session.commitTransaction();
  session.endSession();
  print('✅ Transactions work!');
"
```

**Expected:** `✅ Transactions work!`

### 4. Check Backend Connection

```bash
cd backend
npm run dev
```

**Look for:** `✓ MongoDB transactions are fully supported`

### 5. Test Order Creation

```bash
# Start backend, then test with curl
curl -X POST http://localhost:5001/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "eventId": "...",
    "tickets": [
      {"ticketType": "General", "quantity": 1}
    ]
  }'
```

**Should NOT return transaction error anymore**

---

## 🐛 TROUBLESHOOTING

### Issue: "not running with --replSet"

**Cause:** MongoDB still in standalone mode

**Fix:**
```bash
# 1. Verify config has replication section
cat /opt/homebrew/etc/mongod.conf | grep -A2 replication

# 2. Restart MongoDB
brew services restart mongodb-community@7.0

# 3. Wait and check
sleep 3
mongosh --eval "rs.status()"
```

### Issue: "no replset config has been received"

**Cause:** Replica set not initialized

**Fix:**
```bash
mongosh --eval "rs.initiate({
  _id: 'rs0',
  members: [{ _id: 0, host: '127.0.0.1:27017' }]
})"

# Wait and verify
sleep 5
mongosh --eval "rs.status()"
```

### Issue: Backend still shows transaction error

**Cause:** Wrong MONGODB_URI

**Fix:**
```bash
# 1. Check .env
grep MONGODB_URI backend/.env

# 2. Should be:
# MONGODB_URI=mongodb://127.0.0.1:27017/ticketing-saas?replicaSet=rs0

# 3. Restart backend
cd backend
npm run dev
```

### Issue: "connect ECONNREFUSED"

**Cause:** MongoDB not running

**Fix:**
```bash
# Start MongoDB
brew services start mongodb-community@7.0

# Check status
brew services list | grep mongodb

# Check process
ps aux | grep mongod
```

### Issue: Backend connects but transactions fail

**Fix:**
```bash
# 1. Verify PRIMARY exists
mongosh --eval "rs.status().members.forEach(m => print(m.name, m.stateStr))"

# 2. Should show: 127.0.0.1:27017 PRIMARY

# 3. Test transaction manually
mongosh --eval "
  session = db.getMongo().startSession();
  session.startTransaction();
  session.commitTransaction();
  session.endSession();
  print('OK');
"

# 4. Restart backend
cd backend
npm run dev
```

---

## 📋 PART 6: ORDER TRANSACTION VERIFICATION

### Current OrderService Implementation

**File:** `backend/src/modules/orders/order.service.ts`

**Transaction code (lines 91-150):**
```typescript
async createOrder(data: CreateOrderDTO): Promise<IOrder> {
  const session = await mongoose.startSession();

  try {
    let created: IOrderDocument | undefined;

    await session.withTransaction(async () => {
      // 1. Find event
      const event = await Event.findById(eventId).session(session);
      
      // 2. Validate and calculate total
      const total = this.computeTotal(event.ticketTypes, merged);
      
      // 3. Lock inventory (atomic decrement)
      for (const [typeName, qty] of merged) {
        const result = await Event.updateOne(
          { _id: event._id },
          { $inc: { 'ticketTypes.$[elem].quantityAvailable': -qty } },
          {
            session,
            arrayFilters: [
              {
                'elem.name': typeName,
                'elem.quantityAvailable': { $gte: qty },
              },
            ],
          }
        );

        if (result.modifiedCount !== 1) {
          throw new ConflictError(`Not enough tickets available`);
        }
      }
      
      // 4. Create order
      const [orderDoc] = await Order.create([{...}], { session });
      created = orderDoc;
    });

    return this.toPublicOrder(created);
  } finally {
    await session.endSession();
  }
}
```

**Why Transaction Required:**

**Without Transaction:**
```
User A: Decrements inventory → CRASH → Order not created → Inventory lost ❌
User B: Sees available ticket → Both buy last ticket → Oversold ❌
```

**With Transaction:**
```
User A: Decrements inventory → CRASH → Transaction rollback → Inventory restored ✅
User B: Waits for lock → Transaction commits → Only one succeeds ✅
```

**This code will now work** because:
1. `mongoose.startSession()` will succeed (replica set enabled)
2. `session.withTransaction()` will execute atomically
3. Inventory updates are locked during transaction
4. Rollback happens automatically on error

---

## 📝 QUICK REFERENCE

### MongoDB Replica Set Commands

```bash
# Start MongoDB (replica set mode)
brew services start mongodb-community@7.0

# Stop MongoDB
brew services stop mongodb-community@7.0

# Check status
rs.status()

# Check if PRIMARY
rs.isMaster()

# Get replica set config
rs.conf()

# View current member state
rs.status().members.forEach(m => print(m.name, m.stateStr))
```

### Backend Commands

```bash
# Start backend
cd backend
npm run dev

# Build
npm run build

# Check MongoDB connection
grep MONGODB_URI backend/.env
```

### Connection String Format

```bash
# ✅ Correct (with replica set)
mongodb://127.0.0.1:27017/database?replicaSet=rs0

# ❌ Wrong (without replica set parameter)
mongodb://localhost:27017/database

# ❌ Wrong (using localhost instead of 127.0.0.1)
mongodb://localhost:27017/database?replicaSet=rs0
```

---

## 🔄 STARTUP SEQUENCE

**Every time you restart your Mac:**

1. **Start MongoDB:**
   ```bash
   brew services start mongodb-community@7.0
   ```

2. **Verify Replica Set:**
   ```bash
   mongosh --eval "rs.status()" | grep PRIMARY
   ```

3. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

4. **Verify Transactions:**
   Look for: `✓ MongoDB transactions are fully supported`

---

## 📊 COMPARISON

### Before Fix

```
MongoDB: Standalone mode
Config:  No replication section
URI:     mongodb://localhost:27017/ticketing-saas
Result:  ❌ Transaction error
```

### After Fix

```
MongoDB: Replica set mode (rs0)
Config:  replication.replSetName: rs0
URI:     mongodb://127.0.0.1:27017/ticketing-saas?replicaSet=rs0
Result:  ✅ Transactions work
```

---

## 🎯 SUMMARY

### Root Cause
- MongoDB running in **standalone mode**
- Config missing `replication` section
- `.env` missing `?replicaSet=rs0` parameter

### Solution
1. Add `replication.replSetName: rs0` to mongod.conf
2. Restart MongoDB: `brew services restart mongodb-community@7.0`
3. Initialize replica set: `rs.initiate(...)`
4. Update .env: `MONGODB_URI=mongodb://127.0.0.1:27017/ticketing-saas?replicaSet=rs0`
5. Restart backend

### Verification
- `rs.status()` shows PRIMARY
- Backend logs: `✓ MongoDB transactions are fully supported`
- Order creation works without transaction errors

### Transaction Usage
- Order creation (inventory locking)
- Payment processing (ticket issuance)
- Ticket validation (prevent double-entry)

**All transactions preserved and now working!** ✅

---

## 🔧 ONE-LINE SETUP (After Config Update)

```bash
brew services restart mongodb-community@7.0 && sleep 3 && mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'127.0.0.1:27017'}]})" && sleep 5 && mongosh --eval "rs.status()" && cd backend && npm run dev
```

**This command:**
1. Restarts MongoDB
2. Initializes replica set
3. Checks status
4. Starts backend

**Use only after updating mongod.conf!**
