const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT *
      FROM room`);
    const rows = result.rows;
    client.release();
    res.json(rows);

  } catch (err) {
    console.error('Erro ao executar a consulta', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const roomId = parseInt(req.params.id)
    const client = await pool.connect();
    const result = await client.query(`
      SELECT 
      id,
      name,
      TO_CHAR(checkin, 'HH24:MI') AS checkin,
      TO_CHAR(checkout, 'HH24:MI') AS checkout,
      maxguest,
      description,
      daily
      FROM room
      WHERE id = $1`, [roomId]);
    const rows = result.rows[0];
    client.release();
    res.json(rows);

  } catch (err) {
    console.error('Erro ao executar a consulta', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', async (req, res) => {
  const { name, description } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO room (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    const newRow = result.rows[0];
    client.release();
    res.status(201).json(newRow);
  } catch (err) {
    console.error('Erro ao adicionar o quarto', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'UPDATE room SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, id]
    );
    const updatedRow = result.rows[0];
    client.release();
    res.json(updatedRow);
  } catch (err) {
    console.error('Erro ao editar o quarto', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    await client.query('DELETE FROM room WHERE id = $1', [id]);
    client.release();
    res.status(204).end();
  } catch (err) {
    console.error('Erro ao excluir o quarto', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});


module.exports = router;