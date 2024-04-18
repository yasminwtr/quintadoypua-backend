const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const client = await pool.connect();
        const user = await client.query('SELECT * FROM client WHERE email = $1 and password = $2', [email, password]);
        if (user.rows.length > 0) {
            const { id, email } = user.rows[0];
            const role = 'client';
            const token = jwt.sign({ id, email, role }, process.env.SECRET, { expiresIn: 600 });
            client.release();
            return res.json({ auth: true, token });
        }

        const employee = await client.query('SELECT * FROM employee WHERE email = $1 and password = $2', [email, password]);
        if (employee.rows.length > 0) {
            const { id, email } = employee.rows[0];
            const employeeId = employee.rows[0].id;
            const role = 'employee';
            const token = jwt.sign({ id, email, employeeId, role }, process.env.SECRET, { expiresIn: 600 });
            client.release();
            return res.json({ auth: true, token });
        }

        client.release();
        return res.status(401).json({ auth: false, message: 'Usuário não encontrado.' });
    } catch (err) {
        console.error('Erro ao executar a consulta', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});


router.post('/logout', async (req, res) => {
    res.json({ auth: false, token: null });
});

module.exports = router;