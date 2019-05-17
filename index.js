const cheerio = require('cheerio');
const axios = require('axios');

(async () => {
  const queryTerm = 'football';

  const response = await axios.get(
    `https://simple.wikipedia.org/w/api.php?action=opensearch&redirects=resolve&search=${encodeURIComponent(
      queryTerm
    )}`
  );
  const { data } = response;

  const description = data[2][0];
  const link = data[3][0];
  console.log(description);
  console.log(link);
  console.log();

  const htmlResponse = await axios.get(link);
  const html = htmlResponse.data;
  // console.log(html);
  const $ = cheerio.load(html);
  const paragraphs = [];
  const cheerioPath =
    $('.mw-parser-output').length === 0
      ? '#mw-content-text > p'
      : '#mw-content-text > .mw-parser-output > p';

  $(cheerioPath).each((i, elem) =>
    paragraphs.push(
      $(elem)
        .text()
        .replace(/\[\d+\]/g, '')
    )
  );

  // console.log(paragraphs);
  paragraphs.forEach(p => console.log(p));
})();
