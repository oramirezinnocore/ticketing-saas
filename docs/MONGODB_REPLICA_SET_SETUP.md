# MongoDB Replica Set Setup for Local Development

## 🎯 Why Replica Set?

**This application uses MongoDB transactions** for critical operations:
- Order creation with inventory locking
- Payment processing with automatic ticket issuance
- Atomic updates to prevent race conditions

**MongoDB transactions require replica set mode.**

Running MongoDB in standalone mode will cause errors:
```
MongoServerError: Transaction numbers are only allowed on a replica set member or mongos
```

---

## 🚀 Quick Setup (Recommended)

### Option 1: Docker Compose (Easiest)

**1. Create docker-compose.yml**

```yaml
version: '3.8'

services:
  mongo1:
    image: mongo:7.0
    container_name: mongo1
    hostname: mongo1
    ports:
      - "27017:27017"
    command: ["--replSet", "rs0", "--bind_ip_all", "--port", "27017"]
    volumes:
      - mongo1_data:/data/db
    healthcheck:
      test: echo "try { rs.status() } catch (err) { rs.initiate({_id:'rs0',members:[{_id:0,host:'mongo1:27017'}]}) }" | mongosh --port 27017 --quiet
      interval: 5s
      timeout: 30s
      start_period: 0s
      retries: 30

  mongo2:
    image: mongo:7.0
    container_name: mongo2
    hostname: mongo2
    ports:
      - "27018:27018"
    command: ["--replSet", "rs0", "--bind_ip_all", "--port", "27018"]
    volumes:
      - mongo2_data:/data/db

  mongo3:
    image: mongo:7.0
    container_name: mongo3
    hostname: mongo3
    ports:
      - "27019:27019"
    command: ["--replSet", "rs0", "--bind_ip_all", "--port", "27019"]
    volumes:
      - mongo3_data:/data/db

volumes:
  mongo1_data:
  mongo2_data:
  mongo3_data:
```

**2. Start replica set**

```bash
# Start containers
docker-compose up -d

# Wait for healthcheck (30-60 seconds)
docker-compose ps

# Verify replica set is initialized
docker exec -it mongo1 mongosh --eval "rs.status()"
```

**3. Update .env**

```bash
MONGODB_URI=mongodb://mongo1:27017,mongo2:27018,mongo3:27019/ticketing?replicaSet=rs0
```

**4. Start backend**

```bash
npm run dev
```

---

### Option 2: Local MongoDB Process (macOS/Linux)

**1. Install MongoDB (if not installed)**

```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community@7.0

# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
```

**2. Stop existing MongoDB**

```bash
# macOS
brew services stop mongodb-community

# Linux
sudo systemctl stop mongod
```

**3. Create data directories**

```bash
mkdir -p ~/mongodb-replica/data1
mkdir -p ~/mongodb-replica/data2
mkdir -p ~/mongodb-replica/data3
mkdir -p ~/mongodb-replica/logs
```

**4. Create startup script**

```bash
# Create file: ~/mongodb-replica/start-replica-set.sh
cat > ~/mongodb-replica/start-replica-set.sh << 'EOF'
#!/bin/bash

# Start three MongoDB instances
mongod --replSet rs0 --port 27017 --dbpath ~/mongodb-replica/data1 --logpath ~/mongodb-replica/logs/mongo1.log --fork
mongod --replSet rs0 --port 27018 --dbpath ~/mongodb-replica/data2 --logpath ~/mongodb-replica/logs/mongo2.log --fork
mongod --replSet rs0 --port 27019 --dbpath ~/mongodb-replica/data3 --logpath ~/mongodb-replica/logs/mongo3.log --fork

# Wait for instances to start
sleep 5

# Initialize replica set
mongosh --port 27017 --eval "
rs.initiate({
  _id: 'rs0',
  members: [
    { _id: 0, host: 'localhost:27017' },
    { _id: 1, host: 'localhost:27018' },
    { _id: 2, host: 'localhost:27019' }
  ]
})
"

# Wait for replica set initialization
sleep 10

# Check status
mongosh --port 27017 --eval "rs.status()"

echo "MongoDB replica set started!"
echo "Connection string: mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0"
EOF

chmod +x ~/mongodb-replica/start-replica-set.sh
```

**5. Run startup script**

```bash
~/mongodb-replica/start-replica-set.sh
```

**6. Update .env**

```bash
MONGODB_URI=mongodb://localhost:27017,localhost:27018,localhost:27019/ticketing?replicaSet=rs0
```

**7. Verify replica set**

```bash
mongosh --port 27017 --eval "rs.status()"
```

**Expected output:**
```javascript
{
  set: 'rs0',
  members: [
    {
      _id: 0,
      name: 'localhost:27017',
      health: 1,
      state: 1,  // PRIMARY
      stateStr: 'PRIMARY'
    },
    {
      _id: 1,
      name: 'localhost:27018',
      health: 1,
      state: 2,  // SECONDARY
      stateStr: 'SECONDARY'
    },
    {
      _id: 2,
      name: 'localhost:27019',
      health: 1,
      state: 2,  // SECONDARY
      stateStr: 'SECONDARY'
    }
  ],
  ok: 1
}
```

