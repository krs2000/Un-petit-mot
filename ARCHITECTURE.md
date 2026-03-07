# Un petit mot - Architecture Diagram

## User Interaction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INTERACTION FLOW                        │
└─────────────────────────────────────────────────────────────────┘

1. PASTE TEXT
   User pastes text
        ↓
   textInput.addEventListener('input', updateDisplay)
        ↓
   updateDisplay() called
        ↓
   displayText.innerHTML updated with marked/unmarked words


2. MARK WORDS (Click or Drag)
   User clicks word OR drags to select phrase
        ↓
   document.addEventListener('mouseup'/'touchend', handleTextSelection)
        ↓
   Word added to state.markedWords Set
        ↓
   updateDisplay() re-renders with yellow highlighting
        ↓
   updateStats() shows count


3. TRANSLATE (Click "Mot it!")
   User clicks "Mot it!" button
        ↓
   handleMotIt() function
        ↓
   fetch POST /api/translate
   {
     words: ["hello", "world"]
   }
        ↓
   Backend processes translation
        ↓
   Response returns translations
   {
     translations: [
       { original: "hello", translated: "bonjour" },
       { original: "world", translated: "monde" }
     ]
   }
        ↓
   Store in state.translations (lowercase keys)
        ↓
   updateDisplay() re-renders with translations


4. DISPLAY WITH TRANSLATIONS
   updateDisplay() renders:
   
   [normal word] [marked word (yellow) translation (blue)] [normal word]
        ↓
   addWordClickHandlers() allows toggling individual words
```

---

## State Management Diagram

```
┌──────────────────────────────────────────┐
│         STATE OBJECT (app.js)            │
├──────────────────────────────────────────┤
│                                          │
│  state.markedWords: Set                  │
│  ├─ Exact case: "hello", "Hello"         │
│  └─ Used for: Display highlighting       │
│                                          │
│  state.translations: Object              │
│  ├─ Lowercase keys: "hello"              │
│  ├─ Values: "bonjour"                    │
│  └─ Used for: Display translations       │
│                                          │
│  state.originalText: String              │
│  ├─ Full text from textarea              │
│  └─ Used for: Tokenization               │
│                                          │
└──────────────────────────────────────────┘
       ↑                    ↓
    Modified by:        Used by:
  - handleMotIt()    - updateDisplay()
  - handleTextSelection
  - handleClear()
```

---

## Data Processing Pipeline

```
INPUT: "Hello world"

       ↓ Split on (\s+)

TOKENS: ["Hello", " ", "world"]

       ↓ Classify each token

CLASSIFICATION:
  "Hello" → marked word (if in state.markedWords)
  " "     → whitespace (preserve as-is)
  "world" → regular word OR marked word

       ↓ Build HTML with CSS classes

HTML:
  <span class="word marked">Hello
    <span class="translation">bonjour</span>
  </span>
  <span class="word">world</span>

       ↓ Render to DOM

DISPLAY:
  Hello bonjour world
  [yellow bg] [blue box] [normal]

       ↓ Attach event handlers

INTERACTIVE: Click words to toggle marking
```

---

## Service Worker Caching Strategy

```
┌─────────────────────────────────────────────────────────┐
│          SERVICE WORKER CACHE STRATEGY                   │
└─────────────────────────────────────────────────────────┘

REQUEST TYPE                  STRATEGY
─────────────────────────────────────────────────────────

Static Assets                 CACHE-FIRST
  /index.html                 1. Check cache
  /styles.css           →     2. If found, return
  /app.js                     3. Fetch in background
  /manifest.json              4. Update cache

