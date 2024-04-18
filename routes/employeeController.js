const express = require('express');
const router = express.Router();

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

module.exports = router;