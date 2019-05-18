const axios = require('axios');

async function getRandomWikipediaArticle(lang) {
  const response = await axios.get(
    `https://${lang}.wikipedia.org/w/api.php?action=query&list=random&format=json&rnlimit=1&rnnamespace=0`
  );
  const { data } = response;
  const queryTerm =
    data &&
    data.query &&
    data.query.random &&
    data.query.random[0] &&
    data.query.random[0].title;
  return queryTerm;
}

async function fetchSentenceFromWikipedia(lang, queryTerm) {
  const response = await axios.get(
    `https://${lang}.wikipedia.org/w/api.php?action=opensearch&redirects=resolve&search=${encodeURIComponent(
      queryTerm
    )}`
  );
  const { data } = response;

  const title = data && data[1] && data[1][0];
  const description = data && data[2] && data[2][0];
  const link = data && data[3] && data[3][0];

  return { title, description, link };
}

module.exports = { getRandomWikipediaArticle, fetchSentenceFromWikipedia };
