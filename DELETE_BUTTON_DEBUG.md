# Delete Button Visibility Debug

## 🔴 Issue

Delete button does NOT appear visually in OrganizerEventsPage despite backend and ownership logic being correct.

---

## 🔍 Debug Steps Added

### File: `frontend/src/pages/OrganizerEventsPage.tsx`

**Added debug logging to identify the root cause:**

### 1. User & Event Comparison Logging

```typescript
// DEBUG: Log values for comparison
console.log('[OrganizerEventsPage] DEBUG INFO:', {
  userId: user?.id,
  userRole: user?.role,
  totalEvents: events.length,
  eventOrganizers: events.map(e => ({ title: e.title, organizerId: e.organizerId })),
});

const organizerEvents = events.filter((event) => {
  const matches = String(event.organizerId) === String(user?.id);
  console.log(`[Filter] Event: ${event.title}, organizerId: "${event.organizerId}", userId: "${user?.id}", matches: ${matches}`);
  return matches;
});
```

### 2. Visual Debug Panel

Added yellow debug panel at top of page showing:
- Total events fetched
- Filtered events count
- User ID
- User role
- Is admin check
- Is organizer check

### 3. Per-Event Debug Info

Added blue debug box for each event card showing:
- Event title
- Event organizerId
- Current userId
- Whether IDs match

### 4. No Match Warning

Added red warning box when no events match the filter.

---

## 🚀 To Debug

### 1. Restart Frontend

```bash
cd frontend
npm run dev
```

### 2. Login as Organizer

Visit: http://localhost:3000/login

**Organizer credentials:**
- Email: `organizer@test.com`
- Password: `Organizer123!`

### 3. Navigate to Organizer Events

Visit: http://localhost:3000/organizer/events

### 4. Check Debug Output

**In Browser:**
- Look at yellow debug panel at top
- Check blue debug boxes on each event card
- If no events show, check red warning box

**In Console (F12):**
- Look for `[OrganizerEventsPage] DEBUG INFO:`
- Look for `[Filter]` logs showing each comparison
- Look for `[Render]` logs showing which events render
- Check if user.id matches any event.organizerId

---

## 🔍 Expected Findings

### Possible Root Causes

#### 1. User ID Mismatch
```
userId: "abc123"
organizerId: "xyz789"
```
**Cause:** Logged in user is not the event owner  
**Solution:** Login as the correct organizer

#### 2. Undefined User
```
userId: undefined
organizerId: "abc123"
```
**Cause:** Auth state not loaded or session expired  
**Solution:** Check authStore, re-login

#### 3. Type Mismatch
```
userId: "abc123" (string)
organizerId: ObjectId("abc123") (object)
```
**Cause:** Backend returning ObjectId instead of string  
**Solution:** Backend toPublicEvent() needs to stringify

#### 4. All Events Same Organizer
```
All events: organizerId: "user123"
Current user: "organizer456"
```
**Cause:** Testing with wrong account  
**Solution:** Create events as current organizer

---

## 📊 Debug Checklist

When visiting /organizer/events, check:

- [ ] Yellow debug panel shows at top
- [ ] User ID is displayed (not undefined)
- [ ] User role is "organizer" or "admin"
- [ ] Total events count > 0
- [ ] Filtered events count > 0 (if you own events)
- [ ] Each event card shows blue debug box
- [ ] Blue box shows organizerId matches userId
- [ ] Delete button visible on matching events
- [ ] Console shows filter logs for each event
- [ ] Console logs show matches: true for your events

---

## 🔧 Quick Fixes Based on Debug Output

### If userId is undefined:

**Problem:** Auth not working

**Fix:**
```typescript
// Check authStore in console:
localStorage.getItem('auth-storage')
// Should show user object with id

// If missing, re-login
```

### If no events match filter:

**Problem:** Event organizerId doesn't match user.id

**Fix:**
```bash
# Create a new event as current organizer
# Visit: http://localhost:3000/organizer/events/create
# After creation, it should appear in list
```

### If organizerId looks like ObjectId object:

**Problem:** Backend not stringifying

**Fix backend/src/modules/events/event.service.ts:**
```typescript
organizerId: doc.organizerId.toString(),  // Add .toString()
```

### If comparison fails despite IDs looking same:

**Problem:** Whitespace or type coercion

**Already fixed in code:**
```typescript
String(event.organizerId) === String(user?.id)  // Explicit string conversion
```

---

## 📝 Verification Commands

### Check Backend Returns Correct Format

```bash
curl -s http://localhost:5001/api/v1/events | python3 -c "
import sys, json
data = json.load(sys.stdin)
for e in data['data'][:3]:
    print(f\"Event: {e['title'][:30]:30} | organizerId type: {type(e['organizerId']).__name__} | value: {e['organizerId']}\")
"
```

**Expected:**
```
Event: Test Event                    | organizerId type: str | value: 69fec48e8e2d0e3e5166ec33
```

### Check Auth Token Payload

```bash
# In browser console:
const token = localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('JWT userId:', payload.userId);
  console.log('JWT role:', payload.role);
}
```

### Check Auth Store

```bash
# In browser console:
const authStorage = JSON.parse(localStorage.getItem('auth-storage'));
console.log('Stored user:', authStorage?.state?.user);
```

---

## ✅ Once Root Cause Found

After identifying the issue from debug output, we'll:

1. Remove debug code
2. Fix the actual issue
3. Normalize ID comparisons if needed
4. Update documentation

---

**Next Steps:**
1. Restart frontend with debug code
2. Login as organizer
3. Visit /organizer/events
4. Check console and visual debug panels
5. Report findings
