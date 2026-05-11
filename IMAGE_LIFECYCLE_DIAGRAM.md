# EventImage Component Lifecycle - Visual Diagram

## 🔴 BROKEN FLOW (Before Fix)

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. Initial Mount (React Query Loading)                          │
├──────────────────────────────────────────────────────────────────┤
│ EventsPage: events = undefined                                   │
│ EventImage: src = undefined                                      │
│            imageUrl = undefined                                  │
│            imageError = false                                    │
│            imageLoaded = false                                   │
│                                                                  │
│ Render: <EventImageFallback />                                  │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ 2. React Query Resolves                                         │
├──────────────────────────────────────────────────────────────────┤
│ EventsPage: events = [{ coverImageUrl: "/uploads/..." }]        │
│ EventImage: src = "/uploads/events/abc.png" ← NEW PROP         │
│            imageUrl = "http://localhost:5001/uploads/..."      │
│            imageError = false ← STALE (not reset)              │
│            imageLoaded = false ← STALE (not reset)             │
│                                                                  │
│ ❌ NO useEffect to detect prop change                           │
│ ❌ State not reset                                              │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ 3. Race Condition                                               │
├──────────────────────────────────────────────────────────────────┤
│ Browser starts loading image from network...                    │
│                                                                  │
│ CASE A: Image in cache / fast network                          │
│   → onLoad fires quickly ✅                                     │
│   → setImageLoaded(true)                                        │
│   → Image appears ✅                                            │
│                                                                  │
│ CASE B: Slow network / lazy loading delay                      │
│   → Component renders with stale state                          │
│   → imageLoaded stays false                                     │
│   → Image remains hidden ❌                                     │
│   → Fallback shows forever ❌                                   │
│   → onLoad fires too late, component doesn't update properly   │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ 4. User Navigates to Detail Page                               │
├──────────────────────────────────────────────────────────────────┤
│ EventImage: Component UNMOUNTS                                  │
│            State destroyed                                       │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ 5. User Returns to Events Page                                 │
├──────────────────────────────────────────────────────────────────┤
│ EventImage: Component REMOUNTS with FRESH STATE                │
│            imageError = false ← FRESH                           │
│            imageLoaded = false ← FRESH                          │
│            src = "/uploads/events/abc.png"                      │
│                                                                  │
│ Image loads correctly ✅ (because state was reset on remount)  │
└──────────────────────────────────────────────────────────────────┘
```

---

## ✅ FIXED FLOW (After Fix)

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. Initial Mount (React Query Loading)                          │
├──────────────────────────────────────────────────────────────────┤
│ EventsPage: events = undefined                                   │
│ EventImage: src = undefined                                      │
│            imageUrl = undefined                                  │
│            imageError = false                                    │
│            imageLoaded = false                                   │
│                                                                  │
│ useEffect: [imageUrl] = [undefined]                             │
│   → setImageError(false)                                        │
│   → setImageLoaded(false)                                       │
│                                                                  │
│ Render: <EventImageFallback />                                  │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ 2. React Query Resolves                                         │
├──────────────────────────────────────────────────────────────────┤
│ EventsPage: events = [{ coverImageUrl: "/uploads/..." }]        │
│ EventImage: src = "/uploads/events/abc.png" ← NEW PROP         │
│            imageUrl = "http://localhost:5001/uploads/..." ← CHANGED│
│                                                                  │
│ ✅ useEffect DETECTS CHANGE                                     │
│    [imageUrl] changed: undefined → "http://localhost:5001/..."│
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ 3. useEffect Runs (State Reset)                                │
├──────────────────────────────────────────────────────────────────┤
│ useEffect(() => {                                               │
│   setImageError(false);  ← RESET                               │
│   setImageLoaded(false); ← RESET                               │
│ }, [imageUrl]);                                                 │
│                                                                  │
│ Component re-renders with FRESH state                           │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ 4. Render Phase                                                 │
├──────────────────────────────────────────────────────────────────┤
│ Check: imageUrl exists? ✅                                      │
│ Check: imageError? false ✅                                     │
│                                                                  │
│ Render:                                                          │
│   <EventImageFallback /> ← Placeholder (imageLoaded = false)   │
│   <img src="..." className="hidden" /> ← Hidden until loaded   │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ 5. Browser Loads Image                                          │
├──────────────────────────────────────────────────────────────────┤
│ Browser: GET http://localhost:5001/uploads/events/abc.png      │
│ Backend: 200 OK (image/png)                                     │
│                                                                  │
│ Image downloads...                                              │
│ User sees: Fallback placeholder with gradient ⏳                │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ 6. Image Load Complete                                          │
├──────────────────────────────────────────────────────────────────┤
│ <img onLoad={() => setImageLoaded(true)} />                    │
│   → onLoad fires                                                │
│   → setImageLoaded(true)                                        │
│   → Component re-renders                                        │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ 7. Final Render                                                 │
├──────────────────────────────────────────────────────────────────┤
│ Check: imageLoaded? true ✅                                     │
│                                                                  │
│ Render:                                                          │
│   <EventImageFallback /> ← HIDDEN (imageLoaded = true)         │
│   <img className="" /> ← VISIBLE (no "hidden" class)           │
│                                                                  │
│ ✅ Image appears to user                                        │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 STATE TRANSITIONS

### Without useEffect (Broken)

```
Initial State:
┌────────────┬─────────┬─────────┐
│ src        │ error   │ loaded  │
├────────────┼─────────┼─────────┤
│ undefined  │ false   │ false   │
└────────────┴─────────┴─────────┘
            ↓
