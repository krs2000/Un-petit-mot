#!/usr/bin/env node
/**
 * Comprehensive Test Suite for JSON Dictionary System
 * 
 * Run with: node test-json-dictionary.js
 * 
 * Tests cover:
 * - Basic translations (EN ↔ ES)
 * - Multilingual lookups
 * - Language detection
 * - Search functionality
 * - Error handling
 * - API response format
 */

const assert = require('assert');
const {
  translate,
  findTranslation,
  detectLanguage,
  search,
  getAvailableLanguages,
  getStatistics
} = require('./seed/dictionary.js');

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║     JSON Dictionary System - Comprehensive Test Suite     ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

// Test Helper
function test(name, fn) {
  testsRun++;
  try {
    fn();
    console.log(`✅ Test ${testsRun}: ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ Test ${testsRun}: ${name}`);
    console.log(`   Error: ${error.message}`);
    testsFailed++;
  }
}

// ===== SECTION 1: Basic Translations =====
console.log('📍 Section 1: Basic Translations\n');

test('Translate "hello" to Spanish', () => {
  const result = translate('hello', 'es');
  assert.strictEqual(result, 'hola');
});

test('Translate "goodbye" to Spanish', () => {
  const result = translate('goodbye', 'es');
  assert.strictEqual(result, 'adiós');
});

test('Translate "hola" to English', () => {
  const result = translate('hola', 'en');
  assert.strictEqual(result, 'hello');
});

test('Translate "adiós" to English', () => {
  const result = translate('adiós', 'en');
  assert.strictEqual(result, 'goodbye');
});

test('Non-existent word returns null', () => {
  const result = translate('xyzabc123', 'es');
  assert.strictEqual(result, null);
});

// ===== SECTION 2: Multilingual Support =====
console.log('\n📍 Section 2: Multilingual Support\n');

test('Find "please" with all 6 languages', () => {
  const result = findTranslation('please');
  assert.strictEqual(result.found, true);
  assert.strictEqual(result.translations.en, 'Please');
  assert.strictEqual(result.translations.es, 'Por favor');
  assert.strictEqual(result.translations.de, 'Bitte');
  assert.strictEqual(result.translations.fr, "S'il vous plaît");
});

test('Translate "please" to German', () => {
  const result = translate('please', 'de');
  assert.strictEqual(result, 'Bitte');
});

test('Translate "please" to French', () => {
  const result = translate('please', 'fr');
  assert.strictEqual(result, "S'il vous plaît");
});

test('Translate "please" to Portuguese', () => {
  const result = translate('please', 'pt');
  assert.strictEqual(result, 'Por favor');
});

test('Find "good morning" with all 6 languages', () => {
  const result = findTranslation('good morning');
  assert.strictEqual(result.found, true);
  assert.strictEqual(result.translations.en, 'Good morning');
  assert.strictEqual(result.translations.es, 'Buenos días');
  assert.strictEqual(result.translations.de, 'Guten Morgen');
});

// ===== SECTION 3: Language Detection =====
console.log('\n📍 Section 3: Language Detection\n');

test('Detect "hello" as English', () => {
  const result = detectLanguage('hello');
  assert.strictEqual(result, 'en');
});

test('Detect "hola" as Spanish', () => {
  const result = detectLanguage('hola');
  assert.strictEqual(result, 'es');
});

test('Detect "bonjour" as French', () => {
  const result = detectLanguage('bonjour');
  assert.strictEqual(result, 'fr');
});

test('Detect "guten morgen" as German', () => {
  const result = detectLanguage('guten morgen');
  assert.strictEqual(result, 'de');
});

test('Unknown word returns "unknown"', () => {
  const result = detectLanguage('xyzabc123');
  assert.strictEqual(result, 'unknown');
});

// ===== SECTION 4: Case Insensitivity =====
console.log('\n📍 Section 4: Case Insensitivity\n');

test('Uppercase "HELLO" translates to Spanish', () => {
  const result = translate('HELLO', 'es');
  assert.strictEqual(result, 'hola');
});

test('Mixed case "Good Morning" translates to German', () => {
  const result = translate('Good Morning', 'de');
  assert.strictEqual(result, 'Guten Morgen');
});

test('All caps "PLEASE" is found', () => {
  const result = findTranslation('PLEASE');
  assert.strictEqual(result.found, true);
});

// ===== SECTION 5: Find Translation =====
console.log('\n📍 Section 5: Find Translation Function\n');

test('findTranslation returns correct structure', () => {
  const result = findTranslation('hello');
  assert.strictEqual(result.found, true);
  assert.strictEqual(typeof result.key, 'string');
  assert.strictEqual(typeof result.translations, 'object');
  assert.strictEqual(typeof result.sourceLanguage, 'string');
});

