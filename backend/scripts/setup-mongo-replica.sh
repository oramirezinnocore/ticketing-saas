#!/bin/bash

echo "🔧 Setting up MongoDB replica set for local development..."
echo ""

# Check if Docker is available
if ! command -v docker &> /dev/null; then
  echo "❌ Docker not found!"
  echo ""
  echo "Please install Docker:"
  echo "  macOS: brew install docker"
  echo "  Or download Docker Desktop: https://www.docker.com/products/docker-desktop"
  echo ""
  echo "Alternatively, follow manual setup in docs/MONGODB_REPLICA_SET_SETUP.md"
  exit 1
fi

echo "✓ Docker detected"

# Check if docker-compose.yml exists
if [ ! -f "../docker-compose.yml" ]; then
  echo "Creating docker-compose.yml..."
  cat > ../docker-compose.yml << 'EOF'
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
      test: echo "try { rs.status() } catch (err) { rs.initiate({_id:'rs0',members:[{_id:0,host:'mongo1:27017'},{_id:1,host:'mongo2:27018'},{_id:2,host:'mongo3:27019'}]}) }" | mongosh --port 27017 --quiet
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
EOF
  echo "✓ Created docker-compose.yml"
fi

echo ""
echo "Starting Docker containers..."
cd .. && docker-compose up -d

if [ $? -ne 0 ]; then
  echo "❌ Failed to start containers"
  exit 1
fi

echo "✓ Containers started"
echo ""
echo "Waiting for replica set initialization (30 seconds)..."
sleep 30

echo ""
echo "Checking replica set status..."
docker exec mongo1 mongosh --eval "rs.status()" --quiet

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ MongoDB replica set is ready!"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📝 Update your .env file with:"
  echo ""
  echo "MONGODB_URI=mongodb://localhost:27017,localhost:27018,localhost:27019/ticketing?replicaSet=rs0"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "🚀 Now run: npm run dev"
  echo ""
else
  echo "⚠️  Replica set initialization may still be in progress"
  echo "Wait a few more seconds and run: npm run mongo:status"
fi
