const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, positionId} = req.body;
    const client = await pool.connect();

    const result = await client.query(`INSERT INTO employee (email, password, name, positionId) VALUES ($1, $2, $3, $4)`,
      [email, password, name, positionId]);

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

router.post('/edit/:id', async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id)
    const {name, email, password, positionId} = req.body;
    const client = await pool.connect();
    const result = await client.query(`
    UPDATE employee SET name = $1, email = $2, password = $3, positionId = $4 WHERE id = $5`, [name, email, password, positionId, employeeId]);
    client.release();
    res.status(201).json({ message: 'Client updated successfully' });

  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const clientId = parseInt(req.params.id)
    const client = await pool.connect();
    const result = await client.query(`
    DELETE FROM employee WHERE id = $1`, [clientId]);
    client.release();
    console.log(result);
    res.status(201).json({ message: 'Client deleted successfully' });

  } catch (err) {
    console.error('Erro ao executar o delete', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});



module.exports = router;