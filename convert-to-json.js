#!/usr/bin/env node
/**
 * Conversion script: Transform pipe-separated dictionaries to JSON format
 * 
 * Input format (old): "1": "hello|hola|hallo|bonjour"
 * Output format (new): "hello": { "en": "hello", "es": "hola", "de": "hallo", "fr": "bonjour" }
 */

const fs = require('fs');
const path = require('path');

// Language codes in order
const LANGUAGE_CODES_2 = ['en', 'es'];
const LANGUAGE_CODES_6 = ['en', 'es', 'nl', 'de', 'fr', 'pt'];

/**
 * Convert 2-language format (en.js, es.js, etc.)
 * Format: "1": "hello|hola"
 * Each file contains: English | Spanish (index 0 and 1)
 * Merged output: all entries combined with same English key
 */
function convert2Language(dictionaries) {
  const merged = {};
  
  // en.js and es.js both have the format: "key": "en|es"
  // We just need to process them to extract the language pair
  const enDict = dictionaries.en;
  
  for (const [key, value] of Object.entries(enDict)) {
    const parts = value.split('|').map(p => p.trim());
    
    if (parts.length >= 2) {
      const englishWord = parts[0].toLowerCase();
      merged[englishWord] = {
        'en': parts[0],
        'es': parts[1]
      };
    }
  }
  
  return merged;
}

/**
 * Convert 6-language phrases format
 * Format: "1001": "Good morning|Buenos días|Goedemorgen|Guten Morgen|Bonjour|Bom dia"
 * Merged output: single JSON with all 6 languages
 */
function convert6Language(phrasesDict) {
  const result = {};
  
  for (const [key, value] of Object.entries(phrasesDict)) {
    const parts = value.split('|').map(p => p.trim());
    
    if (parts.length === 6) {
      const englishPhrase = parts[0].toLowerCase();
      
      result[englishPhrase] = {
        'en': parts[0],
        'es': parts[1],
        'nl': parts[2],
        'de': parts[3],
        'fr': parts[4],
        'pt': parts[5]
      };
    }
  }
  
  return result;
}

/**
 * Merge multiple language objects intelligently
 * If a key exists in both 2-language and 6-language:
 *   - Keep the 6-language version (more complete)
 *   - Or merge them (6-language has priority for missing languages)
 */
function mergeLanguageDictionaries(dict2Lang, dict6Lang) {
  const merged = { ...dict2Lang };
  
  for (const [key, translations] of Object.entries(dict6Lang)) {
    if (merged[key]) {
      // Key exists in both - merge with 6-language taking priority
      merged[key] = { ...merged[key], ...translations };
    } else {
      // Key only in 6-language
      merged[key] = translations;
    }
  }
  
  return merged;
}

// Main conversion process
console.log('🔄 Starting dictionary conversion to JSON format...\n');

try {
  // Load all current dictionaries
  const enDict = require('./seed/en.js').default || require('./seed/en.js');
  const esDict = require('./seed/es.js').default || require('./seed/es.js');
  const nlDict = require('./seed/nl.js').default || require('./seed/nl.js');
  const deDict = require('./seed/de.js').default || require('./seed/de.js');
  const frDict = require('./seed/fr.js').default || require('./seed/fr.js');
  const ptDict = require('./seed/pt.js').default || require('./seed/pt.js');
  const phrasesDict = require('./seed/phrases.js').default || require('./seed/phrases.js');
  
  console.log('✅ Loaded all seed files');
  
  // Convert 2-language dictionaries
  const dict2Lang = convert2Language({
    'en': enDict,
    'es': esDict,
    'nl': nlDict,
    'de': deDict,
    'fr': frDict,
    'pt': ptDict
  });
  console.log(`✅ Converted 2-language format: ${Object.keys(dict2Lang).length} entries`);
  
  // Convert 6-language phrases
  const dict6Lang = convert6Language(phrasesDict);
  console.log(`✅ Converted 6-language phrases: ${Object.keys(dict6Lang).length} entries`);
  
  // Merge both
  const finalDictionary = mergeLanguageDictionaries(dict2Lang, dict6Lang);
  console.log(`✅ Merged dictionaries: ${Object.keys(finalDictionary).length} total entries\n`);
  
  // Create new seeds/dictionary.json
  const output = {
    version: '2.0',
    format: 'json',
    lastUpdated: new Date().toISOString(),
    languages: ['en', 'es', 'nl', 'de', 'fr', 'pt'],
    entries: finalDictionary
  };
  
  const outputPath = path.join(__dirname, 'seed', 'dictionary.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`📝 Created: ${outputPath}`);
  
  // Also create a simple version without metadata for easier usage
  const simplePath = path.join(__dirname, 'seed', 'dictionary-simple.json');
  fs.writeFileSync(simplePath, JSON.stringify(finalDictionary, null, 2));
  console.log(`📝 Created: ${simplePath}`);
  
  // Print statistics
  console.log('\n📊 Statistics:');
  console.log(`   Total entries: ${Object.keys(finalDictionary).length}`);
  
  const langCounts = { en: 0, es: 0, nl: 0, de: 0, fr: 0, pt: 0 };
  for (const translations of Object.values(finalDictionary)) {
    for (const lang of LANGUAGE_CODES_6) {
      if (translations[lang]) langCounts[lang]++;
    }
  }
  
  console.log('\n   Language coverage:');
  for (const [lang, count] of Object.entries(langCounts)) {
    const coverage = ((count / Object.keys(finalDictionary).length) * 100).toFixed(1);
    console.log(`   - ${lang.toUpperCase()}: ${count} translations (${coverage}%)`);
  }
  
  console.log('\n✅ Conversion complete!');
  
} catch (error) {
  console.error('❌ Error during conversion:', error.message);
  process.exit(1);
}
