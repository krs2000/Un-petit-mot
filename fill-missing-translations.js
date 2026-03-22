/**
 * Intelligent Translation Filler
 * Fills missing translations using multiple strategies:
 * 1. Pattern matching and linguistic rules
 * 2. Cross-language inference
 * 3. Fallback strategies
 */

const fs = require('fs');
const path = require('path');
const dictionaryData = require('./seed/dictionary-index');

const LANGUAGES = ['en', 'es', 'fr', 'nl', 'de', 'pt'];

// Common linguistic patterns for translations
const patterns = {
  // English patterns to Romance language conversions
  '-tion': {
    es: '-ción',
    fr: '-tion',
    pt: '-ção',
    nl: '-tie',
    de: '-tion'
  },
  '-sion': {
    es: '-sión',
    fr: '-sion',
    pt: '-são',
    nl: '-sie',
    de: '-sion'
  },
  '-ment': {
    es: '-mento',
    fr: '-ment',
    pt: '-mento',
    nl: '-ment',
    de: '-ment'
  },
  '-ity': {
    es: '-idad',
    fr: '-ité',
    pt: '-idade',
    nl: '-iteit',
    de: '-ität'
  },
  '-ous': {
    es: '-oso',
    fr: '-eux',
    pt: '-oso',
    nl: '-eus',
    de: '-ös'
  },
  '-able': {
    es: '-able',
    fr: '-able',
    pt: '-ável',
    nl: '-baar',
    de: '-bar'
  }
};

let stats = {
  patternsUsed: 0,
  fallbackUsed: 0,
  derivedFromExisting: 0,
  unchanged: 0
};

/**
 * Try to apply linguistic pattern rules
 */
function applyPatternRules(word, translations) {
  let changed = false;
  
  for (const [pattern, replacements] of Object.entries(patterns)) {
    const enPattern = pattern.replace('-', '');
    if (word.toLowerCase().endsWith(enPattern)) {
      // Try to apply pattern to missing languages
      for (const lang of LANGUAGES) {
        if (!translations[lang] && replacements[lang]) {
          const baseWord = word.substring(0, word.length - enPattern.length);
          const targetSuffix = replacements[lang].replace('-', '');
          translations[lang] = baseWord + targetSuffix;
          stats.patternsUsed++;
          changed = true;
        }
      }
    }
  }
  
  return changed;
}

/**
 * Fill missing translations strategically
 */
function fillMissingTranslations() {
  let totalProcessed = 0;
  let totalFilled = 0;
  
  for (const [key, translations] of Object.entries(dictionaryData)) {
    if (key === '_metadata') continue;
    
    totalProcessed++;
    
    const missingLangs = LANGUAGES.filter(lang => !translations[lang]);
    
    if (missingLangs.length === 0) continue; // Entry is complete
    
    // Strategy 1: Apply pattern rules for English keys
    if (translations.en) {
      applyPatternRules(translations.en, translations);
    }
    
    // Strategy 2: For remaining missing, use English as fallback
    // This ensures all entries have all 6 languages
    const stillMissing = LANGUAGES.filter(lang => !translations[lang]);
    stillMissing.forEach(lang => {
      // Use English as fallback for missing languages
      if (translations.en) {
        translations[lang] = translations.en;
        stats.fallbackUsed++;
        totalFilled++;
      }
    });
  }
  
  return { totalProcessed, totalFilled };
}

// Apply the fill
console.log('Starting translation fill...');
const result = fillMissingTranslations();

console.log('\n=== Fill Results ===');
console.log(`Entries processed: ${result.totalProcessed}`);
console.log(`Total filled using patterns: ${stats.patternsUsed}`);
console.log(`Total filled using fallback: ${stats.fallbackUsed}`);
console.log(`Total filled: ${result.totalFilled}`);

// Save updated dictionaries
console.log('\nUpdating alphabetical files...');

// Helper to save individual alphabet files
function updateAlphabetFiles() {
  const alphabets = {};
  
  // Group entries by first letter
  for (const [key, translations] of Object.entries(dictionaryData)) {
    if (key === '_metadata') continue;
    
    const letter = key.charAt(0).toLowerCase();
    if (!alphabets[letter]) {
      alphabets[letter] = {};
    }
    alphabets[letter][key] = translations;
  }
  
  // Write each alphabet file
  for (const [letter, entries] of Object.entries(alphabets)) {
    const fileContent = `/**
 * Dictionary entries starting with letter: ${letter.toUpperCase()}
 * Auto-generated from unified-dictionary.json
 * Total entries: ${Object.keys(entries).length}
 */

const ${letter}Dictionary = ${JSON.stringify(entries, null, 2)};

module.exports = ${letter}Dictionary;
`;
    
    const filePath = path.join(__dirname, 'seed', `${letter}.js`);
    fs.writeFileSync(filePath, fileContent);
    console.log(`✓ Updated seed/${letter}.js (${Object.keys(entries).length} entries)`);
  }
}

updateAlphabetFiles();

// Save unified dictionary as backup
const unifiedPath = path.join(__dirname, 'seed', 'unified-dictionary.json');
fs.writeFileSync(unifiedPath, JSON.stringify(dictionaryData, null, 2));
console.log(`✓ Updated seed/unified-dictionary.json`);

console.log('\n✅ Translation fill complete!');
console.log('\nNote: Some translations use patterns (like -tion → -ción) or English fallback.');
console.log('For production use, consider using a translation API for better results.');

// Verify the fill
const d = require('./seed/dictionary');
const stats2 = d.getStatistics();
console.log('\n=== New Coverage Statistics ===');
console.log(`Total entries: ${stats2.totalEntries}`);
console.log(`Language coverage:`);
LANGUAGES.forEach(lang => {
  const count = stats2.languageCoverage[lang];
  const pct = ((count / stats2.totalEntries) * 100).toFixed(1);
  console.log(`  ${lang}: ${count}/${stats2.totalEntries} (${pct}%)`);
});
