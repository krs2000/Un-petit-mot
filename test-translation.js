// Quick translation API test
const express = require('express');
const { findTranslation, translate, detectLanguage, getAvailableLanguages } = require('./seed/dictionary');

const app = express();
app.use(express.json());

app.post('/api/translate', (req, res) => {
  const { words, source = 'auto', target = 'es' } = req.body;
  
  if (!words || !Array.isArray(words)) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  
  const results = words.map(word => {
    const result = findTranslation(word);
    
    if (!result.found) {
      return {
        original: word,
        translated: `[${word}]`,
        error: true
      };
    }
    
    const detectedSource = source === 'auto' ? detectLanguage(word) : source;
    const translated = translate(word, target || 'es');
    
    return {
      original: word,
      translated: translated || `[${word}]`,
      sourceLanguage: detectedSource,
      targetLanguage: target || 'es',
      error: !translated
    };
  });
  
  res.json({ translations: results });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server ready on http://localhost:${PORT}`));
