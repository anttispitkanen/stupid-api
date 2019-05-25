const axios = require('axios');
const { ignoredWords } = require('../ignoredWords');
const knex = require('../db');

const { RAPIDAPI_KEY, RAPIDAPI_HOST } = process.env;

// exit if key and host not specified
if (!RAPIDAPI_KEY || !RAPIDAPI_HOST) {
  console.error(
    'No RAPIDAPI_KEY and/or RAPIDAPI_HOST in env (forgot to source .env?)'
  );
  process.exit(1);
}

function extractWords(text) {
  return text
    .split(/\W/)
    .filter(
      word =>
        !!word && /\D/.test(word) && !ignoredWords.includes(word.toLowerCase())
    );
}

/**
 * Fetch synonyms for each word given
 * @param {Array<string>} wordArray
 */
async function createSynonyms(wordArray) {
  const wordsWithSynonyms = [];
  await Promise.all(
    wordArray.map(async word => {
      const wordWithSynonyms = await getSynonymsForWord(word);
      return wordsWithSynonyms.push(wordWithSynonyms);
    })
  );
  return wordsWithSynonyms;
}

async function fetchSynonymsFromAPI(word) {
  try {
    const response = await axios.get(
      `https://wordsapiv1.p.rapidapi.com/words/${encodeURIComponent(
        word
      )}/synonyms`,
      {
        headers: {
          'x-RapidAPI-Host': RAPIDAPI_HOST,
          'x-RapidAPI-Key': RAPIDAPI_KEY,
        },
      }
    );
    const { data } = response;
    return data;
  } catch (err) {
    console.error(`${word} not found`);
    return { word, synonyms: [] };
  }
}

/**
 * Check if word exists in DB.
 * If not, fetch from WordsAPI and insert into DB.
 * @param {string} word
 */
async function getSynonymsForWord(word) {
  try {
    // Check if word exists in DB
    const existingSynonyms = await getSynonymsForWordFromDB(word);
    if (existingSynonyms !== null) {
      // Synonyms exist in DB, just return them
      return {
        word,
        synonyms: existingSynonyms,
      };
    }

    // No synonyms in DB, fetch from WordsAPI
    const wordWithSynonyms = await fetchSynonymsFromAPI(word);

    // Insert into DB to avoid future API calls
    await maybeInsertWord(wordWithSynonyms);

    return wordWithSynonyms;
  } catch (err) {
    // something went wrong, default to returning empty synonyms
    console.error(err);
    return {
      word,
      synonyms: [],
    };
  }
}

async function getSynonymsForText(text) {
  const words = extractWords(text);
  console.log(words);
  const wordsWithSynonyms = await createSynonyms(words);
  return wordsWithSynonyms;
}

module.exports = {
  getSynonymsForText,
};

async function maybeInsertWord({ word, synonyms }) {
  return (
    knex('words')
      .insert({
        word,
        synonyms: JSON.stringify(synonyms),
      })
      .then(result => result)
      // word probably already in DB, just return null
      .catch(err => null)
  );
}

async function getSynonymsForWordFromDB(word) {
  const synonyms = await knex('words')
    .select('synonyms')
    .where({ word })
    .then(result => result && result[0] && result[0].synonyms);
  return synonyms || null;
}