Prop Update:
┌────────────────────────┬─────────┬─────────┐
│ src                    │ error   │ loaded  │
├────────────────────────┼─────────┼─────────┤
│ /uploads/events/abc.png│ false   │ false   │  ← STALE STATE
└────────────────────────┴─────────┴─────────┘
            ↓
Image loads (maybe):
┌────────────────────────┬─────────┬─────────┐
│ src                    │ error   │ loaded  │
├────────────────────────┼─────────┼─────────┤
│ /uploads/events/abc.png│ false   │ false?  │  ← May stay false
└────────────────────────┴─────────┴─────────┘
            ↓
❌ Image stuck in loading state
```

### With useEffect (Fixed)

```
Initial State:
┌────────────┬─────────┬─────────┐
│ src        │ error   │ loaded  │
├────────────┼─────────┼─────────┤
│ undefined  │ false   │ false   │
└────────────┴─────────┴─────────┘
            ↓
Prop Update + useEffect:
┌────────────────────────┬─────────┬─────────┐
│ src                    │ error   │ loaded  │
├────────────────────────┼─────────┼─────────┤
│ /uploads/events/abc.png│ false   │ false   │  ← RESET by useEffect
└────────────────────────┴─────────┴─────────┘
            ↓
Image loads:
┌────────────────────────┬─────────┬─────────┐
│ src                    │ error   │ loaded  │
├────────────────────────┼─────────┼─────────┤
│ /uploads/events/abc.png│ false   │ true    │  ← Updated by onLoad
└────────────────────────┴─────────┴─────────┘
            ↓
✅ Image visible
```

---

## 🎯 REACT QUERY TIMING

```
Timeline:

T=0ms    Component Mounts
         ├─ EventsPage renders
         ├─ React Query starts fetch
         └─ EventImage receives src=undefined

T=50ms   React Query Fetches Data
         └─ GET /api/v1/events (in progress...)

T=200ms  React Query Resolves
         ├─ events = [{ coverImageUrl: "/uploads/..." }]
         ├─ EventsPage re-renders
         └─ EventImage receives NEW src prop

T=210ms  useEffect Detects Change ✅
         ├─ imageUrl changed: undefined → URL
         ├─ setImageError(false)
         ├─ setImageLoaded(false)
         └─ Component re-renders with fresh state

T=220ms  Image Element Renders
         └─ <img src="http://localhost:5001/..." />

T=230ms  Browser Starts Image Load
         └─ GET /uploads/events/abc.png

T=400ms  Image Download Complete
         ├─ onLoad fires
         ├─ setImageLoaded(true)
         └─ Component re-renders

T=410ms  Image Visible ✅
         └─ User sees cover image
```

---

## 🐛 RACE CONDITION EXPLAINED

### Without useEffect (Race Condition)

```
Scenario: Slow Network or Cache Miss

React Query      Component State       Browser
    ↓                 ↓                   ↓
Resolve          src updates          Image starts loading
    |            (no state reset)         |
    |                 |                   |
    |                 |                   ← Delay (300ms)
    |            Render with              |
    |            stale state              |
    |            (imageLoaded=false)      |
    |                 |                   |
    |                 |                   ← onLoad fires (late)
    |                 |                   |
    |            No re-render ❌         |
    |            (state stuck)            |
    ↓                 ↓                   ↓
              Image hidden forever
```

### With useEffect (No Race Condition)

```
Scenario: Any Network Speed

React Query      Component State       Browser
    ↓                 ↓                   ↓
Resolve          src updates          (waiting)
    |            useEffect runs!          |
    |            State RESET ✅          |
    |            Re-render                |
    |                 |                   |
    |                 |                   Image starts loading
    |                 |                   |
    |                 |                   ← onLoad fires
    |                 |                   |
    |            setImageLoaded(true) ✅ |
    |            Re-render                |
    ↓                 ↓                   ↓
              Image visible ✅
```

---

## 📋 KEY TAKEAWAYS

### 1. React State Persistence
```
❌ React does NOT reset state when props change
✅ You must manually reset state in useEffect
```

### 2. Dependency Array
```typescript
useEffect(() => {
  // Runs when imageUrl changes
  setImageError(false);
  setImageLoaded(false);
}, [imageUrl]); // ← Dependency array
```

### 3. Async Data Flow
```
React Query (async) → Prop Update → useEffect → State Reset → Render
```

### 4. Component Lifecycle
```
Mount → Initial State → Data Loads → Prop Update → useEffect → Fresh State → Image Loads
```

---

## 🎨 VISUAL STATES

```
State 1: No Data (Initial)
┌─────────────────────┐
│ 🌀 Loading...      │
│ Fallback Visible    │
└─────────────────────┘

State 2: Data Loaded, Image Loading
┌─────────────────────┐
│ 📅 Fallback Visible │
│ <img hidden />      │
└─────────────────────┘

State 3: Image Loaded
┌─────────────────────┐
│ 🖼️ Image Visible   │
│ Fallback Hidden     │
└─────────────────────┘

State 4: Image Error
┌─────────────────────┐
│ ⚠️ Fallback Visible│
│ (Permanent)         │
└─────────────────────┘
```

---

**Diagram Version:** 1.0  
**Last Updated:** 2026-05-11  
**Status:** ✅ Fixed with useEffect
