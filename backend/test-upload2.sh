#!/bin/bash
TOKEN=$(curl -s -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"organizer@test.com","password":"Organizer123!"}' | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")

echo "Upload response:"
curl -s -X POST http://localhost:5001/api/v1/upload/event-image \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@uploads/events/1778431134114-26910b2c671fce0ef4b81aa3da925ab1.png"
echo ""
