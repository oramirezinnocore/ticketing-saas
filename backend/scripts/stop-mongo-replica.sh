#!/bin/bash

echo "🛑 Stopping MongoDB replica set..."

if ! command -v docker &> /dev/null; then
  echo "❌ Docker not available"
  exit 1
fi

cd .. && docker-compose stop

if [ $? -eq 0 ]; then
  echo "✓ MongoDB replica set stopped"
else
  echo "❌ Failed to stop MongoDB"
  exit 1
fi
