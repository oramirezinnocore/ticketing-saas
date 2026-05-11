# MongoDB Transaction Support - Complete Setup

## ✅ ISSUE RESOLVED

**Error:** "Transaction numbers are only allowed on a replica set member or mongos"

**Root Cause:** MongoDB running in standalone mode (not replica set)

**Solution:** Configure MongoDB as replica set for transaction support

---

## 🎯 Why This Matters

This application uses **MongoDB transactions** for critical operations:

1. **Order Creation** - Atomic inventory locking
   ```typescript
   await session.withTransaction(async () => {
     // Lock inventory
     // Create order
     // Both succeed or both fail
   });
   ```

2. **Payment Processing** - Atomic payment + ticket issuance
   ```typescript
   await session.withTransaction(async () => {
     // Update payment status
     // Update order status
     // Issue tickets
     // All or nothing
   });
   ```

3. **Ticket Validation** - Prevent double-entry
   ```typescript
   await Ticket.findOneAndUpdate(
     { code, status: 'VALID' },
     { status: 'USED' }
   );
   ```

**Without transactions:** Race conditions, inventory overselling, payment inconsistencies.

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Run Setup Script

```bash
cd backend
npm run mongo:setup
```

**What it does:**
- Creates `docker-compose.yml` (3-node replica set)
- Starts MongoDB containers
- Initializes replica set
- Validates configuration

**Output:**
```
🔧 Setting up MongoDB replica set for local development...
✓ Docker detected
✓ Created docker-compose.yml
✓ Containers started
✓ MongoDB replica set is ready!

📝 Update your .env file with:
MONGODB_URI=mongodb://localhost:27017,localhost:27018,localhost:27019/ticketing?replicaSet=rs0
```

### Step 2: Update .env

```bash
# Old (standalone - causes errors)
MONGODB_URI=mongodb://localhost:27017/ticketing

# New (replica set - supports transactions)
MONGODB_URI=mongodb://localhost:27017,localhost:27018,localhost:27019/ticketing?replicaSet=rs0
```

### Step 3: Start Backend

```bash
npm run dev
```

**Look for these logs:**
```
[INFO] Connecting to MongoDB...
[INFO] MongoDB connected successfully
[INFO] MongoDB replica set detected
  setName: "rs0"
  primary: "localhost:27017"
  hosts: ["localhost:27017", "localhost:27018", "localhost:27019"]
  transactionsSupported: true
[INFO] Transaction support validated successfully
[INFO] ✓ MongoDB transactions are fully supported
```

✅ **Done!** Transactions now work.

---

## 📁 Files Modified

### 1. Updated Database Connection

**File:** `backend/src/config/database.ts`

**Added:**
- `validateReplicaSetSupport()` - Checks if MongoDB is replica set
- `testTransactionSupport()` - Tests session creation
- Improved logging with connection details
- Production validation (fails fast if no transactions)
- Graceful warnings in development

**New Logs:**
```typescript
logger.info({
  message: 'MongoDB replica set detected',
  setName: replStatus.setName,
  primary: replStatus.primary,
  hosts: replStatus.hosts,
  transactionsSupported: true,
});
```

### 2. Created Setup Scripts

**Files:**
- `backend/scripts/setup-mongo-replica.sh` - One-time setup
- `backend/scripts/start-mongo-replica.sh` - Start containers
- `backend/scripts/stop-mongo-replica.sh` - Stop containers

**NPM Scripts Added:**
```json
{
  "mongo:setup": "bash scripts/setup-mongo-replica.sh",
  "mongo:start": "bash scripts/start-mongo-replica.sh",
  "mongo:stop": "bash scripts/stop-mongo-replica.sh",
  "mongo:status": "docker exec mongo1 mongosh --eval 'rs.status()' --quiet"
}
```

### 3. Created Documentation

**File:** `docs/MONGODB_REPLICA_SET_SETUP.md`

**Contents:**
- Docker Compose setup (recommended)
- Local MongoDB process setup
- Single-node replica set (dev only)
- Troubleshooting guide
- Connection string formats
- Production considerations

