const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/landing", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "landing.html"));
});
app.get("/proverbs", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "proverbs.html"));
});
// Import built-in translation dictionary (BIP format)
const { 
  dictionary, 
  findTranslation, 
  detectLanguage, 
  translate,
  getAvailableLanguages 
} = require('./seed/dictionary');

// Available languages in the BIP dictionary
const AVAILABLE_LANGUAGES = getAvailableLanguages();

// Languages endpoint - returns available languages
app.get('/api/languages', (req, res) => {
  res.json({
    languages: AVAILABLE_LANGUAGES,
    supportedLanguageCodes: Object.keys(AVAILABLE_LANGUAGES)
  });
});

// Translation endpoint using built-in BIP dictionary
// Accepts: { words: string[], source: string, target: string }
// Returns: { translations: [{ original, translated, key, sourceLanguage, targetLanguage }] }
// Supports bidirectional translation: translate between ANY two languages
app.post('/api/translate', (req, res) => {
  const { words, source = 'auto', target = 'es' } = req.body;

  if (!words || !Array.isArray(words)) {
    return res.status(400).json({ error: 'Invalid input - expected { words: string[] }' });
  }

  const results = words.map(word => {
    const result = findTranslation(word);
    
    if (!result.found) {
      // Word not found, try to detect its language and still attempt translation
      const detectedSource = detectLanguage(word);
      const translated = translate(word, target || 'es', detectedSource !== 'unknown' ? detectedSource : source);
      
      return {
        original: word,
        translated: translated || `[${word}]`,
        sourceLanguage: detectedSource,
        targetLanguage: target || 'es',
        error: !translated
      };
    }

    // Word found in English keys
    // Detect source language (or use provided source)
    const detectedSource = source === 'auto' ? detectLanguage(word) : source;
    const translated = translate(word, target || 'es', detectedSource);

    return {
      original: word,
      translated: translated || `[${word}]`,
      key: result.key,
      allTranslations: result.translationMap,
      sourceLanguage: detectedSource,
      targetLanguage: target || 'es',
      error: !translated
    };
  });

  res.json({
    translations: results,
    sourceLanguage: source === 'auto' ? detectLanguage(words[0]) : source,
    targetLanguage: target || 'es'
  });
});

// Serve the main HTML file for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html',));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