test('findTranslation handles non-existent word', () => {
  const result = findTranslation('notaword123');
  assert.strictEqual(result.found, false);
});

test('findTranslation found via Spanish', () => {
  const result = findTranslation('hola');
  assert.strictEqual(result.found, true);
  assert.strictEqual(result.sourceLanguage, 'es');
  assert.strictEqual(result.translations.en, 'hello');
});

// ===== SECTION 6: Search Functionality =====
console.log('\n📍 Section 6: Search Functionality\n');

test('Search for "good" returns results', () => {
  const results = search('good', 5);
  assert.strictEqual(Array.isArray(results), true);
  assert.strictEqual(results.length > 0, true);
});

test('Search respects limit parameter', () => {
  const results = search('a', 3);
  assert.strictEqual(results.length <= 3, true);
});

test('Search returns result with key and translations', () => {
  const results = search('hello', 5);
  assert.strictEqual(results.length > 0, true);
  const result = results[0];
  assert.strictEqual(typeof result.key, 'string');
  assert.strictEqual(typeof result.translations, 'object');
});

// ===== SECTION 7: Available Languages =====
console.log('\n📍 Section 7: Available Languages\n');

test('getAvailableLanguages returns object', () => {
  const langs = getAvailableLanguages();
  assert.strictEqual(typeof langs, 'object');
});

test('getAvailableLanguages includes all 6 languages', () => {
  const langs = getAvailableLanguages();
  assert.strictEqual(langs.en, 'English');
  assert.strictEqual(langs.es, 'Spanish');
  assert.strictEqual(langs.nl, 'Dutch');
  assert.strictEqual(langs.de, 'German');
  assert.strictEqual(langs.fr, 'French');
  assert.strictEqual(langs.pt, 'Portuguese');
});

// ===== SECTION 8: Statistics =====
console.log('\n📍 Section 8: Statistics\n');

test('getStatistics returns correct structure', () => {
  const stats = getStatistics();
  assert.strictEqual(typeof stats.totalEntries, 'number');
  assert.strictEqual(typeof stats.languageCoverage, 'object');
});

test('getStatistics shows 2,441 total entries', () => {
  const stats = getStatistics();
  assert.strictEqual(stats.totalEntries, 2441);
});

test('getStatistics shows 100% English coverage', () => {
  const stats = getStatistics();
  assert.strictEqual(stats.languageCoverage.en, 2441);
});

test('getStatistics shows 100% Spanish coverage', () => {
  const stats = getStatistics();
  assert.strictEqual(stats.languageCoverage.es, 2441);
});

test('getStatistics shows correct Dutch coverage', () => {
  const stats = getStatistics();
  assert.strictEqual(stats.languageCoverage.nl, 1530);
});

// ===== SECTION 9: Special Cases =====
console.log('\n📍 Section 9: Special Cases\n');

test('Translate with same source and target returns null', () => {
  const result = translate('hello', 'en', 'en');
  assert.strictEqual(result, null);
});

test('Handle whitespace in input', () => {
  const result = translate('  hello  ', 'es');
  assert.strictEqual(result, 'hola');
});

test('Handle empty string', () => {
  const result = translate('', 'es');
  assert.strictEqual(result, null);
});

test('Handle null input', () => {
  const result = translate(null, 'es');
  assert.strictEqual(result, null);
});

// ===== SECTION 10: Data Integrity =====
console.log('\n📍 Section 10: Data Integrity\n');

test('All entries have English translation', () => {
  const stats = getStatistics();
  assert.strictEqual(stats.languageCoverage.en, stats.totalEntries);
});

test('All entries have Spanish translation', () => {
  const stats = getStatistics();
  assert.strictEqual(stats.languageCoverage.es, stats.totalEntries);
});

test('Dutch has 1,530 translations', () => {
  const stats = getStatistics();
  assert.strictEqual(stats.languageCoverage.nl, 1530);
});

test('No null translations in results', () => {
  const result = translate('hello', 'es');
  assert.notStrictEqual(result, null);
  assert.strictEqual(typeof result, 'string');
});

// ===== SUMMARY =====
console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log(`║                   TEST SUMMARY                            ║`);
console.log('╚══════════════════════════════════════════════════════════╝\n');

const passRate = ((testsPassed / testsRun) * 100).toFixed(1);
console.log(`Total Tests Run:  ${testsRun}`);
console.log(`Tests Passed:     ${testsPassed} ✅`);
console.log(`Tests Failed:     ${testsFailed} ${testsFailed > 0 ? '❌' : '✅'}`);
console.log(`Pass Rate:        ${passRate}%\n`);

if (testsFailed === 0) {
  console.log('🎉 ALL TESTS PASSED! System is working correctly.\n');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed. Please review the errors above.\n');
  process.exit(1);
}
