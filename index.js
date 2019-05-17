const axios = require('axios');
const { ignoredWords } = require('./ignoredWords');

const { RAPIDAPI_KEY, RAPIDAPI_HOST } = process.env;

(async () => {
  const lang = 'simple';
  const queryTerm = 'taylor swift';

  const { description, link } = await fetchSentenceFromWikipedia(
    lang,
    queryTerm
  );

  console.log(description);
  console.log();
  console.log(link);
  console.log();

  const words = extractWords(description, ignoredWords);
  console.log(words); // FIXME:
  console.log();
  console.log(replaceWords(description, words));

  console.log(await createSynonyms(words));
})();

async function fetchSentenceFromWikipedia(lang, queryTerm) {
  const response = await axios.get(
    `https://${lang}.wikipedia.org/w/api.php?action=opensearch&redirects=resolve&search=${encodeURIComponent(
      queryTerm
    )}`
  );
  const { data } = response;
  const description = data && data[2] && data[2][0];
  const link = data && data[3] && data[3][0];
  return { description, link };
}

function extractWords(text, ignoredWordArray) {
  return text
    .split(/\W/)
    .filter(
      word =>
        !!word &&
        /\D/.test(word) &&
        !ignoredWordArray.includes(word.toLowerCase())
    );
}

function replaceWords(text, wordArray) {
  let textToReturn = text;
  wordArray.forEach(
    word => (textToReturn = textToReturn.replace(word, 'KISSE'))
  );
  return textToReturn;
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
  const response = await axios.get(
    `https://wordsapiv1.p.rapidapi.com/words/${encodeURIComponent(
      word
    )}/synonyms`,
    {
      headers: {
        'x-RapidAPI-Host': RAPIDAPI_HOST,
        'x-RapidAPI-Key': RAPIDAPI_KEY
      }
    }
  );
  const { data } = response;
  return data;
}

function takeLongestWord(words) {
  let word = '';
  words.forEach(w => {
    if (w.length > word.length) {
      word = w;
    }
  });
  return word;
}