---

## 🔄 Validation Logic

### Startup Validation Flow

```
1. Connect to MongoDB
   └─> Log connection details (masked credentials)

2. Check Replica Set Support
   └─> Query: db.admin().serverStatus()
   └─> Check: serverStatus.repl exists?
   
   ✓ YES: Log replica set details
   ✗ NO:  Warn about standalone mode

3. Test Transaction Support
   └─> Try: mongoose.startSession()
   └─> Commit and end session
   
   ✓ SUCCESS: "Transaction support validated"
   ✗ FAIL:    "Transaction test failed"

4. Environment-Specific Behavior
   
   PRODUCTION:
   └─> NO transactions? → Exit with error code 1
   └─> Prevents deployment without transactions
   
   DEVELOPMENT:
   └─> NO transactions? → Warn but continue
   └─> Shows setup instructions in logs
```

### Log Output Examples

**✅ Success (Replica Set):**
```
[INFO] Connecting to MongoDB...
  uri: "mongodb://***:***@localhost:27017,localhost:27018,localhost:27019/ticketing?replicaSet=rs0"
[INFO] MongoDB connected successfully
  database: "ticketing"
  host: "localhost:27017"
[INFO] MongoDB replica set detected
  setName: "rs0"
  primary: "localhost:27017"
  hosts: ["localhost:27017", "localhost:27018", "localhost:27019"]
  transactionsSupported: true
[INFO] Transaction support validated successfully
[INFO] ✓ MongoDB transactions are fully supported
```

**⚠️ Warning (Standalone):**
```
[INFO] Connecting to MongoDB...
[INFO] MongoDB connected successfully
[WARN] MongoDB is running in standalone mode
  transactionsSupported: false
  info: "Transactions require replica set. See docs/MONGODB_REPLICA_SET_SETUP.md"
[ERROR] Transaction test failed
  error: "Transaction numbers are only allowed on a replica set member or mongos"
  hint: "MongoDB must be running as replica set. Run: npm run mongo:setup"
[WARN] ⚠️  MongoDB transactions are NOT supported
  reason: "MongoDB running in standalone mode"
  impact: "Order creation and payment processing may fail"
  solution: "Run: npm run mongo:setup (see docs/MONGODB_REPLICA_SET_SETUP.md)"
```

---

## 🐛 Troubleshooting

### Error: "Transaction numbers are only allowed..."

**Quick Fix:**
```bash
npm run mongo:setup
# Update .env with connection string shown
npm run dev
```

### Check Current MongoDB Mode

```bash
npm run mongo:status
```

**Replica Set (Good):**
```json
{
  "set": "rs0",
  "members": [
    { "name": "localhost:27017", "stateStr": "PRIMARY" },
    { "name": "localhost:27018", "stateStr": "SECONDARY" },
    { "name": "localhost:27019", "stateStr": "SECONDARY" }
  ]
}
```

**Standalone (Bad):**
```
MongoServerError: not running with --replSet
```

### Docker Containers Not Starting

```bash
# Check Docker is running
docker ps

# Remove old containers
docker-compose down -v

# Recreate
npm run mongo:setup
```

### Connection Refused

```bash
# Check containers are running
docker ps | grep mongo

# Start if stopped
npm run mongo:start

# Check logs
docker logs mongo1
```

### Backend Starts But Transactions Fail

```bash
# 1. Verify replica set status
npm run mongo:status

# 2. Check connection string in .env
grep MONGODB_URI .env

# 3. Must include replicaSet parameter:
# MONGODB_URI=mongodb://localhost:27017,localhost:27018,localhost:27019/ticketing?replicaSet=rs0
```

---

## 📊 NPM Scripts

### Setup & Management

```bash
# One-time setup (creates replica set)
npm run mongo:setup

# Start replica set (after setup)
npm run mongo:start

# Stop replica set
npm run mongo:stop

# Check replica set status
npm run mongo:status
```

### Development Workflow

