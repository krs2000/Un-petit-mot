/**
 * Dictionary Module - Multi-language Translation System
 * 
 * Updated for alphabetical split architecture
 * Loads from dictionary-index.js which combines all alphabetical files
 * 
 * Supports 6 languages: English, Spanish, Dutch, German, French, Portuguese
 * Features:
 * - Fast word lookup with natural English keys
 * - Complete multilingual translations where available
 * - Language detection and translation between any two languages
 */

// Load the complete dictionary from index
const dictionaryData = require('./dictionary-index');

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
      translationMap: dictionaryData[wordLower],
      sourceLanguage: 'en', // Keys are always in English
      original: wordLower
    };
  }

  // Not found
  return { found: false };
}

/**
 * Translate a word from one language to another
 * Supports bidirectional translation: translate between ANY two languages
 * source: 'auto' to auto-detect, or language code (en, es, nl, de, fr, pt)
 */
function translate(word, targetLanguage = 'es', sourceLanguage = 'auto') {
  if (!word || typeof word !== 'string') {
    return null;
  }

  const wordLower = word.toLowerCase().trim();
  
  // Try direct lookup first (word is in English - the dictionary key language)
  if (dictionaryData[wordLower]) {
    const entry = dictionaryData[wordLower];
    
    if (entry[targetLanguage]) {
      return entry[targetLanguage];
    }
    
    // If target language not available, try English
    return entry.en || null;
  }

  // Try reverse lookup: search by value in all languages
  // This enables translations like Spanish→Dutch, French→German, etc.
  for (const [key, translations] of Object.entries(dictionaryData)) {
    if (key === '_metadata' || typeof translations !== 'object') continue;
    
    // Check all languages in this entry
    for (const [lang, value] of Object.entries(translations)) {
      if (value && value.toLowerCase() === wordLower) {
        // Found the word in language 'lang'
        // If sourceLanguage is 'auto' or matches this language, use this entry
        if (sourceLanguage === 'auto' || lang === sourceLanguage) {
          // Now translate to target language
          if (translations[targetLanguage]) {
            return translations[targetLanguage];
          }
          // Fallback to English if target not available
          return translations.en || null;
        }
      }
    }
  }

  return null;
}

/**
 * Detect which language a word is in
 * Searches through all language columns to find where the word appears
 */
function detectLanguage(word) {
  if (!word || typeof word !== 'string') {
    return 'unknown';
  }

  const wordLower = word.toLowerCase().trim();
  
  // Check if it's an English key first (most common)
  if (dictionaryData[wordLower]) {
    return 'en';
  }

  // Search for the word in each language column
  for (const [key, translations] of Object.entries(dictionaryData)) {
    if (key === '_metadata' || typeof translations !== 'object') continue;
    
    for (const [lang, value] of Object.entries(translations)) {
      if (value && value.toLowerCase() === wordLower) {
        return lang; // Return the first language found
      }
    }
  }

  return 'unknown';
}

/**
 * Search for words matching a pattern
 * Returns array of matching entries
 */
function search(pattern, limit = 10) {
  const patternLower = pattern.toLowerCase();
  const results = [];
  let count = 0;

  for (const [key, translations] of Object.entries(dictionaryData)) {
    if (key === '_metadata' || count >= limit) break;
    
    if (key.includes(patternLower)) {
      results.push({
        word: key,
        translations: translations
      });
      count++;
    }
  }

  return results;
}

/**
 * Get available languages
 */
function getAvailableLanguages() {
  const languages = {};
  LANGUAGE_CODES.forEach(code => {
    languages[code] = LANGUAGES[code].name;
  });
  return languages;
}

/**
 * Get dictionary statistics
 */
function getStatistics() {
  const stats = {
    totalEntries: 0,
    languageCoverage: {}
  };

  // Count total entries
  Object.keys(dictionaryData).forEach(key => {
    if (key !== '_metadata') {
      stats.totalEntries++;
    }
  });

  // Count language coverage
  LANGUAGE_CODES.forEach(lang => {
    let count = 0;
    Object.entries(dictionaryData).forEach(([key, translations]) => {
      if (key !== '_metadata' && typeof translations === 'object' && translations[lang]) {
        count++;
      }
    });
    stats.languageCoverage[lang] = count;
  });

  return stats;
}

/**
 * Export all functions and data
 */
module.exports = {
  dictionary: dictionaryData,
  findTranslation,
  translate,
  detectLanguage,
  search,
  getAvailableLanguages,
  getStatistics,
  LANGUAGES,
  LANGUAGE_CODES
};
