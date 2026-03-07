# Quick Start Guide

## Setup (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Create .env file from example (optional)
cp .env.example .env

# 3. Start the server
npm start
```

Open your browser at **http://localhost:3000**

## Using the App

1. **Paste text** into the textarea
2. **Click or drag** to mark words/phrases
3. **Click "Mot it!"** to translate marked words
4. **See translations** appear in yellow highlights

## Features

- ✅ Works offline (after first visit)
- ✅ Installable on mobile
- ✅ No build process needed
- ✅ Real-time text processing
- ✅ Click or drag to select words

## Project Structure

- `server.js` - Backend (Express)
- `public/app.js` - Frontend (Vanilla JS)
- `public/index.html` - HTML structure
- `public/styles.css` - Styling
- `public/service-worker.js` - Offline support

## Development Tips

### Add translations
Edit the `translations` object in `server.js`

### Customize colors
Modify CSS variables in `public/styles.css` `:root` section

### Test offline
Use DevTools → Network tab → "Offline" checkbox

### Service Worker debugging
DevTools → Application → Service Workers

## Common Issues

**Page looks broken?** → Clear browser cache and reload
**Translations not working?** → Check the `/api/translate` endpoint in DevTools Network tab
**Service Worker not updating?** → Change `CACHE_NAME` in `service-worker.js`

## Next Steps

- Integrate real translation API (Google Translate, DeepL)
- Add language selection
- Store translation history
- Add export/sharing features
- Customize colors and theme

---

See `.github/copilot-instructions.md` for detailed AI coding guidance.
