#!/bin/bash
set -e

echo "Testing event creation WITH image after validator fix..."
echo ""

TOKEN=$(curl -s -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"organizer@test.com","password":"Organizer123!"}' | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")

UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:5001/api/v1/upload/event-image \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@uploads/events/1778431134114-26910b2c671fce0ef4b81aa3da925ab1.png")

IMAGE_URL=$(echo $UPLOAD_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['url'])")
echo "Uploaded image URL: $IMAGE_URL"
echo ""

EVENT_RESPONSE=$(curl -s -X POST http://localhost:5001/api/v1/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"FINAL TEST - Event With Image\",
    \"description\": \"This event MUST have a cover image\",
    \"date\": \"2026-07-20T14:00:00Z\",
    \"coverImageUrl\": \"$IMAGE_URL\",
    \"coverImageAlt\": \"Final Test Cover Image\",
    \"ticketTypes\": [
      { \"name\": \"VIP\", \"price\": 250, \"quantity\": 30 }
    ]
  }")

EVENT_ID=$(echo $EVENT_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])")

echo "Created event response:"
echo $EVENT_RESPONSE | python3 -m json.tool
echo ""

echo "Fetching event to verify image was saved:"
curl -s http://localhost:5001/api/v1/events/$EVENT_ID | python3 -c "
import sys, json
e = json.load(sys.stdin)['data']
print(f'✓ Event ID: {e[\"id\"]}')
print(f'✓ Title: {e[\"title\"]}')
print(f'✓ Cover Image URL: {e.get(\"coverImageUrl\", \"❌ NO IMAGE\")}')
print(f'✓ Cover Image Alt: {e.get(\"coverImageAlt\", \"❌ NO ALT\")}')
print('')
if e.get('coverImageUrl'):
    print('✅ SUCCESS: Event has cover image!')
else:
    print('❌ FAILED: Event still has no image')
"

echo ""
echo "Testing direct image access:"
FULL_URL="http://localhost:5001$IMAGE_URL"
echo "URL: $FULL_URL"
curl -I "$FULL_URL" 2>&1 | grep -E "HTTP|Content-Type"
