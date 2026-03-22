/**
 * Dictionary Module - Multi-language Translation System
 * 
 * New JSON-based format:
 * {
 *   "hello": { "en": "hello", "es": "hola", "de": "hallo", "fr": "bonjour", "nl": "hallo", "pt": "olá" },
 *   "goodbye": { "en": "goodbye", "es": "adiós", ... },
 *   ...
 * }
 * 
 * Supports 6 languages: English, Spanish, Dutch, German, French, Portuguese
 * Features:
 * - Fast word lookup with natural English keys
 * - Complete multilingual translations where available
 * - Language detection and translation between any two languages
 * 
 * Data Source: unified-dictionary.json (consolidated from all dictionary files)
 * - dictionary-simple.json (2,441 entries)
 * - en.js, es.js, fr.js, nl.js, de.js, pt.js (language files)
 * - phrases.js (2,000+ multilingual phrases)
 * Total: 4,424 consolidated entries
 */

const dictionaryData = require('./unified-dictionary.json');

// Language configuration
const LANGUAGES = {
  'en': { name: 'English', index: 0 },
  'es': { name: 'Spanish', index: 1 },
  'nl': { name: 'Dutch', index: 2 },
  'de': { name: 'German', index: 3 },
  'fr': { name: 'French', index: 4 },
  'pt': { name: 'Portuguese', index: 5 }
};

const LANGUAGE_CODES = Object.keys(LANGUAGES);

/**
 * Find a word/phrase in the dictionary across all languages
 * Returns: { found, key, translations: { en, es, nl, de, fr, pt }, sourceLanguage, ... }
 */
function findTranslation(word) {
  if (!word || typeof word !== 'string') {
    return { found: false };
  }

  const wordLower = word.toLowerCase().trim();
  
  // Direct lookup: check if word exists as a key
  if (dictionaryData[wordLower]) {
    return {
      found: true,
      key: wordLower,
      translations: dictionaryData[wordLower],
      sourceLanguage: 'en', // Keys are always in English
      original: wordLower
    };
  }

  // Search through all translations to find the word in any language
  for (const [key, translations] of Object.entries(dictionaryData)) {
    for (const [langCode, translation] of Object.entries(translations)) {
      if (translation && translation.toLowerCase() === wordLower) {
        return {
          found: true,
          key,
          translations,
          sourceLanguage: langCode,
          original: translation
        };
      }
    }
  }

  return { found: false };
}

/**
 * Detect the language of a given word
 * Returns: language code ('en', 'es', 'nl', 'de', 'fr', 'pt') or 'unknown'
 */
function detectLanguage(word) {
  const result = findTranslation(word);
  if (result.found) {
    return result.sourceLanguage;
  }
  return 'unknown';
}

/**
 * Translate a word from source language to target language
 * Parameters:
 *   - word: the word to translate (can be in any language)
 *   - targetLanguage: target language code ('en', 'es', 'nl', 'de', 'fr', 'pt')
 *   - sourceLanguage: (optional) source language code. If not provided, will be detected
 * Returns: translated word or null if not found
 */
function translate(word, targetLanguage = 'es', sourceLanguage = 'auto') {
  if (!word || !targetLanguage) {
    return null;
  }

  const result = findTranslation(word);
  
  if (!result.found) {
    return null;
  }

  // If source language not detected, use the detected one
  if (sourceLanguage === 'auto') {
    sourceLanguage = result.sourceLanguage;
  }

  // Get the translation from the translations map
  const translated = result.translations[targetLanguage];

  // If source and target are the same, return null (no translation needed)
  if (sourceLanguage === targetLanguage) {
    return null;
  }

  return translated || null;
}

/**
 * Get all available languages
 * Returns: { en: 'English', es: 'Spanish', ... }
 */
function getAvailableLanguages() {
  const result = {};
  for (const [code, config] of Object.entries(LANGUAGES)) {
    result[code] = config.name;
  }
  return result;
}

/**
 * Search for words matching a pattern
 * Returns: array of matching entries { key, translations, matchedLanguage }
 */
function search(pattern, limit = 10) {
  if (!pattern || typeof pattern !== 'string') {
    return [];
  }

  const patternLower = pattern.toLowerCase();
  const results = [];

  for (const [key, translations] of Object.entries(dictionaryData)) {
    // Check English key first
    if (key.includes(patternLower)) {
      results.push({ key, translations, matchedIn: 'key' });
      if (results.length >= limit) return results;
    }

    // Check other languages
    for (const [langCode, translation] of Object.entries(translations)) {
      if (translation && translation.toLowerCase().includes(patternLower)) {
        results.push({ key, translations, matchedIn: langCode });
        if (results.length >= limit) return results;
      }
    }
  }

  return results;
}

/**
 * Get statistics about the dictionary
 */
function getStatistics() {
  const stats = {
    totalEntries: Object.keys(dictionaryData).length,
    languageCoverage: {}
  };

  // Count translations per language
  for (const lang of LANGUAGE_CODES) {
    stats.languageCoverage[lang] = 0;
  }

  for (const translations of Object.values(dictionaryData)) {
    for (const [lang, translation] of Object.entries(translations)) {
      if (translation) {
        stats.languageCoverage[lang]++;
      }
    }
  }

  return stats;
}

// Export functions and data
module.exports = {
  // Data
  dictionary: dictionaryData,
  
  // Functions
  findTranslation,
  detectLanguage,
  translate,
  getAvailableLanguages,
  search,
  getStatistics,
  
  // Configuration
  LANGUAGES,
  LANGUAGE_CODES
};
