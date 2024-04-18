const express = require('express');
const router = express.Router();

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

module.exports = router;