/**
 * Master Dictionary Index
 * Loads all alphabetical dictionary files (a.js through z.js)
 * Combines them into one complete dictionary
 * 
 * Usage:
 *   const fullDict = require('./dictionary-index');
 *   console.log(fullDict['hello']); // Gets translation from appropriate file
 */

// Import all alphabetical files
const aDict = require('./a');
const bDict = require('./b');
const cDict = require('./c');
const dDict = require('./d');
const eDict = require('./e');
const fDict = require('./f');
const gDict = require('./g');
const hDict = require('./h');
const iDict = require('./i');
const jDict = require('./j');
const kDict = require('./k');
const lDict = require('./l');
const mDict = require('./m');
const nDict = require('./n');
const oDict = require('./o');
const pDict = require('./p');
const qDict = require('./q');
const rDict = require('./r');
const sDict = require('./s');
const tDict = require('./t');
const uDict = require('./u');
const vDict = require('./v');
const wDict = require('./w');
const yDict = require('./y');
const zDict = require('./z');

// Combine all dictionaries
const fullDictionary = {
  ...aDict,
  ...bDict,
  ...cDict,
  ...dDict,
  ...eDict,
  ...fDict,
  ...gDict,
  ...hDict,
  ...iDict,
  ...jDict,
  ...kDict,
  ...lDict,
  ...mDict,
  ...nDict,
  ...oDict,
  ...pDict,
  ...qDict,
  ...rDict,
  ...sDict,
  ...tDict,
  ...uDict,
  ...vDict,
  ...wDict,
  ...yDict,
  ...zDict
};

// Add metadata
fullDictionary._metadata = {
  version: '2.0-alphabetical',
  format: 'alphabetical-split',
  totalEntries: Object.keys(fullDictionary).length - 1, // Exclude _metadata
  languages: ['en', 'es', 'fr', 'nl', 'de', 'pt'],
  createdAt: new Date().toISOString(),
  description: 'Unified dictionary split into alphabetical files for better organization'
};

module.exports = fullDictionary;