---

### Option 3: Single-Node Replica Set (Development Only)

**For quick local testing when you don't need high availability:**

**1. Stop existing MongoDB**

```bash
# macOS
brew services stop mongodb-community

# Linux
sudo systemctl stop mongod
```

**2. Start MongoDB in replica set mode**

```bash
# Create data directory
mkdir -p ~/mongodb-rs-single/data
mkdir -p ~/mongodb-rs-single/logs

# Start MongoDB
mongod --replSet rs0 --port 27017 --dbpath ~/mongodb-rs-single/data --logpath ~/mongodb-rs-single/logs/mongod.log --fork

# Wait a moment
sleep 3

# Initialize replica set with single member
mongosh --port 27017 --eval "rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: 'localhost:27017' }] })"

# Verify
mongosh --port 27017 --eval "rs.status()"
```

**3. Update .env**

```bash
MONGODB_URI=mongodb://localhost:27017/ticketing?replicaSet=rs0
```

**Note:** This is **NOT recommended for production** but works for local development.

---

## 🔧 NPM Scripts (Add to package.json)

**backend/package.json:**

```json
{
  "scripts": {
    "mongo:setup": "bash scripts/setup-mongo-replica.sh",
    "mongo:start": "bash scripts/start-mongo-replica.sh",
    "mongo:stop": "bash scripts/stop-mongo-replica.sh",
    "mongo:status": "mongosh --port 27017 --eval 'rs.status()'"
  }
}
```

**Create scripts/setup-mongo-replica.sh:**

```bash
#!/bin/bash

echo "Setting up MongoDB replica set for local development..."

# Check if Docker is available
if command -v docker &> /dev/null; then
  echo "✓ Docker detected - using Docker Compose setup"
  
  # Check if docker-compose.yml exists
  if [ ! -f "docker-compose.yml" ]; then
    echo "Creating docker-compose.yml..."
    cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  mongo1:
    image: mongo:7.0
    container_name: mongo1
    hostname: mongo1
    ports:
      - "27017:27017"
    command: ["--replSet", "rs0", "--bind_ip_all", "--port", "27017"]
    volumes:
      - mongo1_data:/data/db
    healthcheck:
      test: echo "try { rs.status() } catch (err) { rs.initiate({_id:'rs0',members:[{_id:0,host:'mongo1:27017'}]}) }" | mongosh --port 27017 --quiet
      interval: 5s
      timeout: 30s
      retries: 30
  mongo2:
    image: mongo:7.0
    container_name: mongo2
    hostname: mongo2
    ports:
      - "27018:27018"
    command: ["--replSet", "rs0", "--bind_ip_all", "--port", "27018"]
    volumes:
      - mongo2_data:/data/db
  mongo3:
    image: mongo:7.0
    container_name: mongo3
    hostname: mongo3
    ports:
      - "27019:27019"
    command: ["--replSet", "rs0", "--bind_ip_all", "--port", "27019"]
    volumes:
      - mongo3_data:/data/db
volumes:
  mongo1_data:
  mongo2_data:
  mongo3_data:
EOF
  fi
  
  echo "Starting Docker containers..."
  docker-compose up -d
  
  echo "Waiting for replica set initialization (30 seconds)..."
  sleep 30
  
  echo "Checking replica set status..."
  docker exec -it mongo1 mongosh --eval "rs.status()"
  
  echo ""
  echo "✓ MongoDB replica set is ready!"
  echo "Connection string: mongodb://mongo1:27017,mongo2:27018,mongo3:27019/ticketing?replicaSet=rs0"
  echo ""
  echo "Update your .env file:"
  echo "MONGODB_URI=mongodb://mongo1:27017,mongo2:27018,mongo3:27019/ticketing?replicaSet=rs0"
  
else
  echo "Docker not found. Please install Docker or follow manual setup in docs/MONGODB_REPLICA_SET_SETUP.md"
  exit 1
fi
```

**Create scripts/start-mongo-replica.sh:**

```bash
#!/bin/bash

if command -v docker &> /dev/null; then
  echo "Starting MongoDB replica set..."
  docker-compose start
  echo "✓ MongoDB replica set started"
else
  echo "Docker not available. Start manually or use Docker setup."
  exit 1
fi
```

**Create scripts/stop-mongo-replica.sh:**

```bash
#!/bin/bash

if command -v docker &> /dev/null; then
  echo "Stopping MongoDB replica set..."
  docker-compose stop
  echo "✓ MongoDB replica set stopped"
else
  echo "Docker not available. Stop manually."
  exit 1
fi
```

---

## ✅ Verification

### 1. Check Replica Set Status

```bash
# Docker setup
docker exec -it mongo1 mongosh --eval "rs.status()"

# Local setup
mongosh --port 27017 --eval "rs.status()"
```

### 2. Test Transactions

```bash
mongosh "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0"
```

```javascript
// Switch to your database
use ticketing

// Start a session
session = db.getMongo().startSession()

// Start transaction
session.startTransaction()

// Perform operations
session.getDatabase("ticketing").test.insertOne({ test: true })

// Commit
session.commitTransaction()

// End session
session.endSession()

// If no errors, transactions work!
```

