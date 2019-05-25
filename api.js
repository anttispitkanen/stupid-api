const express = require('express');
const cors = require('cors');
const wikipediaClient = require('./clients/wikipedia');
const wordsAPIClient = require('./clients/wordsAPI');
const knex = require('./db');

async function runMigrations() {
  try {
    await knex.migrate.latest();
    console.log('migrated knex');
  } catch (err) {
    console.error('Failed to run migrations');
    throw err;
  }
}

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

async function start() {
  await runMigrations();
  console.log('migrations completed');

  app.listen(3001, () => console.log('Listening on port 3001 :DD'));

  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down');
    await knex.destroy();
    process.exit(0);
  });
  process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down');
    await knex.destroy();
    process.exit(0);
  });
}

start().catch(err => {
  console.error(err);
  process.exit(1);
});
