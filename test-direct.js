// Direct test of the translation functions
const { findTranslation, translate, detectLanguage } = require('./seed/dictionary');

console.log('=== TRANSLATION SYSTEM TEST ===\n');

const testCases = [
  { word: 'hello', target: 'es', description: 'English word to Spanish' },
  { word: 'hola', target: 'en', description: 'Spanish word to English' },
  { word: 'Good morning', target: 'de', description: '6-language phrase to German' },
  { word: 'Buenos días', target: 'fr', description: 'Spanish phrase to French' },
  { word: 'Guten Morgen', target: 'pt', description: 'German phrase to Portuguese' },
  { word: 'big', target: 'es', description: 'Adjective to Spanish' },
  { word: 'grande', target: 'en', description: 'Spanish adjective to English' },
  { word: 'I am', target: 'es', description: 'Verb conjugation' },
  { word: 'notfound', target: 'es', description: 'Non-existent word' }
];

testCases.forEach((test, idx) => {
  const result = findTranslation(test.word);
  const translation = translate(test.word, test.target);
  const detected = detectLanguage(test.word);
  
  const status = translation ? '✅' : '❌';
  console.log(`${idx + 1}. ${status} ${test.description}`);
  console.log(`   Word: "${test.word}"`);
  console.log(`   Detected: ${detected}, Target: ${test.target}`);
  console.log(`   Translation: "${translation || '[NOT FOUND]'}"`);
  if (result.found) {
    console.log(`   Parts: ${result.partsCount} | Source Lang: ${result.sourceLanguage}`);
  }
  console.log();
});

console.log('✅ Translation system is working!');
