#!/usr/bin/env node
/**
 * Example usage of the new JSON-based dictionary system
 * 
 * Run this file with: node dictionary-examples.js
 */

const {
  findTranslation,
  translate,
  detectLanguage,
  search,
  getAvailableLanguages,
  getStatistics
} = require('./seed/dictionary.js');

console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║           JSON Dictionary System - Usage Examples                   ║');
console.log('╚════════════════════════════════════════════════════════════════════╝\n');

// Example 1: Basic Translation
console.log('📍 Example 1: Basic Translation (English → Spanish)');
console.log('─'.repeat(70));
const en_to_es = translate('hello', 'es');
console.log(`  translate('hello', 'es') = "${en_to_es}"`);

const es_to_en = translate('hola', 'en');
console.log(`  translate('hola', 'en') = "${es_to_en}"`);

const en_to_de = translate('good morning', 'de');
console.log(`  translate('good morning', 'de') = "${en_to_de}"`);
console.log();

// Example 2: Find All Translations
console.log('📍 Example 2: Find All Translations for a Word');
console.log('─'.repeat(70));
const result = findTranslation('please');
console.log(`  findTranslation('please'):`);
console.log(`  Found: ${result.found}`);
console.log(`  Key: ${result.key}`);
console.log(`  Translations:`);
for (const [lang, translation] of Object.entries(result.translations)) {
  console.log(`    ${lang}: "${translation}"`);
}
console.log();

// Example 3: Language Detection
console.log('📍 Example 3: Language Detection');
console.log('─'.repeat(70));
const words = ['hello', 'hola', 'bonjour', 'guten morgen', 'olá'];
words.forEach(word => {
  const lang = detectLanguage(word);
  const langName = lang === 'unknown' ? 'Unknown' : lang.toUpperCase();
  console.log(`  detectLanguage('${word}') = ${langName}`);
});
console.log();

// Example 4: Multilingual Translation Chain
console.log('📍 Example 4: Multilingual Translation Chain');
console.log('─'.repeat(70));
console.log('  Translate "good morning" through all languages:');
const origPhrase = 'good morning';
const phrases = findTranslation(origPhrase);

if (phrases.found) {
  const supportedLangs = ['en', 'es', 'de', 'fr', 'pt', 'nl'];
  supportedLangs.forEach(lang => {
    if (phrases.translations[lang]) {
      console.log(`    ${lang.toUpperCase()}: "${phrases.translations[lang]}"`);
    }
  });
}
console.log();

// Example 5: Search for Words
console.log('📍 Example 5: Search for Words Matching a Pattern');
console.log('─'.repeat(70));
const searchResults = search('good', 5);
console.log(`  search('good', 5):`);
searchResults.forEach((result, idx) => {
  console.log(`  ${idx + 1}. ${result.key}`);
  if (result.translations.en) {
    console.log(`     EN: "${result.translations.en}"`);
    if (result.translations.es) console.log(`     ES: "${result.translations.es}"`);
  }
});
console.log();

// Example 6: Language Coverage
console.log('📍 Example 6: Available Languages');
console.log('─'.repeat(70));
const languages = getAvailableLanguages();
console.log('  Available languages:');
for (const [code, name] of Object.entries(languages)) {
  console.log(`    ${code.toUpperCase()}: ${name}`);
}
console.log();

// Example 7: Dictionary Statistics
console.log('📍 Example 7: Dictionary Statistics');
console.log('─'.repeat(70));
const stats = getStatistics();
console.log(`  Total entries: ${stats.totalEntries}`);
console.log(`  Language coverage:`);
for (const [lang, count] of Object.entries(stats.languageCoverage)) {
  const percentage = ((count / stats.totalEntries) * 100).toFixed(1);
  const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
  console.log(`    ${lang.toUpperCase()}: ${bar} ${percentage}% (${count})`);
}
console.log();

// Example 8: Advanced - Phrase Translations
console.log('📍 Example 8: Common Phrases in Multiple Languages');
console.log('─'.repeat(70));
const commonPhrases = [
  'good morning',
  'good afternoon',
  'thank you',
  'excuse me',
  'do you speak english'
];

commonPhrases.forEach(phrase => {
  const result = findTranslation(phrase);
  if (result.found) {
    const translations = result.translations;
    console.log(`\n  "${phrase}"`);
    const avail = Object.entries(translations).filter(([k, v]) => v);
    avail.forEach(([lang, trans]) => {
      console.log(`    ${lang.toUpperCase()}: "${trans}"`);
    });
  }
});
console.log();

// Example 9: Error Handling
console.log('📍 Example 9: Error Handling (Non-existent Words)');
console.log('─'.repeat(70));
const notFound = translate('xyzabc123', 'es');
console.log(`  translate('xyzabc123', 'es') = ${notFound}`);
const detected = detectLanguage('xyzabc123');
console.log(`  detectLanguage('xyzabc123') = ${detected}`);
console.log();

// Example 10: Cross-Language Translation
console.log('📍 Example 10: Cross-Language Translation');
console.log('─'.repeat(70));
console.log('  Translate "please" to all available languages:');
const word = 'please';
const allTranslations = findTranslation(word);
if (allTranslations.found) {
  const supportedLangs = ['en', 'es', 'nl', 'de', 'fr', 'pt'];
  console.log(`  Original: "${allTranslations.translations.en}"`);
  supportedLangs.slice(1).forEach(lang => {
    const translated = translate('please', lang);
    if (translated) {
      console.log(`  → ${lang.toUpperCase()}: "${translated}"`);
    }
  });
}
console.log();

console.log('╚════════════════════════════════════════════════════════════════════╝');
console.log('✅ Examples completed! Try modifying this file to explore more features.');
console.log();
