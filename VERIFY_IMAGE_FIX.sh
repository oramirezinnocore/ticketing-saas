#!/bin/bash

echo "======================================"
echo "Image Loading Verification Script"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Backend is running
echo "Test 1: Backend Health Check"
if curl -s http://localhost:5001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running on http://localhost:5001${NC}"
else
    echo -e "${RED}✗ Backend is NOT running${NC}"
    echo "  Start with: cd backend && npm run dev"
    exit 1
fi
echo ""

# Test 2: Check CORS header
echo "Test 2: CORS Configuration"
CORS_HEADER=$(curl -s -I http://localhost:5001/health | grep -i "Access-Control-Allow-Origin")
if [[ $CORS_HEADER == *"http://localhost:3000"* ]]; then
    echo -e "${GREEN}✓ CORS configured correctly${NC}"
    echo "  $CORS_HEADER"
else
    echo -e "${RED}✗ CORS not configured${NC}"
    echo "  Expected: Access-Control-Allow-Origin: http://localhost:3000"
fi
echo ""

# Test 3: Check CORP header
echo "Test 3: Cross-Origin-Resource-Policy"
CORP_HEADER=$(curl -s -I http://localhost:5001/uploads/events/1778442038203-89b4d5e3a7a26e06e8cc37b168bce151.png 2>&1 | grep -i "Cross-Origin-Resource-Policy")
if [[ $CORP_HEADER == *"cross-origin"* ]]; then
    echo -e "${GREEN}✓ CORP configured correctly${NC}"
    echo "  $CORP_HEADER"
else
    echo -e "${RED}✗ CORP not configured or set to same-origin${NC}"
    echo "  Expected: Cross-Origin-Resource-Policy: cross-origin"
    echo -e "${YELLOW}  This will cause ERR_BLOCKED_BY_RESPONSE.NotSameOrigin${NC}"
fi
echo ""

# Test 4: Image file accessibility
echo "Test 4: Image File Accessibility"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/uploads/events/1778442038203-89b4d5e3a7a26e06e8cc37b168bce151.png 2>&1)
if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Test image is accessible (HTTP 200)${NC}"
    echo "  URL: http://localhost:5001/uploads/events/1778442038203-89b4d5e3a7a26e06e8cc37b168bce151.png"
else
    echo -e "${RED}✗ Test image returned HTTP $HTTP_STATUS${NC}"
fi
echo ""

# Test 5: Content-Type
echo "Test 5: Image Content-Type"
CONTENT_TYPE=$(curl -s -I http://localhost:5001/uploads/events/1778442038203-89b4d5e3a7a26e06e8cc37b168bce151.png 2>&1 | grep -i "Content-Type")
if [[ $CONTENT_TYPE == *"image/"* ]]; then
    echo -e "${GREEN}✓ Correct Content-Type${NC}"
    echo "  $CONTENT_TYPE"
else
    echo -e "${RED}✗ Incorrect Content-Type${NC}"
    echo "  $CONTENT_TYPE"
fi
echo ""

# Test 6: List events with images
echo "Test 6: Events with Images in Database"
EVENTS_WITH_IMAGES=$(curl -s http://localhost:5001/api/v1/events 2>&1 | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    count = sum(1 for e in data.get('data', []) if e.get('coverImageUrl'))
    print(f'{count} events have cover images')
except:
    print('Could not fetch events')
" 2>&1)
echo "  $EVENTS_WITH_IMAGES"
echo ""

# Summary
echo "======================================"
echo "Summary"
echo "======================================"
echo ""
echo "If all tests passed:"
echo "  1. Restart backend if you just applied the fix"
echo "  2. Visit: http://localhost:3000/events"
echo "  3. Look for: 'FINAL TEST - Event With Image' or 'Csad'"
echo "  4. Images should display (not gradient fallback)"
echo ""
echo "If tests failed:"
echo "  - Check backend/src/middlewares/security.ts"
echo "  - Verify crossOriginResourcePolicy: { policy: 'cross-origin' }"
echo "  - Restart backend: cd backend && npm run dev"
echo ""
