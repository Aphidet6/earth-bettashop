/*
  Simple Postgres client wrapper using node-postgres (pg).
  This module exports a connected `pool` and an init function.
  - Use Postgres for structured data: users, products, orders, categories
  - Keep queries in services or route handlers; this file provides the connection
*/

const { Pool } = require('pg');

let pool;

async function initPostgres() {
  pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'betta_shop',
  });

  // Test connection
  await pool.query('SELECT 1');
  console.log('Connected to Postgres');

  // Export pool for other modules
  module.exports.pool = pool;
}

module.exports = { initPostgres, pool };
