const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`SELECT * FROM room`);
    const rows = result.rows;
    client.release();
    res.json(rows);

  } catch (err) {
    console.error('Erro ao executar a consulta', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
