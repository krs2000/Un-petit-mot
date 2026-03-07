// Main Dictionary Aggregator
// Combines English and Spanish dictionaries and provides helper functions

const englishDictionary = require('./en');
const spanishDictionary = require('./es');

// Merge both dictionaries into a single lookup object
const dictionary = {
  ...englishDictionary,
  ...spanishDictionary
};

// Helper function to parse BIP format and return translations
// Input: word (English or Spanish)
// Output: { key, english, spanish, found }
function findTranslation(word) {
  const wordLower = word.toLowerCase();
  
  for (const [key, value] of Object.entries(dictionary)) {
    const [primary, translation] = value.split('|');
    
    if (primary.toLowerCase() === wordLower) {
      // Word is the primary language in this entry
      return { 
        key, 
        english: primary,
        spanish: translation,
        found: true 
      };
    }
    
    if (translation.toLowerCase() === wordLower) {
      // Word is the secondary language in this entry
      return { 
        key,
        english: translation,
        spanish: primary,
        found: true 
      };
    }
  }
  
  return { found: false };
}

// Helper function to detect language (simple heuristic)
function detectLanguage(word) {
  const wordLower = word.toLowerCase();
  
  for (const [, value] of Object.entries(dictionary)) {
    const [primary, translation] = value.split('|');
    
    if (primary.toLowerCase() === wordLower) {
      // Check if this is from English dictionary (keys 1-251) or Spanish (keys 301+)
      const key = Object.keys(dictionary).find(k => dictionary[k] === value);
      const keyNum = parseInt(key);
      return keyNum < 300 ? 'en' : 'es';
    }
    
    if (translation.toLowerCase() === wordLower) {
      // Word is in translation position
      const key = Object.keys(dictionary).find(k => dictionary[k] === value);
      const keyNum = parseInt(key);
      return keyNum < 300 ? 'es' : 'en';
    }
  }
  
  return 'unknown';
}

// Get translation to target language
function translate(word, targetLanguage) {
  const result = findTranslation(word);
  if (!result.found) {
    return null;
  }
  
  const sourceLanguage = detectLanguage(word);
  
  if (targetLanguage === 'en') {
    // If target is English, return the English translation
    return sourceLanguage === 'en' ? null : result.english;
  } else if (targetLanguage === 'es') {
    // If target is Spanish, return the Spanish translation
    return sourceLanguage === 'es' ? null : result.spanish;
  }
  
  return null;
}

module.exports = {
  dictionary,
  englishDictionary,
  spanishDictionary,
  findTranslation,
  detectLanguage,
  translate
};
