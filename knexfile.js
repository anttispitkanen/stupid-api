const path = require('path');

const connection = process.env.DB_URL;

if (!connection) {
  console.error('No DB_URL in env!');
  process.exit(1);
}

const databaseConfig = {
  connection,
  client: 'pg',
  pool: {
    min: 2,
    max: 10,
    ping: (conn, cb) => conn.query('SELECT 1', cb),
    requestTimeout: 5000,
  },
  acquireConnectionTimeout: 60000,
  migrations: {
    tableName: 'migrations',
    directory: path.join(__dirname, 'migrations'),
  },
};

// All possible NODE_ENVs should be listed here
// This is issue with knex
// See https://github.com/tgriesser/knex/issues/328
const envs = {
  development: databaseConfig,
};

module.exports = envs;