```bash
# 1. Setup MongoDB (first time only)
npm run mongo:setup

# 2. Start backend
npm run dev

# 3. Develop normally

# 4. Stop MongoDB when done
npm run mongo:stop
```

---

## 🔧 Manual Setup (Alternative)

If you prefer not to use Docker:

### Option 1: Homebrew (macOS)

```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community@7.0

# Stop standalone instance
brew services stop mongodb-community

# Start replica set
mongod --replSet rs0 --port 27017 --dbpath ~/mongodb-rs/data --fork

# Initialize
mongosh --eval "rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: 'localhost:27017' }] })"

# Update .env
MONGODB_URI=mongodb://localhost:27017/ticketing?replicaSet=rs0
```

### Option 2: MongoDB Atlas (Cloud)

**Easiest for production:**

1. Create free cluster at https://cloud.mongodb.com
2. Get connection string
3. Update .env:
   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ticketing?retryWrites=true&w=majority
   ```

Atlas automatically uses replica sets.

---

## 🔒 Production Deployment

### Environment Check

Backend validates transactions on startup:

**Development:**
- Warns if no transactions
- Continues running
- Shows setup instructions

**Production:**
- Requires transactions
- Exits if not supported
- Prevents deployment

### Recommended Setup

**MongoDB Atlas:**
```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ticketing?retryWrites=true&w=majority
```

**Self-Hosted (3+ nodes):**
```bash
MONGODB_URI=mongodb://mongo1.prod:27017,mongo2.prod:27017,mongo3.prod:27017/ticketing?replicaSet=prod-rs0
```

---

## 📚 Understanding Transactions

### What Backend Code Uses Transactions

**1. Order Creation** - `backend/src/modules/orders/order.service.ts`
```typescript
const session = await mongoose.startSession();
await session.withTransaction(async () => {
  // Validate event exists
  // Calculate total
  // Lock inventory (atomic decrement)
  // Create order
});
```

**2. Payment Processing** - `backend/src/modules/payments/payment.service.ts`
```typescript
const session = await mongoose.startSession();
await session.withTransaction(async () => {
  // Check idempotency
  // Update payment (APPROVED)
  // Update order (PAID)
  // Issue tickets
});
```

**3. Ticket Issuance** - `backend/src/modules/tickets/ticket.service.ts`
```typescript
const session = await mongoose.startSession();
await session.withTransaction(async () => {
  // Check for existing tickets
  // Generate unique codes
  // Create ticket documents
});
```

### Why Transactions Matter

**Without Transactions:**
```
User A buys last ticket → Inventory decremented
                        ↓
                    (crash here)
                        ↓
                    Order not created
                        ↓
                    Ticket lost forever ❌
```

**With Transactions:**
```
User A buys last ticket → Inventory decremented
                        ↓
                    (crash here)
                        ↓
                    Transaction rolled back
                        ↓
                    Inventory restored ✅
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] `npm run mongo:status` shows replica set
- [ ] `npm run dev` shows "✓ MongoDB transactions are fully supported"
- [ ] No "Transaction numbers are only allowed..." errors
- [ ] Order creation works (POST /api/v1/orders)
- [ ] Payment processing works (webhook handling)
- [ ] Ticket issuance works (automatic after payment)

---

## 🎓 Learn More

- **Full Setup Guide:** `docs/MONGODB_REPLICA_SET_SETUP.md`
- **MongoDB Transactions:** https://www.mongodb.com/docs/manual/core/transactions/
- **Replica Sets:** https://www.mongodb.com/docs/manual/replication/
- **Docker Compose:** https://docs.docker.com/compose/

---

## 📝 Summary

**Problem:** MongoDB transactions require replica set

**Solution:** 
1. Run `npm run mongo:setup`
2. Update MONGODB_URI in .env
3. Start backend with `npm run dev`

**Result:** ✅ Transactions work, no errors

**Time to setup:** ~2 minutes

**Transactions preserved:** ✅ All transaction code unchanged

---

**Status:** ✅ **RESOLVED**

MongoDB now runs as replica set, transactions fully supported!
