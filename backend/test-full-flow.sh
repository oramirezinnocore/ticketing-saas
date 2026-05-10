#!/bin/bash
set -e

echo "1. Login as organizer..."
TOKEN=$(curl -s -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"organizer@test.com","password":"Organizer123!"}' | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")

echo "   Token obtained: ${TOKEN:0:20}..."

echo ""
echo "2. Upload image..."
UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:5001/api/v1/upload/event-image \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@uploads/events/1778431134114-26910b2c671fce0ef4b81aa3da925ab1.png")

IMAGE_URL=$(echo $UPLOAD_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['url'])")
echo "   Image URL: $IMAGE_URL"

echo ""
echo "3. Create event with image..."
EVENT_RESPONSE=$(curl -s -X POST http://localhost:5001/api/v1/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Test Event With Image\",
    \"description\": \"This event has a cover image\",
    \"date\": \"2026-06-15T10:00:00Z\",
    \"coverImageUrl\": \"$IMAGE_URL\",
    \"coverImageAlt\": \"Test Event Cover\",
    \"ticketTypes\": [
      { \"name\": \"General\", \"price\": 100, \"quantity\": 50 }
    ]
  }")

echo $EVENT_RESPONSE | python3 -m json.tool

EVENT_ID=$(echo $EVENT_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])")

echo ""
echo "4. Verify event has image..."
curl -s http://localhost:5001/api/v1/events/$EVENT_ID | python3 -c "
import sys, json
e = json.load(sys.stdin)['data']
print(f'Event ID: {e[\"id\"]}')
print(f'Title: {e[\"title\"]}')
print(f'Cover Image URL: {e.get(\"coverImageUrl\", \"NO IMAGE\")}')
print(f'Cover Image Alt: {e.get(\"coverImageAlt\", \"NO ALT\")}')
"
