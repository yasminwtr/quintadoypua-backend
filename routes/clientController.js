const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const client = await pool.connect();

        const result = await client.query(`INSERT INTO client (email, password, name) VALUES ($1, $2, $3)`,
            [email, password, name]);

        client.release();
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
      const clientId = parseInt(req.params.id)
      const client = await pool.connect();
      const result = await client.query(`
      SELECT * FROM client WHERE id = $1`, [clientId]);
      const rows = result.rows;
      client.release();
      res.json(rows);
  
    } catch (err) {
      console.error('Erro ao executar a consulta', err);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const clientId = parseInt(req.params.id)
      const client = await pool.connect();
      const result = await client.query(`
      DELETE FROM client WHERE id = $1`, [clientId]);
      client.release();
      console.log(result);
      res.status(201).json({ message: 'Client deleted successfully' });
  
    } catch (err) {
      console.error('Erro ao executar o delete', err);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  router.post('/:id', async (req, res) => {
    try {
      const clientId = parseInt(req.params.id)
      const {name, email, password} = req.body;
      const client = await pool.connect();
      const result = await client.query(`
      UPDATE client SET name = $2, email = $3, password = $4 WHERE id = $1`, [clientId, name, email, password]);
      client.release();
      res.status(201).json({ message: 'Client updated successfully' });
  
    } catch (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

module.exports = router;