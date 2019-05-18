const axios = require('axios');
const { ignoredWords } = require('../ignoredWords');

const { RAPIDAPI_KEY, RAPIDAPI_HOST } = process.env;

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
      const wordWithSynonyms = await fetchSynonyms(word);
      return wordsWithSynonyms.push(wordWithSynonyms);
    })
  );
  return wordsWithSynonyms;
}

async function fetchSynonyms(word) {
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

async function getSynonymsForText(text) {
  const words = extractWords(text);
  console.log(words);
  const wordsWithSynonyms = await createSynonyms(words);
  return wordsWithSynonyms;
}

module.exports = {
  getSynonymsForText,
};
