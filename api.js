const express = require('express');
const cors = require('cors');
const wikipediaClient = require('./clients/wikipedia');
const wordsAPIClient = require('./clients/wordsAPI');

const app = express();

app.use(express.json());
app.use(cors());

app.get('/ok', (req, res) => {
  res.send('ok');
});

app.get('/random-text', async (req, res) => {
  try {
    const lang = req.query && req.query.lang;

    const randomTitle = await wikipediaClient.getRandomWikipediaArticle(lang);

    const results = await wikipediaClient.fetchSentenceFromWikipedia(
      lang,
      randomTitle
    );

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

app.post('/synonymize', async (req, res) => {
  try {
    const text = req.body && req.body.text;

    const wordsWithSynonyms = await wordsAPIClient.getSynonymsForText(text);

    res.json(wordsWithSynonyms);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

app.listen(3001, () => console.log('Listening on port 3001 :DD'));
