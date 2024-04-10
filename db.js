const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'quintadoypua',
    password: '1234',
    port: 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
    console.log('Connected to the database');
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on PostgreSQL client', err);
    process.exit(-1);
});

module.exports = pool;
