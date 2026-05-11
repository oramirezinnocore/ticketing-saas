#!/bin/bash

echo "🚀 Starting MongoDB replica set..."

if ! command -v docker &> /dev/null; then
  echo "❌ Docker not available"
  exit 1
fi

cd .. && docker-compose start

if [ $? -eq 0 ]; then
  echo "✓ MongoDB replica set started"
  echo ""
  echo "Check status: npm run mongo:status"
else
  echo "❌ Failed to start MongoDB"
  exit 1
fi
