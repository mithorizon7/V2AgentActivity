import fs from 'fs';

// Load all three translation files
const en = JSON.parse(fs.readFileSync('client/src/locales/en/translation.json', 'utf8'));
const ru = JSON.parse(fs.readFileSync('client/src/locales/ru/translation.json', 'utf8'));
const lv = JSON.parse(fs.readFileSync('client/src/locales/lv/translation.json', 'utf8'));

// Function to get all keys recursively from an object
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Get all keys from each file
const enKeys = new Set(getAllKeys(en));
const ruKeys = new Set(getAllKeys(ru));
const lvKeys = new Set(getAllKeys(lv));

// Find missing keys
const ruMissing = [...enKeys].filter(key => !ruKeys.has(key) && key !== 'NOTE_FOR_TRANSLATOR');
const lvMissing = [...enKeys].filter(key => !lvKeys.has(key) && key !== 'NOTE_FOR_TRANSLATOR');

console.log(`English has ${enKeys.size} keys`);
console.log(`Russian has ${ruKeys.size} keys`);
console.log(`Latvian has ${lvKeys.size} keys`);
console.log(`\nRussian is missing ${ruMissing.length} keys`);
console.log(`Latvian is missing ${lvMissing.length} keys`);

if (ruMissing.length > 0) {
  console.log('\nFirst 10 missing Russian keys:');
  ruMissing.slice(0, 10).forEach(key => {
    // Get the value from English
    let value = en;
    key.split('.').forEach(k => value = value[k]);
    console.log(`  ${key}: "${value}"`);
  });
}

if (lvMissing.length > 0) {
  console.log('\nFirst 10 missing Latvian keys:');
  lvMissing.slice(0, 10).forEach(key => {
    // Get the value from English
    let value = en;
    key.split('.').forEach(k => value = value[k]);
    console.log(`  ${key}: "${value}"`);
  });
}

// Write full list to files for reference
if (ruMissing.length > 0) {
  const missingData = ruMissing.map(key => {
    let value = en;
    key.split('.').forEach(k => value = value[k]);
    return `${key}: "${value}"`;
  });
  fs.writeFileSync('missing-ru.txt', missingData.join('\n'));
  console.log('\nFull list of missing Russian keys written to missing-ru.txt');
}

if (lvMissing.length > 0) {
  const missingData = lvMissing.map(key => {
    let value = en;
    key.split('.').forEach(k => value = value[k]);
    return `${key}: "${value}"`;
  });
  fs.writeFileSync('missing-lv.txt', missingData.join('\n'));
  console.log('Full list of missing Latvian keys written to missing-lv.txt');
}