### 3. Start Backend

```bash
cd backend
npm run dev
```

**Look for these logs:**
```
[INFO] Connecting to MongoDB...
[INFO] MongoDB connected successfully
[INFO] MongoDB replica set detected
[INFO] Transaction support validated successfully
[INFO] ✓ MongoDB transactions are fully supported
```

---

## 🐛 Troubleshooting

### Error: "Transaction numbers are only allowed on a replica set member"

**Cause:** MongoDB running in standalone mode

**Solution:**
```bash
# Check current mode
mongosh --eval "db.hello()"

# If "setName" is null, you're in standalone mode
# Follow setup instructions above
```

### Error: "No replset config has been received"

**Cause:** Replica set not initialized

**Solution:**
```bash
# Re-initialize replica set
mongosh --port 27017 --eval "rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: 'localhost:27017' }] })"
```

### Error: "connect ECONNREFUSED 127.0.0.1:27017"

**Cause:** MongoDB not running

**Solution:**
```bash
# Docker
docker-compose up -d

# Local
mongod --replSet rs0 --port 27017 --dbpath ~/mongodb-replica/data1 --fork
```

### Error: "Host not found in replica set"

**Cause:** Connection string doesn't match replica set hosts

**Solution:**
```bash
# Check actual hosts in replica set
mongosh --port 27017 --eval "rs.status().members.map(m => m.name)"

# Update MONGODB_URI to match
```

### Backend starts but transactions fail

**Solution:**
```bash
# 1. Check replica set status
mongosh --port 27017 --eval "rs.status()"

# 2. Verify PRIMARY exists
# Look for: "stateStr": "PRIMARY"

# 3. Test transaction manually
mongosh --eval "
  session = db.getMongo().startSession();
  session.startTransaction();
  session.commitTransaction();
  session.endSession();
  print('Transactions work!');
"
```

---

## 📊 Connection String Format

### Full replica set (3 members)

```
mongodb://localhost:27017,localhost:27018,localhost:27019/ticketing?replicaSet=rs0
```

### Single-node replica set

```
mongodb://localhost:27017/ticketing?replicaSet=rs0
```

### With authentication

```
mongodb://username:password@localhost:27017,localhost:27018,localhost:27019/ticketing?replicaSet=rs0&authSource=admin
```

### With read preference

```
mongodb://localhost:27017,localhost:27018,localhost:27019/ticketing?replicaSet=rs0&readPreference=primary
```

---

## 🔒 Production Considerations

### Atlas (Recommended)

MongoDB Atlas automatically configures replica sets:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ticketing?retryWrites=true&w=majority
```

### Self-Hosted Production

**Minimum 3 nodes for high availability:**

```yaml
# Example production architecture
Primary:   mongo1.example.com:27017
Secondary: mongo2.example.com:27017
Secondary: mongo3.example.com:27017

Connection: mongodb://mongo1.example.com:27017,mongo2.example.com:27017,mongo3.example.com:27017/ticketing?replicaSet=prod-rs0
```

**Security checklist:**
- Enable authentication
- Enable TLS/SSL
- Configure firewalls
- Set up monitoring
- Regular backups
- Use keyfile for internal auth

---

## 📚 Additional Resources

- [MongoDB Replica Sets Official Docs](https://www.mongodb.com/docs/manual/replication/)
- [Deploy Replica Set for Testing](https://www.mongodb.com/docs/manual/tutorial/deploy-replica-set-for-testing/)
- [MongoDB Transactions](https://www.mongodb.com/docs/manual/core/transactions/)
- [Connection String Options](https://www.mongodb.com/docs/manual/reference/connection-string/)

---

## 🎓 Understanding the Setup

### Why 3 members?

- **Fault tolerance:** If 1 node fails, 2 remain (quorum maintained)
- **Automatic failover:** Secondary automatically promoted to primary
- **Read scaling:** Can distribute reads to secondaries

### Can I use 1 member for development?

**Yes!** Single-node replica set works for local development:

```bash
mongod --replSet rs0 --port 27017 --dbpath ./data --fork
mongosh --eval "rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: 'localhost:27017' }] })"
```

This enables transactions but provides no high availability.

### What happens during a transaction?

1. **Start session:** `mongoose.startSession()`
2. **Start transaction:** `session.startTransaction()`
3. **Operations:** All writes buffered
4. **Commit:** Atomically applied or rolled back
5. **End session:** `session.endSession()`

All changes are atomic - either all succeed or all fail.

---

## ✅ Quick Start Summary

**Fastest way to get started:**

```bash
# 1. Install Docker
brew install docker  # or download Docker Desktop

# 2. Create docker-compose.yml (see above)

# 3. Start replica set
docker-compose up -d

# 4. Wait 30 seconds

# 5. Update .env
MONGODB_URI=mongodb://mongo1:27017,mongo2:27018,mongo3:27019/ticketing?replicaSet=rs0

# 6. Start backend
npm run dev

# 7. Look for: "✓ MongoDB transactions are fully supported"
```

**Done!** Your backend now supports transactions.
