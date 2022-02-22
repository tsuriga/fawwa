const { join, parse } = require('path');

const cfg = require('config').dictionary;
const { exists, list, read, write } = require('fs-jetpack');
const { has, keys } = require('lodash');
const tar = require('tar');


const wordKeys = {};

// Read OPTED words first

if (exists(cfg.path.opted) !== 'file') {
  throw new Error('OPTED file could not be read');
}

const opted = read(cfg.path.opted, 'json');

for (const entry of opted) {
  // Skip too short words
  if (entry.word.length < cfg['length'].min) {
    continue;
  }

  const word = entry.word.toLowerCase();

  // Skip words that have anything but letters
  if (word.match(/[^a-z]/)) {
    continue;
  }

  // Skip too long words
  if (word.length > cfg['length'].max) {
    continue;
  }

  if (!has(wordKeys, word)) {
    wordKeys[word] = '';
  }
}

// Then read in the SCOWL words

if (exists(cfg.path.scowl) !== 'dir') {
  throw new Error('SCOWL files could not be read');
}

const scowlFiles = list(cfg.path.scowl);

for (const filePath of scowlFiles) {
  // Skip excluded files
  if (!cfg.scowl.include.includes(parse(filePath).name)) {
    continue;
  }

  const xk = read(join(cfg.path.scowl, filePath));
  const scowlWords = read(join(cfg.path.scowl, filePath)).split('\n');

  for (const rawWord of scowlWords) {
    // Skip too short words
    if (rawWord.length < cfg['length'].min) {
      continue;
    }

    // Skip words that start with an uppercase letter, we're not interested in them here
    if (rawWord[0].match(/[A-Z]/)) {
      continue;
    }

    // Skip possessive forms
    if (rawWord.substring(rawWord.length - 2) === "'s") {
      continue;
    }

    // Lowercase and replace single quotes within words
    let word = rawWord.toLowerCase().replaceAll("'", '');

    // Skip words that have anything but letters
    if (word.match(/[^a-z]/)) {
      continue;
    }

    // Skip too long words
    if (word.length > cfg['length'].max) {
      continue;
    }

    if (!has(wordKeys, word)) {
      wordKeys[word] = '';
    }
  }
}

// Create archive file from the word list
const words = keys(wordKeys);
words.sort();

console.log(`${words.length} words found`);

const jsonPath = join('static', 'dict.json');
const gzipPath = join('build', 'dict.tgz');

write(jsonPath, words, { atomic: true });
tar.create({ gzip: true, sync: true, strict: true, file: gzipPath, cwd: 'static' }, ['dict.json']);

console.log(`Dictionary archive created at ${gzipPath}`);
