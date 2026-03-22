/**
 * Analyze dictionary completeness
 * Shows which entries have missing translations
 */

const d = require('./seed/dictionary');
const dict = d.dictionary;

const LANGUAGES = ['en', 'es', 'fr', 'nl', 'de', 'pt'];
let incompleteEntries = [];

// Analyze each entry
for (const [key, translations] of Object.entries(dict)) {
  if (key === '_metadata') continue;
  
  const missingLangs = LANGUAGES.filter(lang => !translations[lang]);
  if (missingLangs.length > 0) {
    incompleteEntries.push({
      key,
      hasLangs: LANGUAGES.filter(lang => translations[lang]),
      missingLangs,
      translations
    });
  }
}

const totalEntries = Object.keys(dict).length - 1;
const coverage = (100 - (incompleteEntries.length / totalEntries * 100)).toFixed(2);

console.log(`\n=== Dictionary Coverage Analysis ===`);
console.log(`Total entries: ${totalEntries}`);
console.log(`Entries with missing translations: ${incompleteEntries.length}`);
console.log(`Overall coverage: ${coverage}%`);

console.log(`\n=== Sample of incomplete entries (first 20) ===`);
incompleteEntries.slice(0, 20).forEach(entry => {
  console.log(`\n"${entry.key}"`);
  console.log(`  Has: [${entry.hasLangs.join(', ')}]`);
  console.log(`  Missing: [${entry.missingLangs.join(', ')}]`);
  console.log(`  Object: ${JSON.stringify(entry.translations)}`);
});

// Show breakdown by number of missing languages
console.log(`\n=== Breakdown by missing count ===`);
const byMissing = {};
incompleteEntries.forEach(entry => {
  const count = entry.missingLangs.length;
  byMissing[count] = (byMissing[count] || 0) + 1;
});

Object.keys(byMissing).sort().forEach(count => {
  console.log(`${count} missing languages: ${byMissing[count]} entries`);
});

// Show which languages are most often missing
console.log(`\n=== Which languages are missing most ===`);
const missingByLang = {};
LANGUAGES.forEach(lang => {
  missingByLang[lang] = incompleteEntries.filter(e => e.missingLangs.includes(lang)).length;
});

Object.entries(missingByLang)
  .sort(([, a], [, b]) => b - a)
  .forEach(([lang, count]) => {
    console.log(`${lang}: ${count} entries missing`);
  });
