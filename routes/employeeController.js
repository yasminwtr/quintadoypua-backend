const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, employeeId } = req.body;
    const client = await pool.connect();

    const result = await client.query(`INSERT INTO employee (email, password, name, employeeId) VALUES ($1, $2, $3, $4)`,
      [email, password, name, employeeId]);

    client.release();
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT employee.*,
      employeePosition.id AS positionId,
      employeePosition.name as position
      FROM employee
      INNER JOIN employeePosition
      ON employee.positionId = employeePosition.id
      ORDER BY employee.id ASC`);
    const rows = result.rows;
    client.release();
    res.json(rows);

  } catch (err) {
    console.error('Erro ao executar a consulta', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/roles', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT *
      FROM employeePosition`);
    const rows = result.rows;
    client.release();
    res.json(rows);

  } catch (err) {
    console.error('Erro ao executar a consulta', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;