API Calls                     NETWORK-FIRST
  /api/translate        →     1. Try network
  /api/*                      2. If offline, use cache
                              3. If no cache, fail gracefully

Navigation                    FALLBACK
  Unknown routes        →     Serve cached index.html


LIFECYCLE EVENTS:

install event
  ↓
  Cache app shell (HTML, CSS, JS, manifest)
  ↓
  skipWaiting() / immediate activation

activate event
  ↓
  Delete old caches (other CACHE_NAME versions)
  ↓
  Clean up old assets

fetch event
  ↓
  Route-specific caching strategy
  ↓
  Return response
```

---

## Backend Architecture

```
┌──────────────────────────────────────────────────┐
│              EXPRESS.JS SERVER                    │
│              (server.js, PORT 3000)               │
└──────────────────────────────────────────────────┘

MIDDLEWARE STACK:
  ↓
  cors()                      # Enable cross-origin
  ↓
  express.json()              # Parse JSON body
  ↓
  express.static(./public)    # Serve static files

ROUTES:

POST /api/translate
  ├─ Input: { words: ["hello", "world"] }
  ├─ Process: Look up in translations object
  ├─ Output: {
  │   translations: [
  │     { original: "hello", translated: "bonjour" },
  │     { original: "world", translated: "monde" }
  │   ]
  │ }
  └─ Fallback: [word] for unknown words

GET * (Wildcard)
  ├─ Catch-all for SPA
  └─ Serve index.html (single-page app)

TRANSLATION DATA:
  const translations = {
    'hello': 'bonjour',
    'world': 'monde',
    'cat': 'chat',
    ...
  }
```

---

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        UI LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Textarea    │  │ Mot It Btn  │  │ Clear Btn   │         │
│  │ (textInput) │  │             │  │             │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                │
└─────────┼────────────────┼────────────────┼─────────────────┘
          │                │                │
    ┌─────▼────────────────▼────────────────▼────────┐
    │         EVENT HANDLERS (app.js)                 │
    │  ┌──────────────────────────────────────────┐  │
    │  │ handleTextSelection()   - Mark words     │  │
    │  │ handleMotIt()           - Translate      │  │
    │  │ handleClear()           - Reset          │  │
    │  │ updateDisplay()         - Re-render      │  │
    │  │ addWordClickHandlers()  - Interactivity │  │
    │  └──────────────────────────────────────────┘  │
    └─────────┬────────────────────────────────────┘
              │
    ┌─────────▼────────────────────────────────────┐
    │        STATE MANAGEMENT                       │
    │  state.markedWords (Set)                      │
    │  state.translations (Object)                  │
    │  state.originalText (String)                  │
    └─────────┬────────────────────────────────────┘
              │
    ┌─────────▼────────────────────────────────────┐
    │        API COMMUNICATION                      │
    │  fetch('/api/translate', {                   │
    │    method: 'POST',                           │
    │    headers: { 'Content-Type': 'application/json' },
    │    body: JSON.stringify({ words })           │
    │  })                                          │
    └─────────┬────────────────────────────────────┘
              │
    ┌─────────▼─────────────────────────────────┐
    │    BACKEND (Express.js)                     │
    │  POST /api/translate endpoint               │
    │  └─ translations dictionary                │
    │  └─ JSON response                          │
    └─────────┬─────────────────────────────────┘
              │
    ┌─────────▼─────────────────────────────────┐
    │    DISPLAY RENDERING                       │
    │  displayText.innerHTML = HTML               │
    │  ├─ Token classification                   │
    │  ├─ CSS classes applied                    │
    │  ├─ HTML escaping (XSS prevention)         │
    │  └─ Interactive elements                   │
    └─────────┬─────────────────────────────────┘
              │
    ┌─────────▼──────────────────────────────────┐
    │        BROWSER RENDERING                    │
    │  ┌────────────────────────────────────────┐ │
    │  │ [word]  [MARKED(yellow)]  [word]      │ │
    │  │                 ↓                       │ │
    │  │           [translation(blue)]          │ │
    │  └────────────────────────────────────────┘ │
    └─────────────────────────────────────────────┘
```

---

## PWA Installation Flow

```
┌──────────────────────────────────────────┐
│     BROWSER FIRST VISIT                  │
└──────────────────────────────────────────┘
              ↓
Service Worker registers
              ↓
'install' event fires
              ↓
Cache app shell (index.html, styles.css, app.js, etc.)
              ↓
'activate' event fires
              ↓
Ready for offline use on NEXT visit
              ↓
┌──────────────────────────────────────────┐
│     BROWSER SUBSEQUENT VISITS             │
└──────────────────────────────────────────┘
              ↓
Service Worker checks cache first
              ↓
Static assets served from cache
              ↓
API calls try network, fallback to cache
              ↓
Works completely offline
              ↓
┌──────────────────────────────────────────┐
│    "ADD TO HOME SCREEN" PROMPT            │
└──────────────────────────────────────────┘
              ↓
beforeinstallprompt event fires
              ↓
User can install as native app
              ↓
App runs in standalone mode (full screen)
              ↓
App icon appears on home screen
```

---

## Responsive Design Breakpoints

```
┌─────────────────────────────────────────┐
│    VIEWPORT SIZES & LAYOUT               │
└─────────────────────────────────────────┘

Mobile (< 768px)
├─ Container: 100% width, padding: 10px
├─ Header: Font size 1.8rem
├─ Buttons: Full width, stacked
├─ Stats: Single column
├─ Display: Full viewport width
└─ Scrollable text area

Tablet (768px - 1024px)
├─ Container: 100% - 20px padding
├─ 2-column layout for stats
├─ Readable font sizes
└─ Touch-friendly spacing

Desktop (> 1024px)
├─ Container: Max 1000px centered
├─ Multi-column layouts
├─ Hover effects enabled
├─ Header: 2.5rem font
└─ Optimized for mouse interaction
```

---

## Error Handling & Fallbacks

```
TRANSLATION API FAILS
      ↓
try-catch in handleMotIt()
      ↓
catch block logs error
      ↓
User sees alert: "Failed to translate"
      ↓
Button state restored
      ↓
User can retry


WORD NOT IN DICTIONARY
      ↓
server.js checks translations[word.toLowerCase()]
      ↓
Falls back to [word] format
      ↓
User sees: [hello] if not found
      ↓
Dictionary can be extended


SERVICE WORKER NOT AVAILABLE
      ↓
App still works (no offline support)
      ↓
'if ("serviceWorker" in navigator)' check
      ↓
Falls back to normal browser caching


OFFLINE MODE
      ↓
API call to /api/translate fails
      ↓
Catch handler falls back to cached response
      ↓
If no cache, user sees original text
      ↓
App remains functional for marked words
```
